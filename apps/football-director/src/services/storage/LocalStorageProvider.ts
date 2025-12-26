/**
 * LocalStorage Provider with Compression
 * Stores saves in browser localStorage with LZ-String compression
 */

import { SaveSlot, SaveMetadata } from '@playground/football-director-engine';
import { StorageProvider, StorageInfo } from './types';
import { compress, decompress } from './compression';

const SAVES_KEY = 'football-director-saves-v2'; // v2 indicates compressed format

export interface CompressedSaveContainer {
  [slotId: number]: string; // Compressed SaveSlot
}

/**
 * LocalStorage implementation with compression
 */
export class LocalStorageProvider implements StorageProvider {
  /**
   * Get all compressed saves from localStorage
   */
  private getAllCompressed(): CompressedSaveContainer {
    try {
      const serialized = localStorage.getItem(SAVES_KEY);
      if (!serialized || serialized.trim() === '') {
        return {};
      }

      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to load compressed saves:', error);
      return {};
    }
  }

  /**
   * Save all compressed saves to localStorage
   */
  private saveAllCompressed(container: CompressedSaveContainer): void {
    localStorage.setItem(SAVES_KEY, JSON.stringify(container));
  }

  /**
   * Save a game to localStorage (compressed)
   */
  async save(slotId: number, slot: SaveSlot): Promise<void> {
    try {
      const container = this.getAllCompressed();
      const compressed = compress(slot);
      container[slotId] = compressed;
      this.saveAllCompressed(container);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error(`Failed to save to slot ${slotId}`);
    }
  }

  /**
   * Load a game from localStorage (decompress)
   */
  async load(slotId: number): Promise<SaveSlot | null> {
    try {
      const container = this.getAllCompressed();
      const compressed = container[slotId];

      if (!compressed) return null;

      const slot = decompress<SaveSlot>(compressed);
      if (!slot) return null;

      // Convert date strings back to Date objects
      slot.metadata.createdAt = new Date(slot.metadata.createdAt);
      slot.metadata.lastSaved = new Date(slot.metadata.lastSaved);
      slot.gameState.createdAt = new Date(slot.gameState.createdAt);
      slot.gameState.lastSaved = new Date(slot.gameState.lastSaved);

      // Convert transaction dates
      slot.gameState.finances.transactions = slot.gameState.finances.transactions.map(
        (t) => ({
          ...t,
          date: new Date(t.date),
        })
      );

      return slot;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  /**
   * Delete a save slot
   */
  async delete(slotId: number): Promise<void> {
    const container = this.getAllCompressed();
    delete container[slotId];
    this.saveAllCompressed(container);
  }

  /**
   * List all save metadata
   */
  async listAll(): Promise<SaveMetadata[]> {
    const container = this.getAllCompressed();
    const metadata: SaveMetadata[] = [];

    for (const slotId in container) {
      const slot = await this.load(parseInt(slotId));
      if (slot) {
        metadata.push(slot.metadata);
      }
    }

    return metadata;
  }

  /**
   * Check if a slot exists
   */
  async exists(slotId: number): Promise<boolean> {
    const container = this.getAllCompressed();
    return container[slotId] !== undefined;
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    // Calculate localStorage usage
    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // localStorage quota is typically 5-10MB
    const quota = 10 * 1024 * 1024; // Assume 10MB
    const available = quota - used;
    const percentage = (used / quota) * 100;

    return {
      used: used * 2, // UTF-16 = 2 bytes per char
      available: available * 2,
      quota: quota * 2,
      percentage,
    };
  }

  /**
   * Clear all saves (for testing/debugging)
   */
  clear(): void {
    localStorage.removeItem(SAVES_KEY);
  }
}
