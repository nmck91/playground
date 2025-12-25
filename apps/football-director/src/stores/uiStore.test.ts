/**
 * Football Director - UI Store Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore, uiSelectors } from './uiStore';
import type { Achievement } from '@playground/football-director-engine';

const mockAchievement: Achievement = {
  id: 'achievement-1',
  name: 'First Victory',
  description: 'Win your first match',
  icon: '🏆',
  unlockedAt: new Date(),
};

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.getState().resetUI();
  });

  describe('Modal Management', () => {
    it('should open modal', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats', { playerId: '123' });
      });

      expect(result.current.isModalOpen('playerStats')).toBe(true);
      expect(result.current.getModalData('playerStats')).toEqual({ playerId: '123' });
    });

    it('should close modal', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats');
        result.current.closeModal('playerStats');
      });

      expect(result.current.isModalOpen('playerStats')).toBe(false);
    });

    it('should open multiple modals', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats');
        result.current.openModal('transferMarket');
      });

      expect(result.current.isModalOpen('playerStats')).toBe(true);
      expect(result.current.isModalOpen('transferMarket')).toBe(true);
    });

    it('should close all modals', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats');
        result.current.openModal('transferMarket');
        result.current.openModal('tactics');
        result.current.closeAllModals();
      });

      expect(result.current.isModalOpen('playerStats')).toBe(false);
      expect(result.current.isModalOpen('transferMarket')).toBe(false);
      expect(result.current.isModalOpen('tactics')).toBe(false);
    });

    it('should clear modal data when closing', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats', { playerId: '123' });
        result.current.closeModal('playerStats');
      });

      expect(result.current.getModalData('playerStats')).toBeUndefined();
    });
  });

  describe('Notifications', () => {
    it('should add notification', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification',
          duration: 3000,
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].message).toBe('Test notification');
      expect(result.current.notifications[0].type).toBe('success');
    });

    it('should generate unique IDs for notifications', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Notification 1',
        });
        result.current.addNotification({
          type: 'info',
          message: 'Notification 2',
        });
      });

      const ids = result.current.notifications.map((n) => n.id);
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('should dismiss notification', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification',
        });
      });

      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.dismissNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addNotification({ type: 'success', message: '1' });
        result.current.addNotification({ type: 'info', message: '2' });
        result.current.addNotification({ type: 'warning', message: '3' });
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('Achievements', () => {
    it('should add achievement', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addAchievement(mockAchievement);
      });

      expect(result.current.pendingAchievements).toHaveLength(1);
      expect(result.current.pendingAchievements[0]).toEqual(mockAchievement);
    });

    it('should dismiss achievement', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addAchievement(mockAchievement);
        result.current.dismissAchievement(mockAchievement.id);
      });

      expect(result.current.pendingAchievements).toHaveLength(0);
    });

    it('should clear all achievements', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.addAchievement(mockAchievement);
        result.current.addAchievement({ ...mockAchievement, id: 'achievement-2' });
        result.current.clearAllAchievements();
      });

      expect(result.current.pendingAchievements).toHaveLength(0);
    });
  });

  describe('Loading States', () => {
    it('should set simulating state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setSimulating(true);
      });

      expect(result.current.isSimulating).toBe(true);

      act(() => {
        result.current.setSimulating(false);
      });

      expect(result.current.isSimulating).toBe(false);
    });

    it('should set saving state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('News Management', () => {
    it('should set unread news count', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setUnreadNewsCount(5);
      });

      expect(result.current.unreadNewsCount).toBe(5);
    });

    it('should mark news as read', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setUnreadNewsCount(10);
        result.current.markNewsRead();
      });

      expect(result.current.unreadNewsCount).toBe(0);
    });

    it('should increment unread news', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setUnreadNewsCount(3);
        result.current.incrementUnreadNews();
        result.current.incrementUnreadNews();
      });

      expect(result.current.unreadNewsCount).toBe(5);
    });
  });

  describe('Selectors', () => {
    it('should check if any modal is open', () => {
      const { result } = renderHook(() => useUIStore(uiSelectors.isAnyModalOpen));

      expect(result.current).toBe(false);

      act(() => {
        useUIStore.getState().openModal('playerStats');
      });

      expect(result.current).toBe(true);
    });

    it('should check if has notifications', () => {
      const { result } = renderHook(() => useUIStore(uiSelectors.hasNotifications));

      expect(result.current).toBe(false);

      act(() => {
        useUIStore.getState().addNotification({ type: 'info', message: 'Test' });
      });

      expect(result.current).toBe(true);
    });

    it('should check if has pending achievements', () => {
      const { result } = renderHook(() => useUIStore(uiSelectors.hasPendingAchievements));

      expect(result.current).toBe(false);

      act(() => {
        useUIStore.getState().addAchievement(mockAchievement);
      });

      expect(result.current).toBe(true);
    });

    it('should check if any loading', () => {
      const { result } = renderHook(() => useUIStore(uiSelectors.isAnyLoading));

      expect(result.current).toBe(false);

      act(() => {
        useUIStore.getState().setSimulating(true);
      });

      expect(result.current).toBe(true);
    });

    it('should check if has unread news', () => {
      const { result } = renderHook(() => useUIStore(uiSelectors.hasUnreadNews));

      expect(result.current).toBe(false);

      act(() => {
        useUIStore.getState().setUnreadNewsCount(1);
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset UI store', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('playerStats');
        result.current.addNotification({ type: 'success', message: 'Test' });
        result.current.addAchievement(mockAchievement);
        result.current.setSimulating(true);
        result.current.setUnreadNewsCount(5);
        result.current.resetUI();
      });

      expect(result.current.openModals.size).toBe(0);
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.pendingAchievements).toHaveLength(0);
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.unreadNewsCount).toBe(0);
    });
  });
});
