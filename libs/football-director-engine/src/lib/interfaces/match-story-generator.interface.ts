/**
 * Match Story Generator Interface
 *
 * Defines the contract for generating pre-match previews and post-match analysis.
 */

import {
  Fixture,
  Team,
  LeagueTable,
  MatchPreview,
  MatchResult,
  PostMatchAnalysis,
} from '../types';

export interface IMatchStoryGenerator {
  /**
   * Generate pre-match preview with team news, head-to-head stats,
   * weather forecast, and manager quotes
   */
  generatePreview(
    fixture: Fixture,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    allFixtures: Fixture[],
    currentWeek: number,
    currentYear: number,
    seed?: number
  ): MatchPreview;

  /**
   * Generate post-match analysis including manager quotes, player interviews,
   * turning points, and key statistics
   */
  generatePostMatchAnalysis(
    result: MatchResult,
    homeTeam: Team,
    awayTeam: Team,
    leagueTable: LeagueTable[],
    seed?: number
  ): PostMatchAnalysis;
}
