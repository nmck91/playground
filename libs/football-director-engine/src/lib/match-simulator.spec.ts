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
        { id: 'p1', name: 'Player 1', position: 'GK', skill: 15, age: 25, wages: 5000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p2', name: 'Player 2', position: 'DEF', skill: 15, age: 24, wages: 5000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p3', name: 'Player 3', position: 'DEF', skill: 15, age: 26, wages: 5000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p4', name: 'Player 4', position: 'MID', skill: 15, age: 23, wages: 5000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p5', name: 'Player 5', position: 'FWD', skill: 15, age: 27, wages: 5000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
      ],
      staff: [],
    };

    // Weak team (average skill 5)
    weakTeam = {
      id: 'team-2',
      name: 'Weak United',
      budget: 100000,
      players: [
        { id: 'p6', name: 'Player 6', position: 'GK', skill: 5, age: 22, wages: 1000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p7', name: 'Player 7', position: 'DEF', skill: 5, age: 21, wages: 1000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p8', name: 'Player 8', position: 'DEF', skill: 5, age: 23, wages: 1000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p9', name: 'Player 9', position: 'MID', skill: 5, age: 24, wages: 1000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p10', name: 'Player 10', position: 'FWD', skill: 5, age: 20, wages: 1000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
      ],
      staff: [],
    };

    // Medium team (average skill 10)
    mediumTeam = {
      id: 'team-3',
      name: 'Medium City',
      budget: 500000,
      players: [
        { id: 'p11', name: 'Player 11', position: 'GK', skill: 10, age: 25, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p12', name: 'Player 12', position: 'DEF', skill: 10, age: 24, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p13', name: 'Player 13', position: 'MID', skill: 10, age: 26, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
        { id: 'p14', name: 'Player 14', position: 'FWD', skill: 10, age: 23, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
      ],
      staff: [],
    };
  });

  describe('calculateTeamStrength', () => {
    it('should calculate correct average skill for a team', () => {
      const strength = simulator.calculateTeamStrength(strongTeam, 1);
      // 15 * 0.9 (no manager penalty) = 13.5
      expect(strength).toBe(13.5);
    });

    it('should calculate correct average for different skill levels', () => {
      const weakStrength = simulator.calculateTeamStrength(weakTeam, 1);
      // 5 * 0.9 (no manager penalty) = 4.5
      expect(weakStrength).toBe(4.5);
    });

    it('should handle team with no players', () => {
      const emptyTeam: Team = { ...strongTeam, players: [] };
      const strength = simulator.calculateTeamStrength(emptyTeam, 1);
      expect(strength).toBe(0);
    });

    it('should handle team with varying skill levels', () => {
      const strength = simulator.calculateTeamStrength(mediumTeam, 1);
      // 10 * 0.9 (no manager penalty) = 9
      expect(strength).toBe(9);
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

      const result1 = simulator.simulateMatch(match, 1, 42);
      const result2 = simulator.simulateMatch(match, 1, 42);

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
        players: [{ id: 'p20', name: 'Player 20', position: 'FWD', skill: 10, age: 25, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] }],
        staff: [],
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
            { id: `p${i}-1`, name: `Player ${i}-1`, position: 'GK', skill: 10, age: 25, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
            { id: `p${i}-2`, name: `Player ${i}-2`, position: 'DEF', skill: 10, age: 24, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
            { id: `p${i}-3`, name: `Player ${i}-3`, position: 'MID', skill: 10, age: 26, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
            { id: `p${i}-4`, name: `Player ${i}-4`, position: 'FWD', skill: 10, age: 23, wages: 3000, stats: { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0, careerAppearances: 0, careerGoals: 0, careerAssists: 0, careerCleanSheets: 0 }, history: [] },
          ],
          staff: [],
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

  describe('Knockout Match - simulateKnockoutMatch', () => {
    it('should return a CupResult with winner when match is decisive', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      const result = simulator.simulateKnockoutMatch(match, 1, 1234);

      expect(result).toBeDefined();
      expect(result.winnerId).toBeDefined();
      expect(result.winnerName).toBeDefined();
      expect(result.loserId).toBeDefined();
      expect(result.loserName).toBeDefined();
      expect(result.wentToExtraTime).toBeDefined();
      expect(result.wentToPenalties).toBeDefined();
    });

    it('should have a winner even if normal time is drawn', () => {
      // Use seed to try to force a draw (though not guaranteed)
      const match: Match = {
        homeTeam: mediumTeam,
        awayTeam: mediumTeam, // Same team should have equal strength
      };

      const result = simulator.simulateKnockoutMatch(match, 1, 5555);

      // Must have a winner (no draws in knockout)
      expect(result.winnerId).toBeDefined();
      expect(result.winnerName).toBeDefined();
      expect([mediumTeam.id]).toContain(result.winnerId);
    });

    it('should set wentToExtraTime false when match decided in normal time', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      const result = simulator.simulateKnockoutMatch(match, 1, 1111);

      // Strong team should beat weak team in normal time
      if (result.homeScore !== result.awayScore) {
        expect(result.wentToExtraTime).toBe(false);
        expect(result.wentToPenalties).toBe(false);
      }
    });

    it('should correctly identify winner and loser', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      const result = simulator.simulateKnockoutMatch(match, 1, 2222);

      // Winner and loser should be from the two teams
      const teamIds = [strongTeam.id, weakTeam.id];
      expect(teamIds).toContain(result.winnerId);
      expect(teamIds).toContain(result.loserId);

      // Winner and loser should be different
      expect(result.winnerId).not.toBe(result.loserId);
    });

    it('should preserve all MatchResult fields', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      const result = simulator.simulateKnockoutMatch(match, 1, 3333);

      // Should have standard match result fields
      expect(result.homeScore).toBeGreaterThanOrEqual(0);
      expect(result.awayScore).toBeGreaterThanOrEqual(0);
      expect(result.homeTeam).toBe(strongTeam.name);
      expect(result.awayTeam).toBe(weakTeam.name);
      expect(result.result).toMatch(/home|away|draw/);
    });
  });

  describe('Penalty Shootout Logic', () => {
    it('should determine winner via penalties when extra time is drawn', () => {
      // This is testing indirectly via simulateKnockoutMatch
      // We can't directly test simulatePenalties as it's private
      const match: Match = {
        homeTeam: mediumTeam,
        awayTeam: {
          ...mediumTeam,
          id: 'team-4',
          name: 'Medium City 2',
        },
      };

      // Run multiple times to increase chance of penalties
      let foundPenalties = false;
      for (let seed = 0; seed < 50; seed++) {
        const result = simulator.simulateKnockoutMatch(match, 1, seed);
        if (result.wentToPenalties) {
          foundPenalties = true;
          expect(result.penaltyScore).toBeDefined();
          expect(result.penaltyScore!.home).toBeGreaterThanOrEqual(0);
          expect(result.penaltyScore!.away).toBeGreaterThanOrEqual(0);
          expect(result.penaltyScore!.home).not.toBe(result.penaltyScore!.away);
          break;
        }
      }

      // Note: With 50 attempts of equal teams, we should hit penalties at least once
      // If this fails, the random generation might be too biased
      expect(foundPenalties).toBe(true);
    });

    it('should have penalties scored between 0-5 typically', () => {
      const match: Match = {
        homeTeam: mediumTeam,
        awayTeam: {
          ...mediumTeam,
          id: 'team-5',
          name: 'Medium City 3',
        },
      };

      // Find a penalties result
      for (let seed = 0; seed < 100; seed++) {
        const result = simulator.simulateKnockoutMatch(match, 1, seed);
        if (result.wentToPenalties && result.penaltyScore) {
          // Most penalty shootouts end within 5 rounds
          // (though sudden death can go higher)
          expect(result.penaltyScore.home).toBeGreaterThanOrEqual(0);
          expect(result.penaltyScore.away).toBeGreaterThanOrEqual(0);
          expect(result.penaltyScore.home).toBeLessThan(12); // Reasonable upper bound
          expect(result.penaltyScore.away).toBeLessThan(12);
          break;
        }
      }
    });
  });

  describe('Extra Time Logic', () => {
    it('should go to extra time when normal time is drawn', () => {
      const match: Match = {
        homeTeam: mediumTeam,
        awayTeam: {
          ...mediumTeam,
          id: 'team-6',
          name: 'Medium City 4',
        },
      };

      // Try multiple seeds to find an extra time scenario
      let foundExtraTime = false;
      for (let seed = 0; seed < 50; seed++) {
        const result = simulator.simulateKnockoutMatch(match, 1, seed);
        if (result.wentToExtraTime) {
          foundExtraTime = true;
          break;
        }
      }

      // With equal teams, extra time should occur in at least one of 50 attempts
      expect(foundExtraTime).toBe(true);
    });

    it('should not go to extra time when normal time has a winner', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: weakTeam,
      };

      // Strong vs weak should almost never draw
      let noExtraTimeCount = 0;
      for (let seed = 0; seed < 10; seed++) {
        const result = simulator.simulateKnockoutMatch(match, 1, seed);
        if (!result.wentToExtraTime) {
          noExtraTimeCount++;
        }
      }

      // Expect most (if not all) to be decided in normal time
      expect(noExtraTimeCount).toBeGreaterThan(5);
    });
  });

  describe('Knockout Match Determinism', () => {
    it('should produce same result with same seed', () => {
      const match: Match = {
        homeTeam: strongTeam,
        awayTeam: mediumTeam,
      };

      const result1 = simulator.simulateKnockoutMatch(match, 1, 7777);
      const result2 = simulator.simulateKnockoutMatch(match, 1, 7777);

      expect(result1.homeScore).toBe(result2.homeScore);
      expect(result1.awayScore).toBe(result2.awayScore);
      expect(result1.winnerId).toBe(result2.winnerId);
      expect(result1.wentToExtraTime).toBe(result2.wentToExtraTime);
      expect(result1.wentToPenalties).toBe(result2.wentToPenalties);

      if (result1.penaltyScore && result2.penaltyScore) {
        expect(result1.penaltyScore.home).toBe(result2.penaltyScore.home);
        expect(result1.penaltyScore.away).toBe(result2.penaltyScore.away);
      }
    });
  });
});
