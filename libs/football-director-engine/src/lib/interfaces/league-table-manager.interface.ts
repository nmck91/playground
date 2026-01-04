/**
 * League Table Manager Interface
 *
 * Defines the contract for league table operations.
 */

import { Team, LeagueTable, MatchResult } from '../types';

export interface ILeagueTableManager {
  /**
   * Initialize a league table for all teams with zero stats
   */
  initializeTable(teams: Team[]): LeagueTable[];

  /**
   * Update league table based on match result
   */
  updateTable(table: LeagueTable[], result: MatchResult): LeagueTable[];

  /**
   * Sort table by points, then goal difference, then goals scored
   */
  sortTable(table: LeagueTable[]): LeagueTable[];

  /**
   * Get team's current position in the table
   */
  getTeamPosition(table: LeagueTable[], teamId: string): number;
}
