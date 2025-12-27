/**
 * Football Director Engine - League Table Manager
 * Manages league standings, updates, and sorting
 */

import { Team, LeagueTable, MatchResult } from './types';

/**
 * League Table Manager Interface
 *
 * Defines the contract for league table management.
 */
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

/**
 * League Table Manager Implementation
 */
export class LeagueTableManager implements ILeagueTableManager {
  /**
   * Initialize a league table for all teams with zero stats
   */
  initializeTable(teams: Team[]): LeagueTable[] {
    return teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));
  }

  /**
   * Update league table based on a match result
   */
  updateTable(table: LeagueTable[], result: MatchResult): LeagueTable[] {
    const updatedTable = [...table];

    // Find teams by name
    const homeEntry = updatedTable.find((entry) => entry.teamName === result.homeTeam);
    const awayEntry = updatedTable.find((entry) => entry.teamName === result.awayTeam);

    if (!homeEntry || !awayEntry) {
      throw new Error(`Team not found in table: ${result.homeTeam} or ${result.awayTeam}`);
    }

    // Update home team stats
    homeEntry.played += 1;
    homeEntry.goalsFor += result.homeScore;
    homeEntry.goalsAgainst += result.awayScore;
    homeEntry.goalDifference = homeEntry.goalsFor - homeEntry.goalsAgainst;

    if (result.result === 'home') {
      homeEntry.won += 1;
      homeEntry.points += 3;
    } else if (result.result === 'draw') {
      homeEntry.drawn += 1;
      homeEntry.points += 1;
    } else {
      homeEntry.lost += 1;
    }

    // Update away team stats
    awayEntry.played += 1;
    awayEntry.goalsFor += result.awayScore;
    awayEntry.goalsAgainst += result.homeScore;
    awayEntry.goalDifference = awayEntry.goalsFor - awayEntry.goalsAgainst;

    if (result.result === 'away') {
      awayEntry.won += 1;
      awayEntry.points += 3;
    } else if (result.result === 'draw') {
      awayEntry.drawn += 1;
      awayEntry.points += 1;
    } else {
      awayEntry.lost += 1;
    }

    return updatedTable;
  }

  /**
   * Sort league table by points, goal difference, goals for
   */
  sortTable(table: LeagueTable[]): LeagueTable[] {
    return [...table].sort((a, b) => {
      // Sort by points (descending)
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      // If points equal, sort by goal difference (descending)
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      // If goal difference equal, sort by goals for (descending)
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      // If all equal, sort alphabetically by name
      return a.teamName.localeCompare(b.teamName);
    });
  }

  /**
   * Get the current position of a team in the table (1-indexed)
   */
  getTeamPosition(table: LeagueTable[], teamId: string): number {
    const sortedTable = this.sortTable(table);
    const position = sortedTable.findIndex((entry) => entry.teamId === teamId);

    if (position === -1) {
      throw new Error(`Team not found in table: ${teamId}`);
    }

    return position + 1; // 1-indexed position
  }
}
