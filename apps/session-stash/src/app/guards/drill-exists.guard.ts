import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DrillService } from '../services/drill.service';

export const drillExistsGuard: CanActivateFn = async (route) => {
  const drillService = inject(DrillService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    return router.createUrlTree(['/not-found']);
  }

  const exists = await drillService.checkDrillExists(id);
  if (!exists) {
    return router.createUrlTree(['/not-found']);
  }

  return true;
};
