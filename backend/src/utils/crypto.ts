import CryptoJS from 'crypto-js';

// Requires a 32-byte hex key in production for robust security
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'development_fallback_encryption_key_please_change';

export function encryptToken(text: string): string {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decryptToken(ciphertext: string): string {
  if (!ciphertext) return '';
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
