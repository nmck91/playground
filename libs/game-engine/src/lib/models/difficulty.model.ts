import { MathOperation } from './challenge.model';

/**
 * Difficulty parameters for generating math problems
 */
export interface DifficultyParams {
  level: number; // 1-10 scale

  // Number ranges per operation
  additionMax: number;
  subtractionMax: number;
  multiplicationMax: number;
  divisionMax: number;

  // Time pressure
  timeLimitMs: number;

  // Problem count
  problemsPerChallenge: number;
}

/**
 * Difficulty presets for different levels
 */
export const DIFFICULTY_PRESETS: Record<number, DifficultyParams> = {
  1: {
    level: 1,
    additionMax: 10,
    subtractionMax: 10,
    multiplicationMax: 2,
    divisionMax: 2,
    timeLimitMs: 20000,
    problemsPerChallenge: 5,
  },
  2: {
    level: 2,
    additionMax: 15,
    subtractionMax: 15,
    multiplicationMax: 3,
    divisionMax: 3,
    timeLimitMs: 18000,
    problemsPerChallenge: 5,
  },
  3: {
    level: 3,
    additionMax: 20,
    subtractionMax: 20,
    multiplicationMax: 5,
    divisionMax: 5,
    timeLimitMs: 15000,
    problemsPerChallenge: 6,
  },
  4: {
    level: 4,
    additionMax: 30,
    subtractionMax: 30,
    multiplicationMax: 6,
    divisionMax: 6,
    timeLimitMs: 15000,
    problemsPerChallenge: 7,
  },
  5: {
    level: 5,
    additionMax: 50,
    subtractionMax: 50,
    multiplicationMax: 8,
    divisionMax: 8,
    timeLimitMs: 12000,
    problemsPerChallenge: 8,
  },
  6: {
    level: 6,
    additionMax: 75,
    subtractionMax: 75,
    multiplicationMax: 10,
    divisionMax: 10,
    timeLimitMs: 12000,
    problemsPerChallenge: 8,
  },
  7: {
    level: 7,
    additionMax: 100,
    subtractionMax: 100,
    multiplicationMax: 12,
    divisionMax: 12,
    timeLimitMs: 10000,
    problemsPerChallenge: 10,
  },
  8: {
    level: 8,
    additionMax: 150,
    subtractionMax: 150,
    multiplicationMax: 12,
    divisionMax: 12,
    timeLimitMs: 10000,
    problemsPerChallenge: 10,
  },
  9: {
    level: 9,
    additionMax: 200,
    subtractionMax: 200,
    multiplicationMax: 15,
    divisionMax: 15,
    timeLimitMs: 8000,
    problemsPerChallenge: 12,
  },
  10: {
    level: 10,
    additionMax: 500,
    subtractionMax: 500,
    multiplicationMax: 20,
    divisionMax: 20,
    timeLimitMs: 8000,
    problemsPerChallenge: 12,
  },
};

/**
 * Performance metrics used for adaptive difficulty
 */
export interface PerformanceMetrics {
  recentAccuracy: number; // Last 10 problems
  recentAverageTimeMs: number;
  streakLength: number;
  operationAccuracies: Record<MathOperation, number>;
}

/**
 * Result of difficulty adjustment calculation
 */
export interface DifficultyAdjustment {
  newLevel: number;
  reason: string;
  confidence: number; // 0-1 scale
}
