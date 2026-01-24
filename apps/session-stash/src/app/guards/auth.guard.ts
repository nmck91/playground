import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthState } from '../state/auth.state';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // If not initialized yet, let resolver handle it
  if (!authState.initialized()) {
    return true;
  }

  if (authState.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
