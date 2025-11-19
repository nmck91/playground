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
    timeLimitMs: 15000,
    problemsPerChallenge: 5,
  },
  2: {
    level: 2,
    additionMax: 20,
    subtractionMax: 20,
    multiplicationMax: 5,
    divisionMax: 5,
    timeLimitMs: 12000,
    problemsPerChallenge: 6,
  },
  3: {
    level: 3,
    additionMax: 50,
    subtractionMax: 50,
    multiplicationMax: 10,
    divisionMax: 10,
    timeLimitMs: 12000,
    problemsPerChallenge: 7,
  },
  4: {
    level: 4,
    additionMax: 100,
    subtractionMax: 100,
    multiplicationMax: 10,
    divisionMax: 10,
    timeLimitMs: 10000,
    problemsPerChallenge: 8,
  },
  5: {
    level: 5,
    additionMax: 100,
    subtractionMax: 100,
    multiplicationMax: 12,
    divisionMax: 12,
    timeLimitMs: 10000,
    problemsPerChallenge: 10,
  },
  6: {
    level: 6,
    additionMax: 200,
    subtractionMax: 200,
    multiplicationMax: 12,
    divisionMax: 12,
    timeLimitMs: 8000,
    problemsPerChallenge: 10,
  },
  7: {
    level: 7,
    additionMax: 500,
    subtractionMax: 500,
    multiplicationMax: 15,
    divisionMax: 15,
    timeLimitMs: 8000,
    problemsPerChallenge: 12,
  },
  8: {
    level: 8,
    additionMax: 1000,
    subtractionMax: 1000,
    multiplicationMax: 20,
    divisionMax: 20,
    timeLimitMs: 7000,
    problemsPerChallenge: 12,
  },
  9: {
    level: 9,
    additionMax: 1000,
    subtractionMax: 1000,
    multiplicationMax: 25,
    divisionMax: 25,
    timeLimitMs: 6000,
    problemsPerChallenge: 15,
  },
  10: {
    level: 10,
    additionMax: 1000,
    subtractionMax: 1000,
    multiplicationMax: 30,
    divisionMax: 30,
    timeLimitMs: 5000,
    problemsPerChallenge: 15,
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
