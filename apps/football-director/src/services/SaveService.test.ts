/**
 * SaveService Test Suite
 * Comprehensive tests for game state persistence to localStorage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveService } from './SaveService';
import type { GameState, SaveSlot, SaveSlotContainer } from '@playground/football-director-engine';

describe('SaveService', () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    // Initialize mock localStorage
    mockLocalStorage = {};

    // Mock localStorage methods
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    it('should create unique game IDs for each new game', () => {
      const game1 = SaveService.createNewGame();
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

    it('should save game state to localStorage', () => {
      SaveService.saveToSlot(1, testGameState);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'football-director-saves',
        expect.any(String)
      );
    });

    it('should save with custom save name', () => {
      SaveService.saveToSlot(1, testGameState, 'My Custom Save');

      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      expect(saves[1].metadata.saveName).toBe('My Custom Save');
    });

    it('should save with default save name', () => {
      SaveService.saveToSlot(2, testGameState);

      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      expect(saves[2].metadata.saveName).toBe('Save 2');
    });

    it('should update metadata correctly', () => {
      SaveService.saveToSlot(1, testGameState, 'Test Save');

      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      const slot = saves[1];

      expect(slot.metadata.slotId).toBe(1);
      expect(slot.metadata.teamName).toBe(testGameState.playerTeam.name);
      expect(slot.metadata.season).toBe(2024);
      expect(slot.metadata.week).toBe(1);
      expect(slot.metadata.position).toBeGreaterThan(0);
      expect(slot.metadata.position).toBeLessThanOrEqual(20);
    });

    it('should load game state from localStorage', () => {
      SaveService.saveToSlot(1, testGameState);
      const loadedState = SaveService.loadFromSlot(1);

      expect(loadedState).toBeDefined();
      expect(loadedState?.id).toBe(testGameState.id);
      expect(loadedState?.playerTeam.name).toBe(testGameState.playerTeam.name);
      expect(loadedState?.season.currentWeek).toBe(1);
    });

    it('should return null for empty slot', () => {
      const loadedState = SaveService.loadFromSlot(3);
      expect(loadedState).toBeNull();
    });

    it('should preserve game state through round-trip save/load', () => {
      SaveService.saveToSlot(1, testGameState);
      const loadedState = SaveService.loadFromSlot(1);

      expect(loadedState).toBeDefined();
      expect(loadedState?.playerTeam.name).toBe(testGameState.playerTeam.name);
      expect(loadedState?.aiTeams.length).toBe(testGameState.aiTeams.length);
      expect(loadedState?.season.currentWeek).toBe(testGameState.season.currentWeek);
      expect(loadedState?.leagueTable.length).toBe(testGameState.leagueTable.length);
      expect(loadedState?.fixtures.length).toBe(testGameState.fixtures.length);
    });

    it('should optimize storage by limiting match history', () => {
      // Create game state with excessive match history
      const gameWithHistory = {
        ...testGameState,
        matchHistory: Array(200).fill({ id: 'match', homeScore: 2, awayScore: 1 }),
      };

      SaveService.saveToSlot(1, gameWithHistory);
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);

      // Should limit to MAX_MATCH_HISTORY (76)
      expect(saves[1].gameState.matchHistory.length).toBe(76);
    });

    it('should optimize storage by limiting news feed', () => {
      // Create game state with excessive news
      const gameWithNews = {
        ...testGameState,
        newsFeed: Array(200).fill({ id: 'news', title: 'Test', content: 'Test' }),
      };

      SaveService.saveToSlot(1, gameWithNews);
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);

      // Should limit to MAX_NEWS_FEED (100)
      expect(saves[1].gameState.newsFeed.length).toBe(100);
    });

    it('should optimize storage by limiting transactions', () => {
      // Create game state with excessive transactions
      const gameWithTransactions = {
        ...testGameState,
        finances: {
          ...testGameState.finances,
          transactions: Array(100).fill({ date: new Date(), amount: 1000, type: 'income' }),
        },
      };

      SaveService.saveToSlot(1, gameWithTransactions);
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);

      // Should limit to 50 transactions
      expect(saves[1].gameState.finances.transactions.length).toBe(50);
    });

    it('should remove AI team player history to save space', () => {
      // Add history to AI team players
      testGameState.aiTeams[0].players[0].history = [
        { season: 2023, goals: 10, assists: 5 },
      ];

      SaveService.saveToSlot(1, testGameState);
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);

      // AI team player history should be removed
      expect(saves[1].gameState.aiTeams[0].players[0].history).toEqual([]);
    });

    it('should overwrite existing save in same slot', () => {
      SaveService.saveToSlot(1, testGameState, 'First Save');

      const modifiedState = { ...testGameState, season: { ...testGameState.season, currentWeek: 10 } };
      SaveService.saveToSlot(1, modifiedState, 'Second Save');

      const slot = SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('Second Save');
      expect(slot?.gameState.season.currentWeek).toBe(10);
    });
  });

  describe('getAllSaves and getSlot', () => {
    it('should return empty object when no saves exist', () => {
      const saves = SaveService.getAllSaves();
      expect(saves).toEqual({});
    });

    it('should return all saved slots', () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      SaveService.saveToSlot(1, game1, 'Save 1');
      SaveService.saveToSlot(3, game2, 'Save 3');

      const saves = SaveService.getAllSaves();
      expect(Object.keys(saves).length).toBe(2);
      expect(saves[1]).toBeDefined();
      expect(saves[3]).toBeDefined();
    });

    it('should return null for non-existent slot', () => {
      const slot = SaveService.getSlot(5);
      expect(slot).toBeNull();
    });

    it('should return specific slot', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(2, gameState, 'Test Slot');

      const slot = SaveService.getSlot(2);
      expect(slot).toBeDefined();
      expect(slot?.metadata.slotId).toBe(2);
      expect(slot?.metadata.saveName).toBe('Test Slot');
    });
  });

  describe('deleteSlot', () => {
    it('should delete a save slot', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState);

      expect(SaveService.getSlot(1)).toBeDefined();

      SaveService.deleteSlot(1);

      expect(SaveService.getSlot(1)).toBeNull();
    });

    it('should clear active slot if deleted slot was active', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState);
      SaveService.setActiveSlot(1);

      SaveService.deleteSlot(1);

      expect(SaveService.getActiveSlot()).toBeNull();
    });

    it('should not affect other slots when deleting', () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      SaveService.saveToSlot(1, game1, 'Save 1');
      SaveService.saveToSlot(2, game2, 'Save 2');

      SaveService.deleteSlot(1);

      expect(SaveService.getSlot(1)).toBeNull();
      expect(SaveService.getSlot(2)).toBeDefined();
    });
  });

  describe('renameSlot', () => {
    it('should rename a save slot', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState, 'Original Name');

      SaveService.renameSlot(1, 'New Name');

      const slot = SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('New Name');
    });

    it('should not throw error when renaming non-existent slot', () => {
      expect(() => {
        SaveService.renameSlot(99, 'New Name');
      }).not.toThrow();
    });
  });

  describe('activeSlot management', () => {
    it('should get and set active slot', () => {
      expect(SaveService.getActiveSlot()).toBeNull();

      SaveService.setActiveSlot(3);

      expect(SaveService.getActiveSlot()).toBe(3);
    });

    it('should persist active slot to localStorage', () => {
      SaveService.setActiveSlot(2);

      expect(localStorage.setItem).toHaveBeenCalledWith('football-director-active-slot', '2');
    });

    it('should return null when no active slot set', () => {
      expect(SaveService.getActiveSlot()).toBeNull();
    });
  });

  describe('createNewSave', () => {
    it('should create new save in first available slot', () => {
      const result = SaveService.createNewSave('My New Game');

      expect(result.slotId).toBe(1);
      expect(result.gameState).toBeDefined();

      const slot = SaveService.getSlot(1);
      expect(slot?.metadata.saveName).toBe('My New Game');
    });

    it('should find next available slot when slot 1 is occupied', () => {
      const game1 = SaveService.createNewGame();
      SaveService.saveToSlot(1, game1);

      const result = SaveService.createNewSave();

      expect(result.slotId).toBe(2);
    });

    it('should set new save as active slot', () => {
      SaveService.createNewSave();

      expect(SaveService.getActiveSlot()).toBe(1);
    });

    it('should throw error when all slots are full', () => {
      // Fill all 5 slots
      for (let i = 1; i <= 5; i++) {
        const game = SaveService.createNewGame();
        SaveService.saveToSlot(i, game);
      }

      expect(() => {
        SaveService.createNewSave();
      }).toThrow('All save slots are full');
    });
  });

  describe('exportSave and importSave', () => {
    it('should export save as JSON string', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState, 'Export Test');

      const exported = SaveService.exportSave(1);

      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const parsed = JSON.parse(exported!);
      expect(parsed.metadata).toBeDefined();
      expect(parsed.gameState).toBeDefined();
    });

    it('should return null when exporting non-existent slot', () => {
      const exported = SaveService.exportSave(99);
      expect(exported).toBeNull();
    });

    it('should import save from JSON string', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState, 'Original');

      const exported = SaveService.exportSave(1)!;

      // Delete slot 1 and import to slot 2
      SaveService.deleteSlot(1);
      const importedSlotId = SaveService.importSave(exported, 2);

      expect(importedSlotId).toBe(2);

      const slot = SaveService.getSlot(2);
      expect(slot).toBeDefined();
      expect(slot?.metadata.saveName).toBe('Original');
    });

    it('should auto-assign slot when no target specified', () => {
      const gameState = SaveService.createNewGame();
      SaveService.saveToSlot(1, gameState);
      const exported = SaveService.exportSave(1)!;

      SaveService.deleteSlot(1);

      const importedSlotId = SaveService.importSave(exported);

      expect(importedSlotId).toBe(1); // First available slot
    });

    it('should throw error when importing invalid JSON', () => {
      expect(() => {
        SaveService.importSave('invalid json');
      }).toThrow('Failed to import save');
    });

    it('should throw error when importing to occupied slot', () => {
      const game1 = SaveService.createNewGame();
      const game2 = SaveService.createNewGame();

      SaveService.saveToSlot(1, game1);
      SaveService.saveToSlot(2, game2);

      const exported = SaveService.exportSave(1)!;

      expect(() => {
        SaveService.importSave(exported, 2); // Slot 2 is occupied
      }).toThrow('Target slot is occupied');
    });

    it('should validate save file structure on import', () => {
      const invalidSave = JSON.stringify({ invalid: 'structure' });

      expect(() => {
        SaveService.importSave(invalidSave);
      }).toThrow('Invalid save file format');
    });
  });

  describe('migrateOldSave', () => {
    it('should migrate old save to slot 1', () => {
      const oldGameState = SaveService.createNewGame();

      // Simulate old save format
      mockLocalStorage['football-director-save'] = JSON.stringify(oldGameState);

      SaveService.migrateOldSave();

      const slot = SaveService.getSlot(1);
      expect(slot).toBeDefined();
      expect(slot?.metadata.saveName).toBe('Migrated Save');
      expect(SaveService.getActiveSlot()).toBe(1);
    });

    it('should remove old save after migration', () => {
      const oldGameState = SaveService.createNewGame();
      mockLocalStorage['football-director-save'] = JSON.stringify(oldGameState);

      SaveService.migrateOldSave();

      expect(mockLocalStorage['football-director-save']).toBeUndefined();
    });

    it('should not migrate if new saves already exist', () => {
      const oldGameState = SaveService.createNewGame();
      const newGameState = SaveService.createNewGame();

      mockLocalStorage['football-director-save'] = JSON.stringify(oldGameState);
      SaveService.saveToSlot(1, newGameState);

      SaveService.migrateOldSave();

      // Old save should not overwrite new save
      const slot = SaveService.getSlot(1);
      expect(slot?.gameState.id).toBe(newGameState.id);
    });
  });

  describe('legacy methods (backward compatibility)', () => {
    let testGameState: GameState;

    beforeEach(() => {
      testGameState = SaveService.createNewGame();
    });

    it('saveGame should save to active slot', () => {
      SaveService.setActiveSlot(2);
      SaveService.saveGame(testGameState);

      const slot = SaveService.getSlot(2);
      expect(slot).toBeDefined();
    });

    it('loadGame should load from active slot', () => {
      SaveService.setActiveSlot(1);
      SaveService.saveToSlot(1, testGameState);

      const loaded = SaveService.loadGame();

      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(testGameState.id);
    });

    it('deleteSave should delete active slot', () => {
      SaveService.setActiveSlot(1);
      SaveService.saveToSlot(1, testGameState);

      SaveService.deleteSave();

      expect(SaveService.getSlot(1)).toBeNull();
    });

    it('hasSave should return true when active slot exists', () => {
      SaveService.setActiveSlot(1);
      SaveService.saveToSlot(1, testGameState);

      expect(SaveService.hasSave()).toBe(true);
    });

    it('hasSave should return false when no active slot', () => {
      expect(SaveService.hasSave()).toBe(false);
    });

    it('loadGame should return null when no active slot', () => {
      expect(SaveService.loadGame()).toBeNull();
    });
  });

  describe('storage quota handling', () => {
    it('should handle QuotaExceededError with aggressive optimization', () => {
      const gameState = SaveService.createNewGame();

      // Add large amount of data
      gameState.matchHistory = Array(200).fill({ id: 'match', homeScore: 2, awayScore: 1 });
      gameState.newsFeed = Array(200).fill({ id: 'news', title: 'Test', content: 'Test' });
      gameState.seasonRecords = Array(10).fill({ season: 2024, topScorer: 'Player' });

      // Mock quota exceeded on first attempt, succeed on second
      let attemptCount = 0;
      vi.spyOn(localStorage, 'setItem').mockImplementation((key, value) => {
        attemptCount++;
        if (attemptCount === 1) {
          const error = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw error;
        }
        mockLocalStorage[key] = value;
      });

      // Should not throw, but use aggressive optimization
      expect(() => {
        SaveService.saveToSlot(1, gameState);
      }).not.toThrow();

      // Verify aggressive optimization was applied
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      expect(saves[1].gameState.matchHistory.length).toBe(38); // Last season only
      expect(saves[1].gameState.newsFeed.length).toBe(30);
      expect(saves[1].gameState.seasonRecords.length).toBe(1);
    });

    it('should re-throw non-quota storage errors', () => {
      const gameState = SaveService.createNewGame();

      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Unknown storage error');
      });

      expect(() => {
        SaveService.saveToSlot(1, gameState);
      }).toThrow('Failed to save to slot 1');
    });
  });

  describe('data migration on load', () => {
    it('should add boardStatus to old saves', () => {
      const oldState = SaveService.createNewGame();
      // @ts-expect-error - simulating old save without boardStatus
      delete oldState.boardStatus;

      SaveService.saveToSlot(1, oldState);

      // Manually remove boardStatus from saved data to simulate old format
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      // @ts-expect-error - simulating old save without boardStatus
      delete saves[1].gameState.boardStatus;
      mockLocalStorage['football-director-saves'] = JSON.stringify(saves);

      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.boardStatus).toBeDefined();
      expect(loaded?.boardStatus.objectives.length).toBeGreaterThan(0);
    });

    it('should add player stats and history to old saves', () => {
      const oldState = SaveService.createNewGame();

      SaveService.saveToSlot(1, oldState);

      // Manually remove stats and history to simulate old format
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      saves[1].gameState.playerTeam.players.forEach((player: any) => {
        delete player.stats;
        delete player.history;
      });
      mockLocalStorage['football-director-saves'] = JSON.stringify(saves);

      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.playerTeam.players[0].stats).toBeDefined();
      expect(loaded?.playerTeam.players[0].history).toEqual([]);
    });

    it('should add achievements to old saves', () => {
      const oldState = SaveService.createNewGame();

      SaveService.saveToSlot(1, oldState);

      // Remove achievements
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      // @ts-expect-error - simulating old save
      delete saves[1].gameState.achievements;
      // @ts-expect-error - simulating old save
      delete saves[1].gameState.seasonAwards;
      mockLocalStorage['football-director-saves'] = JSON.stringify(saves);

      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.achievements).toBeDefined();
      expect(loaded?.achievements.length).toBeGreaterThan(0);
      expect(loaded?.seasonAwards).toEqual([]);
    });

    it('should migrate to 52-week season system', () => {
      const oldState = SaveService.createNewGame();

      SaveService.saveToSlot(1, oldState);

      // Simulate old season format
      const saves: SaveSlotContainer = JSON.parse(mockLocalStorage['football-director-saves']);
      const oldSeason: any = {
        year: 2024,
        currentWeek: 10,
        status: 'in-progress',
      };
      saves[1].gameState.season = oldSeason;
      mockLocalStorage['football-director-saves'] = JSON.stringify(saves);

      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.season.totalWeeks).toBe(52);
      expect(loaded?.season.competitiveWeeks).toBe(38);
      expect(loaded?.season.preSeasonWeeks).toBe(7);
      expect(loaded?.season.phase).toBeDefined();
      expect(loaded?.season.transferWindow).toBeDefined();
    });
  });

  describe('date serialization', () => {
    it('should properly serialize and deserialize dates', () => {
      const gameState = SaveService.createNewGame();
      const originalDate = gameState.createdAt;

      SaveService.saveToSlot(1, gameState);
      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.createdAt).toBeInstanceOf(Date);
      expect(loaded?.lastSaved).toBeInstanceOf(Date);
      expect(loaded?.createdAt.getTime()).toBeCloseTo(originalDate.getTime(), -2);
    });

    it('should deserialize transaction dates', () => {
      const gameState = SaveService.createNewGame();
      gameState.finances.transactions.push({
        date: new Date(),
        amount: 1000000,
        type: 'income' as const,
        description: 'Test transaction',
        category: 'transfer' as const,
      });

      SaveService.saveToSlot(1, gameState);
      const loaded = SaveService.loadFromSlot(1);

      expect(loaded?.finances.transactions[0].date).toBeInstanceOf(Date);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage['football-director-saves'] = 'corrupted-json-{invalid}';

      const saves = SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle empty string in localStorage', () => {
      mockLocalStorage['football-director-saves'] = '';

      const saves = SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle whitespace-only string in localStorage', () => {
      mockLocalStorage['football-director-saves'] = '   ';

      const saves = SaveService.getAllSaves();

      expect(saves).toEqual({});
    });

    it('should handle localStorage.getItem returning null', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(null);

      const saves = SaveService.getAllSaves();

      expect(saves).toEqual({});
    });
  });
});
