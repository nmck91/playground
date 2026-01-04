/**
 * Morale Manager Interface
 *
 * Defines the contract for player morale calculation and management.
 */

import { Player, Team, LeagueTable, MoraleInfo } from '../types';

export interface IMoraleManager {
  /**
   * Calculate player morale (0-100) based on team performance, playing time,
   * wages, contract status, and other factors
   */
  calculatePlayerMorale(
    player: Player,
    team: Team,
    leaguePosition: number,
    recentForm: number,
    currentWeek: number
  ): number;

  /**
   * Get morale info from morale value
   */
  getMoraleInfo(moraleValue: number): MoraleInfo;

  /**
   * Apply morale modifier to player skill
   */
  applyMoraleToSkill(baseSkill: number, morale: MoraleInfo): number;

  /**
   * Update morale for entire team
   */
  updateTeamMorale(
    team: Team,
    leagueTable: LeagueTable[],
    currentWeek: number
  ): {
    team: Team;
    unhappyPlayers: Array<{ name: string; morale: MoraleInfo }>;
  };

  /**
   * Check if player should request transfer due to low morale
   */
  shouldRequestTransfer(player: Player, morale: MoraleInfo): boolean;
}
