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

  describe('League Achievements', () => {
    it('should unlock league-runner-up for 2nd place', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'other-team', teamName: 'Leader FC', won: 32, drawn: 4, lost: 2, goalsFor: 95, goalsAgainst: 25, points: 100, goalDifference: 70 },
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 30, points: 95, goalDifference: 60 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'league-runner-up', name: 'So Close', description: 'Finish 2nd in the league', category: 'league', icon: '🥈', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('league-runner-up');
    });

    it('should unlock top-four for 4th place', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'team-1', teamName: 'Leader FC', won: 32, drawn: 4, lost: 2, goalsFor: 95, goalsAgainst: 25, points: 100, goalDifference: 70 },
          { teamId: 'team-2', teamName: 'Second FC', won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 30, points: 95, goalDifference: 60 },
          { teamId: 'team-3', teamName: 'Third FC', won: 28, drawn: 6, lost: 4, goalsFor: 85, goalsAgainst: 35, points: 90, goalDifference: 50 },
          { teamId: 'player-team', teamName: 'Player FC', won: 26, drawn: 7, lost: 5, goalsFor: 80, goalsAgainst: 40, points: 85, goalDifference: 40 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'top-four', name: 'Top Four Finish', description: 'Finish in the top 4 positions', category: 'league', icon: '⬆️', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('top-four');
    });

    it('should unlock dynasty for 3 consecutive titles', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2026, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        seasonRecords: [
          { season: 2024, finalPosition: 1, wins: 30, draws: 5, losses: 3, goalsFor: 90, goalsAgainst: 30, points: 95, achievements: [], trophies: [] },
          { season: 2025, finalPosition: 1, wins: 31, draws: 4, losses: 3, goalsFor: 92, goalsAgainst: 28, points: 97, achievements: [], trophies: [] },
          { season: 2026, finalPosition: 1, wins: 32, draws: 3, losses: 3, goalsFor: 95, goalsAgainst: 25, points: 99, achievements: [], trophies: [] },
        ],
      };

      const achievements: Achievement[] = [{ id: 'dynasty', name: 'Dynasty', description: 'Win 3 consecutive league titles', category: 'league', icon: '👑', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('dynasty');
    });

    it('should unlock consistency for 5 consecutive top 6 finishes', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2028, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        seasonRecords: [
          { season: 2024, finalPosition: 3, wins: 25, draws: 8, losses: 5, goalsFor: 75, goalsAgainst: 35, points: 83, achievements: [], trophies: [] },
          { season: 2025, finalPosition: 4, wins: 24, draws: 9, losses: 5, goalsFor: 72, goalsAgainst: 36, points: 81, achievements: [], trophies: [] },
          { season: 2026, finalPosition: 2, wins: 29, draws: 6, losses: 3, goalsFor: 85, goalsAgainst: 30, points: 93, achievements: [], trophies: [] },
          { season: 2027, finalPosition: 5, wins: 23, draws: 10, losses: 5, goalsFor: 70, goalsAgainst: 38, points: 79, achievements: [], trophies: [] },
          { season: 2028, finalPosition: 6, wins: 22, draws: 11, losses: 5, goalsFor: 68, goalsAgainst: 39, points: 77, achievements: [], trophies: [] },
        ],
      };

      const achievements: Achievement[] = [{ id: 'consistency', name: 'Model of Consistency', description: 'Finish in top 6 for 5 consecutive seasons', category: 'league', icon: '📈', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('consistency');
    });
  });

  describe('Goals Achievements', () => {
    it('should unlock century for 100 goals in a season', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 105, goalsAgainst: 30, points: 95, goalDifference: 75 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'century', name: 'Century', description: 'Score 100 goals in a single season', category: 'goals', icon: '💯', unlocked: false, progress: 0, target: 100 }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('century');
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should unlock clinical for 30+ goal scorer', () => {
      const players: Player[] = [
        createMockPlayer({ id: 'striker', name: 'Top Striker', stats: { goals: 32, assists: 5, appearances: 38, yellowCards: 0, redCards: 0, cleanSheets: 0, careerGoals: 0, careerAssists: 0, careerAppearances: 0, careerCleanSheets: 0 } }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: { ...createMockGameState().playerTeam!, players },
      };

      const achievements: Achievement[] = [{ id: 'clinical', name: 'Clinical Finishers', description: 'Have a player score 30+ goals in a season', category: 'goals', icon: '🎯', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('clinical');
    });

    it('should unlock demolition for 6+ goal win', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        matchHistory: [
          { id: '1', week: 10, homeTeam: 'Player FC', awayTeam: 'Weak FC', homeScore: 8, awayScore: 0, result: 'home', competitionType: 'league' },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'demolition', name: 'Demolition', description: 'Win a match by 6 or more goals', category: 'goals', icon: '💥', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('demolition');
    });

    it('should unlock team-effort for 5 scorers in one match', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        matchHistory: [
          {
            id: '1', week: 10, homeTeam: 'Player FC', awayTeam: 'Other FC', homeScore: 5, awayScore: 1, result: 'home', competitionType: 'league',
            homeGoalScorers: ['Player1', 'Player2', 'Player3', 'Player4', 'Player5'],
          },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'team-effort', name: 'Team Effort', description: 'Have 5 different players score in one match', category: 'goals', icon: '🤝', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('team-effort');
    });

    it('should unlock goal-machine for 10 consecutive matches scoring', () => {
      const matches = [];
      for (let i = 1; i <= 10; i++) {
        matches.push({ id: `${i}`, week: i, homeTeam: 'Player FC', awayTeam: `Team ${i}`, homeScore: 2, awayScore: 1, result: 'home', competitionType: 'league' });
      }

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        matchHistory: matches,
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'goal-machine', name: 'Goal Machine', description: 'Score in 10 consecutive matches', category: 'goals', icon: '⚽', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('goal-machine');
    });
  });

  describe('Defense Achievements', () => {
    it('should unlock iron-curtain for 20 clean sheets', () => {
      const matches = [];
      for (let i = 1; i <= 20; i++) {
        matches.push({ id: `${i}`, week: i, homeTeam: 'Player FC', awayTeam: `Team ${i}`, homeScore: 2, awayScore: 0, result: 'home', competitionType: 'league' });
      }

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        matchHistory: matches,
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'iron-curtain', name: 'Iron Curtain', description: 'Keep 20 clean sheets in a season', category: 'defense', icon: '🛡️', unlocked: false, progress: 0, target: 20 }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('iron-curtain');
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should unlock unbeaten for 15 match unbeaten run', () => {
      const matches = [];
      for (let i = 1; i <= 15; i++) {
        matches.push({ id: `${i}`, week: i, homeTeam: 'Player FC', awayTeam: `Team ${i}`, homeScore: 2, awayScore: 1, result: 'home', competitionType: 'league' });
      }

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        matchHistory: matches,
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'unbeaten', name: 'Unbeaten Run', description: 'Go 15 matches without losing', category: 'defense', icon: '🔒', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('unbeaten');
    });

    it('should unlock invincibles for unbeaten season', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 35, drawn: 3, lost: 0, goalsFor: 95, goalsAgainst: 25, points: 108, goalDifference: 70 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'invincibles', name: 'Invincibles', description: 'Complete a season unbeaten', category: 'defense', icon: '⭐', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('invincibles');
    });

    it('should unlock mean-defense for <25 goals conceded', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 75, goalsAgainst: 20, points: 95, goalDifference: 55 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'mean-defense', name: 'Mean Defense', description: 'Concede fewer than 25 goals in a season', category: 'defense', icon: '🚫', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('mean-defense');
    });
  });

  describe('Finance Achievements', () => {
    it('should unlock financial-stability for positive net spend', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        finances: {
          budget: 500000,
          weeklyIncome: 50000,
          weeklyExpenses: 30000,
          transactions: [
            { id: '1', type: 'income', amount: 200000, description: 'Player sale', category: 'transfers', weekNumber: 10 },
            { id: '2', type: 'expense', amount: 100000, description: 'Player purchase', category: 'transfers', weekNumber: 15 },
          ],
        },
      };

      const achievements: Achievement[] = [{ id: 'financial-stability', name: 'Financial Stability', description: 'Complete a season with positive net spend', category: 'finance', icon: '💵', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('financial-stability');
    });
  });

  describe('Player Achievements', () => {
    it('should unlock legend for 200 appearances', () => {
      const players: Player[] = [
        createMockPlayer({ id: 'legend', name: 'Club Legend', stats: { goals: 50, assists: 30, appearances: 38, yellowCards: 0, redCards: 0, cleanSheets: 0, careerGoals: 150, careerAssists: 80, careerAppearances: 205, careerCleanSheets: 0 } }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: { ...createMockGameState().playerTeam!, players },
      };

      const achievements: Achievement[] = [{ id: 'legend', name: 'Club Legend', description: 'Have a player reach 200 appearances', category: 'players', icon: '🌟', unlocked: false, progress: 0, target: 200 }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('legend');
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should unlock veteran-squad for avg age 30+ winning league', () => {
      const players: Player[] = [
        createMockPlayer({ age: 31 }),
        createMockPlayer({ age: 32 }),
        createMockPlayer({ age: 29 }),
        createMockPlayer({ age: 30 }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 30, points: 95, goalDifference: 60 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team', players },
      };

      const achievements: Achievement[] = [{ id: 'veteran-squad', name: 'Experience Wins', description: 'Win the league with average squad age of 30+', category: 'players', icon: '👴', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('veteran-squad');
    });

    it('should unlock young-guns for avg age <25 winning league', () => {
      const players: Player[] = [
        createMockPlayer({ age: 22 }),
        createMockPlayer({ age: 23 }),
        createMockPlayer({ age: 24 }),
        createMockPlayer({ age: 25 }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 30, points: 95, goalDifference: 60 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team', players },
      };

      const achievements: Achievement[] = [{ id: 'young-guns', name: 'Young Guns', description: 'Win the league with average squad age under 25', category: 'players', icon: '👶', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('young-guns');
    });

    it('should unlock youth-academy for developed youth player', () => {
      const players: Player[] = [
        createMockPlayer({ age: 22, skill: 18, history: [{ season: 2022, goals: 5, assists: 3, appearances: 20, team: 'Player FC' }] }),
      ];

      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        playerTeam: { ...createMockGameState().playerTeam!, players },
      };

      const achievements: Achievement[] = [{ id: 'youth-academy', name: 'Youth Development', description: 'Develop a player from skill 10 to skill 18+', category: 'players', icon: '🎓', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('youth-academy');
    });
  });

  describe('Special Achievements', () => {
    it('should unlock perfect-season for 38 wins', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 38, drawn: 0, lost: 0, goalsFor: 120, goalsAgainst: 15, points: 114, goalDifference: 105 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'perfect-season', name: 'Perfect Season', description: 'Win all 38 matches in a season', category: 'special', icon: '🏅', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('perfect-season');
    });

    it('should unlock first-season for winning in first year', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2024, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
        leagueTable: [
          { teamId: 'player-team', teamName: 'Player FC', won: 30, drawn: 5, lost: 3, goalsFor: 90, goalsAgainst: 30, points: 95, goalDifference: 60 },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, id: 'player-team' },
      };

      const achievements: Achievement[] = [{ id: 'first-season', name: 'First Season Hero', description: 'Win the league in your first season', category: 'special', icon: '🚀', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('first-season');
    });

    it('should unlock long-service for 10 seasons', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        season: { year: 2034, currentWeek: 38, totalWeeks: 52, competitiveWeeks: 38, preSeasonWeeks: 7, status: 'completed', phase: 'competitive', transferWindow: 'closed' },
      };

      const achievements: Achievement[] = [{ id: 'long-service', name: 'Long Service', description: 'Manage the club for 10 seasons', category: 'special', icon: '⏰', unlocked: false, progress: 0, target: 10 }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('long-service');
      expect(achievements[0].unlocked).toBe(true);
    });

    it('should unlock objective-master for 5 consecutive objectives', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        boardStatus: {
          confidence: 8,
          objective: 'Finish in top 6',
          objectiveProgress: 100,
          pressureLevel: 'low',
          objectiveHistory: [
            { season: 2024, objective: 'Finish in top 10', status: 'achieved' },
            { season: 2025, objective: 'Finish in top 8', status: 'achieved' },
            { season: 2026, objective: 'Finish in top 6', status: 'achieved' },
            { season: 2027, objective: 'Finish in top 4', status: 'achieved' },
            { season: 2028, objective: 'Win the league', status: 'achieved' },
          ],
        },
      };

      const achievements: Achievement[] = [{ id: 'objective-master', name: 'Objective Master', description: 'Achieve board objectives 5 seasons in a row', category: 'special', icon: '🎯', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('objective-master');
    });

    it('should unlock comeback-king for 3-0 comeback win', () => {
      const gameState: Partial<GameState> = {
        ...createMockGameState(),
        matchHistory: [
          { id: '1', week: 10, homeTeam: 'Other FC', awayTeam: 'Player FC', homeScore: 3, awayScore: 4, result: 'away', competitionType: 'league' },
        ],
        playerTeam: { ...createMockGameState().playerTeam!, name: 'Player FC' },
      };

      const achievements: Achievement[] = [{ id: 'comeback-king', name: 'Comeback King', description: 'Win a match after being 3-0 down', category: 'special', icon: '🔄', unlocked: false }];
      const unlocked = manager.checkAchievements(gameState as GameState, achievements);

      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe('comeback-king');
    });
  });
});
