/**
 * Player Stats Tracker Interface
 *
 * Defines the contract for player statistics tracking and archiving.
 */

import { Player, Team, PlayerStats, MatchEvent, MatchResult, SeasonTopPerformers } from '../types';

export interface IPlayerStatsTracker {
  initializePlayerStats(): PlayerStats;
  updateStatsFromMatch(player: Player, events: MatchEvent[], team: 'home' | 'away'): Player;
  processTeamMatchStats(team: Team, result: MatchResult, teamSide: 'home' | 'away'): Team;
  archiveSeasonStats(player: Player, season: number, teamName: string): Player;
  getTopPerformers(team: Team): SeasonTopPerformers;
  resetSeasonStats(player: Player): Player;
  archiveAndResetTeamStats(team: Team, season: number): Team;
}
