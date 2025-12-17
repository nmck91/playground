/**
 * Football Director Engine - Match Simulator
 *
 * Simulates football matches based on team strength
 */

import { Team, Match, MatchResult } from './types';
import { MatchCommentary } from './match-commentary';

export class MatchSimulator {
  /**
   * Calculate team strength based on player skills
   */
  calculateTeamStrength(team: Team): number {
    if (!team.players || team.players.length === 0) {
      return 0;
    }

    const totalSkill = team.players.reduce((sum, player) => sum + player.skill, 0);
    return totalSkill / team.players.length;
  }

  /**
   * Simulate a single match between two teams
   */
  simulateMatch(match: Match, seed?: number): MatchResult {
    const homeStrength = this.calculateTeamStrength(match.homeTeam);
    const awayStrength = this.calculateTeamStrength(match.awayTeam);

    // Home advantage (10% boost)
    const adjustedHomeStrength = homeStrength * 1.1;

    // Calculate goal probabilities based on strength difference
    const homeGoals = this.generateGoals(adjustedHomeStrength, awayStrength, seed);
    const awayGoals = this.generateGoals(awayStrength, adjustedHomeStrength, seed ? seed + 1 : undefined);

    let result: 'home' | 'away' | 'draw';
    if (homeGoals > awayGoals) {
      result = 'home';
    } else if (awayGoals > homeGoals) {
      result = 'away';
    } else {
      result = 'draw';
    }

    // Generate match commentary
    const commentary = new MatchCommentary();
    const homeGoalScorers = commentary.selectGoalScorers(match.homeTeam, homeGoals, seed);
    const awayGoalScorers = commentary.selectGoalScorers(match.awayTeam, awayGoals, seed ? seed + 10 : undefined);
    const events = commentary.generateMatchEvents(
      match.homeTeam,
      match.awayTeam,
      homeGoals,
      awayGoals,
      homeGoalScorers,
      awayGoalScorers,
      seed
    );
    const attendance = commentary.generateAttendance(match.homeTeam, seed);

    return {
      homeScore: homeGoals,
      awayScore: awayGoals,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      result,
      homeGoalScorers,
      awayGoalScorers,
      events,
      attendance,
    };
  }

  /**
   * Generate number of goals based on team strengths
   * Uses Poisson-like distribution
   */
  private generateGoals(attackStrength: number, defenseStrength: number, seed?: number): number {
    // Calculate expected goals based on strength ratio
    const strengthRatio = attackStrength / Math.max(defenseStrength, 1);
    const expectedGoals = Math.max(0, (strengthRatio - 0.5) * 3);

    // Use seeded random if provided, otherwise Math.random()
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Simple Poisson-like distribution
    let goals = 0;
    let probability = Math.exp(-expectedGoals);
    let cumulative = probability;

    while (random > cumulative && goals < 10) {
      goals++;
      probability *= expectedGoals / goals;
      cumulative += probability;
    }

    return goals;
  }

  /**
   * Simple seeded random number generator for testing
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Simulate a full season (38 matches for each team)
   * Returns array of all match results
   */
  simulateSeason(teams: Team[], seed?: number): MatchResult[] {
    const results: MatchResult[] = [];

    // Each team plays each other team twice (home and away)
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          const match: Match = {
            homeTeam: teams[i],
            awayTeam: teams[j],
          };
          const matchSeed = seed !== undefined ? seed + i * teams.length + j : undefined;
          results.push(this.simulateMatch(match, matchSeed));
        }
      }
    }

    return results;
  }
}
