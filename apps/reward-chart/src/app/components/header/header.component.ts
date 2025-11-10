import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  @Input() weekDisplay!: string;
  @Output() showRewards = new EventEmitter<void>();
  @Output() showSettings = new EventEmitter<void>();
  @Output() newWeek = new EventEmitter<void>();

  onShowRewards(): void {
    this.showRewards.emit();
  }

  onShowSettings(): void {
    this.showSettings.emit();
  }

  onNewWeek(): void {
    this.newWeek.emit();
  }
}
