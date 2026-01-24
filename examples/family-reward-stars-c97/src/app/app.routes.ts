import { Routes } from '@angular/router';
import { HomePage } from './pages/home';
import { LoginComponent } from './pages/login';
import { TrackingViewComponent } from './components/tracking-view';
import { RewardsViewComponent } from './components/rewards-view';
import { PlaceholderComponent } from './pages/placeholder';
import { MainLayoutComponent } from './layouts/main-layout';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomePage },
      { path: 'tracking', component: TrackingViewComponent },
      { path: 'rewards', component: RewardsViewComponent },
      { path: 'settings', component: PlaceholderComponent, data: { title: 'Settings' } },
      { path: 'history', component: PlaceholderComponent, data: { title: 'History' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
