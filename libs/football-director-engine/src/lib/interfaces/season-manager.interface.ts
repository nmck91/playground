/**
 * Season Manager Interface
 *
 * Defines the contract for season and fixture management.
 */

import { Team, Fixture, MatchResult, SeasonPhase, TransferWindowStatus } from '../types';
import { MatchSimulator } from '../match-simulator';

export interface ISeasonManager {
  // Fixture generation
  generateFixtures(teams: Team[]): Fixture[];
  generateFriendlyFixtures(teams: Team[]): Fixture[];
  getFixturesForWeek(fixtures: Fixture[], week: number): Fixture[];

  // Match simulation
  simulateWeek(
    fixtures: Fixture[],
    teams: Team[],
    week: number,
    simulator: MatchSimulator,
    seed?: number
  ): { results: MatchResult[]; updatedFixtures: Fixture[] };

  // Season status
  isSeasonComplete(fixtures: Fixture[]): boolean;
  getCurrentWeek(fixtures: Fixture[]): number;
  getTotalWeeks(fixtures: Fixture[]): number;
  getSeasonPhase(currentWeek: number): SeasonPhase;
  getTransferWindowStatus(currentWeek: number): TransferWindowStatus;
  hasMatchesThisWeek(currentWeek: number): boolean;

  // Season constants
  getFullSeasonWeeks(): number;
  getCompetitiveWeeks(): number;
}
