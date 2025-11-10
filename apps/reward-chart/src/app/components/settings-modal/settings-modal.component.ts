import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html'
})
export class SettingsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() childrenNames: string[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveSettings = new EventEmitter<string[]>();

  child1Name = '';
  child2Name = '';
  child3Name = '';

  ngOnChanges(): void {
    if (this.childrenNames.length >= 3) {
      this.child1Name = this.childrenNames[0];
      this.child2Name = this.childrenNames[1];
      this.child3Name = this.childrenNames[2];
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSave(): void {
    this.saveSettings.emit([this.child1Name, this.child2Name, this.child3Name]);
    this.onClose();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('settings-overlay')) {
      this.onClose();
    }
  }
}
