/**
 * Team Generator Factory
 *
 * Factory functions for creating TeamGenerator instances.
 * Provides both production and test/mock instances.
 */

import { ITeamGenerator } from '../interfaces/team-generator.interface';
import { TeamGenerator } from '../team-generator';
import { PlayerStatsTracker } from '../player-stats-tracker';
import { StaffManager } from '../staff-manager';
import { Team, Player } from '../types';

/**
 * Create a production TeamGenerator instance
 */
export function createTeamGenerator(): ITeamGenerator {
  return new TeamGenerator(
    new PlayerStatsTracker(),
    new StaffManager()
  );
}

/**
 * Create a mock TeamGenerator for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockTeamGenerator(
  overrides?: Partial<ITeamGenerator>
): ITeamGenerator {
  const mockPlayer: Player = {
    id: 'mock-player-1',
    name: 'Test Player',
    position: 'MID',
    skill: 10,
    age: 25,
    wages: 5000,
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
      weeklyWage: 5000,
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

  const mockTeam: Team = {
    id: 'mock-team-1',
    name: 'Mock FC',
    budget: 1000000,
    players: [mockPlayer],
    staff: [],
    tactics: {
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
        penaltyTaker: mockPlayer.id,
        freeKickTaker: mockPlayer.id,
        cornerTaker: mockPlayer.id,
      },
    },
    philosophy: 'balanced',
  };

  const mock: ITeamGenerator = {
    generatePlayer: (_position, _skillRange, _seed?) => mockPlayer,
    generateTeam: (_name, _tier, _seed?) => mockTeam,
    generateLeague: (_seed?) => [mockTeam],
    ...overrides,
  };
  return mock;
}
