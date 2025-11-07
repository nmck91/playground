import { Injectable, signal } from '@angular/core';
import { CalendarEvent, EventCategory, RecurrenceRule } from '../models/event.model';
import { SupabaseService } from './supabase.service';

interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  category: string;
  is_recurring: boolean;
  recurrence_frequency: string | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  recurrence_days_of_week: number[] | null;
  recurrence_count: number | null;
  color: string | null;
  location: string | null;
  created_by: string | null;
  attendees: string[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private events = signal<CalendarEvent[]>([]);
  private useSupabase = false;

  // Expose as readonly signal
  readonly eventsSignal = this.events.asReadonly();

  constructor(private supabaseService: SupabaseService) {
    this.useSupabase = this.supabaseService.isConfigured();

    if (this.useSupabase) {
      console.log('✅ Using Supabase for data storage');
      this.loadEventsFromSupabase();
    } else {
      console.log('⚠️ Supabase not configured, using localStorage');
      this.loadEventsFromStorage();
    }
  }

  getEvents(): CalendarEvent[] {
    return this.events();
  }

  getEventsByDateRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.events().filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }

  getEventsByCategory(category: EventCategory): CalendarEvent[] {
    return this.events().filter(event => event.category === category);
  }

  async addEvent(event: CalendarEvent): Promise<void> {
    if (this.useSupabase) {
      await this.addEventToSupabase(event);
    } else {
      const newEvents = [...this.events(), { ...event, id: this.generateId() }];
      this.events.set(newEvents);
      this.saveEventsToStorage();
    }
  }

  async updateEvent(id: string, updatedEvent: Partial<CalendarEvent>): Promise<void> {
    if (this.useSupabase) {
      await this.updateEventInSupabase(id, updatedEvent);
    } else {
      const newEvents = this.events().map(event =>
        event.id === id ? { ...event, ...updatedEvent } : event
      );
      this.events.set(newEvents);
      this.saveEventsToStorage();
    }
  }

  async deleteEvent(id: string): Promise<void> {
    if (this.useSupabase) {
      await this.deleteEventFromSupabase(id);
    } else {
      const newEvents = this.events().filter(event => event.id !== id);
      this.events.set(newEvents);
      this.saveEventsToStorage();
    }
  }

  // Supabase methods
  private async loadEventsFromSupabase(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error loading events from Supabase:', error);
        return;
      }

      if (data) {
        const events = data.map(this.dbEventToCalendarEvent);
        this.events.set(events);
      }
    } catch (error) {
      console.error('Failed to load events from Supabase:', error);
    }
  }

  private async addEventToSupabase(event: CalendarEvent): Promise<void> {
    try {
      const dbEvent = this.calendarEventToDbEvent(event);
      const { data, error } = await this.supabaseService.client
        .from('events')
        .insert(dbEvent)
        .select()
        .single();

      if (error) {
        console.error('Error adding event to Supabase:', error);
        return;
      }

      if (data) {
        const newEvent = this.dbEventToCalendarEvent(data);
        this.events.set([...this.events(), newEvent]);
      }
    } catch (error) {
      console.error('Failed to add event to Supabase:', error);
    }
  }

  private async updateEventInSupabase(id: string, updatedEvent: Partial<CalendarEvent>): Promise<void> {
    try {
      const dbUpdate = this.calendarEventToDbEvent(updatedEvent as CalendarEvent, false);
      // @ts-ignore - Supabase type inference issue with partial updates
      const { data, error } = await this.supabaseService.client
        .from('events')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event in Supabase:', error);
        return;
      }

      if (data) {
        const updated = this.dbEventToCalendarEvent(data);
        const newEvents = this.events().map(event =>
          event.id === id ? updated : event
        );
        this.events.set(newEvents);
      }
    } catch (error) {
      console.error('Failed to update event in Supabase:', error);
    }
  }

  private async deleteEventFromSupabase(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.client
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting event from Supabase:', error);
        return;
      }

      const newEvents = this.events().filter(event => event.id !== id);
      this.events.set(newEvents);
    } catch (error) {
      console.error('Failed to delete event from Supabase:', error);
    }
  }

  // Conversion methods
  private dbEventToCalendarEvent(dbEvent: DbEvent): CalendarEvent {
    const recurrenceRule: RecurrenceRule | undefined = dbEvent.is_recurring && dbEvent.recurrence_frequency
      ? {
          frequency: dbEvent.recurrence_frequency as any,
          interval: dbEvent.recurrence_interval || 1,
          endDate: dbEvent.recurrence_end_date ? new Date(dbEvent.recurrence_end_date) : undefined,
          daysOfWeek: dbEvent.recurrence_days_of_week || undefined,
          count: dbEvent.recurrence_count || undefined
        }
      : undefined;

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || undefined,
      startDate: new Date(dbEvent.start_date),
      endDate: new Date(dbEvent.end_date),
      category: dbEvent.category as EventCategory,
      isRecurring: dbEvent.is_recurring,
      recurrenceRule,
      color: dbEvent.color || undefined,
      location: dbEvent.location || undefined,
      createdBy: dbEvent.created_by || undefined,
      attendees: dbEvent.attendees || undefined
    };
  }

  private calendarEventToDbEvent(event: CalendarEvent, includeId = true): any {
    const dbEvent: any = {
      title: event.title,
      description: event.description || null,
      start_date: event.startDate.toISOString(),
      end_date: event.endDate.toISOString(),
      category: event.category,
      is_recurring: event.isRecurring,
      recurrence_frequency: event.recurrenceRule?.frequency || null,
      recurrence_interval: event.recurrenceRule?.interval || null,
      recurrence_end_date: event.recurrenceRule?.endDate?.toISOString() || null,
      recurrence_days_of_week: event.recurrenceRule?.daysOfWeek || null,
      recurrence_count: event.recurrenceRule?.count || null,
      color: event.color || null,
      location: event.location || null,
      created_by: event.createdBy || null,
      attendees: event.attendees || null
    };

    if (includeId && event.id) {
      dbEvent.id = event.id;
    }

    return dbEvent;
  }

  // localStorage methods (fallback)
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveEventsToStorage(): void {
    try {
      localStorage.setItem('family-calendar-events', JSON.stringify(this.events()));
    } catch (error) {
      console.error('Failed to save events to storage:', error);
    }
  }

  private loadEventsFromStorage(): void {
    try {
      const stored = localStorage.getItem('family-calendar-events');
      if (stored) {
        const events = JSON.parse(stored);
        // Convert date strings back to Date objects
        const parsedEvents = events.map((event: any) => ({
          ...event,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          recurrenceRule: event.recurrenceRule ? {
            ...event.recurrenceRule,
            endDate: event.recurrenceRule.endDate ? new Date(event.recurrenceRule.endDate) : undefined
          } : undefined
        }));
        this.events.set(parsedEvents);
      }
    } catch (error) {
      console.error('Failed to load events from storage:', error);
    }
  }
}
