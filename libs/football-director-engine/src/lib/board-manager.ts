/**
 * Football Director Engine - Board Manager
 * Manages board objectives, satisfaction, and job security
 */

import { BoardObjective, BoardStatus, LeagueTable, Team } from './types';

export class BoardManager {
  /**
   * Generate a season objective based on team strength and previous performance
   */
  generateObjective(
    team: Team,
    season: number,
    previousPosition?: number
  ): BoardObjective {
    // Calculate team strength (average player skill)
    const avgSkill =
      team.players.reduce((sum, p) => sum + p.skill, 0) / team.players.length;

    let type: 'league-position' | 'points' | 'avoid-relegation';
    let target: number;
    let description: string;

    // Determine objective based on team strength and previous performance
    if (avgSkill >= 15) {
      // Elite team - aim for top 4
      type = 'league-position';
      target = 4;
      description = 'Finish in the top 4 to secure European football';
    } else if (avgSkill >= 13) {
      // Strong team - aim for top 8
      type = 'league-position';
      target = 8;
      description = 'Finish in the top half of the table';
    } else if (avgSkill >= 11) {
      // Mid-table team - aim for top 12
      type = 'league-position';
      target = 12;
      description = 'Secure a comfortable mid-table finish';
    } else if (avgSkill >= 9) {
      // Lower mid-table - aim to stay up comfortably
      type = 'league-position';
      target = 15;
      description = 'Avoid the relegation battle';
    } else {
      // Weak team - avoid relegation (bottom 3)
      type = 'avoid-relegation';
      target = 18;
      description = 'Avoid relegation - finish 18th or higher';
    }

    // Adjust based on previous season performance
    if (previousPosition !== undefined) {
      if (previousPosition <= 6 && type === 'league-position' && target > 6) {
        // If did well last season, increase expectations
        target = Math.max(6, target - 2);
        description = `Build on last season's success - finish in top ${target}`;
      } else if (previousPosition >= 15 && type === 'league-position' && target < 15) {
        // If struggled last season, temper expectations
        target = Math.min(15, target + 2);
        description = `Improve on last season - finish in top ${target}`;
      }
    }

    return {
      id: `objective-${season}`,
      season,
      type,
      target,
      description,
      status: 'pending',
    };
  }

  /**
   * Initialize board status for a new game
   */
  initializeBoardStatus(team: Team, season: number): BoardStatus {
    const objective = this.generateObjective(team, season);

    return {
      satisfaction: 70, // Start at moderate satisfaction
      jobSecurity: 'safe',
      currentObjective: objective,
      objectiveHistory: [],
    };
  }

  /**
   * Update objective status based on current league position
   */
  updateObjectiveStatus(
    objective: BoardObjective,
    currentPosition: number,
    weeksRemaining: number
  ): BoardObjective {
    if (objective.type === 'league-position') {
      const gap = currentPosition - objective.target;

      if (gap <= 0) {
        // On target or better
        return { ...objective, status: 'on-track' };
      } else if (gap <= 3 && weeksRemaining > 5) {
        // Close to target with time remaining
        return { ...objective, status: 'on-track' };
      } else if (gap <= 5) {
        // Falling short but recoverable
        return { ...objective, status: 'at-risk' };
      } else {
        // Far from target
        return { ...objective, status: 'failed' };
      }
    } else if (objective.type === 'avoid-relegation') {
      if (currentPosition <= objective.target) {
        return { ...objective, status: 'on-track' };
      } else if (currentPosition <= objective.target + 1 && weeksRemaining > 3) {
        return { ...objective, status: 'at-risk' };
      } else {
        return { ...objective, status: 'failed' };
      }
    }

    return objective;
  }

  /**
   * Calculate board satisfaction based on objective status and performance
   */
  calculateSatisfaction(
    currentSatisfaction: number,
    objective: BoardObjective,
    currentPosition: number,
    weeksRemaining: number
  ): number {
    let change = 0;

    // Base change on objective status
    switch (objective.status) {
      case 'on-track':
        change = 2; // Gradual increase
        break;
      case 'at-risk':
        change = -3; // Moderate decrease
        break;
      case 'failed':
        change = -5; // Significant decrease
        break;
      case 'achieved':
        change = 5; // Big boost
        break;
    }

    // Adjust based on how well we're doing
    if (objective.type === 'league-position') {
      if (currentPosition < objective.target) {
        // Exceeding expectations
        change += 1;
      } else if (currentPosition === objective.target) {
        // Meeting expectations
        change += 0.5;
      }
    }

    const newSatisfaction = Math.max(0, Math.min(100, currentSatisfaction + change));
    return Math.round(newSatisfaction);
  }

  /**
   * Determine job security level based on satisfaction
   */
  calculateJobSecurity(satisfaction: number): 'safe' | 'under-pressure' | 'critical' {
    if (satisfaction >= 60) {
      return 'safe';
    } else if (satisfaction >= 35) {
      return 'under-pressure';
    } else {
      return 'critical';
    }
  }

  /**
   * Update board status during the season
   */
  updateBoardStatus(
    boardStatus: BoardStatus,
    leagueTable: LeagueTable[],
    playerTeamId: string,
    weeksRemaining: number
  ): BoardStatus {
    if (!boardStatus.currentObjective) {
      return boardStatus;
    }

    // Find current position
    const sortedTable = [...leagueTable].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    const currentPosition =
      sortedTable.findIndex((entry) => entry.teamId === playerTeamId) + 1;

    // Update objective status
    const updatedObjective = this.updateObjectiveStatus(
      boardStatus.currentObjective,
      currentPosition,
      weeksRemaining
    );

    // Calculate new satisfaction
    const newSatisfaction = this.calculateSatisfaction(
      boardStatus.satisfaction,
      updatedObjective,
      currentPosition,
      weeksRemaining
    );

    // Determine job security
    const jobSecurity = this.calculateJobSecurity(newSatisfaction);

    return {
      ...boardStatus,
      currentObjective: updatedObjective,
      satisfaction: newSatisfaction,
      jobSecurity,
    };
  }

  /**
   * Evaluate season performance and determine if manager is sacked
   */
  evaluateSeason(
    boardStatus: BoardStatus,
    finalPosition: number
  ): {
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
  } {
    if (!boardStatus.currentObjective) {
      throw new Error('No current objective to evaluate');
    }

    const objective = boardStatus.currentObjective;
    let satisfied = false;
    let sacked = false;
    let message = '';

    // Check if objective was achieved
    if (objective.type === 'league-position') {
      if (finalPosition <= objective.target) {
        satisfied = true;
        objective.status = 'achieved';
        message = `Excellent work! You finished in position ${finalPosition}, meeting the board's expectations.`;
      } else if (finalPosition <= objective.target + 2) {
        // Close but not quite
        satisfied = boardStatus.satisfaction >= 50;
        objective.status = 'at-risk';
        message = satisfied
          ? `You finished in position ${finalPosition}, slightly below expectations. The board is giving you another chance.`
          : `Disappointing season. You finished in position ${finalPosition}, failing to meet expectations. You've been relieved of your duties.`;
        sacked = !satisfied;
      } else {
        // Failed badly
        satisfied = false;
        objective.status = 'failed';
        sacked = true;
        message = `Unacceptable performance. You finished in position ${finalPosition}, far below the target of ${objective.target}. The board has decided to part ways.`;
      }
    } else if (objective.type === 'avoid-relegation') {
      if (finalPosition <= objective.target) {
        satisfied = true;
        objective.status = 'achieved';
        message = `Well done keeping us up! You finished in position ${finalPosition}, successfully avoiding relegation.`;
      } else {
        satisfied = false;
        objective.status = 'failed';
        sacked = true;
        message = `Relegated. You finished in position ${finalPosition}. The board has no choice but to make a change.`;
      }
    }

    return { objective, satisfied, sacked, message };
  }
}
