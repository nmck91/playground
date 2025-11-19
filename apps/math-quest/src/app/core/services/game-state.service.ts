import { Injectable, signal, computed } from '@angular/core';
import {
  Challenge,
  ProblemAttempt,
  Location,
  MVP_LOCATIONS,
  generateProblems,
  calculateScore,
} from '@playground/game-engine';

export type GameScreen = 'profile-select' | 'world-map' | 'challenge' | 'passport' | 'pets' | 'results';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  // Navigation state
  private currentScreenSignal = signal<GameScreen>('profile-select');

  // Challenge state
  private currentChallengeSignal = signal<Challenge | null>(null);
  private currentProblemIndexSignal = signal<number>(0);
  private sessionStartTimeSignal = signal<Date | null>(null);

  // Location state
  private selectedLocationSignal = signal<Location | null>(null);

  // Public readonly signals
  readonly currentScreen = this.currentScreenSignal.asReadonly();
  readonly currentChallenge = this.currentChallengeSignal.asReadonly();
  readonly currentProblemIndex = this.currentProblemIndexSignal.asReadonly();
  readonly selectedLocation = this.selectedLocationSignal.asReadonly();

  // Computed values
  readonly currentProblem = computed(() => {
    const challenge = this.currentChallengeSignal();
    const index = this.currentProblemIndexSignal();
    if (!challenge || index >= challenge.problems.length) return null;
    return challenge.problems[index];
  });

  readonly problemsRemaining = computed(() => {
    const challenge = this.currentChallengeSignal();
    const index = this.currentProblemIndexSignal();
    if (!challenge) return 0;
    return challenge.problems.length - index;
  });

  readonly challengeProgress = computed(() => {
    const challenge = this.currentChallengeSignal();
    const index = this.currentProblemIndexSignal();
    if (!challenge || challenge.problems.length === 0) return 0;
    return (index / challenge.problems.length) * 100;
  });

  readonly isLastProblem = computed(() => {
    const challenge = this.currentChallengeSignal();
    const index = this.currentProblemIndexSignal();
    if (!challenge) return false;
    return index === challenge.problems.length - 1;
  });

  // All locations
  readonly locations = signal<Location[]>(MVP_LOCATIONS);

  /**
   * Navigate to a screen
   */
  navigateTo(screen: GameScreen): void {
    this.currentScreenSignal.set(screen);
  }

  /**
   * Select a location and prepare for challenge
   */
  selectLocation(location: Location): void {
    this.selectedLocationSignal.set(location);
  }

  /**
   * Start a new challenge at the selected location
   */
  startChallenge(difficultyLevel: number): Challenge {
    const location = this.selectedLocationSignal();
    if (!location) {
      throw new Error('No location selected');
    }

    // Generate problems based on location operations
    const operation = location.operations.length === 1
      ? location.operations[0]
      : 'mixed';

    const problems = generateProblems({
      operation,
      problemCount: 10, // Fixed for MVP
      difficultyLevel,
    });

    const challenge: Challenge = {
      id: `challenge-${Date.now()}`,
      locationId: location.id,
      problems,
      attempts: [],
      startTime: new Date(),
      score: 0,
      completed: false,
    };

    this.currentChallengeSignal.set(challenge);
    this.currentProblemIndexSignal.set(0);
    this.sessionStartTimeSignal.set(new Date());
    this.currentScreenSignal.set('challenge');

    return challenge;
  }

  /**
   * Submit an answer for the current problem
   */
  submitAnswer(answer: number): ProblemAttempt {
    const challenge = this.currentChallengeSignal();
    const problem = this.currentProblem();
    const startTime = this.sessionStartTimeSignal();

    if (!challenge || !problem || !startTime) {
      throw new Error('No active challenge or problem');
    }

    const timeSpentMs = Date.now() - startTime.getTime();
    const isCorrect = answer === problem.correctAnswer;

    const attempt: ProblemAttempt = {
      problemId: problem.id,
      playerAnswer: answer,
      isCorrect,
      timeSpentMs,
      timestamp: new Date(),
    };

    // Update challenge with attempt
    this.currentChallengeSignal.update((c) => {
      if (!c) return c;
      return {
        ...c,
        attempts: [...c.attempts, attempt],
      };
    });

    // Reset timer for next problem
    this.sessionStartTimeSignal.set(new Date());

    return attempt;
  }

  /**
   * Move to next problem
   */
  nextProblem(): boolean {
    const challenge = this.currentChallengeSignal();
    const index = this.currentProblemIndexSignal();

    if (!challenge) return false;

    if (index < challenge.problems.length - 1) {
      this.currentProblemIndexSignal.set(index + 1);
      return true;
    }

    return false;
  }

  /**
   * Complete the current challenge
   */
  completeChallenge(): Challenge {
    const challenge = this.currentChallengeSignal();
    if (!challenge) {
      throw new Error('No active challenge');
    }

    const endTime = new Date();
    const totalTimeMs = endTime.getTime() - challenge.startTime.getTime();
    const correctCount = challenge.attempts.filter((a) => a.isCorrect).length;
    const score = calculateScore(
      correctCount,
      challenge.problems.length,
      totalTimeMs,
      10000 // Default time limit per problem
    );

    const completedChallenge: Challenge = {
      ...challenge,
      endTime,
      totalTimeMs,
      score,
      completed: true,
    };

    this.currentChallengeSignal.set(completedChallenge);
    this.currentScreenSignal.set('results');

    return completedChallenge;
  }

  /**
   * Get challenge results
   */
  getChallengeResults(): {
    correctCount: number;
    totalCount: number;
    score: number;
    timeMs: number;
  } | null {
    const challenge = this.currentChallengeSignal();
    if (!challenge) return null;

    return {
      correctCount: challenge.attempts.filter((a) => a.isCorrect).length,
      totalCount: challenge.problems.length,
      score: challenge.score,
      timeMs: challenge.totalTimeMs || 0,
    };
  }

  /**
   * Reset challenge state
   */
  resetChallenge(): void {
    this.currentChallengeSignal.set(null);
    this.currentProblemIndexSignal.set(0);
    this.sessionStartTimeSignal.set(null);
  }

  /**
   * Get location by ID
   */
  getLocationById(id: string): Location | undefined {
    return this.locations().find((l) => l.id === id);
  }

  /**
   * Check if location is unlocked for player
   */
  isLocationUnlocked(locationId: string, playerStamps: string[]): boolean {
    const location = this.getLocationById(locationId);
    if (!location) return false;
    return playerStamps.length >= location.requiredStamps;
  }
}
