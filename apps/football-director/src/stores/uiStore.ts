/**
 * Football Director - UI Store
 * UI state management (modals, notifications, loading indicators)
 *
 * This store is independent and holds all UI-only state.
 * Other stores can write notifications/achievements here.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Achievement } from '@playground/football-director-engine';

/**
 * Notification Type
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // milliseconds, undefined = permanent
  timestamp: Date;
}

/**
 * Modal State Type
 */
export type ModalType =
  | 'playerStats'
  | 'transferMarket'
  | 'tactics'
  | 'contractNegotiation'
  | 'youthAcademy'
  | 'staffHiring'
  | 'matchReport'
  | 'seasonEvaluation'
  | 'achievements';

/**
 * UI Store State Interface
 */
interface UIStoreState {
  // Modal states
  openModals: Set<ModalType>;
  modalData: Record<string, unknown>;

  // Notifications
  notifications: Notification[];

  // Achievements
  pendingAchievements: Achievement[];

  // Loading states
  isSimulating: boolean;
  isSaving: boolean;
  isLoading: boolean;

  // News
  unreadNewsCount: number;
}

/**
 * UI Store Actions Interface
 */
interface UIStoreActions {
  // Modal actions
  openModal: (modal: ModalType, data?: unknown) => void;
  closeModal: (modal: ModalType) => void;
  closeAllModals: () => void;
  isModalOpen: (modal: ModalType) => boolean;
  getModalData: <T = unknown>(modal: ModalType) => T | undefined;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Achievement actions
  addAchievement: (achievement: Achievement) => void;
  dismissAchievement: (id: string) => void;
  clearAllAchievements: () => void;

  // Loading state actions
  setSimulating: (value: boolean) => void;
  setSaving: (value: boolean) => void;
  setLoading: (value: boolean) => void;

  // News actions
  setUnreadNewsCount: (count: number) => void;
  markNewsRead: () => void;
  incrementUnreadNews: () => void;

  // Reset
  resetUI: () => void;
}

/**
 * Combined UI Store Type
 */
export type UIStore = UIStoreState & UIStoreActions;

/**
 * Initial state
 */
const initialState: UIStoreState = {
  openModals: new Set(),
  modalData: {},
  notifications: [],
  pendingAchievements: [],
  isSimulating: false,
  isSaving: false,
  isLoading: false,
  unreadNewsCount: 0,
};

/**
 * Generate unique notification ID
 */
let notificationIdCounter = 0;
const generateNotificationId = () => `notification-${Date.now()}-${notificationIdCounter++}`;

/**
 * UI Store
 *
 * Manages all UI-only state (modals, notifications, loading indicators).
 * Independent of game logic - other stores can write here but don't read from it.
 *
 * @example
 * ```typescript
 * // Open modal
 * const openModal = useUIStore(state => state.openModal);
 * openModal('playerStats', { playerId: '123' });
 *
 * // Add notification
 * const addNotification = useUIStore(state => state.addNotification);
 * addNotification({
 *   type: 'success',
 *   message: 'Player signed successfully!',
 *   duration: 3000
 * });
 *
 * // Check if simulating
 * const isSimulating = useUIStore(state => state.isSimulating);
 * ```
 */
export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Modal actions
      openModal: (modal, data) =>
        set(
          (state) => ({
            openModals: new Set(state.openModals).add(modal),
            modalData: data !== undefined ? { ...state.modalData, [modal]: data } : state.modalData,
          }),
          false,
          'uiStore/openModal'
        ),

      closeModal: (modal) =>
        set(
          (state) => {
            const newOpenModals = new Set(state.openModals);
            newOpenModals.delete(modal);
            const newModalData = { ...state.modalData };
            delete newModalData[modal];
            return {
              openModals: newOpenModals,
              modalData: newModalData,
            };
          },
          false,
          'uiStore/closeModal'
        ),

      closeAllModals: () =>
        set(
          { openModals: new Set(), modalData: {} },
          false,
          'uiStore/closeAllModals'
        ),

      isModalOpen: (modal) => get().openModals.has(modal),

      getModalData: <T = unknown>(modal: ModalType) => get().modalData[modal] as T | undefined,

      // Notification actions
      addNotification: (notification) =>
        set(
          (state) => ({
            notifications: [
              ...state.notifications,
              {
                ...notification,
                id: generateNotificationId(),
                timestamp: new Date(),
              },
            ],
          }),
          false,
          'uiStore/addNotification'
        ),

      dismissNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'uiStore/dismissNotification'
        ),

      clearAllNotifications: () =>
        set(
          { notifications: [] },
          false,
          'uiStore/clearAllNotifications'
        ),

      // Achievement actions
      addAchievement: (achievement) =>
        set(
          (state) => ({
            pendingAchievements: [...state.pendingAchievements, achievement],
          }),
          false,
          'uiStore/addAchievement'
        ),

      dismissAchievement: (id) =>
        set(
          (state) => ({
            pendingAchievements: state.pendingAchievements.filter((a) => a.id !== id),
          }),
          false,
          'uiStore/dismissAchievement'
        ),

      clearAllAchievements: () =>
        set(
          { pendingAchievements: [] },
          false,
          'uiStore/clearAllAchievements'
        ),

      // Loading state actions
      setSimulating: (value) =>
        set(
          { isSimulating: value },
          false,
          'uiStore/setSimulating'
        ),

      setSaving: (value) =>
        set(
          { isSaving: value },
          false,
          'uiStore/setSaving'
        ),

      setLoading: (value) =>
        set(
          { isLoading: value },
          false,
          'uiStore/setLoading'
        ),

      // News actions
      setUnreadNewsCount: (count) =>
        set(
          { unreadNewsCount: count },
          false,
          'uiStore/setUnreadNewsCount'
        ),

      markNewsRead: () =>
        set(
          { unreadNewsCount: 0 },
          false,
          'uiStore/markNewsRead'
        ),

      incrementUnreadNews: () =>
        set(
          (state) => ({ unreadNewsCount: state.unreadNewsCount + 1 }),
          false,
          'uiStore/incrementUnreadNews'
        ),

      // Reset
      resetUI: () =>
        set(
          initialState,
          false,
          'uiStore/resetUI'
        ),
    }),
    {
      name: 'UIStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * UI Store Selectors
 *
 * Pre-defined selectors for common use cases
 */
export const uiSelectors = {
  // Modal selectors
  isAnyModalOpen: (state: UIStore) => state.openModals.size > 0,
  openModalsList: (state: UIStore) => Array.from(state.openModals),

  // Notification selectors
  activeNotifications: (state: UIStore) => state.notifications,
  notificationCount: (state: UIStore) => state.notifications.length,
  hasNotifications: (state: UIStore) => state.notifications.length > 0,

  // Achievement selectors
  hasPendingAchievements: (state: UIStore) => state.pendingAchievements.length > 0,
  achievementCount: (state: UIStore) => state.pendingAchievements.length,

  // Loading selectors
  isAnyLoading: (state: UIStore) =>
    state.isSimulating || state.isSaving || state.isLoading,

  // News selectors
  hasUnreadNews: (state: UIStore) => state.unreadNewsCount > 0,
};
