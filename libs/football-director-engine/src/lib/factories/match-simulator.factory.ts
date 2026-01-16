/**
 * Match Simulator Factory
 *
 * Factory functions for creating MatchSimulator instances.
 * Provides both production and test/mock instances.
 */

import { IMatchSimulator } from '../interfaces/match-simulator.interface';
import { MatchSimulator } from '../match-simulator';
import { TacticsManager } from '../tactics-manager';
import { InjuryManager } from '../injury-manager';
import { MoraleManager } from '../morale-manager';
import { StaffManager } from '../staff-manager';
import { WeatherGenerator } from '../weather-generator';
import { MatchCommentary } from '../match-commentary';
import { Team, Match, MatchResult, CupResult } from '../types';

/**
 * Create a production MatchSimulator instance
 */
export function createMatchSimulator(): IMatchSimulator {
  return new MatchSimulator(
    new TacticsManager(),
    new InjuryManager(),
    new MoraleManager(),
    new StaffManager(),
    new WeatherGenerator(),
    new MatchCommentary()
  );
}

/**
 * Create a mock MatchSimulator for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockMatchSimulator(
  overrides?: Partial<IMatchSimulator>
): IMatchSimulator {
  const mockResult: MatchResult = {
    homeScore: 1,
    awayScore: 1,
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    result: 'draw',
    matchType: 'competitive',
    homeGoalScorers: [],
    awayGoalScorers: [],
    events: [],
    attendance: 25000,
    weather: {
      condition: 'sunny',
      temperature: 20,
      description: 'Perfect conditions',
    },
    stats: {
      possession: { home: 50, away: 50 },
      shots: { home: 10, away: 10 },
      shotsOnTarget: { home: 5, away: 5 },
      corners: { home: 5, away: 5 },
      fouls: { home: 10, away: 10 },
    },
    playerRatings: [],
    manOfMatch: null,
    isDerby: false,
    postMatchAnalysis: {
      homeManagerQuote: { managerName: 'Home Manager', teamName: 'Home Team', quote: 'Test quote', sentiment: 'neutral' },
      awayManagerQuote: { managerName: 'Away Manager', teamName: 'Away Team', quote: 'Test quote', sentiment: 'neutral' },
      keyStats: ['Test stat'],
    },
  };

  const mockCupResult: CupResult = {
    ...mockResult,
    wentToExtraTime: false,
    wentToPenalties: false,
    winnerId: 'home-team-id',
    winnerName: 'Home Team',
    loserId: 'away-team-id',
    loserName: 'Away Team',
  };

  const mock: IMatchSimulator = {
    calculateTeamStrength: (_team: Team, _currentWeek: number) => 10,
    simulateMatch: (_match: Match, _currentWeek?: number, _seed?: number) => mockResult,
    simulateSeason: (_teams: Team[], _seed?: number) => [mockResult],
    simulateKnockoutMatch: (_match: Match, _currentWeek?: number, _seed?: number) => mockCupResult,
    ...overrides,
  };
  return mock;
}
