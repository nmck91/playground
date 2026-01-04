/**
 * Contract Manager Factory
 *
 * Factory functions for creating ContractManager instances.
 * Provides both production and test/mock instances.
 */

import { IContractManager } from '../interfaces/contract-manager.interface';
import { ContractManager } from '../contract-manager';
import { Player, Team, PlayerContract, ContractStatus, FreeAgent } from '../types';

/**
 * Create a production ContractManager instance
 */
export function createContractManager(): IContractManager {
  return new ContractManager();
}

/**
 * Create a mock ContractManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockContractManager(
  overrides?: Partial<IContractManager>
): IContractManager {
  const mock: IContractManager = {
    calculateContractDetails: (_contract: PlayerContract, _currentYear: number, _currentWeek: number) => ({
      yearsRemaining: 2,
      weeksRemaining: 100,
      status: 'active' as ContractStatus,
    }),
    updateTeamContracts: (team: Team, _currentYear: number, _currentWeek: number) => team,
    findExpiringContracts: (_team: Team, _weeksThreshold?: number): Player[] => [],
    findExpiredContracts: (_team: Team): Player[] => [],
    acceptContractOffer: (player: Player, _weeklyWage: number, _contractYears: number, _currentYear: number, _currentWeek: number) => player,
    calculatePlayerDemands: (_player: Player) => ({ minWage: 5000, maxYears: 3 }),
    processExpiredContracts: (team: Team, _currentWeek: number): { updatedTeam: Team; freeAgents: FreeAgent[] } => ({
      updatedTeam: team,
      freeAgents: [],
    }),
    ...overrides,
  };
  return mock;
}
