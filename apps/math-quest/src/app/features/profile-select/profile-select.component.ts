import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayerProfileService, AudioService } from '../../core/services';

@Component({
  selector: 'app-profile-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-select.component.html',
  styleUrl: './profile-select.component.css',
})
export class ProfileSelectComponent {
  private playerService = inject(PlayerProfileService);
  private audioService = inject(AudioService);
  private router = inject(Router);

  players = this.playerService.players;
  newPlayerName = '';
  showCreateForm = false;

  selectPlayer(playerId: string): void {
    // Initialize audio on first user interaction
    this.audioService.initialize();
    this.playerService.selectPlayer(playerId);
    this.router.navigate(['/world-map']);
  }

  createPlayer(): void {
    if (this.newPlayerName.trim()) {
      // Initialize audio on first user interaction
      this.audioService.initialize();
      const player = this.playerService.createPlayer(this.newPlayerName.trim());
      this.playerService.selectPlayer(player.id);
      this.newPlayerName = '';
      this.showCreateForm = false;
      this.router.navigate(['/world-map']);
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.newPlayerName = '';
  }

  deletePlayer(playerId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this explorer?')) {
      this.playerService.deletePlayer(playerId);
    }
  }
}
