/**
 * Player Stats Tracker Interface
 *
 * Defines the contract for player statistics tracking and archiving.
 */

import { Player, Team, PlayerStats, MatchEvent, MatchResult, SeasonTopPerformers } from '../types';

export interface IPlayerStatsTracker {
  initializePlayerStats(): PlayerStats;
  updateStatsFromMatch(
    player: Player,
    matchEvents: MatchEvent[],
    matchResult: MatchResult,
    teamName: string,
    wasHomeTeam: boolean
  ): Player;
  processTeamMatchStats(
    team: Team,
    matchResult: MatchResult,
    matchEvents: MatchEvent[],
    wasHomeTeam: boolean
  ): Team;
  archiveSeasonStats(player: Player, season: number, teamName: string): Player;
  getTopPerformers(team: Team): SeasonTopPerformers;
  resetSeasonStats(player: Player): Player;
  archiveAndResetTeamStats(team: Team, season: number): Team;
}
