/**
 * Football Director Engine - Injury Manager
 * Manages player injuries and suspensions
 */

import { Player, Injury, Team, MatchEvent } from './types';
import { IInjuryManager } from './interfaces/injury-manager.interface';

// Re-export interface for convenience
export { IInjuryManager };

/**
 * Injury Manager Implementation
 */
export class InjuryManager implements IInjuryManager {
  /**
   * Injury types with their durations (in weeks) and categories
   */
  private readonly injuryTypes = [
    { type: 'minor' as const, category: 'muscle' as const, description: 'Knock', weeksMin: 1, weeksMax: 1 },
    { type: 'minor' as const, category: 'muscle' as const, description: 'Bruised Foot', weeksMin: 1, weeksMax: 2 },
    { type: 'moderate' as const, category: 'muscle' as const, description: 'Hamstring Strain', weeksMin: 2, weeksMax: 3 },
    { type: 'moderate' as const, category: 'muscle' as const, description: 'Ankle Sprain', weeksMin: 2, weeksMax: 4 },
    { type: 'moderate' as const, category: 'muscle' as const, description: 'Groin Injury', weeksMin: 3, weeksMax: 4 },
    { type: 'serious' as const, category: 'muscle' as const, description: 'Torn Muscle', weeksMin: 4, weeksMax: 6 },
    { type: 'serious' as const, category: 'bone' as const, description: 'Broken Bone', weeksMin: 6, weeksMax: 8 },
    { type: 'serious' as const, category: 'bone' as const, description: 'Knee Ligament', weeksMin: 5, weeksMax: 8 },
    { type: 'moderate' as const, category: 'concussion' as const, description: 'Concussion', weeksMin: 2, weeksMax: 3 },
  ];

  private readonly YELLOW_CARD_SUSPENSION_THRESHOLD = 5; // 5 yellows = 1 match ban
  private readonly YELLOW_CARD_BAN_WEEKS = 1;

  /**
   * Generate random injury
   */
  generateInjury(currentWeek: number): Injury {
    const injuryData = this.injuryTypes[Math.floor(Math.random() * this.injuryTypes.length)];
    const weeksRemaining =
      injuryData.weeksMin +
      Math.floor(Math.random() * (injuryData.weeksMax - injuryData.weeksMin + 1));

    return {
      type: injuryData.type,
      description: injuryData.description,
      weeksRemaining,
      sustainedInWeek: currentWeek,
    };
  }

  /**
   * Process injuries after a match
   * Returns updated team with any new injuries
   */
  processMatchInjuries(team: Team, currentWeek: number): {
    team: Team;
    injuries: Array<{ playerName: string; injury: Injury }>;
  } {
    const newInjuries: Array<{ playerName: string; injury: Injury }> = [];
    const updatedPlayers = team.players.map((player) => {
      // Skip already injured players
      if (player.injury) {
        return player;
      }

      // 5% chance of injury per match (per player)
      const injuryRoll = Math.random();
      if (injuryRoll < 0.05) {
        const injury = this.generateInjury(currentWeek);
        newInjuries.push({ playerName: player.name, injury });

        return {
          ...player,
          injury,
        };
      }

      return player;
    });

    return {
      team: {
        ...team,
        players: updatedPlayers,
      },
      injuries: newInjuries,
    };
  }

  /**
   * Process suspensions from match events
   * Handles both red cards (3 match ban) and yellow card accumulation (5 yellows = 1 match ban)
   * Returns updated team with suspensions applied
   */
  processSuspensions(
    team: Team,
    events: MatchEvent[],
    currentWeek: number,
    isHomeTeam: boolean
  ): {
    team: Team;
    suspensions: Array<{ playerName: string; weeks: number; reason: string }>;
  } {
    const suspensions: Array<{ playerName: string; weeks: number; reason: string }> = [];
    const teamSide = isHomeTeam ? 'home' : 'away';

    // Find all cards for this team
    const redCards = events.filter(
      (event) => event.type === 'red-card' && event.team === teamSide
    );
    const yellowCards = events.filter(
      (event) => event.type === 'yellow-card' && event.team === teamSide
    );

    const updatedPlayers = team.players.map((player) => {
      // Check if player got a red card
      const gotRedCard = redCards.some((event) => event.playerId === player.id);
      const gotYellowCard = yellowCards.some((event) => event.playerId === player.id);

      if (gotRedCard) {
        // Red card = 3 match ban
        const banWeeks = 3;
        suspensions.push({
          playerName: player.name,
          weeks: banWeeks,
          reason: 'Red Card'
        });

        return {
          ...player,
          suspendedUntil: currentWeek + banWeeks,
        };
      }

      // Check yellow card accumulation (5 yellows = 1 match ban)
      if (gotYellowCard) {
        const currentYellows = player.stats.yellowCards || 0;

        // If this yellow brings them to the threshold
        if ((currentYellows + 1) % this.YELLOW_CARD_SUSPENSION_THRESHOLD === 0) {
          suspensions.push({
            playerName: player.name,
            weeks: this.YELLOW_CARD_BAN_WEEKS,
            reason: '5 Yellow Cards'
          });

          return {
            ...player,
            suspendedUntil: currentWeek + this.YELLOW_CARD_BAN_WEEKS,
          };
        }
      }

      return player;
    });

    return {
      team: {
        ...team,
        players: updatedPlayers,
      },
      suspensions,
    };
  }

  /**
   * Calculate recovery bonus from physio staff
   * Good physios can reduce recovery time by up to 1 week
   */
  private calculatePhysioBonus(team: Team): number {
    // Find physio staff (staff with specialty "Physio" or role "coach")
    const physioStaff = team.staff.filter(
      (s) => s.specialty === 'Physio' || (s.role === 'coach' && s.skill >= 15)
    );

    if (physioStaff.length === 0) return 0;

    // Average skill of physio staff
    const avgPhysioSkill = physioStaff.reduce((sum, s) => sum + s.skill, 0) / physioStaff.length;

    // 20% chance per skill point above 12 to reduce recovery by 1 week
    // Skill 15 = 60% chance, Skill 18 = 120% = guaranteed -1 week
    const bonusChance = (avgPhysioSkill - 12) * 0.2;

    return Math.random() < bonusChance ? 1 : 0;
  }

  /**
   * Update injuries at the start of a new week
   * Reduces injury time remaining and clears completed injuries
   * Physio staff can speed up recovery
   */
  updateWeeklyInjuries(team: Team, currentWeek: number): {
    team: Team;
    recovered: string[];
    acceleratedRecovery: string[];
  } {
    const recovered: string[] = [];
    const acceleratedRecovery: string[] = [];
    const physioBonus = this.calculatePhysioBonus(team);

    const updatedPlayers = team.players.map((player) => {
      // Update injury
      if (player.injury) {
        let weeksToReduce = 1;

        // Apply physio bonus (can reduce by additional week)
        if (physioBonus > 0 && player.injury.weeksRemaining > 1) {
          weeksToReduce += physioBonus;
          acceleratedRecovery.push(player.name);
        }

        const newWeeksRemaining = player.injury.weeksRemaining - weeksToReduce;

        if (newWeeksRemaining <= 0) {
          // Player has recovered
          recovered.push(player.name);
          const { injury, ...playerWithoutInjury } = player;
          return playerWithoutInjury;
        }

        // Still injured, reduce time
        return {
          ...player,
          injury: {
            ...player.injury,
            weeksRemaining: newWeeksRemaining,
          },
        };
      }

      // Clear expired suspensions
      if (player.suspendedUntil && currentWeek >= player.suspendedUntil) {
        const { suspendedUntil, ...playerWithoutSuspension} = player;
        return playerWithoutSuspension;
      }

      return player;
    });

    return {
      team: {
        ...team,
        players: updatedPlayers,
      },
      recovered,
      acceleratedRecovery,
    };
  }

  /**
   * Get list of injured players
   */
  getInjuredPlayers(team: Team): Player[] {
    return team.players.filter((p) => p.injury);
  }

  /**
   * Get list of suspended players
   */
  getSuspendedPlayers(team: Team, currentWeek: number): Player[] {
    return team.players.filter((p) => p.suspendedUntil && currentWeek < p.suspendedUntil);
  }

  /**
   * Get list of available (not injured/suspended) players
   */
  getAvailablePlayers(team: Team, currentWeek: number): Player[] {
    return team.players.filter(
      (p) => !p.injury && (!p.suspendedUntil || currentWeek >= p.suspendedUntil)
    );
  }

  /**
   * Check if player is available for selection
   */
  isPlayerAvailable(player: Player, currentWeek: number): boolean {
    return !player.injury && (!player.suspendedUntil || currentWeek >= player.suspendedUntil);
  }
}
