import { Component, computed, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { CalendarEvent, CATEGORY_COLORS } from '../../models/event.model';

@Component({
  selector: 'dadai-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent {
  editEvent = output<CalendarEvent>();
  deleteEvent = output<string>();
  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);

  readonly monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  readonly dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Computed properties
  currentMonth = computed(() => this.monthNames[this.currentDate().getMonth()]);
  currentYear = computed(() => this.currentDate().getFullYear());

  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date | null; isCurrentMonth: boolean; events: CalendarEvent[] }> = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false, events: [] });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const dayEvents = this.getEventsForDate(currentDay);
      days.push({ date: currentDay, isCurrentMonth: true, events: dayEvents });
    }

    return days;
  });

  private eventService = inject(EventService);

  previousMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.currentDate();
    this.currentDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  selectDate(date: Date): void {
    this.selectedDate.set(date);
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date | null): boolean {
    const selected = this.selectedDate();
    if (!date || !selected) return false;
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    return this.eventService.getEventsByDateRange(startOfDay, endOfDay);
  }

  getEventColor(event: CalendarEvent): string {
    return event.color || CATEGORY_COLORS[event.category];
  }

  onEditEvent(event: CalendarEvent, clickEvent: Event): void {
    clickEvent.stopPropagation();
    this.editEvent.emit(event);
  }

  onDeleteEvent(eventId: string, clickEvent: Event): void {
    clickEvent.stopPropagation();
    if (confirm('Are you sure you want to delete this event?')) {
      this.deleteEvent.emit(eventId);
    }
  }
}
