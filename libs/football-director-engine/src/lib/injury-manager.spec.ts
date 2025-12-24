/**
 * Football Director Engine - Injury Manager Tests
 */

import { InjuryManager } from './injury-manager';
import { Team, Player, MatchEvent } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';
import { mockRandom, restoreRandom } from '../__tests__/test-utils';

describe('InjuryManager', () => {
  let manager: InjuryManager;

  beforeEach(() => {
    manager = new InjuryManager();
  });

  afterEach(() => {
    restoreRandom();
  });

  describe('generateInjury', () => {
    it('should generate injury with valid type and duration', () => {
      const injury = manager.generateInjury(10);

      expect(injury).toBeDefined();
      expect(['minor', 'moderate', 'serious']).toContain(injury.type);
      expect(injury.weeksRemaining).toBeGreaterThan(0);
      expect(injury.sustainedInWeek).toBe(10);
      expect(injury.description).toBeDefined();
    });
  });

  describe('processMatchInjuries', () => {
    it('should not injure already injured players', () => {
      mockRandom(0.01); // Force injury roll to succeed

      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            injury: { type: 'minor', description: 'Existing', weeksRemaining: 2, sustainedInWeek: 8 },
          }),
        ],
      });

      const result = manager.processMatchInjuries(team, 10);

      expect(result.injuries).toHaveLength(0);
      expect(result.team.players[0].injury?.description).toBe('Existing');
    });

    it('should create injuries when roll succeeds', () => {
      mockRandom(0.01); // Force injury (< 0.05)

      const team = createMockTeam({
        players: [createMockPlayer({ id: 'p1', injury: undefined })],
      });

      const result = manager.processMatchInjuries(team, 10);

      expect(result.injuries.length).toBeGreaterThan(0);
      expect(result.team.players[0].injury).toBeDefined();
    });

    it('should not create injuries when roll fails', () => {
      mockRandom(0.9); // Prevent injury (≥ 0.05)

      const team = createMockTeam({
        players: [createMockPlayer({ id: 'p1', injury: undefined })],
      });

      const result = manager.processMatchInjuries(team, 10);

      expect(result.injuries).toHaveLength(0);
      expect(result.team.players[0].injury).toBeUndefined();
    });
  });

  describe('processSuspensions', () => {
    it('should suspend player for red card (3 weeks)', () => {
      const team = createMockTeam({
        players: [createMockPlayer({ id: 'p1', name: 'Red Card Player' })],
      });

      const events: MatchEvent[] = [
        {
          type: 'red-card',
          team: 'home',
          playerId: 'p1',
          playerName: 'Red Card Player',
          minute: 45,
          description: 'Sent off!',
        },
      ];

      const result = manager.processSuspensions(team, events, 10, true);

      expect(result.suspensions).toHaveLength(1);
      expect(result.suspensions[0].weeks).toBe(3);
      expect(result.suspensions[0].reason).toBe('Red Card');
      expect(result.team.players[0].suspendedUntil).toBe(13); // week 10 + 3
    });

    it('should suspend player on 5th yellow card', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Yellow Collector',
            stats: { ...createMockPlayer().stats, yellowCards: 4 }, // 4th yellow already
          }),
        ],
      });

      const events: MatchEvent[] = [
        {
          type: 'yellow-card',
          team: 'home',
          playerId: 'p1',
          playerName: 'Yellow Collector',
          minute: 60,
          description: 'Booked',
        },
      ];

      const result = manager.processSuspensions(team, events, 10, true);

      expect(result.suspensions).toHaveLength(1);
      expect(result.suspensions[0].reason).toBe('5 Yellow Cards');
      expect(result.team.players[0].suspendedUntil).toBe(11); // week 10 + 1
    });

    it('should not suspend away team for home team events', () => {
      const team = createMockTeam({
        players: [createMockPlayer({ id: 'p1' })],
      });

      const events: MatchEvent[] = [
        {
          type: 'red-card',
          team: 'home',
          playerId: 'p1',
          playerName: 'Player',
          minute: 45,
          description: 'Off!',
        },
      ];

      const result = manager.processSuspensions(team, events, 10, false); // isHomeTeam = false

      expect(result.suspensions).toHaveLength(0);
    });
  });

  describe('updateWeeklyInjuries', () => {
    it('should reduce injury time by 1 week', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            injury: { type: 'minor', description: 'Knock', weeksRemaining: 3, sustainedInWeek: 8 },
          }),
        ],
      });

      const result = manager.updateWeeklyInjuries(team, 11);

      expect(result.team.players[0].injury?.weeksRemaining).toBe(2);
      expect(result.recovered).toHaveLength(0);
    });

    it('should clear injury when time reaches 0', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Recovering',
            injury: { type: 'minor', description: 'Knock', weeksRemaining: 1, sustainedInWeek: 8 },
          }),
        ],
      });

      const result = manager.updateWeeklyInjuries(team, 11);

      expect(result.team.players[0].injury).toBeUndefined();
      expect(result.recovered).toContain('Recovering');
    });

    it('should clear expired suspensions', () => {
      const team = createMockTeam({
        players: [createMockPlayer({ id: 'p1', suspendedUntil: 10 })],
      });

      const result = manager.updateWeeklyInjuries(team, 10);

      expect(result.team.players[0].suspendedUntil).toBeUndefined();
    });
  });

  describe('getInjuredPlayers', () => {
    it('should return only injured players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'p1', injury: { type: 'minor', description: 'Knock', weeksRemaining: 2, sustainedInWeek: 8 } }),
          createMockPlayer({ id: 'p2', injury: undefined }),
        ],
      });

      const injured = manager.getInjuredPlayers(team);

      expect(injured).toHaveLength(1);
      expect(injured[0].id).toBe('p1');
    });
  });

  describe('getSuspendedPlayers', () => {
    it('should return only suspended players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'p1', suspendedUntil: 15 }),
          createMockPlayer({ id: 'p2', suspendedUntil: undefined }),
          createMockPlayer({ id: 'p3', suspendedUntil: 10 }), // Expired
        ],
      });

      const suspended = manager.getSuspendedPlayers(team, 12);

      expect(suspended).toHaveLength(1);
      expect(suspended[0].id).toBe('p1');
    });
  });

  describe('getAvailablePlayers', () => {
    it('should return only available players', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'p1', injury: undefined, suspendedUntil: undefined }),
          createMockPlayer({ id: 'p2', injury: { type: 'minor', description: 'Knock', weeksRemaining: 2, sustainedInWeek: 8 } }),
          createMockPlayer({ id: 'p3', suspendedUntil: 15 }),
        ],
      });

      const available = manager.getAvailablePlayers(team, 12);

      expect(available).toHaveLength(1);
      expect(available[0].id).toBe('p1');
    });
  });

  describe('isPlayerAvailable', () => {
    it('should return true for healthy player', () => {
      const player = createMockPlayer({ injury: undefined, suspendedUntil: undefined });

      expect(manager.isPlayerAvailable(player, 10)).toBe(true);
    });

    it('should return false for injured player', () => {
      const player = createMockPlayer({ injury: { type: 'minor', description: 'Knock', weeksRemaining: 2, sustainedInWeek: 8 } });

      expect(manager.isPlayerAvailable(player, 10)).toBe(false);
    });

    it('should return false for suspended player', () => {
      const player = createMockPlayer({ suspendedUntil: 15 });

      expect(manager.isPlayerAvailable(player, 10)).toBe(false);
    });
  });
});
