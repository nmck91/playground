/**
 * Football Director Engine - Game State Version Discriminated Unions
 *
 * Epic 1.5 - Story 1.5.3: Implement Discriminated Unions for Versioning
 *
 * This file defines type-safe versioned GameState structures using discriminated unions.
 * Each version is explicitly typed, and TypeScript enforces correct migration paths.
 */

import type {
  GameState as BaseGameState,
  Team,
  Season,
  Fixture,
  LeagueTable,
  TeamFinances,
  MatchResult,
  TransferListing,
  Staff,
  FreeAgent,
  BoardStatus,
  SeasonRecords,
  ClubRecords,
  Achievement,
  SeasonAward,
  NewsArticle,
  MatchPreview,
  CupCompetition,
} from './types';

/**
 * Current GameState version constant
 * Update this when adding a new version
 */
export const CURRENT_GAME_STATE_VERSION = 2;

/**
 * GameState Version 1 (Original)
 *
 * Characteristics:
 * - No version field (implicit v1)
 * - Many fields optional (migration artifacts)
 * - Player.contract optional
 * - Player.morale optional
 * - Team.tactics optional
 * - Team.philosophy optional
 * - MatchResult missing atmosphere fields
 */
export interface GameStateV1 {
  // No version field in v1 (or version: 1)
  version?: 1;
  id: string;
  createdAt: Date;
  lastSaved: Date;

  // Core game data
  playerTeam: Team; // With optional fields
  aiTeams: Team[]; // With optional fields
  season: Season;
  fixtures: Fixture[];
  leagueTable: LeagueTable[];

  // Optional fields (may be missing in v1)
  finances?: TeamFinances;
  matchHistory?: MatchResult[];
  transferMarket?: TransferListing[];
  staffMarket?: Staff[];
  freeAgents?: FreeAgent[];
  boardStatus?: BoardStatus;
  seasonRecords?: SeasonRecords[];
  clubRecords?: ClubRecords;
  achievements?: Achievement[];
  seasonAwards?: SeasonAward[];
  newsFeed?: NewsArticle[];
  matchPreviews?: MatchPreview[];
  cupCompetition?: CupCompetition;
  cupHistory?: CupCompetition[];
}

/**
 * GameState Version 2 (Current)
 *
 * This is the current GameState structure, imported from types.ts
 * with the version field constrained to 2.
 *
 * Characteristics:
 * - Explicit version: 2 field
 * - All previously optional fields now required (except truly optional ones)
 * - Player.contract required
 * - Player.morale required
 * - Team.tactics required
 * - Team.philosophy required
 * - MatchResult has atmosphere fields (weather, stats, ratings, etc.)
 * - matchPreviews required (array, can be empty)
 */
export type GameStateV2 = Omit<BaseGameState, 'version'> & {
  version: 2; // Discriminant field - must be 2
};

/**
 * GameState Union Type
 *
 * Use this type for functions that accept any version of GameState.
 * TypeScript will enforce type narrowing via discriminant (version field).
 */
export type GameState = GameStateV1 | GameStateV2;

/**
 * Type guard: Check if GameState is version 1
 */
export function isGameStateV1(state: GameState): state is GameStateV1 {
  return !state.version || state.version === 1;
}

/**
 * Type guard: Check if GameState is version 2
 */
export function isGameStateV2(state: GameState): state is GameStateV2 {
  return state.version === 2;
}

/**
 * Get the version number of a GameState
 */
export function getGameStateVersion(state: GameState): 1 | 2 {
  return state.version || 1; // Default to v1 if no version field
}

/**
 * Assert that a GameState is the current version
 * Throws if not current version
 */
export function assertCurrentVersion(state: GameState): asserts state is GameStateV2 {
  if (!isGameStateV2(state)) {
    throw new Error(
      `GameState version mismatch: expected v${CURRENT_GAME_STATE_VERSION}, got v${getGameStateVersion(state)}`
    );
  }
}
