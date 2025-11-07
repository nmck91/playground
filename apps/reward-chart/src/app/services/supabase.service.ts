import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isConfigured()) {
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.anonKey
      );
      this.initialized = true;
      console.log('✅ Supabase connected!');
    } else {
      console.warn('⚠️ Supabase not configured - running in local-only mode');
    }
  }

  isConfigured(): boolean {
    return !!(environment.supabase?.url && environment.supabase?.anonKey);
  }

  isInitialized(): boolean {
    return this.initialized && this.supabase !== null;
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  async loadFamilyMembers() {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('family_members')
        .select('*')
        .order('display_order');

      if (error) throw error;

      console.log('✅ Loaded family members:', data);
      return data || [];
    } catch (error) {
      console.error('Error loading family members:', error);
      return [];
    }
  }

  async loadStarCompletions() {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('star_completions')
        .select('*');

      if (error) throw error;

      console.log('✅ Loaded star completions from Supabase');
      return data || [];
    } catch (error) {
      console.error('Error loading star completions:', error);
      return [];
    }
  }

  async saveStarCompletion(
    memberId: string,
    habitIndex: number,
    dayIndex: number,
    isCompleted: boolean
  ) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('star_completions')
        .upsert({
          member_id: memberId,
          habit_index: habitIndex,
          day_index: dayIndex,
          is_completed: isCompleted,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'member_id,habit_index,day_index'
        });

      if (error) throw error;

      console.log('💾 Saved to Supabase:', memberId, habitIndex, dayIndex, isCompleted);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
    }
  }

  async resetWeek() {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('star_completions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      console.log('✅ Reset week in Supabase');
    } catch (error) {
      console.error('Error resetting week:', error);
    }
  }
}
