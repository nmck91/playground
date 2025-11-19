import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerProfileService, GameStateService } from '../../core/services';
import { getStampTierEmoji, StampTier } from '@playground/game-engine';

@Component({
  selector: 'app-passport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './passport.component.html',
  styleUrl: './passport.component.css',
})
export class PassportComponent {
  private playerService = inject(PlayerProfileService);
  private gameState = inject(GameStateService);
  private router = inject(Router);

  player = this.playerService.activePlayer;
  locations = this.gameState.locations;

  goBack(): void {
    this.router.navigate(['/world-map']);
  }

  hasStamp(stampId: string): boolean {
    return this.player()?.stamps.includes(stampId) || false;
  }

  getStampTier(stampId: string): StampTier | null {
    const player = this.player();
    if (!player) return null;
    return player.stampTiers?.[stampId] || null;
  }

  getStampEmoji(stampId: string): string {
    const tier = this.getStampTier(stampId);
    return tier ? getStampTierEmoji(tier) : '❓';
  }
}
