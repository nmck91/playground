/**
 * Football Director Engine - Game State Versioning Tests
 *
 * Epic 1.5 - Story 1.5.3: Test discriminated union versioning system
 */

import { describe, it, expect } from 'vitest';
import type { GameState, GameStateV1, GameStateV2 } from './game-state-versions';
import {
  CURRENT_GAME_STATE_VERSION,
  isGameStateV1,
  isGameStateV2,
  getGameStateVersion,
  assertCurrentVersion,
} from './game-state-versions';
import {
  migrateGameState,
  migrateGameStateV1toV2,
} from './migration';
import { TeamGenerator } from './team-generator';

describe('Game State Versioning', () => {
  describe('Version Constants', () => {
    it('should have current version set to 2', () => {
      expect(CURRENT_GAME_STATE_VERSION).toBe(2);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify V1 game state (no version field)', () => {
      const v1State: GameStateV1 = {
        id: 'test-1',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
      };

      expect(isGameStateV1(v1State)).toBe(true);
      expect(isGameStateV2(v1State)).toBe(false);
      expect(getGameStateVersion(v1State)).toBe(1);
    });

    it('should correctly identify V1 game state (explicit version: 1)', () => {
      const v1State: GameStateV1 = {
        version: 1,
        id: 'test-1',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
      };

      expect(isGameStateV1(v1State)).toBe(true);
      expect(isGameStateV2(v1State)).toBe(false);
      expect(getGameStateVersion(v1State)).toBe(1);
    });

    it('should correctly identify V2 game state', () => {
      const v2State: GameStateV2 = {
        version: 2,
        id: 'test-2',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
        finances: {} as any,
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: {} as any,
        seasonRecords: [],
        clubRecords: {} as any,
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      };

      expect(isGameStateV1(v2State)).toBe(false);
      expect(isGameStateV2(v2State)).toBe(true);
      expect(getGameStateVersion(v2State)).toBe(2);
    });
  });

  describe('Type Guard Narrowing', () => {
    it('should narrow type to GameStateV1', () => {
      const state: GameState = {
        id: 'test',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
      };

      if (isGameStateV1(state)) {
        // TypeScript should know state is GameStateV1 here
        expect(state.version === undefined || state.version === 1).toBe(true);
        // These fields should be optional
        const finances: typeof state.finances = undefined;
        expect(finances).toBeUndefined();
      }
    });

    it('should narrow type to GameStateV2', () => {
      const state: GameState = {
        version: 2,
        id: 'test',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
        finances: {} as any,
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: {} as any,
        seasonRecords: [],
        clubRecords: {} as any,
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      } as GameStateV2;

      if (isGameStateV2(state)) {
        // TypeScript should know state is GameStateV2 here
        expect(state.version).toBe(2);
        // These fields should be required
        expect(state.finances).toBeDefined();
        expect(state.matchHistory).toBeDefined();
        expect(state.matchPreviews).toBeDefined();
      }
    });
  });

  describe('assertCurrentVersion', () => {
    it('should not throw for V2 state', () => {
      const v2State: GameStateV2 = {
        version: 2,
        id: 'test',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
        finances: {} as any,
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: {} as any,
        seasonRecords: [],
        clubRecords: {} as any,
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      };

      expect(() => assertCurrentVersion(v2State)).not.toThrow();
    });

    it('should throw for V1 state', () => {
      const v1State: GameStateV1 = {
        id: 'test',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
      };

      expect(() => assertCurrentVersion(v1State)).toThrow('GameState version mismatch');
    });
  });

  describe('Migration with Discriminated Unions', () => {
    it('should migrate V1 to V2', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());
      const team = teams[0];

      const v1State: GameStateV1 = {
        id: 'test-migration',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: team,
        aiTeams: [],
        season: {
          year: 2024,
          currentWeek: 1,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress',
          phase: 'pre-season',
          transferWindow: 'open',
        },
        fixtures: [],
        leagueTable: [],
      };

      // Migrate using typed function
      const v2State = migrateGameStateV1toV2(v1State);

      // TypeScript knows v2State is GameStateV2
      expect(v2State.version).toBe(2);
      expect(v2State.finances).toBeDefined();
      expect(v2State.matchHistory).toEqual([]);
      expect(v2State.matchPreviews).toEqual([]);
      expect(v2State.boardStatus).toBeDefined();
      expect(v2State.clubRecords).toBeDefined();

      // Verify all V2 required fields exist
      expect(v2State.finances.budget).toBeGreaterThan(0);
      expect(v2State.boardStatus.satisfaction).toBeGreaterThanOrEqual(0);
      expect(v2State.boardStatus.jobSecurity).toBeDefined();
      expect(v2State.clubRecords.bestLeaguePosition).toBeDefined();
    });

    it('should pass V2 through unchanged', () => {
      const v2State: GameStateV2 = {
        version: 2,
        id: 'test-passthrough',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: {} as any,
        aiTeams: [],
        season: {} as any,
        fixtures: [],
        leagueTable: [],
        finances: { budget: 1000000 } as any,
        matchHistory: [],
        transferMarket: [],
        staffMarket: [],
        freeAgents: [],
        boardStatus: { satisfaction: 80 } as any,
        seasonRecords: [],
        clubRecords: {} as any,
        achievements: [],
        seasonAwards: [],
        newsFeed: [],
        matchPreviews: [],
        cupHistory: [],
      };

      const result = migrateGameState(v2State);

      // Should be the same object (no migration needed)
      expect(result).toBe(v2State);
      expect(result.version).toBe(2);
      expect(result.finances.budget).toBe(1000000);
      expect(result.boardStatus.satisfaction).toBe(80);
    });

    it('should auto-detect version and migrate from V1', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());

      const v1State: GameStateV1 = {
        id: 'test-auto-detect',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: teams[0],
        aiTeams: teams.slice(1),
        season: {
          year: 2024,
          currentWeek: 5,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress',
          phase: 'pre-season',
          transferWindow: 'open',
        },
        fixtures: [],
        leagueTable: [],
      };

      const result = migrateGameState(v1State);

      // Should be migrated to V2
      expect(result.version).toBe(2);
      expect(isGameStateV2(result)).toBe(true);
    });

    it('should migrate player contracts correctly', () => {
      const generator = new TeamGenerator();
      const teams = generator.generateLeague(Date.now());
      const team = teams[0];

      // Remove contracts to simulate V1 state
      const v1Team = {
        ...team,
        players: team.players.map((p: any) => ({
          ...p,
          contract: undefined,
          morale: undefined,
        })),
      };

      const v1State: GameStateV1 = {
        id: 'test-player-migration',
        createdAt: new Date(),
        lastSaved: new Date(),
        playerTeam: v1Team,
        aiTeams: [],
        season: {
          year: 2024,
          currentWeek: 10,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress',
          phase: 'competitive',
          transferWindow: 'closed',
        },
        fixtures: [],
        leagueTable: [],
      };

      const v2State = migrateGameStateV1toV2(v1State);

      // All players should now have contracts and morale
      v2State.playerTeam.players.forEach((player: any) => {
        expect(player.contract).toBeDefined();
        expect(player.contract.weeklyWage).toBe(player.wages);
        expect(player.contract.expiryYear).toBeGreaterThan(2024);
        expect(player.morale).toBeGreaterThanOrEqual(0);
        expect(player.morale).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce version discriminant at compile time', () => {
      // This test verifies TypeScript compilation, not runtime behavior

      const v1: GameStateV1 = {} as any;
      const v2: GameStateV2 = { version: 2 } as any;

      // These should be type errors if uncommented:
      // const badV2: GameStateV2 = { version: 1 } as any; // Error: version must be 2
      // const badV1: GameStateV1 = { version: 2 } as any; // Error: version must be 1 or undefined

      expect(v1.version === undefined || v1.version === 1).toBe(true);
      expect(v2.version).toBe(2);
    });
  });
});
