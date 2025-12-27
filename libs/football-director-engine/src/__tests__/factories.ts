/**
 * Test Data Factories
 *
 * Provides factory functions for creating test data objects with sensible defaults.
 * Makes tests more readable and maintainable.
 */

import type {
  Player,
  Team,
  GameState,
  Season,
  Fixture,
  Staff,
  PlayerStats,
  TeamFinances,
} from '../lib/types';

/**
 * Create a mock player with default values
 * @param overrides - Partial player object to override defaults
 */
export function createMockPlayer(overrides: Partial<Player> = {}): Player {
  const defaults: Player = {
    id: `player-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Player',
    position: 'MID',
    skill: 10,
    age: 25,
    wages: 3000,
    stats: createMockPlayerStats(),
    history: [],
    morale: 75,
    contract: {
      weeklyWage: 3000,
      startYear: 2024,
      startWeek: 1,
      expiryYear: 2025,
      expiryWeek: 52,
      yearsRemaining: 1,
      weeksRemaining: 52,
      status: 'active',
    },
  };

  return { ...defaults, ...overrides };
}

/**
 * Create mock player stats with default values
 */
export function createMockPlayerStats(
  overrides: Partial<PlayerStats> = {}
): PlayerStats {
  const defaults: PlayerStats = {
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
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a mock team with default values
 * @param overrides - Partial team object to override defaults
 */
export function createMockTeam(overrides: Partial<Team> = {}): Team {
  const defaults: Team = {
    id: `team-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test FC',
    budget: 1000000,
    players: [
      createMockPlayer({ id: 'gk1', position: 'GK', skill: 10 }),
      createMockPlayer({ id: 'def1', position: 'DEF', skill: 10 }),
      createMockPlayer({ id: 'def2', position: 'DEF', skill: 10 }),
      createMockPlayer({ id: 'def3', position: 'DEF', skill: 10 }),
      createMockPlayer({ id: 'def4', position: 'DEF', skill: 10 }),
      createMockPlayer({ id: 'mid1', position: 'MID', skill: 10 }),
      createMockPlayer({ id: 'mid2', position: 'MID', skill: 10 }),
      createMockPlayer({ id: 'mid3', position: 'MID', skill: 10 }),
      createMockPlayer({ id: 'mid4', position: 'MID', skill: 10 }),
      createMockPlayer({ id: 'fwd1', position: 'FWD', skill: 10 }),
      createMockPlayer({ id: 'fwd2', position: 'FWD', skill: 10 }),
    ],
    staff: [],
    tactics: {
      formation: '4-4-2',
      mentality: 'balanced',
      // Story 1.5.2: Now required fields
      roles: {
        defenders: 'full-back',
        midfielders: 'box-to-box',
        forwards: 'poacher',
      },
      instructions: {
        tempo: 'balanced',
        width: 'balanced',
        pressing: 'medium',
        passingStyle: 'mixed',
      },
      setPieces: {
        cornerTaker: 'mid1',
        freeKickTaker: 'mid2',
        penaltyTaker: 'fwd1',
      },
    },
    philosophy: 'balanced', // Story 1.5.2: Now required field
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a strong team (high skill players)
 */
export function createStrongTeam(overrides: Partial<Team> = {}): Team {
  return createMockTeam({
    name: 'Strong FC',
    players: [
      createMockPlayer({ id: 'gk1', position: 'GK', skill: 18 }),
      createMockPlayer({ id: 'def1', position: 'DEF', skill: 17 }),
      createMockPlayer({ id: 'def2', position: 'DEF', skill: 17 }),
      createMockPlayer({ id: 'def3', position: 'DEF', skill: 16 }),
      createMockPlayer({ id: 'def4', position: 'DEF', skill: 16 }),
      createMockPlayer({ id: 'mid1', position: 'MID', skill: 18 }),
      createMockPlayer({ id: 'mid2', position: 'MID', skill: 17 }),
      createMockPlayer({ id: 'mid3', position: 'MID', skill: 16 }),
      createMockPlayer({ id: 'mid4', position: 'MID', skill: 15 }),
      createMockPlayer({ id: 'fwd1', position: 'FWD', skill: 19 }),
      createMockPlayer({ id: 'fwd2', position: 'FWD', skill: 18 }),
    ],
    ...overrides,
  });
}

/**
 * Create a weak team (low skill players)
 */
export function createWeakTeam(overrides: Partial<Team> = {}): Team {
  return createMockTeam({
    name: 'Weak United',
    players: [
      createMockPlayer({ id: 'gk1', position: 'GK', skill: 5 }),
      createMockPlayer({ id: 'def1', position: 'DEF', skill: 4 }),
      createMockPlayer({ id: 'def2', position: 'DEF', skill: 5 }),
      createMockPlayer({ id: 'def3', position: 'DEF', skill: 4 }),
      createMockPlayer({ id: 'def4', position: 'DEF', skill: 5 }),
      createMockPlayer({ id: 'mid1', position: 'MID', skill: 6 }),
      createMockPlayer({ id: 'mid2', position: 'MID', skill: 5 }),
      createMockPlayer({ id: 'mid3', position: 'MID', skill: 5 }),
      createMockPlayer({ id: 'mid4', position: 'MID', skill: 4 }),
      createMockPlayer({ id: 'fwd1', position: 'FWD', skill: 6 }),
      createMockPlayer({ id: 'fwd2', position: 'FWD', skill: 5 }),
    ],
    ...overrides,
  });
}

/**
 * Create mock season data
 */
export function createMockSeason(overrides: Partial<Season> = {}): Season {
  const defaults: Season = {
    year: 2024,
    currentWeek: 8,
    totalWeeks: 52,
    competitiveWeeks: 38,
    preSeasonWeeks: 7,
    status: 'in-progress',
    phase: 'competitive',
    transferWindow: 'closed',
  };

  return { ...defaults, ...overrides };
}

/**
 * Create mock fixture
 */
export function createMockFixture(overrides: Partial<Fixture> = {}): Fixture {
  const defaults: Fixture = {
    id: `fixture-${Math.random().toString(36).substr(2, 9)}`,
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    week: 8,
    played: false,
    matchType: 'competitive',
  };

  return { ...defaults, ...overrides };
}

/**
 * Create mock finances
 */
export function createMockFinances(overrides: Partial<TeamFinances> = {}): TeamFinances {
  const defaults: TeamFinances = {
    budget: 1000000,
    weeklyIncome: 50000,
    weeklyExpenses: 30000,
    totalIncome: 0,
    totalExpenses: 0,
    transactions: [],
  };

  return { ...defaults, ...overrides };
}

/**
 * Create mock staff member
 */
export function createMockStaff(overrides: Partial<Staff> = {}): Staff {
  const defaults: Staff = {
    id: `staff-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Coach',
    role: 'manager',
    skill: 10,
    salary: 5000,
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a minimal mock GameState for testing
 * Note: For full GameState, use createFullMockGameState
 */
export function createMockGameState(
  overrides: Partial<GameState> = {}
): Partial<GameState> {
  const defaults: Partial<GameState> = {
    id: `game-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    lastSaved: new Date(),
    playerTeam: createMockTeam({ name: 'Player FC' }),
    aiTeams: [
      createMockTeam({ id: 'ai-1', name: 'AI Team 1' }),
      createMockTeam({ id: 'ai-2', name: 'AI Team 2' }),
    ],
    season: createMockSeason(),
    fixtures: [],
    leagueTable: [],
    finances: createMockFinances(),
    matchHistory: [],
    transferMarket: [],
    staffMarket: [],
    freeAgents: [],
  };

  return { ...defaults, ...overrides };
}
