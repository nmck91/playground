export interface Pick {
  id: string;
  entry_id: string;
  matchweek_id: string;
  fixture_id: string;
  selected_team: string;
  is_winning_pick: boolean | null;
  created_at: string;
}

export interface Fixture {
  id: string;
  matchweek_id: string;
  home_team: string;
  away_team: string;
  kickoff_time: string;
  result: 'home' | 'away' | 'draw' | null;
  winning_team: string | null;
}
