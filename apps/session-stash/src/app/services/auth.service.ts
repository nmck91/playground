import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AuthState } from '../state/auth.state';
import { ShareTargetService } from './share-target.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private authState = inject(AuthState);
  private shareTarget = inject(ShareTargetService);
  private router = inject(Router);

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener(): void {
    // Set initial user
    this.supabase.getUser().then((user) => {
      this.authState.setUser(user);
    });

    // Listen for auth changes
    this.supabase.onAuthStateChange((user) => {
      this.authState.setUser(user);

      if (user) {
        // Check for pending share after login
        this.shareTarget.processPendingShare();
      }
    });
  }

  async signUp(
    email: string,
    password: string
  ): Promise<{ error?: string }> {
    this.authState.setLoading(true);
    const result = await this.supabase.signUp(email, password);

    if (result?.error) {
      this.authState.setLoading(false);
      return { error: result.error.message };
    }

    return {};
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ error?: string }> {
    this.authState.setLoading(true);
    const result = await this.supabase.signIn(email, password);

    if (result?.error) {
      this.authState.setLoading(false);
      return { error: result.error.message };
    }

    return {};
  }

  async signInWithMagicLink(email: string): Promise<{ error?: string }> {
    const result = await this.supabase.signInWithMagicLink(email);

    if (result?.error) {
      return { error: result.error.message };
    }

    return {};
  }

  async signOut(): Promise<void> {
    await this.supabase.signOut();
    this.authState.clear();
    this.router.navigate(['/login']);
  }
}
