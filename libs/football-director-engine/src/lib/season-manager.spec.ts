/**
 * Football Director Engine - Season Manager Tests
 */

import { SeasonManager } from './season-manager';
import { MatchSimulator } from './match-simulator';
import { Team, Player, Fixture } from './types';

describe('SeasonManager', () => {
  let manager: SeasonManager;
  let simulator: MatchSimulator;
  let testTeams: Team[];

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
      },
      {
        id: 'p2',
        name: 'Player 2',
        position: 'DEF',
        skill: 12,
        age: 27,
        wages: 4000,
      },
    ];

    testTeams = [
      {
        id: 'team-1',
        name: 'Team A',
        budget: 1000000,
        players: createPlayers(),
      },
      {
        id: 'team-2',
        name: 'Team B',
        budget: 900000,
        players: createPlayers(),
      },
      {
        id: 'team-3',
        name: 'Team C',
        budget: 800000,
        players: createPlayers(),
      },
      {
        id: 'team-4',
        name: 'Team D',
        budget: 700000,
        players: createPlayers(),
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

      // 4 teams = (4-1)*2 = 6 weeks
      const weeks = new Set(fixtures.map((f) => f.week));
      expect(weeks.size).toBe(6);
      expect(Math.max(...weeks)).toBe(6);
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
      const week1Fixtures = manager.getFixturesForWeek(fixtures, 1);

      week1Fixtures.forEach((fixture) => {
        expect(fixture.week).toBe(1);
      });
    });

    it('should return correct number of fixtures per week for 4 teams', () => {
      const week1Fixtures = manager.getFixturesForWeek(fixtures, 1);

      // 4 teams = 2 matches per week
      expect(week1Fixtures.length).toBe(2);
    });

    it('should return empty array for non-existent week', () => {
      const weekFixtures = manager.getFixturesForWeek(fixtures, 999);
      expect(weekFixtures).toEqual([]);
    });

    it('should return all fixtures for valid weeks', () => {
      let totalFixtures = 0;

      for (let week = 1; week <= 6; week++) {
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
      const result = manager.simulateWeek(fixtures, testTeams, 1, simulator);

      expect(result.results.length).toBe(2); // 2 matches in week 1
      expect(result.updatedFixtures.length).toBe(fixtures.length);
    });

    it('should mark fixtures as played', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 1, simulator);

      const week1Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 1);

      week1Fixtures.forEach((fixture) => {
        expect(fixture.played).toBe(true);
        expect(fixture.result).toBeDefined();
      });
    });

    it('should not affect other weeks', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 1, simulator);

      const week2Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 2);

      week2Fixtures.forEach((fixture) => {
        expect(fixture.played).toBe(false);
      });
    });

    it('should produce deterministic results with seed', () => {
      const result1 = manager.simulateWeek(fixtures, testTeams, 1, simulator, 123);
      const result2 = manager.simulateWeek(fixtures, testTeams, 1, simulator, 123);

      expect(result1.results).toEqual(result2.results);
    });

    it('should throw error for unknown team', () => {
      const invalidFixtures: Fixture[] = [
        {
          id: 'invalid-1',
          week: 1,
          homeTeamId: 'unknown-team',
          awayTeamId: 'team-2',
          played: false,
        },
      ];

      expect(() =>
        manager.simulateWeek(invalidFixtures, testTeams, 1, simulator)
      ).toThrow('Team not found');
    });

    it('should attach results to correct fixtures', () => {
      const result = manager.simulateWeek(fixtures, testTeams, 1, simulator);

      const week1Fixtures = manager.getFixturesForWeek(result.updatedFixtures, 1);

      week1Fixtures.forEach((fixture) => {
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
      const result = manager.simulateWeek(fixtures, testTeams, 1, simulator);
      expect(manager.isSeasonComplete(result.updatedFixtures)).toBe(false);
    });

    it('should return true when all matches played', () => {
      let updatedFixtures = fixtures;

      // Simulate all 6 weeks
      for (let week = 1; week <= 6; week++) {
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

    it('should return 1 for new season', () => {
      expect(manager.getCurrentWeek(fixtures)).toBe(1);
    });

    it('should return next unplayed week', () => {
      let updatedFixtures = manager.simulateWeek(fixtures, testTeams, 1, simulator)
        .updatedFixtures;
      expect(manager.getCurrentWeek(updatedFixtures)).toBe(2);

      updatedFixtures = manager.simulateWeek(updatedFixtures, testTeams, 2, simulator)
        .updatedFixtures;
      expect(manager.getCurrentWeek(updatedFixtures)).toBe(3);
    });

    it('should return 1 for completed season', () => {
      let updatedFixtures = fixtures;

      for (let week = 1; week <= 6; week++) {
        updatedFixtures = manager.simulateWeek(updatedFixtures, testTeams, week, simulator)
          .updatedFixtures;
      }

      expect(manager.getCurrentWeek(updatedFixtures)).toBe(1);
    });
  });

  describe('getTotalWeeks', () => {
    it('should return correct total weeks for 4 teams', () => {
      const fixtures = manager.generateFixtures(testTeams);
      expect(manager.getTotalWeeks(fixtures)).toBe(6);
    });

    it('should return correct total weeks for 20 teams', () => {
      const largeLeague: Team[] = Array.from({ length: 20 }, (_, i) => ({
        id: `team-${i}`,
        name: `Team ${i}`,
        budget: 1000000,
        players: [],
      }));

      const fixtures = manager.generateFixtures(largeLeague);
      expect(manager.getTotalWeeks(fixtures)).toBe(38);
    });

    it('should return 0 for empty fixtures', () => {
      expect(manager.getTotalWeeks([])).toBe(0);
    });
  });
});
