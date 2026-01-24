import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DrillsState } from '../state/drills.state';
import { Drill, CreateDrillInput, UpdateDrillInput } from '../models/drill.model';

@Injectable({ providedIn: 'root' })
export class DrillService {
  private supabase = inject(SupabaseService);
  private drillsState = inject(DrillsState);

  async loadDrills(): Promise<void> {
    this.drillsState.setLoading(true);

    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      const { data, error } = await client
        .from('session_stash_drills')
        .select(
          `
          *,
          session_stash_drill_system_tags(session_stash_system_tags(*)),
          session_stash_drill_user_tags(session_stash_user_tags(*))
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      const drills = this.mapDrillsResponse(data);
      this.drillsState.setDrills(drills);
    } catch (error) {
      this.drillsState.setError(this.getErrorMessage(error));
    }
  }

  async createDrill(input: CreateDrillInput): Promise<Drill | null> {
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      // Insert drill
      const { data: drill, error: drillError } = await client
        .from('session_stash_drills')
        .insert({
          url: input.url,
          title: input.title,
          notes: input.notes,
        })
        .select()
        .single();

      if (drillError) throw drillError;

      // Insert system tag associations
      if (input.systemTagIds.length > 0) {
        await client.from('session_stash_drill_system_tags').insert(
          input.systemTagIds.map((tagId) => ({
            drill_id: drill.id,
            system_tag_id: tagId,
          }))
        );
      }

      // Insert user tag associations
      if (input.userTagIds.length > 0) {
        await client.from('session_stash_drill_user_tags').insert(
          input.userTagIds.map((tagId) => ({
            drill_id: drill.id,
            user_tag_id: tagId,
          }))
        );
      }

      // Reload to get full drill with tags
      const fullDrill = await this.getDrillById(drill.id);
      if (fullDrill) {
        this.drillsState.addDrill(fullDrill);
      }

      return fullDrill;
    } catch (error) {
      this.drillsState.setError(this.getErrorMessage(error));
      return null;
    }
  }

  async updateDrill(input: UpdateDrillInput): Promise<Drill | null> {
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      // Update drill
      const { error: drillError } = await client
        .from('session_stash_drills')
        .update({
          url: input.url,
          title: input.title,
          notes: input.notes,
        })
        .eq('id', input.id);

      if (drillError) throw drillError;

      // Delete existing tag associations
      await client.from('session_stash_drill_system_tags').delete().eq('drill_id', input.id);
      await client.from('session_stash_drill_user_tags').delete().eq('drill_id', input.id);

      // Insert new tag associations
      if (input.systemTagIds.length > 0) {
        await client.from('session_stash_drill_system_tags').insert(
          input.systemTagIds.map((tagId) => ({
            drill_id: input.id,
            system_tag_id: tagId,
          }))
        );
      }

      if (input.userTagIds.length > 0) {
        await client.from('session_stash_drill_user_tags').insert(
          input.userTagIds.map((tagId) => ({
            drill_id: input.id,
            user_tag_id: tagId,
          }))
        );
      }

      // Reload to get full drill with tags
      const fullDrill = await this.getDrillById(input.id);
      if (fullDrill) {
        this.drillsState.updateDrill(fullDrill);
      }

      return fullDrill;
    } catch (error) {
      this.drillsState.setError(this.getErrorMessage(error));
      return null;
    }
  }

  async deleteDrill(id: string): Promise<boolean> {
    try {
      const client = this.supabase.getClient();
      if (!client) throw new Error('Supabase not initialized');

      const { error } = await client.from('session_stash_drills').delete().eq('id', id);

      if (error) throw error;

      this.drillsState.removeDrill(id);
      return true;
    } catch (error) {
      this.drillsState.setError(this.getErrorMessage(error));
      return false;
    }
  }

  async getDrillById(id: string): Promise<Drill | null> {
    try {
      const client = this.supabase.getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('session_stash_drills')
        .select(
          `
          *,
          session_stash_drill_system_tags(session_stash_system_tags(*)),
          session_stash_drill_user_tags(session_stash_user_tags(*))
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.mapDrillResponse(data);
    } catch {
      return null;
    }
  }

  async checkDrillExists(id: string): Promise<boolean> {
    const client = this.supabase.getClient();
    if (!client) return false;

    const { data } = await client
      .from('session_stash_drills')
      .select('id')
      .eq('id', id)
      .single();

    return !!data;
  }

  private mapDrillsResponse(data: any[]): Drill[] {
    return data.map((d) => this.mapDrillResponse(d));
  }

  private mapDrillResponse(d: any): Drill {
    return {
      id: d.id,
      user_id: d.user_id,
      url: d.url,
      title: d.title,
      notes: d.notes,
      created_at: d.created_at,
      system_tags:
        d.session_stash_drill_system_tags?.map((dst: any) => dst.session_stash_system_tags) ?? [],
      user_tags: d.session_stash_drill_user_tags?.map((dut: any) => dut.session_stash_user_tags) ?? [],
    };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return 'An unexpected error occurred';
  }
}
