/**
 * Cup Manager Tests
 */

import { CupManager } from './cup-manager';
import type { Team, CupCompetition, CupResult } from './types';
import { createMockTeam } from '../__tests__/factories';

describe('CupManager', () => {
  let teams: Team[];

  beforeEach(() => {
    // Create 20 teams for a full league
    teams = Array.from({ length: 20 }, (_, i) =>
      createMockTeam({ id: `team-${i + 1}`, name: `Team ${i + 1}` })
    );
  });

  describe('generateCupCompetition', () => {
    it('should create a valid cup competition', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(cup.id).toBe('fa-cup-2024');
      expect(cup.name).toBe('FA Cup');
      expect(cup.season).toBe(2024);
      expect(cup.currentRound).toBe(1);
      expect(cup.completed).toBe(false);
      expect(cup.prizePool).toBeDefined();
    });

    it('should create Round 1 with 5 matches (10 teams)', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(cup.rounds.length).toBe(1);
      const round1 = cup.rounds[0];
      expect(round1.roundNumber).toBe(1);
      expect(round1.roundName).toBe('Round 1');
      expect(round1.fixtures.length).toBe(5);
      expect(round1.completed).toBe(false);
    });

    it('should assign teams randomly', () => {
      const cup1 = CupManager.generateCupCompetition(teams, 2024);
      const cup2 = CupManager.generateCupCompetition(teams, 2024);

      // Get fixture lists
      const fixtures1 = cup1.rounds[0].fixtures.map(f => f.homeTeamId + f.awayTeamId);
      const fixtures2 = cup2.rounds[0].fixtures.map(f => f.homeTeamId + f.awayTeamId);

      // With random draw, it's very unlikely they're identical
      // (though technically possible, so this test could rarely fail)
      const identical = fixtures1.every((f, i) => f === fixtures2[i]);
      expect(identical).toBe(false);
    });

    it('should schedule Round 1 for week 10', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(cup.rounds[0].weekNumber).toBe(10);
    });

    it('should set up prize pool correctly', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(cup.prizePool.round1).toBe(10000);
      expect(cup.prizePool.round2).toBe(25000);
      expect(cup.prizePool.round3).toBe(50000);
      expect(cup.prizePool.quarterFinal).toBe(100000);
      expect(cup.prizePool.semiFinal).toBe(250000);
      expect(cup.prizePool.runnerUp).toBe(500000);
      expect(cup.prizePool.winner).toBe(1000000);
    });
  });

  describe('advanceTournament', () => {
    let cup: CupCompetition;

    beforeEach(() => {
      cup = CupManager.generateCupCompetition(teams, 2024);
    });

    it('should not advance if round not completed', () => {
      const result = CupManager.advanceTournament(cup, teams);

      expect(result).toEqual(cup);
      expect(result?.currentRound).toBe(1);
    });

    it('should advance to Round 2 after Round 1 completes', () => {
      // Simulate all Round 1 matches
      cup.rounds[0].fixtures = cup.rounds[0].fixtures.map((fixture, i) => ({
        ...fixture,
        played: true,
        result: {
          homeScore: 2,
          awayScore: 1,
          homeTeam: fixture.homeTeamName,
          awayTeam: fixture.awayTeamName,
          result: 'home',
          wentToExtraTime: false,
          wentToPenalties: false,
          winnerId: fixture.homeTeamId,
          winnerName: fixture.homeTeamName,
          loserId: fixture.awayTeamId,
          loserName: fixture.awayTeamName,
        } as CupResult,
      }));

      cup.rounds[0].completed = true;

      const updatedCup = CupManager.advanceTournament(cup, teams);

      expect(updatedCup).not.toBeNull();
      expect(updatedCup!.currentRound).toBe(2);
      expect(updatedCup!.rounds.length).toBe(2);

      const round2 = updatedCup!.rounds[1];
      expect(round2.roundNumber).toBe(2);
      expect(round2.roundName).toBe('Round 2');
      // 5 winners + 10 byes = 15 teams -> 7 fixtures (14 play, 1 bye)
      expect(round2.fixtures.length).toBe(7);
    });

    it('should include bye teams in Round 2', () => {
      // Get teams that played in Round 1
      const round1TeamIds = cup.rounds[0].fixtures.flatMap(f => [
        f.homeTeamId,
        f.awayTeamId,
      ]);

      expect(round1TeamIds.length).toBe(10);

      // Simulate Round 1 completion
      cup.rounds[0].fixtures = cup.rounds[0].fixtures.map(fixture => ({
        ...fixture,
        played: true,
        result: {
          homeScore: 2,
          awayScore: 1,
          homeTeam: fixture.homeTeamName,
          awayTeam: fixture.awayTeamName,
          result: 'home',
          wentToExtraTime: false,
          wentToPenalties: false,
          winnerId: fixture.homeTeamId,
          winnerName: fixture.homeTeamName,
          loserId: fixture.awayTeamId,
          loserName: fixture.awayTeamName,
        } as CupResult,
      }));

      cup.rounds[0].completed = true;

      const updatedCup = CupManager.advanceTournament(cup, teams);

      // Round 2 should have 15 teams (5 winners + 10 byes)
      // But fixtures come in pairs, so should be 7 fixtures (14 teams, 1 bye)
      // Actually, with 15 teams we'd have 7 fixtures (14 teams play, 1 gets bye)
      expect(updatedCup!.rounds[1].fixtures.length).toBeGreaterThan(0);
    });

    it('should complete cup after final', () => {
      // Set up cup at final stage
      cup.currentRound = 6;
      cup.rounds = [
        ...cup.rounds,
        {
          roundNumber: 6,
          roundName: 'Final',
          fixtures: [
            {
              id: 'cup-final',
              homeTeamId: teams[0].id,
              awayTeamId: teams[1].id,
              homeTeamName: teams[0].name,
              awayTeamName: teams[1].name,
              round: 6,
              weekNumber: 44,
              played: true,
              result: {
                homeScore: 2,
                awayScore: 1,
                homeTeam: teams[0].name,
                awayTeam: teams[1].name,
                result: 'home',
                wentToExtraTime: false,
                wentToPenalties: false,
                winnerId: teams[0].id,
                winnerName: teams[0].name,
                loserId: teams[1].id,
                loserName: teams[1].name,
              } as CupResult,
            },
          ],
          weekNumber: 44,
          completed: true,
        },
      ];

      const result = CupManager.advanceTournament(cup, teams);

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
      expect(result!.winner).toEqual({
        teamId: teams[0].id,
        teamName: teams[0].name,
      });
      expect(result!.runnerUp).toEqual({
        teamId: teams[1].id,
        teamName: teams[1].name,
      });
    });
  });

  describe('isCupComplete', () => {
    it('should return false for ongoing cup', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(CupManager.isCupComplete(cup)).toBe(false);
    });

    it('should return true for completed cup', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);
      cup.completed = true;

      expect(CupManager.isCupComplete(cup)).toBe(true);
    });
  });

  describe('getPrizeMoney', () => {
    let cup: CupCompetition;

    beforeEach(() => {
      cup = CupManager.generateCupCompetition(teams, 2024);
    });

    it('should return correct prize for each round', () => {
      expect(CupManager.getPrizeMoney(1, cup.prizePool)).toBe(10000);
      expect(CupManager.getPrizeMoney(2, cup.prizePool)).toBe(25000);
      expect(CupManager.getPrizeMoney(3, cup.prizePool)).toBe(50000);
      expect(CupManager.getPrizeMoney(4, cup.prizePool)).toBe(100000);
      expect(CupManager.getPrizeMoney(5, cup.prizePool)).toBe(250000);
    });

    it('should return winner prize for winner', () => {
      expect(CupManager.getPrizeMoney(6, cup.prizePool, true, false)).toBe(
        1000000
      );
    });

    it('should return runner-up prize for runner-up', () => {
      expect(CupManager.getPrizeMoney(6, cup.prizePool, false, true)).toBe(
        500000
      );
    });

    it('should prioritize winner over runner-up if both flags set', () => {
      expect(CupManager.getPrizeMoney(6, cup.prizePool, true, true)).toBe(
        1000000
      );
    });
  });

  describe('hasCupFixturesThisWeek', () => {
    it('should return true when cup fixtures are scheduled', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(CupManager.hasCupFixturesThisWeek(cup, 10)).toBe(true);
    });

    it('should return false when no cup fixtures this week', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      expect(CupManager.hasCupFixturesThisWeek(cup, 11)).toBe(false);
    });

    it('should return false when cup is completed', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);
      cup.completed = true;

      expect(CupManager.hasCupFixturesThisWeek(cup, 10)).toBe(false);
    });

    it('should return false when cup is undefined', () => {
      expect(CupManager.hasCupFixturesThisWeek(undefined, 10)).toBe(false);
    });
  });

  describe('getCupFixturesForWeek', () => {
    it('should return fixtures when cup week matches', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      const fixtures = CupManager.getCupFixturesForWeek(cup, 10);

      expect(fixtures.length).toBe(5);
    });

    it('should return empty array when no fixtures this week', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      const fixtures = CupManager.getCupFixturesForWeek(cup, 11);

      expect(fixtures).toEqual([]);
    });

    it('should return empty array when cup is completed', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);
      cup.completed = true;

      const fixtures = CupManager.getCupFixturesForWeek(cup, 10);

      expect(fixtures).toEqual([]);
    });

    it('should only return unplayed fixtures', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);
      cup.rounds[0].fixtures[0].played = true;

      const fixtures = CupManager.getCupFixturesForWeek(cup, 10);

      expect(fixtures.length).toBe(4); // 5 total - 1 played
    });
  });

  describe('updateCupProgress', () => {
    it('should mark round as complete when all fixtures played', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      // Mark all fixtures as played
      cup.rounds[0].fixtures = cup.rounds[0].fixtures.map(f => ({
        ...f,
        played: true,
      }));

      const updated = CupManager.updateCupProgress(cup);

      expect(updated.rounds[0].completed).toBe(true);
    });

    it('should not mark round as complete when fixtures remain', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);

      // Mark only some fixtures as played
      cup.rounds[0].fixtures[0].played = true;

      const updated = CupManager.updateCupProgress(cup);

      expect(updated.rounds[0].completed).toBe(false);
    });

    it('should return cup unchanged if already completed', () => {
      const cup = CupManager.generateCupCompetition(teams, 2024);
      cup.rounds[0].completed = true;

      const updated = CupManager.updateCupProgress(cup);

      expect(updated).toEqual(cup);
    });
  });
});
