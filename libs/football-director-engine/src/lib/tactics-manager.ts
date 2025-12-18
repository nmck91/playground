/**
 * Football Director Engine - Tactics Manager
 * Manages team formations and tactical setups
 */

import { FormationType, Mentality, Tactics, Team } from './types';

export interface FormationRequirements {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

export class TacticsManager {
  /**
   * Get formation requirements (number of players per position)
   */
  getFormationRequirements(formation: FormationType): FormationRequirements {
    const formations: Record<FormationType, FormationRequirements> = {
      '4-4-2': { GK: 1, DEF: 4, MID: 4, FWD: 2 },
      '4-3-3': { GK: 1, DEF: 4, MID: 3, FWD: 3 },
      '3-5-2': { GK: 1, DEF: 3, MID: 5, FWD: 2 },
      '4-5-1': { GK: 1, DEF: 4, MID: 5, FWD: 1 },
      '3-4-3': { GK: 1, DEF: 3, MID: 4, FWD: 3 },
      '5-3-2': { GK: 1, DEF: 5, MID: 3, FWD: 2 },
    };

    return formations[formation];
  }

  /**
   * Get default tactics for a new team
   */
  getDefaultTactics(): Tactics {
    return {
      formation: '4-4-2',
      mentality: 'balanced',
    };
  }

  /**
   * Check if team can play with given formation
   */
  canPlayFormation(team: Team, formation: FormationType): boolean {
    const requirements = this.getFormationRequirements(formation);

    // Count available players per position (excluding injured/suspended)
    const available = {
      GK: 0,
      DEF: 0,
      MID: 0,
      FWD: 0,
    };

    team.players.forEach((player) => {
      // Skip injured or suspended players
      if (player.injury || player.suspendedUntil) {
        return;
      }
      available[player.position]++;
    });

    // Check if we have enough players for each position
    return (
      available.GK >= requirements.GK &&
      available.DEF >= requirements.DEF &&
      available.MID >= requirements.MID &&
      available.FWD >= requirements.FWD
    );
  }

  /**
   * Calculate tactical advantage/disadvantage modifier
   * Returns a multiplier for goal probability (0.8 to 1.2)
   */
  calculateTacticalModifier(
    ownTactics: Tactics,
    opponentTactics: Tactics
  ): number {
    let modifier = 1.0;

    // Formation counters (simplified rock-paper-scissors style)
    const formationCounters: Record<FormationType, FormationType[]> = {
      '4-4-2': ['3-5-2', '4-5-1'], // Wide formations beat compact
      '4-3-3': ['4-4-2', '5-3-2'], // Attack beats balance
      '3-5-2': ['4-3-3', '3-4-3'], // Compact beats attack
      '4-5-1': ['3-4-3', '4-3-3'], // Defensive beats attack
      '3-4-3': ['5-3-2', '4-5-1'], // All-out attack beats defensive
      '5-3-2': ['4-4-2'], // Ultra defensive beats balanced
    };

    // Check if formation counters opponent
    if (formationCounters[ownTactics.formation]?.includes(opponentTactics.formation)) {
      modifier += 0.1; // 10% bonus
    }

    // Mentality vs mentality
    if (ownTactics.mentality === 'attacking' && opponentTactics.mentality === 'defensive') {
      modifier += 0.15; // Attacking exploits defensive
    } else if (ownTactics.mentality === 'defensive' && opponentTactics.mentality === 'attacking') {
      modifier -= 0.1; // Defensive struggles against attacking
    } else if (ownTactics.mentality === 'attacking') {
      modifier += 0.1; // Attacking gets general bonus
    } else if (ownTactics.mentality === 'defensive') {
      modifier -= 0.05; // Defensive gets slight penalty to attack
    }

    // Clamp modifier between 0.8 and 1.2
    return Math.max(0.8, Math.min(1.2, modifier));
  }

  /**
   * Get formation description
   */
  getFormationDescription(formation: FormationType): string {
    const descriptions: Record<FormationType, string> = {
      '4-4-2': 'Balanced and versatile formation with two strikers',
      '4-3-3': 'Attacking formation with wide wingers',
      '3-5-2': 'Compact midfield with wing-backs providing width',
      '4-5-1': 'Defensive formation with a lone striker',
      '3-4-3': 'All-out attack with three forwards',
      '5-3-2': 'Ultra-defensive with five at the back',
    };

    return descriptions[formation];
  }

  /**
   * Get mentality description
   */
  getMentalityDescription(mentality: Mentality): string {
    const descriptions: Record<Mentality, string> = {
      defensive: 'Focus on defending, fewer attacking opportunities',
      balanced: 'Equal focus on attack and defense',
      attacking: 'More aggressive, higher risk of conceding',
    };

    return descriptions[mentality];
  }

  /**
   * Update team tactics
   */
  setTeamTactics(team: Team, tactics: Tactics): Team {
    return {
      ...team,
      tactics,
    };
  }
}
