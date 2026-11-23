"use client";

import { useSearchParams } from "next/navigation";

import { useState, useEffect, useRef, Suspense } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  PaperAirplaneIcon, 
  ArrowDownTrayIcon,
  ShareIcon,
  DocumentArrowDownIcon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
// Crypto utilities for E2E encryption (ECDH + AES-GCM)
async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  return keyPair;
}

async function deriveSharedKey(privateKey: CryptoKey, publicKey: CryptoKey) {
  return await crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

async function importPublicKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}

async function encryptData(data: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return result.buffer;
}

async function decryptData(data: ArrayBuffer, key: CryptoKey): Promise<ArrayBuffer> {
  const dataView = new Uint8Array(data);
  const iv = dataView.slice(0, 12);
  const encrypted = dataView.slice(12);
  return await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
}

async function hashData(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

interface Message {
  type: "text" | "file-start" | "file-complete";
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

interface FileTransfer {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: ArrayBuffer[];
  received: number;
  total: number;
  hash?: string;
}

interface QueuedItem {
  type: "text" | "file";
  data?: string;
  file?: File;
}

const CHUNK_SIZE = 128 * 1024;
const WEBRTC_TIMEOUT = 10000;

function SharePageContent() {
  const searchParams = useSearchParams();
  const autoJoinRoom = searchParams?.get("room") || null;
  const forceRelay = searchParams?.get("relay") === "1";

  const [mode, setMode] = useState<"send" | "receive" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [transportReady, setTransportReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const wsUrl = typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_SHARE_WS_URL ?? 'wss://saas-backend-326a81a69453.herokuapp.com/ws/share/ws')
    : '';
  const [usingRelay, setUsingRelay] = useState(false);
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState<{fileName: string, progress: number} | null>(null);
  const [receiveProgress, setReceiveProgress] = useState<{fileName: string, progress: number} | null>(null);
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);

  const markUsingRelay = (value: boolean) => {
    usingRelayRef.current = value;
    setUsingRelay(value);
  };

  const markTransportReady = (value: boolean) => {
    transportReadyRef.current = value;
    setTransportReady(value);
  };

  const enqueueItem = (item: QueuedItem) => {
    queuedItemsRef.current = [...queuedItemsRef.current, item];
    setQueuedItems(queuedItemsRef.current);
  };

  const clearQueue = () => {
    queuedItemsRef.current = [];
    setQueuedItems([]);
  };

  const wsRef = useRef<WebSocket | null>(null);
  const rtcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const fileTransferRef = useRef<FileTransfer | null>(null);
  const peerIdRef = useRef<string>("");
  const isInitiatorRef = useRef(false);
  const webrtcTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const usingRelayRef = useRef(false);
  const transportReadyRef = useRef(false);
  const queuedItemsRef = useRef<QueuedItem[]>([]);
  const sentKeyExchangeRef = useRef(false);

  useEffect(() => {
    if (autoJoinRoom && !mode && wsUrl) {
      // Auto-join as receiver from QR code
      setMode("receive");
      setInputCode(autoJoinRoom);
      setTimeout(() => joinRoom(autoJoinRoom), 500);
    }
  }, [autoJoinRoom, mode, wsUrl]);

  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startSending = async () => {
    if (!wsUrl) {
      setStatus("Configuration error");
      return;
    }

    const code = generateRoomCode();
    setRoomCode(code);
    setMode("send");
    isInitiatorRef.current = true;
    sentKeyExchangeRef.current = false;
    sharedKeyRef.current = null;
    transportReadyRef.current = false;
    setStatus("Waiting for receiver...");

    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    const url = `${window.location.origin}/share?room=${code}`;
    setQrUrl(url);

    connectWebSocket(code);
  };

  const startReceiving = () => {
    setMode("receive");
  };

  const joinRoom = async (code?: string) => {
    const joinCode = code || inputCode;
    if (!joinCode || joinCode.length !== 6) {
      setStatus("Invalid code");
      return;
    }

    if (!wsUrl) {
      setStatus("Configuration error");
      return;
    }

    setStatus("Joining...");
    setRoomCode(joinCode);
    isInitiatorRef.current = false;
    sentKeyExchangeRef.current = false;
    sharedKeyRef.current = null;
    transportReadyRef.current = false;

    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    connectWebSocket(joinCode);
  };

  const connectWebSocket = (room: string) => {
    const ws = new WebSocket(`${wsUrl}/${room}`);
    // Prefer ArrayBuffer so encrypted file chunks are not Blobs
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        await handleSignalingMessage(msg);
      } else {
        await handleBinaryFrame(event.data);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setStatus('Connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setConnected(false);
      setStatus('Peer left');
      if (rtcRef.current) {
        rtcRef.current.close();
        rtcRef.current = null;
      }
    };
  };

  const handleSignalingMessage = async (msg: any) => {
    if (msg.type === 'connected') {
      peerIdRef.current = msg.peer_id;
      // Joiner already sees a peer in the room: kick off key exchange / WebRTC
      // (only the first peer receives peer_joined).
      if (typeof msg.peers_in_room === 'number' && msg.peers_in_room >= 2) {
        console.log('Joined room with existing peer, connecting...');
        setStatus('Peer present, connecting...');
        if (!forceRelay) {
          await setupWebRTC();
        } else {
          markUsingRelay(true);
          await exchangeKeys();
        }
      }
    } else if (msg.type === 'peer_joined') {
      console.log('Peer joined, setting up connection...');
      setStatus('Peer joined, connecting...');
      if (!forceRelay) {
        await setupWebRTC();
      } else {
        console.log('Using relay mode (forced)');
        markUsingRelay(true);
        await exchangeKeys();
        // Wait a bit for key exchange to complete
        setTimeout(async () => {
          if (sharedKeyRef.current) {
            console.log('Relay ready with shared key');
            setConnected(true);
            markTransportReady(true);
            setStatus('Connected (relay)');
            await processQueue();
          }
        }, 1000);
      }
    } else if (msg.type === 'peer_left') {
      setStatus('Peer left');
      setConnected(false);
      if (rtcRef.current) {
        rtcRef.current.close();
        rtcRef.current = null;
      }
    } else if (msg.type === 'error') {
      setStatus(`Error: ${msg.error}`);
    } else if (msg.type === 'ping') {
      // Ignore
    } else if (msg.type === 'offer' && msg.offer) {
      await handleOffer(msg.offer);
    } else if (msg.type === 'answer' && msg.answer) {
      await handleAnswer(msg.answer);
    } else if (msg.type === 'ice-candidate' && msg.candidate) {
      await handleIceCandidate(msg.candidate);
    } else if (msg.type === 'key-exchange' && msg.publicKey) {
      await handleKeyExchange(msg.publicKey);
    } else if (
      msg.type === 'text' ||
      msg.type === 'file-meta' ||
      msg.type === 'file-complete'
    ) {
      // Server relays app payloads over the same WS (adds from_peer).
      // These must use the data handler, not the signaling switch above.
      await handleDataMessage(msg);
    }
  };

  const setupWebRTC = async () => {
    if (rtcRef.current) return;

    const rtc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });
    rtcRef.current = rtc;

    webrtcTimeoutRef.current = setTimeout(async () => {
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
        console.log('WebRTC timeout after 10s, falling back to relay');
        markUsingRelay(true);
        if (rtc) {
          rtc.close();
        }
        rtcRef.current = null;
        await exchangeKeys();
        // Wait for key exchange
        setTimeout(async () => {
          if (sharedKeyRef.current) {
            console.log('Relay fallback ready with shared key');
            setConnected(true);
            markTransportReady(true);
            setStatus('Connected (relay)');
            await processQueue();
          }
        }, 1000);
      }
    }, WEBRTC_TIMEOUT);

    rtc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate.toJSON()
        }));
      }
    };

    rtc.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    if (isInitiatorRef.current) {
      const channel = rtc.createDataChannel('file-transfer', { ordered: true });
      setupDataChannel(channel);

      const offer = await rtc.createOffer();
      await rtc.setLocalDescription(offer);
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          offer: offer
        }));
      }
    }
  };

  const setupDataChannel = (channel: RTCDataChannel) => {
    dataChannelRef.current = channel;

    channel.onopen = async () => {
      if (webrtcTimeoutRef.current) {
        clearTimeout(webrtcTimeoutRef.current);
      }
      console.log('DataChannel opened, state:', channel.readyState);
      markUsingRelay(false);
      await exchangeKeys();
      // Wait for key exchange to complete
      setTimeout(async () => {
        if (sharedKeyRef.current) {
          console.log('DataChannel ready with shared key');
          setConnected(true);
          markTransportReady(true);
          setStatus('Connected (P2P)');
          await processQueue();
        } else {
          console.error('DataChannel open but no shared key!');
        }
      }, 1000);
    };

    channel.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        if (msg.type === 'key-exchange') {
          await handleKeyExchange(msg.publicKey);
        } else {
          await handleDataMessage(msg);
        }
      } else {
        await handleBinaryChunk(event.data);
      }
    };

    channel.onerror = (err) => {
      console.error('DataChannel error:', err);
    };

    channel.onclose = () => {
      console.log('DataChannel closed');
      setConnected(false);
      setStatus('Peer left');
    };
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!rtcRef.current) {
      await setupWebRTC();
    }
    
    const rtc = rtcRef.current;
    if (!rtc) return;

    await rtc.setRemoteDescription(offer);
    const answer = await rtc.createAnswer();
    await rtc.setLocalDescription(answer);

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        answer: answer
      }));
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    const rtc = rtcRef.current;
    if (!rtc) return;
    await rtc.setRemoteDescription(answer);
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    const rtc = rtcRef.current;
    if (!rtc) return;
    await rtc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const exchangeKeys = async () => {
    if (!keyPairRef.current) return;
    if (sentKeyExchangeRef.current) return;

    const publicKey = await exportPublicKey(keyPairRef.current.publicKey);
    const msg = JSON.stringify({ type: 'key-exchange', publicKey });
    sentKeyExchangeRef.current = true;

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(msg);
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    } else {
      // Allow retry if socket was not ready yet
      sentKeyExchangeRef.current = false;
    }
  };

  const handleKeyExchange = async (publicKeyString: string) => {
    if (!keyPairRef.current) {
      console.error('No key pair for key exchange!');
      return;
    }

    try {
      console.log('Receiving peer public key, deriving shared secret...');
      const peerPublicKey = await importPublicKey(publicKeyString);
      const sharedKey = await deriveSharedKey(keyPairRef.current.privateKey, peerPublicKey);
      sharedKeyRef.current = sharedKey;
      console.log('Shared key established ✓');

      // Reply once with our public key so the peer can derive the same secret.
      if (!sentKeyExchangeRef.current) {
        await exchangeKeys();
      }

      // On relay (or once P2P datachannel is open), becoming ready after ECDH is enough.
      const relayOrP2P =
        dataChannelRef.current?.readyState === 'open' ||
        usingRelayRef.current ||
        forceRelay ||
        !rtcRef.current;
      if (relayOrP2P && !transportReadyRef.current) {
        // If WebRTC never came up, treat as relay
        if (dataChannelRef.current?.readyState !== 'open') {
          markUsingRelay(true);
        }
        console.log('Transport becoming ready after key exchange');
        markTransportReady(true);
        setConnected(true);
        setStatus(
          dataChannelRef.current?.readyState === 'open'
            ? 'Connected (P2P)'
            : 'Connected (relay)',
        );
        await processQueue();
      }
    } catch (e) {
      console.error('Key exchange failed:', e);
    }
  };

  const processQueue = async () => {
    if (!sharedKeyRef.current) {
      console.log('Cannot process queue: no shared key yet');
      return;
    }

    const items = queuedItemsRef.current;
    if (items.length === 0) {
      console.log('Queue is empty');
      return;
    }

    console.log(`Processing queue: ${items.length} items`);
    clearQueue();
    for (const item of items) {
      if (item.type === "text" && item.data) {
        console.log('Sending queued text:', item.data.substring(0, 50));
        await sendTextNow(item.data);
      } else if (item.type === "file" && item.file) {
        console.log('Sending queued file:', item.file.name);
        await sendFileNow(item.file);
      }
    }
    console.log('Queue processed ✓');
  };

  const handleDataMessage = async (msg: any) => {
    if (msg.type === 'text' && msg.data) {
      await handleTextMessage(msg.data);
    } else if (msg.type === 'file-meta' && msg.fileName) {
      fileTransferRef.current = {
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileType: msg.fileType,
        chunks: [],
        received: 0,
        total: msg.fileSize,
        hash: msg.hash
      };
      setReceiveProgress({ fileName: msg.fileName, progress: 0 });
    } else if (msg.type === 'file-complete') {
      await completeFileTransfer();
    }
  };

  const handleTextMessage = async (encryptedData: string) => {
    if (!sharedKeyRef.current) {
      console.error('Cannot decrypt text: no shared key');
      return;
    }
    
    try {
      console.log('Decrypting received text message...');
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const decrypted = await decryptData(encryptedBuffer.buffer, sharedKeyRef.current);
      const text = new TextDecoder().decode(decrypted);
      console.log('Text decrypted successfully:', text.substring(0, 50));
      setMessages(prev => [...prev, { 
        type: "text", 
        content: text, 
        from: "peer",
        timestamp: Date.now()
      }]);
    } catch (e) {
      console.error("Text decryption failed:", e);
      setStatus('Decryption error');
    }
  };

  const handleBinaryChunk = async (data: ArrayBuffer) => {
    if (!fileTransferRef.current || !sharedKeyRef.current) {
      console.log('Received binary chunk but no file transfer in progress or no key');
      return;
    }

    try {
      console.log(`Received chunk: ${data.byteLength} bytes encrypted`);
      const decrypted = await decryptData(data, sharedKeyRef.current);
      console.log(`Decrypted to: ${decrypted.byteLength} bytes`);
      fileTransferRef.current.chunks.push(decrypted);
      fileTransferRef.current.received += decrypted.byteLength;

      const progress = Math.round((fileTransferRef.current.received / fileTransferRef.current.total) * 100);
      console.log(`File progress: ${progress}% (${fileTransferRef.current.received}/${fileTransferRef.current.total})`);
      setReceiveProgress({ 
        fileName: fileTransferRef.current.fileName, 
        progress 
      });
    } catch (e) {
      console.error("Chunk decryption failed:", e);
    }
  };

  const handleBinaryFrame = async (data: Blob | ArrayBuffer | ArrayBufferView) => {
    let buffer: ArrayBuffer;
    if (data instanceof ArrayBuffer) {
      buffer = data;
    } else if (ArrayBuffer.isView(data)) {
      buffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength,
      ) as ArrayBuffer;
    } else if (typeof Blob !== "undefined" && data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      console.error("Unknown binary frame type", data);
      return;
    }
    await handleBinaryChunk(buffer);
  };

  const completeFileTransfer = async () => {
    if (!fileTransferRef.current) {
      console.error('completeFileTransfer called but no transfer in progress!');
      return;
    }

    // Snapshot before clearing the ref — React state updaters may run later.
    const transfer = fileTransferRef.current;
    fileTransferRef.current = null;
    setReceiveProgress(null);

    console.log(`Completing file transfer: ${transfer.fileName}`);
    console.log(`Total chunks received: ${transfer.chunks.length}`);
    const blob = new Blob(transfer.chunks, { type: transfer.fileType || "application/octet-stream" });

    setReceivedFiles(prev => [...prev, {
      fileName: transfer.fileName,
      fileSize: transfer.fileSize,
      fileType: transfer.fileType,
      blob,
      timestamp: Date.now()
    }]);

    setMessages(prev => [...prev, {
      type: "file-complete",
      content: transfer.fileName,
      from: "peer",
      timestamp: Date.now()
    }]);
  };

  const queueText = () => {
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput("");

    if (transportReadyRef.current && sharedKeyRef.current) {
      void sendTextNow(text);
    } else {
      enqueueItem({ type: "text", data: text });
      setMessages(prev => [...prev, {
        type: "text",
        content: text + " (queued)",
        from: "you",
        timestamp: Date.now()
      }]);
    }
  };

  const sendTextNow = async (text: string) => {
    if (!sharedKeyRef.current) {
      console.error('Cannot send text: no shared key');
      return;
    }

    // Optimistic local append — server does not echo back to the sender.
    setMessages(prev => {
      const queuedIdx = prev.findIndex(
        (m) => m.from === "you" && m.content === text + " (queued)",
      );
      if (queuedIdx >= 0) {
        return prev.map((m, i) =>
          i === queuedIdx ? { ...m, content: text } : m,
        );
      }
      return [
        ...prev,
        {
          type: "text" as const,
          content: text,
          from: "you" as const,
          timestamp: Date.now(),
        },
      ];
    });

    try {
      console.log('Sending text via', dataChannelRef.current?.readyState === 'open' ? 'DataChannel' : 'WebSocket');
      const textData = new TextEncoder().encode(text);
      const encrypted = await encryptData(textData.buffer, sharedKeyRef.current);
      const encryptedString = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
      const msg = JSON.stringify({ type: 'text', data: encryptedString });

      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        dataChannelRef.current.send(msg);
        console.log('Text sent via DataChannel');
      } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(msg);
        console.log('Text sent via WebSocket');
      } else {
        console.error('No open transport to send text');
        setStatus('Send failed: not connected');
      }
    } catch (e) {
      console.error("Send text failed:", e);
    }
  };

  const queueFile = (file: File) => {
    if (transportReadyRef.current && sharedKeyRef.current) {
      void sendFileNow(file);
    } else {
      enqueueItem({ type: "file", file });
      setMessages(prev => [...prev, {
        type: "file-start",
        content: `${file.name} (queued)`,
        from: "you",
        timestamp: Date.now()
      }]);
    }
  };

  const sendFileNow = async (file: File) => {
    if (!sharedKeyRef.current) {
      console.error('Cannot send file: no shared key');
      return;
    }

    const relay = usingRelayRef.current;
    console.log(`Sending file ${file.name} (${file.size} bytes) via ${relay ? 'relay' : 'P2P'}`);
    setSendProgress({ fileName: file.name, progress: 0 });

    const fileData = await file.arrayBuffer();
    const fileHash = await hashData(fileData);

    const metaMsg = JSON.stringify({
      type: 'file-meta',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hash: fileHash
    });

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(metaMsg);
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(metaMsg);
    }

    let offset = 0;
    const CHUNK_SIZE = relay ? 64 * 1024 : 128 * 1024; // 64KB for relay, 128KB for P2P

    const sendNextChunk = async () => {
      if (offset >= file.size) {
        const completeMsg = JSON.stringify({ type: 'file-complete' });
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          dataChannelRef.current.send(completeMsg);
        } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(completeMsg);
        }

        setMessages(prev => {
          const queuedIdx = prev.findIndex(
            (m) => m.from === "you" && m.content === `${file.name} (queued)`,
          );
          if (queuedIdx >= 0) {
            return prev.map((m, i) =>
              i === queuedIdx
                ? { ...m, content: file.name, type: "file-complete" as const }
                : m,
            );
          }
          if (prev.some((m) => m.from === "you" && m.content === file.name)) {
            return prev;
          }
          return [
            ...prev,
            {
              type: "file-complete" as const,
              content: file.name,
              from: "you" as const,
              timestamp: Date.now(),
            },
          ];
        });

        setSendProgress(null);
        return;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const chunkData = await chunk.arrayBuffer();
      const encrypted = await encryptData(chunkData, sharedKeyRef.current!);

      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        dataChannelRef.current.send(encrypted);
        console.log(`Sent chunk ${Math.floor(offset / CHUNK_SIZE) + 1} via DataChannel`);
      } else if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(encrypted);
        console.log(`Sent chunk ${Math.floor(offset / CHUNK_SIZE) + 1} via WebSocket`);
      }

      offset += CHUNK_SIZE;
      const progress = Math.round((offset / file.size) * 100);
      setSendProgress({ fileName: file.name, progress: Math.min(progress, 100) });

      const delay = relay ? 100 : 10;
      setTimeout(sendNextChunk, delay);
    };

    sendNextChunk();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      queueFile(files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      queueFile(files[0]);
    }
  };

  const downloadFile = (file: ReceivedFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mode) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Secure File & Text Share</h1>
            <p className="text-slate-600 dark:text-slate-400">
              End-to-end encrypted • No server storage
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={startSending}
              className="p-8 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-full bg-indigo-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PaperAirplaneIcon className="size-8" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Send</p>
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
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Receive</p>
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
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-16 text-center text-3xl tracking-widest"
              maxLength={6}
              autoFocus
            />
            <Button 
              onClick={() => joinRoom()} 
              disabled={inputCode.length !== 6}
              className="w-full h-12 text-lg"
            >
              Join
            </Button>
            <Button 
              onClick={() => setMode(null)}
              variant="ghost"
              className="w-full"
            >
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
        {/* Header with code and status */}
        <div className="mb-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-slate-600 dark:text-slate-400">Room Code</p>
              <p className="text-3xl font-bold tracking-widest">{roomCode}</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              connected 
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
            }`}>
              {status}
            </div>
          </div>

          {mode === "send" && qrUrl && (
            <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">Scan to join:</p>
              <div className="flex justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                  alt="QR Code"
                  className="w-40 h-40"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Send panel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Send</h3>
            
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full min-h-[100px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    queueText();
                  }
                }}
              />
              <Button onClick={queueText} disabled={!textInput.trim()} className="w-full">
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Send Text
              </Button>
            </div>

            <div 
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/40 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <DocumentArrowDownIcon className="h-12 w-12 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium">Click or drag file here</p>
              <p className="text-xs text-slate-500 mt-1">Encrypted end-to-end</p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
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

          {/* Receive panel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Received</h3>

            {messages.length > 0 && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-h-64 overflow-y-auto space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${
                    msg.from === "you"
                      ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  }`}>
                    <p className="text-xs opacity-60 mb-1">{msg.from === "you" ? "You" : "Peer"}</p>
                    <p className="break-words">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {receiveProgress && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-medium mb-2">{receiveProgress.fileName}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${receiveProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-right mt-1">{receiveProgress.progress}%</p>
              </div>
            )}

            {receivedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Files</Label>
                {receivedFiles.map((file, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-500">{(file.fileSize / 1024).toFixed(1)} KB</p>
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
    <Suspense fallback={
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <SharePageContent />
    </Suspense>
  );
}
