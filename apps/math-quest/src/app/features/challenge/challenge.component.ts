import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  GameStateService,
  PlayerProfileService,
  DifficultyService,
  AudioService,
} from '../../core/services';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge.component.html',
  styleUrl: './challenge.component.css',
})
export class ChallengeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  private gameState = inject(GameStateService);
  private playerService = inject(PlayerProfileService);
  private difficultyService = inject(DifficultyService);
  private audioService = inject(AudioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  currentProblem = this.gameState.currentProblem;
  challengeProgress = this.gameState.challengeProgress;
  isLastProblem = this.gameState.isLastProblem;
  selectedLocation = this.gameState.selectedLocation;

  userAnswer = '';
  showFeedback = false;
  isCorrect = false;

  // Timer
  elapsedTimeMs = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private challengeStartTime = 0;

  ngOnInit(): void {
    const locationId = this.route.snapshot.params['locationId'];
    const location = this.gameState.getLocationById(locationId);

    if (!location) {
      this.router.navigate(['/world-map']);
      return;
    }

    // Initialize audio
    this.audioService.initialize();

    // Get difficulty level
    const player = this.playerService.activePlayer();
    const level = player ? this.difficultyService.getRecommendedLevel(location.recommendedLevel) : 1;

    // Start challenge
    this.gameState.selectLocation(location);
    this.gameState.startChallenge(level);

    // Start timer
    this.challengeStartTime = Date.now();
    this.startTimer();
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.elapsedTimeMs = Date.now() - this.challengeStartTime;
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  private focusInput(): void {
    setTimeout(() => {
      this.answerInput?.nativeElement?.focus();
    }, 0);
  }

  submitAnswer(): void {
    const answer = parseInt(this.userAnswer, 10);
    if (isNaN(answer)) return;

    const problem = this.currentProblem();
    if (!problem) return;

    const attempt = this.gameState.submitAnswer(answer);

    // Record for adaptive difficulty
    this.difficultyService.recordAttempt(
      attempt.isCorrect,
      attempt.timeSpentMs,
      problem.operation
    );

    // Show feedback
    this.isCorrect = attempt.isCorrect;
    this.showFeedback = true;

    // Play sound
    this.audioService.play(attempt.isCorrect ? 'correct' : 'incorrect');

    // Continue after feedback
    setTimeout(() => {
      this.showFeedback = false;
      this.userAnswer = '';

      if (this.isLastProblem()) {
        this.completeChallenge();
      } else {
        this.gameState.nextProblem();
        this.focusInput();
      }
    }, 1000);
  }

  private completeChallenge(): void {
    this.stopTimer();
    this.gameState.completeChallenge();
    this.difficultyService.adjustDifficulty();
    this.router.navigate(['/results']);
  }

  goBack(): void {
    this.stopTimer();
    this.gameState.resetChallenge();
    this.router.navigate(['/world-map']);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
