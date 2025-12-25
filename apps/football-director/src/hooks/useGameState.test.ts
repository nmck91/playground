/**
 * Football Director - useGameState Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { SaveService } from '../services/SaveService';
import type { GameState } from '@playground/football-director-engine';

// Mock SaveService
vi.mock('../services/SaveService', () => ({
  SaveService: {
    loadGame: vi.fn(),
    saveGame: vi.fn(),
    createNewSave: vi.fn(),
    loadFromSlot: vi.fn(),
    setActiveSlot: vi.fn(),
    deleteSave: vi.fn(),
  },
}));

// Mock sub-hooks to verify composition
vi.mock('./useGamePersistence', () => ({
  useGamePersistence: vi.fn((gameState, setGameState, setError) => ({
    loading: false,
    newGame: vi.fn(),
    loadSlot: vi.fn(),
    deleteSave: vi.fn(),
  })),
}));

vi.mock('./useDerivedGameState', () => ({
  useDerivedGameState: vi.fn(() => ({
    seasonTopPerformers: null,
    hasSave: false,
  })),
}));

vi.mock('./useGameActions', () => ({
  useGameActions: vi.fn(() => ({
    buyPlayer: vi.fn(),
    sellPlayer: vi.fn(),
    hireStaff: vi.fn(),
    fireStaff: vi.fn(),
    setTeamTactics: vi.fn(),
    setClubPhilosophy: vi.fn(),
    offerContract: vi.fn(),
    selectYouthPlayers: vi.fn(),
    markAllNewsRead: vi.fn(),
    continueToNextSeason: vi.fn(),
    dismissAchievement: vi.fn(),
  })),
}));

vi.mock('./useWeeklySimulation', () => ({
  useWeeklySimulation: vi.fn(() => ({
    simulateNextWeek: vi.fn(),
  })),
}));

describe('useGameState Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hook composition', () => {
    it('should compose all sub-hooks correctly', () => {
      const { result } = renderHook(() => useGameState());

      // Verify return interface has all expected properties
      expect(result.current).toHaveProperty('gameState');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('lastSimulationResults');
      expect(result.current).toHaveProperty('developmentReports');
      expect(result.current).toHaveProperty('seasonTopPerformers');
      expect(result.current).toHaveProperty('seasonEvaluation');
      expect(result.current).toHaveProperty('pendingAchievements');
      expect(result.current).toHaveProperty('youthProspects');
      expect(result.current).toHaveProperty('hasSave');
      expect(result.current).toHaveProperty('actions');
    });

    it('should expose all actions', () => {
      const { result } = renderHook(() => useGameState());

      // Verify all actions are exposed
      expect(result.current.actions).toHaveProperty('newGame');
      expect(result.current.actions).toHaveProperty('loadSlot');
      expect(result.current.actions).toHaveProperty('deleteSave');
      expect(result.current.actions).toHaveProperty('simulateNextWeek');
      expect(result.current.actions).toHaveProperty('buyPlayer');
      expect(result.current.actions).toHaveProperty('sellPlayer');
      expect(result.current.actions).toHaveProperty('hireStaff');
      expect(result.current.actions).toHaveProperty('fireStaff');
      expect(result.current.actions).toHaveProperty('setTeamTactics');
      expect(result.current.actions).toHaveProperty('setClubPhilosophy');
      expect(result.current.actions).toHaveProperty('offerContract');
      expect(result.current.actions).toHaveProperty('selectYouthPlayers');
      expect(result.current.actions).toHaveProperty('dismissAchievement');
      expect(result.current.actions).toHaveProperty('markAllNewsRead');
      expect(result.current.actions).toHaveProperty('continueToNextSeason');
    });
  });

  describe('state management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.gameState).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.lastSimulationResults).toEqual([]);
      expect(result.current.developmentReports).toEqual([]);
      expect(result.current.seasonTopPerformers).toBeNull();
      expect(result.current.seasonEvaluation).toBeNull();
      expect(result.current.pendingAchievements).toEqual([]);
      expect(result.current.youthProspects).toEqual([]);
    });
  });

  describe('continueToNextSeason cleanup', () => {
    it('should clear modal states when continuing to next season', () => {
      const { result } = renderHook(() => useGameState());

      // Set some modal state
      act(() => {
        result.current.actions.continueToNextSeason();
      });

      // The wrapped continueToNextSeason should clear these states
      expect(result.current.seasonEvaluation).toBeNull();
      expect(result.current.developmentReports).toEqual([]);
      expect(result.current.lastSimulationResults).toEqual([]);
    });
  });

  describe('backward compatibility', () => {
    it('should maintain same interface as original useGameState', () => {
      const { result } = renderHook(() => useGameState());

      // Expected shape based on original implementation
      const expectedInterface = {
        // State
        gameState: expect.anything(),
        loading: expect.anything(),
        error: expect.anything(),
        lastSimulationResults: expect.anything(),
        developmentReports: expect.anything(),
        seasonTopPerformers: expect.anything(),
        seasonEvaluation: expect.anything(),
        pendingAchievements: expect.anything(),
        youthProspects: expect.anything(),
        hasSave: expect.anything(),

        // Actions
        actions: expect.objectContaining({
          newGame: expect.any(Function),
          loadSlot: expect.any(Function),
          deleteSave: expect.any(Function),
          simulateNextWeek: expect.any(Function),
          buyPlayer: expect.any(Function),
          sellPlayer: expect.any(Function),
          hireStaff: expect.any(Function),
          fireStaff: expect.any(Function),
          setTeamTactics: expect.any(Function),
          setClubPhilosophy: expect.any(Function),
          offerContract: expect.any(Function),
          selectYouthPlayers: expect.any(Function),
          dismissAchievement: expect.any(Function),
          markAllNewsRead: expect.any(Function),
          continueToNextSeason: expect.any(Function),
        }),
      };

      expect(result.current).toMatchObject(expectedInterface);
    });

    it('should have exactly the same number of top-level properties', () => {
      const { result } = renderHook(() => useGameState());

      const topLevelKeys = Object.keys(result.current);

      // Original had 11 properties: 10 state + 1 actions object
      expect(topLevelKeys).toHaveLength(11);
      expect(topLevelKeys).toContain('gameState');
      expect(topLevelKeys).toContain('loading');
      expect(topLevelKeys).toContain('error');
      expect(topLevelKeys).toContain('lastSimulationResults');
      expect(topLevelKeys).toContain('developmentReports');
      expect(topLevelKeys).toContain('seasonTopPerformers');
      expect(topLevelKeys).toContain('seasonEvaluation');
      expect(topLevelKeys).toContain('pendingAchievements');
      expect(topLevelKeys).toContain('youthProspects');
      expect(topLevelKeys).toContain('hasSave');
      expect(topLevelKeys).toContain('actions');
    });

    it('should have exactly the same number of action methods', () => {
      const { result } = renderHook(() => useGameState());

      const actionKeys = Object.keys(result.current.actions);

      // Original had 15 action methods
      expect(actionKeys).toHaveLength(15);
    });
  });
});
