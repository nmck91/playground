/**
 * Tactics Manager Factory
 *
 * Factory functions for creating TacticsManager instances.
 * Provides both production and test/mock instances.
 */

import { ITacticsManager } from '../interfaces/tactics-manager.interface';
import { TacticsManager } from '../tactics-manager';
import { Tactics, Team } from '../types';

/**
 * Create a production TacticsManager instance
 */
export function createTacticsManager(): ITacticsManager {
  return new TacticsManager();
}

/**
 * Create a mock TacticsManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockTacticsManager(
  overrides?: Partial<ITacticsManager>
): ITacticsManager {
  const mockTactics: Tactics = {
    formation: '4-4-2',
    mentality: 'balanced',
    roles: {
      defenders: 'full-back',
      midfielders: 'box-to-box',
      forwards: 'poacher',
    },
    instructions: {
      tempo: 'balanced',
      width: 'balanced',
      pressing: 'medium',
      passingStyle: 'mixed',
    },
    setPieces: {
      penaltyTaker: 'player-1',
      freeKickTaker: 'player-2',
      cornerTaker: 'player-3',
    },
  };

  const mock: ITacticsManager = {
    getFormationRequirements: (_formation) => ({ GK: 1, DEF: 4, MID: 4, FWD: 2 }),
    getDefaultTactics: () => mockTactics,
    canPlayFormation: (_team: Team, _formation) => true,
    calculateTacticalModifier: (_ownTactics: Tactics, _opponentTactics: Tactics) => 1.0,
    getFormationDescription: (_formation) => '4-4-2 formation',
    getMentalityDescription: (_mentality) => 'Balanced approach',
    setTeamTactics: (team: Team, _tactics: Tactics) => team,
    getDefaultInstructions: () => ({ tempo: 'balanced', width: 'balanced', pressing: 'medium', passingStyle: 'mixed' }),
    getDefaultRoles: () => ({ defenders: 'full-back', midfielders: 'box-to-box', forwards: 'poacher' }),
    getDefenderRoles: () => ['full-back', 'wing-back', 'ball-playing-defender'],
    getMidfielderRoles: () => ['defensive-midfielder', 'box-to-box', 'attacking-midfielder'],
    getForwardRoles: () => ['poacher', 'target-man', 'false-nine'],
    getRoleDescription: (_role) => 'Role description',
    getInstructionDescription: (_category, _value) => 'Instruction description',
    calculateRoleModifier: (_roles) => 0,
    calculateInstructionsModifier: (_instructions) => 0,
    calculateAdvancedTacticsModifier: (_tactics: Tactics) => 0,
    ...overrides,
  };
  return mock;
}
