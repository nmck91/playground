import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const { data: { user } } = await authService.getCurrentUser();
    // Check if user has admin role (you'll need to add this to your user metadata)
    const isAdmin = user?.user_metadata?.['role'] === 'admin';

    if (!isAdmin) {
      router.navigate(['/dashboard']);
      return false;
    }

    return true;
  } catch (error) {
    router.navigate(['/login']);
    return false;
  }
};
