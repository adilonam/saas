"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  type AppDataMessage,
  type SignalInbound,
  CONNECT_TIMEOUT_MS,
  FILE_CHUNK_SIZE,
  fetchIceServers,
  generateRoomCode,
  getSignalUrl,
  waitForBufferedAmountLow,
} from "@/lib/share-webrtc";

interface ChatMessage {
  id: string;
  type: "text" | "file";
  content: string;
  from: "you" | "peer";
  timestamp: number;
}

interface ReceivedFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  blob: Blob;
  timestamp: number;
}

interface IncomingFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: ArrayBuffer[];
  received: number;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function SharePageContent() {
  const searchParams = useSearchParams();
  const autoJoinRoom = searchParams?.get("room") || null;

  const [mode, setMode] = useState<"send" | "receive" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState<{
    fileName: string;
    progress: number;
  } | null>(null);
  const [receiveProgress, setReceiveProgress] = useState<{
    fileName: string;
    progress: number;
  } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const isInitiatorRef = useRef(false);
  const peerIdRef = useRef("");
  const remoteSetRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const incomingFileRef = useRef<IncomingFile | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const makingOfferRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedAutoJoinRef = useRef(false);
  const connectedRef = useRef(false);
  const handleSignalRef = useRef<(raw: string) => Promise<void>>(async () => {});
  const handleDataRef = useRef<(event: MessageEvent) => Promise<void>>(async () => {});

  const clearConnectTimer = () => {
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
  };

  const cleanupPeer = (opts?: { keepSocket?: boolean; statusMsg?: string }) => {
    clearConnectTimer();
    if (dcRef.current) {
      try {
        dcRef.current.close();
      } catch {
        /* ignore */
      }
      dcRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        /* ignore */
      }
      pcRef.current = null;
    }
    remoteSetRef.current = false;
    pendingIceRef.current = [];
    makingOfferRef.current = false;
    incomingFileRef.current = null;
    connectedRef.current = false;
    setConnected(false);
    setSendProgress(null);
    setReceiveProgress(null);
    if (!opts?.keepSocket && wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    }
    if (opts?.statusMsg) setStatus(opts.statusMsg);
  };

  useEffect(() => {
    return () => {
      cleanupPeer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoJoinRoom && !mode && !startedAutoJoinRef.current) {
      startedAutoJoinRef.current = true;
      setMode("receive");
      setInputCode(autoJoinRoom);
      void joinRoom(autoJoinRoom);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoinRoom, mode]);

  const sendSignal = (payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(payload));
  };

  const markConnected = () => {
    clearConnectTimer();
    connectedRef.current = true;
    setConnected(true);
    setError(null);
    setStatus("Connected (P2P)");
  };

  const startConnectTimer = () => {
    clearConnectTimer();
    connectTimerRef.current = setTimeout(() => {
      if (dcRef.current?.readyState === "open") return;
      setError(
        "Could not establish a direct peer connection. This often happens behind a strict firewall or symmetric NAT (no TURN server configured yet). Try another network, or ask the other person to join again.",
      );
      setStatus("Connection failed");
      cleanupPeer({ keepSocket: true, statusMsg: "Connection failed" });
    }, CONNECT_TIMEOUT_MS);
  };

  const flushPendingIce = async () => {
    const pc = pcRef.current;
    if (!pc || !remoteSetRef.current) return;
    const queued = pendingIceRef.current.splice(0);
    for (const c of queued) {
      try {
        await pc.addIceCandidate(c);
      } catch (e) {
        console.warn("addIceCandidate failed", e);
      }
    }
  };

  const handleDataMessage = async (event: MessageEvent) => {
    if (typeof event.data === "string") {
      let msg: AppDataMessage;
      try {
        msg = JSON.parse(event.data) as AppDataMessage;
      } catch {
        console.warn("Invalid data-channel JSON");
        return;
      }

      if (msg.type === "text" && typeof msg.data === "string") {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            type: "text",
            content: msg.data,
            from: "peer",
            timestamp: Date.now(),
          },
        ]);
        return;
      }

      if (msg.type === "file-meta") {
        incomingFileRef.current = {
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          fileType: msg.fileType || "application/octet-stream",
          chunks: [],
          received: 0,
        };
        setReceiveProgress({ fileName: msg.fileName, progress: 0 });
        return;
      }

      if (msg.type === "file-complete") {
        const transfer = incomingFileRef.current;
        incomingFileRef.current = null;
        setReceiveProgress(null);
        if (!transfer) return;
        const blob = new Blob(transfer.chunks, {
          type: transfer.fileType || "application/octet-stream",
        });
        setReceivedFiles((prev) => [
          ...prev,
          {
            fileName: transfer.fileName,
            fileSize: transfer.fileSize,
            fileType: transfer.fileType,
            blob,
            timestamp: Date.now(),
          },
        ]);
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            type: "file",
            content: transfer.fileName,
            from: "peer",
            timestamp: Date.now(),
          },
        ]);
      }
      return;
    }

    // Binary file chunk
    let buffer: ArrayBuffer;
    if (event.data instanceof ArrayBuffer) {
      buffer = event.data;
    } else if (ArrayBuffer.isView(event.data)) {
      buffer = event.data.buffer.slice(
        event.data.byteOffset,
        event.data.byteOffset + event.data.byteLength,
      ) as ArrayBuffer;
    } else if (typeof Blob !== "undefined" && event.data instanceof Blob) {
      buffer = await event.data.arrayBuffer();
    } else {
      return;
    }

    const transfer = incomingFileRef.current;
    if (!transfer) return;
    transfer.chunks.push(buffer);
    transfer.received += buffer.byteLength;
    const progress = Math.min(
      100,
      Math.round((transfer.received / Math.max(transfer.fileSize, 1)) * 100),
    );
    setReceiveProgress({ fileName: transfer.fileName, progress });
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dcRef.current = channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = 128 * 1024;

    channel.onopen = () => {
      console.log("DataChannel open");
      markConnected();
    };
    channel.onclose = () => {
      console.log("DataChannel closed");
      connectedRef.current = false;
      setConnected(false);
      setStatus("Peer left");
    };
    channel.onerror = (e) => {
      console.error("DataChannel error", e);
    };
    channel.onmessage = (event) => {
      void handleDataRef.current(event);
    };
  };

  const createPeerConnection = async () => {
    if (pcRef.current) return pcRef.current;
    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      sendSignal({
        type: "ice-candidate",
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      });
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log("pc connectionState", state);
      if (state === "failed") {
        setError(
          "Peer connection failed. A direct path could not be found (strict NAT / no TURN). Try again on another network.",
        );
        setStatus("Connection failed");
        cleanupPeer({ keepSocket: true, statusMsg: "Connection failed" });
      } else if (state === "disconnected") {
        setConnected(false);
        setStatus("Peer left");
      } else if (state === "connecting") {
        setStatus("Connecting");
      }
    };

    pc.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    return pc;
  };

  const createAndSendOffer = async () => {
    if (makingOfferRef.current) return;
    makingOfferRef.current = true;
    try {
      setStatus("Connecting");
      startConnectTimer();
      const pc = await createPeerConnection();
      const channel = pc.createDataChannel("share", { ordered: true });
      setupDataChannel(channel);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", sdp: offer.sdp });
    } catch (e) {
      console.error("createOffer failed", e);
      setError("Failed to start peer connection.");
      setStatus("Connection failed");
    } finally {
      makingOfferRef.current = false;
    }
  };

  const handleOffer = async (sdp: string) => {
    try {
      setStatus("Connecting");
      startConnectTimer();
      const pc = await createPeerConnection();
      await pc.setRemoteDescription({ type: "offer", sdp });
      remoteSetRef.current = true;
      await flushPendingIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: "answer", sdp: answer.sdp });
    } catch (e) {
      console.error("handleOffer failed", e);
      setError("Failed to accept peer offer.");
      setStatus("Connection failed");
    }
  };

  const handleAnswer = async (sdp: string) => {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      await pc.setRemoteDescription({ type: "answer", sdp });
      remoteSetRef.current = true;
      await flushPendingIce();
    } catch (e) {
      console.error("handleAnswer failed", e);
    }
  };

  const handleRemoteIce = async (msg: Extract<SignalInbound, { type: "ice-candidate" }>) => {
    const init: RTCIceCandidateInit = {
      candidate: msg.candidate ?? undefined,
      sdpMid: msg.sdpMid ?? undefined,
      sdpMLineIndex: msg.sdpMLineIndex ?? undefined,
    };
    if (!remoteSetRef.current || !pcRef.current) {
      pendingIceRef.current.push(init);
      return;
    }
    try {
      await pcRef.current.addIceCandidate(init);
    } catch (e) {
      console.warn("addIceCandidate failed", e);
    }
  };

  const handleSignalMessage = async (raw: string) => {
    let msg: SignalInbound;
    try {
      msg = JSON.parse(raw) as SignalInbound;
    } catch {
      return;
    }

    switch (msg.type) {
      case "joined":
        peerIdRef.current = msg.peer_id;
        isInitiatorRef.current = !!msg.initiator;
        setStatus(msg.initiator ? "Waiting for peer" : "Connecting");
        if (!msg.initiator) {
          // Second peer waits for offer from initiator
          setStatus("Connecting");
          startConnectTimer();
        }
        break;
      case "peer-joined":
        setStatus("Connecting");
        if (isInitiatorRef.current) {
          await createAndSendOffer();
        }
        break;
      case "peer-left":
        cleanupPeer({
          keepSocket: true,
          statusMsg: "Peer left",
        });
        setError(null);
        break;
      case "error":
        setError(msg.message || "Signaling error");
        setStatus(
          /full/i.test(msg.message || "") ? "Room full" : "Error",
        );
        break;
      case "ping":
        // Keepalive — ignore (or could echo; not required)
        break;
      case "offer":
        if (msg.sdp) await handleOffer(msg.sdp);
        break;
      case "answer":
        if (msg.sdp) await handleAnswer(msg.sdp);
        break;
      case "ice-candidate":
        await handleRemoteIce(msg);
        break;
      default:
        break;
    }
  };

  handleSignalRef.current = handleSignalMessage;
  handleDataRef.current = handleDataMessage;

  // Expose connection diagnostics for Playwright / manual debug
  if (typeof window !== "undefined") {
    (
      window as unknown as {
        __shareDebug?: () => {
          connected: boolean;
          status: string;
          dcState: string | undefined;
          pcState: RTCPeerConnectionState | undefined;
        };
      }
    ).__shareDebug = () => ({
      connected: connectedRef.current,
      status,
      dcState: dcRef.current?.readyState,
      pcState: pcRef.current?.connectionState,
    });
  }

  const connectSignal = (room: string) => {
    cleanupPeer();
    setError(null);
    setConnected(false);
    setStatus("Connecting");

    const url = getSignalUrl(room);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Signaling connected", url);
    };
    ws.onmessage = (event) => {
      if (typeof event.data !== "string") {
        // Protocol: binary frames rejected by server; ignore if any
        return;
      }
      void handleSignalRef.current(event.data);
    };
    ws.onerror = () => {
      setError("Signaling connection error. Please try again.");
      setStatus("Error");
    };
    ws.onclose = () => {
      if (connectedRef.current) {
        connectedRef.current = false;
        setConnected(false);
        setStatus("Peer left");
      }
    };
  };

  const startSending = async () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setMode("send");
    setMessages([]);
    setReceivedFiles([]);
    setQrUrl(`${window.location.origin}/share?room=${code}`);
    setStatus("Waiting for peer");
    connectSignal(code);
  };

  const startReceiving = () => {
    setMode("receive");
    setError(null);
  };

  const joinRoom = async (code?: string) => {
    const joinCode = (code || inputCode).replace(/\D/g, "").slice(0, 6);
    if (joinCode.length !== 6) {
      setStatus("Invalid code");
      return;
    }
    setRoomCode(joinCode);
    setMode("receive");
    setMessages([]);
    setReceivedFiles([]);
    setStatus("Connecting");
    connectSignal(joinCode);
  };

  const sendText = () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");

    // Optimistic local append — peer will render on receive; no server echo.
    setMessages((prev) => [
      ...prev,
      {
        id: newId(),
        type: "text",
        content: text,
        from: "you",
        timestamp: Date.now(),
      },
    ]);

    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") {
      setError("Not connected to a peer yet.");
      return;
    }
    try {
      const payload: AppDataMessage = { type: "text", data: text };
      dc.send(JSON.stringify(payload));
    } catch (e) {
      console.error("send text failed", e);
      setError("Failed to send text.");
    }
  };

  const sendFile = async (file: File) => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== "open") {
      setError("Not connected to a peer yet.");
      return;
    }

    setSendProgress({ fileName: file.name, progress: 0 });
    try {
      const meta: AppDataMessage = {
        type: "file-meta",
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
      };
      dc.send(JSON.stringify(meta));

      let offset = 0;
      while (offset < file.size) {
        await waitForBufferedAmountLow(dc);
        const slice = file.slice(offset, offset + FILE_CHUNK_SIZE);
        const buf = await slice.arrayBuffer();
        dc.send(buf);
        offset += buf.byteLength;
        setSendProgress({
          fileName: file.name,
          progress: Math.min(100, Math.round((offset / file.size) * 100)),
        });
      }

      await waitForBufferedAmountLow(dc);
      const done: AppDataMessage = { type: "file-complete" };
      dc.send(JSON.stringify(done));

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          type: "file",
          content: file.name,
          from: "you",
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      console.error("send file failed", e);
      setError("Failed to send file.");
    } finally {
      setSendProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void sendFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void sendFile(file);
  };

  const downloadFile = (file: ReceivedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetHome = () => {
    cleanupPeer();
    setMode(null);
    setRoomCode("");
    setInputCode("");
    setQrUrl("");
    setMessages([]);
    setReceivedFiles([]);
    setError(null);
    setStatus("Disconnected");
  };

  if (!mode) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Secure File & Text Share</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Peer-to-peer WebRTC • Encrypted in transit (DTLS) • No server storage
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => void startSending()}
              className="p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-full bg-indigo-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PaperAirplaneIcon className="size-8" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    Send
                  </p>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                    Get a code to share
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={startReceiving}
              className="p-8 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowDownTrayIcon className="size-8" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    Receive
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                    Enter a code to join
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (mode === "receive" && !roomCode) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Enter Code</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Enter the 6-digit code from the sender
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="000000"
              value={inputCode}
              onChange={(e) =>
                setInputCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="h-16 text-center text-3xl tracking-widest"
              maxLength={6}
              autoFocus
            />
            <Button
              onClick={() => void joinRoom()}
              disabled={inputCode.length !== 6}
              className="w-full h-12 text-lg"
            >
              Join
            </Button>
            <Button onClick={resetHome} variant="ghost" className="w-full">
              Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-600 dark:text-slate-400">Room Code</p>
              <p className="text-3xl font-bold tracking-widest">{roomCode}</p>
            </div>
            <div
              data-testid="share-status"
              data-connected={connected ? "true" : "false"}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                connected
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : error
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              }`}
            >
              {status}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {mode === "send" && qrUrl && (
            <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">
                Scan to join:
              </p>
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <Button variant="ghost" size="sm" onClick={resetHome}>
              Leave room
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Send</h3>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={
                  connected ? "Type a message..." : "Connect to a peer to send…"
                }
                disabled={!connected}
                className="w-full min-h-[100px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
              />
              <Button
                onClick={sendText}
                disabled={!connected || !textInput.trim()}
                className="w-full"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Text
              </Button>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-center transition-colors ${
                connected
                  ? "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                  : "opacity-60"
              }`}
              onClick={() => connected && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                if (connected) handleFileDrop(e);
                else e.preventDefault();
              }}
            >
              <DocumentArrowDownIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Click or drag file here</p>
              <p className="text-xs text-slate-500 mt-1">
                Sent peer-to-peer over WebRTC
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={!connected}
              />
            </div>

            {sendProgress && (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium mb-2">{sendProgress.fileName}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${sendProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">{sendProgress.progress}%</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Received</h3>

            {messages.length > 0 && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-h-64 overflow-y-auto space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-sm ${
                      msg.from === "you"
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    <p className="text-xs opacity-60 mb-1">
                      {msg.from === "you" ? "You" : "Peer"}
                      {msg.type === "file" ? " · file" : ""}
                    </p>
                    <p className="break-words">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {receiveProgress && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-medium mb-2">
                  {receiveProgress.fileName}
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${receiveProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">
                  {receiveProgress.progress}%
                </p>
              </div>
            )}

            {receivedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Files</Label>
                {receivedFiles.map((file, i) => (
                  <div
                    key={`${file.fileName}-${file.timestamp}-${i}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div
                      className="flex-1 min-w-0"
                      data-testid="received-file"
                      data-filename={file.fileName}
                      data-filesize={file.fileSize}
                    >
                      <p className="font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {(file.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button size="sm" onClick={() => downloadFile(file)}>
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Loading...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <SharePageContent />
    </Suspense>
  );
}
