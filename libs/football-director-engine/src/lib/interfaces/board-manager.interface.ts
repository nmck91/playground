/**
 * Board Manager Interface
 *
 * Defines the contract for board objectives and satisfaction management.
 */

import { Team, LeagueTable, BoardObjective, BoardStatus } from '../types';

export interface IBoardManager {
  generateObjective(team: Team, season: number, previousPosition?: number): BoardObjective;
  initializeBoardStatus(team: Team, season: number): BoardStatus;
  updateObjectiveStatus(
    objective: BoardObjective,
    currentPosition: number,
    weeksRemaining: number
  ): BoardObjective;
  calculateSatisfaction(
    currentSatisfaction: number,
    objective: BoardObjective,
    currentPosition: number,
    weeksRemaining: number
  ): number;
  calculateJobSecurity(satisfaction: number): 'safe' | 'under-pressure' | 'critical';
  updateBoardStatus(
    boardStatus: BoardStatus,
    leagueTable: LeagueTable[],
    playerTeamId: string,
    weeksRemaining: number
  ): BoardStatus;
  evaluateSeason(
    boardStatus: BoardStatus,
    finalPosition: number
  ): {
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
  };
}
