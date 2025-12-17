/**
 * Football Director Engine - League Table Manager Tests
 */

import { LeagueTableManager } from './league-table-manager';
import { Team, LeagueTable, MatchResult } from './types';

describe('LeagueTableManager', () => {
  let manager: LeagueTableManager;
  let testTeams: Team[];

  beforeEach(() => {
    manager = new LeagueTableManager();
    testTeams = [
      {
        id: 'team-1',
        name: 'Team A',
        budget: 1000000,
        players: [],
      },
      {
        id: 'team-2',
        name: 'Team B',
        budget: 900000,
        players: [],
      },
      {
        id: 'team-3',
        name: 'Team C',
        budget: 800000,
        players: [],
      },
    ];
  });

  describe('initializeTable', () => {
    it('should create table entries for all teams with zero stats', () => {
      const table = manager.initializeTable(testTeams);

      expect(table).toHaveLength(3);

      table.forEach((entry, i) => {
        expect(entry.teamId).toBe(testTeams[i].id);
        expect(entry.teamName).toBe(testTeams[i].name);
        expect(entry.played).toBe(0);
        expect(entry.won).toBe(0);
        expect(entry.drawn).toBe(0);
        expect(entry.lost).toBe(0);
        expect(entry.goalsFor).toBe(0);
        expect(entry.goalsAgainst).toBe(0);
        expect(entry.goalDifference).toBe(0);
        expect(entry.points).toBe(0);
      });
    });

    it('should handle empty teams array', () => {
      const table = manager.initializeTable([]);
      expect(table).toHaveLength(0);
    });
  });

  describe('updateTable', () => {
    let table: LeagueTable[];

    beforeEach(() => {
      table = manager.initializeTable(testTeams);
    });

    it('should update table for home win', () => {
      const result: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
      };

      const updatedTable = manager.updateTable(table, result);
      const teamA = updatedTable.find((e) => e.teamName === 'Team A')!;
      const teamB = updatedTable.find((e) => e.teamName === 'Team B')!;

      // Team A (home winner)
      expect(teamA.played).toBe(1);
      expect(teamA.won).toBe(1);
      expect(teamA.drawn).toBe(0);
      expect(teamA.lost).toBe(0);
      expect(teamA.goalsFor).toBe(3);
      expect(teamA.goalsAgainst).toBe(1);
      expect(teamA.goalDifference).toBe(2);
      expect(teamA.points).toBe(3);

      // Team B (away loser)
      expect(teamB.played).toBe(1);
      expect(teamB.won).toBe(0);
      expect(teamB.drawn).toBe(0);
      expect(teamB.lost).toBe(1);
      expect(teamB.goalsFor).toBe(1);
      expect(teamB.goalsAgainst).toBe(3);
      expect(teamB.goalDifference).toBe(-2);
      expect(teamB.points).toBe(0);
    });

    it('should update table for away win', () => {
      const result: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 0,
        awayScore: 2,
        result: 'away',
      };

      const updatedTable = manager.updateTable(table, result);
      const teamA = updatedTable.find((e) => e.teamName === 'Team A')!;
      const teamB = updatedTable.find((e) => e.teamName === 'Team B')!;

      // Team A (home loser)
      expect(teamA.played).toBe(1);
      expect(teamA.won).toBe(0);
      expect(teamA.lost).toBe(1);
      expect(teamA.points).toBe(0);

      // Team B (away winner)
      expect(teamB.played).toBe(1);
      expect(teamB.won).toBe(1);
      expect(teamB.lost).toBe(0);
      expect(teamB.points).toBe(3);
    });

    it('should update table for draw', () => {
      const result: MatchResult = {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 2,
        result: 'draw',
      };

      const updatedTable = manager.updateTable(table, result);
      const teamA = updatedTable.find((e) => e.teamName === 'Team A')!;
      const teamB = updatedTable.find((e) => e.teamName === 'Team B')!;

      // Both teams
      expect(teamA.played).toBe(1);
      expect(teamA.drawn).toBe(1);
      expect(teamA.points).toBe(1);

      expect(teamB.played).toBe(1);
      expect(teamB.drawn).toBe(1);
      expect(teamB.points).toBe(1);
    });

    it('should handle multiple match updates', () => {
      let updatedTable = table;

      // Match 1: Team A beats Team B
      updatedTable = manager.updateTable(updatedTable, {
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        homeScore: 2,
        awayScore: 0,
        result: 'home',
      });

      // Match 2: Team A beats Team C
      updatedTable = manager.updateTable(updatedTable, {
        homeTeam: 'Team A',
        awayTeam: 'Team C',
        homeScore: 3,
        awayScore: 1,
        result: 'home',
      });

      const teamA = updatedTable.find((e) => e.teamName === 'Team A')!;

      expect(teamA.played).toBe(2);
      expect(teamA.won).toBe(2);
      expect(teamA.goalsFor).toBe(5);
      expect(teamA.goalsAgainst).toBe(1);
      expect(teamA.goalDifference).toBe(4);
      expect(teamA.points).toBe(6);
    });

    it('should throw error for unknown team', () => {
      const result: MatchResult = {
        homeTeam: 'Unknown Team',
        awayTeam: 'Team B',
        homeScore: 1,
        awayScore: 0,
        result: 'home',
      };

      expect(() => manager.updateTable(table, result)).toThrow('Team not found in table');
    });
  });

  describe('sortTable', () => {
    it('should sort by points (descending)', () => {
      const table: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Team A',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 3,
          goalsAgainst: 3,
          goalDifference: 0,
          points: 3,
        },
        {
          teamId: 'team-2',
          teamName: 'Team B',
          played: 2,
          won: 2,
          drawn: 0,
          lost: 0,
          goalsFor: 5,
          goalsAgainst: 2,
          goalDifference: 3,
          points: 6,
        },
        {
          teamId: 'team-3',
          teamName: 'Team C',
          played: 2,
          won: 0,
          drawn: 0,
          lost: 2,
          goalsFor: 1,
          goalsAgainst: 4,
          goalDifference: -3,
          points: 0,
        },
      ];

      const sorted = manager.sortTable(table);

      expect(sorted[0].teamName).toBe('Team B'); // 6 points
      expect(sorted[1].teamName).toBe('Team A'); // 3 points
      expect(sorted[2].teamName).toBe('Team C'); // 0 points
    });

    it('should sort by goal difference when points equal', () => {
      const table: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Team A',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 2,
          goalsAgainst: 2,
          goalDifference: 0,
          points: 3,
        },
        {
          teamId: 'team-2',
          teamName: 'Team B',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 4,
          goalsAgainst: 2,
          goalDifference: 2,
          points: 3,
        },
      ];

      const sorted = manager.sortTable(table);

      expect(sorted[0].teamName).toBe('Team B'); // +2 GD
      expect(sorted[1].teamName).toBe('Team A'); // 0 GD
    });

    it('should sort by goals for when points and goal difference equal', () => {
      const table: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Team A',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 3,
          goalsAgainst: 3,
          goalDifference: 0,
          points: 3,
        },
        {
          teamId: 'team-2',
          teamName: 'Team B',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 5,
          goalsAgainst: 5,
          goalDifference: 0,
          points: 3,
        },
      ];

      const sorted = manager.sortTable(table);

      expect(sorted[0].teamName).toBe('Team B'); // 5 goals for
      expect(sorted[1].teamName).toBe('Team A'); // 3 goals for
    });

    it('should sort alphabetically when all stats equal', () => {
      const table: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Zebras FC',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        },
        {
          teamId: 'team-2',
          teamName: 'Arsenal FC',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        },
      ];

      const sorted = manager.sortTable(table);

      expect(sorted[0].teamName).toBe('Arsenal FC');
      expect(sorted[1].teamName).toBe('Zebras FC');
    });

    it('should not mutate original table', () => {
      const table: LeagueTable[] = [
        {
          teamId: 'team-1',
          teamName: 'Team A',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 3,
        },
        {
          teamId: 'team-2',
          teamName: 'Team B',
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 6,
        },
      ];

      const originalOrder = table[0].teamName;
      manager.sortTable(table);

      expect(table[0].teamName).toBe(originalOrder);
    });
  });

  describe('getTeamPosition', () => {
    let table: LeagueTable[];

    beforeEach(() => {
      table = [
        {
          teamId: 'team-1',
          teamName: 'Team A',
          played: 2,
          won: 2,
          drawn: 0,
          lost: 0,
          goalsFor: 6,
          goalsAgainst: 1,
          goalDifference: 5,
          points: 6,
        },
        {
          teamId: 'team-2',
          teamName: 'Team B',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          goalsFor: 3,
          goalsAgainst: 3,
          goalDifference: 0,
          points: 3,
        },
        {
          teamId: 'team-3',
          teamName: 'Team C',
          played: 2,
          won: 0,
          drawn: 0,
          lost: 2,
          goalsFor: 1,
          goalsAgainst: 6,
          goalDifference: -5,
          points: 0,
        },
      ];
    });

    it('should return correct position (1-indexed)', () => {
      expect(manager.getTeamPosition(table, 'team-1')).toBe(1);
      expect(manager.getTeamPosition(table, 'team-2')).toBe(2);
      expect(manager.getTeamPosition(table, 'team-3')).toBe(3);
    });

    it('should throw error for unknown team', () => {
      expect(() => manager.getTeamPosition(table, 'unknown-team')).toThrow(
        'Team not found in table'
      );
    });
  });
});
