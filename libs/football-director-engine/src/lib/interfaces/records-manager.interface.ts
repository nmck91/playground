/**
 * Records Manager Interface
 *
 * Defines the contract for season and club records management.
 */

import { Team, LeagueTable, MatchResult, Fixture, SeasonRecords, ClubRecords } from '../types';

export interface IRecordsManager {
  calculateSeasonRecords(
    season: number,
    finalTable: LeagueTable,
    matchHistory: MatchResult[],
    fixtures: Fixture[],
    playerTeam: Team,
    teamId: string
  ): SeasonRecords;

  findBiggestResults(
    matches: MatchResult[],
    teamName: string
  ): {
    biggestWin?: SeasonRecords['biggestWin'];
    biggestLoss?: SeasonRecords['biggestLoss'];
  };

  calculateStreaks(fixtures: Fixture[], teamId: string): {
    longestWinStreak: number;
    longestUnbeatenStreak: number;
  };

  initializeClubRecords(season: number): ClubRecords;

  updateClubRecords(
    currentRecords: ClubRecords,
    seasonRecords: SeasonRecords
  ): { records: ClubRecords; brokenRecords: string[] };
}
