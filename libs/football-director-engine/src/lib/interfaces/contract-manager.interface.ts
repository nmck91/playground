/**
 * Contract Manager Interface
 *
 * Defines the contract for player contract management.
 */

import { Player, Team, PlayerContract, ContractStatus, FreeAgent } from '../types';

export interface IContractManager {
  calculateContractDetails(
    contract: PlayerContract,
    currentYear: number,
    currentWeek: number
  ): { yearsRemaining: number; weeksRemaining: number; status: ContractStatus };

  updateTeamContracts(team: Team, currentYear: number, currentWeek: number): Team;
  findExpiringContracts(team: Team, weeksThreshold?: number): Player[];
  findExpiredContracts(team: Team): Player[];

  acceptContractOffer(
    player: Player,
    weeklyWage: number,
    contractYears: number,
    currentYear: number,
    currentWeek: number
  ): Player;

  calculatePlayerDemands(player: Player): { minWage: number; maxYears: number };

  processExpiredContracts(
    team: Team,
    currentWeek: number
  ): { updatedTeam: Team; freeAgents: FreeAgent[] };
}
