/**
 * Injury Manager Interface
 *
 * Defines the contract for injury and suspension management.
 */

import { Team, Player, Injury, MatchEvent } from '../types';

export interface IInjuryManager {
  generateInjury(currentWeek: number): Injury;
  processMatchInjuries(team: Team, currentWeek: number): {
    team: Team;
    injuries: Array<{ playerName: string; injury: Injury }>;
  };
  processSuspensions(
    team: Team,
    events: MatchEvent[],
    currentWeek: number,
    isHomeTeam: boolean
  ): {
    team: Team;
    suspensions: Array<{ playerName: string; weeks: number; reason: string }>;
  };
  updateWeeklyInjuries(team: Team, currentWeek: number): {
    team: Team;
    recovered: string[];
    acceleratedRecovery: string[];
  };
  getInjuredPlayers(team: Team): Player[];
  getSuspendedPlayers(team: Team, currentWeek: number): Player[];
  getAvailablePlayers(team: Team, currentWeek: number): Player[];
  isPlayerAvailable(player: Player, currentWeek: number): boolean;
}
