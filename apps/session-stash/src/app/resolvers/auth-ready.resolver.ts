import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthState } from '../state/auth.state';

export const authReadyResolver: ResolveFn<boolean> = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  // Already initialized? Check immediately
  if (authState.initialized()) {
    if (authState.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  // Wait for initialization reactively
  return toObservable(authState.initialized).pipe(
    filter((initialized) => initialized),
    take(1),
    timeout(5000),
    map(() => {
      if (authState.isAuthenticated()) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
