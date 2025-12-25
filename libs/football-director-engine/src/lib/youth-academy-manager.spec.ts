/**
 * Football Director Engine - Youth Academy Manager Tests
 */

import { YouthAcademyManager } from './youth-academy-manager';
import { Team } from './types';
import { createMockTeam, createMockPlayer } from '../__tests__';
import { mockRandom, restoreRandom, mockRandomSequence } from '../__tests__/test-utils';

describe('YouthAcademyManager', () => {
  let manager: YouthAcademyManager;

  beforeEach(() => {
    manager = new YouthAcademyManager();
  });

  afterEach(() => {
    restoreRandom();
  });

  describe('generateYouthProspects', () => {
    it('should generate exactly 6 youth prospects', () => {
      const prospects = manager.generateYouthProspects(1);

      expect(prospects).toHaveLength(6);
    });

    it('should generate prospects with correct position distribution', () => {
      const prospects = manager.generateYouthProspects(1);

      const positions = prospects.map((p) => p.position);

      // Position distribution: GK, DEF, MID, MID, FWD, FWD
      expect(positions.filter((p) => p === 'GK')).toHaveLength(1);
      expect(positions.filter((p) => p === 'DEF')).toHaveLength(1);
      expect(positions.filter((p) => p === 'MID')).toHaveLength(2);
      expect(positions.filter((p) => p === 'FWD')).toHaveLength(2);
    });

    it('should generate youth players with skill range 3-7', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.skill).toBeGreaterThanOrEqual(3);
        expect(player.skill).toBeLessThanOrEqual(7);
      });
    });

    it('should generate youth players with age range 16-18', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.age).toBeGreaterThanOrEqual(16);
        expect(player.age).toBeLessThanOrEqual(18);
      });
    });

    it('should generate youth players with wage range £500-1500/week', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.wages).toBeGreaterThanOrEqual(500);
        expect(player.wages).toBeLessThanOrEqual(1500);
      });
    });

    it('should generate deterministic prospects with seed', () => {
      const prospects1 = manager.generateYouthProspects(1, 12345);
      const prospects2 = manager.generateYouthProspects(1, 12345);

      expect(prospects1.length).toBe(prospects2.length);

      prospects1.forEach((player1, index) => {
        const player2 = prospects2[index];
        expect(player1.name).toBe(player2.name);
        expect(player1.skill).toBe(player2.skill);
        expect(player1.position).toBe(player2.position);
      });
    });

    it('should generate different prospects with different seeds', () => {
      const prospects1 = manager.generateYouthProspects(1, 12345);
      const prospects2 = manager.generateYouthProspects(1, 67890);

      const names1 = prospects1.map((p) => p.name).sort();
      const names2 = prospects2.map((p) => p.name).sort();

      expect(names1).not.toEqual(names2);
    });

    it('should generate players with no contract', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.contract).toBeUndefined();
      });
    });

    it('should generate players with initialized stats', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.stats).toBeDefined();
        expect(player.stats.appearances).toBe(0);
        expect(player.stats.goals).toBe(0);
        expect(player.stats.assists).toBe(0);
      });
    });

    it('should generate players with empty history', () => {
      const prospects = manager.generateYouthProspects(1);

      prospects.forEach((player) => {
        expect(player.history).toEqual([]);
      });
    });
  });

  describe('addYouthPlayersToTeam', () => {
    it('should add selected youth players to team', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
          createMockPlayer({ id: 'existing-2' }),
        ],
      });

      const youthPlayers = [
        createMockPlayer({ id: 'youth-1', age: 17 }),
        createMockPlayer({ id: 'youth-2', age: 16 }),
      ];

      const result = manager.addYouthPlayersToTeam(team, youthPlayers);

      expect(result.players).toHaveLength(4);
      expect(result.players.find((p) => p.id === 'youth-1')).toBeDefined();
      expect(result.players.find((p) => p.id === 'youth-2')).toBeDefined();
    });

    it('should preserve existing players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
        ],
      });

      const youthPlayers = [
        createMockPlayer({ id: 'youth-1', age: 17 }),
      ];

      const result = manager.addYouthPlayersToTeam(team, youthPlayers);

      expect(result.players.find((p) => p.id === 'existing-1')).toBeDefined();
    });

    it('should handle adding no players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
        ],
      });

      const result = manager.addYouthPlayersToTeam(team, []);

      expect(result.players).toHaveLength(1);
    });

    it('should not mutate original team', () => {
      const originalTeam = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
        ],
      });

      const youthPlayers = [
        createMockPlayer({ id: 'youth-1', age: 17 }),
      ];

      const result = manager.addYouthPlayersToTeam(originalTeam, youthPlayers);

      expect(originalTeam.players).toHaveLength(1);
      expect(result.players).toHaveLength(2);
    });
  });

  describe('generateYouthPlayers', () => {
    it('should generate 2-4 youth players for AI teams', () => {
      const team = createMockTeam({
        players: [],
      });

      const result = manager.generateYouthPlayers(team, 1);

      expect(result.newPlayers.length).toBeGreaterThanOrEqual(2);
      expect(result.newPlayers.length).toBeLessThanOrEqual(4);
    });

    it('should add generated players to team', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
        ],
      });

      const result = manager.generateYouthPlayers(team, 1);

      expect(result.team.players.length).toBe(1 + result.newPlayers.length);
    });

    it('should generate players from weighted positions (no GK in pool)', () => {
      mockRandomSequence([
        0.5, // count = 4
        0.1, // age
        0.1, // wage
        0,   // position = DEF
        0.1, // age
        0.1, // wage
        0.25, // position = MID
        0.1, // age
        0.1, // wage
        0.5,  // position = MID
        0.1, // age
        0.1, // wage
        0.75, // position = FWD
        0.1, // age
        0.1, // wage
      ]);

      const team = createMockTeam({ players: [] });
      const result = manager.generateYouthPlayers(team, 1);

      // Position pool is ['DEF', 'MID', 'MID', 'FWD']
      // So we expect DEF, MID, or FWD, but not GK
      const positions = result.newPlayers.map((p) => p.position);
      expect(positions).not.toContain('GK');
    });

    it('should generate youth players with skill range 3-7', () => {
      const team = createMockTeam({ players: [] });
      const result = manager.generateYouthPlayers(team, 1);

      result.newPlayers.forEach((player) => {
        expect(player.skill).toBeGreaterThanOrEqual(3);
        expect(player.skill).toBeLessThanOrEqual(7);
      });
    });

    it('should generate youth players with age range 16-18', () => {
      const team = createMockTeam({ players: [] });
      const result = manager.generateYouthPlayers(team, 1);

      result.newPlayers.forEach((player) => {
        expect(player.age).toBeGreaterThanOrEqual(16);
        expect(player.age).toBeLessThanOrEqual(18);
      });
    });

    it('should generate youth players with wage range £500-1500/week', () => {
      const team = createMockTeam({ players: [] });
      const result = manager.generateYouthPlayers(team, 1);

      result.newPlayers.forEach((player) => {
        expect(player.wages).toBeGreaterThanOrEqual(500);
        expect(player.wages).toBeLessThanOrEqual(1500);
      });
    });

    it('should not mutate original team', () => {
      const originalTeam = createMockTeam({
        players: [
          createMockPlayer({ id: 'existing-1' }),
        ],
      });

      const result = manager.generateYouthPlayers(originalTeam, 1);

      expect(originalTeam.players).toHaveLength(1);
      expect(result.team.players.length).toBeGreaterThan(1);
    });

    it('should generate deterministic players with seed (player attributes)', () => {
      // Note: The COUNT is random (Math.random), but player attributes are seeded
      // So we can only compare the players that were generated, not the count
      mockRandom(0.5); // Make count deterministic for this test (count = 4)

      const team1 = createMockTeam({ players: [] });
      const result1 = manager.generateYouthPlayers(team1, 1, 12345);

      restoreRandom();
      mockRandom(0.5); // Same random for count

      const team2 = createMockTeam({ players: [] });
      const result2 = manager.generateYouthPlayers(team2, 1, 12345);

      expect(result1.newPlayers.length).toBe(result2.newPlayers.length);

      result1.newPlayers.forEach((player1, index) => {
        const player2 = result2.newPlayers[index];
        expect(player1.name).toBe(player2.name);
        expect(player1.skill).toBe(player2.skill);
        expect(player1.position).toBe(player2.position);
      });
    });
  });
});
