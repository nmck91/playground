import {
  MathOperation,
  MathProblem,
  ChallengeConfig,
} from '../models/challenge.model';
import { DifficultyParams, DIFFICULTY_PRESETS } from '../models/difficulty.model';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a single math problem based on operation and difficulty
 */
export function generateProblem(
  operation: MathOperation,
  params: DifficultyParams
): MathProblem {
  let operand1: number;
  let operand2: number;
  let correctAnswer: number;
  let displayString: string;

  switch (operation) {
    case 'addition':
      operand1 = randomInt(1, params.additionMax);
      operand2 = randomInt(1, params.additionMax);
      correctAnswer = operand1 + operand2;
      displayString = `${operand1} + ${operand2} = ?`;
      break;

    case 'subtraction':
      // Ensure positive result for younger players
      operand1 = randomInt(1, params.subtractionMax);
      operand2 = randomInt(1, Math.min(operand1, params.subtractionMax));
      correctAnswer = operand1 - operand2;
      displayString = `${operand1} - ${operand2} = ?`;
      break;

    case 'multiplication':
      operand1 = randomInt(1, params.multiplicationMax);
      operand2 = randomInt(1, params.multiplicationMax);
      correctAnswer = operand1 * operand2;
      displayString = `${operand1} × ${operand2} = ?`;
      break;

    case 'division':
      // Generate division that results in whole number
      operand2 = randomInt(1, params.divisionMax);
      correctAnswer = randomInt(1, params.divisionMax);
      operand1 = operand2 * correctAnswer;
      displayString = `${operand1} ÷ ${operand2} = ?`;
      break;
  }

  return {
    id: generateId(),
    operand1,
    operand2,
    operation,
    correctAnswer,
    displayString,
  };
}

/**
 * Generate a set of problems for a challenge
 */
export function generateProblems(config: ChallengeConfig): MathProblem[] {
  const params = DIFFICULTY_PRESETS[config.difficultyLevel] || DIFFICULTY_PRESETS[1];
  const problems: MathProblem[] = [];
  const operations: MathOperation[] =
    config.operation === 'mixed'
      ? ['addition', 'subtraction', 'multiplication', 'division']
      : [config.operation];

  for (let i = 0; i < config.problemCount; i++) {
    const operation = operations[randomInt(0, operations.length - 1)];
    problems.push(generateProblem(operation, params));
  }

  return problems;
}

/**
 * Calculate score for a challenge based on performance
 */
export function calculateScore(
  correctCount: number,
  totalCount: number,
  totalTimeMs: number,
  timeLimitMs: number
): number {
  // Base score from accuracy (0-70 points)
  const accuracyScore = (correctCount / totalCount) * 70;

  // Time bonus (0-30 points) - faster = more points
  const averageTimePerProblem = totalTimeMs / totalCount;
  const timePerProblemLimit = timeLimitMs;
  const timeRatio = Math.max(0, 1 - averageTimePerProblem / timePerProblemLimit);
  const timeScore = timeRatio * 30;

  return Math.round(accuracyScore + timeScore);
}

/**
 * Calculate XP earned from a challenge
 */
export function calculateXpEarned(
  score: number,
  baseXp: number,
  streakMultiplier: number
): number {
  // Score-based XP (50-100% of base)
  const scoreMultiplier = 0.5 + (score / 100) * 0.5;

  // Effort bonus - always get at least 50% for trying
  const effortBonus = baseXp * 0.5;

  // Streak bonus
  const streakBonus = Math.min(streakMultiplier * 0.1, 0.5); // Max 50% bonus

  const totalXp = baseXp * scoreMultiplier * (1 + streakBonus) + effortBonus;
  return Math.round(totalXp);
}
