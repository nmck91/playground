/**
 * Storage Provider Types
 * Defines interfaces for different storage backends
 */

import { SaveSlot, SaveMetadata } from '@playground/football-director-engine';

/**
 * Generic storage provider interface
 * Implementations: LocalStorageProvider, IndexedDBProvider
 */
export interface StorageProvider {
  /**
   * Save a game to a specific slot
   */
  save(slotId: number, slot: SaveSlot): Promise<void>;

  /**
   * Load a game from a specific slot
   */
  load(slotId: number): Promise<SaveSlot | null>;

  /**
   * Delete a specific save slot
   */
  delete(slotId: number): Promise<void>;

  /**
   * Get all save metadata (without loading full game states)
   */
  listAll(): Promise<SaveMetadata[]>;

  /**
   * Check if a slot exists
   */
  exists(slotId: number): Promise<boolean>;

  /**
   * Get storage usage information
   */
  getStorageInfo(): Promise<StorageInfo>;
}

/**
 * Storage usage information
 */
export interface StorageInfo {
  used: number; // Bytes used
  available: number; // Bytes available
  quota: number; // Total quota in bytes
  percentage: number; // Percentage used (0-100)
}

/**
 * Storage version for migration
 */
export interface StorageVersion {
  version: 1 | 2 | 3; // 1: uncompressed localStorage, 2: compressed localStorage, 3: hybrid
  compressed: boolean;
  storageType: 'localStorage' | 'indexedDB' | 'hybrid';
}
