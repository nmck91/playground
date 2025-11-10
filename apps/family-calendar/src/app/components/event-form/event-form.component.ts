import { Component, EventEmitter, Input, Output, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, EventCategory, RecurrenceFrequency } from '../../models/event.model';

@Component({
  selector: 'dadai-event-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() event: CalendarEvent | null = null;
  @Output() save = new EventEmitter<Partial<CalendarEvent>>();
  @Output() formCancel = new EventEmitter<void>();

  title = signal('');
  description = signal('');
  startDate = signal('');
  startTime = signal('');
  endDate = signal('');
  endTime = signal('');
  category = signal<EventCategory>(EventCategory.PERSONAL);
  location = signal('');
  isRecurring = signal(false);
  recurrenceFrequency = signal<RecurrenceFrequency>(RecurrenceFrequency.WEEKLY);
  recurrenceInterval = signal(1);

  readonly categories = Object.values(EventCategory);
  readonly frequencies = Object.values(RecurrenceFrequency);

  ngOnInit() {
    if (this.event) {
      this.populateForm(this.event);
    } else {
      // Set default to today
      const today = new Date();
      this.startDate.set(this.formatDate(today));
      this.endDate.set(this.formatDate(today));
      this.startTime.set('09:00');
      this.endTime.set('10:00');
    }
  }

  ngOnChanges() {
    // Handle when event input changes (for editing)
    if (this.event) {
      this.populateForm(this.event);
    }
  }

  populateForm(event: CalendarEvent) {
    this.title.set(event.title);
    this.description.set(event.description || '');
    this.startDate.set(this.formatDate(event.startDate));
    this.startTime.set(this.formatTime(event.startDate));
    this.endDate.set(this.formatDate(event.endDate));
    this.endTime.set(this.formatTime(event.endDate));
    this.category.set(event.category);
    this.location.set(event.location || '');
    this.isRecurring.set(event.isRecurring);
    if (event.recurrenceRule) {
      this.recurrenceFrequency.set(event.recurrenceRule.frequency);
      this.recurrenceInterval.set(event.recurrenceRule.interval);
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit() {
    const startDateTime = new Date(`${this.startDate()}T${this.startTime()}`);
    const endDateTime = new Date(`${this.endDate()}T${this.endTime()}`);

    const eventData: Partial<CalendarEvent> = {
      title: this.title(),
      description: this.description(),
      startDate: startDateTime,
      endDate: endDateTime,
      category: this.category(),
      location: this.location(),
      isRecurring: this.isRecurring()
    };

    if (this.isRecurring()) {
      eventData.recurrenceRule = {
        frequency: this.recurrenceFrequency(),
        interval: this.recurrenceInterval()
      };
    } else {
      eventData.recurrenceRule = undefined;
    }

    // Include the event ID if we're editing
    if (this.event) {
      eventData.id = this.event.id;
    }

    this.save.emit(eventData);
  }

  onCancel() {
    this.formCancel.emit();
  }
}
