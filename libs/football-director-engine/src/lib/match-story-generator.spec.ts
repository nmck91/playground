/**
 * Football Director Engine - Match Story Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MatchStoryGenerator } from './match-story-generator';
import { Fixture, Team, LeagueTable, MatchResult, ManOfMatch } from './types';
import { createMockTeam, createMockPlayer } from '../__tests__';

describe('MatchStoryGenerator', () => {
  let generator: MatchStoryGenerator;

  beforeEach(() => {
    generator = new MatchStoryGenerator();
  });

  describe('generatePreview', () => {
    const mockFixture: Fixture = {
      id: 'fixture-1',
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      week: 10,
      season: 2024,
    };

    const mockLeagueTable: LeagueTable[] = [
      {
        teamId: 'team-a',
        teamName: 'Team A',
        played: 9,
        won: 6,
        drawn: 2,
        lost: 1,
        goalsFor: 18,
        goalsAgainst: 8,
        points: 20,
        goalDifference: 10,
      },
      {
        teamId: 'team-b',
        teamName: 'Team B',
        played: 9,
        won: 4,
        drawn: 3,
        lost: 2,
        goalsFor: 12,
        goalsAgainst: 10,
        points: 15,
        goalDifference: 2,
      },
    ];

    it('should generate preview with all required fields', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      expect(preview.fixtureId).toBe('fixture-1');
      expect(preview.homeTeam).toBe('Team A');
      expect(preview.awayTeam).toBe('Team B');
      expect(preview.week).toBe(10);
      expect(preview.homePosition).toBe(1);
      expect(preview.awayPosition).toBe(2);
      expect(preview.headToHead).toBeDefined();
      expect(preview.homeTeamNews).toBeDefined();
      expect(preview.awayTeamNews).toBeDefined();
      expect(preview.expectedAttendance).toBeGreaterThan(0);
      expect(preview.weather).toBeDefined();
      expect(preview.isDerby).toBe(false);
      expect(preview.matchImportance).toBeDefined();
      expect(preview.managerQuotes).toBeDefined();
    });

    it('should calculate correct team positions', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      expect(preview.homePosition).toBe(1); // Team A is first
      expect(preview.awayPosition).toBe(2); // Team B is second
    });

    it('should generate team news with injuries and suspensions', () => {
      const homeTeam = createMockTeam({
        id: 'team-a',
        name: 'Team A',
        players: [
          createMockPlayer({
            id: 'injured-1',
            name: 'Injured Player',
            injury: { type: 'moderate', description: 'hamstring strain', weeksRemaining: 3, sustainedInWeek: 8 },
          }),
          createMockPlayer({
            id: 'suspended-1',
            name: 'Suspended Player',
            suspendedUntil: 12, // Suspended until week 12 (currentWeek is 10)
          }),
          createMockPlayer({ id: 'fit-1', name: 'Fit Player' }),
        ],
      });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      expect(preview.homeTeamNews.injuries).toHaveLength(1);
      expect(preview.homeTeamNews.injuries[0].playerName).toBe('Injured Player');
      expect(preview.homeTeamNews.suspensions).toHaveLength(1);
      expect(preview.homeTeamNews.suspensions[0].playerName).toBe('Suspended Player');
    });

    it('should detect derby matches', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Manchester United' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Manchester City' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      expect(preview.isDerby).toBe(true);
      expect(preview.matchImportance).toBe('high'); // Derbies are always high importance
    });

    it('should assess match importance correctly for top-of-table clash', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      // Both teams in top 4 (positions 1 and 2)
      expect(preview.matchImportance).toBe('high');
    });

    it('should generate manager quotes', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const preview = generator.generatePreview(
        mockFixture,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        [],
        10,
        12345
      );

      expect(preview.managerQuotes?.home).toBeTruthy();
      expect(preview.managerQuotes?.away).toBeTruthy();
      expect(typeof preview.managerQuotes?.home).toBe('string');
      expect(typeof preview.managerQuotes?.away).toBe('string');
    });
  });

  describe('generatePostMatchAnalysis', () => {
    const mockLeagueTable: LeagueTable[] = [
      {
        teamId: 'team-a',
        teamName: 'Team A',
        played: 10,
        won: 7,
        drawn: 2,
        lost: 1,
        goalsFor: 21,
        goalsAgainst: 9,
        points: 23,
        goalDifference: 12,
      },
      {
        teamId: 'team-b',
        teamName: 'Team B',
        played: 10,
        won: 4,
        drawn: 3,
        lost: 3,
        goalsFor: 13,
        goalsAgainst: 13,
        points: 15,
        goalDifference: 0,
      },
    ];

    it('should generate post-match analysis for home win', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Star Player',
        rating: 8.5,
        team: 'home',
        reason: 'Outstanding performance',
      };

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        homeGoalScorers: ['Player 1', 'Player 2', 'Player 3'],
        awayGoalScorers: ['Player 4'],
        manOfMatch,
        attendance: 45000,
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.homeManagerQuote).toBeDefined();
      expect(analysis.awayManagerQuote).toBeDefined();
      expect(analysis.homeManagerQuote.sentiment).toBe('happy');
      expect(analysis.awayManagerQuote.sentiment).toBe('frustrated');
      expect(analysis.playerInterview).toBeDefined();
      expect(analysis.playerInterview?.playerName).toBe('Star Player');
      expect(analysis.keyStats).toBeDefined();
      expect(analysis.keyStats.length).toBeGreaterThan(0);
    });

    it('should generate post-match analysis for away win', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 1,
        awayScore: 2,
        result: 'away',
        homeGoalScorers: ['Player 1'],
        awayGoalScorers: ['Player 2', 'Player 3'],
        attendance: 45000,
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.homeManagerQuote.sentiment).toBe('frustrated');
      expect(analysis.awayManagerQuote.sentiment).toBe('happy');
    });

    it('should generate post-match analysis for draw', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
        homeGoalScorers: ['Player 1', 'Player 2'],
        awayGoalScorers: ['Player 3', 'Player 4'],
        attendance: 45000,
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.homeManagerQuote.sentiment).toBe('neutral');
      expect(analysis.awayManagerQuote.sentiment).toBe('neutral');
    });

    it('should identify red card as turning point', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 0,
        result: 'home',
        events: [
          {
            minute: 35,
            type: 'red-card',
            team: 'away',
            playerName: 'Sent Off Player',
            playerId: 'player-1',
            description: 'Sent off!',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.turningPoint).toBeDefined();
      expect(analysis.turningPoint).toContain('sent off');
      expect(analysis.turningPoint).toContain('35');
    });

    it('should compile key stats correctly', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Best Player',
        rating: 9.0,
        team: 'home',
        reason: 'Outstanding performance',
      };

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        homeGoalScorers: ['Player 1', 'Player 2', 'Player 3'],
        awayGoalScorers: ['Player 4'],
        manOfMatch,
        attendance: 50000,
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.keyStats).toBeDefined();

      // Check final score stat (keyStats are strings, not objects)
      const scoreStat = analysis.keyStats.find((s) => s.startsWith('Final Score:'));
      expect(scoreStat).toBeDefined();
      expect(scoreStat).toBe('Final Score: 3-1');

      // Check scorers
      const homeScorers = analysis.keyStats.find((s) => s.startsWith('Team A Scorers:'));
      expect(homeScorers).toBeDefined();
      expect(homeScorers).toContain('Player 1');

      // Check man of match
      const motm = analysis.keyStats.find((s) => s.startsWith('Man of the Match:'));
      expect(motm).toBeDefined();
      expect(motm).toContain('Best Player');
      expect(motm).toContain('9.0');

      // Check attendance
      const attendance = analysis.keyStats.find((s) => s.startsWith('Attendance:'));
      expect(attendance).toBeDefined();
      expect(attendance).toContain('50,000');
    });

    it('should not generate player interview if no man of match', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });

      const matchResult: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 1,
        awayScore: 1,
        result: 'draw',
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        matchResult,
        homeTeam,
        awayTeam,
        mockLeagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeUndefined();
    });
  });

  describe('deterministic behavior with seeds', () => {
    it('should generate same preview with same seed', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });
      const fixture: Fixture = {
        id: 'fixture-1',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        week: 10,
        season: 2024,
      };
      const leagueTable: LeagueTable[] = [
        { teamId: 'team-a', teamName: 'Team A', played: 9, won: 6, drawn: 2, lost: 1, goalsFor: 18, goalsAgainst: 8, points: 20, goalDifference: 10 },
      ];

      const preview1 = generator.generatePreview(fixture, homeTeam, awayTeam, leagueTable, [], 10, 12345);
      const preview2 = generator.generatePreview(fixture, homeTeam, awayTeam, leagueTable, [], 10, 12345);

      expect(preview1.managerQuotes?.home).toBe(preview2.managerQuotes?.home);
      expect(preview1.managerQuotes?.away).toBe(preview2.managerQuotes?.away);
      expect(preview1.expectedAttendance).toBe(preview2.expectedAttendance);
    });

    it('should generate same analysis with same seed', () => {
      const homeTeam = createMockTeam({ id: 'team-a', name: 'Team A' });
      const awayTeam = createMockTeam({ id: 'team-b', name: 'Team B' });
      const result: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
        events: [],
      };
      const leagueTable: LeagueTable[] = [
        { teamId: 'team-a', teamName: 'Team A', played: 10, won: 7, drawn: 2, lost: 1, goalsFor: 21, goalsAgainst: 9, points: 23, goalDifference: 12 },
      ];

      const analysis1 = generator.generatePostMatchAnalysis(result, homeTeam, awayTeam, leagueTable, 12345);
      const analysis2 = generator.generatePostMatchAnalysis(result, homeTeam, awayTeam, leagueTable, 12345);

      expect(analysis1.homeManagerQuote.quote).toBe(analysis2.homeManagerQuote.quote);
      expect(analysis1.awayManagerQuote.quote).toBe(analysis2.awayManagerQuote.quote);
    });
  });
});
