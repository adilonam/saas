/** ECDH + AES-GCM helpers for Share relay mode (legacy WS path). */

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"],
  );
}

export async function deriveSharedKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

export async function importPublicKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
}

export async function encryptData(
  data: ArrayBuffer,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  return result.buffer;
}

export async function decryptData(
  data: ArrayBuffer,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  const dataView = new Uint8Array(data);
  const iv = dataView.slice(0, 12);
  const encrypted = dataView.slice(12);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
}

export async function hashData(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}

export function bufferToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

export function base64ToBuffer(b64: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return bytes.buffer;
}

export async function normalizeBinaryFrame(
  data: Blob | ArrayBuffer | ArrayBufferView,
): Promise<ArrayBuffer | null> {
  if (data instanceof ArrayBuffer) return data;
  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
  }
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return data.arrayBuffer();
  }
  return null;
}
