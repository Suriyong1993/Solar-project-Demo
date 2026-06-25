/**
 * Tuya HMAC-SHA256 signing utilities (fully async, isomorphic)
 *
 *  ใช้ Web Crypto API (SubtleCrypto) ได้ทั้งใน browser และ Node.js
 *  ไม่มี sync path แล้ว — ทุกฟังก์ชันคืน Promise
 */

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCrypto(): Crypto {
  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto;
  }
  if (typeof process !== "undefined" && process.versions?.node) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { webcrypto } = require("crypto");
    return webcrypto as Crypto;
  }
  throw new Error("[TuyaCrypto] No crypto implementation available");
}

const encoder = new TextEncoder();

/** SHA-256 hash → lowercase hex string (async) */
export async function sha256(data: string): Promise<string> {
  const buf = await getCrypto().subtle.digest("SHA-256", encoder.encode(data));
  return hex(buf);
}

/** HMAC-SHA256 → uppercase hex string (async) */
export async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await getCrypto().subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await getCrypto().subtle.sign("HMAC", key, encoder.encode(message));
  return hex(sig).toUpperCase();
}
