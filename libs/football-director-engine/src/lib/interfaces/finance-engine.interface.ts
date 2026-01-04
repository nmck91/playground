/**
 * Finance Engine Interface
 *
 * Defines the contract for financial operations.
 */

import { Team, FinancialRecord } from '../types';

export interface IFinanceEngine {
  calculateWeeklyWages(team: Team): number;
  calculateWeeklyIncome(position: number, currentWeek: number): number;
  calculateMatchDayIncome(isHome: boolean): number;
  processWeeklyFinances(
    budget: number,
    team: Team,
    position: number,
    matchDayIncome: number,
    weekNumber: number
  ): { newBudget: number; transactions: FinancialRecord[] };
}
