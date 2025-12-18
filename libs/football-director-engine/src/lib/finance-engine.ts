/**
 * Football Director Engine - Finance Engine
 * Manages financial calculations and transactions
 */

import { Team, FinancialRecord } from './types';
import { StaffManager } from './staff-manager';

export class FinanceEngine {
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
   * Calculate weekly income based on league position
   * Higher positions earn more from TV money and sponsorships
   */
  calculateWeeklyIncome(position: number): number {
    // Base income for all clubs (increased to support larger squads)
    const baseIncome = 75000;

    // Position-based bonus (top teams get more)
    // 1st place: +75k, 20th place: +7.5k
    const positionBonus = Math.max(0, (21 - position) * 3750);

    return baseIncome + positionBonus;
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
    const weeklyIncome = this.calculateWeeklyIncome(position);
    transactions.push({
      id: `txn-${Date.now()}-income`,
      date: new Date(),
      type: 'income',
      category: 'prize-money',
      amount: weeklyIncome,
      description: `Weekly income (position: ${position})`,
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
