/**
 * Football Director - Game Store
 * Core game state management using Zustand
 *
 * This store holds the main GameState object and provides basic state management.
 * Other stores read from this store and update it through actions.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { GameState } from '@playground/football-director-engine';

/**
 * Game Store State Interface
 */
interface GameStoreState {
  // Core game state
  gameState: GameState | null;

  // Metadata
  gameId: string | null;
  currentSaveSlot: number | null;
  lastSaved: Date | null;
}

/**
 * Game Store Actions Interface
 */
interface GameStoreActions {
  // State setters
  setGameState: (state: GameState | null) => void;
  updateGameState: (updater: (state: GameState) => GameState) => void;

  // Metadata setters
  setGameId: (id: string | null) => void;
  setCurrentSaveSlot: (slot: number | null) => void;
  setLastSaved: (date: Date | null) => void;

  // Reset
  resetGame: () => void;
}

/**
 * Combined Game Store Type
 */
export type GameStore = GameStoreState & GameStoreActions;

/**
 * Initial state
 */
const initialState: GameStoreState = {
  gameState: null,
  gameId: null,
  currentSaveSlot: null,
  lastSaved: null,
};

/**
 * Game Store
 *
 * Holds the core GameState object and provides basic state management.
 * This is the foundation store that other stores depend on.
 *
 * @example
 * ```typescript
 * // Get game state
 * const gameState = useGameStore(state => state.gameState);
 *
 * // Update entire game state
 * const setGameState = useGameStore(state => state.setGameState);
 * setGameState(newGameState);
 *
 * // Update game state with updater function
 * const updateGameState = useGameStore(state => state.updateGameState);
 * updateGameState(state => ({
 *   ...state,
 *   season: { ...state.season, currentWeek: state.season.currentWeek + 1 }
 * }));
 * ```
 */
export const useGameStore = create<GameStore>()(
  devtools(
    (set, _get) => ({
      // State
      ...initialState,

      // Actions
      setGameState: (state) =>
        set(
          { gameState: state },
          false,
          'gameStore/setGameState'
        ),

      updateGameState: (updater) =>
        set(
          (state) => ({
            gameState: state.gameState ? updater(state.gameState) : null,
          }),
          false,
          'gameStore/updateGameState'
        ),

      setGameId: (id) =>
        set(
          { gameId: id },
          false,
          'gameStore/setGameId'
        ),

      setCurrentSaveSlot: (slot) =>
        set(
          { currentSaveSlot: slot },
          false,
          'gameStore/setCurrentSaveSlot'
        ),

      setLastSaved: (date) =>
        set(
          { lastSaved: date },
          false,
          'gameStore/setLastSaved'
        ),

      resetGame: () =>
        set(
          initialState,
          false,
          'gameStore/resetGame'
        ),
    }),
    {
      name: 'GameStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Game Store Selectors
 *
 * Pre-defined selectors for common use cases to prevent re-renders
 */
export const gameSelectors = {
  // Get full game state
  gameState: (state: GameStore) => state.gameState,

  // Get game metadata
  gameId: (state: GameStore) => state.gameId,
  currentSaveSlot: (state: GameStore) => state.currentSaveSlot,
  lastSaved: (state: GameStore) => state.lastSaved,

  // Check if game is loaded
  hasGame: (state: GameStore) => state.gameState !== null,

  // Get current week
  currentWeek: (state: GameStore) => state.gameState?.season?.currentWeek ?? 0,

  // Get current season (year)
  currentSeason: (state: GameStore) => state.gameState?.season?.year ?? 0,

  // Get player team
  playerTeam: (state: GameStore) => state.gameState?.playerTeam,

  // Get player team budget
  budget: (state: GameStore) => state.gameState?.playerTeam.budget ?? 0,

  // Get player team name
  teamName: (state: GameStore) => state.gameState?.playerTeam.name ?? '',
};
