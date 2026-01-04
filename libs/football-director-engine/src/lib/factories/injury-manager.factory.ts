/**
 * Injury Manager Factory
 *
 * Factory functions for creating InjuryManager instances.
 * Provides both production and test/mock instances.
 */

import { IInjuryManager } from '../interfaces/injury-manager.interface';
import { InjuryManager } from '../injury-manager';
import { Team, Injury, MatchEvent, Player } from '../types';

/**
 * Create a production InjuryManager instance
 */
export function createInjuryManager(): IInjuryManager {
  return new InjuryManager();
}

/**
 * Create a mock InjuryManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockInjuryManager(
  overrides?: Partial<IInjuryManager>
): IInjuryManager {
  const mock: IInjuryManager = {
    generateInjury: (currentWeek: number): Injury => ({
      type: 'minor',
      description: 'Minor knock',
      weeksRemaining: 2,
      sustainedInWeek: currentWeek,
    }),
    processMatchInjuries: (team: Team, _currentWeek: number) => ({
      team,
      injuries: [],
    }),
    processSuspensions: (team: Team, _events: MatchEvent[], _currentWeek: number, _isHomeTeam: boolean) => ({
      team,
      suspensions: [],
    }),
    updateWeeklyInjuries: (team: Team, _currentWeek: number) => ({
      team,
      recovered: [],
      acceleratedRecovery: [],
    }),
    getAvailablePlayers: (team: Team, _currentWeek: number): Player[] => team.players,
    getInjuredPlayers: (_team: Team): Player[] => [],
    getSuspendedPlayers: (_team: Team, _currentWeek: number): Player[] => [],
    isPlayerAvailable: (_player: Player, _currentWeek: number): boolean => true,
    ...overrides,
  };
  return mock;
}
