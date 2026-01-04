/**
 * AI Contract Manager Factory
 *
 * Factory functions for creating AIContractManager instances.
 * Provides both production and test/mock instances.
 */

import { IAIContractManager } from '../interfaces/ai-contract-manager.interface';
import { AIContractManager } from '../ai-contract-manager';
import { Team, FreeAgent, Player } from '../types';

/**
 * Create a production AIContractManager instance
 */
export function createAIContractManager(): IAIContractManager {
  return new AIContractManager();
}

/**
 * Create a mock AIContractManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockAIContractManager(
  overrides?: Partial<IAIContractManager>
): IAIContractManager {
  const mock: IAIContractManager = {
    processTeamContracts: (team: Team, _currentYear: number, _currentWeek: number) => team,
    signFreeAgents: (team: Team, _freeAgents: FreeAgent[], _currentYear: number, _currentWeek: number): { team: Team; signed: Player[] } => ({ team, signed: [] }),
    ...overrides,
  };
  return mock;
}
