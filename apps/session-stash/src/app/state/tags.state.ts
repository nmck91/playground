import { Injectable, computed, signal } from '@angular/core';
import { SystemTag, UserTag } from '../models/tag.model';

export interface TagsStateModel {
  systemTags: SystemTag[];
  userTags: UserTag[];
  loading: boolean;
  error: string | null;
}

const initialState: TagsStateModel = {
  systemTags: [],
  userTags: [],
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TagsState {
  private state = signal<TagsStateModel>(initialState);

  // Selectors
  readonly systemTags = computed(() => this.state().systemTags);
  readonly userTags = computed(() => this.state().userTags);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Derived selectors
  readonly allTags = computed(() => [
    ...this.state().systemTags.map((t) => ({ ...t, is_system: true })),
    ...this.state().userTags.map((t) => ({ ...t, is_system: false })),
  ]);

  // Actions
  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading, error: null }));
  }

  setError(error: string): void {
    this.state.update((s) => ({ ...s, error, loading: false }));
  }

  setSystemTags(systemTags: SystemTag[]): void {
    this.state.update((s) => ({ ...s, systemTags, loading: false }));
  }

  setUserTags(userTags: UserTag[]): void {
    this.state.update((s) => ({ ...s, userTags, loading: false }));
  }

  addUserTag(tag: UserTag): void {
    this.state.update((s) => ({
      ...s,
      userTags: [...s.userTags, tag],
    }));
  }

  removeUserTag(id: string): void {
    this.state.update((s) => ({
      ...s,
      userTags: s.userTags.filter((t) => t.id !== id),
    }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}
