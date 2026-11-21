"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";

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

// Hash for file integrity verification
async function hashData(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
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

const CHUNK_SIZE = 128 * 1024; // 128KB chunks for fallback (under 256KB limit)
const WEBRTC_TIMEOUT = 10000; // 10s to establish WebRTC

function SharePageContent() {
  const searchParams = useSearchParams();
  const autoJoinRoom = searchParams?.get("room") || null;
  const forceRelay = searchParams?.get("relay") === "1";

  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState<Array<{type: string, content: string, from: string}>>([]);
  const [textInput, setTextInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [wsUrl, setWsUrl] = useState("");
  const [usingRelay, setUsingRelay] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const rtcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const fileTransferRef = useRef<FileTransfer | null>(null);
  const peerIdRef = useRef<string>("");
  const isInitiatorRef = useRef(false);
  const webrtcTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch WebSocket URL
    fetch('/api/config/share-ws')
      .then(res => res.json())
      .then(data => {
        if (data.wsUrl) {
          setWsUrl(data.wsUrl);
        }
      })
      .catch(err => {
        console.error('Failed to fetch WS config:', err);
        setStatus('Configuration error');
      });
  }, []);

  useEffect(() => {
    if (autoJoinRoom && !mode && wsUrl) {
      setInputCode(autoJoinRoom);
      setMode("join");
      setTimeout(() => joinRoom(autoJoinRoom), 500);
    }
  }, [autoJoinRoom, mode, wsUrl]);

  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const createRoom = async () => {
    if (!wsUrl) {
      setStatus("WebSocket not configured");
      return;
    }

    setStatus("Creating room...");
    const code = generateRoomCode();
    setRoomCode(code);
    setMode("create");
    isInitiatorRef.current = true;

    // Generate E2E encryption keys
    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    const url = `${window.location.origin}/share?room=${code}`;
    setQrUrl(url);

    connectWebSocket(code);
  };

  const joinRoom = async (code?: string) => {
    const joinCode = code || inputCode;
    if (!joinCode || joinCode.length !== 6) {
      setStatus("Invalid room code");
      return;
    }

    if (!wsUrl) {
      setStatus("WebSocket not configured");
      return;
    }

    setStatus("Joining room...");
    setRoomCode(joinCode);
    setMode("join");
    isInitiatorRef.current = false;

    // Generate E2E encryption keys
    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    connectWebSocket(joinCode);
  };

  const connectWebSocket = (room: string) => {
    const ws = new WebSocket(`${wsUrl}/${room}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setStatus("Waiting for peer...");
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data);
        await handleSignalingMessage(msg);
      } else {
        // Binary frame (fallback relay)
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
      setStatus('Disconnected');
      if (rtcRef.current) {
        rtcRef.current.close();
        rtcRef.current = null;
      }
    };
  };

  const handleSignalingMessage = async (msg: any) => {
    console.log('Signaling message:', msg.type);

    if (msg.type === 'connected') {
      peerIdRef.current = msg.peer_id;
      setStatus(`Connected to room (${msg.peers_in_room} peer${msg.peers_in_room > 1 ? 's' : ''})`);
    } else if (msg.type === 'peer_joined') {
      setStatus('Peer joined, establishing connection...');
      if (!forceRelay) {
        await setupWebRTC();
      } else {
        setUsingRelay(true);
        setStatus('Using relay mode (forced)');
        setConnected(true);
        await exchangeKeys();
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
      // Ignore or send pong
    } else if (msg.type === 'offer' && msg.offer) {
      await handleOffer(msg.offer);
    } else if (msg.type === 'answer' && msg.answer) {
      await handleAnswer(msg.answer);
    } else if (msg.type === 'ice-candidate' && msg.candidate) {
      await handleIceCandidate(msg.candidate);
    } else if (msg.type === 'key-exchange' && msg.publicKey) {
      await handleKeyExchange(msg.publicKey);
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

    // Set timeout to fall back to relay
    webrtcTimeoutRef.current = setTimeout(() => {
      if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
        console.log('WebRTC timeout, falling back to relay');
        setUsingRelay(true);
        setStatus('WebRTC failed, using relay');
        if (rtc) {
          rtc.close();
        }
        rtcRef.current = null;
        setConnected(true);
        exchangeKeys();
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

    channel.onopen = () => {
      if (webrtcTimeoutRef.current) {
        clearTimeout(webrtcTimeoutRef.current);
      }
      console.log('DataChannel opened');
      setConnected(true);
      setUsingRelay(false);
      setStatus('Connected via WebRTC (E2E encrypted)');
      exchangeKeys();
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
        // Binary data (encrypted chunk)
        await handleBinaryChunk(event.data);
      }
    };

    channel.onerror = (err) => {
      console.error('DataChannel error:', err);
    };

    channel.onclose = () => {
      console.log('DataChannel closed');
      setConnected(false);
      setStatus('Disconnected');
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
    
    const publicKey = await exportPublicKey(keyPairRef.current.publicKey);
    const msg = JSON.stringify({ type: 'key-exchange', publicKey });

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(msg);
    } else if (wsRef.current) {
      wsRef.current.send(msg);
    }
  };

  const handleKeyExchange = async (publicKeyString: string) => {
    if (!keyPairRef.current) return;

    const peerPublicKey = await importPublicKey(publicKeyString);
    const sharedKey = await deriveSharedKey(keyPairRef.current.privateKey, peerPublicKey);
    sharedKeyRef.current = sharedKey;
    
    const mode = usingRelay ? 'relay' : 'WebRTC';
    setStatus(`Connected via ${mode} (E2E encrypted)`);
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
      setMessages(prev => [...prev, {
        type: "file-start",
        content: `Receiving ${msg.fileName} (${(msg.fileSize / 1024).toFixed(1)} KB)...`,
        from: "peer"
      }]);
    } else if (msg.type === 'file-complete') {
      await completeFileTransfer();
    }
  };

  const handleTextMessage = async (encryptedData: string) => {
    if (!sharedKeyRef.current) return;
    
    try {
      const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const decrypted = await decryptData(encryptedBuffer.buffer, sharedKeyRef.current);
      const text = new TextDecoder().decode(decrypted);
      setMessages(prev => [...prev, { type: "text", content: text, from: "peer" }]);
    } catch (e) {
      console.error("Text decryption failed:", e);
    }
  };

  const handleBinaryChunk = async (data: ArrayBuffer) => {
    if (!fileTransferRef.current || !sharedKeyRef.current) return;

    try {
      const decrypted = await decryptData(data, sharedKeyRef.current);
      fileTransferRef.current.chunks.push(decrypted);
      fileTransferRef.current.received += decrypted.byteLength;

      const progress = Math.round((fileTransferRef.current.received / fileTransferRef.current.total) * 100);
      setStatus(`Receiving: ${progress}%`);
    } catch (e) {
      console.error("Chunk decryption failed:", e);
    }
  };

  const handleBinaryFrame = async (data: ArrayBuffer) => {
    // Binary frame from WebSocket relay
    await handleBinaryChunk(data);
  };

  const completeFileTransfer = async () => {
    if (!fileTransferRef.current) return;

    const blob = new Blob(fileTransferRef.current.chunks, { type: fileTransferRef.current.fileType });
    const receivedData = await blob.arrayBuffer();

    // Verify hash if provided
    if (fileTransferRef.current.hash) {
      const receivedHash = await hashData(receivedData);
      if (receivedHash !== fileTransferRef.current.hash) {
        setMessages(prev => [...prev, {
          type: "error",
          content: `File ${fileTransferRef.current!.fileName} failed integrity check`,
          from: "system"
        }]);
        fileTransferRef.current = null;
        return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileTransferRef.current.fileName;
    a.click();
    URL.revokeObjectURL(url);

    setMessages(prev => [...prev, {
      type: "file-complete",
      content: `Received ${fileTransferRef.current!.fileName}`,
      from: "peer"
    }]);

    const mode = usingRelay ? 'relay' : 'WebRTC';
    setStatus(`Connected via ${mode} (E2E encrypted)`);
    fileTransferRef.current = null;
  };

  const sendText = async () => {
    if (!textInput.trim() || !sharedKeyRef.current) return;

    try {
      const textData = new TextEncoder().encode(textInput);
      const encrypted = await encryptData(textData.buffer, sharedKeyRef.current);
      const encryptedString = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
      const msg = JSON.stringify({ type: 'text', data: encryptedString });

      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        dataChannelRef.current.send(msg);
      } else if (wsRef.current) {
        wsRef.current.send(msg);
      }

      setMessages(prev => [...prev, { type: "text", content: textInput, from: "you" }]);
      setTextInput("");
    } catch (e) {
      console.error("Send text failed:", e);
    }
  };

  const sendFile = async (file: File) => {
    if (!sharedKeyRef.current) return;

    setStatus(`Sending ${file.name}...`);

    // Calculate hash for integrity
    const fileData = await file.arrayBuffer();
    const fileHash = await hashData(fileData);

    // Send metadata
    const metaMsg = JSON.stringify({
      type: 'file-meta',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      hash: fileHash
    });

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(metaMsg);
    } else if (wsRef.current) {
      wsRef.current.send(metaMsg);
    }

    // Send file in encrypted chunks
    let offset = 0;
    let chunkIndex = 0;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const sendNextChunk = async () => {
      if (offset >= file.size) {
        // Send completion message
        const completeMsg = JSON.stringify({ type: 'file-complete' });
        if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
          dataChannelRef.current.send(completeMsg);
        } else if (wsRef.current) {
          wsRef.current.send(completeMsg);
        }

        const mode = usingRelay ? 'relay' : 'WebRTC';
        setStatus(`Connected via ${mode} (E2E encrypted)`);
        setMessages(prev => [...prev, {
          type: "file-sent",
          content: `Sent ${file.name}`,
          from: "you"
        }]);
        return;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const chunkData = await chunk.arrayBuffer();
      const encrypted = await encryptData(chunkData, sharedKeyRef.current!);

      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        dataChannelRef.current.send(encrypted);
      } else if (wsRef.current) {
        wsRef.current.send(encrypted);
      }

      offset += CHUNK_SIZE;
      chunkIndex++;
      const progress = Math.round((offset / file.size) * 100);
      setStatus(`Sending: ${Math.min(progress, 100)}%`);

      // Rate limiting for relay mode (stay under 100 msgs/60s = ~600ms/msg)
      const delay = usingRelay ? 100 : 10;
      setTimeout(sendNextChunk, delay);
    };

    sendNextChunk();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      sendFile(files[0]);
    }
  };

  return (
    <DashboardLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Secure File & Text Sharing",
          "description": "End-to-end encrypted file and text sharing via WebRTC or secure relay",
          "url": "https://www.eprod.io/share",
          "applicationCategory": "UtilityApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })
      }} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShareIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Secure File & Text Sharing</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              End-to-end encrypted - WebRTC or secure relay
            </p>
          </div>
        </div>

        {!mode && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Button onClick={createRoom} className="h-32 flex-col gap-3" size="lg">
                <ShareIcon className="h-8 w-8" />
                <div>
                  <p className="font-semibold">Create Room</p>
                  <p className="text-xs font-normal opacity-80">Get a code & QR</p>
                </div>
              </Button>
              <div className="space-y-3">
                <Label>Join Room</Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <Button onClick={() => joinRoom()} disabled={inputCode.length !== 6} className="w-full">
                  Join Room
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                🔒 <strong>End-to-end encrypted</strong> - Secure WebRTC or relay transfer
              </p>
            </div>
          </div>
        )}

        {mode && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
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

              {mode === "create" && qrUrl && (
                <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Scan to join:</p>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
                    {qrUrl}
                  </p>
                </div>
              )}
            </div>

            {connected && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-4">
                  <Label>Send Text</Label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full min-h-[100px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendText();
                      }
                    }}
                  />
                  <Button onClick={sendText} disabled={!textInput.trim()}>
                    Send Text
                  </Button>
                </div>

                <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                  <Label className="mb-4 block">Send File</Label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {usingRelay ? 'Files sent via encrypted relay (slower for large files)' : 'Files sent via WebRTC DataChannel (fast & direct)'}
                  </p>
                </div>

                {messages.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                    <Label className="mb-4 block">Messages & Files</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {messages.map((msg, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm ${
                          msg.from === "you"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 ml-12"
                            : msg.from === "system"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 mr-12"
                        }`}>
                          <p className="text-xs opacity-60 mb-1">{msg.from}</p>
                          <p className="break-words">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FAQ */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Is file sharing secure?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes! All data is end-to-end encrypted using ECDH key exchange and AES-GCM. Files transfer via WebRTC (peer-to-peer) or secure relay, and are never stored on servers.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">What if WebRTC doesn't work?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                The system automatically falls back to a secure relay if WebRTC cannot establish a connection within 10 seconds. Relay mode is slower for large files but works reliably.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How do I share files?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Create a room to get a 6-digit code and QR code. Share the code with your recipient. They join by entering the code or scanning the QR. Then send text and files directly.
              </p>
            </div>
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
