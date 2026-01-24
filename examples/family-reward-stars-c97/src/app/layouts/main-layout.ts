import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col pb-24 sm:pb-0">
      <!-- Header -->
      <div class="bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-lg sticky top-0 z-20">
        <div class="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Back Button (hidden on home) -->
              <button 
                *ngIf="!isHomePage"
                (click)="goBack()"
                class="text-white hover:text-blue-100 transition-colors text-xl sm:text-2xl flex-shrink-0 p-1"
                title="Go back"
              >
                ←
              </button>
              <h1 class="text-lg sm:text-2xl font-bold truncate">{{ pageTitle }}</h1>
            </div>
            <!-- Logout Button -->
            <button 
              (click)="logout()"
              class="bg-white text-brand-primary font-semibold py-2 px-3 sm:px-4 rounded-lg hover:shadow-lg transition-all text-xs sm:text-sm flex-shrink-0 min-h-10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 w-full overflow-y-auto">
        <router-outlet></router-outlet>
      </div>

      <!-- Bottom Navigation (Mobile) -->
      <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg sm:hidden z-20">
        <div class="flex justify-around items-center h-20">
          <a 
            routerLink="/" 
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
            [class.active]="currentRoute === ''"
          >
            <span class="text-2xl">🏠</span>
            <span class="text-xs mt-1">Home</span>
          </a>
          
          <a 
            routerLink="/tracking" 
            routerLinkActive="active"
            class="nav-item"
            [class.active]="currentRoute === 'tracking'"
          >
            <span class="text-2xl">📋</span>
            <span class="text-xs mt-1">Track</span>
          </a>
          
          <a 
            routerLink="/rewards" 
            routerLinkActive="active"
            class="nav-item"
            [class.active]="currentRoute === 'rewards'"
          >
            <span class="text-2xl">🎁</span>
            <span class="text-xs mt-1">Rewards</span>
          </a>
          
          <a 
            routerLink="/settings" 
            routerLinkActive="active"
            class="nav-item"
            [class.active]="currentRoute === 'settings'"
          >
            <span class="text-2xl">⚙️</span>
            <span class="text-xs mt-1">Settings</span>
          </a>
        </div>
      </nav>

    </div>
  `,
  styles: [`
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 80px;
      color: #64748b;
      transition: all 0.2s;
      text-decoration: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .nav-item:active {
      transform: scale(0.95);
    }

    .nav-item.active {
      color: #18b6ff;
      background-color: #f0f9ff;
    }

    .nav-item span:first-child {
      margin-bottom: 4px;
    }

    a:active {
      -webkit-tap-highlight-color: transparent;
    }

    @media (hover: none) and (pointer: coarse) {
      .nav-item:hover {
        background-color: transparent;
      }

      .nav-item:active {
        transform: scale(0.95);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        transition: none !important;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  currentRoute = '';
  isHomePage = true;
  pageTitle = '✨ Family Reward Chart';

  private routeTitles: Record<string, string> = {
    '': '✨ Family Reward Chart',
    'tracking': '📊 Weekly Tracking',
    'rewards': '🎁 Rewards Menu',
    'settings': '⚙️ Settings'
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects.split('/')[1] || '';
        this.currentRoute = url;
        this.isHomePage = url === '';
        this.pageTitle = this.routeTitles[url] || '✨ Family Reward Chart';
      });
  }

  ngOnInit(): void {}

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
