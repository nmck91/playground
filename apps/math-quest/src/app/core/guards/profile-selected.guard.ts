import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PlayerProfileService } from '../services/player-profile.service';

/**
 * Guard to ensure a player profile is selected before accessing game screens
 */
export const profileSelectedGuard: CanActivateFn = () => {
  const playerService = inject(PlayerProfileService);
  const router = inject(Router);

  if (playerService.activePlayer()) {
    return true;
  }

  // Redirect to profile selection
  return router.createUrlTree(['/profile-select']);
};
