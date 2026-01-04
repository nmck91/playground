/**
 * Youth Academy Manager Interface
 *
 * Defines the contract for youth player generation and management.
 */

import { Player, Team } from '../types';

export interface IYouthAcademyManager {
  /**
   * Generate 6 youth players as prospects (not yet added to team)
   */
  generateYouthProspects(currentYear: number, seed?: number): Player[];

  /**
   * Add selected youth players to team
   */
  addYouthPlayersToTeam(team: Team, selectedPlayers: Player[]): Team;

  /**
   * Generate 2-4 youth players for AI teams (automatic selection)
   */
  generateYouthPlayers(
    team: Team,
    currentYear: number,
    seed?: number
  ): { team: Team; newPlayers: Player[] };
}
