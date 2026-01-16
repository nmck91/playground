/**
 * Football Director Engine - Season Manager
 * Manages fixtures, season progression, and match simulation
 */

import { Team, Fixture, MatchResult, Match, SeasonPhase, TransferWindowStatus } from './types';
import { MatchSimulator } from './match-simulator';
import { ISeasonManager } from './interfaces/season-manager.interface';

// Re-export interface for convenience
export type { ISeasonManager };

// Season constants
const TOTAL_WEEKS = 52;
const PRE_SEASON_WEEKS = 7; // Weeks 1-7
const COMPETITIVE_WEEKS = 38; // Weeks 8-45
const COMPETITIVE_START = 8; // First week of competitive matches
const FRIENDLY_WEEKS = [4, 5, 6]; // Pre-season friendly matches
const CUP_WEEKS = [13, 19, 26, 33, 40, 47]; // Weeks reserved for cup matches (NO league fixtures)
const PRE_SEASON_TRANSFER_START = 1;
const PRE_SEASON_TRANSFER_END = 8;
const WINTER_TRANSFER_START = 28;
const WINTER_TRANSFER_END = 32;

/**
 * Season Manager Implementation
 */
export class SeasonManager implements ISeasonManager {
  /**
   * Generate round-robin fixtures for a full season
   * Each team plays every other team twice (home and away)
   * Competitive matches start at week 8, with gaps for cup weeks
   */
  generateFixtures(teams: Team[]): Fixture[] {
    if (teams.length < 2) {
      return [];
    }

    const fixtures: Fixture[] = [];
    const totalTeams = teams.length;
    let fixtureId = 0;

    // Generate 38 rounds of fixtures (19 first half + 19 second half)
    let currentWeek = COMPETITIVE_START; // Start at week 8
    const totalRounds = (totalTeams - 1) * 2; // 38 rounds for 20 teams

    for (let round = 1; round <= totalRounds; round++) {
      // Skip cup weeks
      while (CUP_WEEKS.includes(currentWeek)) {
        currentWeek++;
      }

      // Determine if this is first or second half
      const isFirstHalf = round <= totalTeams - 1;
      const baseRound = isFirstHalf ? round : round - (totalTeams - 1);

      for (let i = 0; i < totalTeams / 2; i++) {
        const homeIndex = (baseRound + i - 1) % totalTeams;
        const awayIndex = (totalTeams - 1 - i + baseRound - 1) % totalTeams;

        // Swap home/away for second half
        const actualHomeIndex = isFirstHalf ? homeIndex : awayIndex;
        const actualAwayIndex = isFirstHalf ? awayIndex : homeIndex;

        fixtures.push({
          id: `fixture-${fixtureId++}`,
          week: currentWeek,
          homeTeamId: teams[actualHomeIndex].id,
          awayTeamId: teams[actualAwayIndex].id,
          played: false,
          matchType: 'competitive',
        });
      }

      currentWeek++;
    }

    return fixtures;
  }

  /**
   * Generate friendly fixtures for pre-season (weeks 4, 5, 6)
   * Each team plays one friendly per week
   */
  generateFriendlyFixtures(teams: Team[]): Fixture[] {
    if (teams.length < 2) {
      return [];
    }

    const friendlies: Fixture[] = [];
    let fixtureId = 1000; // Start with different ID range to avoid conflicts

    // Generate one friendly per week for each team
    FRIENDLY_WEEKS.forEach((week) => {
      const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);

      // Pair up teams randomly
      for (let i = 0; i < shuffledTeams.length; i += 2) {
        if (i + 1 < shuffledTeams.length) {
          friendlies.push({
            id: `friendly-${fixtureId++}`,
            week,
            homeTeamId: shuffledTeams[i].id,
            awayTeamId: shuffledTeams[i + 1].id,
            played: false,
            matchType: 'friendly',
          });
        }
      }
    });

    return friendlies;
  }

  /**
   * Get all fixtures for a specific week
   */
  getFixturesForWeek(fixtures: Fixture[], week: number): Fixture[] {
    return fixtures.filter((fixture) => fixture.week === week);
  }

  /**
   * Simulate all matches for a specific week
   * Returns results and updated fixtures
   */
  simulateWeek(
    fixtures: Fixture[],
    teams: Team[],
    week: number,
    simulator: MatchSimulator,
    seed?: number
  ): { results: MatchResult[]; updatedFixtures: Fixture[] } {
    const weekFixtures = this.getFixturesForWeek(fixtures, week);
    const results: MatchResult[] = [];
    const updatedFixtures = [...fixtures];

    weekFixtures.forEach((fixture, index) => {
      // Find teams
      const homeTeam = teams.find((t) => t.id === fixture.homeTeamId);
      const awayTeam = teams.find((t) => t.id === fixture.awayTeamId);

      if (!homeTeam || !awayTeam) {
        throw new Error(
          `Team not found: ${fixture.homeTeamId} or ${fixture.awayTeamId}`
        );
      }

      // Simulate match
      const match: Match = { homeTeam, awayTeam };
      const matchSeed = seed !== undefined ? seed + week * 100 + index : undefined;
      const result = simulator.simulateMatch(match, week, matchSeed);

      results.push(result);

      // Update fixture in array
      const fixtureIndex = updatedFixtures.findIndex((f) => f.id === fixture.id);
      if (fixtureIndex !== -1) {
        updatedFixtures[fixtureIndex] = {
          ...fixture,
          played: true,
          result,
        };
      }
    });

    return { results, updatedFixtures };
  }

  /**
   * Check if all fixtures have been played
   */
  isSeasonComplete(fixtures: Fixture[]): boolean {
    if (fixtures.length === 0) {
      return false;
    }
    return fixtures.every((fixture) => fixture.played);
  }

  /**
   * Get the current week number (first unplayed week)
   */
  getCurrentWeek(fixtures: Fixture[]): number {
    const unplayedFixture = fixtures.find((fixture) => !fixture.played);
    return unplayedFixture ? unplayedFixture.week : COMPETITIVE_START;
  }

  /**
   * Get total number of weeks in the season
   */
  getTotalWeeks(fixtures: Fixture[]): number {
    if (fixtures.length === 0) {
      return 0;
    }
    return Math.max(...fixtures.map((f) => f.week));
  }

  /**
   * Determine season phase based on current week
   */
  getSeasonPhase(currentWeek: number): SeasonPhase {
    if (currentWeek <= PRE_SEASON_WEEKS) {
      return 'pre-season';
    }
    if (currentWeek >= COMPETITIVE_START && currentWeek < COMPETITIVE_START + COMPETITIVE_WEEKS) {
      return 'competitive';
    }
    return 'off-season';
  }

  /**
   * Determine transfer window status based on current week
   */
  getTransferWindowStatus(currentWeek: number): TransferWindowStatus {
    // Pre-season transfer window: weeks 1-8
    if (currentWeek >= PRE_SEASON_TRANSFER_START && currentWeek <= PRE_SEASON_TRANSFER_END) {
      return 'open';
    }
    // Winter transfer window: weeks 28-32 (mid-season)
    if (currentWeek >= WINTER_TRANSFER_START && currentWeek <= WINTER_TRANSFER_END) {
      return 'open';
    }
    return 'closed';
  }

  /**
   * Check if matches should be simulated this week
   * Returns true for friendly weeks (4-6) and competitive weeks (8-45)
   * Excludes cup weeks (13, 19, 26, 33, 40, 47) which have cup matches instead
   */
  hasMatchesThisWeek(currentWeek: number): boolean {
    // Friendly matches during pre-season
    if (FRIENDLY_WEEKS.includes(currentWeek)) {
      return true;
    }
    // Cup weeks have cup matches, not league matches
    if (CUP_WEEKS.includes(currentWeek)) {
      return false;
    }
    // Competitive matches
    const competitiveEnd = COMPETITIVE_START + COMPETITIVE_WEEKS - 1;
    return currentWeek >= COMPETITIVE_START && currentWeek <= competitiveEnd;
  }

  /**
   * Get the total number of weeks in a full season (including off-season)
   */
  getFullSeasonWeeks(): number {
    return TOTAL_WEEKS;
  }

  /**
   * Get the number of competitive weeks in a season
   */
  getCompetitiveWeeks(): number {
    return COMPETITIVE_WEEKS;
  }
}
