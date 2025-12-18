/**
 * Football Director Engine - Team Generator Tests
 */

import { TeamGenerator } from './team-generator';
import { Player } from './types';

describe('TeamGenerator', () => {
  let generator: TeamGenerator;

  beforeEach(() => {
    generator = new TeamGenerator();
  });

  describe('generatePlayer', () => {
    it('should generate player with correct position', () => {
      const player = generator.generatePlayer('GK', [10, 15]);
      expect(player.position).toBe('GK');
    });

    it('should generate player within skill range', () => {
      const player = generator.generatePlayer('DEF', [8, 12]);
      expect(player.skill).toBeGreaterThanOrEqual(8);
      expect(player.skill).toBeLessThanOrEqual(12);
    });

    it('should generate player with valid age', () => {
      const player = generator.generatePlayer('MID', [10, 15]);
      expect(player.age).toBeGreaterThanOrEqual(18);
      expect(player.age).toBeLessThanOrEqual(34);
    });

    it('should generate player with wages', () => {
      const player = generator.generatePlayer('FWD', [10, 15]);
      expect(player.wages).toBeGreaterThan(0);
    });

    it('should have higher wages for higher skill', () => {
      const lowSkillPlayer = generator.generatePlayer('MID', [5, 6], 100);
      const highSkillPlayer = generator.generatePlayer('MID', [15, 16], 200);

      expect(highSkillPlayer.wages).toBeGreaterThan(lowSkillPlayer.wages);
    });

    it('should generate unique player IDs', () => {
      const player1 = generator.generatePlayer('GK', [10, 15]);
      const player2 = generator.generatePlayer('GK', [10, 15]);

      expect(player1.id).not.toBe(player2.id);
    });

    it('should generate player with name', () => {
      const player = generator.generatePlayer('DEF', [10, 15]);
      expect(player.name).toBeTruthy();
      expect(player.name.length).toBeGreaterThan(0);
    });

    it('should produce deterministic results with seed', () => {
      const player1 = generator.generatePlayer('MID', [10, 15], 123);
      const player2 = generator.generatePlayer('MID', [10, 15], 123);

      expect(player1.skill).toBe(player2.skill);
      expect(player1.age).toBe(player2.age);
      expect(player1.wages).toBe(player2.wages);
    });

    it('should clamp skill to 1-20 range', () => {
      const player = generator.generatePlayer('FWD', [0, 25], 50);
      expect(player.skill).toBeGreaterThanOrEqual(1);
      expect(player.skill).toBeLessThanOrEqual(20);
    });

    it('should handle all positions', () => {
      const positions: Player['position'][] = ['GK', 'DEF', 'MID', 'FWD'];

      positions.forEach((position) => {
        const player = generator.generatePlayer(position, [10, 15]);
        expect(player.position).toBe(position);
      });
    });
  });

  describe('generateTeam', () => {
    it('should generate team with correct name', () => {
      const team = generator.generateTeam('Test FC', 'mid');
      expect(team.name).toBe('Test FC');
    });

    it('should generate team with 15-18 players', () => {
      const team = generator.generateTeam('Test FC', 'mid');
      expect(team.players.length).toBeGreaterThanOrEqual(15);
      expect(team.players.length).toBeLessThanOrEqual(18);
    });

    it('should generate correct squad formation (2 GK, 5-6 DEF, 5-6 MID, 3-4 FWD)', () => {
      const team = generator.generateTeam('Test FC', 'mid');

      const gk = team.players.filter((p) => p.position === 'GK');
      const def = team.players.filter((p) => p.position === 'DEF');
      const mid = team.players.filter((p) => p.position === 'MID');
      const fwd = team.players.filter((p) => p.position === 'FWD');

      expect(gk.length).toBe(2);
      expect(def.length).toBeGreaterThanOrEqual(5);
      expect(def.length).toBeLessThanOrEqual(6);
      expect(mid.length).toBeGreaterThanOrEqual(5);
      expect(mid.length).toBeLessThanOrEqual(6);
      expect(fwd.length).toBeGreaterThanOrEqual(3);
      expect(fwd.length).toBeLessThanOrEqual(4);
    });

    it('should generate elite team with high skills', () => {
      const team = generator.generateTeam('Elite FC', 'elite', 100);

      team.players.forEach((player) => {
        expect(player.skill).toBeGreaterThanOrEqual(14);
        expect(player.skill).toBeLessThanOrEqual(18);
      });
    });

    it('should generate weak team with low skills', () => {
      const team = generator.generateTeam('Weak FC', 'weak', 200);

      team.players.forEach((player) => {
        expect(player.skill).toBeGreaterThanOrEqual(5);
        expect(player.skill).toBeLessThanOrEqual(9);
      });
    });

    it('should generate strong team with appropriate budget', () => {
      const team = generator.generateTeam('Strong FC', 'strong', 300);

      expect(team.budget).toBeGreaterThanOrEqual(2000000);
      expect(team.budget).toBeLessThanOrEqual(5000000);
    });

    it('should generate mid team with appropriate budget', () => {
      const team = generator.generateTeam('Mid FC', 'mid', 400);

      expect(team.budget).toBeGreaterThanOrEqual(500000);
      expect(team.budget).toBeLessThanOrEqual(2000000);
    });

    it('should generate unique team ID', () => {
      const team1 = generator.generateTeam('Team 1', 'mid');
      const team2 = generator.generateTeam('Team 2', 'mid');

      expect(team1.id).not.toBe(team2.id);
    });

    it('should produce deterministic results with seed', () => {
      const team1 = generator.generateTeam('Test FC', 'mid', 500);
      const team2 = generator.generateTeam('Test FC', 'mid', 500);

      expect(team1.budget).toBe(team2.budget);
      expect(team1.players.length).toBe(team2.players.length);

      team1.players.forEach((player, i) => {
        expect(player.skill).toBe(team2.players[i].skill);
        expect(player.age).toBe(team2.players[i].age);
      });
    });

    it('should generate teams for all tiers', () => {
      const tiers: Array<'elite' | 'strong' | 'mid' | 'weak'> = ['elite', 'strong', 'mid', 'weak'];

      tiers.forEach((tier) => {
        const team = generator.generateTeam(`${tier} FC`, tier);
        expect(team.players.length).toBeGreaterThanOrEqual(15);
        expect(team.players.length).toBeLessThanOrEqual(18);
        expect(team.budget).toBeGreaterThan(0);
      });
    });

    it('should have budget appropriate for tier', () => {
      const elite = generator.generateTeam('Elite FC', 'elite', 100);
      const weak = generator.generateTeam('Weak FC', 'weak', 200);

      expect(elite.budget).toBeGreaterThan(weak.budget);
    });
  });

  describe('generateLeague', () => {
    it('should generate 20 teams', () => {
      const league = generator.generateLeague();
      expect(league).toHaveLength(20);
    });

    it('should generate teams with unique names', () => {
      const league = generator.generateLeague();
      const names = league.map((team) => team.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(20);
    });

    it('should generate teams with unique IDs', () => {
      const league = generator.generateLeague();
      const ids = league.map((team) => team.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(20);
    });

    it('should generate correct distribution of tiers', () => {
      const league = generator.generateLeague(1000);

      // Check first 4 teams are elite (skill 14-18)
      const eliteTeams = league.slice(0, 4);
      eliteTeams.forEach((team) => {
        const avgSkill =
          team.players.reduce((sum, p) => sum + p.skill, 0) / team.players.length;
        expect(avgSkill).toBeGreaterThan(13);
      });

      // Check last 4 teams are weak (skill 5-9)
      const weakTeams = league.slice(16, 20);
      weakTeams.forEach((team) => {
        const avgSkill =
          team.players.reduce((sum, p) => sum + p.skill, 0) / team.players.length;
        expect(avgSkill).toBeLessThan(10);
      });
    });

    it('should generate all teams with 15-18 players', () => {
      const league = generator.generateLeague();

      league.forEach((team) => {
        expect(team.players.length).toBeGreaterThanOrEqual(15);
        expect(team.players.length).toBeLessThanOrEqual(18);
      });
    });

    it('should generate all teams with budgets', () => {
      const league = generator.generateLeague();

      league.forEach((team) => {
        expect(team.budget).toBeGreaterThan(0);
      });
    });

    it('should produce deterministic results with seed', () => {
      const league1 = generator.generateLeague(2000);
      const league2 = generator.generateLeague(2000);

      expect(league1.length).toBe(league2.length);

      league1.forEach((team, i) => {
        expect(team.name).toBe(league2[i].name);
        expect(team.budget).toBe(league2[i].budget);
        expect(team.players.length).toBe(league2[i].players.length);
      });
    });

    it('should have higher budgets for elite teams', () => {
      const league = generator.generateLeague(3000);

      const eliteTeams = league.slice(0, 4);
      const weakTeams = league.slice(16, 20);

      const avgEliteBudget =
        eliteTeams.reduce((sum, t) => sum + t.budget, 0) / eliteTeams.length;
      const avgWeakBudget =
        weakTeams.reduce((sum, t) => sum + t.budget, 0) / weakTeams.length;

      expect(avgEliteBudget).toBeGreaterThan(avgWeakBudget);
    });

    it('should have higher wages for elite teams', () => {
      const league = generator.generateLeague(4000);

      const eliteTeam = league[0];
      const weakTeam = league[19];

      const eliteWages = eliteTeam.players.reduce((sum, p) => sum + p.wages, 0);
      const weakWages = weakTeam.players.reduce((sum, p) => sum + p.wages, 0);

      expect(eliteWages).toBeGreaterThan(weakWages);
    });
  });
});
