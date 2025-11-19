/**
 * Math operation types supported by the game
 */
export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division';

/**
 * A single math problem for the player to solve
 */
export interface MathProblem {
  id: string;
  operand1: number;
  operand2: number;
  operation: MathOperation;
  correctAnswer: number;
  displayString: string; // e.g., "5 + 3 = ?"
}

/**
 * Result of a single problem attempt
 */
export interface ProblemAttempt {
  problemId: string;
  playerAnswer: number;
  isCorrect: boolean;
  timeSpentMs: number;
  timestamp: Date;
}

/**
 * A challenge session containing multiple problems
 */
export interface Challenge {
  id: string;
  locationId: string;
  problems: MathProblem[];
  attempts: ProblemAttempt[];
  startTime: Date;
  endTime?: Date;
  totalTimeMs?: number;
  score: number;
  completed: boolean;
}

/**
 * Challenge configuration for generating problems
 */
export interface ChallengeConfig {
  operation: MathOperation | 'mixed';
  problemCount: number;
  timeLimitMs?: number;
  difficultyLevel: number; // 1-10 scale
}
