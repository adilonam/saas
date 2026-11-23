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
  importPublicKey,
  normalizeBinaryFrame,
} from "@/lib/share-crypto";
import {
  CONNECT_TIMEOUT_MS,
  FILE_CHUNK_SIZE,
  MAX_FILE_SIZE,
  MEMORY_RECEIVE_MAX,
  formatBytes,
  generateRoomCode,
  getShareWsUrl,
  supportsSaveFilePicker,
  waitForWsBufferedAmount,
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
  blob?: Blob;
  savedToDisk?: boolean;
  timestamp: number;
}

type FileSystemWritable = {
  write: (data: BufferSource | Blob) => Promise<void>;
  close: () => Promise<void>;
  abort?: () => Promise<void>;
};

interface IncomingFile {
  fileName: string;
  fileSize: number;
  fileType: string;
  received: number;
  mode: "stream" | "memory";
  writable: FileSystemWritable | null;
  chunks: ArrayBuffer[];
  pending: ArrayBuffer[];
  needsSavePicker: boolean;
  memoryNotice: boolean;
}

interface TransferProgress {
  fileName: string;
  progress: number;
  transferred: number;
  total: number;
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
  const [info, setInfo] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState<TransferProgress | null>(
    null,
  );
  const [receiveProgress, setReceiveProgress] =
    useState<TransferProgress | null>(null);
  const [awaitingSave, setAwaitingSave] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const peerIdRef = useRef("");
  const incomingFileRef = useRef<IncomingFile | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startedAutoJoinRef = useRef(false);
  const connectedRef = useRef(false);
  const roomCodeRef = useRef("");
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const sentKeyExchangeRef = useRef(false);
  const sendingFileRef = useRef(false);
  const handleMessageRef = useRef<(event: MessageEvent) => Promise<void>>(
    async () => {},
  );

  const clearConnectTimer = () => {
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
  };

  const markConnected = () => {
    clearConnectTimer();
    connectedRef.current = true;
    setConnected(true);
    setError(null);
    setStatus("Connected (P2P)");
  };

  const cleanup = (opts?: { statusMsg?: string }) => {
    clearConnectTimer();
    const incoming = incomingFileRef.current;
    if (incoming?.writable) {
      void incoming.writable.abort?.().catch(() => undefined);
    }
    incomingFileRef.current = null;
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null;
        wsRef.current.close();
      } catch {
        /* ignore */
      }
      wsRef.current = null;
    }
    connectedRef.current = false;
    sharedKeyRef.current = null;
    sentKeyExchangeRef.current = false;
    keyPairRef.current = null;
    sendingFileRef.current = false;
    setConnected(false);
    setSendProgress(null);
    setReceiveProgress(null);
    setAwaitingSave(false);
    if (opts?.statusMsg) setStatus(opts.statusMsg);
  };

  useEffect(() => {
    return () => {
      cleanup();
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

  const startConnectTimer = () => {
    clearConnectTimer();
    connectTimerRef.current = setTimeout(() => {
      if (connectedRef.current) return;
      setError(
        "Could not establish a connection. Check your network and try again.",
      );
      setStatus("Connection failed");
      cleanup({ statusMsg: "Connection failed" });
    }, CONNECT_TIMEOUT_MS);
  };

  const exchangeKeys = async () => {
    if (!keyPairRef.current || sentKeyExchangeRef.current) return;
    const publicKey = await exportPublicKey(keyPairRef.current.publicKey);
    const payload = JSON.stringify({ type: "key-exchange", publicKey });
    sentKeyExchangeRef.current = true;
    const ws = wsRef.current;
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
      console.log("Shared key established");

      if (!sentKeyExchangeRef.current) {
        await exchangeKeys();
      }

      if (!connectedRef.current) {
        markConnected();
      }
    } catch (e) {
      console.error("Key exchange failed", e);
    }
  };

  const handleEncryptedText = async (encryptedData: string) => {
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
      console.error("Text decrypt failed", e);
    }
  };

  const updateReceiveProgress = (transfer: IncomingFile) => {
    const progress = Math.min(
      100,
      Math.round((transfer.received / Math.max(transfer.fileSize, 1)) * 100),
    );
    setReceiveProgress({
      fileName: transfer.fileName,
      progress,
      transferred: transfer.received,
      total: transfer.fileSize,
    });
  };

  const beginIncomingFile = (meta: {
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => {
    const canStream = supportsSaveFilePicker();
    const preferMemory =
      !canStream || meta.fileSize <= MEMORY_RECEIVE_MAX;

    const transfer: IncomingFile = {
      fileName: meta.fileName,
      fileSize: meta.fileSize,
      fileType: meta.fileType || "application/octet-stream",
      received: 0,
      mode: preferMemory ? "memory" : "stream",
      writable: null,
      chunks: [],
      pending: [],
      needsSavePicker: canStream && !preferMemory,
      memoryNotice: preferMemory && meta.fileSize > MEMORY_RECEIVE_MAX / 2,
    };

    incomingFileRef.current = transfer;
    setAwaitingSave(transfer.needsSavePicker);
    setReceiveProgress({
      fileName: transfer.fileName,
      progress: 0,
      transferred: 0,
      total: transfer.fileSize,
    });

    if (transfer.memoryNotice) {
      setInfo(
        "Receiving in memory. Very large files may need a desktop browser with Save to disk support.",
      );
    } else if (transfer.needsSavePicker) {
      setInfo(
        `Incoming file (${formatBytes(transfer.fileSize)}). Click “Save to disk” to stream it without loading into memory.`,
      );
    } else {
      setInfo(null);
    }
  };

  const chooseSaveLocation = async () => {
    const transfer = incomingFileRef.current;
    if (!transfer) return;

    const picker = (
      window as unknown as {
        showSaveFilePicker?: (opts?: {
          suggestedName?: string;
          types?: Array<{
            description?: string;
            accept: Record<string, string[]>;
          }>;
        }) => Promise<{
          createWritable: () => Promise<FileSystemWritable>;
        }>;
      }
    ).showSaveFilePicker;

    if (!picker) {
      transfer.mode = "memory";
      transfer.needsSavePicker = false;
      setAwaitingSave(false);
      setInfo(
        "Save to disk is not available here. Falling back to in-memory receive — very large files may need a desktop browser.",
      );
      // Flush pending into chunks
      for (const c of transfer.pending) transfer.chunks.push(c);
      transfer.pending = [];
      return;
    }

    try {
      const handle = await picker({
        suggestedName: transfer.fileName,
      });
      const writable = await handle.createWritable();
      transfer.writable = writable;
      transfer.mode = "stream";
      transfer.needsSavePicker = false;
      setAwaitingSave(false);
      setInfo(null);

      for (const chunk of transfer.pending) {
        await writable.write(chunk);
      }
      transfer.pending = [];
    } catch (e) {
      console.warn("Save picker cancelled or failed", e);
      // Keep awaiting if still streaming large file
      if (transfer.fileSize > MEMORY_RECEIVE_MAX) {
        setInfo(
          "Save cancelled. Click “Save to disk” again, or the transfer will stay buffered until you choose a location.",
        );
      } else {
        transfer.mode = "memory";
        transfer.needsSavePicker = false;
        setAwaitingSave(false);
        for (const c of transfer.pending) transfer.chunks.push(c);
        transfer.pending = [];
        setInfo(
          "Using in-memory receive. Very large files may need a desktop browser.",
        );
      }
    }
  };

  const handleEncryptedChunk = async (data: ArrayBuffer) => {
    if (!incomingFileRef.current || !sharedKeyRef.current) return;
    try {
      const decrypted = await decryptData(data, sharedKeyRef.current);
      const transfer = incomingFileRef.current;
      transfer.received += decrypted.byteLength;

      if (transfer.mode === "stream") {
        if (transfer.writable) {
          await transfer.writable.write(new Uint8Array(decrypted));
        } else {
          transfer.pending.push(decrypted);
        }
      } else {
        transfer.chunks.push(decrypted);
      }

      updateReceiveProgress(transfer);
    } catch (e) {
      console.error("Chunk decrypt failed", e);
    }
  };

  const completeFileTransfer = async () => {
    const transfer = incomingFileRef.current;
    incomingFileRef.current = null;
    setReceiveProgress(null);
    setAwaitingSave(false);
    if (!transfer) return;

    if (transfer.mode === "stream" && transfer.writable) {
      try {
        // Flush any remaining pending
        for (const chunk of transfer.pending) {
          await transfer.writable.write(new Uint8Array(chunk));
        }
        await transfer.writable.close();
        setReceivedFiles((prev) => [
          ...prev,
          {
            fileName: transfer.fileName,
            fileSize: transfer.fileSize,
            fileType: transfer.fileType,
            savedToDisk: true,
            timestamp: Date.now(),
          },
        ]);
        setInfo(null);
      } catch (e) {
        console.error("Failed to finalize streamed file", e);
        setError("Failed to finish saving the file to disk.");
        return;
      }
    } else {
      const allChunks = [...transfer.chunks, ...transfer.pending];
      const blob = new Blob(allChunks, {
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
      if (transfer.fileSize > MEMORY_RECEIVE_MAX) {
        setInfo(
          "File kept in memory. Very large files may need a desktop browser with Save to disk.",
        );
      } else {
        setInfo(null);
      }
    }

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

  const handleMessage = async (event: MessageEvent) => {
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
        const peers =
          typeof msg.peers_in_room === "number" ? msg.peers_in_room : 0;
        if (peers >= 2) {
          setStatus("Connecting");
          startConnectTimer();
          await exchangeKeys();
        } else {
          setStatus("Waiting for peer");
        }
        return;
      }
      if (type === "peer_joined") {
        setStatus("Connecting");
        startConnectTimer();
        await exchangeKeys();
        return;
      }
      if (type === "peer_left") {
        connectedRef.current = false;
        setConnected(false);
        sharedKeyRef.current = null;
        sentKeyExchangeRef.current = false;
        setStatus("Peer left");
        return;
      }
      if (type === "error") {
        const errMsg = String(msg.error || msg.message || "Connection error");
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
        await handleEncryptedText(msg.data);
        return;
      }
      if (type === "file-meta" && typeof msg.fileName === "string") {
        beginIncomingFile({
          fileName: msg.fileName,
          fileSize: Number(msg.fileSize) || 0,
          fileType: String(msg.fileType || "application/octet-stream"),
        });
        return;
      }
      if (type === "file-complete") {
        await completeFileTransfer();
        return;
      }
      return;
    }

    const buffer = await normalizeBinaryFrame(
      event.data as Blob | ArrayBuffer | ArrayBufferView,
    );
    if (buffer) await handleEncryptedChunk(buffer);
  };

  handleMessageRef.current = handleMessage;

  const connectRoom = async (room: string) => {
    cleanup();
    roomCodeRef.current = room;
    setError(null);
    setInfo(null);
    setConnected(false);
    setStatus("Connecting");
    sentKeyExchangeRef.current = false;
    sharedKeyRef.current = null;
    keyPairRef.current = await generateKeyPair();

    const url = getShareWsUrl(room);
    console.log("Share WS connecting", url);
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Share WS open");
    };
    ws.onmessage = (event) => {
      void handleMessageRef.current(event);
    };
    ws.onerror = () => {
      setError("Connection error. Please try again.");
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

  if (typeof window !== "undefined") {
    (
      window as unknown as {
        __shareDebug?: () => {
          connected: boolean;
          status: string;
          wsState: number | undefined;
          hasSharedKey: boolean;
        };
      }
    ).__shareDebug = () => ({
      connected: connectedRef.current,
      status,
      wsState: wsRef.current?.readyState,
      hasSharedKey: !!sharedKeyRef.current,
    });
  }

  const startSending = async () => {
    const code = generateRoomCode();
    roomCodeRef.current = code;
    setRoomCode(code);
    setMode("send");
    setMessages([]);
    setReceivedFiles([]);
    setQrUrl(`${window.location.origin}/share?room=${code}`);
    setStatus("Waiting for peer");
    await connectRoom(code);
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
    await connectRoom(joinCode);
  };

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

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to a peer yet.");
      return;
    }
    if (!sharedKeyRef.current) {
      setError("Secure channel not ready yet.");
      return;
    }

    try {
      const encoded = new TextEncoder().encode(text);
      const encrypted = await encryptData(
        encoded.buffer.slice(
          encoded.byteOffset,
          encoded.byteOffset + encoded.byteLength,
        ) as ArrayBuffer,
        sharedKeyRef.current,
      );
      wsRef.current.send(
        JSON.stringify({ type: "text", data: bufferToBase64(encrypted) }),
      );
    } catch (e) {
      console.error("send text failed", e);
      setError("Failed to send text.");
    }
  };

  const sendFile = async (file: File) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected to a peer yet.");
      return;
    }
    if (!sharedKeyRef.current) {
      setError("Secure channel not ready yet.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Max file size is 20 GB");
      return;
    }
    if (sendingFileRef.current) {
      setError("A file transfer is already in progress.");
      return;
    }

    sendingFileRef.current = true;
    setError(null);
    setSendProgress({
      fileName: file.name,
      progress: 0,
      transferred: 0,
      total: file.size,
    });

    try {
      const ws = wsRef.current;
      const key = sharedKeyRef.current;

      ws.send(
        JSON.stringify({
          type: "file-meta",
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/octet-stream",
        }),
      );

      let offset = 0;
      let lastUi = 0;
      while (offset < file.size) {
        await waitForWsBufferedAmount(ws);
        if (ws.readyState !== WebSocket.OPEN) {
          throw new Error("Connection closed during file send");
        }
        const slice = file.slice(offset, offset + FILE_CHUNK_SIZE);
        const buf = await slice.arrayBuffer();
        const encrypted = await encryptData(buf, key);
        ws.send(encrypted);
        offset += buf.byteLength;

        // Always yield so the UI / WS close handlers can run
        await new Promise((r) => setTimeout(r, 0));

        // Throttle UI updates
        if (offset - lastUi >= FILE_CHUNK_SIZE * 8 || offset >= file.size) {
          lastUi = offset;
          setSendProgress({
            fileName: file.name,
            progress: Math.min(
              100,
              Math.round((offset / Math.max(file.size, 1)) * 100),
            ),
            transferred: offset,
            total: file.size,
          });
        }
      }

      await waitForWsBufferedAmount(ws);
      ws.send(JSON.stringify({ type: "file-complete" }));

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
      const msg = e instanceof Error ? e.message : "Failed to send file.";
      setError(
        /rate|limit|too large|size/i.test(msg)
          ? msg
          : "Failed to send file.",
      );
    } finally {
      sendingFileRef.current = false;
      setSendProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("Max file size is 20 GB");
      } else {
        void sendFile(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Max file size is 20 GB");
      return;
    }
    void sendFile(file);
  };

  const downloadFile = (file: ReceivedFile) => {
    if (!file.blob) return;
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetHome = () => {
    cleanup({ statusMsg: "Disconnected" });
    setMode(null);
    setRoomCode("");
    roomCodeRef.current = "";
    setInputCode("");
    setQrUrl("");
    setMessages([]);
    setReceivedFiles([]);
    setError(null);
    setInfo(null);
  };

  if (!mode) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Secure File & Text Share</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Peer-to-peer encrypted sharing • Up to 20 GB per file
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
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Room Code
              </p>
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
            <div
              data-testid="share-error"
              className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200"
            >
              {error}
            </div>
          )}

          {info && (
            <div className="mt-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-sm text-sky-900 dark:text-sky-100">
              {info}
            </div>
          )}

          {awaitingSave && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => void chooseSaveLocation()}>
                Save to disk
              </Button>
            </div>
          )}

          {mode === "send" && qrUrl && (
            <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">
                Scan to join:
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                End-to-end encrypted • Max 20 GB
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
              <div
                data-testid="send-progress"
                className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800"
              >
                <p className="text-sm font-medium mb-2">{sendProgress.fileName}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${sendProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">
                  {sendProgress.progress}% ·{" "}
                  {formatBytes(sendProgress.transferred)} /{" "}
                  {formatBytes(sendProgress.total)}
                </p>
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
              <div
                data-testid="receive-progress"
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
              >
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
                  {receiveProgress.progress}% ·{" "}
                  {formatBytes(receiveProgress.transferred)} /{" "}
                  {formatBytes(receiveProgress.total)}
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
                      data-saved={file.savedToDisk ? "true" : "false"}
                    >
                      <p className="font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(file.fileSize)}
                        {file.savedToDisk ? " · saved to disk" : ""}
                      </p>
                    </div>
                    {file.blob ? (
                      <Button size="sm" onClick={() => downloadFile(file)}>
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    ) : null}
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
