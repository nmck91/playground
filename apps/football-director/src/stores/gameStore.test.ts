/**
 * Football Director - Game Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore, gameSelectors } from './gameStore';
import type { GameState } from '@playground/football-director-engine';

// Mock game state
const mockGameState: Partial<GameState> = {
  id: 'game-123',
  season: {
    currentSeason: 1,
    currentWeek: 10,
    currentPhase: 'regular',
    totalWeeks: 52,
  },
  playerTeam: {
    id: 'team-1',
    name: 'Test FC',
    budget: 50,
    players: [],
    staff: [],
    tactics: {} as any,
  },
} as GameState;

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().resetGame();
  });

  describe('State Management', () => {
    it('should initialize with null game state', () => {
      const { result } = renderHook(() => useGameStore());
      expect(result.current.gameState).toBeNull();
      expect(result.current.gameId).toBeNull();
      expect(result.current.currentSaveSlot).toBeNull();
    });

    it('should set game state', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setGameState(mockGameState as GameState);
      });

      expect(result.current.gameState).toEqual(mockGameState);
    });

    it('should update game state with updater function', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setGameState(mockGameState as GameState);
      });

      act(() => {
        result.current.updateGameState((state) => ({
          ...state,
          season: {
            ...state.season,
            currentWeek: 15,
          },
        }));
      });

      expect(result.current.gameState?.season.currentWeek).toBe(15);
    });

    it('should not update when game state is null', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.updateGameState((state) => ({
          ...state,
          season: {
            ...state.season,
            currentWeek: 20,
          },
        }));
      });

      expect(result.current.gameState).toBeNull();
    });

    it('should set game metadata', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setGameId('game-456');
        result.current.setCurrentSaveSlot(2);
        result.current.setLastSaved(new Date('2025-01-01'));
      });

      expect(result.current.gameId).toBe('game-456');
      expect(result.current.currentSaveSlot).toBe(2);
      expect(result.current.lastSaved).toEqual(new Date('2025-01-01'));
    });

    it('should reset game', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.setGameState(mockGameState as GameState);
        result.current.setGameId('game-789');
        result.current.setCurrentSaveSlot(3);
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState).toBeNull();
      expect(result.current.gameId).toBeNull();
      expect(result.current.currentSaveSlot).toBeNull();
      expect(result.current.lastSaved).toBeNull();
    });
  });

  describe('Selectors', () => {
    it('should select game state', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.gameState));

      expect(result.current).toBeNull();

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toEqual(mockGameState);
    });

    it('should check if game exists', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.hasGame));

      expect(result.current).toBe(false);

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toBe(true);
    });

    it('should select current week', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.currentWeek));

      expect(result.current).toBe(0);

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toBe(10);
    });

    it('should select current season', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.currentSeason));

      expect(result.current).toBe(0);

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toBe(1);
    });

    it('should select budget', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.budget));

      expect(result.current).toBe(0);

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toBe(50);
    });

    it('should select team name', () => {
      const { result } = renderHook(() => useGameStore(gameSelectors.teamName));

      expect(result.current).toBe('');

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
      });

      expect(result.current).toBe('Test FC');
    });
  });
});
