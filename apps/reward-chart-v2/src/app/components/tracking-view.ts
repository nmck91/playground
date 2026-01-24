import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { FamilyMember, DailyHabit } from '../models/types';

@Component({
  selector: 'app-tracking-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <!-- Subheader with Week Info and Tabs -->
      <div class="w-full px-4 sm:px-6 lg:px-8 pt-4 border-b border-slate-200/50">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between gap-4 sm:gap-6 mb-4">
            <p class="text-blue-600 text-xs sm:text-sm font-semibold">{{ weekRangeDisplay }}</p>
          </div>

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

        <!-- Week Navigation -->
        <div class="flex justify-between items-center mb-6 sm:mb-8">
          <button (click)="previousWeek()" class="bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base">
            &larr; Previous
          </button>
          <button (click)="thisWeek()" class="bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base">
            This Week
          </button>
          <button (click)="nextWeek()" class="bg-white text-brand-primary font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm sm:text-base">
            Next &rarr;
          </button>
        </div>

        <!-- Members Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          <div
            *ngFor="let member of displayMembers"
            class="tracking-card"
            [class.highlighted-member]="highlightedChildId === member.id"
            #memberCard
            [attr.data-member-id]="member.id"
          >
            <div class="bg-white rounded-lg sm:rounded-xl shadow-md border-l-4 p-4 sm:p-6 transition-all" [ngClass]="[
              getMemberBorderClass(member.color),
              highlightedChildId === member.id ? 'ring-2 ring-offset-2 ring-brand-accent shadow-lg' : ''
            ]">
              <!-- Member Header -->
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-lg sm:text-xl font-bold text-slate-900">{{ member.emoji }} {{ member.name }}</h3>
                  <p class="text-xs sm:text-sm text-slate-500">This week: {{ member.weeklyStars }} &#11088;</p>
                </div>
                <div class="text-3xl sm:text-4xl font-bold text-brand-accent">{{ member.weeklyStars }}</div>
              </div>

              <!-- Days of Week Header -->
              <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                <div *ngFor="let day of dayLabels" class="text-center text-xs sm:text-sm font-semibold text-slate-600">
                  {{ day }}
                </div>
              </div>

              <!-- Habits Grid (7 columns for days of week) -->
              <div class="space-y-3 sm:space-y-4">
                <div *ngFor="let habit of getHabitsForMember(member.id)" class="space-y-1">
                  <p class="text-xs sm:text-sm font-semibold text-slate-700">{{ habit.name }}</p>
                  <div class="grid grid-cols-7 gap-1 sm:gap-2">
                    <button
                      *ngFor="let day of weekDates; let i = index"
                      (click)="toggleCompletion(habit.id, day)"
                      [class.completed]="isCompleted(habit.id, day)"
                      class="checkbox-button"
                      [title]="getDateLabel(day)"
                    >
                      <span *ngIf="!isCompleted(habit.id, day)" class="text-lg sm:text-xl">&#9734;</span>
                      <span *ngIf="isCompleted(habit.id, day)" class="text-lg sm:text-xl text-yellow-400">&#11088;</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Weekly Summary -->
              <div class="mt-4 pt-4 border-t border-slate-200">
                <div class="text-xs sm:text-sm text-slate-600">
                  <span class="font-semibold">Completed:</span>
                  {{ getCompletedCount(member.id) }} / {{ getTotalHabits(member.id) * 7 }} tasks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkbox-button {
      min-height: 40px;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: #f3f4f6;
      border: 2px solid #e5e7eb;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 1.25rem;
      -webkit-tap-highlight-color: transparent;
    }

    .checkbox-button:hover {
      background-color: #e5e7eb;
      border-color: #d1d5db;
    }

    .checkbox-button.completed {
      background-color: #fef3c7;
      border-color: #fbbf24;
    }

    .checkbox-button.completed:hover {
      background-color: #fcd34d;
    }

    .checkbox-button:active {
      transform: scale(0.95);
    }

    .tracking-card {
      animation: fadeInUp 0.5s ease-out forwards;
    }

    .tracking-card.highlighted-member {
      animation: highlightPulse 0.6s ease-out;
    }

    @keyframes highlightPulse {
      0% {
        transform: scale(0.98);
      }
      50% {
        transform: scale(1.01);
      }
      100% {
        transform: scale(1);
      }
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

    @media (hover: none) and (pointer: coarse) {
      .checkbox-button:hover {
        background-color: #f3f4f6;
        border-color: #e5e7eb;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tracking-card {
        animation: none;
      }
    }

    /* Tab Styles */
    button[class*="border-brand-accent"] {
      position: relative;
    }

    button[class*="border-brand-accent"][class*="border-b-2"] {
      transition: all 0.3s ease;
    }

    .active-tab {
      animation: slideInUnderline 0.3s ease-out forwards;
    }

    @keyframes slideInUnderline {
      from {
        opacity: 0.7;
        transform: translateY(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (hover: none) and (pointer: coarse) {
      button {
        -webkit-tap-highlight-color: transparent;
      }
    }
  `]
})
export class TrackingViewComponent implements OnInit, AfterViewInit {
  viewMode: 'kids' | 'parents' = 'kids';
  displayMembers: FamilyMember[] = [];
  weekDates: string[] = [];
  dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekRangeDisplay = '';
  highlightedChildId: string | null = null;

  @ViewChildren('memberCard') memberCards!: QueryList<ElementRef>;

  private currentWeekStart: Date = new Date();
  private allMembers: FamilyMember[] = [];
  private allHabits: Map<string, DailyHabit[]> = new Map();

  constructor(
    private dataService: DataService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setWeekStart(new Date());
    this.loadData();

    // Subscribe to query parameters to highlight a specific child
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['childId']) {
        this.highlightedChildId = params['childId'];
        // Scroll to the highlighted child card after a brief delay to allow DOM to update
        setTimeout(() => this.scrollToHighlightedChild(), 100);
      }
    });
  }

  ngAfterViewInit(): void {
    // Scroll to highlighted child if already set
    if (this.highlightedChildId) {
      this.scrollToHighlightedChild();
    }
  }

  private loadData(): void {
    this.allMembers = this.dataService.getMembers();
    this.updateDisplay();

    // Subscribe to member updates
    this.dataService.members$.subscribe(members => {
      this.allMembers = members;
      this.updateDisplay();
    });
  }

  private updateDisplay(): void {
    const filteredMembers = this.viewMode === 'kids'
      ? this.allMembers.filter(m => m.role === 'child')
      : this.allMembers.filter(m => m.role === 'parent');

    // Calculate weekly stars for each member
    this.displayMembers = filteredMembers.map(member => ({
      ...member,
      weeklyStars: this.calculateWeeklyStars(member.id)
    }));

    // Cache habits for each member
    this.displayMembers.forEach(member => {
      this.allHabits.set(member.id, this.dataService.getHabitsForMember(member.id));
    });
  }

  setViewMode(mode: 'kids' | 'parents'): void {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      this.updateDisplay();
    }
  }

  setWeekStart(date: Date): void {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    this.currentWeekStart = new Date(d.setDate(diff));
    this.generateWeekDates();
    this.updateWeekDisplay();
  }

  private generateWeekDates(): void {
    this.weekDates = [];
    const start = new Date(this.currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      this.weekDates.push(this.formatDate(date));
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateWeekDisplay(): void {
    const end = new Date(this.currentWeekStart);
    end.setDate(end.getDate() + 6);

    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    this.weekRangeDisplay = `${formatter.format(this.currentWeekStart)} - ${formatter.format(end)}`;
  }

  previousWeek(): void {
    const prev = new Date(this.currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    this.setWeekStart(prev);
  }

  thisWeek(): void {
    this.setWeekStart(new Date());
  }

  nextWeek(): void {
    const next = new Date(this.currentWeekStart);
    next.setDate(next.getDate() + 7);
    this.setWeekStart(next);
  }

  getHabitsForMember(memberId: string): DailyHabit[] {
    return this.allHabits.get(memberId) || [];
  }

  isCompleted(habitId: string, date: string): boolean {
    return this.dataService.getCompletion(habitId, date);
  }

  toggleCompletion(habitId: string, date: string): void {
    this.dataService.toggleHabitCompletion(habitId, date);
    this.updateDisplay();
  }

  getDateLabel(date: string): string {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  getCompletedCount(memberId: string): number {
    const habits = this.getHabitsForMember(memberId);
    let count = 0;

    habits.forEach(habit => {
      this.weekDates.forEach(date => {
        if (this.isCompleted(habit.id, date)) {
          count++;
        }
      });
    });

    return count;
  }

  getTotalHabits(memberId: string): number {
    return this.getHabitsForMember(memberId).length;
  }

  calculateWeeklyStars(memberId: string): number {
    return this.getCompletedCount(memberId);
  }

  getMemberBorderClass(color: string): string {
    const colorMap: Record<string, string> = {
      'sky-blue': 'border-sky-500',
      'light-green': 'border-emerald-500',
      'plum': 'border-purple-500',
      'blue': 'border-blue-500',
      'pink': 'border-pink-500'
    };
    return colorMap[color] || 'border-blue-500';
  }

  private scrollToHighlightedChild(): void {
    if (!this.highlightedChildId) return;

    const cards = this.memberCards.toArray();
    const highlightedCard = cards.find(card => {
      const element = card.nativeElement;
      return element.getAttribute('data-member-id') === this.highlightedChildId;
    });

    if (highlightedCard) {
      highlightedCard.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
