/**
 * Compression utilities using LZ-String
 */

import LZString from 'lz-string';

/**
 * Compress data to string (for localStorage)
 */
export function compress(data: unknown): string {
  const json = JSON.stringify(data);
  return LZString.compress(json);
}

/**
 * Decompress string to data
 * Handles both compressed and uncompressed data for backward compatibility
 */
export function decompress<T>(compressed: string): T | null {
  try {
    // Try to decompress first
    const decompressed = LZString.decompress(compressed);
    if (decompressed) {
      return JSON.parse(decompressed) as T;
    }

    // Fallback: try parsing as uncompressed JSON (for legacy saves)
    return JSON.parse(compressed) as T;
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return null;
  }
}

/**
 * Calculate compression ratio (for debugging/monitoring)
 */
export function getCompressionRatio(original: unknown, compressed: string): number {
  const originalSize = JSON.stringify(original).length;
  const compressedSize = compressed.length;
  return ((originalSize - compressedSize) / originalSize) * 100;
}

/**
 * Get size of data in bytes
 */
export function getByteSize(data: unknown): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
