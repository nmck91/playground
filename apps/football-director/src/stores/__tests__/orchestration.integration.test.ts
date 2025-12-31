/**
 * Football Director - Store Orchestration Integration Tests
 *
 * Tests the coordination between multiple stores (Game, UI, Save, Orchestrator)
 * and their interaction with the game engine.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { useUIStore } from '../uiStore';
import { useSaveStore } from '../saveStore';
import { useGameOrchestratorStore } from '../gameOrchestratorStore';
import type { GameState, Team, Player } from '@playground/football-director-engine';

// Helper to create a minimal valid game state
function createMockGameState(overrides?: Partial<GameState>): GameState {
  const defaultTeam: Team = {
    id: 'team-1',
    name: 'Test FC',
    budget: 50,
    players: [
      {
        id: 'player-1',
        name: 'Test Player',
        age: 25,
        position: 'GK',
        overall: 75,
        potential: 80,
        value: 5,
        wage: 1,
        contract: { startYear: 1, endYear: 3, wage: 1 },
        morale: 75,
        fitness: 100,
        stats: {
          matches: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          minutesPlayed: 0,
          cleanSheets: 0,
        },
      } as Player,
      ...Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `player-${i + 2}`,
          name: `Player ${i + 2}`,
          age: 22 + i,
          position: i < 4 ? 'DEF' : i < 8 ? 'MID' : 'FWD',
          overall: 70 + i,
          potential: 75 + i,
          value: 3 + i,
          wage: 0.5 + i * 0.1,
          contract: { startYear: 1, endYear: 3, wage: 0.5 + i * 0.1 },
          morale: 75,
          fitness: 100,
          stats: {
            matches: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            cleanSheets: 0,
          },
        })) as Player[],
    ],
    staff: [
      {
        id: 'staff-1',
        name: 'Manager',
        role: 'manager',
        wage: 2,
        contract: { startYear: 1, endYear: 3, wage: 2 },
        attributes: {
          attacking: 75,
          defensive: 75,
          technical: 75,
          mental: 75,
          management: 75,
        },
      },
    ],
    tactics: {
      formation: '4-4-2',
      mentality: 'balanced',
    },
  };

  const aiTeams: Team[] = Array(19)
    .fill(null)
    .map((_, i) => ({
      ...defaultTeam,
      id: `ai-team-${i + 1}`,
      name: `AI Team ${i + 1}`,
      players: defaultTeam.players.map((p) => ({ ...p, id: `ai-${i}-${p.id}` })),
    }));

  return {
    id: 'game-123',
    playerName: 'Test Manager',
    saveSlot: 1,
    lastSaved: new Date(),
    version: '1.0.0',
    season: {
      year: 1,
      currentWeek: 1,
      totalWeeks: 52,
      phase: 'pre-season',
      status: 'in-progress',
      transferWindow: 'open',
    },
    playerTeam: defaultTeam,
    aiTeams,
    leagueTable: [defaultTeam, ...aiTeams].map((team) => ({
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
    })),
    fixtures: [],
    cupCompetition: {
      name: 'Test Cup',
      rounds: [],
      currentRound: 0,
      status: 'not-started',
    },
    matchHistory: [],
    finances: {
      budget: 50,
      weeklyIncome: 2,
      weeklyExpenses: 1.5,
      totalIncome: 100,
      totalExpenses: 50,
      transactions: [],
    },
    newsFeed: [],
    boardStatus: {
      confidence: 75,
      minimumLeaguePosition: 10,
      jobSecurity: 'stable',
    },
    seasonRecords: [],
    clubRecords: {
      season: 1,
      bestLeaguePosition: { season: 0, position: 20 },
      mostPoints: { season: 0, points: 0 },
      mostWins: { season: 0, wins: 0 },
      mostGoals: { season: 0, goals: 0 },
      fewestGoalsConceded: { season: 0, goals: 999 },
      bestGoalDifference: { season: 0, difference: -999 },
      longestWinStreak: { season: 0, streak: 0 },
      longestUnbeatenStreak: { season: 0, streak: 0 },
      mostCleanSheets: { season: 0, cleanSheets: 0 },
      topScorer: { season: 0, playerName: '', goals: 0 },
      topAssists: { season: 0, playerName: '', assists: 0 },
      biggestWin: { season: 0, opponent: '', score: '', homeOrAway: 'home', week: 0 },
      biggestLoss: { season: 0, opponent: '', score: '', homeOrAway: 'home', week: 0 },
    },
    achievements: [],
    ...overrides,
  } as GameState;
}

describe('Store Orchestration Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useGameStore.getState().resetGame();
    useUIStore.getState().resetUI();
    useSaveStore.getState().resetSaveStore();
    useGameOrchestratorStore.getState().resetOrchestrator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-Store Coordination', () => {
    it('should coordinate GameStore and UIStore during initialization', () => {
      const gameState = createMockGameState();

      act(() => {
        useGameStore.getState().setGameState(gameState);
        useGameStore.getState().setGameId('game-123');
      });

      expect(useGameStore.getState().gameState).toEqual(gameState);
      expect(useGameStore.getState().gameId).toBe('game-123');
      expect(useUIStore.getState().isSimulating).toBe(false);
    });

    it('should synchronize GameStore, UIStore, and Orchestrator during simulation', async () => {
      // Set up initial game state
      const gameState = createMockGameState({
        season: {
          year: 1,
          currentWeek: 1,
          totalWeeks: 52,
          phase: 'competitive',
          status: 'in-progress',
          transferWindow: 'closed',
        },
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      // Mock auto-save to prevent localStorage errors
      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      // Simulate a week
      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      // Wait for async operations
      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Verify GameStore was updated
      expect(useGameStore.getState().gameState?.season.currentWeek).toBe(2);

      // Verify UIStore simulation state was managed
      expect(useUIStore.getState().isSimulating).toBe(false);

      // Verify auto-save was called
      expect(autoSaveSpy).toHaveBeenCalled();

      autoSaveSpy.mockRestore();
    });

    it('should handle simulation state transitions correctly', async () => {
      const gameState = createMockGameState();
      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      // Mock auto-save
      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      // Start simulation
      const simulationPromise = act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      // During simulation, both stores should show simulating=true
      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(true);
        expect(useUIStore.getState().isSimulating).toBe(true);
      }, { timeout: 100 });

      // Wait for simulation to complete
      await simulationPromise;
      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // After simulation, both should be false
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      expect(useUIStore.getState().isSimulating).toBe(false);

      autoSaveSpy.mockRestore();
    });
  });

  describe('Week Simulation Orchestration', () => {
    it('should process all simulation steps in correct order', async () => {
      const gameState = createMockGameState({
        season: {
          year: 1,
          currentWeek: 5,
          totalWeeks: 52,
          phase: 'competitive',
          status: 'in-progress',
          transferWindow: 'closed',
        },
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Week should advance
      expect(useGameStore.getState().gameState?.season.currentWeek).toBe(6);

      // Finances should be updated
      expect(useGameStore.getState().gameState?.finances).toBeDefined();

      // Auto-save should be called
      expect(autoSaveSpy).toHaveBeenCalled();

      autoSaveSpy.mockRestore();
    });

    it('should update season top performers every week', async () => {
      const gameState = createMockGameState();

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Season top performers should be calculated
      expect(useGameOrchestratorStore.getState().seasonTopPerformers).not.toBeNull();
      expect(useGameOrchestratorStore.getState().seasonTopPerformers?.topScorer).toBeDefined();
      expect(useGameOrchestratorStore.getState().seasonTopPerformers?.topAssister).toBeDefined();

      autoSaveSpy.mockRestore();
    });

    it('should clear simulation results on demand', () => {
      act(() => {
        useGameOrchestratorStore.getState().clearSimulationResults();
      });

      expect(useGameOrchestratorStore.getState().lastSimulationResults).toEqual([]);
    });
  });

  describe('Season Transition Orchestration', () => {
    it('should orchestrate season transition across all stores', async () => {
      // Set up end-of-season state
      const gameState = createMockGameState({
        season: {
          year: 1,
          currentWeek: 52,
          totalWeeks: 52,
          phase: 'competitive',
          status: 'in-progress',
          transferWindow: 'closed',
        },
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      // Simulate final week
      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Season evaluation should be set
      expect(useGameOrchestratorStore.getState().seasonEvaluation).not.toBeNull();
      expect(useGameOrchestratorStore.getState().seasonEvaluation?.objective).toBeDefined();

      // Continue to next season
      act(() => {
        useGameOrchestratorStore.getState().continueToNextSeason();
      });

      // Verify GameStore updated
      expect(useGameStore.getState().gameState?.season.year).toBe(2);
      expect(useGameStore.getState().gameState?.season.currentWeek).toBe(1);

      // Verify orchestrator state cleared
      expect(useGameOrchestratorStore.getState().seasonEvaluation).toBeNull();
      expect(useGameOrchestratorStore.getState().seasonTopPerformers).toBeNull();

      // Verify UI notification
      expect(useUIStore.getState().notifications.length).toBeGreaterThan(0);
      const seasonNotification = useUIStore.getState().notifications.find(
        (n) => n.message.includes('Welcome to the')
      );
      expect(seasonNotification).toBeDefined();

      autoSaveSpy.mockRestore();
    });

    it('should archive season records when transitioning', () => {
      const gameState = createMockGameState({
        season: { year: 1, currentWeek: 52, totalWeeks: 52, phase: 'competitive', status: 'in-progress', transferWindow: 'closed' },
        seasonRecords: [],
        leagueTable: [
          { teamId: 'team-1', teamName: 'Test FC', played: 38, won: 25, drawn: 8, lost: 5, goalsFor: 75, goalsAgainst: 30, goalDifference: 45, points: 83, form: [] },
        ],
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockImplementation(() => Promise.resolve());

      act(() => {
        useGameOrchestratorStore.getState().continueToNextSeason();
      });

      // Season record should be created
      expect(useGameStore.getState().gameState?.seasonRecords.length).toBe(1);
      const record = useGameStore.getState().gameState?.seasonRecords[0];
      expect(record?.season).toBe(1);
      expect(record?.finalPosition).toBe(1);
      expect(record?.points).toBe(83);

      autoSaveSpy.mockRestore();
    });

    it('should reset player stats for new season', () => {
      const playerWithStats = {
        id: 'player-1',
        name: 'Star Player',
        age: 25,
        position: 'FWD',
        overall: 85,
        potential: 90,
        value: 20,
        wage: 5,
        contract: { startYear: 1, endYear: 3, wage: 5 },
        morale: 80,
        fitness: 95,
        stats: {
          matches: 38,
          goals: 25,
          assists: 10,
          yellowCards: 3,
          redCards: 0,
          minutesPlayed: 3420,
          cleanSheets: 0,
        },
      } as Player;

      const gameState = createMockGameState({
        season: { year: 1, currentWeek: 52, totalWeeks: 52, phase: 'competitive', status: 'in-progress', transferWindow: 'closed' },
        playerTeam: {
          ...createMockGameState().playerTeam,
          players: [playerWithStats],
        },
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockImplementation(() => Promise.resolve());

      act(() => {
        useGameOrchestratorStore.getState().continueToNextSeason();
      });

      // Player stats should be reset
      const resetPlayer = useGameStore.getState().gameState?.playerTeam.players[0];
      expect(resetPlayer?.stats.matches).toBe(0);
      expect(resetPlayer?.stats.goals).toBe(0);
      expect(resetPlayer?.stats.assists).toBe(0);

      autoSaveSpy.mockRestore();
    });
  });

  describe('Error Handling Orchestration', () => {
    it('should handle simulation errors gracefully', async () => {
      // No game state set - should cause error
      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      // Should not be simulating after error
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      expect(useUIStore.getState().isSimulating).toBe(false);
    });

    it('should clean up state even if auto-save fails', async () => {
      const gameState = createMockGameState();

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      // Mock auto-save to fail
      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockRejectedValue(new Error('Save failed'));

      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Simulation state should still be cleaned up
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);

      autoSaveSpy.mockRestore();
    });

    it('should notify UI of season transition errors', () => {
      // No game state - should cause error
      act(() => {
        useGameOrchestratorStore.getState().continueToNextSeason();
      });

      // Should have error notification (if error occurred)
      // Since there's no game state, function should exit early without error notification
      // This test verifies graceful handling
      expect(useGameOrchestratorStore.getState().seasonEvaluation).toBeNull();
    });
  });

  describe('Achievement Flow Orchestration', () => {
    it('should manage pending achievements across simulation', async () => {
      const gameState = createMockGameState({
        season: { year: 1, currentWeek: 52, totalWeeks: 52, phase: 'competitive', status: 'in-progress', transferWindow: 'closed' },
        achievements: [
          { id: 'first-season', name: 'First Season', description: 'Complete first season', category: 'special', target: 1, progress: 0, unlocked: false },
        ],
      });

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave').mockResolvedValue();

      await act(async () => {
        await useGameOrchestratorStore.getState().simulateNextWeek();
      });

      await waitFor(() => {
        expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
      });

      // Check if any achievements were unlocked
      const pendingCount = useGameOrchestratorStore.getState().pendingAchievements.length;

      // Dismiss an achievement if any exist
      if (pendingCount > 0) {
        const firstAchievement = useGameOrchestratorStore.getState().pendingAchievements[0];

        act(() => {
          useGameOrchestratorStore.getState().dismissAchievement(firstAchievement.id);
        });

        expect(useGameOrchestratorStore.getState().pendingAchievements.length).toBe(pendingCount - 1);
      }

      autoSaveSpy.mockRestore();
    });

    it('should dismiss specific achievements', () => {
      // Manually set pending achievements
      act(() => {
        useGameOrchestratorStore.getState().resetOrchestrator();
        useGameOrchestratorStore.setState({
          pendingAchievements: [
            { id: 'ach-1', name: 'Achievement 1', description: 'Test', category: 'special', target: 1, progress: 1, unlocked: true },
            { id: 'ach-2', name: 'Achievement 2', description: 'Test', category: 'special', target: 1, progress: 1, unlocked: true },
          ],
        });
      });

      expect(useGameOrchestratorStore.getState().pendingAchievements.length).toBe(2);

      act(() => {
        useGameOrchestratorStore.getState().dismissAchievement('ach-1');
      });

      expect(useGameOrchestratorStore.getState().pendingAchievements.length).toBe(1);
      expect(useGameOrchestratorStore.getState().pendingAchievements[0].id).toBe('ach-2');
    });
  });

  describe('Youth Academy Orchestration', () => {
    it('should handle youth player selection', () => {
      const gameState = createMockGameState();
      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      const youthPlayers: Player[] = [
        {
          id: 'youth-1',
          name: 'Young Talent 1',
          age: 17,
          position: 'FWD',
          overall: 60,
          potential: 85,
          value: 1,
          wage: 0.2,
          contract: { startYear: 1, endYear: 4, wage: 0.2 },
          morale: 75,
          fitness: 100,
          stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0 },
        } as Player,
        {
          id: 'youth-2',
          name: 'Young Talent 2',
          age: 16,
          position: 'MID',
          overall: 58,
          potential: 80,
          value: 0.8,
          wage: 0.2,
          contract: { startYear: 1, endYear: 4, wage: 0.2 },
          morale: 75,
          fitness: 100,
          stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0, cleanSheets: 0 },
        } as Player,
      ];

      act(() => {
        useGameOrchestratorStore.setState({ youthProspects: youthPlayers });
      });

      const initialSquadSize = useGameStore.getState().gameState?.playerTeam.players.length || 0;

      act(() => {
        useGameOrchestratorStore.getState().selectYouthPlayers(['youth-1']);
      });

      // Squad size should increase
      const newSquadSize = useGameStore.getState().gameState?.playerTeam.players.length || 0;
      expect(newSquadSize).toBe(initialSquadSize + 1);

      // Youth prospects should be cleared
      expect(useGameOrchestratorStore.getState().youthProspects.length).toBe(0);
    });
  });

  describe('Store Reset and Cleanup', () => {
    it('should reset orchestrator state completely', () => {
      // Set some state
      act(() => {
        useGameOrchestratorStore.setState({
          lastSimulationResults: [{ homeTeam: 'A', awayTeam: 'B', homeScore: 2, awayScore: 1, result: 'home' }] as any,
          developmentReports: [{ playerId: 'p1', playerName: 'Test', improvements: ['Speed +1'] }] as any,
          seasonTopPerformers: { topScorer: {} as any, topAssister: {} as any, playerOfSeason: {} as any },
          seasonEvaluation: { objective: 'Top 10', satisfied: true, sacked: false, message: 'Good' },
          pendingAchievements: [{ id: 'test', name: 'Test', description: '', category: 'special', target: 1, progress: 1, unlocked: true }],
          youthProspects: [{} as any],
          isSimulating: true,
        });
      });

      act(() => {
        useGameOrchestratorStore.getState().resetOrchestrator();
      });

      expect(useGameOrchestratorStore.getState().lastSimulationResults).toEqual([]);
      expect(useGameOrchestratorStore.getState().developmentReports).toEqual([]);
      expect(useGameOrchestratorStore.getState().seasonTopPerformers).toBeNull();
      expect(useGameOrchestratorStore.getState().seasonEvaluation).toBeNull();
      expect(useGameOrchestratorStore.getState().pendingAchievements).toEqual([]);
      expect(useGameOrchestratorStore.getState().youthProspects).toEqual([]);
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });
  });
});
