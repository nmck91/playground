import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { CHILD_REWARDS, PARENT_REWARDS, FamilyMember, Reward } from '../models/types';

@Component({
  selector: 'app-rewards-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <!-- Subheader with Tabs -->
      <div class="w-full px-4 sm:px-6 lg:px-8 pt-4 border-b border-slate-200/50">
        <div class="max-w-7xl mx-auto">
          <p class="text-blue-600 text-xs sm:text-sm font-semibold mb-4">Earn stars to unlock rewards!</p>

          <!-- Tabs -->
          <div class="flex gap-2 border-b-2 border-slate-200">
            <button
              (click)="setViewMode('kids')"
              [class.active-tab]="viewMode === 'kids'"
              class="px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all border-b-2"
              [class.border-brand-accent]="viewMode === 'kids'"
              [class.border-transparent]="viewMode !== 'kids'"
              [class.text-brand-accent]="viewMode === 'kids'"
              [class.text-slate-500]="viewMode !== 'kids'"
            >
              &#x1F466; Kids
            </button>
            <button
              (click)="setViewMode('parents')"
              [class.active-tab]="viewMode === 'parents'"
              class="px-4 sm:px-6 py-3 font-semibold text-sm sm:text-base transition-all border-b-2"
              [class.border-brand-accent]="viewMode === 'parents'"
              [class.border-transparent]="viewMode !== 'parents'"
              [class.text-brand-accent]="viewMode === 'parents'"
              [class.text-slate-500]="viewMode !== 'parents'"
            >
              &#x1F468;&#x200D;&#x1F469;&#x200D;&#x1F466; Parents
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">

        <!-- Member Selection (Mobile) -->
        <div class="mb-6 sm:hidden">
          <label class="block text-sm font-semibold text-slate-700 mb-2">Select Member:</label>
          <select (change)="onMemberChange($event)" [value]="selectedMemberId" class="w-full px-4 py-2 rounded-lg border-2 border-brand-primary text-slate-900">
            <option *ngFor="let member of displayMembers" [value]="member.id">
              {{ member.emoji }} {{ member.name }} ({{ member.weeklyStars }} &#11088;)
            </option>
          </select>
        </div>

        <!-- Member Cards or Tabbed View -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div *ngFor="let member of displayMembers"
               (click)="selectMember(member.id)"
               class="member-selector cursor-pointer transition-all"
               [class.active]="selectedMemberId === member.id">
            <div class="bg-white rounded-lg p-4 sm:p-5 border-2 shadow-md hover:shadow-lg"
                 [ngClass]="selectedMemberId === member.id ? 'border-brand-accent' : 'border-slate-200'">
              <div class="text-3xl mb-2">{{ member.emoji }}</div>
              <h3 class="font-bold text-slate-900 text-sm sm:text-base">{{ member.name }}</h3>
              <p class="text-xs sm:text-sm text-slate-600">{{ member.weeklyStars }} &#11088; this week</p>
            </div>
          </div>
        </div>

        <!-- Rewards List -->
        <div class="space-y-4 sm:space-y-6">
          <div *ngFor="let reward of getRewardsForSelectedMember()" class="reward-card">
            <div class="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-brand-accent hover:shadow-lg transition-all">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg sm:text-xl font-bold text-slate-900 mb-1">{{ reward.name }}</h3>
                  <p class="text-xs sm:text-sm text-slate-600 mb-3">{{ reward.description }}</p>

                  <!-- Progress Bar -->
                  <div class="mb-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-xs sm:text-sm font-semibold text-slate-700">Progress</span>
                      <span class="text-xs sm:text-sm font-bold text-brand-accent">{{ selectedMemberStars }} / {{ reward.requiredStars }} &#11088;</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div class="bg-gradient-to-r from-brand-accent to-brand-secondary h-full transition-all"
                           [style.width.%]="getProgressPercent(reward.requiredStars)">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Cost Badge -->
                <div class="flex-shrink-0 text-right">
                  <div class="text-2xl sm:text-3xl font-bold text-brand-primary">
                    {{ reward.requiredStars }}
                    <span class="text-lg sm:text-xl">&#11088;</span>
                  </div>
                  <div *ngIf="reward.cost > 0" class="text-xs sm:text-sm font-semibold text-red-600 mt-1">
                    Cost: £{{ reward.cost }}
                  </div>
                  <div *ngIf="reward.cost === 0" class="text-xs sm:text-sm font-semibold text-green-600 mt-1">
                    FREE!
                  </div>
                </div>
              </div>

              <!-- Unlocked Status -->
              <div class="mt-4 pt-4 border-t border-slate-200">
                <button *ngIf="selectedMemberStars >= reward.requiredStars"
                        (click)="claimReward(reward.id)"
                        class="w-full bg-gradient-to-r from-brand-accent to-brand-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base">
                  &#10024; Claim Reward &#10024;
                </button>
                <div *ngIf="selectedMemberStars < reward.requiredStars" class="text-xs sm:text-sm text-slate-600 text-center">
                  {{ reward.requiredStars - selectedMemberStars }} more &#11088; to unlock
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .member-selector {
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

    .reward-card {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    button {
      -webkit-tap-highlight-color: transparent;
      min-height: 44px;
    }

    button:active {
      transform: scale(0.98);
    }

    @media (hover: none) and (pointer: coarse) {
      button:hover {
        box-shadow: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .member-selector,
      .reward-card {
        animation: none;
      }
    }
  `]
})
export class RewardsViewComponent implements OnInit {
  viewMode: 'kids' | 'parents' = 'kids';
  displayMembers: FamilyMember[] = [];
  selectedMemberId: string = '';
  selectedMemberStars: number = 0;

  private allMembers: FamilyMember[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.allMembers = this.dataService.getMembers();
    this.updateDisplay();

    this.dataService.members$.subscribe(members => {
      this.allMembers = members;
      this.updateDisplay();
    });
  }

  private updateDisplay(): void {
    const filteredMembers = this.viewMode === 'kids'
      ? this.allMembers.filter(m => m.role === 'child')
      : this.allMembers.filter(m => m.role === 'parent');

    this.displayMembers = filteredMembers;

    // Select first member if not already selected
    if (!this.selectedMemberId && this.displayMembers.length > 0) {
      this.selectedMemberId = this.displayMembers[0].id;
    }

    this.updateSelectedMemberStars();
  }

  setViewMode(mode: 'kids' | 'parents'): void {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      this.selectedMemberId = '';
      this.updateDisplay();
    }
  }

  selectMember(memberId: string): void {
    this.selectedMemberId = memberId;
    this.updateSelectedMemberStars();
  }

  onMemberChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedMemberId = target.value;
    this.updateSelectedMemberStars();
  }

  private updateSelectedMemberStars(): void {
    const member = this.allMembers.find(m => m.id === this.selectedMemberId);
    this.selectedMemberStars = member?.weeklyStars || 0;
  }

  getRewardsForSelectedMember(): Reward[] {
    const isMemberKid = this.displayMembers.find(m => m.id === this.selectedMemberId)?.role === 'child';
    return isMemberKid ? CHILD_REWARDS : PARENT_REWARDS;
  }

  getProgressPercent(requiredStars: number): number {
    return Math.min((this.selectedMemberStars / requiredStars) * 100, 100);
  }

  claimReward(_rewardId: string): void {
    // TODO: Implement reward claim logic with Supabase
    alert('Reward claimed! (Feature coming soon - will track claimed rewards)');
  }
}
