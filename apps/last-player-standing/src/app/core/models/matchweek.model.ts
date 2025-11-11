export interface Matchweek {
  id: string;
  competition_id: string;
  week_number: number;
  name: string;
  start_date: string;
  end_date: string;
  deadline: string;
  status: 'upcoming' | 'open' | 'closed' | 'completed';
}
