/**
 * Football Director - Player Store
 * Player management, development, contracts, morale, and injuries
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import type {
  Player,
  DevelopmentReport,
  Injury,
  ContractTerms,
  PlayerStats,
} from '@playground/football-director-engine';

/**
 * Player Store State Interface
 */
interface PlayerStoreState {
  // Cached player data (derived from gameState)
  allPlayers: Player[];
  squadPlayers: Player[];
  freeAgents: Player[];

  // Development tracking
  developmentReports: DevelopmentReport[];
  youthProspects: Player[];

  // UI state
  selectedPlayerId: string | null;
}

/**
 * Player Store Actions Interface
 */
interface PlayerStoreActions {
  // Player operations
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;

  // Stats operations
  updatePlayerStats: (playerId: string, stats: Partial<PlayerStats>) => void;
  resetSeasonStats: () => void;

  // Morale operations
  updatePlayerMorale: (playerId: string, change: number, reason?: string) => void;
  setPlayerMorale: (playerId: string, morale: number) => void;

  // Injury operations
  injurePlayer: (playerId: string, injury: Injury) => void;
  healPlayer: (playerId: string) => void;
  processInjuryRecovery: () => void;

  // Contract operations
  updatePlayerContract: (playerId: string, contract: Partial<ContractTerms>) => void;
  processContractExpiries: () => Player[];
  offerContract: (playerId: string, terms: ContractTerms) => boolean;

  // Development operations
  developPlayers: (players: Player[]) => DevelopmentReport[];
  ageAllPlayers: () => void;

  // Youth academy
  addYouthProspect: (player: Player) => void;
  selectYouthPlayers: (playerIds: string[]) => void;

  // Queries
  getPlayerById: (id: string) => Player | null;
  topPerformers: (category: 'goals' | 'assists' | 'rating', limit?: number) => Player[];
  expiringContracts: (weeksRemaining: number) => Player[];
  injuredPlayers: () => Player[];
  playersWithLowMorale: (threshold?: number) => Player[];

  // Selection
  setSelectedPlayer: (playerId: string | null) => void;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Player Store Type
 */
export type PlayerStore = PlayerStoreState & PlayerStoreActions;

/**
 * Initial state
 */
const initialState: PlayerStoreState = {
  allPlayers: [],
  squadPlayers: [],
  freeAgents: [],
  developmentReports: [],
  youthProspects: [],
  selectedPlayerId: null,
};

/**
 * Player Store
 *
 * Manages all player-related operations including development, contracts,
 * injuries, morale, and stats tracking.
 *
 * @example
 * ```typescript
 * // Get top scorers
 * const topScorers = usePlayerStore(state => state.topPerformers('goals', 10));
 *
 * // Update player morale
 * const updateMorale = usePlayerStore(state => state.updatePlayerMorale);
 * updateMorale('player-123', 10, 'Won important match');
 * ```
 */
export const usePlayerStore = create<PlayerStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          set(initialState, false, 'playerStore/syncFromGameState/noGame');
          return;
        }

        const allPlayers = [
          ...gameState.playerTeam.players,
          ...gameState.teams.flatMap((team) => team.players),
        ];

        const freeAgents = gameState.freeAgents || [];

        set(
          {
            allPlayers,
            squadPlayers: gameState.playerTeam.players,
            freeAgents,
            youthProspects: gameState.youthAcademy?.prospects || [],
          },
          false,
          'playerStore/syncFromGameState'
        );
      },

      // Add player to squad
      addPlayer: (player) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedPlayers = [...gameState.playerTeam.players, player];

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/addPlayer');

        useUIStore.getState().addNotification({
          type: 'success',
          message: `${player.name} joined the squad!`,
          duration: 3000,
        });
      },

      // Remove player from squad
      removePlayer: (playerId) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const player = gameState.playerTeam.players.find((p) => p.id === playerId);
        if (!player) return;

        const updatedPlayers = gameState.playerTeam.players.filter((p) => p.id !== playerId);

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/removePlayer');

        useUIStore.getState().addNotification({
          type: 'info',
          message: `${player.name} has left the club`,
          duration: 3000,
        });
      },

      // Update player
      updatePlayer: (playerId, updates) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedPlayers = gameState.playerTeam.players.map((p) =>
          p.id === playerId ? { ...p, ...updates } : p
        );

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/updatePlayer');
      },

      // Update player stats
      updatePlayerStats: (playerId, stats) => {
        get().updatePlayer(playerId, {
          stats: {
            ...get().getPlayerById(playerId)?.stats,
            ...stats,
          } as PlayerStats,
        });
      },

      // Reset season stats for all players
      resetSeasonStats: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedPlayers = gameState.playerTeam.players.map((p) => ({
          ...p,
          stats: {
            ...p.stats,
            goals: 0,
            assists: 0,
            appearances: 0,
            yellowCards: 0,
            redCards: 0,
            averageRating: 0,
          },
        }));

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/resetSeasonStats');
      },

      // Update player morale
      updatePlayerMorale: (playerId, change, reason) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        const newMorale = Math.max(0, Math.min(100, player.morale + change));
        get().updatePlayer(playerId, { morale: newMorale });

        if (reason && Math.abs(change) >= 5) {
          useUIStore.getState().addNotification({
            type: change > 0 ? 'success' : 'warning',
            message: `${player.name}: ${reason} (${change > 0 ? '+' : ''}${change} morale)`,
            duration: 3000,
          });
        }
      },

      // Set player morale
      setPlayerMorale: (playerId, morale) => {
        get().updatePlayer(playerId, { morale: Math.max(0, Math.min(100, morale)) });
      },

      // Injure player
      injurePlayer: (playerId, injury) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        get().updatePlayer(playerId, { injury });

        useUIStore.getState().addNotification({
          type: 'warning',
          message: `${player.name} injured - out for ${injury.weeksRemaining} weeks`,
          duration: 4000,
        });
      },

      // Heal player
      healPlayer: (playerId) => {
        const player = get().getPlayerById(playerId);
        if (!player) return;

        get().updatePlayer(playerId, { injury: null });

        useUIStore.getState().addNotification({
          type: 'success',
          message: `${player.name} has recovered from injury!`,
          duration: 3000,
        });
      },

      // Process injury recovery (weekly)
      processInjuryRecovery: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedPlayers = gameState.playerTeam.players.map((p) => {
          if (!p.injury) return p;

          const weeksRemaining = p.injury.weeksRemaining - 1;
          if (weeksRemaining <= 0) {
            return { ...p, injury: null };
          }

          return {
            ...p,
            injury: { ...p.injury, weeksRemaining },
          };
        });

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/processInjuryRecovery');
      },

      // Update player contract
      updatePlayerContract: (playerId, contract) => {
        const player = get().getPlayerById(playerId);
        if (!player || !player.contract) return;

        get().updatePlayer(playerId, {
          contract: { ...player.contract, ...contract },
        });
      },

      // Process contract expiries (weekly)
      processContractExpiries: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return [];

        const expiredPlayers: Player[] = [];

        const updatedPlayers = gameState.playerTeam.players.map((p) => {
          if (!p.contract) return p;

          const weeksRemaining = p.contract.weeksRemaining - 1;

          if (weeksRemaining <= 0) {
            expiredPlayers.push(p);
            // Contract expired - player becomes free agent
            return { ...p, contract: null };
          }

          return {
            ...p,
            contract: { ...p.contract, weeksRemaining },
          };
        });

        // Remove players with expired contracts from squad
        const remainingPlayers = updatedPlayers.filter((p) => p.contract !== null);

        // Add expired players to free agents
        const updatedFreeAgents = [...(gameState.freeAgents || []), ...expiredPlayers];

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: remainingPlayers,
          },
          freeAgents: updatedFreeAgents,
        }));

        set(
          {
            squadPlayers: remainingPlayers,
            freeAgents: updatedFreeAgents,
          },
          false,
          'playerStore/processContractExpiries'
        );

        // Notify about contract expiries
        expiredPlayers.forEach((p) => {
          useUIStore.getState().addNotification({
            type: 'warning',
            message: `${p.name}'s contract has expired`,
            duration: 4000,
          });
        });

        return expiredPlayers;
      },

      // Offer contract to player
      offerContract: (playerId, terms) => {
        const player = get().getPlayerById(playerId);
        if (!player) return false;

        // Accept logic can be more complex (based on wage, club reputation, etc.)
        const accepted = true; // Simplified for now

        if (accepted) {
          get().updatePlayer(playerId, { contract: terms });

          useUIStore.getState().addNotification({
            type: 'success',
            message: `${player.name} accepted the contract offer!`,
            duration: 3000,
          });

          return true;
        }

        useUIStore.getState().addNotification({
          type: 'error',
          message: `${player.name} rejected the contract offer`,
          duration: 3000,
        });

        return false;
      },

      // Develop players (aging, skill changes)
      developPlayers: (players) => {
        const reports: DevelopmentReport[] = [];

        players.forEach((player) => {
          // Simple development logic - this can be enhanced
          const skillChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
          const potential = player.potential || player.skill;
          const newSkill = Math.max(
            1,
            Math.min(potential, player.skill + skillChange)
          );

          if (newSkill !== player.skill) {
            reports.push({
              playerId: player.id,
              playerName: player.name,
              skillChange,
              newSkill,
              reason: skillChange > 0 ? 'Good training' : 'Lack of game time',
            });

            get().updatePlayer(player.id, { skill: newSkill });
          }
        });

        set({ developmentReports: reports }, false, 'playerStore/developPlayers');

        return reports;
      },

      // Age all players by 1 year
      ageAllPlayers: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const updatedPlayers = gameState.playerTeam.players.map((p) => ({
          ...p,
          age: p.age + 1,
        }));

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: updatedPlayers,
          },
        }));

        set({ squadPlayers: updatedPlayers }, false, 'playerStore/ageAllPlayers');
      },

      // Add youth prospect
      addYouthProspect: (player) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const prospects = [...(gameState.youthAcademy?.prospects || []), player];

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          youthAcademy: {
            ...state.youthAcademy!,
            prospects,
          },
        }));

        set({ youthProspects: prospects }, false, 'playerStore/addYouthProspect');
      },

      // Select youth players to promote to squad
      selectYouthPlayers: (playerIds) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const prospects = gameState.youthAcademy?.prospects || [];
        const selectedPlayers = prospects.filter((p) => playerIds.includes(p.id));
        const remainingProspects = prospects.filter((p) => !playerIds.includes(p.id));

        // Add to squad
        selectedPlayers.forEach((player) => {
          get().addPlayer(player);
        });

        // Remove from prospects
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          youthAcademy: {
            ...state.youthAcademy!,
            prospects: remainingProspects,
          },
        }));

        set({ youthProspects: remainingProspects }, false, 'playerStore/selectYouthPlayers');
      },

      // Get player by ID
      getPlayerById: (id) => {
        return get().squadPlayers.find((p) => p.id === id) || null;
      },

      // Get top performers
      topPerformers: (category, limit = 10) => {
        const players = [...get().squadPlayers];

        players.sort((a, b) => {
          if (category === 'goals') return b.stats.goals - a.stats.goals;
          if (category === 'assists') return b.stats.assists - a.stats.assists;
          if (category === 'rating') return b.stats.averageRating - a.stats.averageRating;
          return 0;
        });

        return players.slice(0, limit);
      },

      // Get players with expiring contracts
      expiringContracts: (weeksRemaining) => {
        return get().squadPlayers.filter(
          (p) => p.contract && p.contract.weeksRemaining <= weeksRemaining
        );
      },

      // Get injured players
      injuredPlayers: () => {
        return get().squadPlayers.filter((p) => p.injury !== null);
      },

      // Get players with low morale
      playersWithLowMorale: (threshold = 40) => {
        return get().squadPlayers.filter((p) => p.morale < threshold);
      },

      // Set selected player
      setSelectedPlayer: (playerId) => {
        set({ selectedPlayerId: playerId }, false, 'playerStore/setSelectedPlayer');
      },
    }),
    {
      name: 'PlayerStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Player Store Selectors
 */
export const playerSelectors = {
  // All players
  allPlayers: (state: PlayerStore) => state.allPlayers,
  squadPlayers: (state: PlayerStore) => state.squadPlayers,
  freeAgents: (state: PlayerStore) => state.freeAgents,
  squadSize: (state: PlayerStore) => state.squadPlayers.length,

  // Queries
  topScorers: (state: PlayerStore) => state.topPerformers('goals', 10),
  topAssisters: (state: PlayerStore) => state.topPerformers('assists', 10),
  topRated: (state: PlayerStore) => state.topPerformers('rating', 10),

  // Filters
  injuredPlayers: (state: PlayerStore) => state.injuredPlayers(),
  lowMoralePlayers: (state: PlayerStore) => state.playersWithLowMorale(),
  expiringContracts: (state: PlayerStore) => state.expiringContracts(4),

  // Development
  developmentReports: (state: PlayerStore) => state.developmentReports,
  youthProspects: (state: PlayerStore) => state.youthProspects,

  // Selection
  selectedPlayer: (state: PlayerStore) => state.selectedPlayerId,
  selectedPlayerData: (state: PlayerStore) =>
    state.selectedPlayerId ? state.getPlayerById(state.selectedPlayerId) : null,
};

/**
 * Subscribe to GameStore changes to keep player data in sync
 */
useGameStore.subscribe(
  (state) => state.gameState?.playerTeam.players,
  () => {
    usePlayerStore.getState().syncFromGameState();
  }
);
