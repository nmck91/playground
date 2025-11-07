import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartData, StarsData } from '../models/chart-data.model';
import { FamilyMember } from '../models/family-member.model';
import { Reward } from '../models/reward.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {
  private familyMemberIds: Map<string, string> = new Map();

  private initialData: ChartData = {
    children: [
      { name: 'Fíadh', color: '#87CEEB', className: 'child-1' },
      { name: 'Sé', color: '#90EE90', className: 'child-2' },
      { name: 'Niall Óg', color: '#DDA0DD', className: 'child-3' }
    ],
    parents: [
      { name: 'Mum', color: '#FFE55C', className: 'parent' },
      { name: 'Dad', color: '#FFE55C', className: 'parent' }
    ],
    kidsHabits: [
      'Brushing teeth (morning & night)',
      'Tidying up after themselves',
      'Homework/Reading',
      'Being kind to siblings',
      'Using good manners'
    ],
    parentHabits: [
      'Playing with us when asked',
      'Not being grumpy in the morning',
      'Reading bedtime story with voices',
      'Making our favorite meal',
      'Taking us somewhere fun'
    ],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    kidsRewards: [
      { name: 'Choose what\'s for dinner', stars: 20 },
      { name: 'Trip to the park with parent', stars: 20 },
      { name: 'Bike ride adventure', stars: 20 },
      { name: 'Game night - child picks game', stars: 20 },
      { name: 'Bubble play session', stars: 20 },
      { name: 'Nature walk & treasure hunt', stars: 20 },
      { name: 'Build a blanket fort together', stars: 20 },
      { name: 'Picnic in garden/park', stars: 22 },
      { name: 'Choose family movie night film', stars: 25 },
      { name: 'Extra 30 minutes stay up late', stars: 25 },
      { name: 'Arts & crafts session', stars: 25 },
      { name: 'Water balloon fight (summer)', stars: 25 },
      { name: 'Special baking session together', stars: 28 },
      { name: 'Library trip + ice cream', stars: 28 },
      { name: 'Small toy from pound shop', stars: 30 }
    ],
    parentsRewards: [
      { name: 'Kids make you a card/drawing', stars: 15 },
      { name: 'Kids tidy the living room', stars: 20 },
      { name: 'Choose what to watch on TV', stars: 20 },
      { name: 'Kids do your chores for the day', stars: 25 },
      { name: 'Breakfast in bed made by kids', stars: 28 },
      { name: 'No nagging from kids for a day', stars: 30 },
      { name: 'Sleep in on weekend (kids entertain themselves)', stars: 30 }
    ],
    kidsStars: {},
    parentsStars: {},
    parentsVisible: true
  };

  private chartDataSubject = new BehaviorSubject<ChartData>(this.initialData);
  public chartData$: Observable<ChartData> = this.chartDataSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.initializeStars();
  }

  async initialize(): Promise<void> {
    if (this.supabaseService.isInitialized()) {
      await this.loadFromSupabase();
    }
  }

  private initializeStars(): void {
    const data = this.chartDataSubject.value;

    data.children.forEach((_, childIndex) => {
      if (!data.kidsStars[childIndex]) {
        data.kidsStars[childIndex] = {};
      }
      data.kidsHabits.forEach((_, habitIndex) => {
        if (!data.kidsStars[childIndex][habitIndex]) {
          data.kidsStars[childIndex][habitIndex] = Array(7).fill(false);
        }
      });
    });

    data.parents.forEach((_, parentIndex) => {
      if (!data.parentsStars[parentIndex]) {
        data.parentsStars[parentIndex] = {};
      }
      data.parentHabits.forEach((_, habitIndex) => {
        if (!data.parentsStars[parentIndex][habitIndex]) {
          data.parentsStars[parentIndex][habitIndex] = Array(7).fill(false);
        }
      });
    });

    this.chartDataSubject.next(data);
  }

  private async loadFromSupabase(): Promise<void> {
    const members = await this.supabaseService.loadFamilyMembers();

    // Map member names to IDs
    members.forEach(member => {
      this.familyMemberIds.set(member.name, member.id);
    });

    // Load star completions
    const completions = await this.supabaseService.loadStarCompletions();
    const data = this.chartDataSubject.value;

    // Reset stars
    data.kidsStars = {};
    data.parentsStars = {};
    this.initializeStars();

    // Apply completions from database
    completions.forEach(completion => {
      const memberName = this.getMemberNameById(completion.member_id);
      if (!memberName) return;

      const childIndex = data.children.findIndex(c => c.name === memberName);
      const parentIndex = data.parents.findIndex(p => p.name === memberName);

      if (childIndex >= 0) {
        data.kidsStars[childIndex][completion.habit_index][completion.day_index] = completion.is_completed;
      } else if (parentIndex >= 0) {
        data.parentsStars[parentIndex][completion.habit_index][completion.day_index] = completion.is_completed;
      }
    });

    this.chartDataSubject.next(data);
  }

  private getMemberNameById(id: string): string | undefined {
    return Array.from(this.familyMemberIds.entries())
      .find(([_, memberId]) => memberId === id)?.[0];
  }

  async toggleStar(
    section: 'kids' | 'parents',
    personIndex: number,
    habitIndex: number,
    dayIndex: number
  ): Promise<void> {
    const data = this.chartDataSubject.value;
    const starsData = section === 'kids' ? data.kidsStars : data.parentsStars;

    starsData[personIndex][habitIndex][dayIndex] = !starsData[personIndex][habitIndex][dayIndex];
    const isCompleted = starsData[personIndex][habitIndex][dayIndex];

    this.chartDataSubject.next(data);

    // Save to Supabase
    if (this.supabaseService.isInitialized()) {
      const person = section === 'kids' ? data.children[personIndex] : data.parents[personIndex];
      const memberId = this.familyMemberIds.get(person.name);

      if (memberId) {
        await this.supabaseService.saveStarCompletion(memberId, habitIndex, dayIndex, isCompleted);
      }
    }
  }

  calculateTotalStars(section: 'kids' | 'parents', personIndex: number): number {
    const data = this.chartDataSubject.value;
    const starsData = section === 'kids' ? data.kidsStars : data.parentsStars;
    const habitsCount = section === 'kids' ? data.kidsHabits.length : data.parentHabits.length;

    let total = 0;
    for (let habitIndex = 0; habitIndex < habitsCount; habitIndex++) {
      if (starsData[personIndex]?.[habitIndex]) {
        total += starsData[personIndex][habitIndex].filter(star => star).length;
      }
    }
    return total;
  }

  getNextMilestone(stars: number, isParent: boolean = false): number {
    const data = this.chartDataSubject.value;
    const rewards = isParent ? data.parentsRewards : data.kidsRewards;
    const milestones = [...new Set(rewards.map(r => r.stars))].sort((a, b) => a - b);

    for (const milestone of milestones) {
      if (stars < milestone) {
        return milestone;
      }
    }
    return milestones[milestones.length - 1];
  }

  toggleParentsVisibility(): void {
    const data = this.chartDataSubject.value;
    data.parentsVisible = !data.parentsVisible;
    this.chartDataSubject.next(data);
  }

  updateChildrenNames(names: string[]): void {
    const data = this.chartDataSubject.value;
    names.forEach((name, index) => {
      if (data.children[index]) {
        data.children[index].name = name;
      }
    });
    this.chartDataSubject.next(data);
  }

  async resetWeek(): Promise<void> {
    const data = this.chartDataSubject.value;
    data.kidsStars = {};
    data.parentsStars = {};
    this.initializeStars();

    if (this.supabaseService.isInitialized()) {
      await this.supabaseService.resetWeek();
    }

    this.chartDataSubject.next(data);
  }

  getCurrentWeekDisplay(): string {
    const now = new Date();
    const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    return `Week of ${formatDate(monday)} - ${formatDate(sunday)}, ${monday.getFullYear()}`;
  }
}
