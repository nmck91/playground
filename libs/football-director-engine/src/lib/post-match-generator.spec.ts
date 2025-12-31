/**
 * Football Director Engine - Post-Match Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PostMatchGenerator } from './post-match-generator';
import { MatchResult, Team, LeagueTable, ManOfMatch } from './types';
import { createMockTeam, createMockStaff } from '../__tests__';

describe('PostMatchGenerator', () => {
  let generator: PostMatchGenerator;

  beforeEach(() => {
    generator = new PostMatchGenerator();
  });

  describe('generatePostMatchAnalysis', () => {
    it('should generate complete post-match analysis', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager', name: 'Home Manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager', name: 'Away Manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.homeManagerQuote).toBeDefined();
      expect(analysis.awayManagerQuote).toBeDefined();
      expect(analysis.keyStats).toBeDefined();
      expect(analysis.homeManagerQuote.managerName).toBe('Home Manager');
      expect(analysis.awayManagerQuote.managerName).toBe('Away Manager');
      // turningPoint may be undefined if there are no significant events
    });

    it('should generate happy quote for winning manager', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager', name: 'Happy Manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager', name: 'Sad Manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 11,
          drawn: 5,
          lost: 3,
          goalsFor: 32,
          goalsAgainst: 16,
          points: 38,
          goalDifference: 16,
          played: 19,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 5,
          goalsFor: 25,
          goalsAgainst: 22,
          points: 30,
          goalDifference: 3,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.homeManagerQuote.sentiment).toBe('happy');
      expect(analysis.awayManagerQuote.sentiment).toBe('frustrated');
    });

    it('should generate neutral quotes for draw', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager', name: 'Home Manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager', name: 'Away Manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 17,
          points: 36,
          goalDifference: 13,
          played: 19,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 7,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 31,
          goalDifference: 5,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.homeManagerQuote.sentiment).toBe('neutral');
      expect(analysis.awayManagerQuote.sentiment).toBe('neutral');
    });

    it('should include player interview when man of match present', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Star Player',
        team: 'home',
        rating: 9.5,
      };

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        manOfMatch,
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeDefined();
      expect(analysis.playerInterview?.playerName).toBe('Star Player');
      expect(analysis.playerInterview?.rating).toBe(9.5);
    });

    it('should not include player interview when man of match absent', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeUndefined();
    });

    it('should identify red card as turning point', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
        events: [
          {
            minute: 45,
            type: 'red-card',
            team: 'away',
            playerName: 'Red Card Player',
            playerId: 'player-red',
            description: 'Red card',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toContain('Red Card Player');
      expect(analysis.turningPoint).toContain('45');
      expect(analysis.turningPoint).toContain('red card');
    });

    it('should identify early goal as turning point', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 0,
        result: 'home',
        events: [
          {
            minute: 5,
            type: 'goal',
            team: 'home',
            playerName: 'Early Scorer',
            playerId: 'player-1',
            description: 'Early goal',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toContain('Early Scorer');
      expect(analysis.turningPoint).toContain('early goal');
    });

    it('should compile key stats for possession dominance', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        stats: {
          possession: { home: 70, away: 30 },
          shots: { home: 20, away: 8 },
          shotsOnTarget: { home: 10, away: 4 },
          fouls: { home: 10, away: 12 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats.length).toBeGreaterThan(0);
      expect(analysis.keyStats.some((stat) => stat.includes('possession'))).toBe(true);
    });

    it('should compile key stats for clinical finishing', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 10, away: 10 },
          shotsOnTarget: { home: 4, away: 6 },
          fouls: { home: 10, away: 12 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      // Home team scored 3 from 4 shots on target (75% conversion)
      expect(analysis.keyStats.some((stat) => stat.includes('clinical'))).toBe(true);
    });

    it('should highlight world-class man of match performance', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'World Class Player',
        team: 'home',
        rating: 9.8,
      };

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 4,
        awayScore: 0,
        result: 'home',
        manOfMatch,
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 10, away: 10 },
          shotsOnTarget: { home: 8, away: 4 },
          fouls: { home: 10, away: 12 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(
        analysis.keyStats.some(
          (stat) => stat.includes('World Class Player') && stat.includes('9.8')
        )
      ).toBe(true);
    });

    it('should handle match with no stats', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats).toEqual([]);
    });

    it('should use default manager name when manager not found', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.homeManagerQuote.managerName).toBe('Manager');
      expect(analysis.awayManagerQuote.managerName).toBe('Manager');
    });

    it('should identify late equalizer as turning point', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 16,
          points: 36,
          goalDifference: 14,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
        events: [
          {
            minute: 85,
            type: 'goal',
            team: 'away',
            playerName: 'Late Equalizer',
            playerId: 'player-2',
            description: 'Late goal',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toContain('Late Equalizer');
      expect(analysis.turningPoint).toContain('dramatic late equalizer');
      expect(analysis.turningPoint).toContain('85');
    });

    it('should identify late winner as turning point', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 11,
          drawn: 5,
          lost: 3,
          goalsFor: 32,
          goalsAgainst: 15,
          points: 38,
          goalDifference: 17,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 1,
        result: 'home',
        events: [
          {
            minute: 88,
            type: 'goal',
            team: 'home',
            playerName: 'Late Winner',
            playerId: 'player-1',
            description: 'Late goal',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toContain('Late Winner');
      expect(analysis.turningPoint).toContain('late strike');
      expect(analysis.turningPoint).toContain('88');
    });

    it('should identify first goal in tight match as turning point', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 11,
          drawn: 5,
          lost: 3,
          goalsFor: 31,
          goalsAgainst: 15,
          points: 38,
          goalDifference: 16,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 1,
        awayScore: 0,
        result: 'home',
        events: [
          {
            minute: 55,
            type: 'goal',
            team: 'home',
            playerName: 'Only Scorer',
            playerId: 'player-1',
            description: 'Only goal',
          },
        ],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toContain('Only Scorer');
      expect(analysis.turningPoint).toContain('opening goal');
      expect(analysis.turningPoint).toContain('tight encounter');
    });

    it('should return undefined turning point when no events', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 16,
          points: 36,
          goalDifference: 14,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 1,
        awayScore: 1,
        result: 'draw',
        events: [],
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.turningPoint).toBeUndefined();
    });

    it('should highlight away team possession dominance', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 4,
          goalsFor: 28,
          goalsAgainst: 18,
          points: 35,
          goalDifference: 10,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 0,
        awayScore: 2,
        result: 'away',
        stats: {
          possession: { home: 30, away: 70 },
          shots: { home: 8, away: 18 },
          shotsOnTarget: { home: 3, away: 10 },
          fouls: { home: 12, away: 10 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats.some((stat) => stat.includes('Away FC') && stat.includes('70%'))).toBe(true);
    });

    it('should highlight even possession split', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 16,
          points: 36,
          goalDifference: 14,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 1,
        awayScore: 1,
        result: 'draw',
        stats: {
          possession: { home: 51, away: 49 },
          shots: { home: 12, away: 12 },
          shotsOnTarget: { home: 6, away: 6 },
          fouls: { home: 10, away: 10 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats.some((stat) => stat.includes('Evenly contested'))).toBe(true);
    });

    it('should highlight away team creating more chances', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 4,
          goalsFor: 28,
          goalsAgainst: 20,
          points: 35,
          goalDifference: 8,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 1,
        awayScore: 3,
        result: 'away',
        stats: {
          possession: { home: 45, away: 55 },
          shots: { home: 8, away: 20 },
          shotsOnTarget: { home: 4, away: 12 },
          fouls: { home: 10, away: 12 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats.some((stat) => stat.includes('Away FC') && stat.includes('significantly more chances'))).toBe(true);
    });

    it('should highlight away team clinical finishing', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 4,
          goalsFor: 28,
          goalsAgainst: 21,
          points: 35,
          goalDifference: 7,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 0,
        awayScore: 3,
        result: 'away',
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 10, away: 10 },
          shotsOnTarget: { home: 5, away: 4 },
          fouls: { home: 10, away: 10 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      // Away team scored 3 from 4 shots on target (75% conversion)
      expect(analysis.keyStats.some((stat) => stat.includes('Away FC') && stat.includes('clinical'))).toBe(true);
    });

    it('should highlight feisty encounter with many fouls', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 16,
          points: 36,
          goalDifference: 14,
          played: 19,
        },
      ];

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 12, away: 12 },
          shotsOnTarget: { home: 6, away: 6 },
          fouls: { home: 18, away: 15 },
        },
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.keyStats.some((stat) => stat.includes('Feisty encounter'))).toBe(true);
    });

    it('should generate positive player interview for winning team', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 11,
          drawn: 5,
          lost: 3,
          goalsFor: 32,
          goalsAgainst: 15,
          points: 38,
          goalDifference: 17,
          played: 19,
        },
      ];

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Winner Player',
        team: 'home',
        rating: 9.0,
      };

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        manOfMatch,
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeDefined();
      expect(analysis.playerInterview?.playerName).toBe('Winner Player');
      expect(analysis.playerInterview?.rating).toBe(9.0);
      expect(analysis.playerInterview?.quote.length).toBeGreaterThan(0);
    });

    it('should generate neutral player interview for draw', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 6,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 16,
          points: 36,
          goalDifference: 14,
          played: 19,
        },
      ];

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Draw Player',
        team: 'home',
        rating: 8.5,
      };

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
        manOfMatch,
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeDefined();
      expect(analysis.playerInterview?.playerName).toBe('Draw Player');
      expect(analysis.playerInterview?.rating).toBe(8.5);
      expect(analysis.playerInterview?.quote.length).toBeGreaterThan(0);
    });

    it('should generate negative player interview for losing team', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const awayTeam = createMockTeam({
        id: 'away',
        name: 'Away FC',
        staff: [createMockStaff({ role: 'manager' })],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 4,
          goalsFor: 28,
          goalsAgainst: 18,
          points: 35,
          goalDifference: 10,
          played: 19,
        },
      ];

      const manOfMatch: ManOfMatch = {
        playerId: 'player-1',
        playerName: 'Losing Player',
        team: 'home',
        rating: 7.5,
      };

      const result: MatchResult = {
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        homeScore: 1,
        awayScore: 3,
        result: 'away',
        manOfMatch,
      };

      const analysis = generator.generatePostMatchAnalysis(
        result,
        homeTeam,
        awayTeam,
        leagueTable,
        12345
      );

      expect(analysis.playerInterview).toBeDefined();
      expect(analysis.playerInterview?.playerName).toBe('Losing Player');
      expect(analysis.playerInterview?.rating).toBe(7.5);
      expect(analysis.playerInterview?.quote.length).toBeGreaterThan(0);
    });
  });
});
