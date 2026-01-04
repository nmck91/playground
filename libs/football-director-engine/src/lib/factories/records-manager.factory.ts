/**
 * Records Manager Factory
 *
 * Factory functions for creating RecordsManager instances.
 * Provides both production and test/mock instances.
 */

import { IRecordsManager } from '../interfaces/records-manager.interface';
import { RecordsManager } from '../records-manager';
import { SeasonRecords, ClubRecords } from '../types';

/**
 * Create a production RecordsManager instance
 */
export function createRecordsManager(): IRecordsManager {
  return new RecordsManager();
}

/**
 * Create a mock RecordsManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockRecordsManager(
  overrides?: Partial<IRecordsManager>
): IRecordsManager {
  const mockSeasonRecords: SeasonRecords = {
    season: 2024,
    finalPosition: 10,
    points: 50,
    won: 15,
    drawn: 5,
    lost: 18,
    goalsFor: 45,
    goalsAgainst: 50,
    goalDifference: -5,
    longestWinStreak: 3,
    longestUnbeatenStreak: 5,
    cleanSheets: 10,
  };

  const mockClubRecords: ClubRecords = {
    bestLeaguePosition: { position: 1, season: 2023 },
    mostPoints: { points: 90, season: 2023 },
    mostWins: { wins: 28, season: 2023 },
    mostGoalsScored: { goals: 85, season: 2023 },
    fewestGoalsConceded: { goals: 25, season: 2023 },
    bestGoalDifference: { difference: 50, season: 2023 },
    biggestWin: { opponent: 'Test FC', score: '5-0', homeOrAway: 'home', week: 10, season: 2023 },
    longestWinStreak: { streak: 10, season: 2023 },
    longestUnbeatenStreak: { streak: 20, season: 2023 },
    mostGoalsSingleSeason: { playerId: 'p1', playerName: 'Top Scorer', goals: 30, season: 2023 },
    mostAssistsSingleSeason: { playerId: 'p2', playerName: 'Playmaker', assists: 20, season: 2023 },
    mostCleanSheetsSeason: { cleanSheets: 20, season: 2023 },
  };

  const mock: IRecordsManager = {
    calculateSeasonRecords: (_season, _finalTable, _matchHistory, _fixtures, _playerTeam, _teamId) => mockSeasonRecords,
    findBiggestResults: (_matches, _teamName) => ({ biggestWin: undefined, biggestLoss: undefined }),
    calculateStreaks: (_fixtures, _teamId) => ({ longestWinStreak: 0, longestUnbeatenStreak: 0 }),
    initializeClubRecords: (_season) => mockClubRecords,
    updateClubRecords: (_currentRecords, _seasonRecords) => ({ records: mockClubRecords, brokenRecords: [] }),
    ...overrides,
  };
  return mock;
}
