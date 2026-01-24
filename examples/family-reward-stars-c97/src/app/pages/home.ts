import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { FamilyMember } from '../models/types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <!-- Main Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 max-w-6xl mx-auto">

        <!-- Introduction Section -->
        <div class="mb-8 sm:mb-12">
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-md border-2 border-brand-secondary/20 p-5 sm:p-6 lg:p-8">
            <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-brand-primary mb-4 sm:mb-6">How It Works</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div class="flex gap-3 sm:gap-4">
                <span class="text-2xl sm:text-3xl flex-shrink-0">👦👧</span>
                <div class="min-w-0">
                  <h3 class="font-semibold text-brand-primary mb-1 sm:mb-2 text-sm sm:text-base">Kids Track</h3>
                  <p class="text-slate-600 text-xs sm:text-sm">Fíadh, Sé, and Niall Óg earn stars for good behavior</p>
                </div>
              </div>
              <div class="flex gap-3 sm:gap-4">
                <span class="text-2xl sm:text-3xl flex-shrink-0">👨‍👩‍👧</span>
                <div class="min-w-0">
                  <h3 class="font-semibold text-brand-primary mb-1 sm:mb-2 text-sm sm:text-base">Parents Accountable</h3>
                  <p class="text-slate-600 text-xs sm:text-sm">Mum and Dad earn stars when keeping their promises</p>
                </div>
              </div>
              <div class="flex gap-3 sm:gap-4">
                <span class="text-2xl sm:text-3xl flex-shrink-0">📱</span>
                <div class="min-w-0">
                  <h3 class="font-semibold text-brand-primary mb-1 sm:mb-2 text-sm sm:text-base">Real-time Sync</h3>
                  <p class="text-slate-600 text-xs sm:text-sm">All devices stay in sync with local storage (Supabase coming soon!)</p>
                </div>
              </div>
              <div class="flex gap-3 sm:gap-4">
                <span class="text-2xl sm:text-3xl flex-shrink-0">📊</span>
                <div class="min-w-0">
                  <h3 class="font-semibold text-brand-primary mb-1 sm:mb-2 text-sm sm:text-base">Weekly Tracking</h3>
                  <p class="text-slate-600 text-xs sm:text-sm">Historical records and progress tracking with checkboxes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Section -->
        <div class="mb-8 sm:mb-12">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-brand-primary mb-4 sm:mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <a routerLink="/tracking" class="group bg-gradient-to-br from-brand-accent to-brand-secondary rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6 border-none cursor-pointer">
              <h3 class="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl sm:text-3xl">📋</span>
                <span class="group-hover:translate-x-1 transition-transform">Weekly Tracking</span>
              </h3>
              <p class="text-blue-100 text-xs sm:text-sm">Check off daily habits and track progress</p>
            </a>
            
            <a routerLink="/rewards" class="group bg-gradient-to-br from-brand-primary via-brand-accent to-brand-secondary rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all p-4 sm:p-6 border-none cursor-pointer">
              <h3 class="text-lg sm:text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span class="text-2xl sm:text-3xl">🎁</span>
                <span class="group-hover:translate-x-1 transition-transform">Rewards Menu</span>
              </h3>
              <p class="text-blue-100 text-xs sm:text-sm">See available rewards and progress towards them</p>
            </a>
          </div>
        </div>

        <!-- Family Members Section -->
        <div class="mb-8 sm:mb-12">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-brand-primary mb-4 sm:mb-6">Family Members</h2>
          
          <!-- Kids Section -->
          <div class="mb-8 sm:mb-10">
            <h3 class="text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <span class="text-xl sm:text-2xl">👦</span> Kids
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div *ngFor="let member of kidsMembers" class="member-card">
                <div class="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-5 lg:p-6 border-l-4 cursor-pointer" [ngClass]="'border-' + getMemberBorderColor(member.id)" (click)="goToChildTracking(member.id)">
                  <div class="flex items-start justify-between gap-3 mb-4">
                    <div class="min-w-0 flex-1">
                      <h4 class="text-lg sm:text-xl font-bold text-slate-900 truncate hover:text-brand-accent transition-colors">{{ member.name }}</h4>
                      <p class="text-xs sm:text-sm text-slate-500">Good behavior tracker</p>
                    </div>
                    <span class="text-3xl sm:text-4xl flex-shrink-0">{{ member.emoji }}</span>
                  </div>
                  
                  <div class="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 rounded-lg p-3 sm:p-4 mb-4">
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl sm:text-4xl font-bold text-brand-accent">{{ member.weeklyStars }}</span>
                      <span class="text-xl sm:text-2xl">⭐</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-1">Stars earned this week</p>
                  </div>

                  <a routerLink="/tracking" class="w-full block text-center bg-gradient-to-r from-brand-accent to-brand-secondary text-white font-semibold py-3 sm:py-4 px-4 rounded-lg hover:shadow-lg transition-all duration-200 active:scale-95 text-sm sm:text-base touch-action-none">
                    Track Habits
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Parents Section -->
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <span class="text-xl sm:text-2xl">👨‍👩‍👦</span> Parents
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div *ngFor="let member of parentMembers" class="member-card">
                <div class="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-5 lg:p-6 border-l-4" [ngClass]="'border-' + getMemberBorderColor(member.id)">
                  <div class="flex items-start justify-between gap-3 mb-4">
                    <div class="min-w-0 flex-1">
                      <h4 class="text-lg sm:text-xl font-bold text-slate-900 truncate">{{ member.name }}</h4>
                      <p class="text-xs sm:text-sm text-slate-500">Promise accountability</p>
                    </div>
                    <span class="text-3xl sm:text-4xl flex-shrink-0">{{ member.emoji }}</span>
                  </div>
                  
                  <div class="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-lg p-3 sm:p-4 mb-4">
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl sm:text-4xl font-bold text-brand-primary">{{ member.weeklyStars }}</span>
                      <span class="text-xl sm:text-2xl">⭐</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-1">Stars earned this week</p>
                  </div>

                  <a routerLink="/tracking" class="w-full block text-center bg-gradient-to-r from-brand-primary to-brand-accent text-white font-semibold py-3 sm:py-4 px-4 rounded-lg hover:shadow-lg transition-all duration-200 active:scale-95 text-sm sm:text-base touch-action-none">
                    Track Habits
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-t-4 border-brand-secondary">
          <h3 class="text-lg sm:text-xl font-bold text-brand-primary mb-3 sm:mb-4">📝 About This App</h3>
          <div class="space-y-2 text-xs sm:text-sm text-slate-600">
            <p>✅ <strong>Currently running on local storage</strong> - All data is saved on this device</p>
            <p>🚀 <strong>Supabase coming soon!</strong> - Multi-device sync and real-time updates</p>
            <p>💾 <strong>Data is persistent</strong> - Your habits and progress are saved automatically</p>
            <p class="pt-2">Start tracking habits in the Weekly Tracking section!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-card {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    a {
      -webkit-tap-highlight-color: transparent;
    }

    button:active {
      transform: scale(0.95);
    }

    /* Color border utilities */
    .border-fiodh {
      border-color: #0ea5e9;
    }

    .border-se {
      border-color: #10b981;
    }

    .border-niall-og {
      border-color: #a855f7;
    }

    .border-mum {
      border-color: #3b82f6;
    }

    .border-dad {
      border-color: #ec4899;
    }

    @media (hover: none) and (pointer: coarse) {
      a:hover {
        transform: none;
        box-shadow: none;
      }
      
      a:active {
        transform: scale(0.98);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .member-card {
        animation: none;
      }
    }
  `]
})
export class HomePage implements OnInit {
  kidsMembers: FamilyMember[] = [];
  parentMembers: FamilyMember[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to member updates
    this.dataService.members$.subscribe(members => {
      this.kidsMembers = members.filter(m => m.role === 'child');
      this.parentMembers = members.filter(m => m.role === 'parent');
    });

    // Trigger initial load
    const allMembers = this.dataService.getMembers();
    this.kidsMembers = allMembers.filter(m => m.role === 'child');
    this.parentMembers = allMembers.filter(m => m.role === 'parent');
  }

  getMemberBorderColor(memberId: string): string {
    const colorMap: Record<string, string> = {
      'fiodh': 'fiodh',
      'se': 'se',
      'niall-og': 'niall-og',
      'mum': 'mum',
      'dad': 'dad'
    };
    return colorMap[memberId] || 'blue';
  }

  goToChildTracking(childId: string): void {
    this.router.navigate(['/tracking'], { queryParams: { childId } });
  }
}
