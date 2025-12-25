/**
 * Football Director Engine - Records Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RecordsManager } from './records-manager';
import { LeagueTable, MatchResult, Team, Fixture } from './types';
import { createMockTeam, createMockPlayer, createMockFixture } from '../__tests__';

describe('RecordsManager', () => {
  let manager: RecordsManager;

  beforeEach(() => {
    manager = new RecordsManager();
  });

  describe('calculateSeasonRecords', () => {
    it('should calculate season records correctly', () => {
      const team = createMockTeam({ name: 'Test FC' });
      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 25,
        drawn: 8,
        lost: 5,
        goalsFor: 80,
        goalsAgainst: 30,
        points: 83,
        goalDifference: 50,
        played: 38,
      };

      const matchHistory: MatchResult[] = [
        {
          homeTeam: 'Test FC',
          awayTeam: 'Opponent',
          homeScore: 3,
          awayScore: 1,
          result: 'home',
        },
      ];

      const fixtures: Fixture[] = [
        createMockFixture({
          homeTeamId: team.id,
          awayTeamId: 'opponent-1',
          played: true,
          result: { homeScore: 3, awayScore: 1, result: 'home' },
        }),
      ];

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        matchHistory,
        fixtures,
        team,
        team.id
      );

      expect(records.season).toBe(2024);
      expect(records.points).toBe(83);
      expect(records.won).toBe(25);
      expect(records.drawn).toBe(8);
      expect(records.lost).toBe(5);
    });

    it('should track top scorer from team', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
          createMockPlayer({
            id: 'top-scorer',
            name: 'Top Scorer',
            stats: {
              goals: 20,
              assists: 5,
              appearances: 38,
              yellowCards: 0,
              redCards: 0,
              cleanSheets: 0,
              careerGoals: 0,
              careerAssists: 0,
              careerAppearances: 0,
              careerCleanSheets: 0,
            },
          }),
          createMockPlayer({
            id: 'other',
            name: 'Other',
            stats: {
              goals: 10,
              assists: 8,
              appearances: 35,
              yellowCards: 0,
              redCards: 0,
              cleanSheets: 0,
              careerGoals: 0,
              careerAssists: 0,
              careerAppearances: 0,
              careerCleanSheets: 0,
            },
          }),
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 20,
        drawn: 10,
        lost: 8,
        goalsFor: 60,
        goalsAgainst: 40,
        points: 70,
        goalDifference: 20,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topScorer).toBeDefined();
      expect(records.topScorer?.playerName).toBe('Top Scorer');
      expect(records.topScorer?.goals).toBe(20);
    });

    it('should track top assists provider', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
          createMockPlayer({
            id: 'assist-king',
            name: 'Assist King',
            stats: {
              goals: 5,
              assists: 15,
              appearances: 38,
              yellowCards: 0,
              redCards: 0,
              cleanSheets: 0,
              careerGoals: 0,
              careerAssists: 0,
              careerAppearances: 0,
              careerCleanSheets: 0,
            },
          }),
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 20,
        drawn: 10,
        lost: 8,
        goalsFor: 60,
        goalsAgainst: 40,
        points: 70,
        goalDifference: 20,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topAssists).toBeDefined();
      expect(records.topAssists?.playerName).toBe('Assist King');
      expect(records.topAssists?.assists).toBe(15);
    });

    it('should handle team with no goalscorers', () => {
      const team = createMockTeam({
        name: 'Test FC',
        players: [
          createMockPlayer({
            stats: {
              goals: 0,
              assists: 0,
              appearances: 38,
              yellowCards: 0,
              redCards: 0,
              cleanSheets: 0,
              careerGoals: 0,
              careerAssists: 0,
              careerAppearances: 0,
              careerCleanSheets: 0,
            },
          }),
        ],
      });

      const finalTable: LeagueTable = {
        teamId: team.id,
        teamName: 'Test FC',
        won: 0,
        drawn: 10,
        lost: 28,
        goalsFor: 0,
        goalsAgainst: 80,
        points: 10,
        goalDifference: -80,
        played: 38,
      };

      const records = manager.calculateSeasonRecords(
        2024,
        finalTable,
        [],
        [],
        team,
        team.id
      );

      expect(records.topScorer).toBeUndefined();
      expect(records.topAssists).toBeUndefined();
    });
  });
});
