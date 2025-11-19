import { Injectable, signal, computed } from '@angular/core';
import {
  DifficultyParams,
  PerformanceMetrics,
  calculateDifficultyAdjustment,
  calculatePerformanceMetrics,
  getDifficultyParams,
  suggestOperationFocus,
} from '@playground/game-engine';

interface AttemptRecord {
  isCorrect: boolean;
  timeSpentMs: number;
  operation: string;
}

@Injectable({
  providedIn: 'root',
})
export class DifficultyService {
  // Current difficulty level (1-10)
  private currentLevelSignal = signal<number>(1);

  // Recent attempts for adaptive calculation
  private recentAttemptsSignal = signal<AttemptRecord[]>([]);

  // Max attempts to track
  private readonly MAX_RECENT_ATTEMPTS = 20;

  // Public readonly
  readonly currentLevel = this.currentLevelSignal.asReadonly();
  readonly recentAttempts = this.recentAttemptsSignal.asReadonly();

  // Computed metrics
  readonly currentParams = computed<DifficultyParams>(() => {
    return getDifficultyParams(this.currentLevelSignal());
  });

  readonly performanceMetrics = computed<PerformanceMetrics>(() => {
    return calculatePerformanceMetrics(this.recentAttemptsSignal());
  });

  readonly suggestedFocus = computed<string[]>(() => {
    return suggestOperationFocus(this.performanceMetrics());
  });

  readonly currentAccuracy = computed<number>(() => {
    return this.performanceMetrics().recentAccuracy;
  });

  /**
   * Set initial difficulty level for a player
   */
  setLevel(level: number): void {
    const clampedLevel = Math.max(1, Math.min(10, level));
    this.currentLevelSignal.set(clampedLevel);
  }

  /**
   * Record an attempt for adaptive difficulty
   */
  recordAttempt(isCorrect: boolean, timeSpentMs: number, operation: string): void {
    this.recentAttemptsSignal.update((attempts) => {
      const newAttempts = [...attempts, { isCorrect, timeSpentMs, operation }];
      // Keep only recent attempts
      if (newAttempts.length > this.MAX_RECENT_ATTEMPTS) {
        return newAttempts.slice(-this.MAX_RECENT_ATTEMPTS);
      }
      return newAttempts;
    });
  }

  /**
   * Adjust difficulty based on recent performance
   * Called after completing a challenge
   */
  adjustDifficulty(): { newLevel: number; reason: string } {
    const metrics = this.performanceMetrics();
    const adjustment = calculateDifficultyAdjustment(
      this.currentLevelSignal(),
      metrics
    );

    if (adjustment.newLevel !== this.currentLevelSignal()) {
      this.currentLevelSignal.set(adjustment.newLevel);
    }

    return {
      newLevel: adjustment.newLevel,
      reason: adjustment.reason,
    };
  }

  /**
   * Reset difficulty tracking (e.g., when switching players)
   */
  reset(): void {
    this.currentLevelSignal.set(1);
    this.recentAttemptsSignal.set([]);
  }

  /**
   * Initialize from player stats
   */
  initializeFromPlayerStats(
    accuracy: number,
    averageTimeMs: number,
    currentLevel: number
  ): void {
    this.currentLevelSignal.set(currentLevel);

    // Pre-populate with synthetic attempts to bootstrap the algorithm
    if (accuracy > 0) {
      const syntheticAttempts: AttemptRecord[] = [];
      for (let i = 0; i < 10; i++) {
        syntheticAttempts.push({
          isCorrect: Math.random() < accuracy,
          timeSpentMs: averageTimeMs,
          operation: 'addition', // Default
        });
      }
      this.recentAttemptsSignal.set(syntheticAttempts);
    }
  }

  /**
   * Get recommended difficulty for a location
   */
  getRecommendedLevel(locationRecommendedLevel: number): number {
    // Use player's current level but consider location recommendation
    const playerLevel = this.currentLevelSignal();
    const accuracy = this.currentAccuracy();

    // If player is doing well, match location recommendation
    if (accuracy >= 0.7) {
      return Math.max(playerLevel, locationRecommendedLevel);
    }

    // If struggling, use lower of the two
    return Math.min(playerLevel, locationRecommendedLevel);
  }
}
