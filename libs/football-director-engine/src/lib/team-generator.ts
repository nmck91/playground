/**
 * Football Director Engine - Team Generator
 * Generates teams, players, and full leagues
 */

import {
  Team,
  Player,
  Tactics,
  FormationType,
  Mentality,
  DefenderRole,
  MidfielderRole,
  ForwardRole,
} from './types';
import { PlayerStatsTracker } from './player-stats-tracker';
import { StaffManager } from './staff-manager';
import { TacticsManager } from './tactics-manager';
import { getDefaultPlayerContract, getDefaultPlayerMorale } from './migration';

/**
 * Team Generator Interface
 *
 * Defines the contract for generating players, teams, and leagues.
 */
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

/**
 * Team Generator Implementation
 */
export class TeamGenerator implements ITeamGenerator {
  private nameCounter = 0;

  /**
   * Generate a single player with specified position and skill range
   */
  generatePlayer(
    position: Player['position'],
    skillRange: [number, number],
    seed?: number
  ): Player {
    const [minSkill, maxSkill] = skillRange;
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    const skill = Math.floor(minSkill + random * (maxSkill - minSkill + 1));
    const age = 18 + Math.floor(random * 17); // 18-34 years old
    const baseWage = 1500 + skill * 250; // Higher skill = higher wages (reduced from 2000 + 400*skill)
    const wages = Math.floor(baseWage * (0.8 + random * 0.4)); // Add variance

    // Initialize player stats
    const statsTracker = new PlayerStatsTracker();

    const player: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: this.generatePlayerName(seed),
      position,
      skill: Math.min(20, Math.max(1, skill)), // Clamp to 1-20
      age,
      wages,
      stats: statsTracker.initializePlayerStats(),
      history: [],
      // Story 1.5.2: Now required fields
      contract: getDefaultPlayerContract({ wages } as Player, 2024, 1),
      morale: getDefaultPlayerMorale(),
    };

    return player;
  }

  /**
   * Generate a complete team with specified tier
   */
  generateTeam(
    name: string,
    tier: 'elite' | 'strong' | 'mid' | 'weak',
    seed?: number
  ): Team {
    const skillRanges = {
      elite: [14, 18] as [number, number],
      strong: [11, 15] as [number, number],
      mid: [8, 12] as [number, number],
      weak: [5, 9] as [number, number],
    };

    const budgetRanges = {
      elite: [5000000, 10000000],
      strong: [2000000, 5000000],
      mid: [500000, 2000000],
      weak: [100000, 500000],
    };

    const skillRange = skillRanges[tier];
    const [minBudget, maxBudget] = budgetRanges[tier];

    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();
    const budget = Math.floor(minBudget + random * (maxBudget - minBudget));

    // Generate squad: realistic squad size (15-18 players)
    const players: Player[] = [];
    const squadSize = 15 + Math.floor(random * 4); // 15-18 players

    // Base squad: 2 GK, 5 DEF, 5 MID, 3 FWD = 15 players
    const positions: Player['position'][] = [
      'GK',
      'GK',
      'DEF',
      'DEF',
      'DEF',
      'DEF',
      'DEF',
      'MID',
      'MID',
      'MID',
      'MID',
      'MID',
      'FWD',
      'FWD',
      'FWD',
    ];

    // Add additional players based on squad size
    if (squadSize >= 16) {
      positions.push('FWD'); // 16: add 4th forward
    }
    if (squadSize >= 17) {
      positions.push('DEF'); // 17: add 6th defender
    }
    if (squadSize >= 18) {
      positions.push('MID'); // 18: add 6th midfielder
    }

    positions.forEach((position, i) => {
      const playerSeed = seed !== undefined ? seed + i : undefined;
      players.push(this.generatePlayer(position, skillRange, playerSeed));
    });

    // Generate initial staff (1 manager per team)
    const staffManager = new StaffManager();
    const managerSeed = seed !== undefined ? seed + 1000 : undefined;
    const manager = staffManager.generateStaff('manager', managerSeed);

    // Generate varied tactics for AI teams
    const tacticsSeed = seed !== undefined ? seed + 2000 : undefined;
    const tactics = this.generateVariedTactics(players, tacticsSeed);

    // Random philosophy for team (bias toward balanced)
    const philosophyRandom = seed !== undefined ? this.seededRandom(seed + 3000) : Math.random();
    const philosophy =
      philosophyRandom < 0.25 ? 'defensive' : philosophyRandom < 0.75 ? 'balanced' : 'attacking';

    return {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      budget,
      players,
      staff: [manager], // Start with just a manager
      tactics,
      philosophy, // Story 1.5.2: Now required field
    };
  }

  /**
   * Generate varied tactics for AI teams
   * Includes formation, mentality, roles, instructions, and set pieces
   */
  private generateVariedTactics(players: Player[], seed?: number): Tactics {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Random formation
    const formations: FormationType[] = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2'];
    const formation = formations[Math.floor(random * formations.length)];

    // Random mentality (with bias toward balanced)
    const mentalityRoll = seed !== undefined ? this.seededRandom(seed + 1) : Math.random();
    let mentality: Mentality;
    if (mentalityRoll < 0.25) {
      mentality = 'defensive';
    } else if (mentalityRoll < 0.75) {
      mentality = 'balanced';
    } else {
      mentality = 'attacking';
    }

    // Random player roles
    const defenderRoles: DefenderRole[] = ['full-back', 'wing-back', 'ball-playing-defender'];
    const midfielderRoles: MidfielderRole[] = ['defensive-midfielder', 'box-to-box', 'attacking-midfielder'];
    const forwardRoles: ForwardRole[] = ['target-man', 'poacher', 'false-nine'];

    const roleRandom1 = seed !== undefined ? this.seededRandom(seed + 2) : Math.random();
    const roleRandom2 = seed !== undefined ? this.seededRandom(seed + 3) : Math.random();
    const roleRandom3 = seed !== undefined ? this.seededRandom(seed + 4) : Math.random();

    const roles = {
      defenders: defenderRoles[Math.floor(roleRandom1 * defenderRoles.length)],
      midfielders: midfielderRoles[Math.floor(roleRandom2 * midfielderRoles.length)],
      forwards: forwardRoles[Math.floor(roleRandom3 * forwardRoles.length)],
    };

    // Random team instructions (with bias toward balanced)
    const tempoRandom = seed !== undefined ? this.seededRandom(seed + 5) : Math.random();
    const widthRandom = seed !== undefined ? this.seededRandom(seed + 6) : Math.random();
    const pressingRandom = seed !== undefined ? this.seededRandom(seed + 7) : Math.random();
    const passingRandom = seed !== undefined ? this.seededRandom(seed + 8) : Math.random();

    const instructions = {
      tempo: tempoRandom < 0.3 ? 'slow' : tempoRandom < 0.7 ? 'balanced' : 'fast',
      width: widthRandom < 0.3 ? 'narrow' : widthRandom < 0.7 ? 'balanced' : 'wide',
      pressing: pressingRandom < 0.3 ? 'low' : pressingRandom < 0.7 ? 'medium' : 'high',
      passingStyle: passingRandom < 0.3 ? 'short' : passingRandom < 0.7 ? 'mixed' : 'long',
    } as const;

    // Assign set piece takers (best skilled players by position)
    const sortedBySkill = [...players].sort((a, b) => b.skill - a.skill);
    const setPieces = {
      penaltyTaker: sortedBySkill[0]?.id,
      freeKickTaker: sortedBySkill[1]?.id || sortedBySkill[0]?.id,
      cornerTaker: sortedBySkill[2]?.id || sortedBySkill[0]?.id,
    };

    return {
      formation,
      mentality,
      roles,
      instructions,
      setPieces,
    };
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate a full league of 20 teams
   */
  generateLeague(seed?: number): Team[] {
    const teamNames = [
      // Elite teams (4)
      'Manchester Athletic',
      'Liverpool Rangers',
      'Chelsea Warriors',
      'Arsenal Knights',
      // Strong teams (6)
      'Tottenham Eagles',
      'Newcastle Pirates',
      'Manchester City Stars',
      'Aston Villa Lions',
      'Brighton Seagulls',
      'West Ham Hammers',
      // Mid teams (6)
      'Everton Titans',
      'Leicester Foxes',
      'Wolverhampton Wanderers',
      'Crystal Palace Eagles',
      'Fulham Cottagers',
      'Brentford Bees',
      // Weak teams (4)
      'Southampton Saints',
      'Nottingham Forest',
      'Bournemouth Cherries',
      'Luton Town Hatters',
    ];

    const teams: Team[] = [];

    teamNames.forEach((name, i) => {
      let tier: 'elite' | 'strong' | 'mid' | 'weak';

      if (i < 4) tier = 'elite';
      else if (i < 10) tier = 'strong';
      else if (i < 16) tier = 'mid';
      else tier = 'weak';

      const teamSeed = seed !== undefined ? seed + i * 1000 : undefined;
      teams.push(this.generateTeam(name, tier, teamSeed));
    });

    return teams;
  }

  /**
   * Generate a random player name
   */
  private generatePlayerName(seed?: number): string {
    const firstNames = [
      'John',
      'Michael',
      'David',
      'James',
      'Robert',
      'William',
      'Thomas',
      'Daniel',
      'Matthew',
      'Anthony',
      'Luis',
      'Carlos',
      'Pedro',
      'Marco',
      'Andrea',
      'Alessandro',
      'Mohamed',
      'Ahmed',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Martinez',
      'Rodriguez',
      'Silva',
      'Santos',
      'Rossi',
      'Ferrari',
      'Hassan',
      'Ali',
      'Müller',
      'Schmidt',
    ];

    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();
    const firstIdx = Math.floor(random * firstNames.length);
    const lastIdx = Math.floor(this.seededRandom(seed ? seed + 1 : Date.now()) * lastNames.length);

    return `${firstNames[firstIdx]} ${lastNames[lastIdx]}`;
  }
}
