/**
 * Football Director Engine - Team Generator
 * Generates teams, players, and full leagues
 */

import { Team, Player } from './types';
import { PlayerStatsTracker } from './player-stats-tracker';
import { StaffManager } from './staff-manager';
import { TacticsManager } from './tactics-manager';

export class TeamGenerator {
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

    return {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: this.generatePlayerName(seed),
      position,
      skill: Math.min(20, Math.max(1, skill)), // Clamp to 1-20
      age,
      wages,
      stats: statsTracker.initializePlayerStats(),
      history: [],
    };
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

    // Set default tactics
    const tacticsManager = new TacticsManager();
    const tactics = tacticsManager.getDefaultTactics();

    return {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      budget,
      players,
      staff: [manager], // Start with just a manager
      tactics, // Default 4-4-2 balanced
    };
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
   * Seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
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
