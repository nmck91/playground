import { Route } from '@angular/router';
import { profileSelectedGuard } from './core/guards';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'profile-select',
    pathMatch: 'full',
  },
  {
    path: 'profile-select',
    loadComponent: () =>
      import('./features/profile-select/profile-select.component').then(
        (m) => m.ProfileSelectComponent
      ),
  },
  {
    path: 'world-map',
    loadComponent: () =>
      import('./features/world-map/world-map.component').then(
        (m) => m.WorldMapComponent
      ),
    canActivate: [profileSelectedGuard],
  },
  {
    path: 'challenge/:locationId',
    loadComponent: () =>
      import('./features/challenge/challenge.component').then(
        (m) => m.ChallengeComponent
      ),
    canActivate: [profileSelectedGuard],
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./features/results/results.component').then(
        (m) => m.ResultsComponent
      ),
    canActivate: [profileSelectedGuard],
  },
  {
    path: 'passport',
    loadComponent: () =>
      import('./features/passport/passport.component').then(
        (m) => m.PassportComponent
      ),
    canActivate: [profileSelectedGuard],
  },
  {
    path: 'pets',
    loadComponent: () =>
      import('./features/pet-collection/pet-collection.component').then(
        (m) => m.PetCollectionComponent
      ),
    canActivate: [profileSelectedGuard],
  },
  {
    path: '**',
    redirectTo: 'profile-select',
  },
];
