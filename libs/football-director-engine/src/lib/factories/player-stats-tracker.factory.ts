/**
 * Player Stats Tracker Factory
 *
 * Factory functions for creating PlayerStatsTracker instances.
 * Provides both production and test/mock instances.
 */

import { IPlayerStatsTracker } from '../interfaces/player-stats-tracker.interface';
import { PlayerStatsTracker } from '../player-stats-tracker';
import { Player, PlayerStats, MatchEvent, MatchResult, Team, SeasonTopPerformers } from '../types';

/**
 * Create a production PlayerStatsTracker instance
 * Note: Implementation doesn't fully match interface yet
 */
export function createPlayerStatsTracker(): IPlayerStatsTracker {
  return new PlayerStatsTracker() as unknown as IPlayerStatsTracker;
}

/**
 * Create a mock PlayerStatsTracker for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockPlayerStatsTracker(
  overrides?: Partial<IPlayerStatsTracker>
): IPlayerStatsTracker {
  const mockStats: PlayerStats = {
    appearances: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0,
    careerAppearances: 0,
    careerGoals: 0,
    careerAssists: 0,
    careerCleanSheets: 0,
  };

  const mock: IPlayerStatsTracker = {
    initializePlayerStats: () => mockStats,
    updateStatsFromMatch: (player: Player, _events: MatchEvent[], _team: 'home' | 'away') => player,
    processTeamMatchStats: (team: Team, _result: MatchResult, _teamSide: 'home' | 'away') => team,
    archiveSeasonStats: (player: Player, _season: number, _teamName: string) => player,
    getTopPerformers: (_team: Team): SeasonTopPerformers => ({
      topScorer: null,
      topAssists: null,
      mostAppearances: null,
      cleanSheetKing: null,
    }),
    resetSeasonStats: (player: Player) => player,
    archiveAndResetTeamStats: (team: Team, _season: number) => team,
    ...overrides,
  };
  return mock;
}
