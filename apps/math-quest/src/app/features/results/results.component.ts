import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  GameStateService,
  PlayerProfileService,
  AudioService,
} from '../../core/services';
import {
  calculateXpEarned,
  calculateStampTier,
  getStampTierMultiplier,
  getStampTierEmoji,
  StampTier,
} from '@playground/game-engine';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit {
  private gameState = inject(GameStateService);
  private playerService = inject(PlayerProfileService);
  private audioService = inject(AudioService);
  private router = inject(Router);

  results: {
    correctCount: number;
    totalCount: number;
    score: number;
    timeMs: number;
    xpEarned: number;
    stampTier: StampTier;
    stampTierEmoji: string;
  } | null = null;

  stampEarned = false;
  petUnlocked: string | null = null;

  ngOnInit(): void {
    const challengeResults = this.gameState.getChallengeResults();
    if (!challengeResults) {
      this.router.navigate(['/world-map']);
      return;
    }

    const location = this.gameState.selectedLocation();
    const player = this.playerService.activePlayer();

    if (!location || !player) {
      this.router.navigate(['/world-map']);
      return;
    }

    // Calculate stamp tier based on score and time
    const avgTimePerProblemMs = challengeResults.timeMs / challengeResults.totalCount;
    const stampTier = calculateStampTier(
      challengeResults.score,
      avgTimePerProblemMs
    );

    // Calculate XP with tier multiplier
    const baseXp = calculateXpEarned(
      challengeResults.score,
      location.xpReward,
      player.stats.currentStreak
    );
    const xpEarned = Math.round(baseXp * getStampTierMultiplier(stampTier));

    this.results = {
      ...challengeResults,
      xpEarned,
      stampTier,
      stampTierEmoji: getStampTierEmoji(stampTier),
    };

    // Update player stats
    this.playerService.updateStats(
      player.id,
      challengeResults.correctCount,
      challengeResults.totalCount,
      challengeResults.timeMs
    );

    // Add XP
    this.playerService.addXp(player.id, xpEarned);

    // Check for stamp (need at least bronze tier - score >= 50)
    if (stampTier !== 'none') {
      const isNewStamp = !player.stamps.includes(location.stampId);
      const currentTier = player.stampTiers?.[location.stampId];

      // Add or upgrade stamp
      this.playerService.addStamp(player.id, location.stampId, stampTier);

      // Only show "earned" notification for new stamps
      if (isNewStamp) {
        this.playerService.addArtifact(player.id, location.artifactId);
        this.stampEarned = true;
        this.audioService.play('stamp');

        // Check for pet unlock
        if (location.unlocksPetId && !player.pets.some(p => p.species === location.unlocksPetId)) {
          this.playerService.unlockPet(player.id, location.unlocksPetId as 'dog' | 'cheetah' | 'eagle' | 'shark');
          this.petUnlocked = location.unlocksPetId;
          this.audioService.play('unlock');
        }
      } else if (stampTier !== currentTier) {
        // Upgraded existing stamp tier
        this.stampEarned = true;
        this.audioService.play('stamp');
      }
    }

    // Play completion sound
    this.audioService.play('complete');
  }

  playAgain(): void {
    const location = this.gameState.selectedLocation();
    if (location) {
      this.router.navigate(['/challenge', location.id]);
    }
  }

  goToMap(): void {
    this.gameState.resetChallenge();
    this.router.navigate(['/world-map']);
  }
}
