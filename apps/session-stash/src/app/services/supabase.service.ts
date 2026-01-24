import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Database } from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient<Database> | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isConfigured()) {
      this.supabase = createClient<Database>(
        environment.supabase.url,
        environment.supabase.anonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      );
      console.log('✅ Supabase connected');
    } else {
      console.warn('⚠️ Supabase not configured');
    }
  }

  isConfigured(): boolean {
    return !!(
      environment.supabase?.url &&
      environment.supabase?.anonKey &&
      !environment.supabase.url.includes('__')
    );
  }

  getClient(): SupabaseClient<Database> | null {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return this.supabase?.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return this.supabase?.auth.signInWithPassword({ email, password });
  }

  async signInWithMagicLink(email: string) {
    return this.supabase?.auth.signInWithOtp({ email });
  }

  async signOut() {
    return this.supabase?.auth.signOut();
  }

  async getUser(): Promise<User | null> {
    const { data } = (await this.supabase?.auth.getUser()) ?? { data: null };
    return data?.user ?? null;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase?.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null);
    });
  }
}
