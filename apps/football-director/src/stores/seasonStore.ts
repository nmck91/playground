/**
 * Football Director - Season Store
 * Season metadata, week advancement validation, and season progression
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import {
  SeasonManager,
  type SeasonPhase,
  type TransferWindowStatus,
  type Fixture,
} from '@playground/football-director-engine';

/**
 * Week Summary Information
 */
export interface WeekSummary {
  week: number;
  year: number;
  phase: SeasonPhase;
  hasMatches: boolean;
  transferWindowOpen: boolean;
  matchCount: number;
  description: string;
}

/**
 * Validation result for week advancement
 */
export interface ValidationResult {
  allowed: boolean;
  reasons: string[];
}

/**
 * Season Store State Interface
 */
interface SeasonStoreState {
  // Season metadata (synced from GameState.season)
  currentWeek: number;
  currentYear: number;
  totalWeeks: number;
  phase: SeasonPhase;
  transferWindow: TransferWindowStatus;
  status: 'in-progress' | 'completed';

  // Week advancement state
  canAdvanceWeek: boolean;
  blockingReasons: string[];

  // Current week context
  hasMatchesThisWeek: boolean;
  isTransferWindowOpen: boolean;
  matchSchedule: Fixture[];

  // Progress tracking
  weeksRemaining: number;
  seasonProgress: number; // 0-100
  competitiveWeeksPlayed: number;
}

/**
 * Season Store Actions Interface
 */
interface SeasonStoreActions {
  // Validation
  validateWeekAdvancement: () => ValidationResult;

  // Information
  getWeekSummary: () => WeekSummary;
  getSeasonPhase: (week: number) => SeasonPhase;
  getTransferWindowStatus: (week: number) => TransferWindowStatus;

  // Standard sync
  syncFromGameState: () => void;
}

/**
 * Combined Season Store Type
 */
export type SeasonStore = SeasonStoreState & SeasonStoreActions;

/**
 * Initial state
 */
const initialState: SeasonStoreState = {
  currentWeek: 1,
  currentYear: 2024,
  totalWeeks: 52,
  phase: 'pre-season',
  transferWindow: 'open',
  status: 'in-progress',
  canAdvanceWeek: true,
  blockingReasons: [],
  hasMatchesThisWeek: false,
  isTransferWindowOpen: true,
  matchSchedule: [],
  weeksRemaining: 52,
  seasonProgress: 0,
  competitiveWeeksPlayed: 0,
};

/**
 * Helper: Convert phase to readable string
 */
function phaseToString(phase: SeasonPhase): string {
  switch (phase) {
    case 'pre-season':
      return 'Pre-Season';
    case 'competitive':
      return 'Competitive Season';
    case 'off-season':
      return 'Off-Season';
    default:
      return 'Unknown Phase';
  }
}

/**
 * Season Store
 *
 * Manages season metadata, week advancement validation, and season progression.
 * Thin wrapper that exposes clean API while leaving orchestration to useWeeklySimulation.
 *
 * @example
 * ```typescript
 * // Check if can advance week
 * const validation = useSeasonStore(state => state.validateWeekAdvancement());
 * if (validation.allowed) {
 *   // Proceed with week advancement
 * }
 *
 * // Get current week info
 * const currentWeek = useSeasonStore(state => state.currentWeek);
 * const weekSummary = useSeasonStore(state => state.getWeekSummary());
 * ```
 */
export const useSeasonStore = create<SeasonStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          set(initialState, false, 'seasonStore/syncFromGameState/noGame');
          return;
        }

        const season = gameState.season;
        if (!season) {
          set(initialState, false, 'seasonStore/syncFromGameState/noSeason');
          return;
        }

        const seasonManager = new SeasonManager();

        // Calculate current week context
        const hasMatches = seasonManager.hasMatchesThisWeek(season.currentWeek);
        const matchSchedule = (gameState.fixtures || []).filter(
          (f: Fixture) => f.week === season.currentWeek && !f.played
        );

        // Calculate weeks remaining and progress
        const weeksRemaining = season.totalWeeks - season.currentWeek;
        const seasonProgress = Math.round((season.currentWeek / season.totalWeeks) * 100);

        // Calculate competitive weeks played (weeks 8-45)
        const competitiveStart = 8;
        const competitiveEnd = 45;
        const competitiveWeeksPlayed = Math.max(
          0,
          Math.min(
            season.currentWeek - competitiveStart + 1,
            competitiveEnd - competitiveStart + 1
          )
        );

        // Determine if can advance week
        const canAdvance = season.status === 'in-progress';
        const blockingReasons: string[] = [];
        if (season.status === 'completed') {
          blockingReasons.push('Season is complete');
        }

        set(
          {
            currentWeek: season.currentWeek,
            currentYear: season.year,
            totalWeeks: season.totalWeeks,
            phase: season.phase,
            transferWindow: season.transferWindow,
            status: season.status,
            hasMatchesThisWeek: hasMatches,
            isTransferWindowOpen: season.transferWindow === 'open',
            matchSchedule,
            canAdvanceWeek: canAdvance,
            blockingReasons,
            weeksRemaining,
            seasonProgress,
            competitiveWeeksPlayed,
          },
          false,
          'seasonStore/syncFromGameState'
        );
      },

      // Validate week advancement
      validateWeekAdvancement: () => {
        const state = get();
        return {
          allowed: state.canAdvanceWeek,
          reasons: state.blockingReasons,
        };
      },

      // Get week summary
      getWeekSummary: () => {
        const state = get();
        return {
          week: state.currentWeek,
          year: state.currentYear,
          phase: state.phase,
          hasMatches: state.hasMatchesThisWeek,
          transferWindowOpen: state.isTransferWindowOpen,
          matchCount: state.matchSchedule.length,
          description: `Week ${state.currentWeek}: ${phaseToString(state.phase)}`,
        };
      },

      // Get season phase for a specific week
      getSeasonPhase: (week: number) => {
        const seasonManager = new SeasonManager();
        return seasonManager.getSeasonPhase(week);
      },

      // Get transfer window status for a specific week
      getTransferWindowStatus: (week: number) => {
        const seasonManager = new SeasonManager();
        return seasonManager.getTransferWindowStatus(week);
      },
    }),
    {
      name: 'SeasonStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Season Store Selectors
 */
export const seasonSelectors = {
  // Basic metadata
  currentWeek: (state: SeasonStore) => state.currentWeek,
  currentYear: (state: SeasonStore) => state.currentYear,
  phase: (state: SeasonStore) => state.phase,
  status: (state: SeasonStore) => state.status,

  // Validation
  canAdvance: (state: SeasonStore) => state.canAdvanceWeek,
  blockingReasons: (state: SeasonStore) => state.blockingReasons,

  // Progress
  progress: (state: SeasonStore) => state.seasonProgress,
  weeksRemaining: (state: SeasonStore) => state.weeksRemaining,
  competitiveWeeksPlayed: (state: SeasonStore) => state.competitiveWeeksPlayed,

  // Week context
  hasMatches: (state: SeasonStore) => state.hasMatchesThisWeek,
  transferWindowOpen: (state: SeasonStore) => state.isTransferWindowOpen,
  matchSchedule: (state: SeasonStore) => state.matchSchedule,
};

/**
 * Auto-sync subscription to GameStore
 * Note: Subscription is now set up in stores/index.ts via setupStoreSubscriptions()
 * to avoid circular dependency issues
 */
