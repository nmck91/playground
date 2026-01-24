import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { HabitCompletion } from '../models/types';

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
      console.log('Supabase connected!');
    } else {
      console.warn('Supabase not configured - running in local-only mode');
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

  // Family Members
  async loadFamilyMembers() {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('family_members')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading family members:', error);
      return [];
    }
  }

  async saveFamilyMember(member: {
    id: string;
    family_id: string;
    name: string;
    role: string;
    color: string;
    emoji: string;
    display_order: number;
  }) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('family_members')
        .upsert(member, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving family member:', error);
      return null;
    }
  }

  // Habits
  async loadHabits(familyId: string) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('habits')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading habits:', error);
      return [];
    }
  }

  async saveHabit(habit: {
    id: string;
    family_id: string;
    member_id: string;
    name: string;
    category: string;
  }) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('habits')
        .upsert(habit, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving habit:', error);
      return null;
    }
  }

  // Habit Completions
  async loadHabitCompletions(): Promise<HabitCompletion[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('habit_completions')
        .select('*');

      if (error) throw error;

      // Map database format to app format
      return (data || []).map(row => ({
        id: row.id,
        habitId: row.habit_id,
        date: row.completion_date,
        completed: row.completed,
        memberId: row.member_id
      }));
    } catch (error) {
      console.error('Error loading habit completions:', error);
      return [];
    }
  }

  async saveHabitCompletion(
    memberId: string,
    habitId: string,
    date: string,
    completed: boolean
  ) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('habit_completions')
        .upsert({
          id: `${habitId}-${date}`,
          member_id: memberId,
          habit_id: habitId,
          completion_date: date,
          completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving habit completion:', error);
    }
  }

  // Rewards
  async loadRewards(familyId: string) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('rewards')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading rewards:', error);
      return [];
    }
  }

  async saveReward(reward: {
    id: string;
    family_id: string;
    name: string;
    required_stars: number;
    cost: number;
    category: string;
    description: string;
  }) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('rewards')
        .upsert(reward, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving reward:', error);
      return null;
    }
  }

  // Reward Claims
  async claimReward(claim: {
    member_id: string;
    reward_id: string;
    stars_spent: number;
  }) {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from('reward_claims')
        .insert({
          ...claim,
          claimed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return null;
    }
  }

  async loadRewardClaims(memberId: string) {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('reward_claims')
        .select('*, rewards(*)')
        .eq('member_id', memberId)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading reward claims:', error);
      return [];
    }
  }

  // Families
  async ensureFamilyExists(familyName: string = 'My Family'): Promise<string | null> {
    if (!this.supabase) return null;

    try {
      // Check for existing family
      const { data: families, error: loadError } = await this.supabase
        .from('families')
        .select('id')
        .limit(1);

      if (loadError) throw loadError;

      if (families && families.length > 0) {
        return families[0].id;
      }

      // Create new family
      const { data: newFamily, error: createError } = await this.supabase
        .from('families')
        .insert({ name: familyName })
        .select('id')
        .single();

      if (createError) throw createError;
      return newFamily.id;
    } catch (error) {
      console.error('Error ensuring family exists:', error);
      return null;
    }
  }

  // Reset all data
  async resetAllData() {
    if (!this.supabase) return;

    try {
      // Delete all habit completions
      await this.supabase
        .from('habit_completions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Delete all reward claims
      await this.supabase
        .from('reward_claims')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      console.log('Reset all data in Supabase');
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
}
