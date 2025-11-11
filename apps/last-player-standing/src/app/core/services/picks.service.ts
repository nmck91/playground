import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Matchweek } from '../models/matchweek.model';
import { Pick, Fixture } from '../models/pick.model';

@Injectable({
  providedIn: 'root'
})
export class PicksService {
  constructor(private supabase: SupabaseService) {}

  async getAvailableMatchweeks(competitionId: string): Promise<Matchweek[]> {
    const { data, error } = await this.supabase.client
      .from('matchweeks')
      .select('*')
      .eq('competition_id', competitionId)
      .in('status', ['open', 'upcoming'])
      .order('week_number', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getFixturesForMatchweek(matchweekId: string): Promise<Fixture[]> {
    const { data, error } = await this.supabase.client
      .from('fixtures')
      .select('*')
      .eq('matchweek_id', matchweekId)
      .order('kickoff_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getUserPicksForMatchweek(entryId: string, matchweekId: string): Promise<Pick | null> {
    const { data, error } = await this.supabase.client
      .from('picks')
      .select('*')
      .eq('entry_id', entryId)
      .eq('matchweek_id', matchweekId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async submitPick(entryId: string, matchweekId: string, fixtureId: string, selectedTeam: string) {
    // First check if team has been used before
    const isValid = await this.validateTeamNotUsed(entryId, selectedTeam);
    if (!isValid) {
      throw new Error('You have already selected this team in a previous matchweek!');
    }

    // Insert pick
    const { data, error } = await this.supabase.client
      .from('picks')
      .insert({
        entry_id: entryId,
        matchweek_id: matchweekId,
        fixture_id: fixtureId,
        selected_team: selectedTeam
      })
      .select()
      .single();

    if (error) throw error;

    // Update team usage
    await this.recordTeamUsage(entryId, selectedTeam);

    return data;
  }

  async validateTeamNotUsed(entryId: string, teamName: string): Promise<boolean> {
    const { data, error } = await this.supabase.client
      .from('picks')
      .select('id')
      .eq('entry_id', entryId)
      .eq('selected_team', teamName);

    if (error) throw error;
    return !data || data.length === 0;
  }

  private async recordTeamUsage(entryId: string, teamName: string) {
    const { error } = await this.supabase.client
      .from('team_usage')
      .insert({
        entry_id: entryId,
        team_name: teamName,
        times_used: 1
      });

    if (error) throw error;
  }

  async getTeamUsage(entryId: string): Promise<string[]> {
    const { data, error } = await this.supabase.client
      .from('picks')
      .select('selected_team')
      .eq('entry_id', entryId);

    if (error) throw error;
    return data?.map(p => p.selected_team) || [];
  }
}
