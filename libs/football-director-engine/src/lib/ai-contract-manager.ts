/**
 * AI Contract Manager
 * Handles automated contract decisions for AI teams
 */

import { Team, Player, FreeAgent } from './types';
import { ContractManager } from './contract-manager';

export class AIContractManager {
  private contractManager = new ContractManager();

  /**
   * AI teams renew expiring contracts
   */
  processTeamContracts(
    team: Team,
    currentYear: number,
    currentWeek: number
  ): Team {
    const expiring = this.contractManager.findExpiringContracts(team, 26);

    let updated = { ...team };

    expiring.forEach((player) => {
      if (this.shouldRenew(player, team)) {
        const demands = this.contractManager.calculatePlayerDemands(player);
        const offer = Math.round(demands.minWage * 1.1); // 10% over minimum
        const years = Math.min(demands.maxYears, 3);

        const renewed = this.contractManager.acceptContractOffer(
          player,
          offer,
          years,
          currentYear,
          currentWeek
        );

        updated = {
          ...updated,
          players: updated.players.map((p) => (p.id === player.id ? renewed : p)),
        };
      }
    });

    return updated;
  }

  /**
   * Determine if AI team should renew a player's contract
   */
  private shouldRenew(player: Player, team: Team): boolean {
    // Don't renew poor players
    if (player.skill < 8) return false;

    // Always renew excellent players
    if (player.skill >= 14) return true;

    // Check if team can afford
    const demands = this.contractManager.calculatePlayerDemands(player);
    if (demands.minWage * 52 > team.budget * 0.05) return false;

    // 70% chance to renew average players
    return Math.random() < 0.7;
  }

  /**
   * Sign free agents
   */
  signFreeAgents(
    team: Team,
    freeAgents: FreeAgent[],
    currentYear: number,
    currentWeek: number
  ): { team: Team; signed: Player[] } {
    // Don't sign if squad is full
    if (team.players.length >= 20) {
      return { team, signed: [] };
    }

    // Filter affordable free agents
    const affordable = freeAgents.filter((fa) => {
      const demands = this.contractManager.calculatePlayerDemands(fa.player);
      return demands.minWage * 52 < team.budget * 0.03;
    });

    const signed: Player[] = [];
    let updated = { ...team };

    // Sign up to 2 free agents
    affordable.slice(0, 2).forEach((fa) => {
      const demands = this.contractManager.calculatePlayerDemands(fa.player);
      const newPlayer = this.contractManager.acceptContractOffer(
        fa.player,
        demands.minWage,
        2,
        currentYear,
        currentWeek
      );

      updated = {
        ...updated,
        players: [...updated.players, newPlayer],
      };
      signed.push(newPlayer);
    });

    return { team: updated, signed };
  }
}
