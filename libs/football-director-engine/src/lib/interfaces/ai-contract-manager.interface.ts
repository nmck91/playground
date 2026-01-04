/**
 * AI Contract Manager Interface
 *
 * Defines the contract for AI team contract management.
 */

import { Team, Player, FreeAgent } from '../types';

export interface IAIContractManager {
  /**
   * Process contract renewals for AI teams
   */
  processTeamContracts(team: Team, currentYear: number, currentWeek: number): Team;

  /**
   * Sign free agents for AI teams
   */
  signFreeAgents(
    team: Team,
    freeAgents: FreeAgent[],
    currentYear: number,
    currentWeek: number
  ): { team: Team; signed: Player[] };
}
