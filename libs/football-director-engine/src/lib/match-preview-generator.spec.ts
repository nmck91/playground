/**
 * Football Director Engine - Match Preview Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MatchPreviewGenerator } from './match-preview-generator';
import { Fixture, Team, LeagueTable } from './types';
import { createMockTeam, createMockPlayer, createMockFixture } from '../__tests__';

describe('MatchPreviewGenerator', () => {
  let generator: MatchPreviewGenerator;

  beforeEach(() => {
    generator = new MatchPreviewGenerator();
  });

  describe('generatePreview', () => {
    it('should generate complete match preview', () => {
      const homeTeam = createMockTeam({ id: 'home', name: 'Home FC' });
      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        id: 'fixture-1',
        homeTeamId: 'home',
        awayTeamId: 'away',
        week: 19,
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        19,
        2024,
        12345
      );

      expect(preview.fixtureId).toBe('fixture-1');
      expect(preview.homeTeam).toBe('Home FC');
      expect(preview.awayTeam).toBe('Away FC');
      expect(preview.week).toBe(19);
      expect(preview.homePosition).toBe(1);
      expect(preview.awayPosition).toBe(2);
      expect(preview.headToHead).toBeDefined();
      expect(preview.homeTeamNews).toBeDefined();
      expect(preview.awayTeamNews).toBeDefined();
      expect(preview.expectedAttendance).toBeGreaterThan(0);
      expect(preview.weather).toBeDefined();
      expect(preview.managerQuotes).toBeDefined();
      expect(preview.managerQuotes.home).toBeTruthy();
      expect(preview.managerQuotes.away).toBeTruthy();
    });

    it('should detect derby matches', () => {
      const homeTeam = createMockTeam({ name: 'Manchester United' });
      const awayTeam = createMockTeam({ name: 'Manchester City' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: homeTeam.id,
          teamName: 'Manchester United',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: awayTeam.id,
          teamName: 'Manchester City',
          won: 15,
          drawn: 2,
          lost: 1,
          goalsFor: 50,
          goalsAgainst: 10,
          points: 47,
          goalDifference: 40,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        19,
        2024,
        12345
      );

      expect(preview.isDerby).toBe(true);
      expect(preview.matchImportance).toBe('high');
    });

    it('should calculate head-to-head correctly', () => {
      const homeTeam = createMockTeam({ id: 'home', name: 'Home FC' });
      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const allFixtures: Fixture[] = [
        createMockFixture({
          homeTeamId: 'home',
          awayTeamId: 'away',
          played: true,
          result: {
            homeTeam: 'Home FC',
            awayTeam: 'Away FC',
            homeScore: 2,
            awayScore: 1,
            result: 'home',
          },
        }),
        createMockFixture({
          homeTeamId: 'away',
          awayTeamId: 'home',
          played: true,
          result: {
            homeTeam: 'Away FC',
            awayTeam: 'Home FC',
            homeScore: 1,
            awayScore: 1,
            result: 'draw',
          },
        }),
      ];

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        allFixtures,
        19,
        2024,
        12345
      );

      expect(preview.headToHead.homeWins).toBe(1);
      expect(preview.headToHead.awayWins).toBe(0);
      expect(preview.headToHead.draws).toBe(1);
    });

    it('should identify injured players in team news', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        players: [
          createMockPlayer({
            name: 'Injured Player',
            injury: { type: 'hamstring', weeksRemaining: 3 },
          }),
          createMockPlayer({ name: 'Fit Player' }),
        ],
      });

      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        10,
        2024,
        12345
      );

      expect(preview.homeTeamNews.injuries).toHaveLength(1);
      expect(preview.homeTeamNews.injuries[0].playerName).toBe('Injured Player');
      expect(preview.homeTeamNews.injuries[0].returnWeek).toBe(13);
    });

    it('should identify suspended players in team news', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        players: [
          createMockPlayer({
            name: 'Suspended Player',
            suspendedUntil: 12,
          }),
        ],
      });

      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        10,
        2024,
        12345
      );

      expect(preview.homeTeamNews.suspensions).toHaveLength(1);
      expect(preview.homeTeamNews.suspensions[0].playerName).toBe('Suspended Player');
      expect(preview.homeTeamNews.suspensions[0].returnWeek).toBe(12);
    });

    it('should identify key players in team news', () => {
      const homeTeam = createMockTeam({
        id: 'home',
        name: 'Home FC',
        players: [
          createMockPlayer({
            name: 'Star Player',
            stats: {
              goals: 15,
              assists: 8,
              appearances: 20,
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
            name: 'Average Player',
            stats: {
              goals: 2,
              assists: 1,
              appearances: 20,
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

      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 10,
          drawn: 5,
          lost: 3,
          goalsFor: 30,
          goalsAgainst: 15,
          points: 35,
          goalDifference: 15,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 8,
          drawn: 6,
          lost: 4,
          goalsFor: 25,
          goalsAgainst: 20,
          points: 30,
          goalDifference: 5,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        10,
        2024,
        12345
      );

      expect(preview.homeTeamNews.keyPlayers.length).toBeGreaterThan(0);
      expect(preview.homeTeamNews.keyPlayers[0].playerName).toBe('Star Player');
      expect(preview.homeTeamNews.keyPlayers[0].goals).toBe(15);
      expect(preview.homeTeamNews.keyPlayers[0].form).toBe('Excellent');
    });

    it('should calculate recent form correctly', () => {
      const homeTeam = createMockTeam({ id: 'home', name: 'Home FC' });
      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const allFixtures: Fixture[] = [
        createMockFixture({
          homeTeamId: 'home',
          week: 1,
          played: true,
          result: {
            homeTeam: 'Home FC',
            awayTeam: 'Other Team',
            homeScore: 2,
            awayScore: 1,
            result: 'home',
          },
        }),
        createMockFixture({
          homeTeamId: 'home',
          week: 2,
          played: true,
          result: {
            homeTeam: 'Home FC',
            awayTeam: 'Other Team',
            homeScore: 1,
            awayScore: 1,
            result: 'draw',
          },
        }),
        createMockFixture({
          awayTeamId: 'home',
          week: 3,
          played: true,
          result: {
            homeTeam: 'Other Team',
            awayTeam: 'Home FC',
            homeScore: 2,
            awayScore: 0,
            result: 'home',
          },
        }),
      ];

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 1,
          drawn: 1,
          lost: 1,
          goalsFor: 3,
          goalsAgainst: 4,
          points: 4,
          goalDifference: -1,
          played: 3,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          goalDifference: 0,
          played: 0,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        allFixtures,
        4,
        2024,
        12345
      );

      expect(preview.homeTeamNews.recentForm).toEqual(['L', 'D', 'W']);
    });

    it('should rate top 6 clash as high importance', () => {
      const homeTeam = createMockTeam({ id: 'home', name: 'Home FC' });
      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      const leagueTable: LeagueTable[] = [
        {
          teamId: 'home',
          teamName: 'Home FC',
          won: 15,
          drawn: 2,
          lost: 1,
          goalsFor: 50,
          goalsAgainst: 10,
          points: 47,
          goalDifference: 40,
          played: 18,
        },
        {
          teamId: 'away',
          teamName: 'Away FC',
          won: 14,
          drawn: 3,
          lost: 1,
          goalsFor: 45,
          goalsAgainst: 15,
          points: 45,
          goalDifference: 30,
          played: 18,
        },
      ];

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        19,
        2024,
        12345
      );

      expect(preview.matchImportance).toBe('high');
    });

    it('should rate relegation battle as high importance', () => {
      const homeTeam = createMockTeam({ id: 'home', name: 'Home FC' });
      const awayTeam = createMockTeam({ id: 'away', name: 'Away FC' });

      // Create a full 20-team league table
      const leagueTable: LeagueTable[] = Array.from({ length: 20 }, (_, i) => ({
        teamId: i === 17 ? 'home' : i === 18 ? 'away' : `team-${i}`,
        teamName: i === 17 ? 'Home FC' : i === 18 ? 'Away FC' : `Team ${i}`,
        won: 20 - i,
        drawn: 5,
        lost: i,
        goalsFor: 30 - i,
        goalsAgainst: 15 + i,
        points: 65 - i * 3,
        goalDifference: 15 - i * 2,
        played: 25,
      }));

      const fixture = createMockFixture({
        homeTeamId: 'home',
        awayTeamId: 'away',
      });

      const preview = generator.generatePreview(
        fixture,
        homeTeam,
        awayTeam,
        leagueTable,
        [],
        26,
        2024,
        12345
      );

      expect(preview.matchImportance).toBe('high');
    });
  });
});
