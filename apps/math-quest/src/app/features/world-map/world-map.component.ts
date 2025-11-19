import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService, PlayerProfileService } from '../../core/services';
import { Location } from '@playground/game-engine';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.css',
})
export class WorldMapComponent {
  private gameState = inject(GameStateService);
  private playerService = inject(PlayerProfileService);
  private router = inject(Router);

  locations = this.gameState.locations;
  activePlayer = this.playerService.activePlayer;

  isLocationUnlocked(location: Location): boolean {
    const player = this.activePlayer();
    if (!player) return false;
    return player.stamps.length >= location.requiredStamps;
  }

  selectLocation(location: Location): void {
    if (this.isLocationUnlocked(location)) {
      this.gameState.selectLocation(location);
      this.router.navigate(['/challenge', location.id]);
    }
  }

  goToPassport(): void {
    this.router.navigate(['/passport']);
  }

  goToPets(): void {
    this.router.navigate(['/pets']);
  }

  switchPlayer(): void {
    this.playerService.clearActivePlayer();
    this.router.navigate(['/profile-select']);
  }
}
