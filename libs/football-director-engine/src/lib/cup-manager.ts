/**
 * Cup Manager - Handles knockout cup competition logic
 *
 * Manages the generation, simulation, and progression of cup competitions.
 * Features single-elimination tournament with extra time and penalties.
 */

import type {
  Team,
  CupCompetition,
  CupRound,
  CupFixture,
  PrizeMoney,
} from './types';
import { ICupManager } from './interfaces/cup-manager.interface';

// Re-export interface for convenience
export type { ICupManager };

/**
 * Cup round names mapping
 */
const ROUND_NAMES: Record<number, string> = {
  1: 'Round 1',
  2: 'Round 2',
  3: 'Round 3',
  4: 'Quarter-Finals',
  5: 'Semi-Finals',
  6: 'Final',
};

/**
 * Cup schedules: which week each round is played
 * Strategically placed to avoid major league fixtures
 */
const FA_CUP_SCHEDULE: Record<number, number> = {
  1: 10, // Round 1 - Week 10
  2: 15, // Round 2 - Week 15
  3: 20, // Round 3 - Week 20
  4: 25, // Quarter-Finals - Week 25
  5: 35, // Semi-Finals - Week 35
  6: 44, // Final - Week 44 (near end of season)
};

const LEAGUE_CUP_SCHEDULE: Record<number, number> = {
  1: 13, // Round 1 - Week 13
  2: 19, // Round 2 - Week 19
  3: 26, // Round 3 - Week 26
  4: 33, // Quarter-Finals - Week 33
  5: 40, // Semi-Finals - Week 40
  6: 47, // Final - Week 47
};

/**
 * Default prize money structures
 */
const FA_CUP_PRIZE_POOL: PrizeMoney = {
  round1: 10000,
  round2: 25000,
  round3: 50000,
  quarterFinal: 100000,
  semiFinal: 250000,
  runnerUp: 500000,
  winner: 1000000,
};

const LEAGUE_CUP_PRIZE_POOL: PrizeMoney = {
  round1: 5000,
  round2: 15000,
  round3: 30000,
  quarterFinal: 60000,
  semiFinal: 150000,
  runnerUp: 300000,
  winner: 600000,
};

export class CupManager {
  /**
   * Generate a new cup competition with random draw
   *
   * @param teams - All teams in the league (should be 20)
   * @param season - Current season number
   * @param cupName - Name of the cup competition
   * @returns Complete cup competition structure
   */
  static generateCupCompetition(
    teams: Team[],
    season: number,
    cupName = 'FA Cup'
  ): CupCompetition {
    // Select schedule and prize pool based on cup name
    const schedule = cupName === 'League Cup' ? LEAGUE_CUP_SCHEDULE : FA_CUP_SCHEDULE;
    const prizePool = cupName === 'League Cup' ? LEAGUE_CUP_PRIZE_POOL : FA_CUP_PRIZE_POOL;

    // Shuffle teams for random draw
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

    // Generate all rounds
    const rounds: CupRound[] = [];

    // Round 1: 10 teams (5 matches) - 10 teams get byes
    const round1Teams = shuffledTeams.slice(0, 10);
    // const _byeTeams = shuffledTeams.slice(10); // Reserved for bye tracking feature

    const round1Fixtures = this.generateRoundFixtures(
      round1Teams,
      1,
      schedule[1]
    );

    rounds.push({
      roundNumber: 1,
      roundName: ROUND_NAMES[1],
      fixtures: round1Fixtures,
      weekNumber: schedule[1],
      completed: false,
    });

    // Note: Subsequent rounds will be generated as tournament progresses
    // This is because we don't know winners yet

    return {
      id: `${cupName.toLowerCase().replace(/\s+/g, '-')}-${season}`,
      name: cupName,
      season,
      currentRound: 1,
      rounds,
      prizePool,
      completed: false,
    };
  }

  /**
   * Generate fixtures for a specific round
   *
   * @param teams - Teams in this round
   * @param roundNumber - Round number (1-6)
   * @param weekNumber - Week when round is played
   * @returns Array of fixtures
   */
  private static generateRoundFixtures(
    teams: Team[],
    roundNumber: number,
    weekNumber: number
  ): CupFixture[] {
    const fixtures: CupFixture[] = [];

    // Pair teams sequentially (after shuffle, this is random)
    for (let i = 0; i < teams.length; i += 2) {
      if (i + 1 < teams.length) {
        fixtures.push({
          id: `cup-r${roundNumber}-${i / 2 + 1}`,
          homeTeamId: teams[i].id,
          awayTeamId: teams[i + 1].id,
          homeTeamName: teams[i].name,
          awayTeamName: teams[i + 1].name,
          round: roundNumber,
          weekNumber,
          played: false,
        });
      }
    }

    return fixtures;
  }

  /**
   * Advance tournament to next round based on results
   *
   * @param cup - Current cup competition
   * @param teams - All teams (needed for next round generation)
   * @returns Updated cup competition or null if complete
   */
  static advanceTournament(
    cup: CupCompetition,
    teams: Team[]
  ): CupCompetition | null {
    const currentRound = cup.rounds.find(r => r.roundNumber === cup.currentRound);

    if (!currentRound || !currentRound.completed) {
      return cup; // Not ready to advance
    }

    // Check if this was the final
    if (cup.currentRound === 6) {
      return this.completeCup(cup);
    }

    // Select schedule based on cup name
    const schedule = cup.name === 'League Cup' ? LEAGUE_CUP_SCHEDULE : FA_CUP_SCHEDULE;

    // Get winners from current round
    const winners: Team[] = [];
    for (const fixture of currentRound.fixtures) {
      if (fixture.result) {
        const winningTeam = teams.find(t => t.id === fixture.result!.winnerId);
        if (winningTeam) {
          winners.push(winningTeam);
        }
      }
    }

    // Special case: Round 1 has byes
    if (cup.currentRound === 1) {
      // Add the 10 teams that got byes
      const round1TeamIds = currentRound.fixtures.flatMap(f => [
        f.homeTeamId,
        f.awayTeamId,
      ]);
      const byeTeams = teams.filter(t => !round1TeamIds.includes(t.id));
      winners.push(...byeTeams);
    }

    // Shuffle winners for next round draw
    const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);

    // Generate next round
    const nextRoundNumber = cup.currentRound + 1;
    const nextRoundFixtures = this.generateRoundFixtures(
      shuffledWinners,
      nextRoundNumber,
      schedule[nextRoundNumber]
    );

    const nextRound: CupRound = {
      roundNumber: nextRoundNumber,
      roundName: ROUND_NAMES[nextRoundNumber],
      fixtures: nextRoundFixtures,
      weekNumber: schedule[nextRoundNumber],
      completed: false,
    };

    return {
      ...cup,
      currentRound: nextRoundNumber,
      rounds: [...cup.rounds, nextRound],
    };
  }

  /**
   * Complete the cup competition
   *
   * @param cup - Cup competition
   * @returns Completed cup
   */
  private static completeCup(cup: CupCompetition): CupCompetition {
    const finalRound = cup.rounds.find(r => r.roundNumber === 6);

    if (!finalRound || finalRound.fixtures.length === 0) {
      return cup;
    }

    const finalFixture = finalRound.fixtures[0];
    const result = finalFixture.result;

    if (!result) {
      return cup;
    }

    return {
      ...cup,
      completed: true,
      winner: {
        teamId: result.winnerId,
        teamName: result.winnerName,
      },
      runnerUp: {
        teamId: result.loserId,
        teamName: result.loserName,
      },
    };
  }

  /**
   * Check if cup is complete
   *
   * @param cup - Cup competition
   * @returns True if cup is finished
   */
  static isCupComplete(cup: CupCompetition): boolean {
    return cup.completed;
  }

  /**
   * Get prize money for reaching a specific round
   *
   * @param roundNumber - Round reached (1-6)
   * @param prizePool - Prize money structure
   * @param isWinner - True if team won the cup
   * @param isRunnerUp - True if team was runner-up
   * @returns Prize money amount
   */
  static getPrizeMoney(
    roundNumber: number,
    prizePool: PrizeMoney,
    isWinner = false,
    isRunnerUp = false
  ): number {
    if (isWinner) {
      return prizePool.winner;
    }

    if (isRunnerUp) {
      return prizePool.runnerUp;
    }

    switch (roundNumber) {
      case 1:
        return prizePool.round1;
      case 2:
        return prizePool.round2;
      case 3:
        return prizePool.round3;
      case 4:
        return prizePool.quarterFinal;
      case 5:
        return prizePool.semiFinal;
      default:
        return 0;
    }
  }

  /**
   * Check if current week has cup fixtures
   *
   * @param cup - Cup competition
   * @param currentWeek - Current week number
   * @returns True if there are cup fixtures this week
   */
  static hasCupFixturesThisWeek(
    cup: CupCompetition | undefined,
    currentWeek: number
  ): boolean {
    if (!cup || cup.completed) {
      return false;
    }

    const currentRound = cup.rounds.find(r => r.roundNumber === cup.currentRound);
    return currentRound?.weekNumber === currentWeek && !currentRound.completed;
  }

  /**
   * Get cup fixtures for current week
   *
   * @param cup - Cup competition
   * @param currentWeek - Current week number
   * @returns Array of fixtures or empty array
   */
  static getCupFixturesForWeek(
    cup: CupCompetition | undefined,
    currentWeek: number
  ): CupFixture[] {
    if (!cup || cup.completed) {
      return [];
    }

    const currentRound = cup.rounds.find(r => r.roundNumber === cup.currentRound);
    if (currentRound?.weekNumber === currentWeek && !currentRound.completed) {
      return currentRound.fixtures.filter(f => !f.played);
    }

    return [];
  }

  /**
   * Mark round as complete if all fixtures are played
   *
   * @param cup - Cup competition
   * @returns Updated cup
   */
  static updateCupProgress(cup: CupCompetition): CupCompetition {
    const currentRound = cup.rounds.find(r => r.roundNumber === cup.currentRound);

    if (!currentRound) {
      return cup;
    }

    const allPlayed = currentRound.fixtures.every(f => f.played);

    if (allPlayed && !currentRound.completed) {
      const updatedRounds = cup.rounds.map(r =>
        r.roundNumber === cup.currentRound
          ? { ...r, completed: true }
          : r
      );

      return {
        ...cup,
        rounds: updatedRounds,
      };
    }

    return cup;
  }

  // Instance method implementations that delegate to static methods
  // These are needed to satisfy the ICupManager interface

  generateCupCompetition(teams: Team[], season: number, cupName?: string): CupCompetition {
    return CupManager.generateCupCompetition(teams, season, cupName);
  }

  advanceTournament(cup: CupCompetition, teams: Team[]): CupCompetition | null {
    return CupManager.advanceTournament(cup, teams);
  }

  isCupComplete(cup: CupCompetition): boolean {
    return CupManager.isCupComplete(cup);
  }

  getPrizeMoney(round: string, isWinner?: boolean): number {
    // Convert round string to round number for static method
    const roundMap: Record<string, number> = {
      'round1': 1,
      'round2': 2,
      'round3': 3,
      'quarterFinal': 4,
      'semiFinal': 5,
      'runnerUp': 6,
      'winner': 6,
    };
    const roundNumber = roundMap[round] || 0;
    // Use FA Cup prize pool as default (since this is instance method without cup reference)
    const isRunnerUp = round === 'runnerUp';
    const isWinnerFlag = round === 'winner' || isWinner;
    return CupManager.getPrizeMoney(roundNumber, FA_CUP_PRIZE_POOL, isWinnerFlag, isRunnerUp);
  }

  hasCupFixturesThisWeek(cup: CupCompetition, currentWeek: number): boolean {
    return CupManager.hasCupFixturesThisWeek(cup, currentWeek);
  }

  getCupFixturesForWeek(cup: CupCompetition, currentWeek: number): CupFixture[] {
    return CupManager.getCupFixturesForWeek(cup, currentWeek);
  }

  updateCupProgress(cup: CupCompetition): CupCompetition {
    return CupManager.updateCupProgress(cup);
  }
}
