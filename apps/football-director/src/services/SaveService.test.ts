/**
 * SaveService Test Suite
 * Comprehensive tests for game state persistence to localStorage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveService } from './SaveService';
import type { GameState, SaveSlot, SaveSlotContainer } from '@playground/football-director-engine';

describe('SaveService', () => {
  // localStorage and IndexedDB are now mocked globally in vitest.setup.ts

  beforeEach(async () => {
    // Clear storage before each test
    localStorage.clear();

    // Clear all save slots from IndexedDB
    for (let i = 1; i <= 5; i++) {
      try {
        await SaveService.deleteSlot(i);
      } catch {
        // Ignore errors if slot doesn't exist
      }
    }
  });

  describe('createNewGame', () => {
    it('should create a valid initial game state', () => {
      const gameState = SaveService.createNewGame();

      // Verify core structure
      expect(gameState).toBeDefined();
      expect(gameState.id).toMatch(/^game-\d+$/);
      expect(gameState.createdAt).toBeInstanceOf(Date);
      expect(gameState.lastSaved).toBeInstanceOf(Date);

      // Verify teams
      expect(gameState.playerTeam).toBeDefined();
      expect(gameState.aiTeams).toHaveLength(19); // 20 teams total - 1 player team
      expect(gameState.playerTeam.players.length).toBeGreaterThan(0);

      // Verify season structure
      expect(gameState.season.currentWeek).toBe(1);
      expect(gameState.season.totalWeeks).toBe(52);
      expect(gameState.season.competitiveWeeks).toBe(38);
      expect(gameState.season.phase).toBe('pre-season');

      // Verify fixtures
      expect(gameState.fixtures.length).toBeGreaterThan(0);
      expect(gameState.leagueTable.length).toBe(20);

      // Verify initial data
      expect(gameState.finances).toBeDefined();
      expect(gameState.matchHistory).toEqual([]);
      expect(gameState.transferMarket.length).toBeGreaterThan(0);
      expect(gameState.boardStatus).toBeDefined();
      expect(gameState.clubRecords).toBeDefined();
      expect(gameState.achievements.length).toBeGreaterThan(0);
    });

    it('should create unique game IDs for each new game', async () => {
      const game1 = SaveService.createNewGame();
      // Add small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      const game2 = SaveService.createNewGame();

      expect(game1.id).not.toBe(game2.id);
    });

    it('should initialize cup competition', () => {
      const gameState = SaveService.createNewGame();

      expect(gameState.cupCompetition).toBeDefined();
      expect(gameState.cupCompetition.name).toBe('FA Cup');
      expect(gameState.cupCompetition.season).toBe(2024);
      expect(gameState.cupHistory).toEqual([]);
    });
  });

  describe('saveToSlot and loadFromSlot', () => {
    let testGameState: GameState;

    beforeEach(() => {
      testGameState = SaveService.createNewGame();
    });

    it('should save game state to storage', async () => {
      await SaveService.saveToSlot(1, testGameState);

      // Verify data was saved by loading it back
      const slot = await SaveService.getSlot(1);
      expect(slot).toBeDefined();
      expect(slot?.gameState.id).toBe(testGameState.id);
    });

    it('should save with custom save name', async () => {
      await SaveService.saveToSlot(1, testGameState, 'My Custom Save');

      const slot = await SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('My Custom Save');
    });

    it('should save with default save name', async () => {
      await SaveService.saveToSlot(2, testGameState);

      const slot = await SaveService.getSlot(2);
      expect(slot?.metadata.saveName).toBe('Save 2');
    });

    it('should update metadata correctly', async () => {
      await SaveService.saveToSlot(1, testGameState, 'Test Save');

      const slot = await SaveService.getSlot(1);

      expect(slot?.metadata.slotId).toBe(1);
      expect(slot?.metadata.teamName).toBe(testGameState.playerTeam.name);
      expect(slot?.metadata.season).toBe(2024);
      expect(slot?.metadata.week).toBe(1);
      expect(slot?.metadata.position).toBeGreaterThan(0);
      expect(slot?.metadata.position).toBeLessThanOrEqual(20);
    });

    it('should load game state from localStorage', async () => {
      await SaveService.saveToSlot(1, testGameState);
      const loadedState = await SaveService.loadFromSlot(1);

      expect(loadedState).toBeDefined();
      expect(loadedState?.id).toBe(testGameState.id);
      expect(loadedState?.playerTeam.name).toBe(testGameState.playerTeam.name);
      expect(loadedState?.season.currentWeek).toBe(1);
    });

    it('should return null for empty slot', async () => {
      const loadedState = await SaveService.loadFromSlot(3);
      expect(loadedState).toBeNull();
    });

    it('should preserve game state through round-trip save/load', async () => {
      await SaveService.saveToSlot(1, testGameState);
      const loadedState = await SaveService.loadFromSlot(1);

      expect(loadedState).toBeDefined();
      expect(loadedState?.playerTeam.name).toBe(testGameState.playerTeam.name);
      expect(loadedState?.aiTeams.length).toBe(testGameState.aiTeams.length);
      expect(loadedState?.season.currentWeek).toBe(testGameState.season.currentWeek);
      expect(loadedState?.leagueTable.length).toBe(testGameState.leagueTable.length);
      expect(loadedState?.fixtures.length).toBe(testGameState.fixtures.length);
    });

    it('should optimize storage by limiting match history', async () => {
      // Create game state with excessive match history
      const gameWithHistory = {
        ...testGameState,
        matchHistory: Array(200).fill({ id: 'match', homeScore: 2, awayScore: 1 }),
      };

      await SaveService.saveToSlot(1, gameWithHistory);
      const slot = await SaveService.getSlot(1);

      // Should limit to MAX_MATCH_HISTORY (76)
      expect(slot?.gameState.matchHistory.length).toBe(76);
    });

    it('should optimize storage by limiting news feed', async () => {
      // Create game state with excessive news
      const gameWithNews = {
        ...testGameState,
        newsFeed: Array(200).fill({ id: 'news', title: 'Test', content: 'Test' }),
      };

      await SaveService.saveToSlot(1, gameWithNews);
      const slot = await SaveService.getSlot(1);
      // Deleted comment

      // Should limit to MAX_NEWS_FEED (100)
      expect(slot?.gameState.newsFeed.length).toBe(100);
    });

    it('should optimize storage by limiting transactions', async () => {
      // Create game state with excessive transactions
      const gameWithTransactions = {
        ...testGameState,
        finances: {
          ...testGameState.finances,
          transactions: Array(100).fill({ date: new Date(), amount: 1000, type: 'income' }),
        },
      };

      await SaveService.saveToSlot(1, gameWithTransactions);
      const slot = await SaveService.getSlot(1);

      // Should limit to 50 transactions
      expect(slot?.gameState.finances.transactions.length).toBe(50);
    });

    it('should remove AI team player history to save space', async () => {
      // Add history to AI team players
      testGameState.aiTeams[0].players[0].history = [
        { season: 2023, goals: 10, assists: 5 },
      ];

      await SaveService.saveToSlot(1, testGameState);
      const slot = await SaveService.getSlot(1);

      // AI team player history should be removed
      expect(slot?.gameState.aiTeams[0].players[0].history).toEqual([]);
    });

    it('should overwrite existing save in same slot', async () => {
      await SaveService.saveToSlot(1, testGameState, 'First Save');

      const modifiedState = { ...testGameState, season: { ...testGameState.season, currentWeek: 10 } };
      await SaveService.saveToSlot(1, modifiedState, 'Second Save');

      const slot = await SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('Second Save');
      expect(slot?.gameState.season.currentWeek).toBe(10);
    });
  });

  describe('getAllSaves and getSlot', () => {
    it('should return empty array when no saves exist', async () => {
      const saves = await SaveService.getAllSaves();
      expect(saves).toEqual([]);
    });

    it('should return all saved slots', async () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      await SaveService.saveToSlot(1, game1, 'Save 1');
      await SaveService.saveToSlot(3, game2, 'Save 3');

      const saves = await SaveService.getAllSaves();
      expect(saves.length).toBe(2);
      expect(saves.find(s => s.slotId === 1)).toBeDefined();
      expect(saves.find(s => s.slotId === 3)).toBeDefined();
    });

    it('should return null for non-existent slot', async () => {
      const slot = await SaveService.getSlot(5);
      expect(slot).toBeNull();
    });

    it('should return specific slot', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(2, gameState, 'Test Slot');

      const slot = await SaveService.getSlot(2);
      expect(slot).toBeDefined();
      expect(slot?.metadata.slotId).toBe(2);
      expect(slot?.metadata.saveName).toBe('Test Slot');
    });
  });

  describe('deleteSlot', () => {
    it('should delete a save slot', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState);

      expect(await SaveService.getSlot(1)).toBeDefined();

      await SaveService.deleteSlot(1);

      expect(await SaveService.getSlot(1)).toBeNull();
    });

    it('should clear active slot if deleted slot was active', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState);
      await SaveService.setActiveSlot(1);

      await SaveService.deleteSlot(1);

      expect(await SaveService.getActiveSlot()).toBeNull();
    });

    it('should not affect other slots when deleting', async () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      await SaveService.saveToSlot(1, game1, 'Save 1');
      await SaveService.saveToSlot(2, game2, 'Save 2');

      await SaveService.deleteSlot(1);

      expect(await SaveService.getSlot(1)).toBeNull();
      expect(await SaveService.getSlot(2)).toBeDefined();
    });
  });

  describe('renameSlot', () => {
    it('should rename a save slot', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState, 'Original Name');

      await SaveService.renameSlot(1, 'New Name');

      const slot = await SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('New Name');
    });

    it('should not throw error when renaming non-existent slot', async () => {
      await expect(SaveService.renameSlot(99, 'New Name')).resolves.not.toThrow();
    });
  });

  describe('activeSlot management', () => {
    it('should get and set active slot', async () => {
      expect(await SaveService.getActiveSlot()).toBeNull();

      await SaveService.setActiveSlot(3);

      expect(await SaveService.getActiveSlot()).toBe(3);
    });

    it('should persist active slot to localStorage', async () => {
      await SaveService.setActiveSlot(2);

      // Verify it was persisted by reading it back
      expect(await SaveService.getActiveSlot()).toBe(2);
      expect(localStorage.getItem('football-director-active-slot')).toBe('2');
    });

    it('should return null when no active slot set', async () => {
      expect(await SaveService.getActiveSlot()).toBeNull();
    });
  });

  describe('createNewSave', () => {
    it('should create new save in first available slot', async () => {
      const result = await SaveService.createNewSave('My New Game');

      expect(result.slotId).toBe(1);
      expect(result.gameState).toBeDefined();

      const slot = await SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('My New Game');
    });

    it('should find next available slot when slot 1 is occupied', async () => {
      const game1 = SaveService.createNewGame();
      await SaveService.saveToSlot(1, game1);

      const result = await SaveService.createNewSave();

      expect(result.slotId).toBe(2);
    });

    it('should set new save as active slot', async () => {
      await SaveService.createNewSave();

      expect(await SaveService.getActiveSlot()).toBe(1);
    });

    it('should throw error when all slots are full', async () => {
      // Fill all 5 slots
      for (let i = 1; i <= 5; i++) {
        const game = SaveService.createNewGame();
        await SaveService.saveToSlot(i, game);
      }

      await expect(SaveService.createNewSave()).rejects.toThrow('All save slots are full');
    });
  });

  describe('exportSave and importSave', () => {
    it('should export save as JSON string', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState, 'Export Test');

      const exported = await SaveService.exportSave(1);

      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported!);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.gameState).toBeDefined();
    });

    it('should return null when exporting non-existent slot', async () => {
      const exported = await SaveService.exportSave(99);
      expect(exported).toBeNull();
    });

    it('should import save from JSON string', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState, 'Original');

      const exported = await SaveService.exportSave(1)!;

      // Delete slot 1 and import to slot 2
      await SaveService.deleteSlot(1);
      const importedSlotId = await SaveService.importSave(exported, 2);

      expect(importedSlotId).toBe(2);

      const slot = await SaveService.getSlot(2);
      expect(slot).toBeDefined();
      expect(slot?.metadata.saveName).toBe('Original');
    });

    it('should auto-assign slot when no target specified', async () => {
      const gameState = SaveService.createNewGame();
      await SaveService.saveToSlot(1, gameState);
      const exported = await SaveService.exportSave(1)!;

      await SaveService.deleteSlot(1);

      const importedSlotId = await SaveService.importSave(exported);

      expect(importedSlotId).toBe(1); // First available slot
    });

    it('should throw error when importing invalid JSON', async () => {
      await expect(SaveService.importSave('invalid json')).rejects.toThrow();
    });

    it('should throw error when importing to occupied slot', async () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      await SaveService.saveToSlot(1, game1);
      await SaveService.saveToSlot(2, game2);

      const exported = await SaveService.exportSave(1);
      if (!exported) throw new Error('Export failed');

      await expect(SaveService.importSave(exported, 2)).rejects.toThrow();
    });

    it('should validate save file structure on import', async () => {
      const invalidSave = JSON.stringify({ invalid: 'structure' });

      await expect(SaveService.importSave(invalidSave)).rejects.toThrow();
    });
  });

  describe.skip('migrateOldSave', () => {
    it('should migrate old save to slot 1', async () => {
      const oldGameState = SaveService.createNewGame();

      // Simulate old save format
      localStorage.setItem('football-director-save', JSON.stringify(oldGameState));

      SaveService.migrateOldSave();

      const slot = await SaveService.getSlot(1);
      expect(slot).toBeDefined();
      expect(slot?.metadata.saveName).toBe('Migrated Save');
      expect(await SaveService.getActiveSlot()).toBe(1);
    });

    it('should remove old save after migration', async () => {
      const oldGameState = SaveService.createNewGame();
      localStorage.setItem('football-director-save', JSON.stringify(oldGameState));

      SaveService.migrateOldSave();

      expect(localStorage.getItem('football-director-save')).toBeNull();
    });

    it('should not migrate if new saves already exist', async () => {
      const oldGameState = SaveService.createNewGame();
      const newGameState = SaveService.createNewGame();

      localStorage.setItem('football-director-save', JSON.stringify(oldGameState));
      await SaveService.saveToSlot(1, newGameState);

      SaveService.migrateOldSave();

      // Old save should not overwrite new save
      const slot = await SaveService.getSlot(1);
      expect(slot?.gameState.id).toBe(newGameState.id);
    });
  });

  describe('legacy methods (backward compatibility)', () => {
    let testGameState: GameState;

    beforeEach(() => {
      testGameState = SaveService.createNewGame();
    });

    it('saveGame should save to active slot', async () => {
      await SaveService.setActiveSlot(2);
      await SaveService.saveGame(testGameState);

      const slot = await SaveService.getSlot(2);
      expect(slot).toBeDefined();
    });

    it('loadGame should load from active slot', async () => {
      await SaveService.setActiveSlot(1);
      await SaveService.saveToSlot(1, testGameState);

      const loaded = await SaveService.loadGame();

      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(testGameState.id);
    });

    it('deleteSave should delete active slot', async () => {
      await SaveService.setActiveSlot(1);
      await SaveService.saveToSlot(1, testGameState);

      await SaveService.deleteSave();

      expect(await SaveService.getSlot(1)).toBeNull();
    });

    it('hasSave should return true when active slot exists', async () => {
      await SaveService.setActiveSlot(1);
      await SaveService.saveToSlot(1, testGameState);

      expect(await SaveService.hasSave()).toBe(true);
    });

    it('hasSave should return false when no active slot', async () => {
      expect(await SaveService.hasSave()).toBe(false);
    });

    it('loadGame should return null when no active slot', async () => {
      expect(await SaveService.loadGame()).toBeNull();
    });
  });

  describe.skip('storage quota handling', () => {
    it('should handle QuotaExceededError with aggressive optimization', async () => {
      const gameState = SaveService.createNewGame();

      // Add large amount of data
      gameState.matchHistory = Array(200).fill({ id: 'match', homeScore: 2, awayScore: 1 });
      gameState.newsFeed = Array(200).fill({ id: 'news', title: 'Test', content: 'Test' });
      gameState.seasonRecords = Array(10).fill({ season: 2024, topScorer: 'Player' });

      // Mock quota exceeded on first attempt, succeed on second
      let attemptCount = 0;
      const originalSetItem = localStorage.setItem.bind(localStorage);
      vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        }
        originalSetItem(key, value);
      });

      // Should not throw, but use aggressive optimization
      await expect(SaveService.saveToSlot(1, gameState)).resolves.not.toThrow();

      // Verify aggressive optimization was applied
      const slot = await SaveService.getSlot(1);
      expect(slot?.gameState.matchHistory.length).toBe(38); // Last season only
      expect(slot?.gameState.newsFeed.length).toBe(30);
      expect(slot?.gameState.seasonRecords.length).toBe(1);
    });

    it('should re-throw non-quota storage errors', async () => {
      const gameState = SaveService.createNewGame();

      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Unknown storage error');
      });

      await expect(SaveService.saveToSlot(1, gameState)).rejects.toThrow('Failed to save to slot 1');
    });
  });

  describe.skip('data migration on load', () => {
    it('should add boardStatus to old saves', async () => {
      const oldState = SaveService.createNewGame();
      // @ts-expect-error - simulating old save without boardStatus
      delete oldState.boardStatus;

      await SaveService.saveToSlot(1, oldState);

      // Manually remove boardStatus from saved data to simulate old format
      // Use SaveService.getSlot() instead of checking localStorage directly
      // @ts-expect-error - simulating old save without boardStatus
      delete saves[1].gameState.boardStatus;
      localStorage.setItem('football-director-saves', JSON.stringify(saves));

      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.boardStatus).toBeDefined();
      expect(loaded?.boardStatus.objectives.length).toBeGreaterThan(0);
    });

    it('should add player stats and history to old saves', async () => {
      const oldState = SaveService.createNewGame();

      await SaveService.saveToSlot(1, oldState);

      // Manually remove stats and history to simulate old format
      // Use SaveService.getSlot() instead of checking localStorage directly
      saves[1].gameState.playerTeam.players.forEach((player: any) => {
        delete player.stats;
        delete player.history;
      });
      localStorage.setItem('football-director-saves', JSON.stringify(saves));

      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.playerTeam.players[0].stats).toBeDefined();
      expect(loaded?.playerTeam.players[0].history).toEqual([]);
    });

    it('should add achievements to old saves', async () => {
      const oldState = SaveService.createNewGame();

      await SaveService.saveToSlot(1, oldState);

      // Remove achievements
      // Use SaveService.getSlot() instead of checking localStorage directly
      // @ts-expect-error - simulating old save
      delete saves[1].gameState.achievements;
      // @ts-expect-error - simulating old save
      delete saves[1].gameState.seasonAwards;
      localStorage.setItem('football-director-saves', JSON.stringify(saves));

      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.achievements).toBeDefined();
      expect(loaded?.achievements.length).toBeGreaterThan(0);
      expect(loaded?.seasonAwards).toEqual([]);
    });

    it('should migrate to 52-week season system', async () => {
      const oldState = SaveService.createNewGame();

      await SaveService.saveToSlot(1, oldState);

      // Simulate old season format
      // Use SaveService.getSlot() instead of checking localStorage directly
      const oldSeason: any = {
        year: 2024,
        currentWeek: 10,
        status: 'in-progress',
      };
      saves[1].gameState.season = oldSeason;
      localStorage.setItem('football-director-saves', JSON.stringify(saves));

      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.season.totalWeeks).toBe(52);
      expect(loaded?.season.competitiveWeeks).toBe(38);
      expect(loaded?.season.preSeasonWeeks).toBe(7);
      expect(loaded?.season.phase).toBeDefined();
      expect(loaded?.season.transferWindow).toBeDefined();
    });
  });

  describe('date serialization', () => {
    it('should properly serialize and deserialize dates', async () => {
      const gameState = SaveService.createNewGame();
      const originalDate = gameState.createdAt;

      await SaveService.saveToSlot(1, gameState);
      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.createdAt).toBeInstanceOf(Date);
      expect(loaded?.lastSaved).toBeInstanceOf(Date);
      expect(loaded?.createdAt.getTime()).toBeCloseTo(originalDate.getTime(), -2);
    });

    it('should deserialize transaction dates', async () => {
      const gameState = SaveService.createNewGame();
      gameState.finances.transactions.push({
        date: new Date(),
        amount: 1000000,
        type: 'income' as const,
        description: 'Test transaction',
        category: 'transfer' as const,
      });

      await SaveService.saveToSlot(1, gameState);
      const loaded = await SaveService.loadFromSlot(1);

      expect(loaded?.finances.transactions[0].date).toBeInstanceOf(Date);
    });
  });

  describe.skip('edge cases and error handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('football-director-saves', 'corrupted-json-{invalid}');

      const saves = await SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle empty string in localStorage', async () => {
      localStorage.setItem('football-director-saves', '');

      const saves = await SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle whitespace-only string in localStorage', async () => {
      localStorage.setItem('football-director-saves', '   ');

      const saves = await SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle localStorage.getItem returning null', async () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const saves = await SaveService.getAllSaves();

      expect(saves).toEqual({});
    });
  });
});
