/**
 * Football Director - Store Index
 * Central exports for all Zustand stores
 */

// Import stores needed by helper functions
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import { useSaveStore } from './saveStore';
import { useFinanceStore } from './financeStore';
import { useTacticsStore } from './tacticsStore';
import { useStaffStore } from './staffStore';
import { usePlayerStore } from './playerStore';
import { useMatchStore } from './matchStore';
import { useTransferStore } from './transferStore';
import { useSeasonStore } from './seasonStore';
import { useGameOrchestratorStore } from './gameOrchestratorStore';

// Re-export all stores
export { useGameStore, gameSelectors } from './gameStore';
export type { GameStore } from './gameStore';

export { useUIStore, uiSelectors } from './uiStore';
export type { UIStore, Notification, ModalType } from './uiStore';

export { useSaveStore, saveSelectors, initializeSaveStore } from './saveStore';
export type { SaveStore, SyncStatus } from './saveStore';

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

export { useSeasonStore, seasonSelectors } from './seasonStore';
export type { SeasonStore, WeekSummary, ValidationResult } from './seasonStore';

export { useGameOrchestratorStore, orchestratorSelectors } from './gameOrchestratorStore';
export type { GameOrchestratorStore, SeasonEvaluation } from './gameOrchestratorStore';

/**
 * Reset all stores (useful for testing and logout)
 */
export const resetAllStores = () => {
  const { resetGame } = useGameStore.getState();
  const { resetUI } = useUIStore.getState();
  const { resetSaveStore } = useSaveStore.getState();
  const { resetOrchestrator } = useGameOrchestratorStore.getState();

  resetGame();
  resetUI();
  resetSaveStore();
  resetOrchestrator();
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
  useSeasonStore.getState().syncFromGameState();
};

/**
 * Setup store subscriptions
 * Call this once at app initialization
 */
export const setupStoreSubscriptions = () => {
  // Setup auto-sync subscriptions
  // Note: This is called after all stores are loaded to avoid circular dependencies
  useGameStore.subscribe(() => {
    useFinanceStore.getState().syncFromGameState();
  });

  useGameStore.subscribe(() => {
    useSeasonStore.getState().syncFromGameState();
  });
};
