import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reward } from '../../models/reward.model';

@Component({
  selector: 'app-rewards-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rewards-modal.component.html',
  styleUrl: './rewards-modal.component.css'
})
export class RewardsModalComponent {
  @Input() visible = false;
  @Input() kidsRewards: Reward[] = [];
  @Input() parentsRewards: Reward[] = [];
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('rewards-overlay')) {
      this.onClose();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
