export interface Entry {
  id: string;
  competition_id: string;
  user_id: string;
  lives_remaining: number;
  is_active: boolean;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  created_at: string;
}
