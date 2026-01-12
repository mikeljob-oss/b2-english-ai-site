import crypto from "crypto";
function getKey(): Buffer {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("APP_SECRET is missing or too short. Set it in your environment.");
  }
  // Derive 32-byte key via SHA-256
  return crypto.createHash("sha256").update(secret, "utf8").digest();
}
export function encryptJson(payload: unknown): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const packed = {
    v: 1,
    iv: iv.toString("base64url"),
    ct: ciphertext.toString("base64url"),
    tag: tag.toString("base64url")
  };
  return Buffer.from(JSON.stringify(packed), "utf8").toString("base64url");
}
export function decryptJson<T = any>(token: string): T {
  const key = getKey();
  const raw = Buffer.from(token, "base64url").toString("utf8");
  const packed = JSON.parse(raw) as { v: number; iv: string; ct: string; tag: string };
  if (!packed || packed.v !== 1) throw new Error("Invalid token version");
  const iv = Buffer.from(packed.iv, "base64url");
  const ct = Buffer.from(packed.ct, "base64url");
  const tag = Buffer.from(packed.tag, "base64url");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
