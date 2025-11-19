import { Pet } from './pet.model';

/**
 * Player profile representing a child user
 */
export interface Player {
  id: string;
  name: string;
  avatarId: string;
  createdAt: Date;

  // Progress tracking
  totalXp: number;
  currentLevel: number;

  // Passport progress
  stamps: string[]; // Location IDs completed
  artifacts: string[]; // Collected artifact IDs

  // Pet companions
  pets: Pet[];
  activePetId: string | null;

  // Stats for adaptive difficulty
  stats: PlayerStats;

  // Customization unlocks
  unlockedAvatars: string[];
  unlockedAccessories: string[];
}

/**
 * Player statistics for tracking performance
 */
export interface PlayerStats {
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  totalTimePlayedMs: number;
  sessionsCompleted: number;
  currentStreak: number;
  bestStreak: number;

  // Per-operation stats
  additionAccuracy: number;
  subtractionAccuracy: number;
  multiplicationAccuracy: number;
  divisionAccuracy: number;

  // Average response times
  averageResponseTimeMs: number;

  // Last activity
  lastPlayedAt: Date;
}

/**
 * Create a new player with default values
 */
export function createDefaultPlayer(name: string, id: string): Player {
  return {
    id,
    name,
    avatarId: 'explorer-default',
    createdAt: new Date(),
    totalXp: 0,
    currentLevel: 1,
    stamps: [],
    artifacts: [],
    pets: [],
    activePetId: null,
    stats: createDefaultStats(),
    unlockedAvatars: ['explorer-default'],
    unlockedAccessories: [],
  };
}

/**
 * Create default player statistics
 */
export function createDefaultStats(): PlayerStats {
  return {
    totalProblemsAttempted: 0,
    totalProblemsCorrect: 0,
    totalTimePlayedMs: 0,
    sessionsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    additionAccuracy: 0,
    subtractionAccuracy: 0,
    multiplicationAccuracy: 0,
    divisionAccuracy: 0,
    averageResponseTimeMs: 0,
    lastPlayedAt: new Date(),
  };
}
