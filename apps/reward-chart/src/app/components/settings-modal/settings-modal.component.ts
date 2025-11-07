import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.component.html',
  styleUrl: './settings-modal.component.css'
})
export class SettingsModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() childrenNames: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<string[]>();

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
    this.close.emit();
  }

  onSave(): void {
    this.save.emit([this.child1Name, this.child2Name, this.child3Name]);
    this.onClose();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('settings-overlay')) {
      this.onClose();
    }
  }
}
