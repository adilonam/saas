/** WebRTC Share — signaling helpers (browser ↔ FastAPI signal socket only). */

export const DEFAULT_SIGNAL_BASE =
  "wss://saas-backend-326a81a69453.herokuapp.com/ws/share/signal";

export const DEFAULT_ICE_URL =
  "https://saas-backend-326a81a69453.herokuapp.com/api/share/ice-servers";

export const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export const FILE_CHUNK_SIZE = 64 * 1024;
export const DC_HIGH_WATER = 512 * 1024;
export const DC_LOW_WATER = 128 * 1024;
export const CONNECT_TIMEOUT_MS = 25000;

export type SignalInbound =
  | { type: "joined"; peer_id: string; initiator: boolean }
  | { type: "peer-joined"; peer_id: string }
  | { type: "peer-left"; peer_id: string }
  | { type: "error"; message: string }
  | { type: "ping" }
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | {
      type: "ice-candidate";
      candidate: string | null;
      sdpMid?: string | null;
      sdpMLineIndex?: number | null;
    };

export type AppDataMessage =
  | { type: "text"; data: string }
  | {
      type: "file-meta";
      fileName: string;
      fileSize: number;
      fileType: string;
    }
  | { type: "file-complete" };

export function getSignalUrl(roomId: string): string {
  const raw =
    process.env.NEXT_PUBLIC_SHARE_SIGNAL_URL ||
    process.env.NEXT_PUBLIC_SHARE_WS_URL ||
    DEFAULT_SIGNAL_BASE;
  // Accept either .../signal or a full .../signal/ template; strip legacy /ws suffix.
  let base = raw.replace(/\/$/, "");
  if (base.endsWith("/ws/share/ws")) {
    base = base.replace(/\/ws\/share\/ws$/, "/ws/share/signal");
  }
  if (!base.includes("/ws/share/signal")) {
    // If env points at host root, append path
    if (base.startsWith("ws")) {
      base = `${base}/ws/share/signal`;
    }
  }
  return `${base}/${encodeURIComponent(roomId)}`;
}

export function getIceServersUrl(): string {
  const signal =
    process.env.NEXT_PUBLIC_SHARE_SIGNAL_URL ||
    process.env.NEXT_PUBLIC_SHARE_WS_URL ||
    DEFAULT_SIGNAL_BASE;
  if (process.env.NEXT_PUBLIC_SHARE_ICE_URL) {
    return process.env.NEXT_PUBLIC_SHARE_ICE_URL;
  }
  // Derive https API URL from wss signal base when possible
  try {
    const u = new URL(signal.replace(/^ws/, "http"));
    return `${u.origin}/api/share/ice-servers`;
  } catch {
    return DEFAULT_ICE_URL;
  }
}

export async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetch(getIceServersUrl(), {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`ICE HTTP ${res.status}`);
    const data = (await res.json()) as { iceServers?: RTCIceServer[] };
    if (Array.isArray(data.iceServers) && data.iceServers.length > 0) {
      return data.iceServers;
    }
  } catch (e) {
    console.warn("Failed to fetch ICE servers, using Google STUN fallback", e);
  }
  return FALLBACK_ICE_SERVERS;
}

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Wait until DataChannel bufferedAmount drops below low-water mark. */
export function waitForBufferedAmountLow(
  channel: RTCDataChannel,
  highWater = DC_HIGH_WATER,
): Promise<void> {
  if (channel.bufferedAmount <= highWater) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = channel.bufferedAmountLowThreshold;
    channel.bufferedAmountLowThreshold = DC_LOW_WATER;
    const onLow = () => {
      if (channel.bufferedAmount <= highWater) {
        channel.removeEventListener("bufferedamountlow", onLow);
        channel.bufferedAmountLowThreshold = prev;
        resolve();
      }
    };
    channel.addEventListener("bufferedamountlow", onLow);
  });
}
