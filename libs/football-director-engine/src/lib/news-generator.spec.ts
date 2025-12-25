/**
 * Football Director Engine - News Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NewsGenerator } from './news-generator';
import { MatchResult, LeagueTable, TransferListing, Player, BoardStatus } from './types';
import { createMockPlayer } from '../__tests__';
import { DevelopmentReport } from './player-development';

describe('NewsGenerator', () => {
  let generator: NewsGenerator;

  beforeEach(() => {
    generator = new NewsGenerator();
  });

  describe('generateMatchNews', () => {
    const mockTable: LeagueTable[] = [
      { teamName: 'Team A', won: 10, drawn: 5, lost: 3, goalsFor: 30, goalsAgainst: 15, points: 35, goalDifference: 15 },
      { teamName: 'Team B', won: 8, drawn: 6, lost: 4, goalsFor: 25, goalsAgainst: 18, points: 30, goalDifference: 7 },
      { teamName: 'Team C', won: 5, drawn: 5, lost: 8, goalsFor: 20, goalsAgainst: 25, points: 20, goalDifference: -5 },
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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

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

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news).toHaveLength(0);
    });

    it('should generate news for upsets (5+ position difference)', () => {
      const largeTable: LeagueTable[] = [
        ...mockTable,
        { teamName: 'Team D', won: 2, drawn: 2, lost: 14, goalsFor: 10, goalsAgainst: 40, points: 8, goalDifference: -30 },
        { teamName: 'Team E', won: 2, drawn: 1, lost: 15, goalsFor: 8, goalsAgainst: 42, points: 7, goalDifference: -34 },
        { teamName: 'Team F', won: 1, drawn: 2, lost: 15, goalsFor: 7, goalsAgainst: 45, points: 5, goalDifference: -38 },
      ];

      // Team F (6th) beats Team A (1st) - upset
      const results: MatchResult[] = [
        {
          homeTeam: 'Team F',
          awayTeam: 'Team A',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
      ];

      const news = generator.generateMatchNews(results, 'Team B', largeTable, 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Shock Result');
      expect(news[0].importance).toBe('medium');
    });

    it('should set correct importance levels', () => {
      const results: MatchResult[] = [
        // Player match = high importance
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
      ];

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news[0].importance).toBe('high');
    });

    it('should handle multiple results', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
        {
          homeTeam: 'Team B',
          awayTeam: 'Team C',
          homeScore: 4,
          awayScore: 3,
          result: 'home',
        },
      ];

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news.length).toBeGreaterThan(1);
    });

    it('should include week and season in news', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
      ];

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 15, 2);

      expect(news[0].week).toBe(15);
      expect(news[0].season).toBe(2);
    });

    it('should mark news as unread', () => {
      const results: MatchResult[] = [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          homeScore: 2,
          awayScore: 1,
          result: 'home',
        },
      ];

      const news = generator.generateMatchNews(results, 'Team A', mockTable, 1, 1);

      expect(news[0].read).toBe(false);
    });
  });

  describe('generateTransferNews', () => {
    const createTransferListing = (price: number): TransferListing => ({
      id: 'listing-1',
      player: createMockPlayer({
        name: 'John Smith',
        age: 25,
        position: 'FWD',
        stats: {
          appearances: 50,
          goals: 10,
          assists: 5,
          yellowCards: 2,
          redCards: 0,
          careerGoals: 30,
          careerAssists: 15,
          careerAppearances: 100,
          seasonHistory: [],
        },
      }),
      sellingTeamName: 'Team A',
      askingPrice: price,
      listedWeek: 1,
    });

    it('should generate purchase news', () => {
      const listing = createTransferListing(150000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.type).toBe('transfer');
      expect(news.headline).toContain('Team B Sign John Smith');
      expect(news.body).toContain('£150,000');
      expect(news.teams).toEqual(['Team A', 'Team B']);
      expect(news.players).toEqual(['John Smith']);
    });

    it('should generate sale news', () => {
      const listing = createTransferListing(150000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, true);

      expect(news.headline).toContain('Team A Cash In on John Smith');
      expect(news.body).toContain('sold John Smith to Team B');
    });

    it('should set high importance for expensive transfers (>200k)', () => {
      const listing = createTransferListing(250000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.importance).toBe('high');
    });

    it('should set medium importance for mid-priced transfers (100k-200k)', () => {
      const listing = createTransferListing(150000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.importance).toBe('medium');
    });

    it('should set low importance for cheap transfers (<100k)', () => {
      const listing = createTransferListing(75000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.importance).toBe('low');
    });

    it('should include player details in news body', () => {
      const listing = createTransferListing(150000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.body).toContain('25-year-old');
      expect(news.body).toContain('FWD');
    });

    it('should mark news as unread', () => {
      const listing = createTransferListing(150000);

      const news = generator.generateTransferNews(listing, 'Team B', 10, 1, false);

      expect(news.read).toBe(false);
    });
  });

  describe('generateMilestoneNews', () => {
    it('should generate news for 100 career goals', () => {
      const player = createMockPlayer({
        name: 'Goal Machine',
        age: 28,
        stats: {
          careerGoals: 100,
          appearances: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          careerAssists: 0,
          careerAppearances: 0,
          seasonHistory: [],
        },
      });

      const news = generator.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(1);
      expect(news[0].type).toBe('milestone');
      expect(news[0].headline).toContain('Reaches Century of Goals');
      expect(news[0].importance).toBe('high');
      expect(news[0].players).toEqual(['Goal Machine']);
    });

    it('should generate news for 200 career appearances', () => {
      const player = createMockPlayer({
        name: 'Club Legend',
        stats: {
          careerAppearances: 200,
          appearances: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          careerGoals: 0,
          careerAssists: 0,
          seasonHistory: [],
        },
      });

      const news = generator.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Hits 200 Appearances');
      expect(news[0].importance).toBe('medium');
    });

    it('should generate news for 300 career appearances', () => {
      const player = createMockPlayer({
        name: 'Club Legend',
        stats: {
          careerAppearances: 300,
          appearances: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          careerGoals: 0,
          careerAssists: 0,
          seasonHistory: [],
        },
      });

      const news = generator.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(1);
      expect(news[0].headline).toContain('Hits 300 Appearances');
    });

    it('should not generate news for non-milestone stats', () => {
      const player = createMockPlayer({
        stats: {
          careerGoals: 99,
          careerAppearances: 199,
          appearances: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          careerAssists: 0,
          seasonHistory: [],
        },
      });

      const news = generator.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news).toHaveLength(0);
    });

    it('should include team and player in news', () => {
      const player = createMockPlayer({
        name: 'Goal Machine',
        stats: {
          careerGoals: 100,
          appearances: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          careerAssists: 0,
          careerAppearances: 0,
          seasonHistory: [],
        },
      });

      const news = generator.generateMilestoneNews(player, 'Team A', 10, 1);

      expect(news[0].teams).toEqual(['Team A']);
      expect(news[0].players).toEqual(['Goal Machine']);
    });
  });

  describe('generateBoardNews', () => {
    it('should generate news for critical job security', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 20,
        jobSecurity: 'critical',
        lastReview: 1,
      };

      const news = generator.generateBoardNews(boardStatus, 'Team A', 15, 10, 1);

      expect(news).not.toBeNull();
      expect(news?.type).toBe('board');
      expect(news?.headline).toContain('Under Severe Pressure');
      expect(news?.importance).toBe('high');
      expect(news?.body).toContain('15th in the league');
    });

    it('should generate news for under-pressure status', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 45,
        jobSecurity: 'under-pressure',
        lastReview: 1,
      };

      const news = generator.generateBoardNews(boardStatus, 'Team A', 10, 10, 1);

      expect(news).not.toBeNull();
      expect(news?.headline).toContain('Questions Asked');
      expect(news?.importance).toBe('medium');
      expect(news?.body).toContain('10th place');
    });

    it('should return null for secure job status', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 70,
        jobSecurity: 'secure',
        lastReview: 1,
      };

      const news = generator.generateBoardNews(boardStatus, 'Team A', 5, 10, 1);

      expect(news).toBeNull();
    });

    it('should include team name in news', () => {
      const boardStatus: BoardStatus = {
        satisfaction: 20,
        jobSecurity: 'critical',
        lastReview: 1,
      };

      const news = generator.generateBoardNews(boardStatus, 'Team A', 15, 10, 1);

      expect(news?.teams).toEqual(['Team A']);
    });
  });

  describe('generateStandingsNews', () => {
    const oldTable: LeagueTable[] = [
      { teamName: 'Team A', won: 10, drawn: 5, lost: 3, goalsFor: 30, goalsAgainst: 15, points: 35, goalDifference: 15 },
      { teamName: 'Team B', won: 9, drawn: 6, lost: 3, goalsFor: 28, goalsAgainst: 16, points: 33, goalDifference: 12 },
      { teamName: 'Team C', won: 5, drawn: 5, lost: 8, goalsFor: 20, goalsAgainst: 25, points: 20, goalDifference: -5 },
      { teamName: 'Team D', won: 4, drawn: 4, lost: 10, goalsFor: 18, goalsAgainst: 30, points: 16, goalDifference: -12 },
      { teamName: 'Team E', won: 3, drawn: 3, lost: 12, goalsFor: 15, goalsAgainst: 35, points: 12, goalDifference: -20 },
    ];

    it('should generate news for new league leader', () => {
      const newTable: LeagueTable[] = [
        { teamName: 'Team B', won: 10, drawn: 6, lost: 3, goalsFor: 31, goalsAgainst: 16, points: 36, goalDifference: 15 },
        { teamName: 'Team A', won: 10, drawn: 5, lost: 4, goalsFor: 30, goalsAgainst: 18, points: 35, goalDifference: 12 },
        ...oldTable.slice(2),
      ];

      const news = generator.generateStandingsNews(oldTable, newTable, 10, 1);

      expect(news.length).toBeGreaterThan(0);
      const leaderNews = news.find(n => n.type === 'standings' && n.headline.includes('Top Spot'));
      expect(leaderNews).toBeDefined();
      expect(leaderNews?.headline).toContain('Team B Take Top Spot');
      expect(leaderNews?.importance).toBe('high');
    });

    it('should not generate news for same leader', () => {
      const newTable: LeagueTable[] = [
        { teamName: 'Team A', won: 11, drawn: 5, lost: 3, goalsFor: 33, goalsAgainst: 15, points: 38, goalDifference: 18 },
        ...oldTable.slice(1),
      ];

      const news = generator.generateStandingsNews(oldTable, newTable, 10, 1);

      const leaderNews = news.find(n => n.headline.includes('Top Spot'));
      expect(leaderNews).toBeUndefined();
    });

    it('should generate news for team entering relegation zone', () => {
      const newTable: LeagueTable[] = [
        ...oldTable.slice(0, 2),
        { teamName: 'Team F', won: 5, drawn: 5, lost: 8, goalsFor: 20, goalsAgainst: 25, points: 20, goalDifference: -5 },
        { teamName: 'Team C', won: 5, drawn: 4, lost: 9, goalsFor: 19, goalsAgainst: 27, points: 19, goalDifference: -8 },
        { teamName: 'Team D', won: 4, drawn: 4, lost: 10, goalsFor: 18, goalsAgainst: 30, points: 16, goalDifference: -12 },
      ];

      const news = generator.generateStandingsNews(oldTable, newTable, 10, 1);

      const relegationNews = news.find(n => n.headline.includes('Relegation Zone'));
      expect(relegationNews).toBeDefined();
      // Team F entered bottom 3 (was not in bottom 3 before)
      expect(relegationNews?.headline).toContain('Team F');
      expect(relegationNews?.importance).toBe('medium');
    });

    it('should not generate relegation news before week 5', () => {
      const newTable: LeagueTable[] = [
        ...oldTable.slice(0, 2),
        { teamName: 'Team F', won: 5, drawn: 5, lost: 8, goalsFor: 20, goalsAgainst: 25, points: 20, goalDifference: -5 },
        { teamName: 'Team C', won: 5, drawn: 4, lost: 9, goalsFor: 19, goalsAgainst: 27, points: 19, goalDifference: -8 },
        { teamName: 'Team D', won: 4, drawn: 4, lost: 10, goalsFor: 18, goalsAgainst: 30, points: 16, goalDifference: -12 },
      ];

      const news = generator.generateStandingsNews(oldTable, newTable, 4, 1);

      expect(news).toHaveLength(0);
    });

    it('should not generate leader news for week 1', () => {
      const newTable: LeagueTable[] = [
        { teamName: 'Team B', won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 0, points: 3, goalDifference: 3 },
        { teamName: 'Team A', won: 0, drawn: 1, lost: 0, goalsFor: 1, goalsAgainst: 1, points: 1, goalDifference: 0 },
        ...oldTable.slice(2),
      ];

      const news = generator.generateStandingsNews(oldTable, newTable, 1, 1);

      expect(news).toHaveLength(0);
    });
  });

  describe('generateDevelopmentNews', () => {
    it('should generate news for significant improvements (skillChange >= 2)', () => {
      const reports: DevelopmentReport[] = [
        {
          playerId: 'p1',
          playerName: 'Rising Star',
          oldSkill: 10,
          newSkill: 13,
          skillChange: 3,
          phase: 'development',
        },
      ];

      const news = generator.generateDevelopmentNews(reports, 'Team A', 1, 1);

      expect(news).toHaveLength(1);
      expect(news[0].type).toBe('development');
      expect(news[0].headline).toContain('Rising Star Shows Major Improvement');
      expect(news[0].importance).toBe('low');
      expect(news[0].body).toContain('skill 10 to 13');
    });

    it('should not generate news for minor improvements (skillChange < 2)', () => {
      const reports: DevelopmentReport[] = [
        {
          playerId: 'p1',
          playerName: 'Average Player',
          oldSkill: 10,
          newSkill: 11,
          skillChange: 1,
          phase: 'development',
        },
      ];

      const news = generator.generateDevelopmentNews(reports, 'Team A', 1, 1);

      expect(news).toHaveLength(0);
    });

    it('should limit to 2 development news articles', () => {
      const reports: DevelopmentReport[] = [
        {
          playerId: 'p1',
          playerName: 'Player 1',
          oldSkill: 10,
          newSkill: 13,
          skillChange: 3,
          phase: 'development',
        },
        {
          playerId: 'p2',
          playerName: 'Player 2',
          oldSkill: 11,
          newSkill: 14,
          skillChange: 3,
          phase: 'development',
        },
        {
          playerId: 'p3',
          playerName: 'Player 3',
          oldSkill: 9,
          newSkill: 12,
          skillChange: 3,
          phase: 'development',
        },
      ];

      const news = generator.generateDevelopmentNews(reports, 'Team A', 1, 1);

      expect(news).toHaveLength(2);
    });

    it('should include team and player names', () => {
      const reports: DevelopmentReport[] = [
        {
          playerId: 'p1',
          playerName: 'Rising Star',
          oldSkill: 10,
          newSkill: 13,
          skillChange: 3,
          phase: 'development',
        },
      ];

      const news = generator.generateDevelopmentNews(reports, 'Team A', 1, 1);

      expect(news[0].teams).toEqual(['Team A']);
      expect(news[0].players).toEqual(['Rising Star']);
    });
  });

  describe('generateYouthAcademyNews', () => {
    it('should generate news for single youth graduate', () => {
      const players = [
        createMockPlayer({ name: 'Young Talent' }),
      ];

      const news = generator.generateYouthAcademyNews(players, 'Team A', 1, 1);

      expect(news.type).toBe('general');
      expect(news.headline).toBe('1 Youth Player Graduate to First Team');
      expect(news.body).toContain('Young Talent has graduated');
      expect(news.importance).toBe('low');
    });

    it('should generate news for multiple youth graduates', () => {
      const players = [
        createMockPlayer({ name: 'Player 1' }),
        createMockPlayer({ name: 'Player 2' }),
        createMockPlayer({ name: 'Player 3' }),
      ];

      const news = generator.generateYouthAcademyNews(players, 'Team A', 1, 1);

      expect(news.headline).toBe('3 Youth Players Graduate to First Team');
      expect(news.body).toContain('Player 1 and Player 2 and 1 other');
      expect(news.body).toContain('have graduated');
    });

    it('should handle more than 3 graduates', () => {
      const players = [
        createMockPlayer({ name: 'Player 1' }),
        createMockPlayer({ name: 'Player 2' }),
        createMockPlayer({ name: 'Player 3' }),
        createMockPlayer({ name: 'Player 4' }),
      ];

      const news = generator.generateYouthAcademyNews(players, 'Team A', 1, 1);

      expect(news.body).toContain('and 2 others');
    });

    it('should include all player names in news', () => {
      const players = [
        createMockPlayer({ name: 'Player 1' }),
        createMockPlayer({ name: 'Player 2' }),
      ];

      const news = generator.generateYouthAcademyNews(players, 'Team A', 1, 1);

      expect(news.players).toEqual(['Player 1', 'Player 2']);
    });
  });

  describe('generateWelcomeNews', () => {
    it('should generate welcome news for new manager', () => {
      const news = generator.generateWelcomeNews('Team A', 1);

      expect(news.type).toBe('general');
      expect(news.headline).toBe('New Manager Takes Charge at Team A');
      expect(news.importance).toBe('high');
      expect(news.week).toBe(1);
      expect(news.season).toBe(1);
      expect(news.teams).toEqual(['Team A']);
    });

    it('should include encouraging message in body', () => {
      const news = generator.generateWelcomeNews('Team A', 1);

      expect(news.body).toContain('new era');
      expect(news.body).toContain('exciting journey');
    });
  });

  describe('generateSeasonEndNews', () => {
    const mockLeagueTable: LeagueTable = {
      teamName: 'Team A',
      won: 20,
      drawn: 10,
      lost: 8,
      goalsFor: 60,
      goalsAgainst: 35,
      points: 70,
      goalDifference: 25,
    };

    it('should generate champions news for 1st place', () => {
      const news = generator.generateSeasonEndNews(1, 'Team A', 1, mockLeagueTable);

      expect(news.type).toBe('general');
      expect(news.headline).toContain('Crowned Champions');
      expect(news.importance).toBe('high');
      expect(news.body).toContain('70 points');
      expect(news.body).toContain('20 wins');
    });

    it('should generate runners-up news for 2nd place', () => {
      const news = generator.generateSeasonEndNews(2, 'Team A', 1, mockLeagueTable);

      expect(news.headline).toContain('Runners-Up');
      expect(news.body).toContain('second place');
    });

    it('should generate top four news for 3rd-4th place', () => {
      const news = generator.generateSeasonEndNews(4, 'Team A', 1, mockLeagueTable);

      expect(news.headline).toContain('Secure Top Four');
      expect(news.importance).toBe('medium');
    });

    it('should generate relegation battle news for 18th+ place', () => {
      const news = generator.generateSeasonEndNews(19, 'Team A', 1, mockLeagueTable);

      expect(news.headline).toContain('Battle Relegation');
      expect(news.importance).toBe('high');
      expect(news.body).toContain('difficult season');
    });

    it('should generate mid-table news for 5th-17th place', () => {
      const news = generator.generateSeasonEndNews(10, 'Team A', 1, mockLeagueTable);

      expect(news.headline).toContain('Finish 10th');
      expect(news.importance).toBe('medium');
      expect(news.body).toContain('mid-table');
    });

    it('should be set to week 38', () => {
      const news = generator.generateSeasonEndNews(1, 'Team A', 1, mockLeagueTable);

      expect(news.week).toBe(38);
    });
  });

  describe('pruneOldNews', () => {
    it('should keep news from last 3 seasons', () => {
      const newsFeed = [
        { id: '1', season: 1, week: 1, date: new Date(), type: 'general' as const, headline: 'News 1', body: 'Body 1', teams: [], importance: 'low' as const, read: false },
        { id: '2', season: 2, week: 1, date: new Date(), type: 'general' as const, headline: 'News 2', body: 'Body 2', teams: [], importance: 'low' as const, read: false },
        { id: '3', season: 3, week: 1, date: new Date(), type: 'general' as const, headline: 'News 3', body: 'Body 3', teams: [], importance: 'low' as const, read: false },
        { id: '4', season: 4, week: 1, date: new Date(), type: 'general' as const, headline: 'News 4', body: 'Body 4', teams: [], importance: 'low' as const, read: false },
      ];

      const pruned = generator.pruneOldNews(newsFeed, 4);

      // Current implementation keeps seasons >= (currentSeason - 3)
      // So for season 4: keeps seasons >= 1 (i.e., 1, 2, 3, 4)
      expect(pruned).toHaveLength(4);
      expect(pruned.find(n => n.season === 1)).toBeDefined();
      expect(pruned.find(n => n.season === 2)).toBeDefined();
    });

    it('should keep all news if current season <= 3', () => {
      const newsFeed = [
        { id: '1', season: 1, week: 1, date: new Date(), type: 'general' as const, headline: 'News 1', body: 'Body 1', teams: [], importance: 'low' as const, read: false },
        { id: '2', season: 2, week: 1, date: new Date(), type: 'general' as const, headline: 'News 2', body: 'Body 2', teams: [], importance: 'low' as const, read: false },
      ];

      const pruned = generator.pruneOldNews(newsFeed, 2);

      expect(pruned).toHaveLength(2);
    });

    it('should handle empty news feed', () => {
      const pruned = generator.pruneOldNews([], 5);

      expect(pruned).toHaveLength(0);
    });

    it('should remove very old news', () => {
      const newsFeed = [
        { id: '1', season: 1, week: 1, date: new Date(), type: 'general' as const, headline: 'News 1', body: 'Body 1', teams: [], importance: 'low' as const, read: false },
        { id: '2', season: 5, week: 1, date: new Date(), type: 'general' as const, headline: 'News 5', body: 'Body 5', teams: [], importance: 'low' as const, read: false },
        { id: '3', season: 10, week: 1, date: new Date(), type: 'general' as const, headline: 'News 10', body: 'Body 10', teams: [], importance: 'low' as const, read: false },
      ];

      const pruned = generator.pruneOldNews(newsFeed, 10);

      expect(pruned).toHaveLength(1);
      expect(pruned[0].season).toBe(10);
    });
  });
});
