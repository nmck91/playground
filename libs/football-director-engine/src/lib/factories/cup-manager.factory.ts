/**
 * Cup Manager Factory
 *
 * Factory functions for creating CupManager instances.
 * Provides both production and test/mock instances.
 */

import { ICupManager } from '../interfaces/cup-manager.interface';
import { CupManager } from '../cup-manager';
import { CupCompetition, Team, CupFixture } from '../types';

/**
 * Create a production CupManager instance
 * Note: CupManager implementation doesn't fully match interface yet
 */
export function createCupManager(): ICupManager {
  return new CupManager() as unknown as ICupManager;
}

/**
 * Create a mock CupManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockCupManager(
  overrides?: Partial<ICupManager>
): ICupManager {
  const mockCup: CupCompetition = {
    id: 'cup-1',
    season: 2024,
    name: 'Test Cup',
    currentRound: 6,
    rounds: [],
    prizePool: {
      round1: 10000,
      round2: 25000,
      round3: 50000,
      quarterFinal: 100000,
      semiFinal: 250000,
      runnerUp: 500000,
      winner: 1000000,
    },
    completed: false,
  };

  const mock: ICupManager = {
    generateCupCompetition: (_teams: Team[], _season: number, _cupName?: string) => mockCup,
    advanceTournament: (_cup: CupCompetition, _teams: Team[]) => mockCup,
    isCupComplete: (_cup: CupCompetition) => false,
    getPrizeMoney: (_round: string, _isWinner?: boolean) => 100000,
    hasCupFixturesThisWeek: (_cup: CupCompetition, _currentWeek: number) => false,
    getCupFixturesForWeek: (_cup: CupCompetition, _currentWeek: number): CupFixture[] => [],
    updateCupProgress: (_cup: CupCompetition) => mockCup,
    ...overrides,
  };
  return mock;
}
