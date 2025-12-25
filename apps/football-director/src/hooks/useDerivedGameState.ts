/**
 * Football Director - useDerivedGameState Hook
 * Calculates derived values from game state
 */

'use client';

import { useMemo } from 'react';
import { GameState, PlayerStatsTracker, SeasonTopPerformers } from '@playground/football-director-engine';

/**
 * Hook for calculating derived/computed values from game state
 *
 * @param gameState - Current game state
 * @param loading - Whether the game is still loading
 * @returns Derived state values
 *
 * @example
 * ```typescript
 * const derived = useDerivedGameState(gameState, loading);
 * console.log(derived.seasonTopPerformers); // Top scorers/assisters
 * console.log(derived.hasSave); // true if save exists
 * ```
 */
export function useDerivedGameState(gameState: GameState | null, loading: boolean) {
  /**
   * Calculate season top performers (memoized to avoid recalculation)
   */
  const seasonTopPerformers = useMemo<SeasonTopPerformers | null>(() => {
    if (!gameState || loading) return null;

    const statsTracker = new PlayerStatsTracker();
    return statsTracker.getTopPerformers(gameState.playerTeam);
  }, [gameState?.playerTeam.players, loading]);

  /**
   * Check if save exists
   */
  const hasSave = !!gameState;

  return {
    seasonTopPerformers,
    hasSave,
  };
}
