/**
 * Board Manager Factory
 *
 * Factory functions for creating BoardManager instances.
 * Provides both production and test/mock instances.
 */

import { IBoardManager } from '../interfaces/board-manager.interface';
import { BoardManager } from '../board-manager';
import { BoardObjective, BoardStatus, LeagueTable, Team } from '../types';

/**
 * Create a production BoardManager instance
 */
export function createBoardManager(): IBoardManager {
  return new BoardManager();
}

/**
 * Create a mock BoardManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockBoardManager(
  overrides?: Partial<IBoardManager>
): IBoardManager {
  const mockObjective: BoardObjective = {
    id: 'obj-1',
    season: 2024,
    type: 'league-position',
    target: 10,
    description: 'Finish in top 10',
    status: 'pending',
  };

  const mockBoardStatus: BoardStatus = {
    satisfaction: 70,
    jobSecurity: 'safe',
    currentObjective: mockObjective,
    objectiveHistory: [],
  };

  const mock: IBoardManager = {
    generateObjective: (_team: Team, _season: number, _previousPosition?: number) => mockObjective,
    initializeBoardStatus: (_team: Team, _season: number) => mockBoardStatus,
    updateObjectiveStatus: (_objective: BoardObjective, _currentPosition: number, _weeksRemaining: number) => mockObjective,
    calculateSatisfaction: (_currentSatisfaction: number, _objective: BoardObjective, _currentPosition: number, _weeksRemaining: number) => 70,
    calculateJobSecurity: (_satisfaction: number) => 'safe',
    updateBoardStatus: (_boardStatus: BoardStatus, _leagueTable: LeagueTable[], _playerTeamId: string, _weeksRemaining: number) => mockBoardStatus,
    evaluateSeason: (_boardStatus: BoardStatus, _finalPosition: number) => ({
      objective: mockObjective,
      satisfied: true,
      sacked: false,
      message: 'Good job!',
    }),
    ...overrides,
  };
  return mock;
}
