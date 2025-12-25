/**
 * Football Director - Store Index
 * Central exports for all Zustand stores
 */

// Core Stores
export { useGameStore, gameSelectors } from './gameStore';
export type { GameStore } from './gameStore';

export { useUIStore, uiSelectors } from './uiStore';
export type { UIStore, Notification, ModalType } from './uiStore';

export { useSaveStore, saveSelectors, initializeSaveStore } from './saveStore';
export type { SaveStore, SyncStatus } from './saveStore';

// Domain Stores
export { useFinanceStore, financeSelectors } from './financeStore';
export type { FinanceStore } from './financeStore';

export { useTacticsStore, tacticsSelectors } from './tacticsStore';
export type { TacticsStore } from './tacticsStore';

export { useStaffStore, staffSelectors } from './staffStore';
export type { StaffStore } from './staffStore';

export { usePlayerStore, playerSelectors } from './playerStore';
export type { PlayerStore } from './playerStore';

export { useMatchStore, matchSelectors } from './matchStore';
export type { MatchStore } from './matchStore';

export { useTransferStore, transferSelectors } from './transferStore';
export type { TransferStore } from './transferStore';

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

/**
 * Sync all domain stores from GameStore
 * Call this after loading a game or major game state changes
 */
export const syncAllStores = () => {
  useFinanceStore.getState().syncFromGameState();
  useTacticsStore.getState().syncFromGameState();
  useStaffStore.getState().syncFromGameState();
  usePlayerStore.getState().syncFromGameState();
  useMatchStore.getState().syncFromGameState();
  useTransferStore.getState().syncFromGameState();
};
