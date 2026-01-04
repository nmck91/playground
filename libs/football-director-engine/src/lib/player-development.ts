/**
 * Football Director Engine - Player Development
 * Handles player aging, skill progression, and career development
 */

import { Player, Team, DevelopmentReport } from './types';
import { StaffManager } from './staff-manager';

/**
 * Player Development Interface
 *
 * Defines the contract for managing player aging and skill development.
 */
export interface IPlayerDevelopment {
  /**
   * Age a player by one year
   */
  agePlayer(player: Player): Player;

  /**
   * Calculate skill change based on player age and position
   * Young players improve, peak players maintain, older players decline
   */
  calculateSkillChange(player: Player, seed?: number): number;

  /**
   * Get player development phase based on age
   */
  getPlayerPhase(age: number): 'developing' | 'peak' | 'declining' | 'veteran';

  /**
   * Develop a single player (age + skill change)
   */
  developPlayer(player: Player, seed?: number): { player: Player; report: DevelopmentReport };

  /**
   * Develop all players in a team (with coach bonuses applied)
   */
  developTeam(team: Team, seed?: number): { team: Team; reports: DevelopmentReport[] };

  /**
   * Develop all teams in the league
   */
  developLeague(
    teams: Team[],
    seed?: number
  ): { teams: Team[]; allReports: Map<string, DevelopmentReport[]> };

  /**
   * Generate summary statistics for development reports
   */
  generateSummary(reports: DevelopmentReport[]): {
    totalPlayers: number;
    improved: number;
    declined: number;
    maintained: number;
    avgSkillChange: number;
  };
}

/**
 * Player Development Implementation
 */
export class PlayerDevelopment implements IPlayerDevelopment {
  /**
   * Age a player by one year
   */
  agePlayer(player: Player): Player {
    return {
      ...player,
      age: player.age + 1,
    };
  }

  /**
   * Calculate skill change based on player age and position
   * Young players improve, peak players maintain, older players decline
   */
  calculateSkillChange(player: Player, seed?: number): number {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Age-based skill progression
    if (player.age < 22) {
      // Young players (18-21): High growth potential
      // +0.5 to +2.0 skill per season
      return 0.5 + random * 1.5;
    } else if (player.age < 25) {
      // Developing players (22-24): Moderate growth
      // +0.3 to +1.2 skill per season
      return 0.3 + random * 0.9;
    } else if (player.age <= 28) {
      // Peak players (25-28): Slight variations
      // -0.3 to +0.5 skill per season
      return -0.3 + random * 0.8;
    } else if (player.age <= 32) {
      // Declining players (29-32): Gradual decline
      // -1.0 to -0.3 skill per season
      return -1.0 + random * 0.7;
    } else {
      // Veteran players (33+): Significant decline
      // -2.0 to -0.8 skill per season
      return -2.0 + random * 1.2;
    }
  }

  /**
   * Get player development phase
   */
  getPlayerPhase(age: number): 'developing' | 'peak' | 'declining' | 'veteran' {
    if (age < 25) return 'developing';
    if (age <= 28) return 'peak';
    if (age <= 32) return 'declining';
    return 'veteran';
  }

  /**
   * Develop a single player (age + skill change)
   */
  developPlayer(player: Player, seed?: number): { player: Player; report: DevelopmentReport } {
    const oldAge = player.age;
    const oldSkill = player.skill;

    // Age the player
    let developedPlayer = this.agePlayer(player);

    // Calculate and apply skill change
    const skillChange = this.calculateSkillChange(player, seed);
    const newSkill = Math.max(1, Math.min(20, player.skill + skillChange));

    developedPlayer = {
      ...developedPlayer,
      skill: Math.round(newSkill * 10) / 10, // Round to 1 decimal place
    };

    // Adjust wages based on skill (better players demand more)
    // Wages increase if skill improves significantly
    if (newSkill > oldSkill + 1) {
      developedPlayer.wages = Math.round(developedPlayer.wages * 1.1);
    }

    const report: DevelopmentReport = {
      playerId: player.id,
      playerName: player.name,
      oldAge,
      newAge: developedPlayer.age,
      oldSkill,
      newSkill: developedPlayer.skill,
      skillChange: Math.round((newSkill - oldSkill) * 10) / 10,
      phase: this.getPlayerPhase(developedPlayer.age),
    };

    return { player: developedPlayer, report };
  }

  /**
   * Develop all players in a team
   */
  developTeam(team: Team, seed?: number): { team: Team; reports: DevelopmentReport[] } {
    const reports: DevelopmentReport[] = [];
    const developedPlayers: Player[] = [];

    // Get coach bonus (additional skill growth)
    const staffManager = new StaffManager();
    const coachBonus = staffManager.getCoachBonus(team);

    team.players.forEach((player, index) => {
      const playerSeed = seed !== undefined ? seed + index : undefined;
      const { player: developedPlayer, report } = this.developPlayer(player, playerSeed);

      // Apply coach bonus to skill change (only for positive changes)
      if (report.skillChange > 0 && coachBonus > 0) {
        const bonusSkill = developedPlayer.skill + coachBonus;
        const finalSkill = Math.max(1, Math.min(20, bonusSkill));
        const enhancedPlayer = {
          ...developedPlayer,
          skill: Math.round(finalSkill * 10) / 10,
        };

        // Update report to reflect coach bonus
        report.newSkill = enhancedPlayer.skill;
        report.skillChange = Math.round((enhancedPlayer.skill - report.oldSkill) * 10) / 10;

        developedPlayers.push(enhancedPlayer);
      } else {
        developedPlayers.push(developedPlayer);
      }

      reports.push(report);
    });

    const developedTeam: Team = {
      ...team,
      players: developedPlayers,
    };

    return { team: developedTeam, reports };
  }

  /**
   * Develop all teams in the league
   */
  developLeague(teams: Team[], seed?: number): {
    teams: Team[];
    allReports: Map<string, DevelopmentReport[]>;
  } {
    const developedTeams: Team[] = [];
    const allReports = new Map<string, DevelopmentReport[]>();

    teams.forEach((team, index) => {
      const teamSeed = seed !== undefined ? seed + index * 100 : undefined;
      const { team: developedTeam, reports } = this.developTeam(team, teamSeed);
      developedTeams.push(developedTeam);
      allReports.set(team.id, reports);
    });

    return { teams: developedTeams, allReports };
  }

  /**
   * Generate summary statistics for development reports
   */
  generateSummary(reports: DevelopmentReport[]): {
    totalPlayers: number;
    improved: number;
    declined: number;
    maintained: number;
    avgSkillChange: number;
  } {
    const improved = reports.filter((r) => r.skillChange > 0.3).length;
    const declined = reports.filter((r) => r.skillChange < -0.3).length;
    const maintained = reports.length - improved - declined;

    const totalChange = reports.reduce((sum, r) => sum + r.skillChange, 0);
    const avgSkillChange = reports.length > 0 ? totalChange / reports.length : 0;

    return {
      totalPlayers: reports.length,
      improved,
      declined,
      maintained,
      avgSkillChange: Math.round(avgSkillChange * 100) / 100,
    };
  }

  /**
   * Seeded random number generator for testing
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
