/**
 * Football Director Engine - Type Guards Tests
 *
 * Epic 1.5 - Story 1.5.4: Test runtime validation and type guards
 */

import { describe, it, expect } from 'vitest';
import {
  isPlayer,
  isTeam,
  isMatchResult,
  isGameState,
  isSeason,
  validatePlayer,
  validateTeam,
  validateMatchResult,
  validateGameState,
  assertPlayer,
  assertTeam,
  assertGameState,
  formatValidationErrors,
  Schemas,
} from './type-guards';
import { TeamGenerator } from './team-generator';

describe('Type Guards', () => {
  describe('Player Type Guards', () => {
    it('should validate a valid player', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());
      const player = teams[0].players[0];

      expect(isPlayer(player)).toBe(true);

      const result = validatePlayer(player);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBeDefined();
      }
    });

    it('should reject invalid player - missing required fields', () => {
      const invalidPlayer = {
        id: 'test-1',
        name: 'John Doe',
        // Missing position, skill, etc.
      };

      expect(isPlayer(invalidPlayer)).toBe(false);

      const result = validatePlayer(invalidPlayer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject invalid player - wrong types', () => {
      const invalidPlayer = {
        id: 'test-1',
        name: 'John Doe',
        position: 'INVALID', // Should be GK, DEF, MID, or FWD
        skill: 25, // Should be 1-20
        age: 10, // Should be >= 16
        wages: -100, // Should be positive
        stats: {},
        history: [],
        contract: {},
        morale: 150, // Should be 0-100
      };

      expect(isPlayer(invalidPlayer)).toBe(false);

      const result = validatePlayer(invalidPlayer);
      expect(result.success).toBe(false);
    });

    it('should format validation errors correctly', () => {
      const invalidPlayer = {
        id: '',
        name: '',
        position: 'INVALID',
      };

      const result = validatePlayer(invalidPlayer);
      if (!result.success) {
        const formatted = formatValidationErrors(result.errors);
        expect(formatted).toContain('id');
        expect(formatted.length).toBeGreaterThan(0);
      }
    });

    it('should throw on assertion failure', () => {
      const invalidPlayer = {
        id: 'test',
        name: 'Test',
      };

      expect(() => assertPlayer(invalidPlayer, 'Test Context')).toThrow('Invalid Player');
      expect(() => assertPlayer(invalidPlayer, 'Test Context')).toThrow('Test Context');
    });
  });

  describe('Team Type Guards', () => {
    it('should validate a valid team', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());
      const team = teams[0];

      expect(isTeam(team)).toBe(true);

      const result = validateTeam(team);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBeDefined();
        expect(result.data.name).toBeDefined();
        expect(result.data.players.length).toBeGreaterThanOrEqual(11);
      }
    });

    it('should reject invalid team - insufficient players', () => {
      const invalidTeam = {
        id: 'team-1',
        name: 'Test FC',
        players: [], // Need at least 11
        staff: [],
        budget: 1000000,
        tactics: {
          formation: '4-4-2',
          mentality: 'balanced',
          roles: {
            defenders: 'full-back',
            midfielders: 'box-to-box',
            forwards: 'poacher',
          },
          instructions: {
            tempo: 'balanced',
            width: 'balanced',
            pressing: 'medium',
            passingStyle: 'mixed',
          },
          setPieces: {
            cornerTaker: 'player-1',
            freeKickTaker: 'player-1',
            penaltyTaker: 'player-1',
          },
        },
        philosophy: 'balanced',
      };

      expect(isTeam(invalidTeam)).toBe(false);

      const result = validateTeam(invalidTeam);
      expect(result.success).toBe(false);
    });

    it('should reject invalid team - missing tactics', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());
      const invalidTeam = {
        ...teams[0],
        tactics: undefined,
      };

      expect(isTeam(invalidTeam)).toBe(false);
    });

    it('should throw on team assertion failure', () => {
      const invalidTeam = {
        id: 'team-1',
        players: [],
      };

      expect(() => assertTeam(invalidTeam, 'Team Validation')).toThrow('Invalid Team');
    });
  });

  describe('MatchResult Type Guards', () => {
    it('should validate a valid match result', () => {
      const matchResult = {
        homeScore: 2,
        awayScore: 1,
        homeTeam: 'Home FC',
        awayTeam: 'Away United',
        result: 'home' as const,
        weather: {
          condition: 'sunny' as const,
          temperature: 20,
          description: 'Perfect conditions',
        },
        stats: {
          possession: { home: 55, away: 45 },
          shots: { home: 12, away: 8 },
          shotsOnTarget: { home: 5, away: 3 },
          corners: { home: 6, away: 4 },
          fouls: { home: 10, away: 12 },
        },
        playerRatings: [],
        manOfMatch: null,
        isDerby: false,
        postMatchAnalysis: {},
      };

      expect(isMatchResult(matchResult)).toBe(true);

      const result = validateMatchResult(matchResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid match result - negative scores', () => {
      const invalidResult = {
        homeScore: -1,
        awayScore: 2,
        homeTeam: 'Home FC',
        awayTeam: 'Away United',
        result: 'away',
      };

      expect(isMatchResult(invalidResult)).toBe(false);
    });

    it('should reject invalid match result - missing required fields', () => {
      const invalidResult = {
        homeScore: 1,
        awayScore: 1,
        // Missing homeTeam, awayTeam, result, etc.
      };

      expect(isMatchResult(invalidResult)).toBe(false);
    });

    it('should validate optional fields', () => {
      const matchResult = {
        homeScore: 2,
        awayScore: 1,
        homeTeam: 'Home FC',
        awayTeam: 'Away United',
        result: 'home' as const,
        homeGoalScorers: ['Player 1', 'Player 2'],
        awayGoalScorers: ['Player 3'],
        attendance: 45000,
        weather: {
          condition: 'sunny' as const,
          temperature: 20,
          description: 'Perfect',
        },
        stats: {
          possession: { home: 50, away: 50 },
          shots: { home: 0, away: 0 },
          shotsOnTarget: { home: 0, away: 0 },
          corners: { home: 0, away: 0 },
          fouls: { home: 0, away: 0 },
        },
        playerRatings: [],
        manOfMatch: null,
        isDerby: false,
        postMatchAnalysis: {},
      };

      expect(isMatchResult(matchResult)).toBe(true);
    });
  });

  describe('Season Type Guards', () => {
    it('should validate a valid season', () => {
      const season = {
        year: 2024,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress' as const,
        phase: 'competitive' as const,
        transferWindow: 'closed' as const,
      };

      expect(isSeason(season)).toBe(true);
    });

    it('should reject invalid season - invalid week', () => {
      const invalidSeason = {
        year: 2024,
        currentWeek: 60, // Should be 1-52
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'competitive',
        transferWindow: 'closed',
      };

      expect(isSeason(invalidSeason)).toBe(false);
    });

    it('should reject invalid season - wrong enum values', () => {
      const invalidSeason = {
        year: 2024,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'invalid-status',
        phase: 'competitive',
        transferWindow: 'closed',
      };

      expect(isSeason(invalidSeason)).toBe(false);
    });
  });

  describe('GameState Type Guards', () => {
    it('should validate a valid GameState V2', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());

      const gameState = {
        version: 2 as const,
        id: 'game-123',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: teams[0],
        aiTeams: teams.slice(1),
        season: {
          year: 2024,
          currentWeek: 1,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress' as const,
          phase: 'pre-season' as const,
          transferWindow: 'open' as const,
        },
        fixtures: [],
        leagueTable: [],
        finances: {
          budget: 5000000,
          weeklyIncome: 0,
          weeklyExpenses: 0,
          totalIncome: 0,
          totalExpenses: 0,
          transactions: [],
        },
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: {
          satisfaction: 75,
          jobSecurity: 'safe' as const,
          currentObjective: null,
          objectiveHistory: [],
        },
        seasonRecords: [],
        clubRecords: {},
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      };

      expect(isGameState(gameState)).toBe(true);

      const result = validateGameState(gameState);
      expect(result.success).toBe(true);
    });

    it('should reject invalid GameState - wrong version', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());

      const invalidGameState = {
        version: 3, // Only v2 supported
        id: 'game-123',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: teams[0],
        aiTeams: teams.slice(1),
      };

      expect(isGameState(invalidGameState)).toBe(false);
    });

    it('should reject invalid GameState - missing required fields', () => {
      const invalidGameState = {
        version: 2,
        id: 'game-123',
        // Missing many required fields
      };

      expect(isGameState(invalidGameState)).toBe(false);
    });

    it('should throw on GameState assertion failure', () => {
      const invalidGameState = {
        version: 2,
        id: 'game-123',
      };

      expect(() => assertGameState(invalidGameState, 'SaveService')).toThrow('Invalid GameState');
      expect(() => assertGameState(invalidGameState, 'SaveService')).toThrow('SaveService');
    });
  });

  describe('Schema Exports', () => {
    it('should export Zod schemas', () => {
      expect(Schemas.Player).toBeDefined();
      expect(Schemas.Team).toBeDefined();
      expect(Schemas.MatchResult).toBeDefined();
      expect(Schemas.GameState).toBeDefined();
      expect(Schemas.Season).toBeDefined();
      expect(Schemas.Staff).toBeDefined();
      expect(Schemas.Tactics).toBeDefined();
      expect(Schemas.TeamFinances).toBeDefined();
    });

    it('should allow direct schema usage', () => {
      const validSeason = {
        year: 2024,
        currentWeek: 1,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'pre-season',
        transferWindow: 'open',
      };

      const result = Schemas.Season.safeParse(validSeason);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      expect(isPlayer(null)).toBe(false);
      expect(isTeam(null)).toBe(false);
      expect(isGameState(null)).toBe(false);
    });

    it('should handle undefined values', () => {
      expect(isPlayer(undefined)).toBe(false);
      expect(isTeam(undefined)).toBe(false);
      expect(isGameState(undefined)).toBe(false);
    });

    it('should handle empty objects', () => {
      expect(isPlayer({})).toBe(false);
      expect(isTeam({})).toBe(false);
      expect(isGameState({})).toBe(false);
    });

    it('should handle arrays', () => {
      expect(isPlayer([])).toBe(false);
      expect(isTeam([])).toBe(false);
      expect(isGameState([])).toBe(false);
    });

    it('should handle primitives', () => {
      expect(isPlayer('string')).toBe(false);
      expect(isPlayer(123)).toBe(false);
      expect(isPlayer(true)).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should validate large GameState quickly', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());

      const gameState = {
        version: 2 as const,
        id: 'game-performance-test',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: teams[0],
        aiTeams: teams.slice(1),
        season: {
          year: 2024,
          currentWeek: 25,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress' as const,
          phase: 'competitive' as const,
          transferWindow: 'closed' as const,
        },
        fixtures: [],
        leagueTable: [],
        finances: {
          budget: 5000000,
          weeklyIncome: 100000,
          weeklyExpenses: 50000,
          totalIncome: 2500000,
          totalExpenses: 1250000,
          transactions: [],
        },
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: {
          satisfaction: 80,
          jobSecurity: 'safe' as const,
          currentObjective: null,
          objectiveHistory: [],
        },
        seasonRecords: [],
        clubRecords: {},
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      };

      const start = performance.now();
      const result = validateGameState(gameState);
      const duration = performance.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(100); // Should validate in less than 100ms
    });
  });
});
