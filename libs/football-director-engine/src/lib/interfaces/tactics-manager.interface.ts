/**
 * Tactics Manager Interface
 *
 * Defines the contract for team tactics and formation management.
 */

import {
  Team,
  Tactics,
  FormationType,
  FormationRequirements,
  Mentality,
  TeamInstructions,
  PlayerRoles,
  DefenderRole,
  MidfielderRole,
  ForwardRole,
} from '../types';

export interface ITacticsManager {
  /**
   * Get the number of players required per position for a given formation
   */
  getFormationRequirements(formation: FormationType): FormationRequirements;

  /**
   * Get default tactics for a new team (4-4-2 balanced)
   */
  getDefaultTactics(): Tactics;

  /**
   * Check if a team has enough available (non-injured/suspended) players to play a formation
   */
  canPlayFormation(team: Team, formation: FormationType): boolean;

  /**
   * Calculate tactical advantage/disadvantage modifier based on formation and mentality matchup
   * Returns multiplier for goal probability (0.8 to 1.2)
   */
  calculateTacticalModifier(ownTactics: Tactics, opponentTactics: Tactics): number;

  /**
   * Get human-readable description of a formation
   */
  getFormationDescription(formation: FormationType): string;

  /**
   * Get human-readable description of a mentality
   */
  getMentalityDescription(mentality: Mentality): string;

  /**
   * Update a team's tactics
   */
  setTeamTactics(team: Team, tactics: Tactics): Team;

  /**
   * Get default team instructions (balanced approach)
   */
  getDefaultInstructions(): TeamInstructions;

  /**
   * Get default player roles (standard roles for each position group)
   */
  getDefaultRoles(): PlayerRoles;

  /**
   * Get all available defender roles
   */
  getDefenderRoles(): DefenderRole[];

  /**
   * Get all available midfielder roles
   */
  getMidfielderRoles(): MidfielderRole[];

  /**
   * Get all available forward roles
   */
  getForwardRoles(): ForwardRole[];

  /**
   * Get human-readable description of a player role
   */
  getRoleDescription(role: DefenderRole | MidfielderRole | ForwardRole): string;

  /**
   * Get human-readable description of a team instruction setting
   */
  getInstructionDescription(category: keyof TeamInstructions, value: string): string;

  /**
   * Calculate modifier from player roles (-0.1 to +0.1)
   */
  calculateRoleModifier(roles: PlayerRoles | undefined): number;

  /**
   * Calculate modifier from team instructions (-0.15 to +0.15)
   */
  calculateInstructionsModifier(instructions: TeamInstructions | undefined): number;

  /**
   * Calculate combined advanced tactics modifier (roles + instructions)
   */
  calculateAdvancedTacticsModifier(tactics: Tactics): number;
}
