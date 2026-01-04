/**
 * Morale Manager Factory
 *
 * Factory functions for creating MoraleManager instances.
 * Provides both production and test/mock instances.
 */

import { IMoraleManager } from '../interfaces/morale-manager.interface';
import { MoraleManager } from '../morale-manager';
import { MoraleInfo, Team, Player, LeagueTable } from '../types';

/**
 * Create a production MoraleManager instance
 */
export function createMoraleManager(): IMoraleManager {
  return new MoraleManager();
}

/**
 * Create a mock MoraleManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockMoraleManager(
  overrides?: Partial<IMoraleManager>
): IMoraleManager {
  const mockMoraleInfo: MoraleInfo = {
    level: 'normal',
    value: 50,
    emoji: '😐',
    statModifier: 0,
    description: 'Normal morale',
  };

  const mock: IMoraleManager = {
    calculatePlayerMorale: (_player: Player, _team: Team, _leaguePosition: number, _recentForm: number, _currentWeek: number): number => 50,
    getMoraleInfo: (_moraleValue: number): MoraleInfo => mockMoraleInfo,
    applyMoraleToSkill: (baseSkill: number, _morale: MoraleInfo): number => baseSkill,
    updateTeamMorale: (team: Team, _leagueTable: LeagueTable[], _currentWeek: number) => ({
      team,
      unhappyPlayers: [],
    }),
    shouldRequestTransfer: (_player: Player, _morale: MoraleInfo): boolean => false,
    ...overrides,
  };
  return mock;
}
