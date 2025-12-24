/**
 * Football Director Engine - Contract Manager Tests
 */

import { ContractManager } from './contract-manager';
import { Team, Player, PlayerContract } from './types';
import { createMockPlayer, createMockTeam } from '../__tests__';

describe('ContractManager', () => {
  let manager: ContractManager;

  beforeEach(() => {
    manager = new ContractManager();
  });

  describe('calculateContractDetails', () => {
    it('should calculate active contract correctly', () => {
      const contract: PlayerContract = {
        weeklyWage: 5000,
        startYear: 1,
        startWeek: 1,
        expiryYear: 4,
        expiryWeek: 1,
        yearsRemaining: 0,
        weeksRemaining: 0,
        status: 'active',
      };

      const result = manager.calculateContractDetails(contract, 1, 1);

      expect(result.yearsRemaining).toBe(3);
      expect(result.weeksRemaining).toBe(156); // 3 years * 52
      expect(result.status).toBe('active');
    });

    it('should mark contract as expiring-soon when ≤26 weeks', () => {
      const contract: PlayerContract = {
        weeklyWage: 5000,
        startYear: 1,
        startWeek: 1,
        expiryYear: 1,
        expiryWeek: 27,
        yearsRemaining: 0,
        weeksRemaining: 0,
        status: 'active',
      };

      const result = manager.calculateContractDetails(contract, 1, 1);

      expect(result.weeksRemaining).toBe(26);
      expect(result.status).toBe('expiring-soon');
    });

    it('should mark contract as expiring when ≤12 weeks', () => {
      const contract: PlayerContract = {
        weeklyWage: 5000,
        startYear: 1,
        startWeek: 1,
        expiryYear: 1,
        expiryWeek: 13,
        yearsRemaining: 0,
        weeksRemaining: 0,
        status: 'active',
      };

      const result = manager.calculateContractDetails(contract, 1, 1);

      expect(result.weeksRemaining).toBe(12);
      expect(result.status).toBe('expiring');
    });

    it('should mark contract as expired when time is up', () => {
      const contract: PlayerContract = {
        weeklyWage: 5000,
        startYear: 1,
        startWeek: 10,
        expiryYear: 1,
        expiryWeek: 10,
        yearsRemaining: 0,
        weeksRemaining: 0,
        status: 'active',
      };

      const result = manager.calculateContractDetails(contract, 1, 10);

      expect(result.weeksRemaining).toBe(0);
      expect(result.status).toBe('expired');
    });

    it('should handle multi-year contracts correctly', () => {
      const contract: PlayerContract = {
        weeklyWage: 5000,
        startYear: 1,
        startWeek: 10,
        expiryYear: 3,
        expiryWeek: 30,
        yearsRemaining: 0,
        weeksRemaining: 0,
        status: 'active',
      };

      const result = manager.calculateContractDetails(contract, 1, 10);

      // 2 years = 104 weeks + (30-10) = 124 weeks
      expect(result.yearsRemaining).toBe(2);
      expect(result.weeksRemaining).toBe(124);
      expect(result.status).toBe('active');
    });
  });

  describe('updateTeamContracts', () => {
    it('should update all player contracts with current status', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 4,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'active',
            },
          }),
          createMockPlayer({
            id: 'p2',
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 15,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'active',
            },
          }),
        ],
      });

      const updated = manager.updateTeamContracts(team, 1, 10);

      expect(updated.players[0].contract?.weeksRemaining).toBe(147); // 3 years - 9 weeks
      expect(updated.players[0].contract?.status).toBe('active');
      expect(updated.players[1].contract?.weeksRemaining).toBe(5);
      expect(updated.players[1].contract?.status).toBe('expiring');
    });

    it('should skip players without contracts', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({ id: 'p1', contract: undefined }),
        ],
      });

      const updated = manager.updateTeamContracts(team, 1, 10);

      expect(updated.players[0].contract).toBeUndefined();
    });
  });

  describe('findExpiringContracts', () => {
    it('should find players with contracts expiring within threshold', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Expiring Player',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 20,
              yearsRemaining: 0,
              weeksRemaining: 19,
              status: 'expiring',
            },
          }),
          createMockPlayer({
            id: 'p2',
            name: 'Safe Player',
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 3,
              expiryWeek: 1,
              yearsRemaining: 2,
              weeksRemaining: 104,
              status: 'active',
            },
          }),
        ],
      });

      const expiring = manager.findExpiringContracts(team, 26);

      expect(expiring).toHaveLength(1);
      expect(expiring[0].name).toBe('Expiring Player');
    });

    it('should not include expired contracts (weeksRemaining = 0)', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'expired',
            },
          }),
        ],
      });

      const expiring = manager.findExpiringContracts(team, 26);

      expect(expiring).toHaveLength(0);
    });

    it('should return empty array for team with no expiring contracts', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
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
          }),
        ],
      });

      const expiring = manager.findExpiringContracts(team, 26);

      expect(expiring).toHaveLength(0);
    });
  });

  describe('findExpiredContracts', () => {
    it('should find players with expired contracts', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Expired Player',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'expired',
            },
          }),
          createMockPlayer({
            id: 'p2',
            name: 'Active Player',
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 3,
              expiryWeek: 1,
              yearsRemaining: 2,
              weeksRemaining: 104,
              status: 'active',
            },
          }),
        ],
      });

      const expired = manager.findExpiredContracts(team);

      expect(expired).toHaveLength(1);
      expect(expired[0].name).toBe('Expired Player');
    });

    it('should return empty array if no contracts expired', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 3,
              expiryWeek: 1,
              yearsRemaining: 2,
              weeksRemaining: 104,
              status: 'active',
            },
          }),
        ],
      });

      const expired = manager.findExpiredContracts(team);

      expect(expired).toHaveLength(0);
    });
  });

  describe('acceptContractOffer', () => {
    it('should create new contract with correct details', () => {
      const player = createMockPlayer({ id: 'p1', name: 'New Signing' });

      const result = manager.acceptContractOffer(player, 8000, 3, 1, 10);

      expect(result.wages).toBe(8000);
      expect(result.contract).toBeDefined();
      expect(result.contract?.weeklyWage).toBe(8000);
      expect(result.contract?.startYear).toBe(1);
      expect(result.contract?.startWeek).toBe(10);
      expect(result.contract?.expiryYear).toBe(4);
      expect(result.contract?.expiryWeek).toBe(10);
      expect(result.contract?.yearsRemaining).toBe(3);
      expect(result.contract?.weeksRemaining).toBe(156);
      expect(result.contract?.status).toBe('active');
    });

    it('should handle 1-year contract correctly', () => {
      const player = createMockPlayer({ id: 'p1' });

      const result = manager.acceptContractOffer(player, 5000, 1, 2, 5);

      expect(result.contract?.yearsRemaining).toBe(1);
      expect(result.contract?.weeksRemaining).toBe(52);
      expect(result.contract?.expiryYear).toBe(3);
    });

    it('should handle 5-year contract correctly', () => {
      const player = createMockPlayer({ id: 'p1' });

      const result = manager.acceptContractOffer(player, 10000, 5, 1, 1);

      expect(result.contract?.yearsRemaining).toBe(5);
      expect(result.contract?.weeksRemaining).toBe(260);
      expect(result.contract?.expiryYear).toBe(6);
    });
  });

  describe('calculatePlayerDemands', () => {
    it('should calculate higher wages for higher skill players', () => {
      const lowSkill = createMockPlayer({ skill: 5, age: 25 });
      const highSkill = createMockPlayer({ skill: 15, age: 25 });

      const lowDemands = manager.calculatePlayerDemands(lowSkill);
      const highDemands = manager.calculatePlayerDemands(highSkill);

      expect(highDemands.minWage).toBeGreaterThan(lowDemands.minWage);
    });

    it('should apply age multiplier for peak age players (25-28)', () => {
      const peakAge = createMockPlayer({ skill: 10, age: 27 });
      const normalAge = createMockPlayer({ skill: 10, age: 23 });

      const peakDemands = manager.calculatePlayerDemands(peakAge);
      const normalDemands = manager.calculatePlayerDemands(normalAge);

      expect(peakDemands.minWage).toBeGreaterThan(normalDemands.minWage);
    });

    it('should reduce wages for young players (<22)', () => {
      const youngPlayer = createMockPlayer({ skill: 10, age: 20 });
      const normalPlayer = createMockPlayer({ skill: 10, age: 25 });

      const youngDemands = manager.calculatePlayerDemands(youngPlayer);
      const normalDemands = manager.calculatePlayerDemands(normalPlayer);

      expect(youngDemands.minWage).toBeLessThan(normalDemands.minWage);
    });

    it('should reduce wages for veteran players (>32)', () => {
      const veteranPlayer = createMockPlayer({ skill: 10, age: 34 });
      const normalPlayer = createMockPlayer({ skill: 10, age: 25 });

      const veteranDemands = manager.calculatePlayerDemands(veteranPlayer);
      const normalDemands = manager.calculatePlayerDemands(normalPlayer);

      expect(veteranDemands.minWage).toBeLessThan(normalDemands.minWage);
    });

    it('should suggest 5-year contracts for young players (<23)', () => {
      const youngPlayer = createMockPlayer({ age: 21 });

      const demands = manager.calculatePlayerDemands(youngPlayer);

      expect(demands.maxYears).toBe(5);
    });

    it('should suggest 2-year contracts for veterans (>30)', () => {
      const veteran = createMockPlayer({ age: 32 });

      const demands = manager.calculatePlayerDemands(veteran);

      expect(demands.maxYears).toBe(2);
    });

    it('should suggest 3-year contracts for mid-age players', () => {
      const midAge = createMockPlayer({ age: 26 });

      const demands = manager.calculatePlayerDemands(midAge);

      expect(demands.maxYears).toBe(3);
    });

    it('should round wages to nearest 100', () => {
      const player = createMockPlayer({ skill: 10, age: 25 });

      const demands = manager.calculatePlayerDemands(player);

      expect(demands.minWage % 100).toBe(0);
    });
  });

  describe('processExpiredContracts', () => {
    it('should remove expired players and create free agents', () => {
      const team = createMockTeam({
        id: 'team-1',
        name: 'Test FC',
        players: [
          createMockPlayer({
            id: 'p1',
            name: 'Expired Player',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'expired',
            },
          }),
          createMockPlayer({
            id: 'p2',
            name: 'Active Player',
            contract: {
              weeklyWage: 3000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 3,
              expiryWeek: 1,
              yearsRemaining: 2,
              weeksRemaining: 104,
              status: 'active',
            },
          }),
        ],
      });

      const result = manager.processExpiredContracts(team, 10);

      expect(result.updatedTeam.players).toHaveLength(1);
      expect(result.updatedTeam.players[0].name).toBe('Active Player');
      expect(result.freeAgents).toHaveLength(1);
      expect(result.freeAgents[0].player.name).toBe('Expired Player');
      expect(result.freeAgents[0].becameFreeWeek).toBe(10);
      expect(result.freeAgents[0].previousTeamId).toBe('team-1');
      expect(result.freeAgents[0].previousTeamName).toBe('Test FC');
    });

    it('should handle multiple expired contracts', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'expired',
            },
          }),
          createMockPlayer({
            id: 'p2',
            contract: {
              weeklyWage: 4000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 1,
              expiryWeek: 1,
              yearsRemaining: 0,
              weeksRemaining: 0,
              status: 'expired',
            },
          }),
        ],
      });

      const result = manager.processExpiredContracts(team, 15);

      expect(result.updatedTeam.players).toHaveLength(0);
      expect(result.freeAgents).toHaveLength(2);
    });

    it('should return empty arrays if no contracts expired', () => {
      const team = createMockTeam({
        players: [
          createMockPlayer({
            id: 'p1',
            contract: {
              weeklyWage: 5000,
              startYear: 1,
              startWeek: 1,
              expiryYear: 3,
              expiryWeek: 1,
              yearsRemaining: 2,
              weeksRemaining: 104,
              status: 'active',
            },
          }),
        ],
      });

      const result = manager.processExpiredContracts(team, 10);

      expect(result.updatedTeam.players).toHaveLength(1);
      expect(result.freeAgents).toHaveLength(0);
    });
  });
});
