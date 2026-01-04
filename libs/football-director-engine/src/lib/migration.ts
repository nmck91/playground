/**
 * Football Director Engine - Save Migration
 *
 * Handles migration of old save files to new formats when breaking changes occur.
 * Epic 1.5 - Story 1.5.3: Implement Discriminated Unions for Versioning
 */

import type {
  Player,
  Team,
  Tactics,
  PlayerRoles,
  TeamInstructions,
  SetPieceAssignments,
  PlayerContract,
  MatchResult,
  MatchWeather,
  MatchStats,
  PostMatchAnalysis,
} from './types';

import type {
  GameState,
  GameStateV1,
  GameStateV2,
} from './game-state-versions';

import {
  CURRENT_GAME_STATE_VERSION,
  isGameStateV1,
  isGameStateV2,
  getGameStateVersion,
} from './game-state-versions';

/**
 * Default values for newly required fields
 */

export function getDefaultPlayerRoles(): PlayerRoles {
  return {
    defenders: 'full-back',
    midfielders: 'box-to-box',
    forwards: 'poacher',
  };
}

export function getDefaultTeamInstructions(): TeamInstructions {
  return {
    tempo: 'balanced',
    width: 'balanced',
    pressing: 'medium',
    passingStyle: 'mixed',
  };
}

export function getDefaultSetPieces(players: Player[]): SetPieceAssignments {
  // Find best players by skill for set pieces
  const sortedBySkill = [...players].sort((a, b) => b.skill - a.skill);

  return {
    penaltyTaker: sortedBySkill[0]?.id || players[0]?.id || '',
    freeKickTaker: sortedBySkill[1]?.id || sortedBySkill[0]?.id || players[0]?.id || '',
    cornerTaker: sortedBySkill[2]?.id || sortedBySkill[0]?.id || players[0]?.id || '',
  };
}

export function getDefaultTactics(players: Player[]): Tactics {
  return {
    formation: '4-4-2',
    mentality: 'balanced',
    roles: getDefaultPlayerRoles(),
    instructions: getDefaultTeamInstructions(),
    setPieces: getDefaultSetPieces(players),
  };
}

export function getDefaultPlayerContract(
  player: Player,
  currentYear: number,
  currentWeek: number
): PlayerContract {
  // Generate a reasonable contract (3 years from now)
  const contractYears = 3;
  const expiryYear = currentYear + contractYears;

  return {
    weeklyWage: player.wages,
    startYear: currentYear,
    startWeek: currentWeek,
    expiryYear,
    expiryWeek: 52,
    yearsRemaining: contractYears,
    weeksRemaining: contractYears * 52 - currentWeek + 52,
    status: 'active',
  };
}

export function getDefaultPlayerMorale(): number {
  // Default to neutral morale
  return 75;
}

export function getDefaultFinances() {
  return {
    budget: 5000000,
    weeklyIncome: 0,
    weeklyExpenses: 0,
    totalIncome: 0,
    totalExpenses: 0,
    transactions: [],
  };
}

export function getDefaultClubRecords(season: number) {
  return {
    bestLeaguePosition: { position: 20, season },
    mostPoints: { points: 0, season },
    mostWins: { wins: 0, season },
    mostGoalsScored: { goals: 0, season },
    fewestGoalsConceded: { goals: 999, season },
    bestGoalDifference: { difference: -999, season },
    biggestWin: { opponent: 'N/A', score: '0-0', homeOrAway: 'home' as const, week: 1, season },
    longestWinStreak: { streak: 0, season },
    longestUnbeatenStreak: { streak: 0, season },
    mostGoalsSingleSeason: { playerId: '', playerName: 'N/A', goals: 0, season },
    mostAssistsSingleSeason: { playerId: '', playerName: 'N/A', assists: 0, season },
    mostCleanSheetsSeason: { cleanSheets: 0, season },
  };
}

export function getDefaultMatchWeather(): MatchWeather {
  return {
    condition: 'sunny',
    temperature: 20,
    description: 'Perfect conditions for football',
  };
}

export function getDefaultMatchStats(): MatchStats {
  return {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
  };
}

export function getDefaultPostMatchAnalysis(
  homeTeam: string,
  awayTeam: string
): PostMatchAnalysis {
  return {
    homeManagerQuote: {
      managerName: `${homeTeam} Manager`,
      teamName: homeTeam,
      quote: 'It was a competitive match. We gave our best.',
      sentiment: 'neutral',
    },
    awayManagerQuote: {
      managerName: `${awayTeam} Manager`,
      teamName: awayTeam,
      quote: 'We fought hard out there today.',
      sentiment: 'neutral',
    },
    keyStats: ['Match data unavailable for legacy fixtures'],
  };
}

/**
 * Migration Functions
 */

/**
 * Migrate a Player from v1 to v2
 * Adds contract and morale if missing
 */
export function migratePlayer(
  player: any,
  currentYear: number,
  currentWeek: number
): Player {
  return {
    ...player,
    contract: player.contract || getDefaultPlayerContract(player, currentYear, currentWeek),
    morale: player.morale ?? getDefaultPlayerMorale(),
  };
}

/**
 * Migrate a Team from v1 to v2
 * Adds tactics and philosophy if missing
 */
export function migrateTeam(
  team: any,
  currentYear: number,
  currentWeek: number
): Team {
  // Migrate players first
  const migratedPlayers = team.players.map((p: any) =>
    migratePlayer(p, currentYear, currentWeek)
  );

  // Handle tactics
  let tactics: Tactics;
  if (team.tactics) {
    // Partial tactics exist, fill in missing fields
    tactics = {
      formation: team.tactics.formation || '4-4-2',
      mentality: team.tactics.mentality || 'balanced',
      roles: team.tactics.roles || getDefaultPlayerRoles(),
      instructions: team.tactics.instructions || getDefaultTeamInstructions(),
      setPieces: team.tactics.setPieces || getDefaultSetPieces(migratedPlayers),
    };
  } else {
    // No tactics at all, create defaults
    tactics = getDefaultTactics(migratedPlayers);
  }

  return {
    ...team,
    players: migratedPlayers,
    tactics,
    philosophy: team.philosophy || 'balanced',
  };
}

/**
 * Migrate a MatchResult from v1 to v2
 * Adds match atmosphere fields if missing
 */
export function migrateMatchResult(result: any): MatchResult {
  return {
    ...result,
    weather: result.weather || getDefaultMatchWeather(),
    stats: result.stats || getDefaultMatchStats(),
    playerRatings: result.playerRatings || [],
    manOfMatch: result.manOfMatch || null,
    isDerby: result.isDerby ?? false,
    postMatchAnalysis: result.postMatchAnalysis ||
      getDefaultPostMatchAnalysis(result.homeTeam, result.awayTeam),
  };
}

/**
 * Main migration function: v1 → v2
 *
 * Handles migration of old save files to v2 format with required fields.
 * TypeScript enforces that input is V1 and output is V2.
 */
export function migrateGameStateV1toV2(oldState: GameStateV1): GameStateV2 {
  const currentYear = oldState.season?.year || 2025;
  const currentWeek = oldState.season?.currentWeek || 1;

  // Migrate teams
  const migratedPlayerTeam = migrateTeam(oldState.playerTeam, currentYear, currentWeek);
  const migratedAITeams = oldState.aiTeams.map((team: any) =>
    migrateTeam(team, currentYear, currentWeek)
  );

  // Migrate match history
  const migratedMatchHistory = (oldState.matchHistory || []).map(migrateMatchResult);

  // Migrate fixtures with results
  const migratedFixtures = (oldState.fixtures || []).map((fixture: any) => ({
    ...fixture,
    result: fixture.result ? migrateMatchResult(fixture.result) : undefined,
  }));

  return {
    version: 2, // Set to v2
    id: oldState.id,
    createdAt: oldState.createdAt,
    lastSaved: oldState.lastSaved,
    playerTeam: migratedPlayerTeam,
    aiTeams: migratedAITeams,
    season: oldState.season,
    fixtures: migratedFixtures,
    leagueTable: oldState.leagueTable || [],
    finances: oldState.finances || getDefaultFinances(),
    matchHistory: migratedMatchHistory,
    transferMarket: oldState.transferMarket || [],
    staffMarket: oldState.staffMarket || [],
    freeAgents: oldState.freeAgents || [],
    boardStatus: oldState.boardStatus || {
      satisfaction: 75,
      jobSecurity: 'safe' as const,
      currentObjective: null,
      objectiveHistory: [],
    },
    seasonRecords: oldState.seasonRecords || [],
    clubRecords: oldState.clubRecords || getDefaultClubRecords(currentYear),
    achievements: oldState.achievements || [],
    seasonAwards: oldState.seasonAwards || [],
    newsFeed: oldState.newsFeed || [],
    matchPreviews: oldState.matchPreviews || [], // Now required, default to empty array
    cupCompetition: oldState.cupCompetition, // Still optional
    cupHistory: oldState.cupHistory || [],
  };
}

/**
 * Detect save version and migrate if necessary
 *
 * Uses type guards to determine version and apply appropriate migrations.
 * Returns GameStateV2 (current version) after migration.
 */
export function migrateGameState(data: GameState): GameStateV2 {
  // Use type guard to check version
  if (isGameStateV1(data)) {
    console.log(`Migrating save file from v1 to v${CURRENT_GAME_STATE_VERSION}...`);
    return migrateGameStateV1toV2(data);
  }

  // Already at current version (v2)
  if (isGameStateV2(data)) {
    return data;
  }

  // This should never happen with proper discriminated unions
  throw new Error(`Unknown GameState version: ${getGameStateVersion(data)}`);
}

/**
 * Validate that a GameState has all required v2 fields
 *
 * Type guard that checks if a GameState is valid V2 format.
 */
export function validateGameStateV2(state: GameState): state is GameStateV2 {
  try {
    // Use type guard
    if (!isGameStateV2(state)) return false;

    // Check player team has required fields
    if (!state.playerTeam.tactics) return false;
    if (!state.playerTeam.philosophy) return false;
    if (!state.playerTeam.tactics.roles) return false;
    if (!state.playerTeam.tactics.instructions) return false;
    if (!state.playerTeam.tactics.setPieces) return false;

    // Check all players have required fields
    for (const player of state.playerTeam.players) {
      if (!player.contract) return false;
      if (player.morale === undefined || player.morale === null) return false;
    }

    // Check matchPreviews is an array (not undefined)
    if (!Array.isArray(state.matchPreviews)) return false;

    // All checks passed
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}
