/**
 * Football Director - useGameActions Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameActions } from './useGameActions';
import type { GameState, Player, TransferListing, Staff } from '@playground/football-director-engine';

describe('useGameActions', () => {
  let mockGameState: GameState;
  let mockSetGameState: ReturnType<typeof vi.fn>;
  let mockSetError: ReturnType<typeof vi.fn>;
  let mockSetPendingAchievements: ReturnType<typeof vi.fn>;
  let mockSetYouthProspects: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGameState = {
      playerTeam: {
        id: 'player-team',
        name: 'Player FC',
        budget: 1000000,
        players: [],
        staff: [],
      },
      aiTeams: [
        {
          id: 'ai-team-1',
          name: 'AI Team 1',
          budget: 500000,
          players: [
            {
              id: 'player-1',
              name: 'Test Player',
              position: 'FWD',
              skill: 15,
            } as Player,
          ],
        },
      ],
      transferMarket: [],
      season: {
        currentWeek: 10,
        year: 2024,
      },
      finances: {
        budget: 1000000,
        transactions: [],
        totalExpenses: 0,
        totalIncome: 0,
      },
      newsFeed: [
        { id: '1', headline: 'News 1', read: false },
        { id: '2', headline: 'News 2', read: false },
      ],
    } as unknown as GameState;

    mockSetGameState = vi.fn();
    mockSetError = vi.fn();
    mockSetPendingAchievements = vi.fn();
    mockSetYouthProspects = vi.fn();
    vi.clearAllMocks();
  });

  describe('buyPlayer', () => {
    it('should do nothing if no game state', () => {
      const { result } = renderHook(() =>
        useGameActions(
          null,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      const listing: TransferListing = {
        id: 'listing-1',
        player: { id: 'player-1', name: 'Test Player' } as Player,
        sellingTeamId: 'ai-team-1',
        sellingTeamName: 'AI Team 1',
        askingPrice: 100000,
      } as TransferListing;

      act(() => {
        result.current.buyPlayer(listing);
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should set error if seller team not found', () => {
      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      const listing: TransferListing = {
        id: 'listing-1',
        player: { id: 'player-1' } as Player,
        sellingTeamId: 'non-existent',
        sellingTeamName: 'Non Existent',
        askingPrice: 100000,
      } as TransferListing;

      act(() => {
        result.current.buyPlayer(listing);
      });

      expect(mockSetError).toHaveBeenCalledWith('Seller team not found');
      expect(mockSetGameState).not.toHaveBeenCalled();
    });
  });

  describe('markAllNewsRead', () => {
    it('should mark all news as read', () => {
      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.markAllNewsRead();
      });

      expect(mockSetGameState).toHaveBeenCalledWith(
        expect.objectContaining({
          newsFeed: expect.arrayContaining([
            expect.objectContaining({ id: '1', read: true }),
            expect.objectContaining({ id: '2', read: true }),
          ]),
        })
      );
    });

    it('should do nothing if no game state', () => {
      const { result } = renderHook(() =>
        useGameActions(
          null,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.markAllNewsRead();
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });
  });

  describe('dismissAchievement', () => {
    it('should remove achievement from pending list', () => {
      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.dismissAchievement('achievement-1');
      });

      expect(mockSetPendingAchievements).toHaveBeenCalledWith(expect.any(Function));

      // Test the updater function
      const updaterFn = mockSetPendingAchievements.mock.calls[0][0];
      const previousAchievements = [
        { id: 'achievement-1', name: 'Test 1' },
        { id: 'achievement-2', name: 'Test 2' },
      ];

      const result_achievements = updaterFn(previousAchievements);

      expect(result_achievements).toEqual([{ id: 'achievement-2', name: 'Test 2' }]);
    });
  });

  describe('setTeamTactics', () => {
    it('should update team tactics', () => {
      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.setTeamTactics('4-3-3', 'attacking');
      });

      expect(mockSetGameState).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('should do nothing if no game state', () => {
      const { result } = renderHook(() =>
        useGameActions(
          null,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.setTeamTactics('4-3-3', 'attacking');
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });
  });

  describe('setClubPhilosophy', () => {
    it('should update club philosophy', () => {
      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.setClubPhilosophy('attacking');
      });

      expect(mockSetGameState).toHaveBeenCalledWith(
        expect.objectContaining({
          playerTeam: expect.objectContaining({
            philosophy: 'attacking',
          }),
        })
      );
      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('should do nothing if no game state', () => {
      const { result } = renderHook(() =>
        useGameActions(
          null,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.setClubPhilosophy('attacking');
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });
  });

  describe('continueToNextSeason', () => {
    it('should do nothing if season not completed', () => {
      mockGameState.season.status = 'in-progress';

      const { result } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.continueToNextSeason();
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should do nothing if no game state', () => {
      const { result } = renderHook(() =>
        useGameActions(
          null,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      act(() => {
        result.current.continueToNextSeason();
      });

      expect(mockSetGameState).not.toHaveBeenCalled();
    });
  });

  describe('action stability', () => {
    it('should return stable action references', () => {
      const { result, rerender } = renderHook(() =>
        useGameActions(
          mockGameState,
          mockSetGameState,
          mockSetError,
          mockSetPendingAchievements,
          mockSetYouthProspects
        )
      );

      const firstRender = result.current;
      rerender();
      const secondRender = result.current;

      // All actions should be the same reference (memoized with useCallback)
      expect(firstRender.buyPlayer).toBe(secondRender.buyPlayer);
      expect(firstRender.sellPlayer).toBe(secondRender.sellPlayer);
      expect(firstRender.hireStaff).toBe(secondRender.hireStaff);
      expect(firstRender.markAllNewsRead).toBe(secondRender.markAllNewsRead);
      expect(firstRender.dismissAchievement).toBe(secondRender.dismissAchievement);
    });
  });
});
