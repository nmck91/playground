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
  FormationType,
  Mentality,
  PlayerRoles,
  TeamInstructions,
  SetPieceAssignments,
  DefenderRole,
  MidfielderRole,
  ForwardRole,
} from '@playground/football-director-engine';

// Type alias for individual player role
type PlayerRole = DefenderRole | MidfielderRole | ForwardRole;

/**
 * Tactics Store State Interface
 */
interface TacticsStoreState {
  // Cached tactics (derived from gameState.playerTeam.tactics)
  currentFormationType: FormationType | null;
  currentMentality: Mentality | null;
  playerRoles: PlayerRoles | null;
  teamInstructions: TeamInstructions | null;
  setPieceTakers: SetPieceAssignments | null;
}

/**
 * Tactics Store Actions Interface
 */
interface TacticsStoreActions {
  // Tactics operations
  setFormationType: (formation: FormationType) => void;
  setMentality: (mentality: Mentality) => void;
  setPlayerRole: (playerId: string, role: PlayerRole) => void;
  setTeamInstructions: (instructions: Partial<TeamInstructions>) => void;
  setSetPieceAssignments: (takers: Partial<SetPieceAssignments>) => void;
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
  currentFormationType: null,
  currentMentality: null,
  playerRoles: null,
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
 * const setFormationType = useTacticsStore(state => state.setFormationType);
 * setFormationType('4-4-2');
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
            currentFormationType: tactics.formation || null,
            currentMentality: tactics.mentality || null,
            playerRoles: tactics.roles || {},
            teamInstructions: tactics.instructions || null,
            setPieceTakers: tactics.setPieces || null,
          },
          false,
          'tacticsStore/syncFromGameState'
        );
      },

      // Set formation
      setFormationType: (formation) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              formation,
              mentality: state.playerTeam.tactics?.mentality || 'balanced',
              roles: state.playerTeam.tactics?.roles,
              instructions: state.playerTeam.tactics?.instructions,
              setPieces: state.playerTeam.tactics?.setPieces,
            },
          },
        }));

        // Sync local state
        set({ currentFormationType: formation }, false, 'tacticsStore/setFormationType');

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: `FormationType changed to ${formation}`,
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
              formation: state.playerTeam.tactics?.formation || '4-4-2',
              mentality,
              roles: state.playerTeam.tactics?.roles,
              instructions: state.playerTeam.tactics?.instructions,
              setPieces: state.playerTeam.tactics?.setPieces,
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
          ...(gameState.playerTeam.tactics?.roles || {}),
          [playerId]: role,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              formation: state.playerTeam.tactics?.formation || '4-4-2',
              mentality: state.playerTeam.tactics?.mentality || 'balanced',
              roles: updatedRoles,
              instructions: state.playerTeam.tactics?.instructions,
              setPieces: state.playerTeam.tactics?.setPieces,
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
          ...(gameState.playerTeam.tactics?.instructions || {}),
          ...instructions,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              formation: state.playerTeam.tactics?.formation || '4-4-2',
              mentality: state.playerTeam.tactics?.mentality || 'balanced',
              roles: state.playerTeam.tactics?.roles,
              instructions: updatedInstructions as TeamInstructions,
              setPieces: state.playerTeam.tactics?.setPieces,
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
      setSetPieceAssignments: (takers) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedTakers = {
          ...(gameState.playerTeam.tactics?.setPieces || {}),
          ...takers,
        };

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            tactics: {
              formation: state.playerTeam.tactics?.formation || '4-4-2',
              mentality: state.playerTeam.tactics?.mentality || 'balanced',
              roles: state.playerTeam.tactics?.roles,
              instructions: state.playerTeam.tactics?.instructions,
              setPieces: updatedTakers as SetPieceAssignments,
            },
          },
        }));

        // Sync local state
        set(
          { setPieceTakers: updatedTakers as SetPieceAssignments },
          false,
          'tacticsStore/setSetPieceAssignments'
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
            currentFormationType: tactics.formation || null,
            currentMentality: tactics.mentality || null,
            playerRoles: tactics.roles || {},
            teamInstructions: tactics.instructions || null,
            setPieceTakers: tactics.setPieces || null,
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
        // TODO: PlayerRoles type mismatch - store uses playerId mapping but engine uses position-based structure
        return (get().playerRoles as any)?.[playerId] || null;
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
  // FormationType
  currentFormationType: (state: TacticsStore) => state.currentFormationType,
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
 * Note: Subscription is now set up in stores/index.ts via setupStoreSubscriptions()
 * to avoid circular dependency issues
 */
