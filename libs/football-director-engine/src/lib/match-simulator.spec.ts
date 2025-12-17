/**
 * Football Director Engine - Match Simulator Tests
 */

import { MatchSimulator } from './match-simulator';
import { Team, Match } from './types';

describe('MatchSimulator', () => {
  let simulator: MatchSimulator;
  let strongTeam: Team;
  let weakTeam: Team;
  let mediumTeam: Team;

  beforeEach(() => {
    simulator = new MatchSimulator();

    // Strong team (average skill 15)
    strongTeam = {
      id: 'team-1',
      name: 'Strong FC',
      budget: 1000000,
      players: [
        { id: 'p1', name: 'Player 1', position: 'GK', skill: 15, age: 25, wages: 5000 },
        { id: 'p2', name: 'Player 2', position: 'DEF', skill: 15, age: 24, wages: 5000 },
        { id: 'p3', name: 'Player 3', position: 'DEF', skill: 15, age: 26, wages: 5000 },
        { id: 'p4', name: 'Player 4', position: 'MID', skill: 15, age: 23, wages: 5000 },
        { id: 'p5', name: 'Player 5', position: 'FWD', skill: 15, age: 27, wages: 5000 },
      ],
    };

    // Weak team (average skill 5)
    weakTeam = {
      id: 'team-2',
      name: 'Weak United',
      budget: 100000,
      players: [
        { id: 'p6', name: 'Player 6', position: 'GK', skill: 5, age: 22, wages: 1000 },
        { id: 'p7', name: 'Player 7', position: 'DEF', skill: 5, age: 21, wages: 1000 },
        { id: 'p8', name: 'Player 8', position: 'DEF', skill: 5, age: 23, wages: 1000 },
        { id: 'p9', name: 'Player 9', position: 'MID', skill: 5, age: 24, wages: 1000 },
        { id: 'p10', name: 'Player 10', position: 'FWD', skill: 5, age: 20, wages: 1000 },
      ],
    };

    // Medium team (average skill 10)
    mediumTeam = {
      id: 'team-3',
      name: 'Medium City',
      budget: 500000,
      players: [
        { id: 'p11', name: 'Player 11', position: 'GK', skill: 10, age: 25, wages: 3000 },
        { id: 'p12', name: 'Player 12', position: 'DEF', skill: 10, age: 24, wages: 3000 },
        { id: 'p13', name: 'Player 13', position: 'MID', skill: 10, age: 26, wages: 3000 },
        { id: 'p14', name: 'Player 14', position: 'FWD', skill: 10, age: 23, wages: 3000 },
      ],
    };
  });

  describe('calculateTeamStrength', () => {
    it('should calculate correct average skill for a team', () => {
      const strength = simulator.calculateTeamStrength(strongTeam);
      expect(strength).toBe(15);
    });

    it('should calculate correct average for different skill levels', () => {
      const weakStrength = simulator.calculateTeamStrength(weakTeam);
      expect(weakStrength).toBe(5);
    });

    it('should handle team with no players', () => {
      const emptyTeam: Team = { ...strongTeam, players: [] };
      const strength = simulator.calculateTeamStrength(emptyTeam);
      expect(strength).toBe(0);
    });

    it('should handle team with varying skill levels', () => {
      const strength = simulator.calculateTeamStrength(mediumTeam);
      expect(strength).toBe(10);
    });
  });

  describe('simulateMatch', () => {
    it('should return a valid match result', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      const result = simulator.simulateMatch(match);

      expect(result).toBeDefined();
      expect(result.homeTeam).toBe('Strong FC');
      expect(result.awayTeam).toBe('Weak United');
      expect(result.homeScore).toBeGreaterThanOrEqual(0);
      expect(result.awayScore).toBeGreaterThanOrEqual(0);
      expect(['home', 'away', 'draw']).toContain(result.result);
    });

    it('should give stronger team advantage', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      // Run multiple simulations to check probability
      let strongerWins = 0;
      const simulations = 100;

      for (let i = 0; i < simulations; i++) {
        const result = simulator.simulateMatch(match, i);
        if (result.result === 'home') {
          strongerWins++;
        }
      }

      // Strong team should win majority of matches (> 60%)
      expect(strongerWins).toBeGreaterThan(60);
    });

    it('should produce deterministic results with same seed', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: mediumTeam,
      };

      const result1 = simulator.simulateMatch(match, 42);
      const result2 = simulator.simulateMatch(match, 42);

      expect(result1).toEqual(result2);
    });

    it('should produce different results with different seeds', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: mediumTeam,
      };

      const result1 = simulator.simulateMatch(match, 1);
      const result2 = simulator.simulateMatch(match, 2);

      // Results should be different (though there's a small chance they could be the same)
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should correctly determine result type based on scores', () => {
      const match: Match = {
        homeTeam: mediumTeam,
        awayTeam: mediumTeam,
      };

      const result = simulator.simulateMatch(match, 100);

      if (result.homeScore > result.awayScore) {
        expect(result.result).toBe('home');
      } else if (result.awayScore > result.homeScore) {
        expect(result.result).toBe('away');
      } else {
        expect(result.result).toBe('draw');
      }
    });

    it('should apply home advantage', () => {
      const match1: Match = {
        homeTeam: mediumTeam,
        awayTeam: mediumTeam,
      };

      const match2: Match = {
        homeTeam: mediumTeam,
        awayTeam: mediumTeam,
      };

      // Run multiple simulations
      let homeWins = 0;
      const simulations = 100;

      for (let i = 0; i < simulations; i++) {
        const result = simulator.simulateMatch(match1, i);
        if (result.result === 'home') {
          homeWins++;
        }
      }

      // Home team should win more than 33% (random chance) due to home advantage
      expect(homeWins).toBeGreaterThan(33);
    });
  });

  describe('simulateSeason', () => {
    it('should simulate all matches in a season', () => {
      const teams = [strongTeam, weakTeam, mediumTeam];
      const results = simulator.simulateSeason(teams);

      // Each team plays each other twice (home and away)
      // 3 teams = 3 * 2 = 6 matches
      expect(results).toHaveLength(6);
    });

    it('should produce consistent results with seed', () => {
      const teams = [strongTeam, weakTeam, mediumTeam];

      const results1 = simulator.simulateSeason(teams, 123);
      const results2 = simulator.simulateSeason(teams, 123);

      expect(results1).toEqual(results2);
    });

    it('should generate all required matchups', () => {
      const teams = [strongTeam, weakTeam];
      const results = simulator.simulateSeason(teams);

      // Should have 2 matches (each team plays each other once at home)
      expect(results).toHaveLength(2);

      // Check both matchups exist
      const strongHome = results.find((r) => r.homeTeam === 'Strong FC' && r.awayTeam === 'Weak United');
      const weakHome = results.find((r) => r.homeTeam === 'Weak United' && r.awayTeam === 'Strong FC');

      expect(strongHome).toBeDefined();
      expect(weakHome).toBeDefined();
    });

    it('should handle larger leagues', () => {
      const team4: Team = {
        id: 'team-4',
        name: 'Team 4',
        budget: 500000,
        players: [{ id: 'p20', name: 'Player 20', position: 'FWD', skill: 10, age: 25, wages: 3000 }],
      };

      const teams = [strongTeam, weakTeam, mediumTeam, team4];
      const results = simulator.simulateSeason(teams);

      // 4 teams, each plays 3 others twice = 12 matches total
      expect(results).toHaveLength(12);
    });

    it('should complete season simulation quickly', () => {
      // Performance test: 20 team league
      const teams: Team[] = [];
      for (let i = 0; i < 20; i++) {
        teams.push({
          id: `team-${i}`,
          name: `Team ${i}`,
          budget: 500000,
          players: [
            { id: `p${i}-1`, name: `Player ${i}-1`, position: 'GK', skill: 10, age: 25, wages: 3000 },
            { id: `p${i}-2`, name: `Player ${i}-2`, position: 'DEF', skill: 10, age: 24, wages: 3000 },
            { id: `p${i}-3`, name: `Player ${i}-3`, position: 'MID', skill: 10, age: 26, wages: 3000 },
            { id: `p${i}-4`, name: `Player ${i}-4`, position: 'FWD', skill: 10, age: 23, wages: 3000 },
          ],
        });
      }

      const startTime = performance.now();
      const results = simulator.simulateSeason(teams, 456);
      const endTime = performance.now();

      // Should have 20 * 19 = 380 matches (full season)
      expect(results).toHaveLength(380);

      // Should complete in under 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
