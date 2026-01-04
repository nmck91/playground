/**
 * Season Manager Factory
 *
 * Factory functions for creating SeasonManager instances.
 * Provides both production and test/mock instances.
 */

import { ISeasonManager } from '../interfaces/season-manager.interface';
import { SeasonManager } from '../season-manager';
import { MatchSimulator } from '../match-simulator';
import { Fixture, Team } from '../types';

/**
 * Create a production SeasonManager instance
 */
export function createSeasonManager(): ISeasonManager {
  return new SeasonManager();
}

/**
 * Create a mock SeasonManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockSeasonManager(
  overrides?: Partial<ISeasonManager>
): ISeasonManager {
  const mockFixture: Fixture = {
    id: 'fixture-1',
    week: 1,
    homeTeamId: 'home-1',
    awayTeamId: 'away-1',
    matchType: 'competitive',
    played: false,
  };

  const mock: ISeasonManager = {
    generateFixtures: (_teams: Team[]): Fixture[] => [mockFixture],
    generateFriendlyFixtures: (_teams: Team[]): Fixture[] => [mockFixture],
    getFixturesForWeek: (_fixtures: Fixture[], _week: number): Fixture[] => [mockFixture],
    simulateWeek: (_fixtures: Fixture[], _teams: Team[], _week: number, _simulator: MatchSimulator, _seed?: number) => ({ results: [], updatedFixtures: [mockFixture] }),
    isSeasonComplete: (_fixtures: Fixture[]): boolean => false,
    getCurrentWeek: (_fixtures: Fixture[]): number => 1,
    getTotalWeeks: (_fixtures: Fixture[]): number => 52,
    getSeasonPhase: (_currentWeek: number) => 'pre-season',
    getTransferWindowStatus: (_currentWeek: number) => 'open',
    hasMatchesThisWeek: (_currentWeek: number): boolean => true,
    getFullSeasonWeeks: (): number => 52,
    getCompetitiveWeeks: (): number => 38,
    ...overrides,
  };
  return mock;
}
