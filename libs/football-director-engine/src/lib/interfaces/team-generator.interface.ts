/**
 * Team Generator Interface
 *
 * Defines the contract for generating players, teams, and leagues.
 */

import { Player, Team } from '../types';

export interface ITeamGenerator {
  generatePlayer(
    position: Player['position'],
    skillRange: [number, number],
    seed?: number
  ): Player;

  generateTeam(
    name: string,
    tier: 'elite' | 'strong' | 'mid' | 'weak',
    seed?: number
  ): Team;

  generateLeague(seed?: number): Team[];
}
