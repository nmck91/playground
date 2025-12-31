/**
 * Football Director Engine - Records Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecordsManager } from './records-manager';
import { LeagueTable, MatchResult, Team, Fixture } from './types';
import { createMockTeam, createMockPlayer, createMockFixture } from '../__tests__';

describe('RecordsManager', () => {
  let manager: RecordsManager;

  beforeEach(() => {
    manager = new RecordsManager();
  });

  describe('calculateSeasonRecords', () => {
    it('should calculate season records correctly', () => {
      const team = createMockTeam({ name: 'Test FC' });
      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 25,
        drawn: 8,
        lost: 5,
        goalsFor: 80,
        goalsAgainst: 30,
        points: 83,
        goalDifference: 50,
        played: 38,
      };

      const matchHistory: MatchResult[] = [
        {
          homeTeam: 'Test FC',
          awayTeam: 'Opponent',
          homeScore: 3,
          awayScore: 1,
          result: 'home',
        },
      ];

      const fixtures: Fixture[] = [
        createMockFixture({
          homeTeamId: team.id,
          awayTeamId: 'opponent-1',
          played: true,
          result: { homeScore: 3, awayScore: 1, result: 'home' },
        }),
      ];

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        matchHistory,
        fixtures,
        team,
        team.id
      );

      expect(records.season).toBe(2024);
      expect(records.points).toBe(83);
      expect(records.won).toBe(25);
      expect(records.drawn).toBe(8);
      expect(records.lost).toBe(5);
    });

    it('should track top scorer from team', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
          createMockPlayer({
            id: 'top-scorer',
            name: 'Top Scorer',
            stats: {
              goals: 20,
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
            id: 'other',
            name: 'Other',
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
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 20,
        drawn: 10,
        lost: 8,
        goalsFor: 60,
        goalsAgainst: 40,
        points: 70,
        goalDifference: 20,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topScorer).toBeDefined();
      expect(records.topScorer?.playerName).toBe('Top Scorer');
      expect(records.topScorer?.goals).toBe(20);
    });

    it('should track top assists provider', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
          createMockPlayer({
            id: 'assist-king',
            name: 'Assist King',
            stats: {
              goals: 5,
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
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 20,
        drawn: 10,
        lost: 8,
        goalsFor: 60,
        goalsAgainst: 40,
        points: 70,
        goalDifference: 20,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topAssists).toBeDefined();
      expect(records.topAssists?.playerName).toBe('Assist King');
      expect(records.topAssists?.assists).toBe(15);
    });

    it('should handle team with no goalscorers', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
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
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 0,
        drawn: 10,
        lost: 28,
        goalsFor: 0,
        goalsAgainst: 80,
        points: 10,
        goalDifference: -80,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topScorer).toBeUndefined();
      expect(records.topAssists).toBeUndefined();
    });
  });

  describe('findBiggestResults', () => {
    it('should find biggest win', () => {
      const matches: MatchResult[] = [
        { homeTeam: 'Test FC', awayTeam: 'Weak FC', homeScore: 5, awayScore: 0, result: 'home', id: '1', week: 10, competitionType: 'league' },
        { homeTeam: 'Test FC', awayTeam: 'Other FC', homeScore: 2, awayScore: 1, result: 'home', id: '2', week: 15, competitionType: 'league' },
        { homeTeam: 'Strong FC', awayTeam: 'Test FC', homeScore: 0, awayScore: 3, result: 'away', id: '3', week: 20, competitionType: 'league' },
      ];

      const { biggestWin } = manager.findBiggestResults(matches, 'Test FC');

      expect(biggestWin).toBeDefined();
      expect(biggestWin?.opponent).toBe('Weak FC');
      expect(biggestWin?.score).toBe('5-0');
      expect(biggestWin?.homeOrAway).toBe('home');
    });

    it('should find biggest loss', () => {
      const matches: MatchResult[] = [
        { homeTeam: 'Test FC', awayTeam: 'Strong FC', homeScore: 0, awayScore: 4, result: 'away', id: '1', week: 10, competitionType: 'league' },
        { homeTeam: 'Test FC', awayTeam: 'Other FC', homeScore: 1, awayScore: 2, result: 'away', id: '2', week: 15, competitionType: 'league' },
        { homeTeam: 'Another FC', awayTeam: 'Test FC', homeScore: 6, awayScore: 1, result: 'home', id: '3', week: 20, competitionType: 'league' },
      ];

      const { biggestLoss } = manager.findBiggestResults(matches, 'Test FC');

      expect(biggestLoss).toBeDefined();
      expect(biggestLoss?.opponent).toBe('Another FC');
      expect(biggestLoss?.score).toBe('1-6');
      expect(biggestLoss?.homeOrAway).toBe('away');
    });

    it('should handle no wins or losses', () => {
      const matches: MatchResult[] = [
        { homeTeam: 'Test FC', awayTeam: 'Other FC', homeScore: 1, awayScore: 1, result: 'draw', id: '1', week: 10, competitionType: 'league' },
      ];

      const { biggestWin, biggestLoss } = manager.findBiggestResults(matches, 'Test FC');

      expect(biggestWin).toBeUndefined();
      expect(biggestLoss).toBeUndefined();
    });

    it('should handle away wins correctly', () => {
      const matches: MatchResult[] = [
        { homeTeam: 'Other FC', awayTeam: 'Test FC', homeScore: 1, awayScore: 7, result: 'away', id: '1', week: 10, competitionType: 'league' },
      ];

      const { biggestWin } = manager.findBiggestResults(matches, 'Test FC');

      expect(biggestWin?.opponent).toBe('Other FC');
      expect(biggestWin?.score).toBe('7-1');
      expect(biggestWin?.homeOrAway).toBe('away');
    });
  });

  describe('calculateStreaks', () => {
    it('should calculate longest win streak', () => {
      const fixtures: Fixture[] = [
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-1', week: 1, played: true, result: { homeScore: 2, awayScore: 1, result: 'home' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-2', week: 2, played: true, result: { homeScore: 3, awayScore: 0, result: 'home' } }),
        createMockFixture({ homeTeamId: 'opp-3', awayTeamId: 'team-1', week: 3, played: true, result: { homeScore: 1, awayScore: 2, result: 'away' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-4', week: 4, played: true, result: { homeScore: 1, awayScore: 2, result: 'away' } }),
      ];

      const { longestWinStreak } = manager.calculateStreaks(fixtures, 'team-1');

      expect(longestWinStreak).toBe(3);
    });

    it('should calculate longest unbeaten streak including draws', () => {
      const fixtures: Fixture[] = [
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-1', week: 1, played: true, result: { homeScore: 2, awayScore: 1, result: 'home' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-2', week: 2, played: true, result: { homeScore: 1, awayScore: 1, result: 'draw' } }),
        createMockFixture({ homeTeamId: 'opp-3', awayTeamId: 'team-1', week: 3, played: true, result: { homeScore: 0, awayScore: 2, result: 'away' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-4', week: 4, played: true, result: { homeScore: 2, awayScore: 2, result: 'draw' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-5', week: 5, played: true, result: { homeScore: 0, awayScore: 1, result: 'away' } }),
      ];

      const { longestUnbeatenStreak } = manager.calculateStreaks(fixtures, 'team-1');

      expect(longestUnbeatenStreak).toBe(4);
    });

    it('should reset streaks after a loss', () => {
      const fixtures: Fixture[] = [
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-1', week: 1, played: true, result: { homeScore: 2, awayScore: 1, result: 'home' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-2', week: 2, played: true, result: { homeScore: 0, awayScore: 3, result: 'away' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-3', week: 3, played: true, result: { homeScore: 2, awayScore: 0, result: 'home' } }),
      ];

      const { longestWinStreak, longestUnbeatenStreak } = manager.calculateStreaks(fixtures, 'team-1');

      expect(longestWinStreak).toBe(1);
      expect(longestUnbeatenStreak).toBe(1);
    });

    it('should handle empty fixtures', () => {
      const { longestWinStreak, longestUnbeatenStreak } = manager.calculateStreaks([], 'team-1');

      expect(longestWinStreak).toBe(0);
      expect(longestUnbeatenStreak).toBe(0);
    });

    it('should only count played fixtures', () => {
      const fixtures: Fixture[] = [
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-1', week: 1, played: true, result: { homeScore: 2, awayScore: 1, result: 'home' } }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-2', week: 2, played: false }),
        createMockFixture({ homeTeamId: 'team-1', awayTeamId: 'opp-3', week: 3, played: true, result: { homeScore: 1, awayScore: 0, result: 'home' } }),
      ];

      const { longestWinStreak } = manager.calculateStreaks(fixtures, 'team-1');

      expect(longestWinStreak).toBe(2);
    });
  });

  describe('initializeClubRecords', () => {
    it('should initialize all club records with default values', () => {
      const records = manager.initializeClubRecords(2024);

      expect(records.bestLeaguePosition.position).toBe(20);
      expect(records.bestLeaguePosition.season).toBe(2024);
      expect(records.mostPoints.points).toBe(0);
      expect(records.mostWins.wins).toBe(0);
      expect(records.mostGoalsScored.goals).toBe(0);
      expect(records.fewestGoalsConceded.goals).toBe(999);
      expect(records.bestGoalDifference.difference).toBe(-999);
      expect(records.longestWinStreak.streak).toBe(0);
      expect(records.longestUnbeatenStreak.streak).toBe(0);
      expect(records.mostGoalsSingleSeason.goals).toBe(0);
      expect(records.mostAssistsSingleSeason.assists).toBe(0);
      expect(records.mostCleanSheetsSeason.cleanSheets).toBe(0);
    });

    it('should set the season for all records', () => {
      const records = manager.initializeClubRecords(2025);

      expect(records.bestLeaguePosition.season).toBe(2025);
      expect(records.mostPoints.season).toBe(2025);
      expect(records.biggestWin.season).toBe(2025);
    });
  });

  describe('updateClubRecords', () => {
    it('should update best league position when improved', () => {
      const currentRecords = manager.initializeClubRecords(2024);
      currentRecords.bestLeaguePosition = { position: 5, season: 2024 };

      const seasonRecords = {
        season: 2025,
        finalPosition: 3,
        points: 80,
        won: 25,
        drawn: 5,
        lost: 8,
        goalsFor: 75,
        goalsAgainst: 35,
        goalDifference: 40,
        longestWinStreak: 5,
        longestUnbeatenStreak: 10,
        cleanSheets: 15,
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.bestLeaguePosition.position).toBe(3);
      expect(records.bestLeaguePosition.season).toBe(2025);
      expect(brokenRecords).toContain('Best League Position: 3rd');
    });

    it('should update most points when exceeded', () => {
      const currentRecords = manager.initializeClubRecords(2024);
      currentRecords.mostPoints = { points: 75, season: 2024 };

      const seasonRecords = {
        season: 2025,
        finalPosition: 1,
        points: 90,
        won: 28,
        drawn: 6,
        lost: 4,
        goalsFor: 85,
        goalsAgainst: 30,
        goalDifference: 55,
        longestWinStreak: 8,
        longestUnbeatenStreak: 15,
        cleanSheets: 18,
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.mostPoints.points).toBe(90);
      expect(records.mostPoints.season).toBe(2025);
      expect(brokenRecords).toContain('Most Points: 90');
    });

    it('should update multiple records in one season', () => {
      const currentRecords = manager.initializeClubRecords(2024);

      const seasonRecords = {
        season: 2025,
        finalPosition: 1,
        points: 95,
        won: 30,
        drawn: 5,
        lost: 3,
        goalsFor: 100,
        goalsAgainst: 20,
        goalDifference: 80,
        longestWinStreak: 12,
        longestUnbeatenStreak: 25,
        cleanSheets: 22,
        topScorer: { playerId: 'p1', playerName: 'Striker', goals: 35 },
        topAssists: { playerId: 'p2', playerName: 'Midfielder', assists: 20 },
        biggestWin: { opponent: 'Weak FC', score: '7-0', homeOrAway: 'home' as const, week: 10 },
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(brokenRecords.length).toBeGreaterThan(5);
      expect(brokenRecords).toContain('Best League Position: 1st');
      expect(brokenRecords).toContain('Most Points: 95');
      expect(brokenRecords).toContain('Most Wins: 30');
      expect(brokenRecords).toContain('Most Goals Scored: 100');
      expect(brokenRecords).toContain('Fewest Goals Conceded: 20');
      expect(brokenRecords).toContain('Best Goal Difference: +80');
      expect(brokenRecords).toContain('Biggest Win: 7-0');
      expect(brokenRecords).toContain('Longest Win Streak: 12 games');
      expect(brokenRecords).toContain('Longest Unbeaten Streak: 25 games');
      expect(brokenRecords).toContain('Most Goals (Player): Striker - 35');
      expect(brokenRecords).toContain('Most Assists (Player): Midfielder - 20');
      expect(brokenRecords).toContain('Most Clean Sheets: 22');
    });

    it('should not update records that were not broken', () => {
      const currentRecords = manager.initializeClubRecords(2024);
      currentRecords.mostPoints = { points: 100, season: 2024 };
      currentRecords.mostWins = { wins: 35, season: 2024 };

      const seasonRecords = {
        season: 2025,
        finalPosition: 2,
        points: 85,
        won: 28,
        drawn: 5,
        lost: 5,
        goalsFor: 75,
        goalsAgainst: 30,
        goalDifference: 45,
        longestWinStreak: 8,
        longestUnbeatenStreak: 12,
        cleanSheets: 15,
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.mostPoints.points).toBe(100);
      expect(records.mostPoints.season).toBe(2024);
      expect(records.mostWins.wins).toBe(35);
      expect(records.mostWins.season).toBe(2024);
      expect(brokenRecords).not.toContain('Most Points');
      expect(brokenRecords).not.toContain('Most Wins');
    });

    it('should handle season with no top scorer', () => {
      const currentRecords = manager.initializeClubRecords(2024);

      const seasonRecords = {
        season: 2025,
        finalPosition: 15,
        points: 40,
        won: 10,
        drawn: 10,
        lost: 18,
        goalsFor: 35,
        goalsAgainst: 60,
        goalDifference: -25,
        longestWinStreak: 2,
        longestUnbeatenStreak: 3,
        cleanSheets: 8,
      };

      const { records } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.mostGoalsSingleSeason.goals).toBe(0);
      expect(records.mostAssistsSingleSeason.assists).toBe(0);
    });

    it('should update biggest win by margin', () => {
      const currentRecords = manager.initializeClubRecords(2024);
      currentRecords.biggestWin = { opponent: 'Old FC', score: '4-0', homeOrAway: 'home', week: 5, season: 2024 };

      const seasonRecords = {
        season: 2025,
        finalPosition: 1,
        points: 90,
        won: 28,
        drawn: 6,
        lost: 4,
        goalsFor: 85,
        goalsAgainst: 25,
        goalDifference: 60,
        longestWinStreak: 10,
        longestUnbeatenStreak: 18,
        cleanSheets: 20,
        biggestWin: { opponent: 'New FC', score: '6-0', homeOrAway: 'away' as const, week: 15 },
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.biggestWin.score).toBe('6-0');
      expect(records.biggestWin.opponent).toBe('New FC');
      expect(brokenRecords).toContain('Biggest Win: 6-0');
    });

    it('should format goal difference with + sign for positive', () => {
      const currentRecords = manager.initializeClubRecords(2024);

      const seasonRecords = {
        season: 2025,
        finalPosition: 1,
        points: 95,
        won: 30,
        drawn: 5,
        lost: 3,
        goalsFor: 90,
        goalsAgainst: 25,
        goalDifference: 65,
        longestWinStreak: 10,
        longestUnbeatenStreak: 20,
        cleanSheets: 18,
      };

      const { brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(brokenRecords).toContain('Best Goal Difference: +65');
    });

    it('should handle negative goal difference', () => {
      const currentRecords = manager.initializeClubRecords(2024);
      currentRecords.bestGoalDifference = { difference: -50, season: 2024 };

      const seasonRecords = {
        season: 2025,
        finalPosition: 18,
        points: 35,
        won: 8,
        drawn: 11,
        lost: 19,
        goalsFor: 30,
        goalsAgainst: 60,
        goalDifference: -30,
        longestWinStreak: 2,
        longestUnbeatenStreak: 4,
        cleanSheets: 6,
      };

      const { records, brokenRecords } = manager.updateClubRecords(currentRecords, seasonRecords);

      expect(records.bestGoalDifference.difference).toBe(-30);
      expect(brokenRecords).toContain('Best Goal Difference: -30');
    });
  });
});
