/**
 * Player Development Interface
 *
 * Defines the contract for player age and skill development.
 */

import { Player, Team, DevelopmentReport } from '../types';

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
