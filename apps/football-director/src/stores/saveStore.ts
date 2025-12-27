/**
 * Football Director - Save Store
 * Save/load operations and save slot management
 *
 * Integrates with SaveService for localStorage operations.
 * Manages save slots, auto-save, and sync state.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SaveService, type SaveMetadata } from '../services/SaveService';
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import type { GameState } from '@playground/football-director-engine';

/**
 * Sync Status Type
 */
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'conflict';

/**
 * Save Store State Interface
 */
interface SaveStoreState {
  // Save metadata
  availableSlots: SaveMetadata[];
  currentSlot: number | null;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;

  // Sync state (future: backend sync)
  syncStatus: SyncStatus;
  lastSynced: Date | null;

  // Loading state
  isLoading: boolean;
  loadError: string | null;
}

/**
 * Save Store Actions Interface
 */
interface SaveStoreActions {
  // Save/Load operations
  loadGame: (slot?: number) => Promise<void>;
  saveGame: () => Promise<void>;
  newGame: (saveName: string) => Promise<void>;
  deleteSave: (slot: number) => Promise<void>;

  // Import/Export
  exportSave: (slot: number) => Promise<string | null>;
  importSave: (data: string, slot: number) => Promise<void>;

  // Auto-save
  setAutoSaveEnabled: (enabled: boolean) => void;
  autoSave: () => Promise<void>;

  // Slot management
  refreshAvailableSlots: () => Promise<void>;
  getSaveMetadata: (slot: number) => SaveMetadata | null;

  // State setters
  setCurrentSlot: (slot: number | null) => void;
  setLastSaved: (date: Date | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  resetSaveStore: () => void;
}

/**
 * Combined Save Store Type
 */
export type SaveStore = SaveStoreState & SaveStoreActions;

/**
 * Initial state
 */
const initialState: SaveStoreState = {
  availableSlots: [],
  currentSlot: null,
  lastSaved: null,
  autoSaveEnabled: true,
  syncStatus: 'synced',
  lastSynced: null,
  isLoading: false,
  loadError: null,
};

/**
 * Save Store
 *
 * Manages save/load operations, save slots, and auto-save functionality.
 * Integrates with SaveService for localStorage persistence.
 *
 * @example
 * ```typescript
 * // Load game from slot
 * const loadGame = useSaveStore(state => state.loadGame);
 * await loadGame(1);
 *
 * // Save current game
 * const saveGame = useSaveStore(state => state.saveGame);
 * await saveGame();
 *
 * // Create new game
 * const newGame = useSaveStore(state => state.newGame);
 * await newGame('My Save');
 * ```
 */
export const useSaveStore = create<SaveStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Load game from slot (or from active slot if no slot provided)
      loadGame: async (slot) => {
        const loadSlot = slot ?? SaveService.getActiveSlot() ?? undefined;
        if (loadSlot === undefined) {
          set({ loadError: 'No save slot specified' }, false, 'saveStore/loadGameError');
          return;
        }

        set({ isLoading: true, loadError: null }, false, 'saveStore/loadGameStart');
        useUIStore.getState().setLoading(true);

        try {
          // Load from SaveService
          const gameState = await SaveService.loadFromSlot(loadSlot);

          if (!gameState) {
            throw new Error('Failed to load game from slot');
          }

          // Update GameStore
          useGameStore.getState().setGameState(gameState);
          useGameStore.getState().setGameId(gameState.id);
          useGameStore.getState().setCurrentSaveSlot(loadSlot);
          useGameStore.getState().setLastSaved(new Date());

          // Update SaveStore
          set(
            {
              currentSlot: loadSlot,
              lastSaved: new Date(),
              isLoading: false,
              loadError: null,
            },
            false,
            'saveStore/loadGameSuccess'
          );

          // Refresh available slots
          get().refreshAvailableSlots();

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: 'Game loaded successfully',
            duration: 3000,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load game';
          set(
            { isLoading: false, loadError: errorMessage },
            false,
            'saveStore/loadGameError'
          );

          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      // Save current game
      saveGame: async () => {
        const gameState = useGameStore.getState().gameState;
        const currentSlot = get().currentSlot;

        // DEBUG: Check what gameState we got
        console.log('[SaveStore.saveGame] gameState:', gameState);
        console.log('[SaveStore.saveGame] gameState?.finances:', gameState?.finances);

        if (!gameState) {
          useUIStore.getState().addNotification({
            type: 'error',
            message: 'No game to save',
            duration: 3000,
          });
          return;
        }

        if (currentSlot === null) {
          useUIStore.getState().addNotification({
            type: 'error',
            message: 'No save slot selected',
            duration: 3000,
          });
          return;
        }

        set({ isLoading: true }, false, 'saveStore/saveGameStart');
        useUIStore.getState().setSaving(true);

        try {
          // Save via SaveService
          console.log('[SaveStore.saveGame] About to call SaveService.saveToSlot with finances:', gameState.finances);
          await SaveService.saveToSlot(currentSlot, gameState);

          // Update timestamps
          const now = new Date();
          set(
            { lastSaved: now, isLoading: false },
            false,
            'saveStore/saveGameSuccess'
          );
          useGameStore.getState().setLastSaved(now);

          // Refresh available slots
          get().refreshAvailableSlots();

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: 'Game saved successfully',
            duration: 2000,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save game';
          set({ isLoading: false }, false, 'saveStore/saveGameError');

          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
        } finally {
          useUIStore.getState().setSaving(false);
        }
      },

      // Create new game
      newGame: async (saveName) => {
        set({ isLoading: true, loadError: null }, false, 'saveStore/newGameStart');
        useUIStore.getState().setLoading(true);

        try {
          // Create new game via SaveService
          const { gameState, slotId } = await SaveService.createNewSave(saveName);

          // Update GameStore
          useGameStore.getState().setGameState(gameState);
          useGameStore.getState().setGameId(gameState.id);
          useGameStore.getState().setCurrentSaveSlot(slotId);
          useGameStore.getState().setLastSaved(new Date());

          // Update SaveStore
          const now = new Date();
          set(
            {
              currentSlot: slotId,
              lastSaved: now,
              isLoading: false,
              loadError: null,
            },
            false,
            'saveStore/newGameSuccess'
          );

          // Refresh available slots
          get().refreshAvailableSlots();

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: `New game "${saveName}" created!`,
            duration: 3000,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create new game';
          set(
            { isLoading: false, loadError: errorMessage },
            false,
            'saveStore/newGameError'
          );

          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
        } finally {
          useUIStore.getState().setLoading(false);
        }
      },

      // Delete save
      deleteSave: async (slot) => {
        set({ isLoading: true }, false, 'saveStore/deleteSaveStart');

        try {
          await SaveService.deleteSlot(slot);

          // If current save was deleted, reset game
          if (get().currentSlot === slot) {
            useGameStore.getState().resetGame();
            set({ currentSlot: null, lastSaved: null }, false, 'saveStore/currentSlotDeleted');
          }

          set({ isLoading: false }, false, 'saveStore/deleteSaveSuccess');

          // Refresh available slots
          get().refreshAvailableSlots();

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: 'Save deleted successfully',
            duration: 2000,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete save';
          set({ isLoading: false }, false, 'saveStore/deleteSaveError');

          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
        }
      },

      // Export save
      exportSave: async (slot) => {
        try {
          return await SaveService.exportSave(slot);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to export save';
          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
          return null;
        }
      },

      // Import save
      importSave: async (data, slot) => {
        set({ isLoading: true }, false, 'saveStore/importSaveStart');

        try {
          await SaveService.importSave(data, slot);

          set({ isLoading: false }, false, 'saveStore/importSaveSuccess');

          // Refresh available slots
          get().refreshAvailableSlots();

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: 'Save imported successfully',
            duration: 3000,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to import save';
          set({ isLoading: false }, false, 'saveStore/importSaveError');

          useUIStore.getState().addNotification({
            type: 'error',
            message: errorMessage,
            duration: 5000,
          });
        }
      },

      // Auto-save (only if enabled and game is loaded)
      autoSave: async () => {
        if (!get().autoSaveEnabled) return;
        if (!useGameStore.getState().gameState) return;
        if (get().currentSlot === null) return;

        // Silent save (no notifications)
        await get().saveGame();
      },

      // Set auto-save enabled
      setAutoSaveEnabled: (enabled) =>
        set(
          { autoSaveEnabled: enabled },
          false,
          'saveStore/setAutoSaveEnabled'
        ),

      // Refresh available slots
      refreshAvailableSlots: async () => {
        const metadata = await SaveService.getAllSaves();
        set({ availableSlots: metadata }, false, 'saveStore/refreshAvailableSlots');
      },

      // Get save metadata
      getSaveMetadata: (slot) => {
        const slots = get().availableSlots;
        return slots.find((s) => s.slotId === slot) ?? null;
      },

      // State setters
      setCurrentSlot: (slot) =>
        set(
          { currentSlot: slot },
          false,
          'saveStore/setCurrentSlot'
        ),

      setLastSaved: (date) =>
        set(
          { lastSaved: date },
          false,
          'saveStore/setLastSaved'
        ),

      setSyncStatus: (status) =>
        set(
          { syncStatus: status },
          false,
          'saveStore/setSyncStatus'
        ),

      setLoading: (loading) =>
        set(
          { isLoading: loading },
          false,
          'saveStore/setLoading'
        ),

      setError: (error) =>
        set(
          { loadError: error },
          false,
          'saveStore/setError'
        ),

      // Reset
      resetSaveStore: () =>
        set(
          initialState,
          false,
          'saveStore/reset'
        ),
    }),
    {
      name: 'SaveStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Save Store Selectors
 */
export const saveSelectors = {
  // Check if game has save
  hasSave: (state: SaveStore) => state.currentSlot !== null,

  // Check if loading
  isLoading: (state: SaveStore) => state.isLoading,

  // Get current slot
  currentSlot: (state: SaveStore) => state.currentSlot,

  // Get available slots
  availableSlots: (state: SaveStore) => state.availableSlots,

  // Get slot count
  slotCount: (state: SaveStore) => state.availableSlots.length,

  // Check if auto-save enabled
  isAutoSaveEnabled: (state: SaveStore) => state.autoSaveEnabled,

  // Get last saved time
  lastSaved: (state: SaveStore) => state.lastSaved,

  // Get sync status
  syncStatus: (state: SaveStore) => state.syncStatus,
};

/**
 * Initialize save store on app load
 */
export const initializeSaveStore = () => {
  const saveStore = useSaveStore.getState();

  // Refresh available slots
  saveStore.refreshAvailableSlots();

  // Auto-load if there's an active slot
  const activeSlot = SaveService.getActiveSlot();
  if (activeSlot !== null) {
    saveStore.loadGame(activeSlot);
  }
};
