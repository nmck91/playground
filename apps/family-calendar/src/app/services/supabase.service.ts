import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          category: string;
          is_recurring?: boolean;
          recurrence_frequency?: string | null;
          recurrence_interval?: number | null;
          recurrence_end_date?: string | null;
          recurrence_days_of_week?: number[] | null;
          recurrence_count?: number | null;
          color?: string | null;
          location?: string | null;
          created_by?: string | null;
          attendees?: string[] | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          category?: string;
          is_recurring?: boolean;
          recurrence_frequency?: string | null;
          recurrence_interval?: number | null;
          recurrence_end_date?: string | null;
          recurrence_days_of_week?: number[] | null;
          recurrence_count?: number | null;
          color?: string | null;
          location?: string | null;
          created_by?: string | null;
          attendees?: string[] | null;
        };
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }

  // Check if Supabase is configured
  isConfigured(): boolean {
    return !!(environment.supabase.url && environment.supabase.anonKey);
  }
}
