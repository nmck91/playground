import { Component, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { EventService } from './services/event.service';
import { CalendarEvent } from './models/event.model';

@Component({
  imports: [CalendarComponent, EventFormComponent, RouterModule],
  selector: 'dadai-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">👨‍👩‍👧‍👦 Family Calendar</h1>
          <button class="add-event-btn" (click)="showEventForm.set(true)">
            + Add Event
          </button>
        </div>
      </header>

      <main class="app-main">
        <dadai-calendar
          (editEvent)="handleEditEvent($event)"
          (deleteEvent)="handleDeleteEvent($event)"
        ></dadai-calendar>
      </main>

      @if (showEventForm()) {
        <dadai-event-form
          [event]="selectedEvent()"
          (save)="handleSaveEvent($event)"
          (formCancel)="handleCancelEvent()"
        ></dadai-event-form>
      }
    </div>
    <router-outlet></router-outlet>
  `,
  styles: `
    .app-container {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f0f9ff, #ffffff);
    }

    .app-header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .add-event-btn {
      padding: 10px 20px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }

    .add-event-btn:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
    }

    .app-main {
      padding: 20px 0;
    }

    @media (max-width: 768px) {
      .app-title {
        font-size: 1.25rem;
      }

      .add-event-btn {
        padding: 8px 16px;
        font-size: 0.9rem;
      }
    }
  `,
})
export class App {
  protected title = 'family-calendar';
  showEventForm = signal(false);
  selectedEvent = signal<CalendarEvent | null>(null);

  private eventService = inject(EventService);

  handleSaveEvent(eventData: Partial<CalendarEvent>) {
    const selected = this.selectedEvent();
    if (selected) {
      // Update existing event
      this.eventService.updateEvent(selected.id, eventData);
    } else {
      // Create new event
      this.eventService.addEvent(eventData as CalendarEvent);
    }
    this.showEventForm.set(false);
    this.selectedEvent.set(null);
  }

  handleCancelEvent() {
    this.showEventForm.set(false);
    this.selectedEvent.set(null);
  }

  handleEditEvent(event: CalendarEvent) {
    this.selectedEvent.set(event);
    this.showEventForm.set(true);
  }

  handleDeleteEvent(eventId: string) {
    this.eventService.deleteEvent(eventId);
  }
}
