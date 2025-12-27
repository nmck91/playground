/**
 * Football Director Engine - News Engine Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NewsEngine } from './news-engine';
import {
  MatchResult,
  LeagueTable,
  TransferListing,
  Player,
  BoardStatus,
  Injury,
  PlayerContract,
  Achievement,
} from './types';
import { createMockPlayer } from '../__tests__';
import { DevelopmentReport } from './player-development';

describe('NewsEngine', () => {
  let engine: NewsEngine;

  beforeEach(() => {
    engine = new NewsEngine();
  });

  describe('generateMatchNews', () => {
    const mockTable: LeagueTable[] = [
      {
        teamId: '1',
        teamName: 'Team A',
        played: 18,
        won: 10,
        drawn: 5,
        lost: 3,
        goalsFor: 30,
        goalsAgainst: 15,
        points: 35,
        goalDifference: 15,
      },
      {
        teamId: '2',
        teamName: 'Team B',
        played: 18,
        won: 8,
        drawn: 6,
        lost: 4,
        goalsFor: 25,
        goalsAgainst: 18,
        points: 30,
        goalDifference: 7,
      },
      {
        teamId: '3',
        teamName: 'Team C',
        played: 18,
        won: 5,
        drawn: 5,
        lost: 8,
        goalsFor: 20,
        goalsAgainst: 25,
        points: 20,
        goalDifference: -5,
      },
    ];

    it('should generate news for player team home win', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].type).toBe('result');
      expect(news[0].headline).toContain('Team A Triumph');
      expect(news[0].importance).toBe('high');
      expect(news[0].teams).toEqual(['Team A', 'Team B']);
    });

    it('should generate news for player team away win', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team B',
          awayTeam: 'Team A',
          homeScore: 1,
          awayScore: 3,
          result: 'away',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Team A Secure');
      expect(news[0].headline).toContain('Victory at Team B');
    });

    it('should generate news for player team draw', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 2,
          result: 'draw',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Share the Points');
      expect(news[0].headline).toContain('2-2 Draw');
    });

    it('should generate news for high-scoring matches', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team B',
          awayTeam: 'Team C',
          homeScore: 3,
          awayScore: 3,
          result: 'draw',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Goal Fest');
      expect(news[0].body).toContain('6-goal thriller');
    });

    it('should generate news for big wins (margin >= 4)', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team B',
          awayTeam: 'Team C',
          homeScore: 5,
          awayScore: 0,
          result: 'home',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Demolish');
      expect(news[0].body).toContain('5-goal victory');
    });

    it('should not generate news for unremarkable matches', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team B',
          awayTeam: 'Team C',
          homeScore: 1,
          awayScore: 0,
          result: 'home',
        },
      ];

      const news = engine.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(0);
    });
  });

  describe('generateTransferNews', () => {
    it('should generate news for player signing', () => {
      const listing: TransferListing = {
        id: 'transfer-1',
        player: createMockPlayer({ name: 'John Striker', age: 25, position: 'FWD' }),
        sellingTeamId: 'team-b',
        sellingTeamName: 'Team B',
        askingPrice: 150000,
        listedWeek: 1,
      };

      const news = engine.generateTransferNews(listing, 'Team A', 1, 1, false);

      expect(news.type).toBe('transfer');
      expect(news.headline).toContain('Team A Sign John Striker');
      expect(news.body).toContain('£150,000');
      expect(news.teams).toEqual(['Team B', 'Team A']);
      expect(news.players).toEqual(['John Striker']);
      expect(news.importance).toBe('medium');
    });

    it('should generate news for player sale', () => {
      const listing: TransferListing = {
        id: 'transfer-1',
        player: createMockPlayer({ name: 'John Striker', age: 25, position: 'FWD' }),
        sellingTeamId: 'team-a',
        sellingTeamName: 'Team A',
        askingPrice: 250000,
        listedWeek: 1,
      };

      const news = engine.generateTransferNews(listing, 'Team B', 1, 1, true);

      expect(news.headline).toContain('Team A Cash In');
      expect(news.body).toContain('sold');
      expect(news.importance).toBe('high'); // High because price > 200k
    });
  });

  describe('generateMilestoneNews', () => {
    it('should generate news for 100 career goals', () => {
      const player = createMockPlayer({
        name: 'Goal Machine',
        stats: {
          ...createMockPlayer().stats,
          careerGoals: 100,
        },
      });

      const news = engine.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(1);
      expect(news[0].type).toBe('milestone');
      expect(news[0].headline).toContain('Reaches Century of Goals');
      expect(news[0].importance).toBe('high');
    });

    it('should generate news for 200 career appearances', () => {
      const player = createMockPlayer({
        name: 'Club Legend',
        stats: {
          ...createMockPlayer().stats,
          careerAppearances: 200,
        },
      });

      const news = engine.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('200 Appearances');
      expect(news[0].importance).toBe('medium');
    });

    it('should not generate news for non-milestone stats', () => {
      const player = createMockPlayer({
        name: 'Regular Player',
        stats: {
          ...createMockPlayer().stats,
          careerGoals: 50,
          careerAppearances: 150,
        },
      });

      const news = engine.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(0);
    });
  });

  describe('generateInjuryNews (NEW)', () => {
    it('should generate news for serious injury', () => {
      const player = createMockPlayer({ name: 'Star Player', age: 26, position: 'MID' });
      const injury: Injury = {
        type: 'serious',
        description: 'a torn ACL',
        weeksRemaining: 12,
        sustainedInWeek: 10,
      };

      const news = engine.generateInjuryNews(player, injury, 'Team A', 10, 1);

      expect(news.type).toBe('general');
      expect(news.headline).toContain('Star Player Suffers Major Injury');
      expect(news.body).toContain('torn ACL');
      expect(news.body).toContain('12 weeks');
      expect(news.importance).toBe('high');
      expect(news.teams).toEqual(['Team A']);
      expect(news.players).toEqual(['Star Player']);
    });

    it('should generate news for moderate injury', () => {
      const player = createMockPlayer({ name: 'Key Player', position: 'DEF' });
      const injury: Injury = {
        type: 'moderate',
        description: 'a hamstring strain',
        weeksRemaining: 4,
        sustainedInWeek: 15,
      };

      const news = engine.generateInjuryNews(player, injury, 'Team B', 15, 1);

      expect(news.headline).toContain('Suffers Concerning Injury');
      expect(news.importance).toBe('medium');
    });

    it('should generate news for minor injury', () => {
      const player = createMockPlayer({ name: 'Squad Player', position: 'FWD' });
      const injury: Injury = {
        type: 'minor',
        description: 'a minor knock',
        weeksRemaining: 1,
        sustainedInWeek: 20,
      };

      const news = engine.generateInjuryNews(player, injury, 'Team C', 20, 1);

      expect(news.headline).toContain('Suffers Minor Injury');
      expect(news.body).toContain('1 week');
      expect(news.importance).toBe('low');
    });
  });

  describe('generateContractNews (NEW)', () => {
    const baseContract: PlayerContract = {
      weeklyWage: 30000,
      startYear: 1,
      startWeek: 1,
      expiryYear: 3,
      expiryWeek: 52,
      yearsRemaining: 2,
      weeksRemaining: 104,
      status: 'active',
    };

    it('should generate news for high-value signing', () => {
      const player = createMockPlayer({ name: 'New Signing', age: 24, position: 'FWD' });
      const contract: PlayerContract = {
        ...baseContract,
        weeklyWage: 60000, // High wage
      };

      const news = engine.generateContractNews(player, contract, 'Team A', 5, 1, 'signing');

      expect(news.headline).toContain('Secure New Signing on New Contract');
      expect(news.body).toContain('£60,000');
      expect(news.importance).toBe('high'); // > 50k wage
      expect(news.teams).toEqual(['Team A']);
      expect(news.players).toEqual(['New Signing']);
    });

    it('should generate news for contract renewal', () => {
      const player = createMockPlayer({ name: 'Loyal Player', position: 'MID' });
      const contract: PlayerContract = baseContract;

      const news = engine.generateContractNews(player, contract, 'Team B', 10, 1, 'renewal');

      expect(news.headline).toContain('Extends Stay at Team B');
      expect(news.body).toContain('contract extension');
      expect(news.importance).toBe('medium');
    });

    it('should generate news for expiring contract', () => {
      const player = createMockPlayer({ name: 'Expiring Contract', position: 'GK' });
      const contract: PlayerContract = {
        ...baseContract,
        weeksRemaining: 8,
        status: 'expiring',
      };

      const news = engine.generateContractNews(player, contract, 'Team C', 40, 2, 'expiring');

      expect(news.headline).toContain('Contract Situation Uncertain');
      expect(news.body).toContain('8 weeks');
      expect(news.body).toContain('free transfer');
      expect(news.importance).toBe('high');
    });
  });

  describe('generateAchievementNews (NEW)', () => {
    it('should generate news for unlocked achievement', () => {
      const achievement: Achievement = {
        id: 'first-win',
        name: 'First Victory',
        description: 'Win your first competitive match',
        category: 'league',
        icon: '🏆',
        unlocked: true,
        unlockedAt: new Date(),
      };

      const news = engine.generateAchievementNews(achievement, 10, 1);

      expect(news.type).toBe('milestone');
      expect(news.headline).toContain('Achievement Unlocked: First Victory');
      expect(news.body).toContain('Win your first competitive match');
      expect(news.importance).toBe('medium');
    });
  });

  describe('generateBoardNews', () => {
    it('should generate news for critical job security', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 20,
        jobSecurity: 'critical',
        currentObjective: null,
        objectiveHistory: [],
      };

      const news = engine.generateBoardNews(boardStatus, 'Team A', 15, 20, 1);

      expect(news).not.toBeNull();
      expect(news!.type).toBe('board');
      expect(news!.headline).toContain('Under Severe Pressure');
      expect(news!.importance).toBe('high');
    });

    it('should generate news for under-pressure status', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 45,
        jobSecurity: 'under-pressure',
        currentObjective: null,
        objectiveHistory: [],
      };

      const news = engine.generateBoardNews(boardStatus, 'Team B', 12, 25, 1);

      expect(news).not.toBeNull();
      expect(news!.headline).toContain('Questions Asked');
      expect(news!.importance).toBe('medium');
    });

    it('should not generate news for safe status', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 75,
        jobSecurity: 'safe',
        currentObjective: null,
        objectiveHistory: [],
      };

      const news = engine.generateBoardNews(boardStatus, 'Team C', 5, 30, 1);

      expect(news).toBeNull();
    });
  });

  describe('generateStandingsNews', () => {
    it('should generate news for new league leader', () => {
      const oldTable: LeagueTable[] = [
        { teamId: '1', teamName: 'Team A', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 20, goalsAgainst: 8, points: 23, goalDifference: 12 },
        { teamId: '2', teamName: 'Team B', played: 10, won: 6, drawn: 3, lost: 1, goalsFor: 18, goalsAgainst: 10, points: 21, goalDifference: 8 },
      ];

      const newTable: LeagueTable[] = [
        { teamId: '2', teamName: 'Team B', played: 11, won: 7, drawn: 3, lost: 1, goalsFor: 21, goalsAgainst: 10, points: 24, goalDifference: 11 },
        { teamId: '1', teamName: 'Team A', played: 11, won: 7, drawn: 2, lost: 2, goalsFor: 20, goalsAgainst: 11, points: 23, goalDifference: 9 },
      ];

      const news = engine.generateStandingsNews(oldTable, newTable, 11, 1);

      expect(news.length).toBeGreaterThan(0);
      expect(news[0].headline).toContain('Team B Take Top Spot');
      expect(news[0].importance).toBe('high');
    });

    it('should not generate news for week 1', () => {
      const oldTable: LeagueTable[] = [];
      const newTable: LeagueTable[] = [
        { teamId: '1', teamName: 'Team A', played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 2, goalsAgainst: 0, points: 3, goalDifference: 2 },
      ];

      const news = engine.generateStandingsNews(oldTable, newTable, 1, 1);

      expect(news).toHaveLength(0);
    });
  });

  describe('generateRandomNews (NEW)', () => {
    it('should sometimes generate random news', () => {
      let generatedCount = 0;
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const news = engine.generateRandomNews(i, 1);
        if (news !== null) {
          generatedCount++;
          expect(news.type).toBe('general');
          expect(news.importance).toBe('low');
        }
      }

      // Should generate news roughly 20% of the time (with some variance)
      expect(generatedCount).toBeGreaterThan(5);
      expect(generatedCount).toBeLessThan(40);
    });

    it('should generate valid news when it does trigger', () => {
      let news = null;
      let attempts = 0;

      // Keep trying until we get a non-null result
      while (news === null && attempts < 100) {
        news = engine.generateRandomNews(attempts, 1);
        attempts++;
      }

      if (news !== null) {
        expect(news.headline).toBeTruthy();
        expect(news.body).toBeTruthy();
        expect(news.week).toBe(attempts - 1);
        expect(news.season).toBe(1);
      }
    });
  });

  describe('generateWelcomeNews', () => {
    it('should generate welcome news for new game', () => {
      const news = engine.generateWelcomeNews('Team A', 1);

      expect(news.type).toBe('general');
      expect(news.headline).toContain('New Manager Takes Charge');
      expect(news.body).toContain('new era');
      expect(news.importance).toBe('high');
      expect(news.week).toBe(1);
    });
  });

  describe('generateSeasonEndNews', () => {
    const mockLeagueEntry: LeagueTable = {
      teamId: '1',
      teamName: 'Team A',
      played: 38,
      won: 25,
      drawn: 8,
      lost: 5,
      goalsFor: 70,
      goalsAgainst: 30,
      points: 83,
      goalDifference: 40,
    };

    it('should generate news for championship win', () => {
      const news = engine.generateSeasonEndNews(1, 'Team A', 1, mockLeagueEntry);

      expect(news.headline).toContain('Crowned Champions');
      expect(news.body).toContain('won the league title');
      expect(news.importance).toBe('high');
    });

    it('should generate news for runner-up finish', () => {
      const news = engine.generateSeasonEndNews(2, 'Team A', 1, mockLeagueEntry);

      expect(news.headline).toContain('Runners-Up');
      expect(news.importance).toBe('high');
    });

    it('should generate news for top 4 finish', () => {
      const news = engine.generateSeasonEndNews(4, 'Team A', 1, mockLeagueEntry);

      expect(news.headline).toContain('Top Four');
      expect(news.importance).toBe('medium');
    });

    it('should generate news for relegation battle', () => {
      const news = engine.generateSeasonEndNews(18, 'Team A', 1, mockLeagueEntry);

      expect(news.headline).toContain('Battle Relegation');
      expect(news.importance).toBe('high');
    });
  });

  describe('pruneOldNews', () => {
    it('should keep news from last 3 seasons', () => {
      const newsFeed: NewsArticle[] = [
        {
          id: '1',
          date: new Date(),
          week: 1,
          season: 1,
          type: 'general',
          headline: 'Old News',
          body: 'Body',
          importance: 'low',
          read: false,
        },
        {
          id: '2',
          date: new Date(),
          week: 1,
          season: 3,
          type: 'general',
          headline: 'Recent News',
          body: 'Body',
          importance: 'low',
          read: false,
        },
        {
          id: '3',
          date: new Date(),
          week: 1,
          season: 5,
          type: 'general',
          headline: 'Current News',
          body: 'Body',
          importance: 'low',
          read: false,
        },
      ];

      const pruned = engine.pruneOldNews(newsFeed, 5);

      expect(pruned).toHaveLength(2); // Keeps seasons 3 and 5 (cutoff is season 2)
      expect(pruned.find(n => n.season === 1)).toBeUndefined();
    });
  });
});
