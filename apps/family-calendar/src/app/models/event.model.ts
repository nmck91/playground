export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category: EventCategory;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  color?: string;
  location?: string;
  createdBy?: string;
  attendees?: string[];
}

export enum EventCategory {
  WORK = 'work',
  KIDS = 'kids',
  PERSONAL = 'personal',
  FAMILY = 'family',
  SPORTS = 'sports',
  SCHOOL = 'school',
  APPOINTMENT = 'appointment',
  OTHER = 'other'
}

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  count?: number; // Number of occurrences
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  [EventCategory.WORK]: '#3b82f6',
  [EventCategory.KIDS]: '#f59e0b',
  [EventCategory.PERSONAL]: '#8b5cf6',
  [EventCategory.FAMILY]: '#10b981',
  [EventCategory.SPORTS]: '#ef4444',
  [EventCategory.SCHOOL]: '#06b6d4',
  [EventCategory.APPOINTMENT]: '#ec4899',
  [EventCategory.OTHER]: '#6b7280'
};
