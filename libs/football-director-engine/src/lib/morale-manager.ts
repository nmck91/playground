/**
 * Football Director Engine - Morale Manager
 * Manages player happiness and its effects on performance
 */

import { Player, Team, LeagueTable, MoraleInfo } from './types';

/**
 * Morale Manager Interface
 *
 * Defines the contract for managing player morale and its effects.
 */
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

/**
 * Morale Manager Implementation
 */
export class MoraleManager implements IMoraleManager {
  /**
   * Calculate player morale based on various factors
   * Returns morale value (0-100)
   */
  calculatePlayerMorale(
    player: Player,
    _team: Team,
    leaguePosition: number,
    recentForm: number, // Last 5 matches points (0-15)
    currentWeek: number
  ): number {
    let morale = 50; // Start at neutral

    // 1. Team Performance (+/- 15)
    if (leaguePosition === 1) morale += 15;
    else if (leaguePosition <= 4) morale += 10;
    else if (leaguePosition <= 10) morale += 5;
    else if (leaguePosition >= 18) morale -= 10;
    else if (leaguePosition >= 15) morale -= 5;

    // 2. Recent Form (+/- 10)
    const formPercent = recentForm / 15; // 0-1
    morale += (formPercent - 0.5) * 20; // -10 to +10

    // 3. Playing Time (+/- 15)
    const playingTimePercent = player.stats.appearances / Math.max(1, currentWeek - 7);
    if (playingTimePercent >= 0.8) morale += 15; // Regular starter
    else if (playingTimePercent >= 0.5) morale += 5; // Rotation player
    else if (playingTimePercent >= 0.2) morale -= 5; // Bench warmer
    else morale -= 15; // Never plays

    // 4. Wages vs Skill (+/- 10)
    const expectedWages = Math.pow(player.skill, 2.2) * 100;
    const wageRatio = player.contract?.weeklyWage || player.wages / expectedWages;
    if (wageRatio >= 1.2) morale += 10; // Overpaid (happy!)
    else if (wageRatio >= 0.9) morale += 0; // Fair wages
    else if (wageRatio >= 0.7) morale -= 5; // Underpaid
    else morale -= 10; // Severely underpaid

    // 5. Injury/Suspension (-5)
    if (player.injury) morale -= 5;
    if (player.suspendedUntil && currentWeek < player.suspendedUntil) morale -= 5;

    // 6. Contract Status (+/- 5)
    if (player.contract) {
      if (player.contract.status === 'expiring' || player.contract.status === 'expired') {
        morale -= 5; // Uncertain future
      } else if (player.contract.yearsRemaining >= 3) {
        morale += 5; // Job security
      }
    }

    // 7. Age Factor
    if (player.age >= 33) morale -= 5; // Decline phase worries
    if (player.age <= 21 && playingTimePercent >= 0.3) morale += 5; // Youth getting chances

    // Clamp to 0-100
    return Math.max(0, Math.min(100, morale));
  }

  /**
   * Get morale info from morale value
   */
  getMoraleInfo(moraleValue: number): MoraleInfo {
    if (moraleValue >= 75) {
      return {
        level: 'high',
        value: moraleValue,
        emoji: '😊',
        statModifier: 0.05, // +5%
        description: 'High Morale',
      };
    } else if (moraleValue >= 40) {
      return {
        level: 'normal',
        value: moraleValue,
        emoji: '😐',
        statModifier: 0, // No effect
        description: 'Normal Morale',
      };
    } else if (moraleValue >= 20) {
      return {
        level: 'low',
        value: moraleValue,
        emoji: '☹️',
        statModifier: -0.05, // -5%
        description: 'Low Morale',
      };
    } else {
      return {
        level: 'very-low',
        value: moraleValue,
        emoji: '😡',
        statModifier: -0.10, // -10%
        description: 'Very Low Morale',
      };
    }
  }

  /**
   * Apply morale modifier to player skill
   */
  applyMoraleToSkill(baseSkill: number, morale: MoraleInfo): number {
    const modifiedSkill = baseSkill * (1 + morale.statModifier);
    return Math.max(1, Math.min(20, Math.round(modifiedSkill)));
  }

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
  } {
    const unhappyPlayers: Array<{ name: string; morale: MoraleInfo }> = [];

    // Find team's league position
    const teamEntry = leagueTable.find((t) => t.teamId === team.id);
    const leaguePosition = teamEntry
      ? leagueTable.findIndex((t) => t.teamId === team.id) + 1
      : 10;

    // Calculate recent form (last 5 matches - simplified)
    const recentForm = this.calculateRecentForm(teamEntry);

    const updatedPlayers = team.players.map((player) => {
      const moraleValue = this.calculatePlayerMorale(
        player,
        team,
        leaguePosition,
        recentForm,
        currentWeek
      );

      const moraleInfo = this.getMoraleInfo(moraleValue);

      // Track very unhappy players
      if (moraleInfo.level === 'very-low') {
        unhappyPlayers.push({ name: player.name, morale: moraleInfo });
      }

      return {
        ...player,
        morale: moraleValue,
      };
    });

    return {
      team: {
        ...team,
        players: updatedPlayers,
      },
      unhappyPlayers,
    };
  }

  /**
   * Calculate recent form from league table
   */
  private calculateRecentForm(teamEntry?: LeagueTable): number {
    if (!teamEntry) return 7.5; // Neutral

    // Approximate form based on points
    const pointsPerGame = teamEntry.points / Math.max(1, teamEntry.played);

    // 3 points per game = 15 (5 wins), 0 = 0 (5 losses)
    return Math.min(15, pointsPerGame * 5);
  }

  /**
   * Check if player should request transfer (very low morale)
   */
  shouldRequestTransfer(_player: Player, morale: MoraleInfo): boolean {
    return morale.level === 'very-low' && Math.random() < 0.3; // 30% chance
  }
}
