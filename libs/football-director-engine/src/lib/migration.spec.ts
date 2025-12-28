/**
 * Football Director Engine - Migration Tests
 * Epic 1.5 - Story 1.5.2: Convert Optional Fields to Required
 */

import { describe, it, expect } from 'vitest';
import {
  migratePlayer,
  migrateTeam,
  migrateMatchResult,
  migrateGameStateV1toV2,
  migrateGameState,
  validateGameStateV2,
  getDefaultPlayerContract,
  getDefaultPlayerMorale,
  getDefaultTactics,
  getDefaultPostMatchAnalysis,
} from './migration';
import type { Player, Team, MatchResult } from './types';
import type { GameStateV1, GameStateV2 } from './game-state-versions';

describe('Migration - Default Value Generators', () => {
  describe('getDefaultPlayerContract', () => {
    it('should create valid contract with proper expiry', () => {
      const player = {
        id: 'p1',
        name: 'Test Player',
        wages: 50000,
      } as Player;

      const contract = getDefaultPlayerContract(player, 2025, 10);

      expect(contract.weeklyWage).toBe(50000);
      expect(contract.startYear).toBe(2025);
      expect(contract.startWeek).toBe(10);
      expect(contract.expiryYear).toBe(2028); // 3 years later
      expect(contract.status).toBe('active');
      expect(contract.yearsRemaining).toBe(3);
    });
  });

  describe('getDefaultPlayerMorale', () => {
    it('should return neutral morale of 75', () => {
      expect(getDefaultPlayerMorale()).toBe(75);
    });
  });

  describe('getDefaultTactics', () => {
    it('should create valid tactics with all required fields', () => {
      const players = [
        { id: 'p1', skill: 18 },
        { id: 'p2', skill: 16 },
        { id: 'p3', skill: 15 },
      ] as Player[];

      const tactics = getDefaultTactics(players);

      expect(tactics.formation).toBe('4-4-2');
      expect(tactics.mentality).toBe('balanced');
      expect(tactics.roles).toBeDefined();
      expect(tactics.instructions).toBeDefined();
      expect(tactics.setPieces).toBeDefined();
      expect(tactics.setPieces.penaltyTaker).toBe('p1'); // Best player
    });
  });

  describe('getDefaultPostMatchAnalysis', () => {
    it('should create valid post-match analysis', () => {
      const analysis = getDefaultPostMatchAnalysis('Arsenal', 'Chelsea');

      expect(analysis.homeManagerQuote.teamName).toBe('Arsenal');
      expect(analysis.awayManagerQuote.teamName).toBe('Chelsea');
      expect(analysis.keyStats).toHaveLength(1);
    });
  });
});

describe('Migration - Player Migration', () => {
  it('should add contract to player without one', () => {
    const oldPlayer = {
      id: 'p1',
      name: 'John Doe',
      position: 'FWD',
      skill: 15,
      age: 25,
      wages: 50000,
      stats: {
        appearances: 10,
        goals: 5,
        assists: 3,
        cleanSheets: 0,
        yellowCards: 1,
        redCards: 0,
        careerAppearances: 10,
        careerGoals: 5,
        careerAssists: 3,
        careerCleanSheets: 0,
      },
      history: [],
    } as any;

    const migrated = migratePlayer(oldPlayer, 2025, 10);

    expect(migrated.contract).toBeDefined();
    expect(migrated.contract.weeklyWage).toBe(50000);
    expect(migrated.contract.startYear).toBe(2025);
  });

  it('should add morale to player without one', () => {
    const oldPlayer = {
      id: 'p1',
      name: 'Jane Doe',
      wages: 50000,
    } as any;

    const migrated = migratePlayer(oldPlayer, 2025, 10);

    expect(migrated.morale).toBe(75); // Default neutral morale
  });

  it('should preserve existing contract and morale', () => {
    const oldPlayer = {
      id: 'p1',
      name: 'Existing Player',
      wages: 50000,
      contract: {
        weeklyWage: 50000,
        startYear: 2024,
        startWeek: 1,
        expiryYear: 2027,
        expiryWeek: 52,
        yearsRemaining: 2,
        weeksRemaining: 100,
        status: 'active' as const,
      },
      morale: 85,
    } as any;

    const migrated = migratePlayer(oldPlayer, 2025, 10);

    expect(migrated.contract.startYear).toBe(2024); // Preserved
    expect(migrated.morale).toBe(85); // Preserved
  });
});

describe('Migration - Team Migration', () => {
  it('should add tactics to team without them', () => {
    const oldTeam = {
      id: 't1',
      name: 'Test FC',
      budget: 5000000,
      players: [
        { id: 'p1', skill: 18, wages: 50000 },
        { id: 'p2', skill: 16, wages: 40000 },
      ],
      staff: [],
    } as any;

    const migrated = migrateTeam(oldTeam, 2025, 10);

    expect(migrated.tactics).toBeDefined();
    expect(migrated.tactics.formation).toBe('4-4-2');
    expect(migrated.tactics.roles).toBeDefined();
    expect(migrated.tactics.instructions).toBeDefined();
    expect(migrated.tactics.setPieces).toBeDefined();
  });

  it('should add philosophy to team without one', () => {
    const oldTeam = {
      id: 't1',
      name: 'Test FC',
      players: [],
      staff: [],
    } as any;

    const migrated = migrateTeam(oldTeam, 2025, 10);

    expect(migrated.philosophy).toBe('balanced');
  });

  it('should migrate all players in team', () => {
    const oldTeam = {
      id: 't1',
      name: 'Test FC',
      budget: 5000000,
      players: [
        { id: 'p1', skill: 18, wages: 50000 },
        { id: 'p2', skill: 16, wages: 40000 },
      ],
      staff: [],
    } as any;

    const migrated = migrateTeam(oldTeam, 2025, 10);

    expect(migrated.players).toHaveLength(2);
    expect(migrated.players[0].contract).toBeDefined();
    expect(migrated.players[0].morale).toBe(75);
    expect(migrated.players[1].contract).toBeDefined();
    expect(migrated.players[1].morale).toBe(75);
  });
});

describe('Migration - MatchResult Migration', () => {
  it('should add weather to match without it', () => {
    const oldResult = {
      id: 'm1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 2,
      awayScore: 1,
      week: 5,
      year: 2025,
      matchType: 'competitive' as const,
    } as any;

    const migrated = migrateMatchResult(oldResult);

    expect(migrated.weather).toBeDefined();
    expect(migrated.weather.condition).toBe('sunny');
  });

  it('should add stats to match without them', () => {
    const oldResult = {
      id: 'm1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 2,
      awayScore: 1,
    } as any;

    const migrated = migrateMatchResult(oldResult);

    expect(migrated.stats).toBeDefined();
    expect(migrated.stats.possession).toBeDefined();
  });

  it('should add post-match analysis', () => {
    const oldResult = {
      id: 'm1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 2,
      awayScore: 1,
    } as any;

    const migrated = migrateMatchResult(oldResult);

    expect(migrated.postMatchAnalysis).toBeDefined();
    expect(migrated.postMatchAnalysis.homeManagerQuote.teamName).toBe('Arsenal');
    expect(migrated.postMatchAnalysis.awayManagerQuote.teamName).toBe('Chelsea');
  });

  it('should default isDerby to false', () => {
    const oldResult = {
      id: 'm1',
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 2,
      awayScore: 1,
    } as any;

    const migrated = migrateMatchResult(oldResult);

    expect(migrated.isDerby).toBe(false);
  });
});

describe('Migration - Full GameState Migration', () => {
  it('should migrate v1 GameState to v2', () => {
    const oldState: GameStateV1 = {
      version: 1,
      id: 'game-1',
      createdAt: new Date(),
      lastSaved: new Date(),
      playerTeam: {
        id: 't1',
        name: 'My Team',
        budget: 5000000,
        players: [{ id: 'p1', wages: 50000 } as any],
        staff: [],
      } as any,
      aiTeams: [],
      season: {
        year: 2025,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'in-season',
        transferWindow: 'closed',
      },
      fixtures: [],
      leagueTable: [],
      matchHistory: [],
      transferMarket: [],
      freeAgents: [],
    };

    const migrated = migrateGameStateV1toV2(oldState);

    expect(migrated.version).toBe(2);
    expect(migrated.playerTeam.tactics).toBeDefined();
    expect(migrated.playerTeam.philosophy).toBe('balanced');
    expect(migrated.playerTeam.players[0].contract).toBeDefined();
    expect(migrated.playerTeam.players[0].morale).toBe(75);
    expect(migrated.matchPreviews).toEqual([]); // Required field added
    expect(migrated.finances).toBeDefined(); // Default added
    expect(migrated.achievements).toEqual([]); // Default added
  });

  it('should handle missing optional fields gracefully', () => {
    const oldState: GameStateV1 = {
      version: 1,
      id: 'game-1',
      createdAt: new Date(),
      lastSaved: new Date(),
      playerTeam: {
        id: 't1',
        name: 'Test Team',
        budget: 5000000,
        players: [], // Empty players array
        staff: [],
      } as any,
      aiTeams: [],
      season: {
        year: 2025,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'in-season',
        transferWindow: 'closed',
      },
      fixtures: [],
      leagueTable: [],
      matchHistory: [],
      transferMarket: [],
      freeAgents: [],
    };

    const migrated = migrateGameStateV1toV2(oldState);

    expect(migrated.version).toBe(2);
    expect(migrated.staffMarket).toEqual([]);
    expect(migrated.seasonRecords).toEqual([]);
    expect(migrated.clubRecords).toBeDefined();
  });
});

describe('Migration - Auto-Detection and Migration', () => {
  it('should detect v1 and migrate to v2', () => {
    const v1State: any = {
      version: 1,
      id: 'game-1',
      playerTeam: { players: [] },
      aiTeams: [],
      season: { year: 2025, currentWeek: 10 },
      fixtures: [],
      leagueTable: [],
      matchHistory: [],
      transferMarket: [],
      freeAgents: [],
      createdAt: new Date(),
      lastSaved: new Date(),
    };

    const migrated = migrateGameState(v1State);

    expect(migrated.version).toBe(2);
  });

  it('should pass through v2 unchanged', () => {
    const v2State: GameStateV2 = {
      version: 2,
      id: 'game-1',
      createdAt: new Date(),
      lastSaved: new Date(),
      playerTeam: {
        id: 't1',
        name: 'Test',
        budget: 5000000,
        tactics: {
          formation: '4-4-2',
          mentality: 'balanced',
          roles: { defenders: 'full-back', midfielders: 'box-to-box', forwards: 'poacher' },
          instructions: { tempo: 'balanced', width: 'balanced', pressing: 'medium', passingStyle: 'mixed' },
          setPieces: { penaltyTaker: 'p1', freeKickTaker: 'p1', cornerTaker: 'p1' },
        },
        philosophy: 'balanced',
        players: [],
        staff: [],
      },
      aiTeams: [],
      season: {
        year: 2025,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'in-season',
        transferWindow: 'closed',
      },
      fixtures: [],
      leagueTable: [],
      finances: {
        budget: 5000000,
        weeklyIncome: 0,
        weeklyExpenses: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactions: [],
      },
      matchHistory: [],
      transferMarket: [],
      staffMarket: [],
      freeAgents: [],
      boardStatus: {
        satisfaction: 75,
        jobSecurity: 'safe',
        currentObjective: null,
        objectiveHistory: [],
      },
      seasonRecords: [],
      clubRecords: {
        bestLeaguePosition: { position: 20, season: 2025 },
        mostPoints: { points: 0, season: 2025 },
        mostWins: { wins: 0, season: 2025 },
        mostGoalsScored: { goals: 0, season: 2025 },
        fewestGoalsConceded: { goals: 999, season: 2025 },
        bestGoalDifference: { difference: -999, season: 2025 },
        biggestWin: { opponent: 'N/A', score: '0-0', homeOrAway: 'home', week: 1, season: 2025 },
        longestWinStreak: { streak: 0, season: 2025 },
        longestUnbeatenStreak: { streak: 0, season: 2025 },
        mostGoalsSingleSeason: { playerId: '', playerName: 'N/A', goals: 0, season: 2025 },
        mostAssistsSingleSeason: { playerId: '', playerName: 'N/A', assists: 0, season: 2025 },
        mostCleanSheetsSeason: { cleanSheets: 0, season: 2025 },
      },
      achievements: [],
      seasonAwards: [],
      newsFeed: [],
      matchPreviews: [],
      cupCompetition: undefined,
      cupHistory: [],
    };

    const result = migrateGameState(v2State);

    expect(result.version).toBe(2);
    expect(result).toEqual(v2State);
  });
});

describe('Migration - Validation', () => {
  it('should validate correct v2 state', () => {
    const validState: GameStateV2 = {
      version: 2,
      id: 'game-1',
      createdAt: new Date(),
      lastSaved: new Date(),
      playerTeam: {
        id: 't1',
        name: 'Test',
        budget: 5000000,
        tactics: {
          formation: '4-4-2',
          mentality: 'balanced',
          roles: { defenders: 'full-back', midfielders: 'box-to-box', forwards: 'poacher' },
          instructions: { tempo: 'balanced', width: 'balanced', pressing: 'medium', passingStyle: 'mixed' },
          setPieces: { penaltyTaker: 'p1', freeKickTaker: 'p1', cornerTaker: 'p1' },
        },
        philosophy: 'balanced',
        players: [
          {
            id: 'p1',
            name: 'Player 1',
            position: 'FWD',
            skill: 15,
            age: 25,
            wages: 50000,
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
              weeklyWage: 50000,
              startYear: 2025,
              startWeek: 1,
              expiryYear: 2028,
              expiryWeek: 52,
              yearsRemaining: 3,
              weeksRemaining: 156,
              status: 'active',
            },
            morale: 75,
          },
        ],
        staff: [],
      },
      aiTeams: [],
      season: {
        year: 2025,
        currentWeek: 10,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        status: 'in-progress',
        phase: 'in-season',
        transferWindow: 'closed',
      },
      fixtures: [],
      leagueTable: [],
      finances: {
        budget: 5000000,
        weeklyIncome: 0,
        weeklyExpenses: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactions: [],
      },
      matchHistory: [],
      transferMarket: [],
      staffMarket: [],
      freeAgents: [],
      boardStatus: {
        satisfaction: 75,
        jobSecurity: 'safe',
        currentObjective: null,
        objectiveHistory: [],
      },
      seasonRecords: [],
      clubRecords: {
        bestLeaguePosition: { position: 20, season: 2025 },
        mostPoints: { points: 0, season: 2025 },
        mostWins: { wins: 0, season: 2025 },
        mostGoalsScored: { goals: 0, season: 2025 },
        fewestGoalsConceded: { goals: 999, season: 2025 },
        bestGoalDifference: { difference: -999, season: 2025 },
        biggestWin: { opponent: 'N/A', score: '0-0', homeOrAway: 'home', week: 1, season: 2025 },
        longestWinStreak: { streak: 0, season: 2025 },
        longestUnbeatenStreak: { streak: 0, season: 2025 },
        mostGoalsSingleSeason: { playerId: '', playerName: 'N/A', goals: 0, season: 2025 },
        mostAssistsSingleSeason: { playerId: '', playerName: 'N/A', assists: 0, season: 2025 },
        mostCleanSheetsSeason: { cleanSheets: 0, season: 2025 },
      },
      achievements: [],
      seasonAwards: [],
      newsFeed: [],
      matchPreviews: [],
      cupHistory: [],
    };

    expect(validateGameStateV2(validState)).toBe(true);
  });

  it('should reject v2 state with missing required fields', () => {
    const invalidState: any = {
      version: 2,
      playerTeam: {
        players: [
          {
            id: 'p1',
            // Missing contract and morale
          },
        ],
      },
    };

    expect(validateGameStateV2(invalidState)).toBe(false);
  });

  it('should reject state with missing tactics', () => {
    const invalidState: any = {
      version: 2,
      playerTeam: {
        // Missing tactics
        players: [],
      },
    };

    expect(validateGameStateV2(invalidState)).toBe(false);
  });
});
