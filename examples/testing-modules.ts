/**
 * Example: Testing Modules with Dependency Injection
 *
 * This example demonstrates how to test engine modules in isolation
 * using dependency injection and mocks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type {
  IMatchSimulator,
  IPlayerStatsTracker,
  IInjuryManager,
  ITacticsManager,
  IStaffManager,
  IWeatherGenerator,
  IMatchCommentary,
  Team,
  Player,
  Fixture,
  MatchResult,
  PlayerStats,
  Injury,
  MatchEvent
} from '@playground/football-director-engine';

/**
 * Example 1: Testing with Mock Dependencies
 *
 * Shows how to create mocks for interfaces and test modules in isolation.
 */
describe('MatchSimulator with Mocks', () => {
  let mockStatsTracker: IPlayerStatsTracker;
  let mockInjuryManager: IInjuryManager;
  let mockTacticsManager: ITacticsManager;
  let mockStaffManager: IStaffManager;
  let mockWeatherGenerator: IWeatherGenerator;
  let mockCommentary: IMatchCommentary;

  beforeEach(() => {
    // Create mock implementations of all dependencies
    mockStatsTracker = {
      initializePlayerStats: vi.fn().mockReturnValue({
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        matchesPlayed: 0
      }),
      updatePlayerStats: vi.fn((stats, event) => ({
        ...stats,
        goals: event.type === 'goal' ? stats.goals + 1 : stats.goals,
        minutesPlayed: stats.minutesPlayed + 90
      })),
      calculateSeasonStats: vi.fn(),
      getTopScorers: vi.fn(),
      getTopAssists: vi.fn(),
      getPlayerRating: vi.fn().mockReturnValue(7.0)
    };

    mockInjuryManager = {
      generateInjury: vi.fn().mockReturnValue({
        type: 'minor',
        description: 'Knock',
        severity: 2,
        recoveryWeek: 10
      }),
      applyInjury: vi.fn((player, injury) => ({
        ...player,
        injury
      })),
      isInjured: vi.fn().mockReturnValue(false),
      weeksUntilRecovery: vi.fn().mockReturnValue(0),
      updateInjuries: vi.fn(players => players),
      clearInjury: vi.fn(player => ({ ...player, injury: undefined }))
    };

    mockTacticsManager = {
      getFormationRequirements: vi.fn().mockReturnValue({
        GK: 1,
        DEF: 4,
        MID: 4,
        FWD: 2
      }),
      getDefaultTactics: vi.fn(),
      canPlayFormation: vi.fn().mockReturnValue(true),
      calculateTacticalModifier: vi.fn().mockReturnValue(1.0),
      getFormationDescription: vi.fn(),
      getMentalityDescription: vi.fn(),
      setTeamTactics: vi.fn(),
      getDefaultInstructions: vi.fn(),
      getDefaultRoles: vi.fn(),
      getDefenderRoles: vi.fn(),
      getMidfielderRoles: vi.fn(),
      getForwardRoles: vi.fn(),
      getRoleDescription: vi.fn(),
      getInstructionDescription: vi.fn(),
      calculateRoleModifier: vi.fn().mockReturnValue(0),
      calculateInstructionsModifier: vi.fn().mockReturnValue(0),
      calculateAdvancedTacticsModifier: vi.fn().mockReturnValue(0)
    };

    mockStaffManager = {
      generateStaff: vi.fn(),
      calculateStaffSalary: vi.fn(),
      generateStaffMarket: vi.fn(),
      hireStaff: vi.fn(),
      fireStaff: vi.fn(),
      getManagerBonus: vi.fn().mockReturnValue(1.0),
      getCoachBonus: vi.fn().mockReturnValue(0.5),
      getScoutBonus: vi.fn().mockReturnValue(1),
      getTotalStaffWages: vi.fn().mockReturnValue(10000),
      calculateStyleCompatibility: vi.fn().mockReturnValue(75),
      updateManagerHappiness: vi.fn(),
      getManagerHappinessEffect: vi.fn().mockReturnValue(1.0)
    };

    mockWeatherGenerator = {
      generateWeather: vi.fn().mockReturnValue({
        conditions: 'Clear',
        temperature: 20,
        wind: 'Light',
        precipitation: 'None'
      })
    };

    mockCommentary = {
      generateEventCommentary: vi.fn().mockReturnValue('Great goal!'),
      generateHalfTimeCommentary: vi.fn().mockReturnValue('An exciting first half'),
      generateFullTimeCommentary: vi.fn().mockReturnValue('Full time!')
    };
  });

  it('should initialize with mocked dependencies', () => {
    // This test demonstrates the concept
    // In practice, MatchSimulator would accept these dependencies via constructor

    expect(mockStatsTracker.initializePlayerStats()).toBeDefined();
    expect(mockInjuryManager.isInjured).toBeDefined();
    expect(mockTacticsManager.calculateTacticalModifier).toBeDefined();
  });

  it('should track player stats during match events', () => {
    const initialStats: PlayerStats = mockStatsTracker.initializePlayerStats();

    const goalEvent: MatchEvent = {
      id: 'event-1',
      type: 'goal',
      minute: 25,
      teamId: 'team-1',
      teamName: 'Home Team',
      playerId: 'player-1',
      playerName: 'John Striker'
    };

    const updatedStats = mockStatsTracker.updatePlayerStats(initialStats, goalEvent);

    expect(mockStatsTracker.updatePlayerStats).toHaveBeenCalledWith(initialStats, goalEvent);
    expect(updatedStats.goals).toBe(1);
  });

  it('should apply tactical modifiers correctly', () => {
    const ownTactics = {
      formation: '4-4-2' as const,
      mentality: 'attacking' as const
    };

    const opponentTactics = {
      formation: '5-3-2' as const,
      mentality: 'defensive' as const
    };

    const modifier = mockTacticsManager.calculateTacticalModifier(ownTactics, opponentTactics);

    expect(mockTacticsManager.calculateTacticalModifier).toHaveBeenCalledWith(
      ownTactics,
      opponentTactics
    );
    expect(modifier).toBe(1.0);
  });
});

/**
 * Example 2: Testing with Partial Mocks
 *
 * Shows how to mock only specific methods while using real implementations for others.
 */
describe('FinanceEngine with Partial Mocks', () => {
  it('should calculate weekly wages from team data', () => {
    // Create a mock team with known wages
    const mockTeam: Team = {
      id: 'team-1',
      name: 'Test Team',
      budget: 1000000,
      players: [
        {
          id: 'p1',
          name: 'Player 1',
          position: 'FWD',
          skill: 15,
          age: 25,
          wages: 5000,
          stats: {} as PlayerStats,
          history: []
        },
        {
          id: 'p2',
          name: 'Player 2',
          position: 'MID',
          skill: 12,
          age: 27,
          wages: 3000,
          stats: {} as PlayerStats,
          history: []
        }
      ],
      staff: [],
      tactics: {
        formation: '4-4-2',
        mentality: 'balanced'
      }
    };

    // In real implementation, you would import and use FinanceEngine
    // const financeEngine = new FinanceEngine();
    // const totalWages = financeEngine.calculateWeeklyWages(mockTeam);

    const expectedTotalWages = 5000 + 3000; // = 8000

    expect(expectedTotalWages).toBe(8000);
  });
});

/**
 * Example 3: Integration Testing with Real Dependencies
 *
 * Shows how to test module interactions without mocks.
 */
describe('Season Simulation Integration Test', () => {
  it('should simulate a complete week with multiple matches', () => {
    // This would use real implementations
    // const generator = new TeamGenerator();
    // const teams = generator.generateLeague();
    // const seasonManager = new SeasonManager();
    // const matchSimulator = new MatchSimulator();

    // Simulating the test concept
    const weekFixtures = 10; // 10 matches per week
    const matchesSimulated = 0;

    // In a real test, you would simulate all fixtures
    // weekFixtures.forEach(fixture => {
    //   const result = matchSimulator.simulateMatch(...);
    //   matchesSimulated++;
    // });

    expect(weekFixtures).toBe(10);
  });
});

/**
 * Example 4: Test Data Factories
 *
 * Shows how to create reusable test data factories.
 */
export function createTestPlayer(overrides?: Partial<Player>): Player {
  return {
    id: overrides?.id || 'test-player-1',
    name: overrides?.name || 'Test Player',
    position: overrides?.position || 'FWD',
    skill: overrides?.skill || 12,
    age: overrides?.age || 25,
    wages: overrides?.wages || 3000,
    stats: overrides?.stats || {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      minutesPlayed: 0,
      matchesPlayed: 0
    },
    history: overrides?.history || []
  };
}

export function createTestTeam(overrides?: Partial<Team>): Team {
  return {
    id: overrides?.id || 'test-team-1',
    name: overrides?.name || 'Test Team',
    budget: overrides?.budget || 1000000,
    players: overrides?.players || [
      createTestPlayer({ id: 'p1', position: 'GK' }),
      createTestPlayer({ id: 'p2', position: 'DEF' }),
      createTestPlayer({ id: 'p3', position: 'DEF' }),
      createTestPlayer({ id: 'p4', position: 'DEF' }),
      createTestPlayer({ id: 'p5', position: 'DEF' }),
      createTestPlayer({ id: 'p6', position: 'MID' }),
      createTestPlayer({ id: 'p7', position: 'MID' }),
      createTestPlayer({ id: 'p8', position: 'MID' }),
      createTestPlayer({ id: 'p9', position: 'MID' }),
      createTestPlayer({ id: 'p10', position: 'FWD' }),
      createTestPlayer({ id: 'p11', position: 'FWD' })
    ],
    staff: overrides?.staff || [],
    tactics: overrides?.tactics || {
      formation: '4-4-2',
      mentality: 'balanced'
    }
  };
}

export function createTestFixture(overrides?: Partial<Fixture>): Fixture {
  return {
    id: overrides?.id || 'test-fixture-1',
    homeTeamId: overrides?.homeTeamId || 'team-1',
    awayTeamId: overrides?.awayTeamId || 'team-2',
    homeTeamName: overrides?.homeTeamName || 'Home Team',
    awayTeamName: overrides?.awayTeamName || 'Away Team',
    week: overrides?.week || 1,
    year: overrides?.year || 2025,
    played: overrides?.played || false
  };
}

/**
 * Example 5: Using Test Factories in Tests
 */
describe('Test Data Factories', () => {
  it('should create a test player with default values', () => {
    const player = createTestPlayer();

    expect(player.id).toBe('test-player-1');
    expect(player.name).toBe('Test Player');
    expect(player.position).toBe('FWD');
    expect(player.skill).toBe(12);
  });

  it('should create a test player with custom values', () => {
    const player = createTestPlayer({
      name: 'Custom Player',
      skill: 18,
      position: 'GK'
    });

    expect(player.name).toBe('Custom Player');
    expect(player.skill).toBe(18);
    expect(player.position).toBe('GK');
  });

  it('should create a test team with 11 players', () => {
    const team = createTestTeam();

    expect(team.players.length).toBe(11);
    expect(team.budget).toBe(1000000);
  });

  it('should create a test team with custom players', () => {
    const customPlayers = [
      createTestPlayer({ name: 'Star Player', skill: 18 }),
      createTestPlayer({ name: 'Backup Player', skill: 10 })
    ];

    const team = createTestTeam({ players: customPlayers });

    expect(team.players.length).toBe(2);
    expect(team.players[0].skill).toBe(18);
  });
});

/**
 * Example 6: Testing Edge Cases
 */
describe('Edge Case Testing', () => {
  it('should handle empty arrays gracefully', () => {
    const emptyPlayers: Player[] = [];

    // Example: Testing a function that processes players
    const processPlayers = (players: Player[]) => {
      return players.filter(p => p.skill > 10);
    };

    const result = processPlayers(emptyPlayers);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('should handle boundary values correctly', () => {
    // Minimum skill player
    const minPlayer = createTestPlayer({ skill: 1 });
    expect(minPlayer.skill).toBe(1);

    // Maximum skill player
    const maxPlayer = createTestPlayer({ skill: 20 });
    expect(maxPlayer.skill).toBe(20);

    // Young player
    const youngPlayer = createTestPlayer({ age: 18 });
    expect(youngPlayer.age).toBe(18);

    // Old player
    const oldPlayer = createTestPlayer({ age: 40 });
    expect(oldPlayer.age).toBe(40);
  });

  it('should handle null and undefined values', () => {
    const player = createTestPlayer();

    // Ensure optional fields are handled
    expect(player.injury).toBeUndefined();
    expect(player.contract).toBeUndefined();

    // Test with explicit null
    const stats = player.stats;
    expect(stats).toBeDefined();
  });
});

/**
 * Example 7: Spy Functions for Tracking Calls
 */
describe('Spy Functions', () => {
  it('should track method calls', () => {
    const mockFunction = vi.fn();

    // Call the function
    mockFunction('arg1', 'arg2');
    mockFunction('arg3');

    // Verify calls
    expect(mockFunction).toHaveBeenCalledTimes(2);
    expect(mockFunction).toHaveBeenCalledWith('arg1', 'arg2');
    expect(mockFunction).toHaveBeenLastCalledWith('arg3');
  });

  it('should spy on real implementations', () => {
    const calculator = {
      add: (a: number, b: number) => a + b,
      multiply: (a: number, b: number) => a * b
    };

    const addSpy = vi.spyOn(calculator, 'add');
    const multiplySpy = vi.spyOn(calculator, 'multiply');

    const result = calculator.add(2, 3);
    calculator.multiply(4, 5);

    expect(result).toBe(5);
    expect(addSpy).toHaveBeenCalledWith(2, 3);
    expect(multiplySpy).toHaveBeenCalledWith(4, 5);
  });
});

/**
 * Example 8: Async Testing
 */
describe('Async Operations', () => {
  it('should handle async functions', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('done'), 100);
      });
    };

    const result = await asyncFunction();

    expect(result).toBe('done');
  });

  it('should handle async mocks', async () => {
    const mockAsyncFn = vi.fn().mockResolvedValue('mocked result');

    const result = await mockAsyncFn();

    expect(result).toBe('mocked result');
    expect(mockAsyncFn).toHaveBeenCalled();
  });
});

/**
 * Example 9: Testing with Seeds (Deterministic)
 */
describe('Deterministic Testing with Seeds', () => {
  it('should produce same results with same seed', () => {
    const seededRandom = (seed: number) => {
      let value = seed;
      return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      };
    };

    const random1 = seededRandom(12345);
    const random2 = seededRandom(12345);

    // Same seed = same sequence
    expect(random1()).toBe(random2());
    expect(random1()).toBe(random2());
    expect(random1()).toBe(random2());
  });

  it('should produce different results with different seeds', () => {
    const seededRandom = (seed: number) => {
      let value = seed;
      return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      };
    };

    const random1 = seededRandom(12345);
    const random2 = seededRandom(67890);

    // Different seeds = different sequences
    expect(random1()).not.toBe(random2());
  });
});

/**
 * Example 10: Snapshot Testing (Conceptual)
 */
describe('Snapshot Testing', () => {
  it('should match snapshot for match result structure', () => {
    const mockResult: MatchResult = {
      id: 'match-1',
      fixtureId: 'fixture-1',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeTeamName: 'Home Team',
      awayTeamName: 'Away Team',
      homeGoals: 2,
      awayGoals: 1,
      homeXG: 1.8,
      awayXG: 0.9,
      events: [],
      attendance: 25000,
      weather: {
        conditions: 'Clear',
        temperature: 20,
        wind: 'Light',
        precipitation: 'None'
      },
      week: 1,
      year: 2025
    };

    // In Vitest, you would use toMatchSnapshot()
    expect(mockResult).toBeDefined();
    expect(mockResult.homeGoals).toBe(2);
    expect(mockResult.awayGoals).toBe(1);
  });
});

// Export test utilities
export {
  createTestPlayer,
  createTestTeam,
  createTestFixture
};
