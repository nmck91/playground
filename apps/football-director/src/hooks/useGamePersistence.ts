/**
 * Football Director - useGamePersistence Hook
 * Handles game save/load operations with debounced auto-save
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '@playground/football-director-engine';
import { SaveService } from '../services/SaveService';

/**
 * Hook for managing game persistence (save/load operations)
 *
 * @param gameState - Current game state
 * @param setGameState - Function to update game state
 * @param setError - Function to set error message
 * @returns Persistence-related actions
 *
 * @example
 * ```typescript
 * const persistence = useGamePersistence(gameState, setGameState, setError);
 *
 * // Create new game
 * await persistence.newGame('My Save');
 *
 * // Load from specific slot
 * await persistence.loadSlot(1);
 *
 * // Delete current save
 * await persistence.deleteSave();
 * ```
 */
export function useGamePersistence(
  gameState: GameState | null,
  setGameState: (state: GameState | null) => void,
  setError: (error: string | null) => void
) {
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load game on mount
  useEffect(() => {
    (async () => {
      try {
        const savedGame = await SaveService.loadGame();
        if (savedGame) {
          setGameState(savedGame);
        }
      } catch (err) {
        setError('Failed to load saved game');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [setGameState, setError]);

  // ENHANCED: Debounced auto-save when game state changes
  // Saves 2 seconds after last change instead of on every change
  useEffect(() => {
    if (gameState && !loading) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout to save after 2 seconds of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await SaveService.saveGame(gameState);
        } catch (err) {
          console.error('Failed to auto-save:', err);
          // Don't show error to user for auto-save failures
          // Manual saves will show errors
        }
      }, 2000); // 2 second debounce

      // Cleanup timeout on unmount
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }
  }, [gameState, loading]);

  /**
   * Create a new game
   */
  const newGame = useCallback(
    async (saveName?: string) => {
      try {
        const { gameState: newGameState } = await SaveService.createNewSave(saveName);
        setGameState(newGameState);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create new game');
        console.error(err);
      }
    },
    [setGameState, setError]
  );

  /**
   * Load game from specific slot
   */
  const loadSlot = useCallback(
    async (slotId: number) => {
      try {
        const loadedState = await SaveService.loadFromSlot(slotId);
        if (loadedState) {
          await SaveService.setActiveSlot(slotId);
          setGameState(loadedState);
          setError(null);
        } else {
          setError('Save slot not found');
        }
      } catch (err) {
        setError('Failed to load save');
        console.error(err);
      }
    },
    [setGameState, setError]
  );

  /**
   * Delete current save and reset
   */
  const deleteSave = useCallback(async () => {
    await SaveService.deleteSave();
    setGameState(null);
    setError(null);
  }, [setGameState, setError]);

  return {
    loading,
    newGame,
    loadSlot,
    deleteSave,
  };
}
