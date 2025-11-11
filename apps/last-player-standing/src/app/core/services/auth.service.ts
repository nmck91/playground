import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { SignUpPayload, LoginPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor() {
    // Listen for auth state changes
    this.supabase.onAuthStateChange((event: string, session: any) => {
      if (session?.user) {
        localStorage.setItem('session', JSON.stringify(session.user));
        this.ngZone.run(() => {
          this.router.navigate(['/dashboard']);
        });
      } else {
        localStorage.removeItem('session');
      }
    });
  }

  async signUp(payload: SignUpPayload) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          phone: payload.phone
        }
      }
    });

    if (error) throw error;

    // Profile is automatically created by database trigger
    // No need to manually create it here
    return data;
  }

  async signIn(payload: LoginPayload) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error) throw error;
    return data;
  }

  async signInWithMagicLink(email: string) {
    const { data, error } = await this.supabase.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.client.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('session');
    this.router.navigate(['/']);
  }

  get isLoggedIn(): boolean {
    const session = localStorage.getItem('session');
    return session !== null && session !== 'undefined';
  }

  getCurrentUser() {
    return this.supabase.client.auth.getUser();
  }
}
