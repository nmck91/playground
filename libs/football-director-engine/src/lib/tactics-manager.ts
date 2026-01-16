/**
 * Football Director Engine - Tactics Manager
 * Manages team formations and tactical setups
 */

import {
  FormationType,
  Mentality,
  Tactics,
  Team,
  DefenderRole,
  MidfielderRole,
  ForwardRole,
  TeamInstructions,
  PlayerRoles,
  FormationRequirements,
} from './types';
import { getDefaultPlayerRoles, getDefaultTeamInstructions } from './migration';
import { ITacticsManager } from './interfaces/tactics-manager.interface';

// Re-export interface for convenience
export type { ITacticsManager };

export class TacticsManager implements ITacticsManager {
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
      // Story 1.5.2: Now required fields
      roles: getDefaultPlayerRoles(),
      instructions: getDefaultTeamInstructions(),
      setPieces: {
        cornerTaker: '', // Will be set when players are available
        freeKickTaker: '',
        penaltyTaker: '',
      },
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

  // ===== ADVANCED TACTICS METHODS =====

  /**
   * Get default team instructions
   */
  getDefaultInstructions(): TeamInstructions {
    return {
      tempo: 'balanced',
      width: 'balanced',
      pressing: 'medium',
      passingStyle: 'mixed',
    };
  }

  /**
   * Get default player roles
   */
  getDefaultRoles(): PlayerRoles {
    return {
      defenders: 'full-back',
      midfielders: 'box-to-box',
      forwards: 'poacher',
    };
  }

  /**
   * Get available roles for defenders
   */
  getDefenderRoles(): DefenderRole[] {
    return ['full-back', 'wing-back', 'ball-playing-defender'];
  }

  /**
   * Get available roles for midfielders
   */
  getMidfielderRoles(): MidfielderRole[] {
    return ['defensive-midfielder', 'box-to-box', 'attacking-midfielder'];
  }

  /**
   * Get available roles for forwards
   */
  getForwardRoles(): ForwardRole[] {
    return ['target-man', 'poacher', 'false-nine'];
  }

  /**
   * Get role description
   */
  getRoleDescription(role: DefenderRole | MidfielderRole | ForwardRole): string {
    const descriptions: Record<string, string> = {
      'full-back': 'Balanced defender, solid at the back',
      'wing-back': 'Attacking full-back who pushes forward',
      'ball-playing-defender': 'Technical defender who helps build play',
      'defensive-midfielder': 'Sits deep, breaks up play',
      'box-to-box': 'All-action midfielder, contributes both ends',
      'attacking-midfielder': 'Creative playmaker, focuses on attack',
      'target-man': 'Physical striker who holds up play',
      'poacher': 'Goal-focused striker, penalty box threat',
      'false-nine': 'Deep-lying forward who drops into midfield',
    };
    return descriptions[role] || '';
  }

  /**
   * Get instruction description
   */
  getInstructionDescription(
    category: keyof TeamInstructions,
    value: string
  ): string {
    const descriptions: Record<string, Record<string, string>> = {
      tempo: {
        slow: 'Patient buildup, maintain possession',
        balanced: 'Moderate pace, mix of styles',
        fast: 'Quick transitions, high intensity',
      },
      width: {
        narrow: 'Play through the middle',
        balanced: 'Use full width when needed',
        wide: 'Stretch the pitch, use wingers',
      },
      pressing: {
        low: 'Sit back, defend deep',
        medium: 'Press in own half',
        high: 'Aggressive pressing, win ball early',
      },
      passingStyle: {
        short: 'Keep it on the ground, build patiently',
        mixed: 'Vary passing length',
        long: 'Direct play, bypass midfield',
      },
    };
    return descriptions[category]?.[value] || '';
  }

  /**
   * Calculate modifier from player roles
   * Returns adjustment to tactical modifier (-0.1 to +0.1)
   */
  calculateRoleModifier(roles: PlayerRoles | undefined): number {
    if (!roles) return 0;

    let modifier = 0;

    // Defender role modifiers
    if (roles.defenders === 'wing-back') {
      modifier += 0.05; // More attacking threat
    } else if (roles.defenders === 'ball-playing-defender') {
      modifier += 0.03; // Better build-up play
    }
    // full-back is baseline (0)

    // Midfielder role modifiers
    if (roles.midfielders === 'attacking-midfielder') {
      modifier += 0.05; // More creative threat
    } else if (roles.midfielders === 'defensive-midfielder') {
      modifier -= 0.03; // Less attacking output
    }
    // box-to-box is baseline (0)

    // Forward role modifiers
    if (roles.forwards === 'poacher') {
      modifier += 0.05; // Clinical finisher
    } else if (roles.forwards === 'false-nine') {
      modifier += 0.03; // Creative link-up
    }
    // target-man is baseline (0)

    return modifier;
  }

  /**
   * Calculate modifier from team instructions
   * Returns adjustment to tactical modifier (-0.15 to +0.15)
   */
  calculateInstructionsModifier(
    instructions: TeamInstructions | undefined
  ): number {
    if (!instructions) return 0;

    let modifier = 0;

    // Tempo modifiers
    if (instructions.tempo === 'fast') {
      modifier += 0.05; // More attacking opportunities
    } else if (instructions.tempo === 'slow') {
      modifier -= 0.03; // Fewer chances created
    }

    // Width modifiers
    if (instructions.width === 'wide') {
      modifier += 0.03; // Stretch defense, create space
    } else if (instructions.width === 'narrow') {
      modifier += 0.02; // Overload center
    }

    // Pressing modifiers
    if (instructions.pressing === 'high') {
      modifier += 0.05; // Win ball in dangerous areas
    } else if (instructions.pressing === 'low') {
      modifier -= 0.05; // Less proactive
    }

    // Passing style modifiers
    if (instructions.passingStyle === 'long') {
      modifier += 0.02; // Direct threat
    } else if (instructions.passingStyle === 'short') {
      modifier += 0.03; // Control game
    }

    return modifier;
  }

  /**
   * Calculate combined advanced tactics modifier
   * Integrates with existing calculateTacticalModifier
   */
  calculateAdvancedTacticsModifier(tactics: Tactics): number {
    const roleModifier = this.calculateRoleModifier(tactics.roles);
    const instructionsModifier = this.calculateInstructionsModifier(
      tactics.instructions
    );

    // Combine modifiers (additive)
    return roleModifier + instructionsModifier;
  }
}
