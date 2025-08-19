import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'default-secret-key';

export function encryptToken(token: string): string {
  return CryptoJS.AES.encrypt(token, ENCRYPTION_SECRET).toString();
}

export function decryptToken(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
