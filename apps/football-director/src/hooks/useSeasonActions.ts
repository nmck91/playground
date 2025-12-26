/**
 * Football Director - useSeasonActions Hook
 * Bridge hook that integrates SeasonStore validation with useWeeklySimulation orchestration
 */

'use client';

import { useState, useCallback } from 'react';
import { useWeeklySimulation } from './useWeeklySimulation';
import { useSeasonStore } from '../stores/seasonStore';
import { useUIStore } from '../stores/uiStore';
import type {
  GameState,
  MatchResult,
  DevelopmentReport,
  Achievement,
  Player,
  BoardObjective,
  SeasonAward,
  SeasonTopPerformers,
} from '@playground/football-director-engine';

/**
 * Bridge hook that adds SeasonStore validation to weekly simulation
 *
 * Integrates:
 * - SeasonStore for season metadata and validation
 * - useWeeklySimulation for orchestration (unchanged)
 * - UI state management for simulation results
 *
 * @param gameState - Current game state
 * @param setGameState - Function to update game state
 * @param setError - Function to set error message
 * @returns Simulation actions and UI state
 *
 * @example
 * ```typescript
 * const seasonActions = useSeasonActions(gameState, setGameState, setError);
 *
 * // Simulate week (with validation)
 * seasonActions.simulateNextWeek();
 *
 * // Access results
 * console.log(seasonActions.lastSimulationResults);
 * ```
 */
export function useSeasonActions(
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  setError: (error: string | null) => void
) {
  // UI state for simulation results (transient, not in store)
  const [lastSimulationResults, setLastSimulationResults] = useState<MatchResult[]>([]);
  const [developmentReports, setDevelopmentReports] = useState<DevelopmentReport[]>([]);
  const [seasonTopPerformers, setSeasonTopPerformers] = useState<SeasonTopPerformers | null>(
    null
  );
  const [seasonEvaluation, setSeasonEvaluation] = useState<{
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
    brokenRecords?: string[];
    seasonAwards?: SeasonAward;
  } | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [youthProspects, setYouthProspects] = useState<Player[]>([]);

  // Get SeasonStore validation
  const validateWeekAdvancement = useSeasonStore((state) => state.validateWeekAdvancement);
  const syncSeason = useSeasonStore((state) => state.syncFromGameState);

  // Get existing simulation hook (unchanged)
  const simulation = useWeeklySimulation(
    gameState,
    setGameState,
    setError,
    setLastSimulationResults,
    setDevelopmentReports,
    setSeasonTopPerformers,
    setSeasonEvaluation,
    setPendingAchievements,
    setYouthProspects
  );

  // Wrapped simulate with validation
  const simulateNextWeek = useCallback(() => {
    // Validate week advancement
    const validation = validateWeekAdvancement();

    if (!validation.allowed) {
      useUIStore.getState().addNotification({
        type: 'error',
        message: validation.reasons[0] || 'Cannot advance week',
        duration: 3000,
      });
      return;
    }

    // Execute simulation (unchanged)
    simulation.simulateNextWeek();

    // Sync season store after completion
    syncSeason();
  }, [simulation, validateWeekAdvancement, syncSeason]);

  // Clear modal states helper
  const clearSeasonEvaluation = useCallback(() => {
    setSeasonEvaluation(null);
    setDevelopmentReports([]);
    setLastSimulationResults([]);
  }, []);

  return {
    // Simulation action
    simulateNextWeek,

    // UI state
    lastSimulationResults,
    developmentReports,
    seasonTopPerformers,
    seasonEvaluation,
    pendingAchievements,
    youthProspects,

    // Helpers
    clearSeasonEvaluation,
  };
}
