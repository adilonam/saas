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
  base64ToBuffer,
  bufferToBase64,
  decryptData,
  deriveSharedKey,
  encryptData,
  exportPublicKey,
  generateKeyPair,
  hashData,
  importPublicKey,
  normalizeBinaryFrame,
} from "@/lib/share-crypto";
import {
  type AppDataMessage,
  type SignalInbound,
  type TransportMode,
  FILE_CHUNK_SIZE,
  P2P_FALLBACK_MS,
  RELAY_CONNECT_TIMEOUT_MS,
  RELAY_FILE_CHUNK_SIZE,
  fetchIceServers,
  generateRoomCode,
  getRelayUrl,
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
  const forceRelayFallback =
    searchParams?.get("forceRelayFallback") === "1" ||
    searchParams?.get("relay") === "1";

  const [mode, setMode] = useState<"send" | "receive" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [connected, setConnected] = useState(false);
  const [transportMode, setTransportMode] = useState<TransportMode>(null);
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

  const signalWsRef = useRef<WebSocket | null>(null);
  const relayWsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const isInitiatorRef = useRef(false);
  const peerIdRef = useRef("");
  const remoteSetRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const incomingFileRef = useRef<IncomingFile | null>(null);
  const p2pTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const relayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const makingOfferRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedAutoJoinRef = useRef(false);
  const connectedRef = useRef(false);
  const transportModeRef = useRef<TransportMode>(null);
  const fallingBackRef = useRef(false);
  const roomCodeRef = useRef("");
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const sentKeyExchangeRef = useRef(false);
  const handleSignalRef = useRef<(raw: string) => Promise<void>>(async () => {});
  const handleDataRef = useRef<(event: MessageEvent) => Promise<void>>(async () => {});
  const handleRelayMessageRef = useRef<(event: MessageEvent) => Promise<void>>(
    async () => {},
  );
  const fallbackToRelayRef = useRef<(reason: string) => void>(() => {});

  const clearP2pTimer = () => {
    if (p2pTimerRef.current) {
      clearTimeout(p2pTimerRef.current);
      p2pTimerRef.current = null;
    }
  };

  const clearRelayTimer = () => {
    if (relayTimerRef.current) {
      clearTimeout(relayTimerRef.current);
      relayTimerRef.current = null;
    }
  };

  const markTransport = (t: TransportMode) => {
    transportModeRef.current = t;
    setTransportMode(t);
  };

  const markConnected = (t: "p2p" | "relay") => {
    clearP2pTimer();
    clearRelayTimer();
    fallingBackRef.current = false;
    connectedRef.current = true;
    setConnected(true);
    setError(null);
    markTransport(t);
    setStatus(t === "p2p" ? "Connected (P2P)" : "Connected (relay)");
  };

  const closePeerConnection = () => {
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
  };

  const closeSignal = () => {
    if (signalWsRef.current) {
      try {
        signalWsRef.current.onclose = null;
        signalWsRef.current.close();
      } catch {
        /* ignore */
      }
      signalWsRef.current = null;
    }
  };

  const closeRelay = () => {
    if (relayWsRef.current) {
      try {
        relayWsRef.current.onclose = null;
        relayWsRef.current.close();
      } catch {
        /* ignore */
      }
      relayWsRef.current = null;
    }
  };

  const cleanupAll = (opts?: { statusMsg?: string }) => {
    clearP2pTimer();
    clearRelayTimer();
    closePeerConnection();
    closeSignal();
    closeRelay();
    connectedRef.current = false;
    fallingBackRef.current = false;
    sharedKeyRef.current = null;
    sentKeyExchangeRef.current = false;
    keyPairRef.current = null;
    incomingFileRef.current = null;
    markTransport(null);
    setConnected(false);
    setSendProgress(null);
    setReceiveProgress(null);
    if (opts?.statusMsg) setStatus(opts.statusMsg);
  };

  useEffect(() => {
    return () => {
      cleanupAll();
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
    const ws = signalWsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(payload));
  };

  const startP2pTimer = () => {
    clearP2pTimer();
    p2pTimerRef.current = setTimeout(() => {
      if (dcRef.current?.readyState === "open" || transportModeRef.current === "relay") {
        return;
      }
      console.log("P2P timeout — falling back to relay");
      fallbackToRelayRef.current("timeout");
    }, P2P_FALLBACK_MS);
  };

  const startRelayTimer = () => {
    clearRelayTimer();
    relayTimerRef.current = setTimeout(() => {
      if (transportModeRef.current === "relay" && connectedRef.current) return;
      setError(
        "Could not connect via peer-to-peer or server relay. Check your network and try again.",
      );
      setStatus("Connection failed");
      cleanupAll({ statusMsg: "Connection failed" });
    }, RELAY_CONNECT_TIMEOUT_MS);
  };

  // ---- P2P DataChannel (plaintext; DTLS encrypts in transit) ----

  const handleP2pDataMessage = async (event: MessageEvent) => {
    if (typeof event.data === "string") {
      let msg: AppDataMessage;
      try {
        msg = JSON.parse(event.data) as AppDataMessage;
      } catch {
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

    const buffer = await normalizeBinaryFrame(
      event.data as Blob | ArrayBuffer | ArrayBufferView,
    );
    if (!buffer) return;
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
      markConnected("p2p");
    };
    channel.onclose = () => {
      console.log("DataChannel closed");
      if (transportModeRef.current === "p2p") {
        connectedRef.current = false;
        setConnected(false);
        setStatus("Peer left");
      }
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

    let iceServers = await fetchIceServers();
    const config: RTCConfiguration = forceRelayFallback
      ? { iceServers: [], iceTransportPolicy: "relay" }
      : { iceServers };

    const pc = new RTCPeerConnection(config);
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
        fallbackToRelayRef.current("pc-failed");
      } else if (state === "disconnected" && transportModeRef.current === "p2p") {
        connectedRef.current = false;
        setConnected(false);
        setStatus("Peer left");
      } else if (state === "connecting") {
        setStatus("Connecting");
      }
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log("pc iceConnectionState", state);
      if (state === "failed") {
        fallbackToRelayRef.current("ice-failed");
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
      startP2pTimer();
      const pc = await createPeerConnection();
      const channel = pc.createDataChannel("share", { ordered: true });
      setupDataChannel(channel);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", sdp: offer.sdp });
    } catch (e) {
      console.error("createOffer failed", e);
      fallbackToRelayRef.current("offer-failed");
    } finally {
      makingOfferRef.current = false;
    }
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

  const handleOffer = async (sdp: string) => {
    try {
      setStatus("Connecting");
      startP2pTimer();
      const pc = await createPeerConnection();
      await pc.setRemoteDescription({ type: "offer", sdp });
      remoteSetRef.current = true;
      await flushPendingIce();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({ type: "answer", sdp: answer.sdp });
    } catch (e) {
      console.error("handleOffer failed", e);
      fallbackToRelayRef.current("answer-failed");
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

  const handleRemoteIce = async (
    msg: Extract<SignalInbound, { type: "ice-candidate" }>,
  ) => {
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
          setStatus("Connecting");
          startP2pTimer();
        }
        break;
      case "peer-joined":
        setStatus("Connecting");
        startP2pTimer();
        if (isInitiatorRef.current) {
          await createAndSendOffer();
        }
        break;
      case "peer-left":
        // Other peer may have closed signaling to switch to relay — follow them.
        if (!connectedRef.current && transportModeRef.current !== "relay") {
          fallbackToRelayRef.current("peer-left");
        } else if (transportModeRef.current === "p2p") {
          connectedRef.current = false;
          setConnected(false);
          setStatus("Peer left");
          closePeerConnection();
        }
        break;
      case "error":
        setError(msg.message || "Signaling error");
        setStatus(/full/i.test(msg.message || "") ? "Room full" : "Error");
        break;
      case "ping":
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

  // ---- Relay mode (legacy WS + ECDH) ----

  const exchangeKeys = async () => {
    if (!keyPairRef.current || sentKeyExchangeRef.current) return;
    const publicKey = await exportPublicKey(keyPairRef.current.publicKey);
    const payload = JSON.stringify({ type: "key-exchange", publicKey });
    sentKeyExchangeRef.current = true;
    const ws = relayWsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    } else {
      sentKeyExchangeRef.current = false;
    }
  };

  const handleKeyExchange = async (publicKeyString: string) => {
    if (!keyPairRef.current) return;
    try {
      const peerPublicKey = await importPublicKey(publicKeyString);
      const sharedKey = await deriveSharedKey(
        keyPairRef.current.privateKey,
        peerPublicKey,
      );
      sharedKeyRef.current = sharedKey;
      console.log("Relay shared key established");

      if (!sentKeyExchangeRef.current) {
        await exchangeKeys();
      }

      if (!connectedRef.current || transportModeRef.current !== "relay") {
        markConnected("relay");
      }
    } catch (e) {
      console.error("Key exchange failed", e);
    }
  };

  const handleRelayEncryptedText = async (encryptedData: string) => {
    if (!sharedKeyRef.current) return;
    try {
      const decrypted = await decryptData(
        base64ToBuffer(encryptedData),
        sharedKeyRef.current,
      );
      const text = new TextDecoder().decode(decrypted);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          type: "text",
          content: text,
          from: "peer",
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      console.error("Relay text decrypt failed", e);
    }
  };

  const handleRelayEncryptedChunk = async (data: ArrayBuffer) => {
    if (!incomingFileRef.current || !sharedKeyRef.current) return;
    try {
      const decrypted = await decryptData(data, sharedKeyRef.current);
      const transfer = incomingFileRef.current;
      transfer.chunks.push(decrypted);
      transfer.received += decrypted.byteLength;
      const progress = Math.min(
        100,
        Math.round((transfer.received / Math.max(transfer.fileSize, 1)) * 100),
      );
      setReceiveProgress({ fileName: transfer.fileName, progress });
    } catch (e) {
      console.error("Relay chunk decrypt failed", e);
    }
  };

  const completeRelayFile = () => {
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
  };

  const handleRelayMessage = async (event: MessageEvent) => {
    if (typeof event.data === "string") {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = msg.type as string | undefined;
      if (type === "connected") {
        peerIdRef.current = String(msg.peer_id || "");
        const peers = typeof msg.peers_in_room === "number" ? msg.peers_in_room : 0;
        if (peers >= 2) {
          setStatus("Connecting");
          await exchangeKeys();
        } else {
          setStatus("Waiting for peer");
        }
        return;
      }
      if (type === "peer_joined") {
        setStatus("Connecting");
        await exchangeKeys();
        return;
      }
      if (type === "peer_left") {
        connectedRef.current = false;
        setConnected(false);
        setStatus("Peer left");
        return;
      }
      if (type === "error") {
        const errMsg = String(msg.error || msg.message || "Relay error");
        setError(errMsg);
        setStatus(/full/i.test(errMsg) ? "Room full" : "Error");
        return;
      }
      if (type === "ping") return;
      if (type === "key-exchange" && typeof msg.publicKey === "string") {
        await handleKeyExchange(msg.publicKey);
        return;
      }
      if (type === "text" && typeof msg.data === "string") {
        await handleRelayEncryptedText(msg.data);
        return;
      }
      if (type === "file-meta" && typeof msg.fileName === "string") {
        incomingFileRef.current = {
          fileName: msg.fileName,
          fileSize: Number(msg.fileSize) || 0,
          fileType: String(msg.fileType || "application/octet-stream"),
          chunks: [],
          received: 0,
        };
        setReceiveProgress({ fileName: msg.fileName, progress: 0 });
        return;
      }
      if (type === "file-complete") {
        completeRelayFile();
        return;
      }
      return;
    }

    const buffer = await normalizeBinaryFrame(
      event.data as Blob | ArrayBuffer | ArrayBufferView,
    );
    if (buffer) await handleRelayEncryptedChunk(buffer);
  };

  const connectRelay = async (room: string) => {
    closeRelay();
    clearP2pTimer();
    startRelayTimer();
    setStatus("Connecting");
    setError(null);
    markTransport(null);
    connectedRef.current = false;
    setConnected(false);
    sentKeyExchangeRef.current = false;
    sharedKeyRef.current = null;

    if (!keyPairRef.current) {
      keyPairRef.current = await generateKeyPair();
    }

    const url = getRelayUrl(room);
    console.log("Connecting relay", url);
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    relayWsRef.current = ws;

    ws.onopen = () => {
      console.log("Relay WS open");
    };
    ws.onmessage = (event) => {
      void handleRelayMessageRef.current(event);
    };
    ws.onerror = () => {
      console.error("Relay WS error");
    };
    ws.onclose = () => {
      console.log("Relay WS closed");
      if (transportModeRef.current === "relay" && connectedRef.current) {
        connectedRef.current = false;
        setConnected(false);
        setStatus("Peer left");
      }
    };
  };

  const fallbackToRelay = (reason: string) => {
    if (fallingBackRef.current || transportModeRef.current === "relay") return;
    if (dcRef.current?.readyState === "open") return;
    fallingBackRef.current = true;
    console.log("Falling back to relay:", reason);
    clearP2pTimer();
    closePeerConnection();
    closeSignal();
    setError(null);
    setStatus("Connecting");
    const room = roomCodeRef.current;
    if (!room) {
      setError("Missing room code for relay fallback.");
      setStatus("Connection failed");
      return;
    }
    void connectRelay(room);
  };

  fallbackToRelayRef.current = fallbackToRelay;
  handleSignalRef.current = handleSignalMessage;
  handleDataRef.current = handleP2pDataMessage;
  handleRelayMessageRef.current = handleRelayMessage;

  const connectSignal = (room: string) => {
    cleanupAll();
    roomCodeRef.current = room;
    setError(null);
    setConnected(false);
    setStatus("Connecting");
    fallingBackRef.current = false;

    const url = getSignalUrl(room);
    const ws = new WebSocket(url);
    signalWsRef.current = ws;

    ws.onopen = () => {
      console.log("Signaling connected", url);
    };
    ws.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      void handleSignalRef.current(event.data);
    };
    ws.onerror = () => {
      // Signal failure → try relay directly
      fallbackToRelayRef.current("signal-error");
    };
    ws.onclose = () => {
      // P2P already up — signaling can drop without ending the session
      if (transportModeRef.current === "p2p" && connectedRef.current) return;
      if (fallingBackRef.current || transportModeRef.current === "relay") return;
      if (!connectedRef.current) {
        fallbackToRelayRef.current("signal-closed");
      }
    };
  };

  // Expose diagnostics for Playwright
  if (typeof window !== "undefined") {
    (
      window as unknown as {
        __shareDebug?: () => {
          connected: boolean;
          status: string;
          mode: TransportMode;
          dcState: string | undefined;
          pcState: RTCPeerConnectionState | undefined;
          iceState: RTCIceConnectionState | undefined;
        };
      }
    ).__shareDebug = () => ({
      connected: connectedRef.current,
      status,
      mode: transportModeRef.current,
      dcState: dcRef.current?.readyState,
      pcState: pcRef.current?.connectionState,
      iceState: pcRef.current?.iceConnectionState,
    });
  }

  const startSending = async () => {
    const code = generateRoomCode();
    roomCodeRef.current = code;
    setRoomCode(code);
    setMode("send");
    setMessages([]);
    setReceivedFiles([]);
    const qs = forceRelayFallback ? "&forceRelayFallback=1" : "";
    setQrUrl(`${window.location.origin}/share?room=${code}${qs}`);
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
    roomCodeRef.current = joinCode;
    setRoomCode(joinCode);
    setMode("receive");
    setMessages([]);
    setReceivedFiles([]);
    setStatus("Connecting");
    connectSignal(joinCode);
  };

  // ---- Send (routes to P2P or relay) ----

  const sendText = async () => {
    const text = textInput.trim();
    if (!text) return;
    setTextInput("");

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

    try {
      if (dcRef.current?.readyState === "open") {
        const payload: AppDataMessage = { type: "text", data: text };
        dcRef.current.send(JSON.stringify(payload));
        return;
      }

      if (
        relayWsRef.current?.readyState === WebSocket.OPEN &&
        sharedKeyRef.current
      ) {
        const encoded = new TextEncoder().encode(text);
        const encrypted = await encryptData(
          encoded.buffer.slice(
            encoded.byteOffset,
            encoded.byteOffset + encoded.byteLength,
          ) as ArrayBuffer,
          sharedKeyRef.current,
        );
        relayWsRef.current.send(
          JSON.stringify({ type: "text", data: bufferToBase64(encrypted) }),
        );
        return;
      }

      setError("Not connected to a peer yet.");
    } catch (e) {
      console.error("send text failed", e);
      setError("Failed to send text.");
    }
  };

  const sendFile = async (file: File) => {
    setSendProgress({ fileName: file.name, progress: 0 });
    try {
      if (dcRef.current?.readyState === "open") {
        const meta: AppDataMessage = {
          type: "file-meta",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
        };
        dcRef.current.send(JSON.stringify(meta));

        let offset = 0;
        while (offset < file.size) {
          await waitForBufferedAmountLow(dcRef.current);
          const slice = file.slice(offset, offset + FILE_CHUNK_SIZE);
          const buf = await slice.arrayBuffer();
          dcRef.current.send(buf);
          offset += buf.byteLength;
          setSendProgress({
            fileName: file.name,
            progress: Math.min(100, Math.round((offset / file.size) * 100)),
          });
        }
        await waitForBufferedAmountLow(dcRef.current);
        dcRef.current.send(JSON.stringify({ type: "file-complete" } satisfies AppDataMessage));
      } else if (
        relayWsRef.current?.readyState === WebSocket.OPEN &&
        sharedKeyRef.current
      ) {
        const fileData = await file.arrayBuffer();
        const fileHash = await hashData(fileData);
        relayWsRef.current.send(
          JSON.stringify({
            type: "file-meta",
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || "application/octet-stream",
            hash: fileHash,
          }),
        );

        let offset = 0;
        while (offset < file.size) {
          const slice = file.slice(offset, offset + RELAY_FILE_CHUNK_SIZE);
          const buf = await slice.arrayBuffer();
          const encrypted = await encryptData(buf, sharedKeyRef.current);
          relayWsRef.current.send(encrypted);
          offset += buf.byteLength;
          setSendProgress({
            fileName: file.name,
            progress: Math.min(100, Math.round((offset / file.size) * 100)),
          });
          // Small delay to avoid flooding the relay
          await new Promise((r) => setTimeout(r, 40));
        }
        relayWsRef.current.send(JSON.stringify({ type: "file-complete" }));
      } else {
        setError("Not connected to a peer yet.");
        return;
      }

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
    cleanupAll({ statusMsg: "Disconnected" });
    setMode(null);
    setRoomCode("");
    roomCodeRef.current = "";
    setInputCode("");
    setQrUrl("");
    setMessages([]);
    setReceivedFiles([]);
    setError(null);
  };

  if (!mode) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Secure File & Text Share</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Peer-to-peer WebRTC with automatic relay fallback • Encrypted in
              transit
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
              data-mode={transportMode || ""}
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
                    void sendText();
                  }
                }}
              />
              <Button
                onClick={() => void sendText()}
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
                {transportMode === "relay"
                  ? "Sent via encrypted server relay"
                  : "Sent peer-to-peer over WebRTC"}
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
