import {
  DifficultyAdjustment,
  DifficultyParams,
  DIFFICULTY_PRESETS,
  PerformanceMetrics,
} from '../models/difficulty.model';

/**
 * Calculate new difficulty level based on player performance
 * Uses a simple adaptive algorithm that adjusts based on accuracy and speed
 */
export function calculateDifficultyAdjustment(
  currentLevel: number,
  metrics: PerformanceMetrics
): DifficultyAdjustment {
  let newLevel = currentLevel;
  let reason = 'Maintaining current level';
  let confidence = 0.5;

  const { recentAccuracy, recentAverageTimeMs, streakLength } = metrics;

  // Get current difficulty params for time comparison
  const currentParams = DIFFICULTY_PRESETS[currentLevel] || DIFFICULTY_PRESETS[1];
  const timeRatio = recentAverageTimeMs / currentParams.timeLimitMs;

  // Decision logic
  if (recentAccuracy >= 0.9 && timeRatio < 0.5) {
    // Excellent performance - increase difficulty
    newLevel = Math.min(10, currentLevel + 1);
    reason = 'Excellent accuracy and speed - increasing challenge';
    confidence = 0.8;
  } else if (recentAccuracy >= 0.8 && timeRatio < 0.7) {
    // Good performance - slight increase
    if (streakLength >= 5) {
      newLevel = Math.min(10, currentLevel + 1);
      reason = 'Good performance with streak - increasing challenge';
      confidence = 0.7;
    } else {
      reason = 'Good performance - maintaining to build confidence';
      confidence = 0.6;
    }
  } else if (recentAccuracy < 0.5) {
    // Struggling - decrease difficulty
    newLevel = Math.max(1, currentLevel - 1);
    reason = 'Finding it challenging - adjusting for success';
    confidence = 0.8;
  } else if (recentAccuracy < 0.7 && timeRatio > 1) {
    // Below target and slow - decrease
    newLevel = Math.max(1, currentLevel - 1);
    reason = 'Need more time - adjusting difficulty';
    confidence = 0.7;
  }

  return {
    newLevel,
    reason,
    confidence,
  };
}

/**
 * Get difficulty parameters for a specific level
 */
export function getDifficultyParams(level: number): DifficultyParams {
  const clampedLevel = Math.max(1, Math.min(10, level));
  return DIFFICULTY_PRESETS[clampedLevel];
}

/**
 * Calculate performance metrics from recent attempts
 */
export function calculatePerformanceMetrics(
  recentAttempts: Array<{
    isCorrect: boolean;
    timeSpentMs: number;
    operation: string;
  }>
): PerformanceMetrics {
  if (recentAttempts.length === 0) {
    return {
      recentAccuracy: 0.5,
      recentAverageTimeMs: 10000,
      streakLength: 0,
      operationAccuracies: {
        addition: 0.5,
        subtraction: 0.5,
        multiplication: 0.5,
        division: 0.5,
      },
    };
  }

  // Calculate overall accuracy
  const correctCount = recentAttempts.filter((a) => a.isCorrect).length;
  const recentAccuracy = correctCount / recentAttempts.length;

  // Calculate average time
  const totalTime = recentAttempts.reduce((sum, a) => sum + a.timeSpentMs, 0);
  const recentAverageTimeMs = totalTime / recentAttempts.length;

  // Calculate current streak (from most recent)
  let streakLength = 0;
  for (let i = recentAttempts.length - 1; i >= 0; i--) {
    if (recentAttempts[i].isCorrect) {
      streakLength++;
    } else {
      break;
    }
  }

  // Calculate per-operation accuracy
  const operationAccuracies = {
    addition: calculateOperationAccuracy(recentAttempts, 'addition'),
    subtraction: calculateOperationAccuracy(recentAttempts, 'subtraction'),
    multiplication: calculateOperationAccuracy(recentAttempts, 'multiplication'),
    division: calculateOperationAccuracy(recentAttempts, 'division'),
  };

  return {
    recentAccuracy,
    recentAverageTimeMs,
    streakLength,
    operationAccuracies,
  };
}

/**
 * Calculate accuracy for a specific operation
 */
function calculateOperationAccuracy(
  attempts: Array<{ isCorrect: boolean; operation: string }>,
  operation: string
): number {
  const operationAttempts = attempts.filter((a) => a.operation === operation);
  if (operationAttempts.length === 0) {
    return 0.5; // Default to neutral
  }
  const correct = operationAttempts.filter((a) => a.isCorrect).length;
  return correct / operationAttempts.length;
}

/**
 * Suggest which operations to focus on based on performance
 */
export function suggestOperationFocus(
  metrics: PerformanceMetrics
): string[] {
  const weakOperations: string[] = [];

  Object.entries(metrics.operationAccuracies).forEach(([operation, accuracy]) => {
    if (accuracy < 0.6) {
      weakOperations.push(operation);
    }
  });

  return weakOperations;
}
