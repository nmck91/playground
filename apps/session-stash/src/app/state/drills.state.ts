import { Injectable, computed, signal } from '@angular/core';
import { Drill } from '../models/drill.model';

export interface DrillsStateModel {
  drills: Drill[];
  selectedDrillId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DrillsStateModel = {
  drills: [],
  selectedDrillId: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class DrillsState {
  private state = signal<DrillsStateModel>(initialState);

  // Selectors
  readonly drills = computed(() => this.state().drills);
  readonly selectedDrillId = computed(() => this.state().selectedDrillId);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Derived selectors
  readonly selectedDrill = computed(
    () =>
      this.state().drills.find(
        (d) => d.id === this.state().selectedDrillId
      ) ?? null
  );

  readonly drillCount = computed(() => this.state().drills.length);

  // Actions
  setLoading(loading: boolean): void {
    this.state.update((s) => ({ ...s, loading, error: null }));
  }

  setError(error: string): void {
    this.state.update((s) => ({ ...s, error, loading: false }));
  }

  setDrills(drills: Drill[]): void {
    this.state.update((s) => ({ ...s, drills, loading: false, error: null }));
  }

  addDrill(drill: Drill): void {
    this.state.update((s) => ({
      ...s,
      drills: [drill, ...s.drills],
    }));
  }

  updateDrill(updated: Drill): void {
    this.state.update((s) => ({
      ...s,
      drills: s.drills.map((d) => (d.id === updated.id ? updated : d)),
    }));
  }

  removeDrill(id: string): void {
    this.state.update((s) => ({
      ...s,
      drills: s.drills.filter((d) => d.id !== id),
      selectedDrillId: s.selectedDrillId === id ? null : s.selectedDrillId,
    }));
  }

  selectDrill(id: string | null): void {
    this.state.update((s) => ({ ...s, selectedDrillId: id }));
  }

  reset(): void {
    this.state.set(initialState);
  }
}
