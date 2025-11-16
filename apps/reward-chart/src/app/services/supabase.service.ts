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

  async ensureFamilyMembersExist(members: Array<{ name: string; type: 'child' | 'parent'; color: string; order: number }>) {
    if (!this.supabase) {
      console.warn('⚠️ Supabase not initialized, cannot sync family members');
      return [];
    }

    try {
      console.log('🔄 Syncing family members to database...');

      // First, check if we need to create a family
      const { data: families, error: familyError } = await this.supabase
        .from('families')
        .select('id')
        .limit(1);

      if (familyError) {
        console.error('❌ Error loading families:', familyError);
        throw familyError;
      }

      let familyId: string;

      if (!families || families.length === 0) {
        // Create a default family
        console.log('📝 No family found, creating default family...');
        const { data: newFamily, error: createError } = await this.supabase
          .from('families')
          .insert({ name: 'My Family' })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating family:', createError);
          throw createError;
        }
        familyId = newFamily.id;
        console.log('✅ Created default family:', familyId);
      } else {
        familyId = families[0].id;
        console.log('✅ Found existing family:', familyId);
      }

      // Load existing members
      const { data: existingMembers, error: loadError } = await this.supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId);

      if (loadError) {
        console.error('❌ Error loading family members:', loadError);
        throw loadError;
      }

      console.log('📋 Found existing members:', existingMembers?.length || 0);

      const existingMemberMap = new Map(
        (existingMembers || []).map(m => [m.name, m])
      );

      const createdMembers: Array<{ id: string; name: string }> = [];

      // Create or update members
      for (const member of members) {
        const existing = existingMemberMap.get(member.name);

        if (!existing) {
          // Create new member
          console.log(`📝 Creating member: ${member.name}`);
          const { data: newMember, error: insertError } = await this.supabase
            .from('family_members')
            .insert({
              family_id: familyId,
              name: member.name,
              member_type: member.type,
              color_code: member.color,
              display_order: member.order
            })
            .select('id, name')
            .single();

          if (insertError) {
            console.error(`❌ Error creating member ${member.name}:`, insertError);
            throw insertError;
          }
          createdMembers.push(newMember);
          console.log('✅ Created family member:', member.name, newMember.id);
        } else {
          createdMembers.push({ id: existing.id, name: existing.name });
          console.log('✅ Using existing member:', member.name, existing.id);
        }
      }

      console.log('✅ Family member sync complete. Total members:', createdMembers.length);
      return createdMembers;
    } catch (error) {
      console.error('❌ Fatal error ensuring family members exist:', error);
      return [];
    }
  }
}
