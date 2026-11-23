/** Share room helpers — encrypted WebSocket transport to FastAPI. */

export const DEFAULT_SHARE_WS_BASE =
  "wss://saas-backend-326a81a69453.herokuapp.com/ws/share/ws";

export const FILE_CHUNK_SIZE = 64 * 1024;
export const CONNECT_TIMEOUT_MS = 25000;

/**
 * Resolve the Share WebSocket URL for a room.
 * Prefers NEXT_PUBLIC_SHARE_WS_URL; remaps legacy /signal paths to /ws.
 */
export function getShareWsUrl(roomId: string): string {
  const raw = process.env.NEXT_PUBLIC_SHARE_WS_URL || DEFAULT_SHARE_WS_BASE;
  let base = raw.replace(/\/$/, "");
  if (base.endsWith("/ws/share/signal")) {
    base = base.replace(/\/ws\/share\/signal$/, "/ws/share/ws");
  }
  if (!base.includes("/ws/share/ws")) {
    if (base.startsWith("ws")) {
      base = `${base}/ws/share/ws`;
    }
  }
  return `${base}/${encodeURIComponent(roomId)}`;
}

export function generateRoomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
