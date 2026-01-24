import { Injectable, computed, signal } from '@angular/core';

export type FilterMode = 'AND' | 'OR';
export type SortBy = 'created_at' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface UiStateModel {
  searchQuery: string;
  selectedTagIds: string[];
  filterMode: FilterMode;
  sortBy: SortBy;
  sortDirection: SortDirection;
  isOnline: boolean;
}

const initialState: UiStateModel = {
  searchQuery: '',
  selectedTagIds: [],
  filterMode: 'OR',
  sortBy: 'created_at',
  sortDirection: 'desc',
  isOnline: true,
};

@Injectable({ providedIn: 'root' })
export class UiState {
  private state = signal<UiStateModel>(initialState);

  // Selectors
  readonly searchQuery = computed(() => this.state().searchQuery);
  readonly selectedTagIds = computed(() => this.state().selectedTagIds);
  readonly filterMode = computed(() => this.state().filterMode);
  readonly sortBy = computed(() => this.state().sortBy);
  readonly sortDirection = computed(() => this.state().sortDirection);
  readonly isOnline = computed(() => this.state().isOnline);

  // Derived selectors
  readonly hasActiveFilters = computed(
    () =>
      this.state().searchQuery.length > 0 ||
      this.state().selectedTagIds.length > 0
  );

  // Actions
  setSearchQuery(query: string): void {
    this.state.update((s) => ({ ...s, searchQuery: query }));
  }

  toggleTag(tagId: string): void {
    this.state.update((s) => ({
      ...s,
      selectedTagIds: s.selectedTagIds.includes(tagId)
        ? s.selectedTagIds.filter((id) => id !== tagId)
        : [...s.selectedTagIds, tagId],
    }));
  }

  setFilterMode(mode: FilterMode): void {
    this.state.update((s) => ({ ...s, filterMode: mode }));
  }

  setSortBy(sortBy: SortBy): void {
    this.state.update((s) => ({ ...s, sortBy }));
  }

  setSortDirection(sortDirection: SortDirection): void {
    this.state.update((s) => ({ ...s, sortDirection }));
  }

  setOnline(isOnline: boolean): void {
    this.state.update((s) => ({ ...s, isOnline }));
  }

  clearFilters(): void {
    this.state.update((s) => ({
      ...s,
      searchQuery: '',
      selectedTagIds: [],
    }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}
