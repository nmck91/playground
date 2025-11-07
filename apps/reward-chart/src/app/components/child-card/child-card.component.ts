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
  templateUrl: './child-card.component.html',
  styleUrl: './child-card.component.css'
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
}
