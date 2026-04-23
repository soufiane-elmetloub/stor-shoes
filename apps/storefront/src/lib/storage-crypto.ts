'use client';

// Simple XOR encryption for localStorage data
// Works on ALL browsers and environments (HTTP/HTTPS/localhost)
// NOTE: This provides obfuscation, not military-grade security

const STORAGE_KEY = process.env.NEXT_PUBLIC_STORAGE_SECRET || 'storshoes-secret-key-2024';

// Generate a device-specific ID (works everywhere)
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'default-device';
  let deviceId = localStorage.getItem('storshoes_device_id');
  if (!deviceId) {
    // Simple UUID generator (works in all browsers)
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('storshoes_device_id', deviceId);
  }
  return deviceId;
}

// Simple XOR encryption (works everywhere, no external deps)
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

// Base64 encode for safe storage
function toBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '';
  }
}

// Base64 decode
function fromBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

// Derive key from password + deviceId
function getKey(): string {
  const deviceId = getDeviceId();
  return STORAGE_KEY + deviceId;
}

// Encrypt data (synchronous, works everywhere)
export function encryptStorage<T>(data: T): string {
  const jsonStr = JSON.stringify(data);
  const key = getKey();
  const encrypted = xorEncrypt(jsonStr, key);
  return toBase64(encrypted);
}

// Decrypt data (synchronous, works everywhere)
export function decryptStorage<T>(encryptedData: string): T | null {
  try {
    const decoded = fromBase64(encryptedData);
    if (!decoded) return null;
    const key = getKey();
    const decrypted = xorEncrypt(decoded, key);
    return JSON.parse(decrypted) as T;
  } catch {
    // Fallback: try to parse as unencrypted (for migration)
    try {
      return JSON.parse(encryptedData) as T;
    } catch {
      return null;
    }
  }
}

// Check if data is encrypted (for testing/debugging)
export function isEncrypted(data: string): boolean {
  try {
    // Try to parse as plain JSON
    JSON.parse(data);
    return false; // If successful, it's NOT encrypted
  } catch {
    return true; // If fails, it MIGHT be encrypted
  }
}

// Get storage item with automatic decryption (synchronous)
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  return decryptStorage<T>(item);
}

// Set storage item with automatic encryption (synchronous)
export function setStorageItem<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  const encrypted = encryptStorage(data);
  localStorage.setItem(key, encrypted);
}

// Remove storage item
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// Debug helper: view raw storage (for testing)
export function viewRawStorage(key: string): { raw: string | null; isEncrypted: boolean } {
  if (typeof window === 'undefined') return { raw: null, isEncrypted: false };
  const raw = localStorage.getItem(key);
  return {
    raw,
    isEncrypted: raw ? isEncrypted(raw) : false,
  };
}
