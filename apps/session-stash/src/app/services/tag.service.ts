import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { TagsState } from '../state/tags.state';
import { UserTag, CreateUserTagInput } from '../models/tag.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private supabase = inject(SupabaseService);
  private tagsState = inject(TagsState);

  async loadTags(): Promise<void> {
    this.tagsState.setLoading(true);

    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      // Load system tags
      const { data: systemTags, error: systemError } = await client
        .from('session_stash_system_tags')
        .select('*')
        .order('sort_order');

      if (systemError) throw systemError;
      this.tagsState.setSystemTags(systemTags ?? []);

      // Load user tags
      const { data: userTags, error: userError } = await client
        .from('session_stash_user_tags')
        .select('*')
        .order('name');

      if (userError) throw userError;
      this.tagsState.setUserTags(userTags ?? []);
    } catch (error) {
      this.tagsState.setError(this.getErrorMessage(error));
    }
  }

  async createUserTag(input: CreateUserTagInput): Promise<UserTag | null> {
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      const { data, error } = await client
        .from('session_stash_user_tags')
        .insert({ name: input.name })
        .select()
        .single();

      if (error) throw error;

      this.tagsState.addUserTag(data);
      return data;
    } catch (error) {
      this.tagsState.setError(this.getErrorMessage(error));
      return null;
    }
  }

  async deleteUserTag(id: string): Promise<boolean> {
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      const { error } = await client.from('session_stash_user_tags').delete().eq('id', id);

      if (error) throw error;

      this.tagsState.removeUserTag(id);
      return true;
    } catch (error) {
      this.tagsState.setError(this.getErrorMessage(error));
      return false;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
  }
}
