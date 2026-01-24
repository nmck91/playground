import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { authReadyResolver } from './resolvers/auth-ready.resolver';
import { drillExistsGuard } from './guards/drill-exists.guard';

export const appRoutes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./components/auth/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/auth/password-reset/password-reset.component').then(
        (m) => m.PasswordResetComponent
      ),
  },
  {
    path: 'share',
    loadComponent: () =>
      import('./components/drills/share-handler/share-handler.component').then(
        (m) => m.ShareHandlerComponent
      ),
  },

  // Protected routes
  {
    path: '',
    canActivate: [authGuard],
    resolve: { authReady: authReadyResolver },
    children: [
      { path: '', redirectTo: 'drills', pathMatch: 'full' },
      {
        path: 'drills',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './components/drills/drill-list/drill-list.component'
              ).then((m) => m.DrillListComponent),
          },
          {
            path: 'add',
            loadComponent: () =>
              import(
                './components/drills/drill-form/drill-form.component'
              ).then((m) => m.DrillFormComponent),
          },
          {
            path: ':id',
            canActivate: [drillExistsGuard],
            loadComponent: () =>
              import(
                './components/drills/drill-detail/drill-detail.component'
              ).then((m) => m.DrillDetailComponent),
          },
          {
            path: ':id/edit',
            canActivate: [drillExistsGuard],
            loadComponent: () =>
              import(
                './components/drills/drill-form/drill-form.component'
              ).then((m) => m.DrillFormComponent),
          },
        ],
      },
      {
        path: 'tags',
        loadComponent: () =>
          import('./components/tags/tag-manager/tag-manager.component').then(
            (m) => m.TagManagerComponent
          ),
      },
    ],
  },

  // Not found
  {
    path: 'not-found',
    loadComponent: () =>
      import('./components/shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  { path: '**', redirectTo: 'not-found' },
];
