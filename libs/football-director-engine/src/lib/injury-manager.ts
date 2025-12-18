/**
 * Football Director Engine - Injury Manager
 * Manages player injuries and suspensions
 */

import { Player, Injury, Team, MatchEvent } from './types';

export class InjuryManager {
  /**
   * Injury types with their durations (in weeks)
   */
  private readonly injuryTypes = [
    { type: 'minor' as const, description: 'Knock', weeksMin: 1, weeksMax: 1 },
    { type: 'minor' as const, description: 'Bruised Foot', weeksMin: 1, weeksMax: 2 },
    { type: 'moderate' as const, description: 'Hamstring Strain', weeksMin: 2, weeksMax: 3 },
    { type: 'moderate' as const, description: 'Ankle Sprain', weeksMin: 2, weeksMax: 4 },
    { type: 'moderate' as const, description: 'Groin Injury', weeksMin: 3, weeksMax: 4 },
    { type: 'serious' as const, description: 'Torn Muscle', weeksMin: 4, weeksMax: 6 },
    { type: 'serious' as const, description: 'Broken Bone', weeksMin: 6, weeksMax: 8 },
    { type: 'serious' as const, description: 'Knee Ligament', weeksMin: 5, weeksMax: 8 },
  ];

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
   * Returns updated team with suspensions applied
   */
  processSuspensions(
    team: Team,
    events: MatchEvent[],
    currentWeek: number,
    isHomeTeam: boolean
  ): {
    team: Team;
    suspensions: Array<{ playerName: string; weeks: number }>;
  } {
    const suspensions: Array<{ playerName: string; weeks: number }> = [];
    const teamSide = isHomeTeam ? 'home' : 'away';

    // Find all red cards for this team
    const redCards = events.filter(
      (event) => event.type === 'red-card' && event.team === teamSide
    );

    const updatedPlayers = team.players.map((player) => {
      // Check if player got a red card
      const gotRedCard = redCards.some((event) => event.playerId === player.id);

      if (gotRedCard) {
        // Red card = 3 match ban
        const banWeeks = 3;
        suspensions.push({ playerName: player.name, weeks: banWeeks });

        return {
          ...player,
          suspendedUntil: currentWeek + banWeeks,
        };
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
   * Update injuries at the start of a new week
   * Reduces injury time remaining and clears completed injuries
   */
  updateWeeklyInjuries(team: Team, currentWeek: number): {
    team: Team;
    recovered: string[];
  } {
    const recovered: string[] = [];

    const updatedPlayers = team.players.map((player) => {
      // Update injury
      if (player.injury) {
        const newWeeksRemaining = player.injury.weeksRemaining - 1;

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
        const { suspendedUntil, ...playerWithoutSuspension } = player;
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
