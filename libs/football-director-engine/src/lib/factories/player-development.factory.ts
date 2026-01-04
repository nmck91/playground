/**
 * Player Development Factory
 *
 * Factory functions for creating PlayerDevelopment instances.
 * Provides both production and test/mock instances.
 */

import { IPlayerDevelopment } from '../interfaces/player-development.interface';
import { PlayerDevelopment } from '../player-development';
import { Player, Team, DevelopmentReport } from '../types';

/**
 * Create a production PlayerDevelopment instance
 */
export function createPlayerDevelopment(): IPlayerDevelopment {
  return new PlayerDevelopment();
}

/**
 * Create a mock PlayerDevelopment for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockPlayerDevelopment(
  overrides?: Partial<IPlayerDevelopment>
): IPlayerDevelopment {
  const mockReport: DevelopmentReport = {
    playerId: 'p1',
    playerName: 'Test Player',
    oldAge: 20,
    newAge: 21,
    oldSkill: 10,
    newSkill: 11,
    skillChange: 1,
    phase: 'developing',
  };

  const mock: IPlayerDevelopment = {
    agePlayer: (player: Player): Player => player,
    calculateSkillChange: (_player: Player, _seed?: number): number => 1,
    getPlayerPhase: (_age: number): 'developing' | 'peak' | 'declining' | 'veteran' => 'developing',
    developPlayer: (player: Player, _seed?: number) => ({ player, report: mockReport }),
    developTeam: (team: Team, _seed?: number) => ({ team, reports: [mockReport] }),
    developLeague: (teams: Team[], _seed?: number) => ({ teams, allReports: new Map() }),
    generateSummary: (_reports: DevelopmentReport[]) => ({
      totalPlayers: 0,
      improved: 0,
      declined: 0,
      maintained: 0,
      avgSkillChange: 0,
    }),
    ...overrides,
  };
  return mock;
}
