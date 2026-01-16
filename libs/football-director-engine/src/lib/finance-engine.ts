/**
 * Football Director Engine - Finance Engine
 * Manages financial calculations and transactions
 */

import { Team, FinancialRecord } from './types';
import { StaffManager } from './staff-manager';
import { IFinanceEngine } from './interfaces/finance-engine.interface';

// Re-export interface for convenience
export type { IFinanceEngine };

const PRE_SEASON_WEEKS = 7;
const COMPETITIVE_START = 8;
const COMPETITIVE_WEEKS = 38;
const COMPETITIVE_END = COMPETITIVE_START + COMPETITIVE_WEEKS - 1; // Week 45

/**
 * Finance Engine Implementation
 */
export class FinanceEngine implements IFinanceEngine {
  /**
   * Calculate total weekly wages for a team (players + staff)
   */
  calculateWeeklyWages(team: Team): number {
    // Player wages
    const playerWages = team.players?.reduce((total, player) => total + player.wages, 0) || 0;

    // Staff wages
    const staffManager = new StaffManager();
    const staffWages = staffManager.getTotalStaffWages(team);

    return playerWages + staffWages;
  }

  /**
   * Calculate weekly income based on league position and season phase
   * Higher positions earn more from TV money and sponsorships
   * Pre-season and off-season income is reduced (40% of competitive season)
   */
  calculateWeeklyIncome(position: number, currentWeek: number): number {
    // Base income for all clubs (increased to support larger squads)
    const baseIncome = 75000;

    // Position-based bonus (top teams get more)
    // 1st place: +75k, 20th place: +7.5k
    const positionBonus = Math.max(0, (21 - position) * 3750);

    const fullIncome = baseIncome + positionBonus;

    // During pre-season or off-season, income is reduced (no competitive matches, reduced commercial activity)
    if (currentWeek <= PRE_SEASON_WEEKS || currentWeek > COMPETITIVE_END) {
      return Math.round(fullIncome * 0.4);
    }

    return fullIncome;
  }

  /**
   * Calculate match day income
   * Home matches generate ticket sales revenue
   */
  calculateMatchDayIncome(isHome: boolean): number {
    if (!isHome) {
      return 0;
    }

    // Average ticket sales for home match
    return 30000;
  }

  /**
   * Process weekly finances for a team
   * Returns updated budget and transaction records
   */
  processWeeklyFinances(
    budget: number,
    team: Team,
    position: number,
    matchDayIncome: number,
    weekNumber: number
  ): { newBudget: number; transactions: FinancialRecord[] } {
    const transactions: FinancialRecord[] = [];
    let currentBudget = budget;

    // Weekly wages (expense) - players + staff
    const wages = this.calculateWeeklyWages(team);
    if (wages > 0) {
      const staffCount = team.staff?.length || 0;
      transactions.push({
        id: `txn-${Date.now()}-wages`,
        date: new Date(),
        type: 'expense',
        category: 'wages',
        amount: wages,
        description: `Weekly wages for ${team.players.length} players and ${staffCount} staff`,
        weekNumber,
      });
      currentBudget -= wages;
    }

    // Weekly income (TV money, sponsorships)
    const weeklyIncome = this.calculateWeeklyIncome(position, weekNumber);
    let phaseDescription = '';
    if (weekNumber <= PRE_SEASON_WEEKS) {
      phaseDescription = ' (pre-season)';
    } else if (weekNumber > COMPETITIVE_END) {
      phaseDescription = ' (off-season)';
    }
    transactions.push({
      id: `txn-${Date.now()}-income`,
      date: new Date(),
      type: 'income',
      category: 'prize-money',
      amount: weeklyIncome,
      description: `Weekly income (position: ${position})${phaseDescription}`,
      weekNumber,
    });
    currentBudget += weeklyIncome;

    // Match day income (if home match)
    if (matchDayIncome > 0) {
      transactions.push({
        id: `txn-${Date.now()}-tickets`,
        date: new Date(),
        type: 'income',
        category: 'ticket-sales',
        amount: matchDayIncome,
        description: 'Home match ticket sales',
        weekNumber,
      });
      currentBudget += matchDayIncome;
    }

    return {
      newBudget: currentBudget,
      transactions,
    };
  }
}
