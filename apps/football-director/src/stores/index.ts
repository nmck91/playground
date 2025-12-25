/**
 * Football Director - Store Index
 * Central exports for all Zustand stores
 */

// Game Store
export { useGameStore, gameSelectors } from './gameStore';
export type { GameStore } from './gameStore';

// UI Store
export { useUIStore, uiSelectors } from './uiStore';
export type { UIStore, Notification, ModalType } from './uiStore';

// Save Store
export { useSaveStore, saveSelectors, initializeSaveStore } from './saveStore';
export type { SaveStore, SyncStatus } from './saveStore';

/**
 * Reset all stores (useful for testing and logout)
 */
export const resetAllStores = () => {
  const { resetGame } = useGameStore.getState();
  const { resetUI } = useUIStore.getState();
  const { resetSaveStore } = useSaveStore.getState();

  resetGame();
  resetUI();
  resetSaveStore();
};
