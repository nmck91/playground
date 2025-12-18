/**
 * Football Director Engine - Season Manager
 * Manages fixtures, season progression, and match simulation
 */

import { Team, Fixture, MatchResult, Match } from './types';
import { MatchSimulator } from './match-simulator';

export class SeasonManager {
  /**
   * Generate round-robin fixtures for a full season
   * Each team plays every other team twice (home and away)
   */
  generateFixtures(teams: Team[]): Fixture[] {
    if (teams.length < 2) {
      return [];
    }

    const fixtures: Fixture[] = [];
    const totalTeams = teams.length;
    const totalWeeks = (totalTeams - 1) * 2; // Each team plays each other twice

    let fixtureId = 0;

    // First half of season (each team plays each other once)
    for (let week = 1; week <= totalTeams - 1; week++) {
      for (let i = 0; i < totalTeams / 2; i++) {
        const homeIndex = (week + i - 1) % totalTeams;
        const awayIndex = (totalTeams - 1 - i + week - 1) % totalTeams;

        fixtures.push({
          id: `fixture-${fixtureId++}`,
          week,
          homeTeamId: teams[homeIndex].id,
          awayTeamId: teams[awayIndex].id,
          played: false,
        });
      }
    }

    // Second half of season (reverse fixtures - swap home/away)
    const firstHalfCount = fixtures.length;
    for (let i = 0; i < firstHalfCount; i++) {
      const originalFixture = fixtures[i];
      fixtures.push({
        id: `fixture-${fixtureId++}`,
        week: originalFixture.week + totalTeams - 1,
        homeTeamId: originalFixture.awayTeamId,
        awayTeamId: originalFixture.homeTeamId,
        played: false,
      });
    }

    return fixtures;
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
    return unplayedFixture ? unplayedFixture.week : 1;
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
}
