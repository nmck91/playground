/**
 * Football Director - useGamePersistence Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamePersistence } from './useGamePersistence';
import { SaveService } from '../services/SaveService';
import type { GameState } from '@playground/football-director-engine';

// Mock SaveService
vi.mock('../services/SaveService', () => ({
  SaveService: {
    loadGame: vi.fn(),
    saveGame: vi.fn(),
    createNewSave: vi.fn(),
    loadFromSlot: vi.fn(),
    setActiveSlot: vi.fn(),
    deleteSave: vi.fn(),
  },
}));

describe('useGamePersistence', () => {
  let mockGameState: GameState | null;
  let mockSetGameState: ReturnType<typeof vi.fn>;
  let mockSetError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGameState = null;
    mockSetGameState = vi.fn();
    mockSetError = vi.fn();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should load saved game on mount', () => {
      const savedGame = { id: 'test-game' } as GameState;
      vi.mocked(SaveService.loadGame).mockReturnValue(savedGame);

      renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      expect(SaveService.loadGame).toHaveBeenCalled();
      expect(mockSetGameState).toHaveBeenCalledWith(savedGame);
    });

    it('should handle no saved game gracefully', () => {
      vi.mocked(SaveService.loadGame).mockReturnValue(null);

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      expect(SaveService.loadGame).toHaveBeenCalled();
      expect(mockSetGameState).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('should handle load errors', () => {
      vi.mocked(SaveService.loadGame).mockImplementation(() => {
        throw new Error('Load failed');
      });

      renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      expect(mockSetError).toHaveBeenCalledWith('Failed to load saved game');
    });
  });

  describe('auto-save', () => {
    it('should auto-save when game state changes', () => {
      const gameState = { id: 'test-game' } as GameState;

      const { rerender } = renderHook(
        ({ state }) => useGamePersistence(state, mockSetGameState, mockSetError),
        { initialProps: { state: null } }
      );

      // Initial render - no auto-save yet (loading=true)
      expect(SaveService.saveGame).not.toHaveBeenCalled();

      // Wait for loading to complete
      rerender({ state: gameState });

      // Should auto-save after loading completes
      expect(SaveService.saveGame).toHaveBeenCalledWith(gameState);
    });

    it('should not auto-save while loading', () => {
      vi.mocked(SaveService.loadGame).mockReturnValue(null);

      renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      expect(SaveService.saveGame).not.toHaveBeenCalled();
    });

    it('should handle auto-save errors silently', () => {
      const gameState = { id: 'test-game' } as GameState;
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(SaveService.saveGame).mockImplementation(() => {
        throw new Error('Save failed');
      });

      const { rerender } = renderHook(
        ({ state }) => useGamePersistence(state, mockSetGameState, mockSetError),
        { initialProps: { state: null } }
      );

      rerender({ state: gameState });

      expect(consoleErrorSpy).toHaveBeenCalled();
      // Should not set user-facing error for auto-save failures
      expect(mockSetError).not.toHaveBeenCalledWith('Failed to auto-save');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('newGame', () => {
    it('should create new game with save name', () => {
      const newGameState = { id: 'new-game' } as GameState;
      vi.mocked(SaveService.createNewSave).mockReturnValue({
        gameState: newGameState,
        slotId: 1,
      });

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.newGame('My Save');
      });

      expect(SaveService.createNewSave).toHaveBeenCalledWith('My Save');
      expect(mockSetGameState).toHaveBeenCalledWith(newGameState);
      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('should create new game without save name', () => {
      const newGameState = { id: 'new-game' } as GameState;
      vi.mocked(SaveService.createNewSave).mockReturnValue({
        gameState: newGameState,
        slotId: 1,
      });

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.newGame();
      });

      expect(SaveService.createNewSave).toHaveBeenCalledWith(undefined);
      expect(mockSetGameState).toHaveBeenCalledWith(newGameState);
    });

    it('should handle new game creation errors', () => {
      vi.mocked(SaveService.createNewSave).mockImplementation(() => {
        throw new Error('Creation failed');
      });

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.newGame('My Save');
      });

      expect(mockSetError).toHaveBeenCalledWith('Creation failed');
    });
  });

  describe('loadSlot', () => {
    it('should load game from specific slot', () => {
      const loadedState = { id: 'loaded-game' } as GameState;
      vi.mocked(SaveService.loadFromSlot).mockReturnValue(loadedState);

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.loadSlot(2);
      });

      expect(SaveService.loadFromSlot).toHaveBeenCalledWith(2);
      expect(SaveService.setActiveSlot).toHaveBeenCalledWith(2);
      expect(mockSetGameState).toHaveBeenCalledWith(loadedState);
      expect(mockSetError).toHaveBeenCalledWith(null);
    });

    it('should handle empty slot', () => {
      vi.mocked(SaveService.loadFromSlot).mockReturnValue(null);

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.loadSlot(3);
      });

      expect(mockSetError).toHaveBeenCalledWith('Save slot not found');
      expect(mockSetGameState).not.toHaveBeenCalled();
    });

    it('should handle load slot errors', () => {
      vi.mocked(SaveService.loadFromSlot).mockImplementation(() => {
        throw new Error('Load failed');
      });

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.loadSlot(1);
      });

      expect(mockSetError).toHaveBeenCalledWith('Failed to load save');
    });
  });

  describe('deleteSave', () => {
    it('should delete current save and reset state', () => {
      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      act(() => {
        result.current.deleteSave();
      });

      expect(SaveService.deleteSave).toHaveBeenCalled();
      expect(mockSetGameState).toHaveBeenCalledWith(null);
      expect(mockSetError).toHaveBeenCalledWith(null);
    });
  });

  describe('loading state', () => {
    it('should start with loading=true', () => {
      vi.mocked(SaveService.loadGame).mockReturnValue(null);

      const { result } = renderHook(() =>
        useGamePersistence(mockGameState, mockSetGameState, mockSetError)
      );

      // After mount effect completes, loading should be false
      expect(result.current.loading).toBe(false);
    });
  });
});
