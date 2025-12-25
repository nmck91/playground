/**
 * Football Director - Match Store
 * Match simulation, results, and commentary management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { usePlayerStore } from './playerStore';
import { useTacticsStore } from './tacticsStore';
import { useUIStore } from './uiStore';
import {
  MatchSimulator,
  MatchPreviewGenerator,
  PostMatchGenerator,
  type MatchResult,
  type MatchPreview,
  type Fixture,
  type MatchEvent,
  type PlayerMatchStats,
  type Match,
} from '@playground/football-director-engine';

/**
 * Match Store State Interface
 */
interface MatchStoreState {
  // Match results
  lastSimulationResults: MatchResult[];
  matchPreviews: MatchPreview[];

  // UI state
  selectedMatchId: string | null;
  showMatchReport: boolean;
}

/**
 * Match Store Actions Interface
 */
interface MatchStoreActions {
  // Match simulation
  simulateMatch: (fixture: Fixture) => MatchResult;
  simulateMatches: (fixtures: Fixture[]) => MatchResult[];

  // Match previews
  generatePreview: (fixture: Fixture) => MatchPreview;
  generatePreviews: (fixtures: Fixture[]) => MatchPreview[];

  // Results management
  clearMatchResults: () => void;
  setLastResults: (results: MatchResult[]) => void;

  // Queries
  getMatchResult: (fixtureId: string) => MatchResult | null;
  getPlayerMatchStats: (playerId: string) => PlayerMatchStats | null;

  // UI
  setSelectedMatch: (matchId: string | null) => void;
  setShowMatchReport: (show: boolean) => void;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Match Store Type
 */
export type MatchStore = MatchStoreState & MatchStoreActions;

/**
 * Initial state
 */
const initialState: MatchStoreState = {
  lastSimulationResults: [],
  matchPreviews: [],
  selectedMatchId: null,
  showMatchReport: false,
};

/**
 * Match Store
 *
 * Manages match simulation, results storage, and match-related UI state.
 * Integrates with PlayerStore for stats updates and TacticsStore for team setup.
 *
 * @example
 * ```typescript
 * // Simulate a match
 * const simulateMatch = useMatchStore(state => state.simulateMatch);
 * const result = simulateMatch(fixture);
 *
 * // Get last results
 * const lastResults = useMatchStore(state => state.lastSimulationResults);
 * ```
 */
export const useMatchStore = create<MatchStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        // Match results are stored in MatchStore, not GameStore
        // This is intentional to keep match data separate
      },

      // Simulate single match
      simulateMatch: (fixture) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          throw new Error('No game state available');
        }

        // Get tactics from TacticsStore
        const tactics = useTacticsStore.getState().getTacticsForMatch();
        if (!tactics) {
          throw new Error('No tactics configured');
        }

        // Initialize match simulator
        const simulator = new MatchSimulator();

        // Determine if player team is home or away
        const isPlayerHome = fixture.homeTeamId === gameState.playerTeam.id;
        const playerTeam = { ...gameState.playerTeam, tactics };
        const opponentTeam = gameState.teams.find(
          (t) => t.id === (isPlayerHome ? fixture.awayTeamId : fixture.homeTeamId)
        );

        if (!opponentTeam) {
          throw new Error('Opponent team not found');
        }

        // Create Match object
        const match = isPlayerHome
          ? { homeTeam: playerTeam, awayTeam: opponentTeam }
          : { homeTeam: opponentTeam, awayTeam: playerTeam };

        // Simulate the match
        const simResult = simulator.simulateMatch(match, gameState.season?.currentWeek || 1);

        // Add fixture metadata to result
        const result = {
          ...simResult,
          fixtureId: fixture.id,
          homeTeamId: fixture.homeTeamId,
          awayTeamId: fixture.awayTeamId,
        };

        // Update player stats from match
        result.events.forEach((event) => {
          if (event.playerId) {
            const playerStore = usePlayerStore.getState();
            const player = playerStore.getPlayerById(event.playerId);
            if (player) {
              // Update stats based on event type
              if (event.type === 'goal') {
                playerStore.updatePlayerStats(event.playerId, {
                  goals: (player.stats.goals || 0) + 1,
                });
              } else if (event.type === 'assist') {
                playerStore.updatePlayerStats(event.playerId, {
                  assists: (player.stats.assists || 0) + 1,
                });
              } else if (event.type === 'yellow_card') {
                playerStore.updatePlayerStats(event.playerId, {
                  yellowCards: (player.stats.yellowCards || 0) + 1,
                });
              } else if (event.type === 'red_card') {
                playerStore.updatePlayerStats(event.playerId, {
                  redCards: (player.stats.redCards || 0) + 1,
                });
              } else if (event.type === 'injury') {
                // Injury handled by injury system
                const weeksOut = Math.floor(Math.random() * 6) + 1;
                playerStore.injurePlayer(event.playerId, {
                  type: 'muscle',
                  weeksRemaining: weeksOut,
                  severity: weeksOut > 3 ? 'serious' : 'minor',
                });
              }
            }
          }
        });

        // Update appearances
        playerTeam.players.forEach((player) => {
          usePlayerStore.getState().updatePlayerStats(player.id, {
            appearances: (player.stats.appearances || 0) + 1,
          });
        });

        // Add to last results
        const updatedResults = [...get().lastSimulationResults, result];
        set(
          { lastSimulationResults: updatedResults },
          false,
          'matchStore/simulateMatch'
        );

        // Show match report
        set(
          { selectedMatchId: result.fixtureId, showMatchReport: true },
          false,
          'matchStore/showReport'
        );

        return result;
      },

      // Simulate multiple matches
      simulateMatches: (fixtures) => {
        const results = fixtures.map((fixture) => get().simulateMatch(fixture));

        set(
          { lastSimulationResults: results },
          false,
          'matchStore/simulateMatches'
        );

        return results;
      },

      // Generate match preview
      generatePreview: (fixture) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          throw new Error('No game state available');
        }

        const previewGenerator = new MatchPreviewGenerator();

        const isPlayerHome = fixture.homeTeamId === gameState.playerTeam.id;
        const playerTeam = gameState.playerTeam;
        const opponentTeam = gameState.teams.find(
          (t) => t.id === (isPlayerHome ? fixture.awayTeamId : fixture.homeTeamId)
        );

        if (!opponentTeam) {
          throw new Error('Opponent team not found');
        }

        const preview = previewGenerator.generate(
          fixture,
          playerTeam,
          opponentTeam,
          gameState.season.leagueTable || []
        );

        // Add to previews
        const updatedPreviews = [...get().matchPreviews, preview];
        set({ matchPreviews: updatedPreviews }, false, 'matchStore/generatePreview');

        return preview;
      },

      // Generate previews for multiple matches
      generatePreviews: (fixtures) => {
        const previews = fixtures.map((fixture) => get().generatePreview(fixture));

        set({ matchPreviews: previews }, false, 'matchStore/generatePreviews');

        return previews;
      },

      // Clear match results
      clearMatchResults: () => {
        set(
          { lastSimulationResults: [], matchPreviews: [] },
          false,
          'matchStore/clearResults'
        );
      },

      // Set last results
      setLastResults: (results) => {
        set({ lastSimulationResults: results }, false, 'matchStore/setLastResults');
      },

      // Get match result by fixture ID
      getMatchResult: (fixtureId) => {
        return get().lastSimulationResults.find((r) => r.fixtureId === fixtureId) || null;
      },

      // Get player match stats
      getPlayerMatchStats: (playerId) => {
        const results = get().lastSimulationResults;
        const latestResult = results[results.length - 1];
        if (!latestResult) return null;

        // Find player in match stats
        // This is simplified - actual implementation would aggregate across matches
        return null;
      },

      // Set selected match
      setSelectedMatch: (matchId) => {
        set({ selectedMatchId: matchId }, false, 'matchStore/setSelectedMatch');
      },

      // Set show match report
      setShowMatchReport: (show) => {
        set({ showMatchReport: show }, false, 'matchStore/setShowMatchReport');
      },
    }),
    {
      name: 'MatchStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Match Store Selectors
 */
export const matchSelectors = {
  // Results
  lastResults: (state: MatchStore) => state.lastSimulationResults,
  lastResult: (state: MatchStore) =>
    state.lastSimulationResults[state.lastSimulationResults.length - 1] || null,
  resultCount: (state: MatchStore) => state.lastSimulationResults.length,

  // Previews
  matchPreviews: (state: MatchStore) => state.matchPreviews,

  // UI
  selectedMatch: (state: MatchStore) => state.selectedMatchId,
  showMatchReport: (state: MatchStore) => state.showMatchReport,
  selectedMatchResult: (state: MatchStore) =>
    state.selectedMatchId ? state.getMatchResult(state.selectedMatchId) : null,
};
