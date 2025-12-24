/**
 * Football Director Engine - Season Manager Tests
 */

import { SeasonManager } from './season-manager';
import { MatchSimulator } from './match-simulator';
import { PlayerStatsTracker } from './player-stats-tracker';
import { Team, Player, Fixture } from './types';

describe('SeasonManager', () => {
  let manager: SeasonManager;
  let simulator: MatchSimulator;
  let testTeams: Team[];
  const statsTracker = new PlayerStatsTracker();

  beforeEach(() => {
    manager = new SeasonManager();
    simulator = new MatchSimulator();

    // Create 4 test teams for simplicity
    const createPlayers = (): Player[] => [
      {
        id: 'p1',
        name: 'Player 1',
        position: 'GK',
        skill: 10,
        age: 25,
        wages: 3000,
        stats: statsTracker.initializePlayerStats(),
        history: [],
      },
      {
        id: 'p2',
        name: 'Player 2',
        position: 'DEF',
        skill: 12,
        age: 27,
        wages: 4000,
        stats: statsTracker.initializePlayerStats(),
        history: [],
      },
    ];

    testTeams = [
      {
        id: 'team-1',
        name: 'Team A',
        budget: 1000000,
        players: createPlayers(),
        staff: [],
      },
      {
        id: 'team-2',
        name: 'Team B',
        budget: 900000,
        players: createPlayers(),
        staff: [],
      },
      {
        id: 'team-3',
        name: 'Team C',
        budget: 800000,
        players: createPlayers(),
        staff: [],
      },
      {
        id: 'team-4',
        name: 'Team D',
        budget: 700000,
        players: createPlayers(),
        staff: [],
      },
    ];
  });

  describe('generateFixtures', () => {
    it('should generate correct number of fixtures for 4 teams', () => {
      const fixtures = manager.generateFixtures(testTeams);

      // 4 teams: each plays 3 others twice = 12 total matches
      // 4 teams = 6 matches per round, 2 rounds = 12 matches
      expect(fixtures.length).toBe(12);
    });

    it('should generate correct number of fixtures for 20 teams', () => {
      const largeLeague: Team[] = Array.from({ length: 20 }, (_, i) => ({
        id: `team-${i}`,
        name: `Team ${i}`,
        budget: 1000000,
        players: [],
        staff: [],
      }));

      const fixtures = manager.generateFixtures(largeLeague);

      // 20 teams: each plays 19 others twice = 380 total matches
      expect(fixtures.length).toBe(380);
    });

    it('should create home and away fixtures for each pairing', () => {
      const fixtures = manager.generateFixtures(testTeams);

      // Check Team A vs Team B appears twice (once home, once away)
      const teamAvsB = fixtures.filter(
        (f) =>
          (f.homeTeamId === 'team-1' && f.awayTeamId === 'team-2') ||
          (f.homeTeamId === 'team-2' && f.awayTeamId === 'team-1')
      );

      expect(teamAvsB.length).toBe(2);

      // One should be home for Team A, one for Team B
      const homeForTeamA = teamAvsB.find((f) => f.homeTeamId === 'team-1');
      const homeForTeamB = teamAvsB.find((f) => f.homeTeamId === 'team-2');

      expect(homeForTeamA).toBeDefined();
      expect(homeForTeamB).toBeDefined();
    });

    it('should distribute fixtures across correct number of weeks', () => {
      const fixtures = manager.generateFixtures(testTeams);

      // 4 teams = (4-1)*2 = 6 weeks, starting from week 8
      const weeks = new Set(fixtures.map((f) => f.week));
      expect(weeks.size).toBe(6);
      expect(Math.max(...weeks)).toBe(13); // weeks 8-13
      expect(Math.min(...weeks)).toBe(8); // starts at week 8
    });

    it('should mark all fixtures as unplayed initially', () => {
      const fixtures = manager.generateFixtures(testTeams);

      fixtures.forEach((fixture) => {
        expect(fixture.played).toBe(false);
        expect(fixture.result).toBeUndefined();
      });
    });

    it('should assign unique IDs to all fixtures', () => {
      const fixtures = manager.generateFixtures(testTeams);
      const ids = new Set(fixtures.map((f) => f.id));

      expect(ids.size).toBe(fixtures.length);
    });

    it('should return empty array for less than 2 teams', () => {
      expect(manager.generateFixtures([])).toEqual([]);
      expect(manager.generateFixtures([testTeams[0]])).toEqual([]);
    });

    it('should ensure each team plays same number of home and away matches', () => {
      const fixtures = manager.generateFixtures(testTeams);

      testTeams.forEach((team) => {
        const homeMatches = fixtures.filter((f) => f.homeTeamId === team.id);
        const awayMatches = fixtures.filter((f) => f.awayTeamId === team.id);

        expect(homeMatches.length).toBe(awayMatches.length);
        expect(homeMatches.length).toBe(3); // plays 3 others as home
      });
    });
  });

  describe('getFixturesForWeek', () => {
    let fixtures: Fixture[];

    beforeEach(() => {
      fixtures = manager.generateFixtures(testTeams);
    });

    it('should return fixtures for specific week', () => {
      const week8Fixtures = manager.getFixturesForWeek(fixtures, 8);

      week8Fixtures.forEach((fixture) => {
        expect(fixture.week).toBe(8);
      });
    });

    it('should return correct number of fixtures per week for 4 teams', () => {
      const week8Fixtures = manager.getFixturesForWeek(fixtures, 8);

      // 4 teams = 2 matches per week
      expect(week8Fixtures.length).toBe(2);
    });

    it('should return empty array for non-existent week', () => {
      const weekFixtures = manager.getFixturesForWeek(fixtures, 999);
      expect(weekFixtures).toEqual([]);
    });

    it('should return all fixtures for valid weeks', () => {
      let totalFixtures = 0;

      // Weeks 8-13 for 4 teams (6 weeks total)
      for (let week = 8; week <= 13; week++) {
        const weekFixtures = manager.getFixturesForWeek(fixtures, week);
        totalFixtures += weekFixtures.length;
      }

      expect(totalFixtures).toBe(fixtures.length);
    });
  });

  describe('simulateWeek', () => {
    let fixtures: Fixture[];

    beforeEach(() => {
      fixtures = manager.generateFixtures(testTeams);
    });

    it('should simulate all matches for a week', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 8, simulator);

      expect(result.results.length).toBe(2); // 2 matches in week 8
      expect(result.updatedFixtures.length).toBe(fixtures.length);
    });

    it('should mark fixtures as played', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 8, simulator);

      const week8Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 8);

      week8Fixtures.forEach((fixture) => {
        expect(fixture.played).toBe(true);
        expect(fixture.result).toBeDefined();
      });
    });

    it('should not affect other weeks', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 8, simulator);

      const week9Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 9);

      week9Fixtures.forEach((fixture) => {
        expect(fixture.played).toBe(false);
      });
    });

    it('should produce deterministic results with seed', () => {
      const result1 = manager.simulateWeek(fixtures, testTeams, 8, simulator, 123);
      const result2 = manager.simulateWeek(fixtures, testTeams, 8, simulator, 123);

      expect(result1.results).toEqual(result2.results);
    });

    it('should throw error for unknown team', () => {
      const invalidFixtures: Fixture[] = [
        {
          id: 'invalid-1',
          week: 8,
          homeTeamId: 'unknown-team',
          awayTeamId: 'team-2',
          played: false,
          matchType: 'competitive',
        },
      ];

      expect(() =>
        manager.simulateWeek(invalidFixtures, testTeams, 8, simulator)
      ).toThrow('Team not found');
    });

    it('should attach results to correct fixtures', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 8, simulator);

      const week8Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 8);

      week8Fixtures.forEach((fixture) => {
        expect(fixture.result).toBeDefined();
        expect(fixture.result!.homeScore).toBeGreaterThanOrEqual(0);
        expect(fixture.result!.awayScore).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('isSeasonComplete', () => {
    let fixtures: Fixture[];

    beforeEach(() => {
      fixtures = manager.generateFixtures(testTeams);
    });

    it('should return false when no matches played', () => {
      expect(manager.isSeasonComplete(fixtures)).toBe(false);
    });

    it('should return false when some matches played', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 8, simulator);
      expect(manager.isSeasonComplete(result.updatedFixtures)).toBe(false);
    });

    it('should return true when all matches played', () => {
      let updatedFixtures = fixtures;

      // Simulate all 6 weeks (weeks 8-13 for 4 teams)
      for (let week = 8; week <= 13; week++) {
        const result = manager.simulateWeek(updatedFixtures, testTeams, week, simulator);
        updatedFixtures = result.updatedFixtures;
      }

      expect(manager.isSeasonComplete(updatedFixtures)).toBe(true);
    });

    it('should return false for empty fixtures array', () => {
      expect(manager.isSeasonComplete([])).toBe(false);
    });
  });

  describe('getCurrentWeek', () => {
    let fixtures: Fixture[];

    beforeEach(() => {
      fixtures = manager.generateFixtures(testTeams);
    });

    it('should return 8 for new season', () => {
      expect(manager.getCurrentWeek(fixtures)).toBe(8);
    });

    it('should return next unplayed week', () => {
      let updatedFixtures = manager.simulateWeek(fixtures, testTeams, 8, simulator)
        .updatedFixtures;
      expect(manager.getCurrentWeek(updatedFixtures)).toBe(9);

      updatedFixtures = manager.simulateWeek(updatedFixtures, testTeams, 9, simulator)
        .updatedFixtures;
      expect(manager.getCurrentWeek(updatedFixtures)).toBe(10);
    });

    it('should return 8 for completed season', () => {
      let updatedFixtures = fixtures;

      // Simulate all 6 weeks (weeks 8-13 for 4 teams)
      for (let week = 8; week <= 13; week++) {
        updatedFixtures = manager.simulateWeek(updatedFixtures, testTeams, week, simulator)
          .updatedFixtures;
      }

      expect(manager.getCurrentWeek(updatedFixtures)).toBe(8);
    });
  });

  describe('getTotalWeeks', () => {
    it('should return correct total weeks for 4 teams', () => {
      const fixtures = manager.generateFixtures(testTeams);
      // 4 teams = 6 rounds, starting at week 8, so weeks 8-13
      expect(manager.getTotalWeeks(fixtures)).toBe(13);
    });

    it('should return correct total weeks for 20 teams', () => {
      const largeLeague: Team[] = Array.from({ length: 20 }, (_, i) => ({
        id: `team-${i}`,
        name: `Team ${i}`,
        budget: 1000000,
        players: [],
        staff: [],
      }));

      const fixtures = manager.generateFixtures(largeLeague);
      // 20 teams = 38 rounds, starting at week 8, so weeks 8-45
      expect(manager.getTotalWeeks(fixtures)).toBe(45);
    });

    it('should return 0 for empty fixtures', () => {
      expect(manager.getTotalWeeks([])).toBe(0);
    });
  });

  describe('generateFriendlyFixtures', () => {
    it('should generate friendly fixtures for pre-season weeks', () => {
      const friendlies = manager.generateFriendlyFixtures(testTeams);

      // Should have fixtures for each friendly week (4, 5, 6)
      // With 4 teams, we get 2 matches per week = 6 total
      expect(friendlies.length).toBeGreaterThan(0);
      expect(friendlies.every((f) => f.matchType === 'friendly')).toBe(true);
    });

    it('should create friendlies for weeks 4, 5, 6', () => {
      const friendlies = manager.generateFriendlyFixtures(testTeams);

      const weeks = [...new Set(friendlies.map((f) => f.week))];
      expect(weeks).toContain(4);
      expect(weeks).toContain(5);
      expect(weeks).toContain(6);
    });

    it('should return empty array for less than 2 teams', () => {
      const oneTeam = [testTeams[0]];
      const friendlies = manager.generateFriendlyFixtures(oneTeam);

      expect(friendlies).toHaveLength(0);
    });

    it('should mark all friendlies as unplayed', () => {
      const friendlies = manager.generateFriendlyFixtures(testTeams);

      expect(friendlies.every((f) => !f.played)).toBe(true);
    });

    it('should create unique fixture IDs', () => {
      const friendlies = manager.generateFriendlyFixtures(testTeams);

      const ids = friendlies.map((f) => f.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getSeasonPhase', () => {
    it('should return pre-season for weeks 1-7', () => {
      expect(manager.getSeasonPhase(1)).toBe('pre-season');
      expect(manager.getSeasonPhase(7)).toBe('pre-season');
    });

    it('should return competitive for weeks 8-45', () => {
      expect(manager.getSeasonPhase(8)).toBe('competitive');
      expect(manager.getSeasonPhase(20)).toBe('competitive');
      expect(manager.getSeasonPhase(45)).toBe('competitive');
    });

    it('should return off-season for weeks 46-52', () => {
      expect(manager.getSeasonPhase(46)).toBe('off-season');
      expect(manager.getSeasonPhase(52)).toBe('off-season');
    });
  });

  describe('getTransferWindowStatus', () => {
    it('should return open for pre-season transfer window (weeks 1-8)', () => {
      expect(manager.getTransferWindowStatus(1)).toBe('open');
      expect(manager.getTransferWindowStatus(8)).toBe('open');
    });

    it('should return open for winter transfer window (weeks 28-32)', () => {
      expect(manager.getTransferWindowStatus(28)).toBe('open');
      expect(manager.getTransferWindowStatus(30)).toBe('open');
      expect(manager.getTransferWindowStatus(32)).toBe('open');
    });

    it('should return closed outside transfer windows', () => {
      expect(manager.getTransferWindowStatus(15)).toBe('closed');
      expect(manager.getTransferWindowStatus(20)).toBe('closed');
      expect(manager.getTransferWindowStatus(40)).toBe('closed');
    });
  });

  describe('hasMatchesThisWeek', () => {
    it('should return true for friendly weeks (4, 5, 6)', () => {
      expect(manager.hasMatchesThisWeek(4)).toBe(true);
      expect(manager.hasMatchesThisWeek(5)).toBe(true);
      expect(manager.hasMatchesThisWeek(6)).toBe(true);
    });

    it('should return true for competitive weeks (8-45)', () => {
      expect(manager.hasMatchesThisWeek(8)).toBe(true);
      expect(manager.hasMatchesThisWeek(20)).toBe(true);
      expect(manager.hasMatchesThisWeek(45)).toBe(true);
    });

    it('should return false for weeks without matches', () => {
      expect(manager.hasMatchesThisWeek(1)).toBe(false);
      expect(manager.hasMatchesThisWeek(2)).toBe(false);
      expect(manager.hasMatchesThisWeek(3)).toBe(false);
      expect(manager.hasMatchesThisWeek(7)).toBe(false);
      expect(manager.hasMatchesThisWeek(46)).toBe(false);
      expect(manager.hasMatchesThisWeek(52)).toBe(false);
    });
  });

  describe('getFullSeasonWeeks', () => {
    it('should return 52 weeks for full season', () => {
      expect(manager.getFullSeasonWeeks()).toBe(52);
    });
  });

  describe('getCompetitiveWeeks', () => {
    it('should return 38 weeks for competitive season', () => {
      expect(manager.getCompetitiveWeeks()).toBe(38);
    });
  });
});
