import { Injectable } from '@angular/core';

/**
 * Storage keys used by the game
 */
export const STORAGE_KEYS = {
  PLAYERS: 'math-quest-players',
  ACTIVE_PLAYER: 'math-quest-active-player',
  LOCATION_PROGRESS: 'math-quest-location-progress',
  SETTINGS: 'math-quest-settings',
} as const;

/**
 * Abstract storage service for game data persistence
 * Implementations can use LocalStorage, Supabase, etc.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /**
   * Get an item from storage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Set an item in storage
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  }

  /**
   * Remove an item from storage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
    }
  }

  /**
   * Clear all game-related storage
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      this.remove(key);
    });
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
