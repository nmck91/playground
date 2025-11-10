import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyMember } from '../../models/family-member.model';
import { StarsData } from '../../models/chart-data.model';

export interface StarToggleEvent {
  section: 'kids' | 'parents';
  personIndex: number;
  habitIndex: number;
  dayIndex: number;
}

@Component({
  selector: 'app-child-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './child-card.component.html'
})
export class ChildCardComponent {
  @Input() person!: FamilyMember;
  @Input() personIndex!: number;
  @Input() section!: 'kids' | 'parents';
  @Input() habits!: string[];
  @Input() days!: string[];
  @Input() starsData!: StarsData;
  @Input() totalStars!: number;
  @Input() nextMilestone!: number;

  @Output() starToggled = new EventEmitter<StarToggleEvent>();

  get progressPercent(): number {
    return Math.min((this.totalStars / this.nextMilestone) * 100, 100);
  }

  isStarFilled(habitIndex: number, dayIndex: number): boolean {
    return this.starsData[this.personIndex]?.[habitIndex]?.[dayIndex] || false;
  }

  onStarClick(habitIndex: number, dayIndex: number): void {
    this.starToggled.emit({
      section: this.section,
      personIndex: this.personIndex,
      habitIndex,
      dayIndex
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getCardClasses(): string {
    const baseClasses = 'bg-cream-100 rounded-md border-2 p-16 shadow-sm';
    const colorMap: Record<string, string> = {
      'child-1': 'border-child-1 bg-child-1/10',
      'child-2': 'border-child-2 bg-child-2/10',
      'child-3': 'border-child-3 bg-child-3/10',
      'parent': 'border-parent bg-parent/10',
    };
    return `${baseClasses} ${colorMap[this.person.className] || ''}`;
  }
}
