/**
 * Football Director Engine - Type Guards and Runtime Validation
 *
 * Epic 1.5 - Story 1.5.4: Create Type Guards and Runtime Validation
 *
 * This file provides:
 * - Zod schemas for runtime validation
 * - Type guard functions for compile-time type narrowing
 * - Validation utilities for data at system boundaries
 */

import { z } from 'zod';
import type {
  Player,
  Team,
  GameState,
  MatchResult,
  Season,
  TeamFinances,
  Staff,
} from './types';

/**
 * Validation Result
 * Returns either success with data or failure with errors
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodError };

/**
 * Player Stats Schema
 */
const PlayerStatsSchema = z.object({
  appearances: z.number().int().min(0),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0),
  cleanSheets: z.number().int().min(0),
  yellowCards: z.number().int().min(0),
  redCards: z.number().int().min(0),
  careerAppearances: z.number().int().min(0),
  careerGoals: z.number().int().min(0),
  careerAssists: z.number().int().min(0),
  careerCleanSheets: z.number().int().min(0),
});

/**
 * Player Contract Schema
 */
const PlayerContractSchema = z.object({
  weeklyWage: z.number().positive(),
  startYear: z.number().int().positive(),
  startWeek: z.number().int().min(1).max(52),
  expiryYear: z.number().int().positive(),
  expiryWeek: z.number().int().min(1).max(52),
  yearsRemaining: z.number().min(0),
  weeksRemaining: z.number().int().min(0),
  status: z.enum(['active', 'expiring-soon', 'expiring', 'expired']),
});

/**
 * Player Schema
 */
const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']),
  skill: z.number().min(1).max(20),
  age: z.number().int().min(16).max(45),
  wages: z.number().positive(),
  stats: PlayerStatsSchema,
  history: z.array(z.any()), // Simplified for now
  injury: z.any().optional(),
  suspendedUntil: z.number().optional(),
  contract: PlayerContractSchema,
  morale: z.number().min(0).max(100),
});

/**
 * Team Tactics Schema
 */
const TacticsSchema = z.object({
  formation: z.enum(['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2']),
  mentality: z.enum(['defensive', 'balanced', 'attacking']),
  roles: z.object({
    defenders: z.enum(['full-back', 'wing-back', 'ball-playing-defender']),
    midfielders: z.enum(['defensive-midfielder', 'box-to-box', 'attacking-midfielder']),
    forwards: z.enum(['target-man', 'poacher', 'false-nine']),
  }),
  instructions: z.object({
    tempo: z.enum(['slow', 'balanced', 'fast']),
    width: z.enum(['narrow', 'balanced', 'wide']),
    pressing: z.enum(['low', 'medium', 'high']),
    passingStyle: z.enum(['short', 'mixed', 'long']),
  }),
  setPieces: z.object({
    cornerTaker: z.string(),
    freeKickTaker: z.string(),
    penaltyTaker: z.string(),
  }),
});

/**
 * Staff Schema
 */
const StaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(['manager', 'coach', 'scout']),
  skill: z.number().min(1).max(20),
  salary: z.number().min(0),
  specialty: z.string().optional(),
  style: z.enum(['attacking', 'possession', 'defensive', 'balanced', 'direct', 'counter-attack']).optional(),
  happiness: z.number().min(0).max(100).optional(),
});

/**
 * Team Schema
 */
const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  players: z.array(PlayerSchema).min(11), // At least 11 players
  staff: z.array(StaffSchema),
  budget: z.number().min(0),
  tactics: TacticsSchema,
  philosophy: z.enum(['attacking', 'possession', 'defensive', 'balanced', 'direct', 'counter-attack']),
});

/**
 * Season Schema
 */
const SeasonSchema = z.object({
  year: z.number().int().positive(),
  currentWeek: z.number().int().min(1).max(52),
  totalWeeks: z.number().int().positive(),
  competitiveWeeks: z.number().int().positive(),
  preSeasonWeeks: z.number().int().positive(),
  status: z.enum(['in-progress', 'completed']),
  phase: z.enum(['pre-season', 'competitive', 'off-season']),
  transferWindow: z.enum(['open', 'closed']),
});

/**
 * Match Weather Schema
 */
const MatchWeatherSchema = z.object({
  condition: z.enum(['sunny', 'cloudy', 'rainy', 'foggy', 'snowy']),
  temperature: z.number(),
  description: z.string(),
});

/**
 * Match Stats Schema
 */
const MatchStatsSchema = z.object({
  possession: z.object({ home: z.number().min(0).max(100), away: z.number().min(0).max(100) }),
  shots: z.object({ home: z.number().int().min(0), away: z.number().int().min(0) }),
  shotsOnTarget: z.object({ home: z.number().int().min(0), away: z.number().int().min(0) }),
  corners: z.object({ home: z.number().int().min(0), away: z.number().int().min(0) }),
  fouls: z.object({ home: z.number().int().min(0), away: z.number().int().min(0) }),
});

/**
 * Match Result Schema
 */
const MatchResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  result: z.enum(['home', 'away', 'draw']),
  homeGoalScorers: z.array(z.string()).optional(),
  awayGoalScorers: z.array(z.string()).optional(),
  events: z.array(z.any()).optional(),
  attendance: z.number().optional(),
  weather: MatchWeatherSchema,
  stats: MatchStatsSchema,
  playerRatings: z.array(z.any()),
  manOfMatch: z.any().nullable(),
  isDerby: z.boolean(),
  postMatchAnalysis: z.any(),
  // Additional fields for when embedded in fixtures
  homeTeamId: z.string().optional(),
  awayTeamId: z.string().optional(),
  fixtureId: z.string().optional(),
});

/**
 * Team Finances Schema
 */
const TeamFinancesSchema = z.object({
  budget: z.number(),
  weeklyIncome: z.number(),
  weeklyExpenses: z.number(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  transactions: z.array(z.any()),
});

/**
 * GameState Schema (V2)
 */
const GameStateSchema = z.object({
  version: z.literal(2),
  id: z.string().min(1),
  createdAt: z.date(),
  lastSaved: z.date(),
  playerTeam: TeamSchema,
  aiTeams: z.array(TeamSchema).min(1),
  season: SeasonSchema,
  fixtures: z.array(z.any()),
  leagueTable: z.array(z.any()),
  finances: TeamFinancesSchema,
  matchHistory: z.array(MatchResultSchema),
  transferMarket: z.array(z.any()),
  staffMarket: z.array(StaffSchema),
  freeAgents: z.array(z.any()),
  boardStatus: z.any(),
  seasonRecords: z.array(z.any()),
  clubRecords: z.any(),
  achievements: z.array(z.any()),
  seasonAwards: z.array(z.any()),
  newsFeed: z.array(z.any()),
  matchPreviews: z.array(z.any()),
  cupCompetition: z.any().optional(),
  cupHistory: z.array(z.any()),
});

/**
 * Type Guard: Check if value is a valid Player
 */
export function isPlayer(value: unknown): value is Player {
  return PlayerSchema.safeParse(value).success;
}

/**
 * Type Guard: Check if value is a valid Team
 */
export function isTeam(value: unknown): value is Team {
  return TeamSchema.safeParse(value).success;
}

/**
 * Type Guard: Check if value is a valid MatchResult
 */
export function isMatchResult(value: unknown): value is MatchResult {
  return MatchResultSchema.safeParse(value).success;
}

/**
 * Type Guard: Check if value is a valid GameState
 */
export function isGameState(value: unknown): value is GameState {
  return GameStateSchema.safeParse(value).success;
}

/**
 * Type Guard: Check if value is a valid Season
 */
export function isSeason(value: unknown): value is Season {
  return SeasonSchema.safeParse(value).success;
}

/**
 * Validation Functions with Detailed Errors
 */

/**
 * Validate Player with detailed error reporting
 */
export function validatePlayer(value: unknown): ValidationResult<Player> {
  const result = PlayerSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as Player };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate Team with detailed error reporting
 */
export function validateTeam(value: unknown): ValidationResult<Team> {
  const result = TeamSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as Team };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate MatchResult with detailed error reporting
 */
export function validateMatchResult(value: unknown): ValidationResult<MatchResult> {
  const result = MatchResultSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as MatchResult };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate GameState with detailed error reporting
 */
export function validateGameState(value: unknown): ValidationResult<GameState> {
  const result = GameStateSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as GameState };
  }
  return { success: false, errors: result.error };
}

/**
 * Validation Helper: Format Zod errors for logging
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
}

/**
 * Assertion: Throw if value is not a valid Player
 */
export function assertPlayer(value: unknown, context = 'Unknown'): asserts value is Player {
  const result = validatePlayer(value);
  if (!result.success) {
    throw new Error(`Invalid Player in ${context}: ${formatValidationErrors(result.errors)}`);
  }
}

/**
 * Assertion: Throw if value is not a valid Team
 */
export function assertTeam(value: unknown, context = 'Unknown'): asserts value is Team {
  const result = validateTeam(value);
  if (!result.success) {
    throw new Error(`Invalid Team in ${context}: ${formatValidationErrors(result.errors)}`);
  }
}

/**
 * Assertion: Throw if value is not a valid GameState
 */
export function assertGameState(value: unknown, context = 'Unknown'): asserts value is GameState {
  const result = validateGameState(value);
  if (!result.success) {
    throw new Error(`Invalid GameState in ${context}: ${formatValidationErrors(result.errors)}`);
  }
}

/**
 * Export Zod schemas for advanced usage
 */
export const Schemas = {
  Player: PlayerSchema,
  Team: TeamSchema,
  MatchResult: MatchResultSchema,
  GameState: GameStateSchema,
  Season: SeasonSchema,
  Staff: StaffSchema,
  Tactics: TacticsSchema,
  TeamFinances: TeamFinancesSchema,
  MatchWeather: MatchWeatherSchema,
  MatchStats: MatchStatsSchema,
};
