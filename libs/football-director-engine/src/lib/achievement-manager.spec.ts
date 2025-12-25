/**
 * Football Director Engine - Achievement Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementManager } from './achievement-manager';
import { Achievement, GameState, Player } from './types';
import { createMockPlayer, createMockGameState } from '../__tests__';

describe('AchievementManager', () => {
  let manager: AchievementManager;

  beforeEach(() => {
    manager = new AchievementManager();
  });

  describe('getAllAchievements', () => {
    it('should return all achievements', () => {
      const achievements = manager.getAllAchievements();

      expect(achievements.length).toBeGreaterThan(20);
    });

    it('should have achievements in all categories', () => {
      const achievements = manager.getAllAchievements();

      const categories = new Set(achievements.map(a => a.category));
      expect(categories.has('league')).toBe(true);
      expect(categories.has('goals')).toBe(true);
      expect(categories.has('defense')).toBe(true);
      expect(categories.has('finance')).toBe(true);
      expect(categories.has('players')).toBe(true);
      expect(categories.has('special')).toBe(true);
    });

    it('should have all achievements initially unlocked as false', () => {
      const achievements = manager.getAllAchievements();

      achievements.forEach(achievement => {
        expect(achievement.unlocked).toBe(false);
      });
    });

    it('should have specific achievements', () => {
      const achievements = manager.getAllAchievements();

      expect(achievements.find(a => a.id === 'league-champion')).toBeDefined();
      expect(achievements.find(a => a.id === 'perfect-season')).toBeDefined();
      expect(achievements.find(a => a.id === 'millionaire')).toBeDefined();
    });
  });

  describe('checkAchievements', () => {
    it('should unlock league champion achievement for 1st place', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
        leagueTable: [
          {
            teamId: 'player-team',
            teamName: 'Player FC',
            won: 30,
            drawn: 5,
            lost: 3,
            goalsFor: 90,
            goalsAgainst: 30,
            points: 95,
            goalDifference: 60
          },
        ],
        playerTeam: {
          ...createMockGameState().playerTeam!,
          id: 'player-team',
        },
      };

      const achievements: Achievement[] = [
        {
          id: 'league-champion',
          name: 'League Champion',
          description: 'Win the league title',
          category: 'league',
          icon: '🏆',
          unlocked: false,
        },
      ];

      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('league-champion');
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should not unlock achievements mid-season', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: {
          year: 2024,
          currentWeek: 20,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress',
          phase: 'competitive',
          transferWindow: 'closed',
        },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 15, drawn: 3, lost: 2, goalsFor: 45, goalsAgainst: 15, points: 48, goalDifference: 30 },
        ],
        playerTeam: {
          ...createMockGameState().playerTeam!,
          id: 'player-team',
        },
      };

      const achievements: Achievement[] = [
        {
          id: 'league-champion',
          name: 'League Champion',
          description: 'Win the league title',
          category: 'league',
          icon: '🏆',
          unlocked: false,
        },
      ];

      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(0);
    });

    it('should unlock millionaire achievement at £1M budget', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        finances: {
          budget: 1500000,
          weeklyIncome: 50000,
          weeklyExpenses: 30000,
          transactions: [],
        },
      };

      const achievements: Achievement[] = [
        {
          id: 'millionaire',
          name: 'Millionaire Club',
          description: 'Reach £1,000,000 in budget',
          category: 'finance',
          icon: '💰',
          unlocked: false,
          progress: 0,
          target: 1000000,
        },
      ];

      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should not unlock already unlocked achievements', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        finances: {
          budget: 2000000,
          weeklyIncome: 50000,
          weeklyExpenses: 30000,
          transactions: [],
        },
      };

      const achievements: Achievement[] = [
        {
          id: 'millionaire',
          name: 'Millionaire Club',
          description: 'Reach £1,000,000 in budget',
          category: 'finance',
          icon: '💰',
          unlocked: true,
          unlockedAt: new Date(),
        },
      ];

      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(0);
    });

    it('should update progress for progressive achievements', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        finances: {
          budget: 500000,
          weeklyIncome: 50000,
          weeklyExpenses: 30000,
          transactions: [],
        },
      };

      const achievements: Achievement[] = [
        {
          id: 'millionaire',
          name: 'Millionaire Club',
          description: 'Reach £1,000,000 in budget',
          category: 'finance',
          icon: '💰',
          unlocked: false,
          progress: 0,
          target: 1000000,
        },
      ];

      manager.checkAchievements(gameState as GameState, achievements);

      expect(achievements[0].progress).toBe(500000);
      expect(achievements[0].unlocked).toBe(false);
    });
  });

  describe('awardSeasonPrizes', () => {
    it('should award Golden Boot to top scorer', () => {
      const players: Player[] = [
        createMockPlayer({
          id: 'player-1',
          name: 'Top Scorer',
          stats: {
            goals: 25,
            assists: 5,
            appearances: 38,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
        createMockPlayer({
          id: 'player-2',
          name: 'Other Player',
          stats: {
            goals: 10,
            assists: 8,
            appearances: 35,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.goldenBoot).toBeDefined();
      expect(awards.awards.goldenBoot?.playerName).toBe('Top Scorer');
      expect(awards.awards.goldenBoot?.goals).toBe(25);
    });

    it('should award Golden Glove to top goalkeeper', () => {
      const players: Player[] = [
        createMockPlayer({
          id: 'gk-1',
          name: 'Best Keeper',
          position: 'GK',
          stats: {
            goals: 0,
            assists: 0,
            appearances: 38,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 20,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
        createMockPlayer({
          id: 'gk-2',
          name: 'Backup Keeper',
          position: 'GK',
          stats: {
            goals: 0,
            assists: 0,
            appearances: 10,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 5,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.goldenGlove).toBeDefined();
      expect(awards.awards.goldenGlove?.playerName).toBe('Best Keeper');
      expect(awards.awards.goldenGlove?.cleanSheets).toBe(20);
    });

    it('should award Young Player of Year to best under-23 player', () => {
      const players: Player[] = [
        createMockPlayer({
          id: 'young-1',
          name: 'Young Star',
          age: 21,
          stats: {
            goals: 15,
            assists: 8,
            appearances: 30,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
        createMockPlayer({
          id: 'old-1',
          name: 'Veteran',
          age: 30,
          stats: {
            goals: 20,
            assists: 10,
            appearances: 35,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.youngPlayerOfYear).toBeDefined();
      expect(awards.awards.youngPlayerOfYear?.playerName).toBe('Young Star');
      expect(awards.awards.youngPlayerOfYear?.age).toBe(21);
    });

    it('should award Player of Year to best overall performer', () => {
      const players: Player[] = [
        createMockPlayer({
          id: 'player-1',
          name: 'Star Player',
          stats: {
            goals: 25,
            assists: 15,
            appearances: 38,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
        createMockPlayer({
          id: 'player-2',
          name: 'Good Player',
          stats: {
            goals: 10,
            assists: 5,
            appearances: 30,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.playerOfYear).toBeDefined();
      expect(awards.awards.playerOfYear?.playerName).toBe('Star Player');
    });

    it('should not award Golden Boot if no one scored', () => {
      const players: Player[] = [
        createMockPlayer({
          stats: {
            goals: 0,
            assists: 0,
            appearances: 38,
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.goldenBoot).toBeUndefined();
    });

    it('should not award Young Player if no qualified candidates', () => {
      const players: Player[] = [
        createMockPlayer({
          age: 25,
          stats: {
            goals: 10,
            assists: 5,
            appearances: 5, // Too few appearances
            yellowCards: 0,
            redCards: 0,
            cleanSheets: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerAppearances: 0,
            careerCleanSheets: 0,
          },
        }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: {
          ...createMockGameState().playerTeam!,
          players,
        },
        season: {
          year: 2024,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.awards.youngPlayerOfYear).toBeUndefined();
    });

    it('should include season year in awards', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: {
          year: 2025,
          currentWeek: 38,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'completed',
          phase: 'competitive',
          transferWindow: 'closed',
        },
      };

      const awards = manager.awardSeasonPrizes(gameState as GameState);

      expect(awards.season).toBe(2025);
    });
  });
});
