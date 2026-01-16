/**
 * Match Simulator Interface
 *
 * Defines the contract for match simulation.
 * Use this interface for dependency injection and testing.
 */

import { Team, Match, MatchResult, CupResult, MatchType } from '../types';

export interface IMatchSimulator {
  /**
   * Calculate effective team strength based on available players, tactics, morale, and manager bonus
   */
  calculateTeamStrength(team: Team, currentWeek: number): number;

  /**
   * Simulate a single match between two teams
   * @param matchType - 'friendly' or 'competitive' - determines if stats count toward league
   */
  simulateMatch(match: Match, currentWeek?: number, seed?: number, matchType?: MatchType): MatchResult;

  /**
   * Simulate an entire season (all matches between teams)
   */
  simulateSeason(teams: Team[], seed?: number): MatchResult[];

  /**
   * Simulate a knockout cup match with extra time and penalties if needed
   */
  simulateKnockoutMatch(match: Match, currentWeek?: number, seed?: number): CupResult;
}
