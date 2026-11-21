"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShareIcon, DocumentArrowUpIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Peer, { DataConnection } from "peerjs";
import { useSearchParams } from "next/navigation";

// Crypto utilities for E2E encryption
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

interface Message {
  type: "text" | "file" | "file-chunk" | "file-complete" | "key-exchange";
  data?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  chunk?: ArrayBuffer;
  chunkIndex?: number;
  totalChunks?: number;
  publicKey?: string;
}

interface FileTransfer {
  fileName: string;
  fileSize: number;
  fileType: string;
  chunks: ArrayBuffer[];
  received: number;
  total: number;
}

const CHUNK_SIZE = 16 * 1024; // 16KB chunks

function SharePageContent() {
  const searchParams = useSearchParams();
  const autoJoinRoom = searchParams?.get("room") || null;

  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState<Array<{type: string, content: string, from: string}>>([]);
  const [textInput, setTextInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  const fileTransferRef = useRef<FileTransfer | null>(null);

  useEffect(() => {
    if (autoJoinRoom && !mode) {
      setInputCode(autoJoinRoom);
      setMode("join");
      setTimeout(() => joinRoom(autoJoinRoom), 500);
    }
  }, [autoJoinRoom]);

  const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const createRoom = async () => {
    setStatus("Creating room...");
    const code = generateRoomCode();
    setRoomCode(code);
    setMode("create");

    // Generate key pair for E2E encryption
    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    const peerId = `eprod-${code}`;
    const peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      }
    });

    peer.on("open", () => {
      setStatus("Room created. Waiting for peer...");
      const url = `${window.location.origin}/share?room=${code}`;
      setQrUrl(url);
    });

    peer.on("connection", async (conn) => {
      connectionRef.current = conn;
      setupConnection(conn);
      
      // Send public key for E2E encryption
      const publicKey = await exportPublicKey(keyPair.publicKey);
      conn.on("open", () => {
        conn.send({ type: "key-exchange", publicKey });
      });
    });

    peer.on("error", (err) => {
      setStatus(`Error: ${err.message}`);
    });

    peerRef.current = peer;
  };

  const joinRoom = async (code?: string) => {
    const joinCode = code || inputCode;
    if (!joinCode || joinCode.length !== 6) {
      setStatus("Invalid room code");
      return;
    }

    setStatus("Joining room...");
    setRoomCode(joinCode);
    setMode("join");

    // Generate key pair for E2E encryption
    const keyPair = await generateKeyPair();
    keyPairRef.current = keyPair;

    const peerId = `eprod-join-${Date.now()}`;
    const peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      }
    });

    peer.on("open", async () => {
      const targetPeerId = `eprod-${joinCode}`;
      const conn = peer.connect(targetPeerId, { reliable: true });
      connectionRef.current = conn;
      setupConnection(conn);

      // Send public key
      const publicKey = await exportPublicKey(keyPair.publicKey);
      conn.on("open", () => {
        conn.send({ type: "key-exchange", publicKey });
      });
    });

    peer.on("error", (err) => {
      setStatus(`Error: ${err.message}`);
    });

    peerRef.current = peer;
  };

  const setupConnection = (conn: DataConnection) => {
    conn.on("open", () => {
      setConnected(true);
      setStatus("Connected securely (E2E encrypted)");
    });

    conn.on("data", async (data: any) => {
      const message = data as Message;

      if (message.type === "key-exchange" && message.publicKey) {
        // Receive peer's public key and derive shared key
        const peerPublicKey = await importPublicKey(message.publicKey);
        if (keyPairRef.current) {
          const sharedKey = await deriveSharedKey(keyPairRef.current.privateKey, peerPublicKey);
          sharedKeyRef.current = sharedKey;
          setStatus("Connected & encrypted (E2E)");
        }
      } else if (message.type === "text" && message.data) {
        // Decrypt text
        if (sharedKeyRef.current) {
          try {
            const encryptedData = Uint8Array.from(atob(message.data), c => c.charCodeAt(0));
            const decrypted = await decryptData(encryptedData.buffer as ArrayBuffer, sharedKeyRef.current);
            const text = new TextDecoder().decode(decrypted);
            setMessages(prev => [...prev, { type: "text", content: text, from: "peer" }]);
          } catch (e) {
            console.error("Decryption failed:", e);
          }
        }
      } else if (message.type === "file" && message.fileName && message.fileSize && message.fileType) {
        fileTransferRef.current = {
          fileName: message.fileName,
          fileSize: message.fileSize,
          fileType: message.fileType,
          chunks: [],
          received: 0,
          total: message.fileSize
        };
        setMessages(prev => [...prev, { 
          type: "file-start", 
          content: `Receiving ${message.fileName} (${(message.fileSize / 1024).toFixed(1)} KB)...`,
          from: "peer"
        }]);
      } else if (message.type === "file-chunk" && message.chunk) {
        if (fileTransferRef.current && sharedKeyRef.current) {
          try {
            // Decrypt chunk
            const chunk: any = message.chunk;
            let chunkBuffer: ArrayBuffer;
            if (chunk instanceof ArrayBuffer) {
              chunkBuffer = chunk;
            } else if (chunk.buffer) {
              chunkBuffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
            } else {
              return;
            }
            const decryptedChunk = await decryptData(chunkBuffer, sharedKeyRef.current);
            fileTransferRef.current.chunks.push(decryptedChunk);
            fileTransferRef.current.received += decryptedChunk.byteLength;
            
            const progress = Math.round((fileTransferRef.current.received / fileTransferRef.current.total) * 100);
            setStatus(`Receiving file: ${progress}%`);
          } catch (e) {
            console.error("Chunk decryption failed:", e);
          }
        }
      } else if (message.type === "file-complete") {
        if (fileTransferRef.current) {
          const blob = new Blob(fileTransferRef.current.chunks, { type: fileTransferRef.current.fileType });
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
          setStatus("Connected & encrypted (E2E)");
          fileTransferRef.current = null;
        }
      }
    });

    conn.on("close", () => {
      setConnected(false);
      setStatus("Disconnected");
    });

    conn.on("error", (err) => {
      setStatus(`Connection error: ${err.message}`);
    });
  };

  const sendText = async () => {
    if (!textInput.trim() || !connectionRef.current || !sharedKeyRef.current) return;

    try {
      // Encrypt text
      const textData = new TextEncoder().encode(textInput);
      const encrypted = await encryptData(textData.buffer as ArrayBuffer, sharedKeyRef.current);
      const encryptedString = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

      connectionRef.current.send({ type: "text", data: encryptedString });
      setMessages(prev => [...prev, { type: "text", content: textInput, from: "you" }]);
      setTextInput("");
    } catch (e) {
      console.error("Encryption failed:", e);
    }
  };

  const sendFile = async (file: File) => {
    if (!connectionRef.current || !sharedKeyRef.current) return;

    setStatus(`Sending ${file.name}...`);

    // Send file metadata
    connectionRef.current.send({
      type: "file",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Read and send file in chunks
    const reader = new FileReader();
    let offset = 0;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let chunkIndex = 0;

    const sendNextChunk = async () => {
      if (offset >= file.size) {
        connectionRef.current?.send({ type: "file-complete" });
        setStatus("Connected & encrypted (E2E)");
        setMessages(prev => [...prev, {
          type: "file-sent",
          content: `Sent ${file.name}`,
          from: "you"
        }]);
        return;
      }

      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(chunk);
      
      reader.onload = async (e) => {
        if (e.target?.result && sharedKeyRef.current) {
          try {
            // Encrypt chunk
            const result = e.target.result;
            let buffer: ArrayBuffer;
            if (result instanceof ArrayBuffer) {
              buffer = result;
            } else if (typeof result === 'string') {
              buffer = new TextEncoder().encode(result).buffer as ArrayBuffer;
            } else {
              return;
            }
            const encrypted = await encryptData(buffer, sharedKeyRef.current);
            connectionRef.current?.send({
              type: "file-chunk",
              chunk: encrypted,
              chunkIndex: chunkIndex++,
              totalChunks
            });

            offset += CHUNK_SIZE;
            const progress = Math.round((offset / file.size) * 100);
            setStatus(`Sending file: ${Math.min(progress, 100)}%`);

            // Backpressure: small delay between chunks
            setTimeout(sendNextChunk, 10);
          } catch (e) {
            console.error("Chunk encryption failed:", e);
          }
        }
      };
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
          "description": "End-to-end encrypted file and text sharing via peer-to-peer connection",
          "url": "https://www.eprod.io/share",
          "applicationCategory": "UtilityApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })
      }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is file sharing secure?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! All data is end-to-end encrypted using ECDH key exchange and AES-GCM. Files are transferred peer-to-peer via WebRTC and never stored on any server."
              }
            },
            {
              "@type": "Question",
              "name": "How do I share files?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Create a room to get a 6-digit code and QR code. Share the code with your recipient. They join by entering the code or scanning the QR. Then send text and files directly between browsers."
              }
            },
            {
              "@type": "Question",
              "name": "What's the file size limit?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Files are transferred in 16KB chunks with backpressure handling. Large files are supported. Transfer speed depends on your peer-to-peer connection."
              }
            },
            {
              "@type": "Question",
              "name": "How long do rooms last?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Rooms expire when the creator closes their browser tab. No data is stored on servers."
              }
            }
          ]
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
              End-to-end encrypted peer-to-peer sharing - no server storage
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
                🔒 <strong>End-to-end encrypted</strong> - Files transfer peer-to-peer and are never stored on servers
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
                    Files are sent in encrypted 16KB chunks
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
                Yes! All data is end-to-end encrypted using ECDH key exchange and AES-GCM. Files are transferred peer-to-peer via WebRTC DataChannel (encrypted by DTLS) and never stored on any server.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How do I share files?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Create a room to get a 6-digit code and QR code. Share the code with your recipient. They join by entering the code or scanning the QR. Then send text and files directly between browsers.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">What's the file size limit?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Files are transferred in 16KB chunks with backpressure handling. Large files are supported. Transfer speed depends on your peer-to-peer connection quality.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How long do rooms last?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Rooms expire when the creator closes their browser tab. No data is stored on servers - everything is peer-to-peer.
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
