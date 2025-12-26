/**
 * IndexedDB Storage Provider
 * Stores saves in browser IndexedDB (50MB-1GB+ capacity)
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SaveSlot, SaveMetadata } from '@playground/football-director-engine';
import { StorageProvider, StorageInfo } from './types';

/**
 * IndexedDB Schema
 */
interface SavesDB extends DBSchema {
  saves: {
    key: number;
    value: SaveSlot;
  };
  metadata: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'football-director-saves';
const DB_VERSION = 1;

/**
 * IndexedDB implementation of StorageProvider
 */
export class IndexedDBProvider implements StorageProvider {
  private db: IDBPDatabase<SavesDB> | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database (lazy initialization)
   */
  private async init(): Promise<void> {
    if (this.db) return;

    // Prevent multiple concurrent initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.db = await openDB<SavesDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('saves')) {
            db.createObjectStore('saves');
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata');
          }
        },
      });
    })();

    return this.initPromise;
  }

  /**
   * Save a game to IndexedDB
   */
  async save(slotId: number, slot: SaveSlot): Promise<void> {
    await this.init();
    await this.db!.put('saves', slot, slotId);
  }

  /**
   * Load a game from IndexedDB
   */
  async load(slotId: number): Promise<SaveSlot | null> {
    await this.init();
    const slot = await this.db!.get('saves', slotId);

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
  }

  /**
   * Delete a save slot from IndexedDB
   */
  async delete(slotId: number): Promise<void> {
    await this.init();
    await this.db!.delete('saves', slotId);
  }

  /**
   * List all save metadata
   */
  async listAll(): Promise<SaveMetadata[]> {
    await this.init();
    const saves = await this.db!.getAll('saves');
    return saves.map((slot) => ({
      ...slot.metadata,
      createdAt: new Date(slot.metadata.createdAt),
      lastSaved: new Date(slot.metadata.lastSaved),
    }));
  }

  /**
   * Check if a slot exists
   */
  async exists(slotId: number): Promise<boolean> {
    await this.init();
    const slot = await this.db!.get('saves', slotId);
    return slot !== undefined;
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    if (!navigator.storage || !navigator.storage.estimate) {
      // Fallback if Storage API not available
      return {
        used: 0,
        available: 50 * 1024 * 1024, // Assume 50MB
        quota: 50 * 1024 * 1024,
        percentage: 0,
      };
    }

    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 50 * 1024 * 1024;
    const available = quota - used;
    const percentage = (used / quota) * 100;

    return {
      used,
      available,
      quota,
      percentage,
    };
  }

  /**
   * Get metadata value
   */
  async getMetadata(key: string): Promise<unknown> {
    await this.init();
    return await this.db!.get('metadata', key);
  }

  /**
   * Set metadata value
   */
  async setMetadata(key: string, value: unknown): Promise<void> {
    await this.init();
    await this.db!.put('metadata', value, key);
  }

  /**
   * Clear all data (for testing/debugging)
   */
  async clear(): Promise<void> {
    await this.init();
    await this.db!.clear('saves');
    await this.db!.clear('metadata');
  }
}
