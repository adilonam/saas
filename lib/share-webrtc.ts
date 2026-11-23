/** Share room helpers — encrypted WebSocket transport to FastAPI. */

export const DEFAULT_SHARE_WS_BASE =
  "wss://saas-backend-326a81a69453.herokuapp.com/ws/share/ws";

/** Max transferable file size: 20 GB. */
export const MAX_FILE_SIZE = 20 * 1024 * 1024 * 1024;

/** Read/send slice size — keep plaintext+AES overhead under typical WS frame budgets. */
export const FILE_CHUNK_SIZE = 64 * 1024;

/** Pause sending while the socket has more than this buffered. */
export const WS_HIGH_WATER = 4 * 1024 * 1024;

/** Prefer in-memory receive below this size when File System Access is unavailable. */
export const MEMORY_RECEIVE_MAX = 200 * 1024 * 1024;

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

export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const digits = i === 0 ? 0 : i === 1 ? 1 : 2;
  return `${v.toFixed(digits)} ${units[i]}`;
}

/** Wait until WebSocket send buffer drains below high-water mark. */
export async function waitForWsBufferedAmount(
  ws: WebSocket,
  highWater = WS_HIGH_WATER,
  timeoutMs = 120_000,
): Promise<void> {
  const started = Date.now();
  while (ws.readyState === WebSocket.OPEN && ws.bufferedAmount > highWater) {
    if (Date.now() - started > timeoutMs) {
      throw new Error("Send buffer stuck (backpressure timeout)");
    }
    await new Promise((r) => setTimeout(r, 40));
  }
  if (ws.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket closed during send");
  }
}

export function supportsSaveFilePicker(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as unknown as { showSaveFilePicker?: unknown })
      .showSaveFilePicker === "function"
  );
}
