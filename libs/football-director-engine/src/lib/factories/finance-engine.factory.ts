/**
 * Finance Engine Factory
 *
 * Factory functions for creating FinanceEngine instances.
 * Provides both production and test/mock instances.
 */

import { IFinanceEngine } from '../interfaces/finance-engine.interface';
import { FinanceEngine } from '../finance-engine';
import { Team, FinancialRecord } from '../types';

/**
 * Create a production FinanceEngine instance
 */
export function createFinanceEngine(): IFinanceEngine {
  return new FinanceEngine();
}

/**
 * Create a mock FinanceEngine for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockFinanceEngine(
  overrides?: Partial<IFinanceEngine>
): IFinanceEngine {
  const mock: IFinanceEngine = {
    calculateWeeklyWages: (_team: Team) => 50000,
    calculateWeeklyIncome: (_position: number, _currentWeek: number) => 100000,
    calculateMatchDayIncome: (_isHome: boolean) => 50000,
    processWeeklyFinances: (
      budget: number,
      _team: Team,
      _position: number,
      _matchDayIncome: number,
      _weekNumber: number
    ): { newBudget: number; transactions: FinancialRecord[] } => ({
      newBudget: budget,
      transactions: [],
    }),
    ...overrides,
  };
  return mock;
}
