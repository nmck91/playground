import { Injectable, computed, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';

export interface AuthStateModel {
  user: User | null;
  initialized: boolean;
  loading: boolean;
}

const initialState: AuthStateModel = {
  user: null,
  initialized: false,
  loading: true,
};

@Injectable({ providedIn: 'root' })
export class AuthState {
  private state = signal<AuthStateModel>(initialState);

  // Selectors
  readonly user = computed(() => this.state().user);
  readonly initialized = computed(() => this.state().initialized);
  readonly loading = computed(() => this.state().loading);
  readonly isAuthenticated = computed(() => !!this.state().user);
  readonly userId = computed(() => this.state().user?.id ?? null);

  // Actions
  setUser(user: User | null): void {
    this.state.update((s) => ({
      ...s,
      user,
      initialized: true,
      loading: false,
    }));
  }

  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading }));
  }

  clear(): void {
    this.state.update((s) => ({ ...s, user: null }));
  }
}
