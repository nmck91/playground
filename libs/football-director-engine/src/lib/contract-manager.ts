/**
 * Football Director Engine - Contract Manager
 *
 * Manages player contracts including expiry tracking, demands calculation,
 * and contract offer processing
 */

import { Team, Player, PlayerContract, ContractStatus, FreeAgent } from './types';
import { IContractManager } from './interfaces/contract-manager.interface';

// Re-export interface for convenience
export type { IContractManager };

/**
 * Contract Manager Implementation
 */
export class ContractManager implements IContractManager {
  /**
   * Calculate contract status and remaining time
   */
  calculateContractDetails(
    contract: PlayerContract,
    currentYear: number,
    currentWeek: number
  ): { yearsRemaining: number; weeksRemaining: number; status: ContractStatus } {
    const yearDiff = contract.expiryYear - currentYear;
    const weekDiff = contract.expiryWeek - currentWeek;
    const totalWeeks = (yearDiff * 52) + weekDiff;

    let status: ContractStatus;
    if (totalWeeks <= 0) {
      status = 'expired';
    } else if (totalWeeks <= 12) {
      status = 'expiring';
    } else if (totalWeeks <= 26) {
      status = 'expiring-soon';
    } else {
      status = 'active';
    }

    return {
      yearsRemaining: Math.floor(totalWeeks / 52),
      weeksRemaining: Math.max(0, totalWeeks),
      status,
    };
  }

  /**
   * Update team's player contracts with current status
   */
  updateTeamContracts(team: Team, currentYear: number, currentWeek: number): Team {
    return {
      ...team,
      players: team.players.map(player => {
        if (!player.contract) return player;

        const details = this.calculateContractDetails(
          player.contract,
          currentYear,
          currentWeek
        );

        return {
          ...player,
          contract: {
            ...player.contract,
            ...details,
          },
        };
      }),
    };
  }

  /**
   * Find players with expiring contracts
   */
  findExpiringContracts(team: Team, weeksThreshold = 26): Player[] {
    return team.players.filter(p =>
      p.contract &&
      p.contract.weeksRemaining <= weeksThreshold &&
      p.contract.weeksRemaining > 0
    );
  }

  /**
   * Find expired contracts
   */
  findExpiredContracts(team: Team): Player[] {
    return team.players.filter(p =>
      p.contract && p.contract.status === 'expired'
    );
  }

  /**
   * Accept contract offer (create new contract)
   */
  acceptContractOffer(
    player: Player,
    weeklyWage: number,
    contractYears: number,
    currentYear: number,
    currentWeek: number
  ): Player {
    const newContract: PlayerContract = {
      weeklyWage,
      startYear: currentYear,
      startWeek: currentWeek,
      expiryYear: currentYear + contractYears,
      expiryWeek: currentWeek,
      yearsRemaining: contractYears,
      weeksRemaining: contractYears * 52,
      status: 'active',
    };

    return {
      ...player,
      wages: weeklyWage, // Update for backward compatibility
      contract: newContract,
    };
  }

  /**
   * Calculate player wage demands based on skill, age, and performance
   */
  calculatePlayerDemands(player: Player): { minWage: number; maxYears: number } {
    // Base on skill (exponential like transfer value)
    const baseWage = Math.pow(player.skill, 2.2) * 100;

    // Age multiplier
    let ageMult = 1.0;
    if (player.age < 22) {
      ageMult = 0.7; // Young players accept less
    } else if (player.age > 32) {
      ageMult = 0.8; // Veterans accept less
    } else if (player.age >= 25 && player.age <= 28) {
      ageMult = 1.2; // Peak earning years
    }

    const minWage = Math.round((baseWage * ageMult) / 100) * 100;

    // Preferred contract length
    let maxYears = 3;
    if (player.age < 23) maxYears = 5; // Young players want stability
    if (player.age > 30) maxYears = 2; // Veterans want flexibility

    return { minWage, maxYears };
  }

  /**
   * Process expired contracts → create free agents
   */
  processExpiredContracts(
    team: Team,
    currentWeek: number
  ): { updatedTeam: Team; freeAgents: FreeAgent[] } {
    const expired = this.findExpiredContracts(team);

    const freeAgents: FreeAgent[] = expired.map(player => ({
      player,
      becameFreeWeek: currentWeek,
      previousTeamId: team.id,
      previousTeamName: team.name,
    }));

    const remaining = team.players.filter(
      p => !expired.find(e => e.id === p.id)
    );

    return {
      updatedTeam: { ...team, players: remaining },
      freeAgents,
    };
  }
}
