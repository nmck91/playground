/**
 * Football Director - useGamePersistence Hook
 * Handles game save/load operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
 * persistence.newGame('My Save');
 *
 * // Load from specific slot
 * persistence.loadSlot(1);
 *
 * // Delete current save
 * persistence.deleteSave();
 * ```
 */
export function useGamePersistence(
  gameState: GameState | null,
  setGameState: (state: GameState | null) => void,
  setError: (error: string | null) => void
) {
  const [loading, setLoading] = useState(true);

  // Load game on mount
  useEffect(() => {
    try {
      const savedGame = SaveService.loadGame();
      if (savedGame) {
        setGameState(savedGame);
      }
    } catch (err) {
      setError('Failed to load saved game');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setGameState, setError]);

  // Auto-save when game state changes
  useEffect(() => {
    if (gameState && !loading) {
      try {
        SaveService.saveGame(gameState);
      } catch (err) {
        console.error('Failed to auto-save:', err);
      }
    }
  }, [gameState, loading]);

  /**
   * Create a new game
   */
  const newGame = useCallback(
    (saveName?: string) => {
      try {
        const { gameState: newGameState } = SaveService.createNewSave(saveName);
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
    (slotId: number) => {
      try {
        const loadedState = SaveService.loadFromSlot(slotId);
        if (loadedState) {
          SaveService.setActiveSlot(slotId);
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
  const deleteSave = useCallback(() => {
    SaveService.deleteSave();
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
