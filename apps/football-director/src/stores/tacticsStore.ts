/**
 * Football Director - Tactics Store
 * Team tactics, formation, and player roles management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import type {
  Tactics,
  Formation,
  Mentality,
  PlayerRole,
  TeamInstructions,
  SetPieceTakers,
} from '@playground/football-director-engine';

/**
 * Tactics Store State Interface
 */
interface TacticsStoreState {
  // Cached tactics (derived from gameState.playerTeam.tactics)
  currentFormation: Formation | null;
  currentMentality: Mentality | null;
  playerRoles: Record<string, PlayerRole>;
  teamInstructions: TeamInstructions | null;
  setPieceTakers: SetPieceTakers | null;
}

/**
 * Tactics Store Actions Interface
 */
interface TacticsStoreActions {
  // Tactics operations
  setFormation: (formation: Formation) => void;
  setMentality: (mentality: Mentality) => void;
  setPlayerRole: (playerId: string, role: PlayerRole) => void;
  setTeamInstructions: (instructions: Partial<TeamInstructions>) => void;
  setSetPieceTakers: (takers: Partial<SetPieceTakers>) => void;
  setTeamTactics: (tactics: Tactics) => void;

  // Getters
  getTacticsForMatch: () => Tactics | null;
  getPlayerRole: (playerId: string) => PlayerRole | null;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Tactics Store Type
 */
export type TacticsStore = TacticsStoreState & TacticsStoreActions;

/**
 * Initial state
 */
const initialState: TacticsStoreState = {
  currentFormation: null,
  currentMentality: null,
  playerRoles: {},
  teamInstructions: null,
  setPieceTakers: null,
};

/**
 * Tactics Store
 *
 * Manages team tactics, formation, player roles, and team instructions.
 * Used by MatchStore during match simulation.
 *
 * @example
 * ```typescript
 * // Change formation
 * const setFormation = useTacticsStore(state => state.setFormation);
 * setFormation('4-4-2');
 *
 * // Set player role
 * const setPlayerRole = useTacticsStore(state => state.setPlayerRole);
 * setPlayerRole('player-123', 'striker');
 * ```
 */
export const useTacticsStore = create<TacticsStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState || !gameState.playerTeam.tactics) {
          set(initialState, false, 'tacticsStore/syncFromGameState/noGame');
          return;
        }

        const tactics = gameState.playerTeam.tactics;
        set(
          {
            currentFormation: tactics.formation || null,
            currentMentality: tactics.mentality || null,
            playerRoles: tactics.playerRoles || {},
            teamInstructions: tactics.teamInstructions || null,
            setPieceTakers: tactics.setPieceTakers || null,
          },
          false,
          'tacticsStore/syncFromGameState'
        );
      },

      // Set formation
      setFormation: (formation) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              ...state.playerTeam.tactics,
              formation,
            },
          },
        }));

        // Sync local state
        set({ currentFormation: formation }, false, 'tacticsStore/setFormation');

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: `Formation changed to ${formation}`,
          duration: 2000,
        });
      },

      // Set mentality
      setMentality: (mentality) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              ...state.playerTeam.tactics,
              mentality,
            },
          },
        }));

        // Sync local state
        set({ currentMentality: mentality }, false, 'tacticsStore/setMentality');

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: `Mentality changed to ${mentality}`,
          duration: 2000,
        });
      },

      // Set player role
      setPlayerRole: (playerId, role) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedRoles = {
          ...(gameState.playerTeam.tactics.playerRoles || {}),
          [playerId]: role,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              ...state.playerTeam.tactics,
              playerRoles: updatedRoles,
            },
          },
        }));

        // Sync local state
        set({ playerRoles: updatedRoles }, false, 'tacticsStore/setPlayerRole');
      },

      // Set team instructions
      setTeamInstructions: (instructions) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedInstructions = {
          ...(gameState.playerTeam.tactics.teamInstructions || {}),
          ...instructions,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              ...state.playerTeam.tactics,
              teamInstructions: updatedInstructions as TeamInstructions,
            },
          },
        }));

        // Sync local state
        set(
          { teamInstructions: updatedInstructions as TeamInstructions },
          false,
          'tacticsStore/setTeamInstructions'
        );

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Team instructions updated',
          duration: 2000,
        });
      },

      // Set set piece takers
      setSetPieceTakers: (takers) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedTakers = {
          ...(gameState.playerTeam.tactics.setPieceTakers || {}),
          ...takers,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              ...state.playerTeam.tactics,
              setPieceTakers: updatedTakers as SetPieceTakers,
            },
          },
        }));

        // Sync local state
        set(
          { setPieceTakers: updatedTakers as SetPieceTakers },
          false,
          'tacticsStore/setSetPieceTakers'
        );

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Set piece takers updated',
          duration: 2000,
        });
      },

      // Set entire tactics object
      setTeamTactics: (tactics) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics,
          },
        }));

        // Sync local state
        set(
          {
            currentFormation: tactics.formation || null,
            currentMentality: tactics.mentality || null,
            playerRoles: tactics.playerRoles || {},
            teamInstructions: tactics.teamInstructions || null,
            setPieceTakers: tactics.setPieceTakers || null,
          },
          false,
          'tacticsStore/setTeamTactics'
        );

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: 'Tactics updated',
          duration: 2000,
        });
      },

      // Get tactics for match simulation
      getTacticsForMatch: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState || !gameState.playerTeam.tactics) return null;

        return gameState.playerTeam.tactics;
      },

      // Get player role
      getPlayerRole: (playerId) => {
        return get().playerRoles[playerId] || null;
      },
    }),
    {
      name: 'TacticsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Tactics Store Selectors
 */
export const tacticsSelectors = {
  // Formation
  currentFormation: (state: TacticsStore) => state.currentFormation,
  currentMentality: (state: TacticsStore) => state.currentMentality,

  // Player roles
  playerRoles: (state: TacticsStore) => state.playerRoles,
  getPlayerRole: (playerId: string) => (state: TacticsStore) =>
    state.getPlayerRole(playerId),

  // Team instructions
  teamInstructions: (state: TacticsStore) => state.teamInstructions,
  setPieceTakers: (state: TacticsStore) => state.setPieceTakers,

  // Full tactics
  fullTactics: (state: TacticsStore) => state.getTacticsForMatch(),
};

/**
 * Subscribe to GameStore changes to keep tactics data in sync
 */
useGameStore.subscribe(
  (state) => state.gameState?.playerTeam.tactics,
  () => {
    useTacticsStore.getState().syncFromGameState();
  }
);
