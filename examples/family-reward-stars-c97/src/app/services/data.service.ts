import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  FamilyMember,
  HabitCompletion,
  DailyHabit,
  DEFAULT_CHILD_HABITS,
  DEFAULT_PARENT_HABITS,
  WeeklyData,
  MemberColor
} from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private memberSubject = new BehaviorSubject<FamilyMember[]>([]);
  private completionsSubject = new BehaviorSubject<HabitCompletion[]>([]);
  private habitsSubject = new BehaviorSubject<DailyHabit[]>([]);

  public members$ = this.memberSubject.asObservable();
  public completions$ = this.completionsSubject.asObservable();
  public habits$ = this.habitsSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Load from localStorage or initialize with defaults
    const stored = localStorage.getItem('family_reward_data');
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.memberSubject.next(data.members || this.getDefaultMembers());
        this.completionsSubject.next(data.completions || []);
        this.habitsSubject.next(data.habits || this.getDefaultHabits());
      } catch {
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  private resetToDefaults() {
    const members = this.getDefaultMembers();
    const habits = this.getDefaultHabits();
    
    this.memberSubject.next(members);
    this.habitsSubject.next(habits);
    this.completionsSubject.next([]);
    this.saveData();
  }

  private getDefaultMembers(): FamilyMember[] {
    return [
      {
        id: 'fiodh',
        name: 'Fíadh',
        role: 'child',
        color: 'sky-blue',
        emoji: '🧸',
        totalStars: 0,
        weeklyStars: 0
      },
      {
        id: 'se',
        name: 'Sé',
        role: 'child',
        color: 'light-green',
        emoji: '🚀',
        totalStars: 0,
        weeklyStars: 0
      },
      {
        id: 'niall-og',
        name: 'Niall Óg',
        role: 'child',
        color: 'plum',
        emoji: '⚽',
        totalStars: 0,
        weeklyStars: 0
      },
      {
        id: 'mum',
        name: 'Mum',
        role: 'parent',
        color: 'blue',
        emoji: '❤️',
        totalStars: 0,
        weeklyStars: 0
      },
      {
        id: 'dad',
        name: 'Dad',
        role: 'parent',
        color: 'pink',
        emoji: '💪',
        totalStars: 0,
        weeklyStars: 0
      }
    ];
  }

  private getDefaultHabits(): DailyHabit[] {
    const habits: DailyHabit[] = [];
    const childIds = ['fiodh', 'se', 'niall-og'];
    const parentIds = ['mum', 'dad'];

    // Child habits
    childIds.forEach(childId => {
      Object.values(DEFAULT_CHILD_HABITS).forEach(habit => {
        habits.push({
          ...habit,
          id: `${childId}-${habit.id}`,
          memberId: childId
        });
      });
    });

    // Parent habits
    parentIds.forEach(parentId => {
      Object.values(DEFAULT_PARENT_HABITS).forEach(habit => {
        habits.push({
          ...habit,
          id: `${parentId}-${habit.id}`,
          memberId: parentId
        });
      });
    });

    return habits;
  }

  // Get all members
  getMembers(): FamilyMember[] {
    return this.memberSubject.value;
  }

  // Get members by role
  getMembersByRole(role: 'child' | 'parent'): FamilyMember[] {
    return this.memberSubject.value.filter(m => m.role === role);
  }

  // Get single member
  getMember(id: string): FamilyMember | undefined {
    return this.memberSubject.value.find(m => m.id === id);
  }

  // Get habits for a member
  getHabitsForMember(memberId: string): DailyHabit[] {
    return this.habitsSubject.value.filter(h => h.memberId === memberId);
  }

  // Mark habit complete/incomplete
  toggleHabitCompletion(habitId: string, date: string): void {
    const completions = this.completionsSubject.value;
    const existingIndex = completions.findIndex(
      c => c.habitId === habitId && c.date === date
    );

    if (existingIndex >= 0) {
      completions[existingIndex].completed = !completions[existingIndex].completed;
    } else {
      const habit = this.habitsSubject.value.find(h => h.id === habitId);
      if (habit) {
        completions.push({
          id: `${habitId}-${date}`,
          habitId,
          date,
          completed: true,
          memberId: habit.memberId
        });
      }
    }

    this.completionsSubject.next([...completions]);
    this.updateWeeklyStars();
    this.saveData();
  }

  // Get completion for a specific habit on a specific date
  getCompletion(habitId: string, date: string): boolean {
    const completion = this.completionsSubject.value.find(
      c => c.habitId === habitId && c.date === date
    );
    return completion?.completed || false;
  }

  // Get all completions for a member on a specific date
  getCompletionsForMemberOnDate(memberId: string, date: string): HabitCompletion[] {
    return this.completionsSubject.value.filter(
      c => c.memberId === memberId && c.date === date
    );
  }

  // Get weekly data for a member
  getWeeklyData(memberId: string, weekStart: Date): WeeklyData {
    const week = this.getWeekString(weekStart);
    const weeklyStars = this.calculateWeeklyStars(memberId, weekStart);

    return {
      memberId,
      week,
      completions: {},
      totalStars: weeklyStars
    };
  }

  private calculateWeeklyStars(memberId: string, weekStart: Date): number {
    const member = this.getMember(memberId);
    if (!member) return 0;

    const completions = this.completionsSubject.value.filter(
      c => c.memberId === memberId && c.completed
    );

    // Count unique completions for this week
    let stars = 0;
    const dayIndexes = new Set<number>();

    completions.forEach(c => {
      const date = new Date(c.date);
      if (this.isSameWeek(date, weekStart)) {
        dayIndexes.add(date.getDay());
      }
    });

    // Award 1 star per day if all habits completed, or partial stars
    // For now, 1 star per completed habit per day
    completions.forEach(c => {
      const date = new Date(c.date);
      if (this.isSameWeek(date, weekStart)) {
        stars++;
      }
    });

    return stars;
  }

  private updateWeeklyStars(): void {
    const members = this.memberSubject.value.map(member => {
      const today = new Date();
      const weekStart = this.getWeekStart(today);
      const weeklyStars = this.calculateWeeklyStars(member.id, weekStart);
      
      return {
        ...member,
        weeklyStars
      };
    });

    this.memberSubject.next(members);
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNumber;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    return this.getWeekNumber(date1) === this.getWeekNumber(date2) &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Save data to localStorage
  private saveData(): void {
    const data = {
      members: this.memberSubject.value,
      completions: this.completionsSubject.value,
      habits: this.habitsSubject.value
    };
    localStorage.setItem('family_reward_data', JSON.stringify(data));
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem('family_reward_data');
    this.resetToDefaults();
  }

  // Export data
  exportData(): string {
    return JSON.stringify({
      members: this.memberSubject.value,
      completions: this.completionsSubject.value,
      habits: this.habitsSubject.value,
      exportDate: new Date().toISOString()
    }, null, 2);
  }
}
