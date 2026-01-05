/**
 * Testing Modules with Dependency Injection Examples
 *
 * This file demonstrates how to test Football Director Engine modules
 * using dependency injection and mocks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockMatchSimulator } from '../libs/football-director-engine/src/lib/factories/match-simulator.factory';
import { createMockTeamGenerator } from '../libs/football-director-engine/src/lib/factories/team-generator.factory';
import type {
  IInjuryManager,
  IMoraleManager,
  IPlayerStatsTracker,
  IStaffManager,
} from '../libs/football-director-engine/src/lib/interfaces';
import type { Team, Player, MatchResult } from '../libs/football-director-engine/src/lib/types';

/**
 * Example 1: Testing Match Simulator with Mocked Injury Manager
 *
 * This demonstrates how to test the MatchSimulator in isolation
 * by mocking its dependencies.
 */
describe('MatchSimulator with Mocked Dependencies', () => {
  it('should simulate a match without injuries when injury manager returns empty array', () => {
    // Arrange: Create mock injury manager
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([]),
      updateInjuries: vi.fn().mockImplementation(players => players),
      isPlayerAvailable: vi.fn().mockReturnValue(true),
    };

    // Create simulator with mocked dependency
    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager,
    });

    // Create test teams
    const homeTeam: Team = {
      name: 'Test Home FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    const awayTeam: Team = {
      name: 'Test Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Act: Simulate match
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    // Assert: Verify result and mock was called
    expect(result).toBeDefined();
    expect(result.homeTeam).toBe('Test Home FC');
    expect(result.awayTeam).toBe('Test Away FC');
    expect(result.injuries).toHaveLength(0);
    expect(mockInjuryManager.processInjuries).toHaveBeenCalled();
  });

  it('should include injuries when injury manager returns injuries', () => {
    // Arrange: Mock with injuries
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([
        {
          playerId: 'player-1',
          playerName: 'Test Player',
          type: 'muscle',
          severity: 'moderate',
          weeksOut: 2,
        },
      ]),
      updateInjuries: vi.fn(),
      isPlayerAvailable: vi.fn().mockReturnValue(true),
    };

    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager,
    });

    const homeTeam: Team = {
      name: 'Test Home FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    const awayTeam: Team = {
      name: 'Test Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Act
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    // Assert
    expect(result.injuries).toHaveLength(1);
    expect(result.injuries[0].playerName).toBe('Test Player');
    expect(result.injuries[0].weeksOut).toBe(2);
  });
});

/**
 * Example 2: Testing with Spy Functions
 *
 * Using spies to verify module interactions.
 */
describe('Module Interaction Testing', () => {
  it('should call morale manager when simulating match', () => {
    // Arrange: Create spy
    const mockMoraleManager: IMoraleManager = {
      calculateMorale: vi.fn().mockReturnValue(75),
      applyMoraleEffect: vi.fn().mockImplementation((rating, morale) => rating),
      updateTeamMorale: vi.fn().mockImplementation(players => players),
    };

    const simulator = createMockMatchSimulator({
      moraleManager: mockMoraleManager,
    });

    const homeTeam: Team = {
      name: 'Test Home FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    const awayTeam: Team = {
      name: 'Test Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Act
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    // Assert: Verify morale manager was called
    expect(mockMoraleManager.applyMoraleEffect).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});

/**
 * Example 3: Testing Team Generator with Mocked Stats Tracker
 *
 * Demonstrates testing team generation with mocked player stats.
 */
describe('TeamGenerator with Mocked Stats Tracker', () => {
  let mockStatsTracker: IPlayerStatsTracker;

  beforeEach(() => {
    mockStatsTracker = {
      recordMatch: vi.fn().mockImplementation(player => player),
      updateSeasonStats: vi.fn().mockImplementation(players => players),
      getCareerStats: vi.fn().mockReturnValue({
        totalGoals: 0,
        totalAssists: 0,
        totalAppearances: 0,
      }),
    };
  });

  it('should generate teams with players', () => {
    // Arrange
    const teamGenerator = createMockTeamGenerator({
      statsTracker: mockStatsTracker,
    });

    // Act
    const teams = teamGenerator.generateTeams(4, 'Test League');

    // Assert
    expect(teams).toHaveLength(4);
    teams.forEach(team => {
      expect(team.name).toBeDefined();
      expect(team.squad.length).toBeGreaterThan(0);
      expect(team.league).toBe('Test League');
    });
  });

  it('should generate players with valid attributes', () => {
    // Arrange
    const teamGenerator = createMockTeamGenerator({
      statsTracker: mockStatsTracker,
    });

    // Act
    const player = teamGenerator.generatePlayer('Test FC', 'ST', 85);

    // Assert
    expect(player.name).toBeDefined();
    expect(player.position).toBe('ST');
    expect(player.rating).toBeGreaterThanOrEqual(80);
    expect(player.rating).toBeLessThanOrEqual(90);
  });
});

/**
 * Example 4: Custom Mock Implementations
 *
 * Creating custom mock implementations for specific test scenarios.
 */
describe('Custom Mock Implementations', () => {
  it('should handle staff bonuses correctly', () => {
    // Arrange: Custom staff manager mock
    const mockStaffManager: IStaffManager = {
      hireStaff: vi.fn().mockReturnValue({
        staff: { id: 'staff-1', name: 'Test Coach', type: 'coach', level: 'elite', wage: 10000 },
        cost: 100000,
      }),
      fireStaff: vi.fn().mockReturnValue([]),
      calculateStaffBonus: vi.fn().mockImplementation((staff, type) => {
        // Custom logic: elite coaches give +10 bonus
        const eliteCoach = staff.find(s => s.type === 'coach' && s.level === 'elite');
        return eliteCoach ? 10 : 0;
      }),
    };

    const simulator = createMockMatchSimulator({
      staffManager: mockStaffManager,
    });

    // Create team with elite coach
    const homeTeam: Team = {
      name: 'Test FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
      staff: [{ id: 'staff-1', name: 'Elite Coach', type: 'coach', level: 'elite', wage: 10000 }],
    };

    const awayTeam: Team = {
      name: 'Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Act
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    // Assert
    expect(mockStaffManager.calculateStaffBonus).toHaveBeenCalledWith(homeTeam.staff, 'coach');
    expect(result).toBeDefined();
  });
});

/**
 * Example 5: Testing Error Scenarios
 *
 * Testing how modules handle edge cases and errors.
 */
describe('Error Handling', () => {
  it('should handle missing staff gracefully', () => {
    const mockStaffManager: IStaffManager = {
      hireStaff: vi.fn().mockReturnValue(null), // Hiring failed
      fireStaff: vi.fn(),
      calculateStaffBonus: vi.fn().mockReturnValue(0),
    };

    const simulator = createMockMatchSimulator({
      staffManager: mockStaffManager,
    });

    const homeTeam: Team = {
      name: 'Test FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    const awayTeam: Team = {
      name: 'Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Should not throw
    expect(() => {
      const result = simulator.simulateMatch(homeTeam, awayTeam, 10);
      expect(result).toBeDefined();
    }).not.toThrow();
  });
});

/**
 * Example 6: Integration Testing Pattern
 *
 * Testing multiple modules working together.
 */
describe('Integration Testing', () => {
  it('should integrate stats tracking with match simulation', () => {
    const mockStatsTracker: IPlayerStatsTracker = {
      recordMatch: vi.fn().mockImplementation(player => ({
        ...player,
        stats: {
          ...player.stats,
          appearances: (player.stats?.appearances || 0) + 1,
        },
      })),
      updateSeasonStats: vi.fn(),
      getCareerStats: vi.fn(),
    };

    const simulator = createMockMatchSimulator({
      statsTracker: mockStatsTracker,
    });

    const player: Player = {
      id: 'player-1',
      name: 'Test Player',
      position: 'ST',
      rating: 85,
      age: 25,
      contract: { years: 3, wage: 50000 },
      morale: 75,
      stats: { appearances: 0, goals: 0, assists: 0 },
    };

    const homeTeam: Team = {
      name: 'Test FC',
      league: 'Test League',
      squad: [player],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    const awayTeam: Team = {
      name: 'Away FC',
      league: 'Test League',
      squad: [],
      formation: '4-4-2',
      mentality: 'balanced',
    };

    // Act
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    // Assert
    expect(result).toBeDefined();
    // Stats tracker should be called during simulation
    expect(mockStatsTracker.recordMatch).toHaveBeenCalled();
  });
});
