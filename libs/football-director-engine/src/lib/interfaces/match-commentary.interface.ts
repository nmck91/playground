/**
 * Match Commentary Interface
 *
 * Defines the contract for generating match commentary and events.
 */

import { Team, Player, MatchEvent, HalfTimeState } from '../types';

export interface IMatchCommentary {
  // Goal scorer selection
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): Player[];
  selectAssistProvider(team: Team, scorer: Player, seed?: number): Player | null;

  // Event generation
  generateMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    homeScorers: Player[],
    awayScorers: Player[],
    seed?: number
  ): MatchEvent[];

  // Match phase commentary
  generateHalfTimeCommentary(state: HalfTimeState, seed?: number): string;
  generateFullTimeCommentary(
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    events: MatchEvent[],
    seed?: number
  ): string;

  // Attendance
  generateAttendance(
    homeTeam: Team,
    seed?: number,
    options?: {
      isDerby?: boolean;
      homePosition?: number;
      awayPosition?: number;
      weatherCondition?: string;
    }
  ): number;
}
