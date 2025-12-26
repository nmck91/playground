/**
 * Hybrid Storage Service
 * Active slot → localStorage (compressed, fast access)
 * Inactive slots → IndexedDB (large capacity, no localStorage quota used)
 */

import { SaveSlot, SaveMetadata } from '@playground/football-director-engine';
import { StorageProvider, StorageInfo } from './types';
import { LocalStorageProvider } from './LocalStorageProvider';
import { IndexedDBProvider } from './IndexedDBProvider';

const ACTIVE_SLOT_KEY = 'football-director-active-slot';

/**
 * Hybrid storage implementation
 * Uses localStorage for active slot, IndexedDB for inactive slots
 */
export class HybridStorageService implements StorageProvider {
  private localStorageProvider: LocalStorageProvider;
  private indexedDBProvider: IndexedDBProvider;

  constructor() {
    this.localStorageProvider = new LocalStorageProvider();
    this.indexedDBProvider = new IndexedDBProvider();
  }

  /**
   * Get the currently active slot ID
   */
  getActiveSlot(): number | null {
    try {
      const slotId = localStorage.getItem(ACTIVE_SLOT_KEY);
      return slotId ? parseInt(slotId, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set the active slot ID
   */
  setActiveSlot(slotId: number): void {
    localStorage.setItem(ACTIVE_SLOT_KEY, slotId.toString());
  }

  /**
   * Get the appropriate provider for a slot
   */
  private getProvider(slotId: number): StorageProvider {
    const activeSlot = this.getActiveSlot();
    return slotId === activeSlot
      ? this.localStorageProvider
      : this.indexedDBProvider;
  }

  /**
   * Save a game to the appropriate storage
   */
  async save(slotId: number, slot: SaveSlot): Promise<void> {
    const activeSlot = this.getActiveSlot();

    if (slotId === activeSlot) {
      // Save to localStorage (active slot)
      await this.localStorageProvider.save(slotId, slot);

      // Also save to IndexedDB as backup
      await this.indexedDBProvider.save(slotId, slot);
    } else {
      // Save to IndexedDB only (inactive slot)
      await this.indexedDBProvider.save(slotId, slot);

      // Remove from localStorage if it exists there
      try {
        await this.localStorageProvider.delete(slotId);
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Load a game from the appropriate storage
   */
  async load(slotId: number): Promise<SaveSlot | null> {
    const provider = this.getProvider(slotId);
    const slot = await provider.load(slotId);

    // If loading from IndexedDB failed, try localStorage as fallback
    if (!slot && provider === this.indexedDBProvider) {
      return await this.localStorageProvider.load(slotId);
    }

    return slot;
  }

  /**
   * Delete a save slot from all storage locations
   */
  async delete(slotId: number): Promise<void> {
    // Delete from both providers to ensure cleanup
    await Promise.all([
      this.localStorageProvider.delete(slotId),
      this.indexedDBProvider.delete(slotId),
    ]);

    // Clear active slot if this was it
    if (this.getActiveSlot() === slotId) {
      localStorage.removeItem(ACTIVE_SLOT_KEY);
    }
  }

  /**
   * List all save metadata from both storage locations
   */
  async listAll(): Promise<SaveMetadata[]> {
    // Get metadata from both providers
    const [localMetadata, indexedDBMetadata] = await Promise.all([
      this.localStorageProvider.listAll(),
      this.indexedDBProvider.listAll(),
    ]);

    // Merge and deduplicate by slot ID (prefer newer)
    const metadataMap = new Map<number, SaveMetadata>();

    [...localMetadata, ...indexedDBMetadata].forEach((metadata) => {
      const existing = metadataMap.get(metadata.slotId);
      if (
        !existing ||
        new Date(metadata.lastSaved) > new Date(existing.lastSaved)
      ) {
        metadataMap.set(metadata.slotId, metadata);
      }
    });

    return Array.from(metadataMap.values()).sort((a, b) => a.slotId - b.slotId);
  }

  /**
   * Check if a slot exists in either storage
   */
  async exists(slotId: number): Promise<boolean> {
    const [localExists, indexedDBExists] = await Promise.all([
      this.localStorageProvider.exists(slotId),
      this.indexedDBProvider.exists(slotId),
    ]);
    return localExists || indexedDBExists;
  }

  /**
   * Get combined storage usage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    const [localInfo, indexedDBInfo] = await Promise.all([
      this.localStorageProvider.getStorageInfo(),
      this.indexedDBProvider.getStorageInfo(),
    ]);

    return {
      used: localInfo.used + indexedDBInfo.used,
      available: localInfo.available + indexedDBInfo.available,
      quota: localInfo.quota + indexedDBInfo.quota,
      percentage:
        ((localInfo.used + indexedDBInfo.used) /
          (localInfo.quota + indexedDBInfo.quota)) *
        100,
    };
  }

  /**
   * Switch active slot (moves saves between storage providers)
   */
  async switchActiveSlot(newSlotId: number): Promise<void> {
    const currentActiveSlot = this.getActiveSlot();

    if (currentActiveSlot === newSlotId) return;

    // Move current active slot from localStorage to IndexedDB
    if (currentActiveSlot !== null) {
      const currentSlot = await this.localStorageProvider.load(currentActiveSlot);
      if (currentSlot) {
        await this.indexedDBProvider.save(currentActiveSlot, currentSlot);
        await this.localStorageProvider.delete(currentActiveSlot);
      }
    }

    // Move new active slot from IndexedDB to localStorage
    const newSlot = await this.indexedDBProvider.load(newSlotId);
    if (newSlot) {
      await this.localStorageProvider.save(newSlotId, newSlot);
      // Keep in IndexedDB as backup
    }

    // Update active slot reference
    this.setActiveSlot(newSlotId);
  }

  /**
   * Migrate all saves from old localStorage to hybrid storage
   */
  async migrateFromLegacyStorage(
    legacySaves: { [slotId: number]: SaveSlot }
  ): Promise<void> {
    const activeSlot = this.getActiveSlot() || 1;

    for (const [slotIdStr, slot] of Object.entries(legacySaves)) {
      const slotId = parseInt(slotIdStr);

      if (slotId === activeSlot) {
        // Active slot → localStorage + IndexedDB
        await this.localStorageProvider.save(slotId, slot);
        await this.indexedDBProvider.save(slotId, slot);
      } else {
        // Inactive slots → IndexedDB only
        await this.indexedDBProvider.save(slotId, slot);
      }
    }

    console.log(`Migrated ${Object.keys(legacySaves).length} saves to hybrid storage`);
  }
}
