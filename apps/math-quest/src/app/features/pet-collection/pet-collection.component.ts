import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerProfileService } from '../../core/services';
import { PET_DEFINITIONS } from '@playground/game-engine';

@Component({
  selector: 'app-pet-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pet-collection.component.html',
  styleUrl: './pet-collection.component.css',
})
export class PetCollectionComponent {
  private playerService = inject(PlayerProfileService);
  private router = inject(Router);

  player = this.playerService.activePlayer;
  allPets = Object.values(PET_DEFINITIONS);

  goBack(): void {
    this.router.navigate(['/world-map']);
  }

  hasPet(species: string): boolean {
    return this.player()?.pets.some(p => p.species === species) || false;
  }

  isActivePet(species: string): boolean {
    const player = this.player();
    if (!player) return false;
    const pet = player.pets.find(p => p.species === species);
    return pet?.id === player.activePetId;
  }

  selectPet(species: string): void {
    const player = this.player();
    if (!player) return;

    const pet = player.pets.find(p => p.species === species);
    if (pet) {
      this.playerService.updatePlayer(player.id, { activePetId: pet.id });
    }
  }
}
