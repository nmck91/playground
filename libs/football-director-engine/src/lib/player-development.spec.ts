/**
 * Football Director Engine - Player Development Tests
 */

import { PlayerDevelopment } from './player-development';
import { PlayerStatsTracker } from './player-stats-tracker';
import { Player, Team } from './types';

describe('PlayerDevelopment', () => {
  let playerDev: PlayerDevelopment;
  const statsTracker = new PlayerStatsTracker();

  beforeEach(() => {
    playerDev = new PlayerDevelopment();
  });

  const createTestPlayer = (age: number, skill: number): Player => ({
    id: `player-${age}-${skill}`,
    name: `Player ${age}`,
    position: 'MID' as const,
    skill,
    age,
    wages: 1000,
    stats: statsTracker.initializePlayerStats(),
    history: [],
  });

  describe('agePlayer', () => {
    it('should increase player age by 1', () => {
      const player = createTestPlayer(20, 10);
      const aged = playerDev.agePlayer(player);

      expect(aged.age).toBe(21);
      expect(aged.id).toBe(player.id);
      expect(aged.name).toBe(player.name);
    });

    it('should not modify other player attributes', () => {
      const player = createTestPlayer(25, 15);
      const aged = playerDev.agePlayer(player);

      expect(aged.skill).toBe(player.skill);
      expect(aged.wages).toBe(player.wages);
      expect(aged.position).toBe(player.position);
    });
  });

  describe('getPlayerPhase', () => {
    it('should classify young players as developing', () => {
      expect(playerDev.getPlayerPhase(18)).toBe('developing');
      expect(playerDev.getPlayerPhase(22)).toBe('developing');
      expect(playerDev.getPlayerPhase(24)).toBe('developing');
    });

    it('should classify prime-age players as peak', () => {
      expect(playerDev.getPlayerPhase(25)).toBe('peak');
      expect(playerDev.getPlayerPhase(27)).toBe('peak');
      expect(playerDev.getPlayerPhase(28)).toBe('peak');
    });

    it('should classify older players as declining', () => {
      expect(playerDev.getPlayerPhase(29)).toBe('declining');
      expect(playerDev.getPlayerPhase(31)).toBe('declining');
      expect(playerDev.getPlayerPhase(32)).toBe('declining');
    });

    it('should classify veterans as veteran', () => {
      expect(playerDev.getPlayerPhase(33)).toBe('veteran');
      expect(playerDev.getPlayerPhase(35)).toBe('veteran');
      expect(playerDev.getPlayerPhase(38)).toBe('veteran');
    });
  });

  describe('calculateSkillChange', () => {
    it('should give positive skill change for young players', () => {
      const youngPlayer = createTestPlayer(20, 10);
      const skillChange = playerDev.calculateSkillChange(youngPlayer, 100);

      expect(skillChange).toBeGreaterThan(0);
      expect(skillChange).toBeLessThanOrEqual(2.0);
    });

    it('should give small variations for peak players', () => {
      const peakPlayer = createTestPlayer(27, 15);
      const skillChange = playerDev.calculateSkillChange(peakPlayer, 100);

      expect(skillChange).toBeGreaterThanOrEqual(-0.3);
      expect(skillChange).toBeLessThanOrEqual(0.5);
    });

    it('should give negative skill change for declining players', () => {
      const decliningPlayer = createTestPlayer(30, 14);
      const skillChange = playerDev.calculateSkillChange(decliningPlayer, 100);

      expect(skillChange).toBeLessThan(0);
      expect(skillChange).toBeGreaterThanOrEqual(-1.0);
    });

    it('should give significant negative change for veteran players', () => {
      const veteran = createTestPlayer(35, 12);
      const skillChange = playerDev.calculateSkillChange(veteran, 100);

      expect(skillChange).toBeLessThan(-0.5);
      expect(skillChange).toBeGreaterThanOrEqual(-2.0);
    });

    it('should produce consistent results with same seed', () => {
      const player = createTestPlayer(22, 12);
      const change1 = playerDev.calculateSkillChange(player, 42);
      const change2 = playerDev.calculateSkillChange(player, 42);

      expect(change1).toBe(change2);
    });

    it('should produce different results with different seeds', () => {
      const player = createTestPlayer(22, 12);
      const change1 = playerDev.calculateSkillChange(player, 42);
      const change2 = playerDev.calculateSkillChange(player, 100);

      expect(change1).not.toBe(change2);
    });
  });

  describe('developPlayer', () => {
    it('should age player and change skill', () => {
      const player = createTestPlayer(20, 10);
      const { player: developed, report } = playerDev.developPlayer(player, 100);

      expect(developed.age).toBe(21);
      expect(developed.skill).not.toBe(player.skill);
      expect(report.oldAge).toBe(20);
      expect(report.newAge).toBe(21);
    });

    it('should not allow skill to go below 1', () => {
      const weakVeteran = createTestPlayer(36, 2);
      const { player: developed } = playerDev.developPlayer(weakVeteran, 100);

      expect(developed.skill).toBeGreaterThanOrEqual(1);
    });

    it('should not allow skill to go above 20', () => {
      const wonderkid = createTestPlayer(18, 19.5);
      const { player: developed } = playerDev.developPlayer(wonderkid, 100);

      expect(developed.skill).toBeLessThanOrEqual(20);
    });

    it('should increase wages when skill improves significantly', () => {
      const youngPlayer = createTestPlayer(19, 10);
      const { player: developed } = playerDev.developPlayer(youngPlayer, 50);

      if (developed.skill > youngPlayer.skill + 1) {
        expect(developed.wages).toBeGreaterThan(youngPlayer.wages);
      }
    });

    it('should generate accurate development report', () => {
      const player = createTestPlayer(25, 12);
      const { report } = playerDev.developPlayer(player, 100);

      expect(report.playerId).toBe(player.id);
      expect(report.playerName).toBe(player.name);
      expect(report.oldAge).toBe(25);
      expect(report.newAge).toBe(26);
      expect(report.oldSkill).toBe(12);
      expect(report.phase).toBe('peak');
    });

    it('should round skill to 1 decimal place', () => {
      const player = createTestPlayer(22, 10.5);
      const { player: developed } = playerDev.developPlayer(player, 100);

      const decimals = (developed.skill.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(1);
    });

    it('should produce consistent results with same seed', () => {
      const player = createTestPlayer(23, 11);
      const result1 = playerDev.developPlayer(player, 42);
      const result2 = playerDev.developPlayer(player, 42);

      expect(result1.player.skill).toBe(result2.player.skill);
      expect(result1.player.age).toBe(result2.player.age);
    });
  });

  describe('developTeam', () => {
    it('should develop all players in a team', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test FC',
        budget: 1000000,
        players: [
          createTestPlayer(20, 10),
          createTestPlayer(25, 14),
          createTestPlayer(30, 15),
          createTestPlayer(35, 12),
        ],
      };

      const { team: developed, reports } = playerDev.developTeam(team, 100);

      expect(developed.players).toHaveLength(4);
      expect(reports).toHaveLength(4);

      developed.players.forEach((player, i) => {
        expect(player.age).toBe(team.players[i].age + 1);
      });
    });

    it('should maintain team properties', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test FC',
        budget: 1000000,
        players: [createTestPlayer(22, 12)],
      };

      const { team: developed } = playerDev.developTeam(team, 100);

      expect(developed.id).toBe(team.id);
      expect(developed.name).toBe(team.name);
      expect(developed.budget).toBe(team.budget);
    });

    it('should generate reports for all players', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test FC',
        budget: 1000000,
        players: [
          createTestPlayer(20, 10),
          createTestPlayer(28, 16),
        ],
      };

      const { reports } = playerDev.developTeam(team, 100);

      expect(reports).toHaveLength(2);
      expect(reports[0].playerName).toBe('Player 20');
      expect(reports[1].playerName).toBe('Player 28');
    });

    it('should produce consistent results with same seed', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test FC',
        budget: 1000000,
        players: [createTestPlayer(22, 12)],
      };

      const result1 = playerDev.developTeam(team, 42);
      const result2 = playerDev.developTeam(team, 42);

      expect(result1.team.players[0].skill).toBe(result2.team.players[0].skill);
    });
  });

  describe('developLeague', () => {
    it('should develop all teams in the league', () => {
      const teams: Team[] = [
        {
          id: 'team-1',
          name: 'Team A',
          budget: 1000000,
          players: [createTestPlayer(22, 12)],
        },
        {
          id: 'team-2',
          name: 'Team B',
          budget: 1000000,
          players: [createTestPlayer(28, 15)],
        },
      ];

      const { teams: developed, allReports } = playerDev.developLeague(teams, 100);

      expect(developed).toHaveLength(2);
      expect(allReports.size).toBe(2);
      expect(allReports.get('team-1')).toHaveLength(1);
      expect(allReports.get('team-2')).toHaveLength(1);
    });

    it('should preserve team order', () => {
      const teams: Team[] = [
        {
          id: 'team-1',
          name: 'Team A',
          budget: 1000000,
          players: [createTestPlayer(22, 12)],
        },
        {
          id: 'team-2',
          name: 'Team B',
          budget: 1000000,
          players: [createTestPlayer(28, 15)],
        },
      ];

      const { teams: developed } = playerDev.developLeague(teams, 100);

      expect(developed[0].id).toBe('team-1');
      expect(developed[1].id).toBe('team-2');
    });
  });

  describe('generateSummary', () => {
    it('should correctly count improved, declined, and maintained players', () => {
      const reports = [
        {
          playerId: '1',
          playerName: 'Player 1',
          oldAge: 20,
          newAge: 21,
          oldSkill: 10,
          newSkill: 11,
          skillChange: 1.0,
          phase: 'developing' as const,
        },
        {
          playerId: '2',
          playerName: 'Player 2',
          oldAge: 25,
          newAge: 26,
          oldSkill: 15,
          newSkill: 15.1,
          skillChange: 0.1,
          phase: 'peak' as const,
        },
        {
          playerId: '3',
          playerName: 'Player 3',
          oldAge: 32,
          newAge: 33,
          oldSkill: 14,
          newSkill: 13,
          skillChange: -1.0,
          phase: 'declining' as const,
        },
      ];

      const summary = playerDev.generateSummary(reports);

      expect(summary.totalPlayers).toBe(3);
      expect(summary.improved).toBe(1);
      expect(summary.declined).toBe(1);
      expect(summary.maintained).toBe(1);
    });

    it('should calculate average skill change', () => {
      const reports = [
        {
          playerId: '1',
          playerName: 'Player 1',
          oldAge: 20,
          newAge: 21,
          oldSkill: 10,
          newSkill: 11,
          skillChange: 1.0,
          phase: 'developing' as const,
        },
        {
          playerId: '2',
          playerName: 'Player 2',
          oldAge: 32,
          newAge: 33,
          oldSkill: 14,
          newSkill: 13,
          skillChange: -1.0,
          phase: 'declining' as const,
        },
      ];

      const summary = playerDev.generateSummary(reports);

      expect(summary.avgSkillChange).toBe(0);
    });

    it('should handle empty reports', () => {
      const summary = playerDev.generateSummary([]);

      expect(summary.totalPlayers).toBe(0);
      expect(summary.improved).toBe(0);
      expect(summary.declined).toBe(0);
      expect(summary.maintained).toBe(0);
      expect(summary.avgSkillChange).toBe(0);
    });
  });
});
