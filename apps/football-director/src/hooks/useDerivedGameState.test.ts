/**
 * Football Director - useDerivedGameState Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDerivedGameState } from './useDerivedGameState';
import { PlayerStatsTracker } from '@playground/football-director-engine';
import type { GameState, SeasonTopPerformers } from '@playground/football-director-engine';

// Mock PlayerStatsTracker
let mockGetTopPerformers: ReturnType<typeof vi.fn>;

vi.mock('@playground/football-director-engine', async () => {
  const actual = await vi.importActual('@playground/football-director-engine');

  class MockPlayerStatsTracker {
    getTopPerformers = (...args: any[]) => mockGetTopPerformers(...args);
  }

  return {
    ...actual,
    PlayerStatsTracker: MockPlayerStatsTracker,
  };
});

describe('useDerivedGameState', () => {
  let mockGameState: GameState | null;

  beforeEach(() => {
    mockGetTopPerformers = vi.fn();
  });

  describe('seasonTopPerformers', () => {
    it('should return null when no game state', () => {
      const { result } = renderHook(() => useDerivedGameState(null, false));

      expect(result.current.seasonTopPerformers).toBeNull();
      expect(mockGetTopPerformers).not.toHaveBeenCalled();
    });

    it('should return null while loading', () => {
      mockGameState = {
        playerTeam: {
          id: 'test-team',
          players: [],
        },
      } as GameState;

      const { result } = renderHook(() => useDerivedGameState(mockGameState, true));

      expect(result.current.seasonTopPerformers).toBeNull();
      expect(mockGetTopPerformers).not.toHaveBeenCalled();
    });

    it('should calculate top performers when game state exists', () => {
      const mockTopPerformers: SeasonTopPerformers = {
        topScorer: {
          playerId: 'player-1',
          playerName: 'Top Scorer',
          goals: 20,
        },
        topAssister: {
          playerId: 'player-2',
          playerName: 'Top Assister',
          assists: 15,
        },
      };

      mockGetTopPerformers.mockReturnValue(mockTopPerformers);

      mockGameState = {
        playerTeam: {
          id: 'test-team',
          players: [
            { id: 'player-1', name: 'Top Scorer' },
            { id: 'player-2', name: 'Top Assister' },
          ],
        },
      } as GameState;

      const { result } = renderHook(() => useDerivedGameState(mockGameState, false));

      expect(result.current.seasonTopPerformers).toEqual(mockTopPerformers);
      expect(mockGetTopPerformers).toHaveBeenCalledWith(mockGameState.playerTeam);
    });

    it('should memoize calculation - not recalculate if players unchanged', () => {
      mockGameState = {
        playerTeam: {
          id: 'test-team',
          players: [{ id: 'player-1' }],
        },
        season: { year: 2024 },
      } as GameState;

      const { rerender } = renderHook(
        ({ state, loading }) => useDerivedGameState(state, loading),
        { initialProps: { state: mockGameState, loading: false } }
      );

      expect(mockGetTopPerformers).toHaveBeenCalledTimes(1);

      // Rerender with same game state but different season (non-player field)
      const updatedState = {
        ...mockGameState,
        season: { year: 2025 },
      } as GameState;

      rerender({ state: updatedState, loading: false });

      // Should NOT recalculate (memoized)
      expect(mockGetTopPerformers).toHaveBeenCalledTimes(1);
    });

    it('should recalculate when players change', () => {
      mockGameState = {
        playerTeam: {
          id: 'test-team',
          players: [{ id: 'player-1' }],
        },
      } as GameState;

      const { rerender } = renderHook(
        ({ state, loading }) => useDerivedGameState(state, loading),
        { initialProps: { state: mockGameState, loading: false } }
      );

      expect(mockGetTopPerformers).toHaveBeenCalledTimes(1);

      // Update players array
      const updatedState = {
        playerTeam: {
          id: 'test-team',
          players: [{ id: 'player-1' }, { id: 'player-2' }],
        },
      } as GameState;

      rerender({ state: updatedState, loading: false });

      // Should recalculate
      expect(mockGetTopPerformers).toHaveBeenCalledTimes(2);
    });

    it('should recalculate when loading changes from true to false', () => {
      mockGameState = {
        playerTeam: {
          id: 'test-team',
          players: [{ id: 'player-1' }],
        },
      } as GameState;

      const { rerender } = renderHook(
        ({ state, loading }) => useDerivedGameState(state, loading),
        { initialProps: { state: mockGameState, loading: true } }
      );

      expect(mockGetTopPerformers).not.toHaveBeenCalled();

      // Loading completes
      rerender({ state: mockGameState, loading: false });

      // Should now calculate
      expect(mockGetTopPerformers).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasSave', () => {
    it('should return false when no game state', () => {
      const { result } = renderHook(() => useDerivedGameState(null, false));

      expect(result.current.hasSave).toBe(false);
    });

    it('should return true when game state exists', () => {
      mockGameState = {
        playerTeam: { id: 'test-team' },
      } as GameState;

      const { result } = renderHook(() => useDerivedGameState(mockGameState, false));

      expect(result.current.hasSave).toBe(true);
    });

    it('should return true even while loading if game state exists', () => {
      mockGameState = {
        playerTeam: { id: 'test-team' },
      } as GameState;

      const { result } = renderHook(() => useDerivedGameState(mockGameState, true));

      expect(result.current.hasSave).toBe(true);
    });
  });
});
