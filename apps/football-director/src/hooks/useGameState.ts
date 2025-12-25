/**
 * Football Director - useGameState Hook (Refactored)
 * Main game state management hook - orchestrates all sub-hooks
 */

'use client';

import { useState } from 'react';
import {
  GameState,
  MatchResult,
  DevelopmentReport,
  Achievement,
  Player,
  BoardObjective,
  SeasonAward,
  SeasonTopPerformers,
} from '@playground/football-director-engine';
import { useGamePersistence } from './useGamePersistence';
import { useDerivedGameState } from './useDerivedGameState';
import { useGameActions } from './useGameActions';
import { useWeeklySimulation } from './useWeeklySimulation';

/**
 * Main game state hook - composes all sub-hooks into unified interface
 *
 * @returns Complete game state and actions
 *
 * @example
 * ```typescript
 * const { gameState, actions, loading, error } = useGameState();
 *
 * // Create new game
 * actions.newGame('My Save');
 *
 * // Simulate week
 * actions.simulateNextWeek();
 *
 * // Buy player
 * actions.buyPlayer(listing);
 * ```
 */
export function useGameState() {
  // Core state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state (results/reports to display)
  const [lastSimulationResults, setLastSimulationResults] = useState<MatchResult[]>([]);
  const [developmentReports, setDevelopmentReports] = useState<DevelopmentReport[]>([]);
  const [seasonTopPerformers, setSeasonTopPerformers] = useState<SeasonTopPerformers | null>(null);
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

  // Compose sub-hooks
  const persistence = useGamePersistence(gameState, setGameState, setError);

  const derived = useDerivedGameState(gameState, persistence.loading);

  const actions = useGameActions(
    gameState,
    setGameState,
    setError,
    setPendingAchievements,
    setYouthProspects
  );

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

  // Clear modal states when continuing to next season
  const continueToNextSeasonWithCleanup = () => {
    setSeasonEvaluation(null);
    setDevelopmentReports([]);
    setLastSimulationResults([]);
    actions.continueToNextSeason();
  };

  // Return unified interface (SAME AS BEFORE for backward compatibility)
  return {
    // State
    gameState,
    loading: persistence.loading,
    error,
    lastSimulationResults,
    developmentReports,
    seasonTopPerformers: derived.seasonTopPerformers || seasonTopPerformers,
    seasonEvaluation,
    pendingAchievements,
    youthProspects,
    hasSave: derived.hasSave,

    // Actions
    actions: {
      // Persistence
      newGame: persistence.newGame,
      loadSlot: persistence.loadSlot,
      deleteSave: persistence.deleteSave,

      // Simulation
      simulateNextWeek: simulation.simulateNextWeek,

      // Player actions
      buyPlayer: actions.buyPlayer,
      sellPlayer: actions.sellPlayer,

      // Staff actions
      hireStaff: actions.hireStaff,
      fireStaff: actions.fireStaff,

      // Team management
      setTeamTactics: actions.setTeamTactics,
      setClubPhilosophy: actions.setClubPhilosophy,
      offerContract: actions.offerContract,
      selectYouthPlayers: actions.selectYouthPlayers,

      // UI actions
      dismissAchievement: actions.dismissAchievement,
      markAllNewsRead: actions.markAllNewsRead,

      // Season management
      continueToNextSeason: continueToNextSeasonWithCleanup,
    },
  };
}
