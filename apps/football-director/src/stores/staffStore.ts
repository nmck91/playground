/**
 * Football Director - Staff Store
 * Staff management (coaches, scouts, physios)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useFinanceStore } from './financeStore';
import { useUIStore } from './uiStore';
import type { Staff, StaffRole } from '@playground/football-director-engine';

/**
 * Staff Store State Interface
 */
interface StaffStoreState {
  // Cached staff (derived from gameState.playerTeam.staff)
  currentStaff: Staff[];
}

/**
 * Staff Store Actions Interface
 */
interface StaffStoreActions {
  // Staff operations
  hireStaff: (staff: Staff) => boolean;
  fireStaff: (staffId: string) => void;

  // Calculations
  getStaffByRole: (role: StaffRole) => Staff[];
  totalStaffWages: () => number;
  staffBonus: (type: 'development' | 'morale' | 'recovery') => number;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Staff Store Type
 */
export type StaffStore = StaffStoreState & StaffStoreActions;

/**
 * Initial state
 */
const initialState: StaffStoreState = {
  currentStaff: [],
};

/**
 * Staff Store
 *
 * Manages staff hiring/firing and calculates staff bonuses.
 * Integrates with FinanceStore for wage management.
 *
 * @example
 * ```typescript
 * // Hire staff
 * const hireStaff = useStaffStore(state => state.hireStaff);
 * const success = hireStaff(newCoach);
 *
 * // Get coaches
 * const getStaffByRole = useStaffStore(state => state.getStaffByRole);
 * const coaches = getStaffByRole('coach');
 * ```
 */
export const useStaffStore = create<StaffStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          set(initialState, false, 'staffStore/syncFromGameState/noGame');
          return;
        }

        set(
          { currentStaff: gameState.playerTeam.staff || [] },
          false,
          'staffStore/syncFromGameState'
        );
      },

      // Hire staff
      hireStaff: (staff) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return false;

        // Check if can afford
        const canAfford = useFinanceStore.getState().canAfford(staff.wage * 52); // Annual cost
        if (!canAfford) {
          useUIStore.getState().addNotification({
            type: 'error',
            message: `Cannot afford £${staff.wage}m/week for ${staff.name}`,
            duration: 3000,
          });
          return false;
        }

        // Add staff to team
        const updatedStaff = [...gameState.playerTeam.staff, staff];

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            staff: updatedStaff,
          },
        }));

        // Deduct hiring fee (e.g., first year wages)
        useFinanceStore.getState().updateBudget(-staff.wage * 52, `Hired ${staff.name}`);

        // Sync local state
        set({ currentStaff: updatedStaff }, false, 'staffStore/hireStaff');

        // Notify user
        useUIStore.getState().addNotification({
          type: 'success',
          message: `${staff.name} (${staff.role}) hired!`,
          duration: 3000,
        });

        return true;
      },

      // Fire staff
      fireStaff: (staffId) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const staff = gameState.playerTeam.staff.find((s) => s.id === staffId);
        if (!staff) return;

        // Remove staff from team
        const updatedStaff = gameState.playerTeam.staff.filter((s) => s.id !== staffId);

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            staff: updatedStaff,
          },
        }));

        // Deduct severance pay (e.g., 6 months wages)
        useFinanceStore.getState().updateBudget(
          -staff.wage * 26,
          `Severance for ${staff.name}`
        );

        // Sync local state
        set({ currentStaff: updatedStaff }, false, 'staffStore/fireStaff');

        // Notify user
        useUIStore.getState().addNotification({
          type: 'info',
          message: `${staff.name} has been released`,
          duration: 3000,
        });
      },

      // Get staff by role
      getStaffByRole: (role) => {
        return get().currentStaff.filter((s) => s.role === role);
      },

      // Calculate total staff wages
      totalStaffWages: () => {
        return get().currentStaff.reduce((sum, s) => sum + s.wage, 0);
      },

      // Calculate staff bonus
      staffBonus: (type) => {
        const staff = get().currentStaff;
        let bonus = 0;

        staff.forEach((s) => {
          if (type === 'development' && s.role === 'coach') {
            bonus += s.skill * 0.01; // 1% per skill point
          } else if (type === 'morale' && s.role === 'psychologist') {
            bonus += s.skill * 0.01;
          } else if (type === 'recovery' && s.role === 'physio') {
            bonus += s.skill * 0.01;
          } else if (s.role === 'scout') {
            // Scouts don't give bonuses directly
          }
        });

        return bonus;
      },
    }),
    {
      name: 'StaffStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Staff Store Selectors
 */
export const staffSelectors = {
  // All staff
  allStaff: (state: StaffStore) => state.currentStaff,
  staffCount: (state: StaffStore) => state.currentStaff.length,

  // By role
  coaches: (state: StaffStore) => state.getStaffByRole('coach'),
  scouts: (state: StaffStore) => state.getStaffByRole('scout'),
  physios: (state: StaffStore) => state.getStaffByRole('physio'),
  psychologists: (state: StaffStore) => state.getStaffByRole('psychologist'),

  // Wages
  totalWages: (state: StaffStore) => state.totalStaffWages(),

  // Bonuses
  developmentBonus: (state: StaffStore) => state.staffBonus('development'),
  moraleBonus: (state: StaffStore) => state.staffBonus('morale'),
  recoveryBonus: (state: StaffStore) => state.staffBonus('recovery'),
};

/**
 * Subscribe to GameStore changes to keep staff data in sync
 */
useGameStore.subscribe(
  (state) => state.gameState?.playerTeam.staff,
  () => {
    useStaffStore.getState().syncFromGameState();
  }
);
