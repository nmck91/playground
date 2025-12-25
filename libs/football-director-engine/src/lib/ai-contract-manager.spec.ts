/**
 * Football Director Engine - AI Contract Manager Tests
 */

import { AIContractManager } from './ai-contract-manager';
import { Team, Player, FreeAgent } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';
import { mockRandom, restoreRandom } from '../__tests__/test-utils';

describe('AIContractManager', () => {
  let manager: AIContractManager;

  beforeEach(() => {
    manager = new AIContractManager();
  });

  afterEach(() => {
    restoreRandom();
  });

  describe('processTeamContracts', () => {
    it('should renew contracts for excellent players (skill >= 14)', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            age: 26,
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15, // Expiring soon
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const renewed = result.players.find((p) => p.id === 'p1');
      expect(renewed?.contract?.weeksRemaining).toBeGreaterThan(15);
      expect(renewed?.contract?.status).toBe('active');
    });

    it('should not renew contracts for poor players (skill < 8)', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 6,
            contract: {
              weeklyWage: 2000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const player = result.players.find((p) => p.id === 'p1');
      expect(player?.contract?.weeksRemaining).toBe(15); // Not renewed
    });

    it('should renew average players with 70% probability', () => {
      mockRandom(0.5); // Below 0.7 threshold - should renew

      const team = createMockTeam({
        budget: 50000000, // Very high budget to pass affordability check
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 10,
            age: 23, // Not peak age
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 20,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const renewed = result.players.find((p) => p.id === 'p1');
      expect(renewed?.contract?.weeksRemaining).toBeGreaterThan(20);
    });

    it('should not renew average players when random fails', () => {
      mockRandom(0.8); // Above 0.7 threshold - should not renew

      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 10,
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 20,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const player = result.players.find((p) => p.id === 'p1');
      expect(player?.contract?.weeksRemaining).toBe(20); // Not renewed
    });

    it('should not renew if contract too expensive for budget', () => {
      const team = createMockTeam({
        budget: 100000, // Low budget
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 10,
            age: 25,
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 20,
              status: 'expiring',
            },
          }),
        ],
      });

      // Player demands would be ~3500/week = 182k/year
      // Budget is 100k, 5% = 5k (much less than 182k)
      const result = manager.processTeamContracts(team, 1, 5);

      const player = result.players.find((p) => p.id === 'p1');
      expect(player?.contract?.weeksRemaining).toBe(20); // Not renewed
    });

    it('should offer 10% over minimum wage', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            age: 26,
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const renewed = result.players.find((p) => p.id === 'p1');
      // For skill 15, age 26 (peak): baseWage = 15^2.2 * 100 = 46,416
      // ageMult = 1.2, minWage = 55,700
      // AI offers 10% over = 61,270
      expect(renewed?.contract?.weeklyWage).toBeGreaterThan(50000);
      expect(renewed?.contract?.weeklyWage).toBeLessThan(65000);
    });

    it('should limit contract length to max 3 years', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            age: 20, // Young player - demands would be 5 years
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const renewed = result.players.find((p) => p.id === 'p1');
      expect(renewed?.contract?.yearsRemaining).toBeLessThanOrEqual(3);
    });

    it('should only process expiring contracts (within 26 weeks)', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 2,
              expiryWeek: 1,
              yearsRemaining: 1,
              weeksRemaining: 52, // Not expiring
              status: 'active',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 1);

      const player = result.players.find((p) => p.id === 'p1');
      expect(player?.contract?.weeksRemaining).toBe(52); // Unchanged
    });

    it('should handle multiple expiring contracts', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15,
              status: 'expiring',
            },
          }),
          createMockPlayer({
            id: 'p2',
            skill: 14,
            contract: {
              weeklyWage: 4500,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 22,
              yearsRemaining: 0,
              weeksRemaining: 17,
              status: 'expiring',
            },
          }),
        ],
      });

      const result = manager.processTeamContracts(team, 1, 5);

      const p1 = result.players.find((p) => p.id === 'p1');
      const p2 = result.players.find((p) => p.id === 'p2');

      expect(p1?.contract?.weeksRemaining).toBeGreaterThan(15);
      expect(p2?.contract?.weeksRemaining).toBeGreaterThan(17);
    });

    it('should not mutate original team', () => {
      const originalTeam = createMockTeam({
        budget: 1000000,
        players: [
          createMockPlayer({
            id: 'p1',
            skill: 15,
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 15,
              status: 'expiring',
            },
          }),
        ],
      });

      const updated = manager.processTeamContracts(originalTeam, 1, 5);

      expect(originalTeam.players[0].contract?.weeksRemaining).toBe(15);
      expect(updated.players[0].contract?.weeksRemaining).toBeGreaterThan(15);
    });
  });

  describe('signFreeAgents', () => {
    it('should sign affordable free agents', () => {
      const team = createMockTeam({
        budget: 50000000, // High budget for affordability check
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({
            id: 'fa1',
            skill: 10,
            age: 25,
            wages: 0,
            contract: undefined,
          }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.team.players).toHaveLength(1);
      expect(result.signed).toHaveLength(1);
      expect(result.signed[0].id).toBe('fa1');
      expect(result.signed[0].contract).toBeDefined();
    });

    it('should not sign if squad is full (20 players)', () => {
      const team = createMockTeam({
        budget: 1000000,
        players: Array(20)
          .fill(null)
          .map((_, i) => createMockPlayer({ id: `p${i}` })),
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({
            id: 'fa1',
            skill: 10,
            wages: 0,
            contract: undefined,
          }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.team.players).toHaveLength(20);
      expect(result.signed).toHaveLength(0);
    });

    it('should not sign unaffordable free agents', () => {
      const team = createMockTeam({
        budget: 50000, // Low budget
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({
            id: 'fa1',
            skill: 18, // High skill = expensive
            age: 27,
            wages: 0,
            contract: undefined,
          }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      // Skill 18, age 27 demands ~12k/week = 624k/year
      // Budget is 50k, 3% = 1.5k (much less than 624k)
      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.team.players).toHaveLength(0);
      expect(result.signed).toHaveLength(0);
    });

    it('should sign maximum 2 free agents', () => {
      const team = createMockTeam({
        budget: 50000000, // High budget for affordability
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({ id: 'fa1', skill: 10, wages: 0, contract: undefined }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
        {
          player: createMockPlayer({ id: 'fa2', skill: 10, wages: 0, contract: undefined }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
        {
          player: createMockPlayer({ id: 'fa3', skill: 10, wages: 0, contract: undefined }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.team.players).toHaveLength(2);
      expect(result.signed).toHaveLength(2);
    });

    it('should give players 2-year contracts', () => {
      const team = createMockTeam({
        budget: 50000000, // High budget for affordability
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({
            id: 'fa1',
            skill: 10,
            age: 25,
            wages: 0,
            contract: undefined,
          }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.signed[0].contract?.yearsRemaining).toBe(2);
      expect(result.signed[0].contract?.weeksRemaining).toBe(104); // 2 years * 52
    });

    it('should offer minimum wage to free agents', () => {
      const team = createMockTeam({
        budget: 50000000, // High budget for affordability
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({
            id: 'fa1',
            skill: 10,
            age: 25,
            wages: 0,
            contract: undefined,
          }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      // Skill 10, age 25: baseWage = 10^2.2 * 100 = 15,849, minWage ~15,800
      expect(result.signed[0].contract?.weeklyWage).toBeGreaterThan(14000);
      expect(result.signed[0].contract?.weeklyWage).toBeLessThan(20000);
    });

    it('should return empty arrays if no affordable free agents', () => {
      const team = createMockTeam({
        budget: 10000, // Very low budget
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({ id: 'fa1', skill: 15, wages: 0, contract: undefined }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.team.players).toHaveLength(0);
      expect(result.signed).toHaveLength(0);
    });

    it('should not mutate original team or free agents', () => {
      const originalTeam = createMockTeam({
        budget: 50000000, // High budget for affordability
        players: [],
      });

      const originalFreeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({ id: 'fa1', skill: 10, wages: 0, contract: undefined }),
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(originalTeam, originalFreeAgents, 1, 10);

      expect(originalTeam.players).toHaveLength(0);
      expect(result.team.players).toHaveLength(1);
      expect(originalFreeAgents[0].player.contract).toBeUndefined();
    });

    it('should filter affordable agents before signing', () => {
      const team = createMockTeam({
        budget: 50000000, // High budget for affordable player
        players: [],
      });

      const freeAgents: FreeAgent[] = [
        {
          player: createMockPlayer({ id: 'fa1', skill: 19, age: 27, wages: 0, contract: undefined }), // Very expensive (peak age, very high skill)
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
        {
          player: createMockPlayer({ id: 'fa2', skill: 8, age: 25, wages: 0, contract: undefined }), // Affordable
          becameFreeWeek: 46,
          previousTeamId: 'team-old',
          previousTeamName: 'Old Team',
        },
      ];

      const result = manager.signFreeAgents(team, freeAgents, 1, 10);

      expect(result.signed).toHaveLength(1);
      expect(result.signed[0].id).toBe('fa2');
    });
  });
});
