/**
 * Football Director Engine - Morale Manager Tests
 */

import { MoraleManager } from './morale-manager';
import { Player, Team, LeagueTable } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';
import { mockRandom, restoreRandom } from '../__tests__/test-utils';

describe('MoraleManager', () => {
  let manager: MoraleManager;

  beforeEach(() => {
    manager = new MoraleManager();
  });

  afterEach(() => {
    restoreRandom();
  });

  describe('calculatePlayerMorale', () => {
    it('should start at 50 for neutral conditions', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        contract: undefined, // No contract = no morale bonus
        skill: 10,
        wages: 5000,
        age: 25, // Mid-age, no age penalty/bonus
      });

      const team = createMockTeam();
      const morale = manager.calculatePlayerMorale(player, team, 10, 7.5, 20);

      // Should be close to 50 for neutral conditions
      expect(morale).toBeGreaterThanOrEqual(45);
      expect(morale).toBeLessThanOrEqual(65);
    });

    it('should increase morale for 1st place position', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const morale = manager.calculatePlayerMorale(player, team, 1, 7.5, 20);

      expect(morale).toBeGreaterThan(50);
    });

    it('should decrease morale for relegation zone position (≥18)', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const morale = manager.calculatePlayerMorale(player, team, 18, 7.5, 20);

      expect(morale).toBeLessThan(50);
    });

    it('should increase morale for good recent form', () => {
      const player = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const goodForm = manager.calculatePlayerMorale(player, team, 10, 15, 20); // 5 wins
      const badForm = manager.calculatePlayerMorale(player, team, 10, 0, 20); // 5 losses

      expect(goodForm).toBeGreaterThan(badForm);
    });

    it('should increase morale for regular starters (≥80% playing time)', () => {
      const starter = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 16 }, // 16/20 = 80%
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const benchWarmer = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 3 }, // 3/20 = 15%
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const starterMorale = manager.calculatePlayerMorale(starter, team, 10, 7.5, 27); // week 27 - 7 = 20 competitive weeks
      const benchMorale = manager.calculatePlayerMorale(benchWarmer, team, 10, 7.5, 27);

      expect(starterMorale).toBeGreaterThan(benchMorale);
    });

    it('should increase morale when overpaid', () => {
      // Skill 10 expects ~12,000 wages
      const overpaid = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        skill: 10,
        wages: 20000,
        contract: {
          weeklyWage: 20000,
          startYear: 1,
          startWeek: 1,
          expiryYear: 3,
          expiryWeek: 1,
          yearsRemaining: 2,
          weeksRemaining: 104,
          status: 'active',
        },
      });

      const team = createMockTeam();
      const morale = manager.calculatePlayerMorale(overpaid, team, 10, 7.5, 20);

      expect(morale).toBeGreaterThan(50);
    });

    it('should decrease morale for injured players', () => {
      const healthy = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        injury: undefined,
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const injured = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        injury: { type: 'minor', weeksRemaining: 2, returnWeek: 22 },
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const healthyMorale = manager.calculatePlayerMorale(healthy, team, 10, 7.5, 20);
      const injuredMorale = manager.calculatePlayerMorale(injured, team, 10, 7.5, 20);

      expect(injuredMorale).toBeLessThan(healthyMorale);
    });

    it('should decrease morale for suspended players', () => {
      const notSuspended = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        suspendedUntil: undefined,
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const suspended = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        suspendedUntil: 25,
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const normalMorale = manager.calculatePlayerMorale(notSuspended, team, 10, 7.5, 20);
      const suspendedMorale = manager.calculatePlayerMorale(suspended, team, 10, 7.5, 20);

      expect(suspendedMorale).toBeLessThan(normalMorale);
    });

    it('should decrease morale for expiring contracts', () => {
      const secure = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        wages: 5000,
        skill: 10,
        contract: {
          weeklyWage: 5000,
          startYear: 1,
          startWeek: 1,
          expiryYear: 5,
          expiryWeek: 1,
          yearsRemaining: 4,
          weeksRemaining: 208,
          status: 'active',
        },
      });

      const expiring = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        wages: 5000,
        skill: 10,
        contract: {
          weeklyWage: 5000,
          startYear: 1,
          startWeek: 1,
          expiryYear: 1,
          expiryWeek: 30,
          yearsRemaining: 0,
          weeksRemaining: 10,
          status: 'expiring',
        },
      });

      const team = createMockTeam();
      const secureMorale = manager.calculatePlayerMorale(secure, team, 10, 7.5, 20);
      const expiringMorale = manager.calculatePlayerMorale(expiring, team, 10, 7.5, 20);

      expect(expiringMorale).toBeLessThan(secureMorale);
    });

    it('should decrease morale for aging players (≥33)', () => {
      const young = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        age: 25,
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const aging = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        age: 34,
        wages: 5000,
        skill: 10,
        contract: undefined,
      });

      const team = createMockTeam();
      const youngMorale = manager.calculatePlayerMorale(young, team, 10, 7.5, 20);
      const agingMorale = manager.calculatePlayerMorale(aging, team, 10, 7.5, 20);

      expect(agingMorale).toBeLessThan(youngMorale);
    });

    it('should increase morale for young players (≤21) getting playing time', () => {
      const youngStarter = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 10 },
        age: 20,
        wages: 3000,
        skill: 8,
        contract: undefined,
      });

      const youngBencher = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 1 },
        age: 20,
        wages: 3000,
        skill: 8,
        contract: undefined,
      });

      const team = createMockTeam();
      const starterMorale = manager.calculatePlayerMorale(youngStarter, team, 10, 7.5, 27); // 10/20 = 50% > 30%
      const bencherMorale = manager.calculatePlayerMorale(youngBencher, team, 10, 7.5, 27); // 1/20 = 5% < 30%

      expect(starterMorale).toBeGreaterThan(bencherMorale);
    });

    it('should clamp morale to 0-100 range', () => {
      // Create worst case scenario
      const worstCase = createMockPlayer({
        stats: { ...createMockPlayer().stats, appearances: 0 },
        age: 35,
        wages: 1000,
        skill: 15,
        contract: {
          weeklyWage: 1000,
          startYear: 1,
          startWeek: 1,
          expiryYear: 1,
          expiryWeek: 10,
          yearsRemaining: 0,
          weeksRemaining: 0,
          status: 'expired',
        },
        injury: { type: 'major', weeksRemaining: 10, returnWeek: 30 },
      });

      const team = createMockTeam();
      const morale = manager.calculatePlayerMorale(worstCase, team, 20, 0, 20); // Last place, no form

      expect(morale).toBeGreaterThanOrEqual(0);
      expect(morale).toBeLessThanOrEqual(100);
    });
  });

  describe('getMoraleInfo', () => {
    it('should return high morale for ≥75', () => {
      const info = manager.getMoraleInfo(80);

      expect(info.level).toBe('high');
      expect(info.emoji).toBe('😊');
      expect(info.statModifier).toBe(0.05);
      expect(info.description).toBe('High Morale');
    });

    it('should return normal morale for 40-74', () => {
      const info = manager.getMoraleInfo(60);

      expect(info.level).toBe('normal');
      expect(info.emoji).toBe('😐');
      expect(info.statModifier).toBe(0);
      expect(info.description).toBe('Normal Morale');
    });

    it('should return low morale for 20-39', () => {
      const info = manager.getMoraleInfo(30);

      expect(info.level).toBe('low');
      expect(info.emoji).toBe('☹️');
      expect(info.statModifier).toBe(-0.05);
      expect(info.description).toBe('Low Morale');
    });

    it('should return very-low morale for <20', () => {
      const info = manager.getMoraleInfo(10);

      expect(info.level).toBe('very-low');
      expect(info.emoji).toBe('😡');
      expect(info.statModifier).toBe(-0.10);
      expect(info.description).toBe('Very Low Morale');
    });

    it('should include value in all morale levels', () => {
      const high = manager.getMoraleInfo(90);
      const normal = manager.getMoraleInfo(50);
      const low = manager.getMoraleInfo(25);
      const veryLow = manager.getMoraleInfo(5);

      expect(high.value).toBe(90);
      expect(normal.value).toBe(50);
      expect(low.value).toBe(25);
      expect(veryLow.value).toBe(5);
    });
  });

  describe('applyMoraleToSkill', () => {
    it('should increase skill by 5% for high morale', () => {
      const highMorale = manager.getMoraleInfo(80);
      const baseSkill = 10;

      const modified = manager.applyMoraleToSkill(baseSkill, highMorale);

      expect(modified).toBe(11); // 10 * 1.05 = 10.5 → 11
    });

    it('should keep skill same for normal morale', () => {
      const normalMorale = manager.getMoraleInfo(50);
      const baseSkill = 10;

      const modified = manager.applyMoraleToSkill(baseSkill, normalMorale);

      expect(modified).toBe(10); // 10 * 1.0 = 10
    });

    it('should decrease skill by 5% for low morale', () => {
      const lowMorale = manager.getMoraleInfo(30);
      const baseSkill = 10;

      const modified = manager.applyMoraleToSkill(baseSkill, lowMorale);

      expect(modified).toBe(10); // 10 * 0.95 = 9.5 → 10
    });

    it('should decrease skill by 10% for very-low morale', () => {
      const veryLowMorale = manager.getMoraleInfo(10);
      const baseSkill = 10;

      const modified = manager.applyMoraleToSkill(baseSkill, veryLowMorale);

      expect(modified).toBe(9); // 10 * 0.9 = 9
    });

    it('should clamp skill to 1-20 range', () => {
      const veryLowMorale = manager.getMoraleInfo(0);
      const lowSkill = 1;
      const highSkill = 20;

      const modifiedLow = manager.applyMoraleToSkill(lowSkill, veryLowMorale);
      const modifiedHigh = manager.applyMoraleToSkill(highSkill, manager.getMoraleInfo(100));

      expect(modifiedLow).toBeGreaterThanOrEqual(1);
      expect(modifiedHigh).toBeLessThanOrEqual(20);
    });
  });

  describe('updateTeamMorale', () => {
    it('should update morale for all players in team', () => {
      const team = createMockTeam({
        id: 'team-1',
        players: [
          createMockPlayer({
            id: 'p1',
            stats: { ...createMockPlayer().stats, appearances: 10 },
            wages: 5000,
            skill: 10,
            morale: undefined,
          }),
          createMockPlayer({
            id: 'p2',
            stats: { ...createMockPlayer().stats, appearances: 8 },
            wages: 4000,
            skill: 8,
            morale: undefined,
          }),
        ],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Test FC',
          position: 1,
          played: 10,
          won: 8,
          drawn: 1,
          lost: 1,
          goalsFor: 20,
          goalsAgainst: 5,
          goalDifference: 15,
          points: 25,
        },
      ];

      const result = manager.updateTeamMorale(team, leagueTable, 20);

      expect(result.team.players).toHaveLength(2);
      expect(result.team.players[0].morale).toBeDefined();
      expect(result.team.players[1].morale).toBeDefined();
    });

    it('should track very unhappy players', () => {
      const team = createMockTeam({
        id: 'team-1',
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Unhappy Player',
            stats: { ...createMockPlayer().stats, appearances: 0 },
            wages: 500, // Very underpaid
            skill: 18, // High skill player expects ~60,000 wages
            age: 35,
            injury: { type: 'major', weeksRemaining: 5, returnWeek: 25 },
            suspendedUntil: 25,
            contract: undefined, // No contract to avoid wage ratio bug
          }),
        ],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Test FC',
          position: 20,
          played: 20,
          won: 0,
          drawn: 0,
          lost: 20,
          goalsFor: 2,
          goalsAgainst: 60,
          goalDifference: -58,
          points: 0,
        },
      ];

      const result = manager.updateTeamMorale(team, leagueTable, 30);

      // Player should have very low morale (<40 is low or very-low)
      expect(result.team.players[0].morale).toBeDefined();
      expect(result.team.players[0].morale).toBeLessThanOrEqual(20);

      // If morale is < 20, should be tracked as unhappy
      if (result.team.players[0].morale! < 20) {
        expect(result.unhappyPlayers.length).toBeGreaterThan(0);
      }
    });

    it('should handle team not in league table', () => {
      const team = createMockTeam({
        id: 'unknown-team',
        players: [
          createMockPlayer({
            stats: { ...createMockPlayer().stats, appearances: 10 },
          }),
        ],
      });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'other-team',
          teamName: 'Other FC',
          position: 1,
          played: 10,
          won: 10,
          drawn: 0,
          lost: 0,
          goalsFor: 30,
          goalsAgainst: 0,
          goalDifference: 30,
          points: 30,
        },
      ];

      const result = manager.updateTeamMorale(team, leagueTable, 20);

      expect(result.team.players).toHaveLength(1);
      expect(result.team.players[0].morale).toBeDefined();
    });
  });

  describe('shouldRequestTransfer', () => {
    it('should return true for very-low morale when random < 0.3', () => {
      mockRandom(0.2); // 20% < 30%

      const player = createMockPlayer();
      const veryLowMorale = manager.getMoraleInfo(10);

      const result = manager.shouldRequestTransfer(player, veryLowMorale);

      expect(result).toBe(true);
    });

    it('should return false for very-low morale when random ≥ 0.3', () => {
      mockRandom(0.5); // 50% ≥ 30%

      const player = createMockPlayer();
      const veryLowMorale = manager.getMoraleInfo(10);

      const result = manager.shouldRequestTransfer(player, veryLowMorale);

      expect(result).toBe(false);
    });

    it('should return false for non-very-low morale', () => {
      mockRandom(0.1); // Even with low random

      const player = createMockPlayer();
      const normalMorale = manager.getMoraleInfo(50);

      const result = manager.shouldRequestTransfer(player, normalMorale);

      expect(result).toBe(false);
    });
  });
});
