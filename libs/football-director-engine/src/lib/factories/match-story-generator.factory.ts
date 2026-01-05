/**
 * Match Story Generator Factory
 *
 * Factory functions for creating MatchStoryGenerator instances.
 * Provides both production and test/mock instances.
 */

import { IMatchStoryGenerator } from '../interfaces/match-story-generator.interface';
import { MatchStoryGenerator } from '../match-story-generator';
import { WeatherGenerator } from '../weather-generator';
import { MatchCommentary } from '../match-commentary';
import { MatchPreview, PostMatchAnalysis, Fixture, Team, LeagueTable, MatchResult } from '../types';

/**
 * Create a production MatchStoryGenerator instance
 */
export function createMatchStoryGenerator(): IMatchStoryGenerator {
  return new MatchStoryGenerator(
    new WeatherGenerator(),
    new MatchCommentary()
  );
}

/**
 * Create a mock MatchStoryGenerator for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockMatchStoryGenerator(
  overrides?: Partial<IMatchStoryGenerator>
): IMatchStoryGenerator {
  const mockPreview: MatchPreview = {
    fixtureId: 'fixture-1',
    homeTeam: 'Home FC',
    awayTeam: 'Away FC',
    week: 1,
    homePosition: 5,
    awayPosition: 10,
    headToHead: {
      homeWins: 5,
      awayWins: 3,
      draws: 2,
      lastFiveMeetings: [],
    },
    homeTeamNews: {
      recentForm: ['W', 'W', 'D', 'L', 'W'],
      injuries: [],
      suspensions: [],
      keyPlayers: [],
    },
    awayTeamNews: {
      recentForm: ['L', 'L', 'D', 'W', 'L'],
      injuries: [],
      suspensions: [],
      keyPlayers: [],
    },
    expectedAttendance: 25000,
    weather: {
      condition: 'sunny',
      temperature: 20,
      description: 'Perfect conditions',
    },
    isDerby: false,
    matchImportance: 'medium',
  };

  const mockAnalysis: PostMatchAnalysis = {
    homeManagerQuote: { managerName: 'Home Manager', teamName: 'Home FC', quote: 'Good result', sentiment: 'neutral' },
    awayManagerQuote: { managerName: 'Away Manager', teamName: 'Away FC', quote: 'Disappointing', sentiment: 'neutral' },
    keyStats: ['Test stat'],
  };

  const mock: IMatchStoryGenerator = {
    generatePreview: (_fixture: Fixture, _homeTeam: Team, _awayTeam: Team, _leagueTable: LeagueTable[], _allFixtures: Fixture[], _currentWeek: number, _currentYear: number, _seed?: number): MatchPreview => mockPreview,
    generatePostMatchAnalysis: (_result: MatchResult, _homeTeam: Team, _awayTeam: Team, _leagueTable: LeagueTable[], _seed?: number): PostMatchAnalysis => mockAnalysis,
    ...overrides,
  };
  return mock;
}
