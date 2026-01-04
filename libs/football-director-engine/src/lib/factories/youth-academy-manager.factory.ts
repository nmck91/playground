/**
 * Youth Academy Manager Factory
 *
 * Factory functions for creating YouthAcademyManager instances.
 * Provides both production and test/mock instances.
 */

import { IYouthAcademyManager } from '../interfaces/youth-academy-manager.interface';
import { YouthAcademyManager } from '../youth-academy-manager';
import { Player, Team } from '../types';

/**
 * Create a production YouthAcademyManager instance
 */
export function createYouthAcademyManager(): IYouthAcademyManager {
  return new YouthAcademyManager();
}

/**
 * Create a mock YouthAcademyManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockYouthAcademyManager(
  overrides?: Partial<IYouthAcademyManager>
): IYouthAcademyManager {
  const mockYouthPlayer: Player = {
    id: 'youth-1',
    name: 'Youth Player',
    position: 'MID',
    skill: 5,
    age: 17,
    wages: 1000,
    stats: {
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
    },
    history: [],
    contract: {
      weeklyWage: 1000,
      startYear: 2024,
      startWeek: 1,
      expiryYear: 2027,
      expiryWeek: 1,
      yearsRemaining: 3,
      weeksRemaining: 156,
      status: 'active',
    },
    morale: 50,
  };

  const mock: IYouthAcademyManager = {
    generateYouthProspects: (_currentYear: number, _seed?: number): Player[] => [mockYouthPlayer],
    addYouthPlayersToTeam: (team: Team, _selectedPlayers: Player[]): Team => team,
    generateYouthPlayers: (team: Team, _currentYear: number, _seed?: number) => ({ team, newPlayers: [mockYouthPlayer] }),
    ...overrides,
  };
  return mock;
}
