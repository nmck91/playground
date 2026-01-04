/**
 * Match Commentary Factory
 *
 * Factory functions for creating MatchCommentary instances.
 * Provides both production and test/mock instances.
 */

import { IMatchCommentary } from '../interfaces/match-commentary.interface';
import { MatchCommentary } from '../match-commentary';
import { Team, MatchEvent, Player, HalfTimeState } from '../types';

/**
 * Create a production MatchCommentary instance
 */
export function createMatchCommentary(): IMatchCommentary {
  return new MatchCommentary();
}

/**
 * Create a mock MatchCommentary for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockMatchCommentary(
  overrides?: Partial<IMatchCommentary>
): IMatchCommentary {
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Test Player',
    position: 'FWD',
    skill: 10,
    age: 25,
    wages: 5000,
    stats: {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      careerAppearances: 0,
      careerGoals: 0,
      careerAssists: 0,
      careerCleanSheets: 0,
    },
    history: [],
    contract: {
      weeklyWage: 5000,
      startYear: 2024,
      startWeek: 1,
      expiryYear: 2027,
      expiryWeek: 52,
      yearsRemaining: 3,
      weeksRemaining: 156,
      status: 'active',
    },
    morale: 50,
  };

  const mock: IMatchCommentary = {
    selectGoalScorers: (_team: Team, _numberOfGoals: number, _seed?: number) => [mockPlayer],
    selectAssistProvider: (_team: Team, _scorer: Player, _seed?: number) => null,
    generateMatchEvents: (_homeTeam: Team, _awayTeam: Team, _homeScore: number, _awayScore: number, _homeScorers: Player[], _awayScorers: Player[], _seed?: number): MatchEvent[] => [],
    generateHalfTimeCommentary: (_state: HalfTimeState, _seed?: number) => 'Half time commentary',
    generateFullTimeCommentary: (_homeTeam: string, _awayTeam: string, _homeScore: number, _awayScore: number, _events: MatchEvent[], _seed?: number) => 'Full time commentary',
    generateAttendance: (_homeTeam: Team, _seed?: number, _options?: { isDerby?: boolean; homePosition?: number; awayPosition?: number; weatherCondition?: string }) => 25000,
    ...overrides,
  };
  return mock;
}
