/**
 * League Table Manager Factory
 *
 * Factory functions for creating LeagueTableManager instances.
 * Provides both production and test/mock instances.
 */

import { ILeagueTableManager } from '../interfaces/league-table-manager.interface';
import { LeagueTableManager } from '../league-table-manager';
import { LeagueTable, Team, MatchResult } from '../types';

/**
 * Create a production LeagueTableManager instance
 */
export function createLeagueTableManager(): ILeagueTableManager {
  return new LeagueTableManager();
}

/**
 * Create a mock LeagueTableManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockLeagueTableManager(
  overrides?: Partial<ILeagueTableManager>
): ILeagueTableManager {
  const mockTableEntry: LeagueTable = {
    teamId: 'team-1',
    teamName: 'Test FC',
    played: 10,
    won: 5,
    drawn: 3,
    lost: 2,
    goalsFor: 15,
    goalsAgainst: 10,
    goalDifference: 5,
    points: 18,
  };

  const mock: ILeagueTableManager = {
    initializeTable: (_teams: Team[]) => [mockTableEntry],
    updateTable: (_table: LeagueTable[], _result: MatchResult) => [mockTableEntry],
    sortTable: (_table: LeagueTable[]) => [mockTableEntry],
    getTeamPosition: (_table: LeagueTable[], _teamId: string) => 1,
    ...overrides,
  };
  return mock;
}
