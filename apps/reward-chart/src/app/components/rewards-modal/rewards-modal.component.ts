import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reward } from '../../models/reward.model';

interface RewardEdit {
  reward: Reward;
  index: number;
  type: 'kids' | 'parents';
}

@Component({
  selector: 'app-rewards-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rewards-modal.component.html'
})
export class RewardsModalComponent {
  @Input() visible = false;
  @Input() kidsRewards: Reward[] = [];
  @Input() parentsRewards: Reward[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() updateReward = new EventEmitter<{ type: 'kids' | 'parents'; index: number; reward: Reward }>();
  @Output() deleteReward = new EventEmitter<{ type: 'kids' | 'parents'; index: number }>();
  @Output() addReward = new EventEmitter<{ type: 'kids' | 'parents'; reward: Reward }>();

  editingReward: RewardEdit | null = null;
  addingReward: { type: 'kids' | 'parents' } | null = null;
  newReward: Reward = { name: '', stars: 20 };

  onClose(): void {
    this.editingReward = null;
    this.addingReward = null;
    this.newReward = { name: '', stars: 20 };
    this.closeModal.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    // Close if clicking on the overlay itself (not on modal content)
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  startEdit(reward: Reward, index: number, type: 'kids' | 'parents'): void {
    this.editingReward = {
      reward: { ...reward },
      index,
      type
    };
  }

  cancelEdit(): void {
    this.editingReward = null;
  }

  saveEdit(): void {
    if (this.editingReward && this.editingReward.reward.name.trim() && this.editingReward.reward.stars > 0) {
      this.updateReward.emit({
        type: this.editingReward.type,
        index: this.editingReward.index,
        reward: this.editingReward.reward
      });
      this.editingReward = null;
    }
  }

  deleteRewardItem(index: number, type: 'kids' | 'parents'): void {
    if (confirm('Are you sure you want to delete this reward?')) {
      this.deleteReward.emit({ type, index });
    }
  }

  startAdd(type: 'kids' | 'parents'): void {
    this.addingReward = { type };
    this.newReward = { name: '', stars: 20 };
  }

  cancelAdd(): void {
    this.addingReward = null;
    this.newReward = { name: '', stars: 20 };
  }

  saveAdd(): void {
    if (this.addingReward && this.newReward.name.trim() && this.newReward.stars > 0) {
      this.addReward.emit({
        type: this.addingReward.type,
        reward: { ...this.newReward }
      });
      this.addingReward = null;
      this.newReward = { name: '', stars: 20 };
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  isEditing(index: number, type: 'kids' | 'parents'): boolean {
    return this.editingReward?.index === index && this.editingReward?.type === type;
  }
}
