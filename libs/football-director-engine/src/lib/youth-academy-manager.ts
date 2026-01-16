/**
 * Youth Academy Manager
 * Generates young players (ages 16-18) for team development
 */

import { Player, Team } from './types';
import { ITeamGenerator } from './interfaces/team-generator.interface';
import { TeamGenerator } from './team-generator';
import { IYouthAcademyManager } from './interfaces/youth-academy-manager.interface';

// Re-export interface for convenience
export type { IYouthAcademyManager };

/**
 * Youth Academy Manager Implementation
 */
export class YouthAcademyManager implements IYouthAcademyManager {
  private teamGenerator: ITeamGenerator;

  constructor(teamGenerator?: ITeamGenerator) {
    // Use provided dependency or create default for backward compatibility
    this.teamGenerator = teamGenerator ?? new TeamGenerator();
  }

  /**
   * Generate 6 youth players as prospects (not yet added to team)
   */
  generateYouthProspects(
    currentYear: number,
    seed?: number
  ): Player[] {
    const prospects: Player[] = [];
    // Weighted distribution: fewer GKs, more MID/FWD
    const positions: ('GK' | 'DEF' | 'MID' | 'MID' | 'FWD' | 'FWD')[] = ['GK', 'DEF', 'MID', 'MID', 'FWD', 'FWD'];

    for (let i = 0; i < 6; i++) {
      const position = positions[i];
      const playerSeed = seed ? seed + i * 100 : undefined;

      // Generate youth player (skill 3-7, age 16-18)
      const youthPlayer = this.generateYouthPlayer(position, currentYear, playerSeed);
      prospects.push(youthPlayer);
    }

    return prospects;
  }

  /**
   * Add selected youth players to team
   */
  addYouthPlayersToTeam(
    team: Team,
    selectedPlayers: Player[]
  ): Team {
    return {
      ...team,
      players: [...team.players, ...selectedPlayers],
    };
  }

  /**
   * Generate 2-4 youth players for AI teams (automatic selection)
   */
  generateYouthPlayers(
    team: Team,
    currentYear: number,
    seed?: number
  ): { team: Team; newPlayers: Player[] } {
    // Determine how many players (2-4)
    const count = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4

    const newPlayers: Player[] = [];
    // Weighted distribution: fewer GKs, more MID/FWD
    const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['DEF', 'MID', 'MID', 'FWD'];

    for (let i = 0; i < count; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const playerSeed = seed ? seed + i * 100 : undefined;

      // Generate youth player (skill 3-7, age 16-18)
      const youthPlayer = this.generateYouthPlayer(position, currentYear, playerSeed);
      newPlayers.push(youthPlayer);
    }

    return {
      team: {
        ...team,
        players: [...team.players, ...newPlayers],
      },
      newPlayers,
    };
  }

  /**
   * Generate a single youth player
   */
  private generateYouthPlayer(
    position: 'GK' | 'DEF' | 'MID' | 'FWD',
    _currentYear: number,
    seed?: number
  ): Player {
    // Use TeamGenerator to create base player with youth skill range
    const basePlayer = this.teamGenerator.generatePlayer(
      position,
      [3, 7], // Youth skill range
      seed
    );

    // Override age to 16-18
    const youthAge = 16 + Math.floor(Math.random() * 3); // 16, 17, or 18

    // Lower wages for youth players (£500-1500/week)
    const youthWages = 500 + Math.floor(Math.random() * 1000);

    return {
      ...basePlayer,
      age: youthAge,
      wages: youthWages,
    };
  }
}
