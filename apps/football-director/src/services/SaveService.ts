/**
 * Football Director - Save Service
 * Handles game state persistence with hybrid storage (localStorage + IndexedDB)
 *
 * Storage Strategy:
 * - Active slot: localStorage (compressed) for fast access
 * - Inactive slots: IndexedDB (50MB+ capacity)
 * - Compression: LZ-String (50-70% size reduction)
 */

import {
  GameState,
  SaveMetadata,
  SaveSlot,
  globalRegistry,
  ModuleKeys,
  type ITeamGenerator,
  type ILeagueTableManager,
  type ISeasonManager,
  type ITransferMarket,
  type IBoardManager,
  type IRecordsManager,
  type IAchievementManager,
  type INewsEngine,
  type IStaffManager,
  Team,
  Player,
  PlayerContract,
  migrateGameState,
  getDefaultPostMatchAnalysis,
  validateGameState,
  formatValidationErrors,
} from '@playground/football-director-engine';
import { HybridStorageService } from './storage';
import { formatBytes } from './storage/compression';

const OLD_SAVE_KEY = 'football-director-save'; // Legacy single-save key
const SAVES_KEY = 'football-director-saves'; // Legacy multi-slot container (uncompressed)
const ACTIVE_SLOT_KEY = 'football-director-active-slot'; // Active slot ID

export interface SaveSlotContainer {
  [slotId: number]: SaveSlot;
}

// Initialize hybrid storage service
const storage = new HybridStorageService();

export class SaveService {
  /**
   * Create a new game with initial state
   */
  static createNewGame(): GameState {
    const generator = globalRegistry.get<ITeamGenerator>(ModuleKeys.TEAM_GENERATOR);
    const tableManager = globalRegistry.get<ILeagueTableManager>(ModuleKeys.LEAGUE_TABLE_MANAGER);
    const seasonManager = globalRegistry.get<ISeasonManager>(ModuleKeys.SEASON_MANAGER);

    // Generate league (20 teams)
    const allTeams = generator.generateLeague(Date.now());

    // Player team is the first team
    const playerTeam = allTeams[0];
    const aiTeams = allTeams.slice(1);

    // Generate fixtures (competitive + friendlies)
    const competitiveFixtures = seasonManager.generateFixtures(allTeams);
    const friendlyFixtures = seasonManager.generateFriendlyFixtures(allTeams);
    const fixtures = [...friendlyFixtures, ...competitiveFixtures];

    // Initialize league table
    const leagueTable = tableManager.initializeTable(allTeams);

    // Initial finances
    const finances = {
      budget: playerTeam.budget,
      weeklyIncome: 0,
      weeklyExpenses: 0,
      totalIncome: 0,
      totalExpenses: 0,
      transactions: [],
    };

    // Initial season (52 weeks: 7 pre-season + 38 competitive + 7 off-season)
    const season = {
      year: 2024,
      currentWeek: 1,
      totalWeeks: 52,
      competitiveWeeks: 38,
      preSeasonWeeks: 7,
      status: 'in-progress' as const,
      phase: 'pre-season' as const,
      transferWindow: 'open' as const,
    };

    // Generate initial transfer market
    const transferMarket = globalRegistry.get<ITransferMarket>(ModuleKeys.TRANSFER_MARKET);
    const initialMarket = transferMarket.generateMarket(aiTeams, 1, 15);

    // Generate initial staff market
    const staffManager = globalRegistry.get<IStaffManager>(ModuleKeys.STAFF_MANAGER);
    const initialStaffMarket = staffManager.generateStaffMarket(1, 15);

    // Initialize board status with objectives
    const boardManager = globalRegistry.get<IBoardManager>(ModuleKeys.BOARD_MANAGER);
    const boardStatus = boardManager.initializeBoardStatus(playerTeam, season.year);

    // Initialize records
    const recordsManager = globalRegistry.get<IRecordsManager>(ModuleKeys.RECORDS_MANAGER);
    const clubRecords = recordsManager.initializeClubRecords(season.year);

    // Initialize achievements
    const achievementManager = globalRegistry.get<IAchievementManager>(ModuleKeys.ACHIEVEMENT_MANAGER);
    const achievements = achievementManager.getAllAchievements();

    // Initialize news feed with welcome message
    const newsEngine = globalRegistry.get<INewsEngine>(ModuleKeys.NEWS_ENGINE);
    const welcomeNews = newsEngine.generateWelcomeNews(playerTeam.name, season.year);

    // Generate cup competition
    const cupCompetition = CupManager.generateCupCompetition(allTeams, season.year, 'FA Cup');

    const gameState: GameState = {
      version: 2, // Story 1.5.2: GameState versioning
      id: `game-${Date.now()}`,
      createdAt: new Date(),
      lastSaved: new Date(),
      playerTeam,
      aiTeams,
      season,
      fixtures,
      leagueTable,
      finances,
      matchHistory: [],
      transferMarket: initialMarket,
      staffMarket: initialStaffMarket,
      freeAgents: [],
      boardStatus,
      seasonRecords: [],
      clubRecords,
      achievements,
      seasonAwards: [],
      newsFeed: [welcomeNews],
      matchPreviews: [], // Story 1.5.2: Now required field
      cupCompetition,
      cupHistory: [],
    };

    return gameState;
  }

  /**
   * Migrate player wages to contracts
   */
  private static migratePlayerContracts(gameState: GameState): GameState {
    // Skip if already migrated
    if (gameState.playerTeam.players[0]?.contract) {
      return gameState;
    }

    const createContract = (player: Player, currentYear: number): PlayerContract => {
      const years = Math.floor(Math.random() * 3) + 2; // 2-4 years randomly
      return {
        weeklyWage: player.wages,
        startYear: currentYear - 1,
        startWeek: 1,
        expiryYear: currentYear + years,
        expiryWeek: 52,
        yearsRemaining: years,
        weeksRemaining: years * 52,
        status: 'active',
      };
    };

    const currentYear = gameState.season.year;

    return {
      ...gameState,
      playerTeam: {
        ...gameState.playerTeam,
        players: gameState.playerTeam.players.map(p => ({
          ...p,
          contract: createContract(p, currentYear),
        })),
      },
      aiTeams: gameState.aiTeams.map(team => ({
        ...team,
        players: team.players.map(p => ({
          ...p,
          contract: createContract(p, currentYear),
        })),
      })),
      freeAgents: gameState.freeAgents || [],
    };
  }

  /**
   * Get all save metadata (returns empty array if none exist)
   */
  static async getAllSaves(): Promise<SaveMetadata[]> {
    try {
      // Check for migration first
      await this.migrateLegacySaves();

      return await storage.listAll();
    } catch (error) {
      console.error('Failed to load saves:', error);
      return [];
    }
  }

  /**
   * Get a specific save slot
   */
  static async getSlot(slotId: number): Promise<SaveSlot | null> {
    await this.migrateLegacySaves();
    return await storage.load(slotId);
  }

  /**
   * Optimize game state for storage by limiting historical data
   * Enhanced for Phase 1: More aggressive data trimming
   */
  private static optimizeForStorage(gameState: GameState): GameState {
    const MAX_MATCH_HISTORY = 76; // Keep last 2 seasons worth of matches
    const MAX_NEWS_FEED = 100; // Keep last 100 news items

    // ENHANCED: More aggressive AI team optimization
    const optimizeAITeams = (teams: Team[]): Team[] => {
      return teams.map(team => ({
        id: team.id,
        name: team.name,
        budget: team.budget,
        tactics: team.tactics,
        philosophy: team.philosophy,
        players: team.players.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          skill: player.skill,
          age: player.age,
          wages: player.wages,
          contract: player.contract,
          injury: player.injury,
          suspendedUntil: player.suspendedUntil,
          // Keep only essential current season stats for AI players
          stats: {
            appearances: player.stats.appearances,
            goals: player.stats.goals,
            assists: player.stats.assists,
            cleanSheets: player.stats.cleanSheets,
            yellowCards: player.stats.yellowCards,
            redCards: player.stats.redCards,
            // Remove career stats for AI players (can be recalculated if needed)
            careerAppearances: 0,
            careerGoals: 0,
            careerAssists: 0,
            careerCleanSheets: 0,
          },
          history: [], // Always empty for AI teams
          morale: player.morale, // Story 1.5.2: morale is now required, keep the value
        })),
        staff: team.staff.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          skill: s.skill,
          salary: s.salary,
          // Remove specialty, style, happiness for AI staff to save space
          specialty: undefined,
          style: s.role === 'manager' ? s.style : undefined, // Keep manager style only
          happiness: undefined,
        })),
      }));
    };

    // Optimize match history: remove detailed events for older matches
    const optimizeMatchHistory = (matches: GameState['matchHistory']): GameState['matchHistory'] => {
      const KEEP_DETAILED = 38; // Keep last season with full details
      return matches.slice(-MAX_MATCH_HISTORY).map((match, index) => {
        const isRecent = index >= matches.length - KEEP_DETAILED;
        if (isRecent) {
          // Keep full details for recent matches
          return match;
        }
        // For older matches, remove detailed events and player ratings
        return {
          ...match,
          events: [], // Remove detailed events
          playerRatings: [], // Remove player ratings
          // Story 1.5.2: postMatchAnalysis is now required, use minimal default
          postMatchAnalysis: getDefaultPostMatchAnalysis(match.homeTeam, match.awayTeam),
        };
      });
    };

    return {
      ...gameState,
      // Limit and optimize match history
      matchHistory: optimizeMatchHistory(gameState.matchHistory),
      // Limit news feed to prevent bloat
      newsFeed: gameState.newsFeed.slice(-MAX_NEWS_FEED),
      // ENHANCED: Aggressive AI team optimization
      aiTeams: optimizeAITeams(gameState.aiTeams),
      // Limit transactions history (guard against undefined finances)
      finances: gameState.finances ? {
        ...gameState.finances,
        transactions: gameState.finances.transactions?.slice(-50) || [], // Keep last 50 transactions
      } : {
        budget: 5000000,
        weeklyIncome: 0,
        weeklyExpenses: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactions: [],
      },
      // Remove old match previews (regenerate when needed)
      matchPreviews: [],
    };
  }

  /**
   * Save game to specific slot (uses hybrid storage with compression)
   */
  static async saveToSlot(slotId: number, gameState: GameState, saveName?: string): Promise<void> {
    try {
      // Epic 1.5.4: Validate GameState before saving
      const validationResult = validateGameState(gameState);
      if (!validationResult.success) {
        const errors = formatValidationErrors(validationResult.errors);
        console.error('[SaveService] Invalid GameState before save:', errors);
        throw new Error(`Cannot save invalid GameState: ${errors}`);
      }

      // Check for legacy saves and migrate if needed
      await this.migrateLegacySaves();

      const existingSlot = await storage.load(slotId);
      const now = new Date();

      // Get current player position
      const sortedTable = [...gameState.leagueTable].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      const position = sortedTable.findIndex(entry => entry.teamId === gameState.playerTeam.id) + 1;

      const metadata: SaveMetadata = {
        slotId,
        saveName: saveName || existingSlot?.metadata.saveName || `Save ${slotId}`,
        teamName: gameState.playerTeam.name,
        season: gameState.season.year,
        week: gameState.season.currentWeek,
        position,
        lastSaved: now,
        createdAt: existingSlot?.metadata.createdAt || now,
      };

      // Optimize game state before saving to reduce storage size
      const optimizedState = this.optimizeForStorage({
        ...gameState,
        lastSaved: now,
      });

      const slot: SaveSlot = {
        metadata,
        gameState: optimizedState,
      };

      // Save using hybrid storage (automatically handles compression and routing)
      await storage.save(slotId, slot);

      // Log storage info (development only)
      if (process.env.NODE_ENV === 'development') {
        const storageInfo = await storage.getStorageInfo();
        console.log(
          `Saved to slot ${slotId}. Storage: ${formatBytes(storageInfo.used)} / ${formatBytes(storageInfo.quota)} (${storageInfo.percentage.toFixed(1)}%)`
        );
      }
    } catch (error) {
      console.error('Failed to save to slot:', error);
      throw new Error(`Failed to save to slot ${slotId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load game from specific slot (uses hybrid storage with decompression)
   */
  static async loadFromSlot(slotId: number): Promise<GameState | null> {
    // Check for legacy saves and migrate if needed
    await this.migrateLegacySaves();

    const slot = await storage.load(slotId);
    if (!slot) {
      return null;
    }

    // Story 1.5.2: Use new migration system for v1 → v2 migration
    let gameState = migrateGameState(slot.gameState);

    // Post-migration: Legacy migrations for features added before v2 system
    // These handle migrations from old save format to the intermediate v1 format

    // Migration: Add boardStatus if it doesn't exist (for old saves)
    if (!gameState.boardStatus) {
      const boardManager = globalRegistry.get<IBoardManager>(ModuleKeys.BOARD_MANAGER);
      gameState.boardStatus = boardManager.initializeBoardStatus(
        gameState.playerTeam,
        gameState.season.year
      );
    }

    // Migration: Add player stats and history if they don't exist (for old saves)
    const statsTracker = globalRegistry.get<IPlayerStatsTracker>(ModuleKeys.PLAYER_STATS_TRACKER);
    const migrateTeamStats = (team: Team): Team => {
      const migratedPlayers = team.players.map((player) => {
        if (!player.stats || !player.history) {
          return {
            ...player,
            stats: player.stats || statsTracker.initializePlayerStats(),
            history: player.history || [],
          };
        }
        return player;
      });
      return { ...team, players: migratedPlayers };
    };

    gameState.playerTeam = migrateTeamStats(gameState.playerTeam);
    gameState.aiTeams = gameState.aiTeams.map(migrateTeamStats);

    // Migration: Add records if they don't exist (for old saves)
    if (!gameState.seasonRecords) {
      gameState.seasonRecords = [];
    }
    if (!gameState.clubRecords) {
      const recordsManager = globalRegistry.get<IRecordsManager>(ModuleKeys.RECORDS_MANAGER);
      gameState.clubRecords = recordsManager.initializeClubRecords(gameState.season.year);
    }

    // Migration: Add achievements and seasonAwards if they don't exist (for old saves)
    if (!gameState.achievements) {
      const achievementManager = globalRegistry.get<IAchievementManager>(ModuleKeys.ACHIEVEMENT_MANAGER);
      gameState.achievements = achievementManager.getAllAchievements();

      // Retroactively unlock achievements based on current state
      achievementManager.checkAchievements(gameState, gameState.achievements);
      // Don't set as pending since this is migration, just unlock them silently
    }
    if (!gameState.seasonAwards) {
      gameState.seasonAwards = [];
    }

    // Migration: Add newsFeed if it doesn't exist (for old saves)
    if (!gameState.newsFeed) {
      gameState.newsFeed = [];
    }

    // Migration: Add staff to teams if it doesn't exist (for old saves)
    const staffManager = globalRegistry.get<IStaffManager>(ModuleKeys.STAFF_MANAGER);
    const migrateTeamStaff = (team: Team): Team => {
      if (!team.staff) {
        // Generate a basic manager for each team
        const manager = staffManager.generateStaff('manager', Date.now() + parseInt(team.id.slice(-4)));
        return { ...team, staff: [manager] };
      }
      return team;
    };

    gameState.playerTeam = migrateTeamStaff(gameState.playerTeam);
    gameState.aiTeams = gameState.aiTeams.map(migrateTeamStaff);

    // Migration: Add staffMarket if it doesn't exist (for old saves)
    if (!gameState.staffMarket) {
      gameState.staffMarket = staffManager.generateStaffMarket(gameState.season.currentWeek, 15);
    }

    // Migration: Update season to 52-week system (for old saves)
    const seasonManager = globalRegistry.get<ISeasonManager>(ModuleKeys.SEASON_MANAGER);
    if (!gameState.season.competitiveWeeks || !gameState.season.phase || !gameState.season.transferWindow || !gameState.season.preSeasonWeeks) {
      const currentWeek = gameState.season.currentWeek;
      gameState.season = {
        ...gameState.season,
        totalWeeks: 52,
        competitiveWeeks: 38,
        preSeasonWeeks: 7,
        phase: seasonManager.getSeasonPhase(currentWeek),
        transferWindow: seasonManager.getTransferWindowStatus(currentWeek),
      };
    }

    // Migration: Add matchType to existing fixtures (for old saves)
    if (gameState.fixtures.length > 0 && !gameState.fixtures[0].matchType) {
      gameState.fixtures = gameState.fixtures.map(fixture => ({
        ...fixture,
        matchType: (fixture.week >= 4 && fixture.week <= 6) ? 'friendly' as const : 'competitive' as const,
      }));
    }

    // Epic 1.5.4: Validate loaded and migrated GameState
    const validationResult = validateGameState(gameState);
    if (!validationResult.success) {
      const errors = formatValidationErrors(validationResult.errors);
      console.error('[SaveService] Invalid GameState after load/migration:', errors);
      console.error('[SaveService] Corrupted save data detected in slot', slotId);
      throw new Error(`Loaded save data is corrupted or invalid: ${errors}`);
    }

    return gameState;
  }

  /**
   * Delete a specific save slot
   */
  static async deleteSlot(slotId: number): Promise<void> {
    try {
      await storage.delete(slotId);
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  }

  /**
   * Rename a save slot
   */
  static async renameSlot(slotId: number, newName: string): Promise<void> {
    try {
      const slot = await storage.load(slotId);
      if (slot) {
        slot.metadata.saveName = newName;
        await storage.save(slotId, slot);
      }
    } catch (error) {
      console.error('Failed to rename slot:', error);
    }
  }

  /**
   * Get active slot ID
   */
  static getActiveSlot(): number | null {
    return storage.getActiveSlot();
  }

  /**
   * Set active slot ID
   */
  static async setActiveSlot(slotId: number): Promise<void> {
    try {
      await storage.switchActiveSlot(slotId);
    } catch (error) {
      console.error('Failed to set active slot:', error);
    }
  }

  /**
   * Create a new save in the first available slot (1-3)
   */
  static async createNewSave(saveName?: string): Promise<{ slotId: number; gameState: GameState }> {
    const saves = await this.getAllSaves();

    // Find first available slot (1-3)
    let slotId = 1;
    const usedSlots = new Set(saves.map(s => s.slotId));

    for (let i = 1; i <= 3; i++) {
      if (!usedSlots.has(i)) {
        slotId = i;
        break;
      }
    }

    // If all slots are full, throw error
    if (usedSlots.has(slotId) && usedSlots.size >= 3) {
      throw new Error('All save slots are full. Please delete a save first.');
    }

    const gameState = this.createNewGame();
    await this.saveToSlot(slotId, gameState, saveName);
    await this.setActiveSlot(slotId);

    return { slotId, gameState };
  }

  /**
   * Export save to JSON string (compressed)
   */
  static async exportSave(slotId: number): Promise<string | null> {
    const slot = await this.getSlot(slotId);
    if (!slot) {
      return null;
    }
    return JSON.stringify(slot, null, 2);
  }

  /**
   * Import save from JSON string
   */
  static async importSave(jsonString: string, targetSlotId?: number): Promise<number> {
    try {
      const slot: SaveSlot = JSON.parse(jsonString);

      // Validate structure
      if (!slot.metadata || !slot.gameState) {
        throw new Error('Invalid save file format');
      }

      const saves = await this.getAllSaves();
      const usedSlots = new Set(saves.map(s => s.slotId));

      // Find target slot
      let slotId = targetSlotId;
      if (!slotId) {
        // Find first available slot
        for (let i = 1; i <= 3; i++) {
          if (!usedSlots.has(i)) {
            slotId = i;
            break;
          }
        }
      }

      if (!slotId || usedSlots.has(slotId)) {
        throw new Error('Target slot is occupied or no slots available');
      }

      // Update slot ID in metadata
      slot.metadata.slotId = slotId;

      await this.saveToSlot(slotId, slot.gameState, slot.metadata.saveName);
      return slotId;
    } catch (error) {
      console.error('Failed to import save:', error);
      throw new Error('Failed to import save. Invalid format.');
    }
  }

  /**
   * Migrate legacy saves to new hybrid storage system
   * Handles both:
   * 1. Old single-save format (football-director-save)
   * 2. Old multi-slot uncompressed format (football-director-saves)
   */
  private static migrationInProgress = false;
  private static migrationComplete = false;

  static async migrateLegacySaves(): Promise<void> {
    // Prevent concurrent migrations
    if (this.migrationInProgress || this.migrationComplete) {
      return;
    }

    this.migrationInProgress = true;

    try {
      const legacySaves: { [slotId: number]: SaveSlot } = {};

      // Check for old single-save format
      const oldSave = localStorage.getItem(OLD_SAVE_KEY);
      if (oldSave && oldSave.trim() !== '') {
        try {
          const gameState = JSON.parse(oldSave);

          // Convert dates
          gameState.createdAt = new Date(gameState.createdAt);
          gameState.lastSaved = new Date(gameState.lastSaved);
          if (gameState.finances?.transactions) {
            gameState.finances.transactions = gameState.finances.transactions.map(
              (t: { date: string | Date; [key: string]: unknown }) => ({
                ...t,
                date: new Date(t.date),
              })
            );
          }

          // Create slot for old save
          const metadata: SaveMetadata = {
            slotId: 1,
            saveName: 'Migrated Save',
            teamName: gameState.playerTeam?.name || 'Unknown Team',
            season: gameState.season?.year || 2024,
            week: gameState.season?.currentWeek || 1,
            position: 1,
            lastSaved: gameState.lastSaved,
            createdAt: gameState.createdAt,
          };

          legacySaves[1] = {
            metadata,
            gameState: this.migratePlayerContracts(gameState),
          };

          console.log('Found legacy single-save, will migrate to slot 1');
        } catch (error) {
          console.error('Failed to parse old single save:', error);
        }
      }

      // Check for old multi-slot uncompressed format
      const oldMultiSave = localStorage.getItem(SAVES_KEY);
      if (oldMultiSave && oldMultiSave.trim() !== '') {
        try {
          const parsed = JSON.parse(oldMultiSave);

          Object.keys(parsed).forEach((slotId) => {
            const slot = parsed[slotId];
            if (slot && slot.gameState) {
              // Convert dates
              slot.metadata.createdAt = new Date(slot.metadata.createdAt);
              slot.metadata.lastSaved = new Date(slot.metadata.lastSaved);
              slot.gameState.createdAt = new Date(slot.gameState.createdAt);
              slot.gameState.lastSaved = new Date(slot.gameState.lastSaved);
              if (slot.gameState.finances?.transactions) {
                slot.gameState.finances.transactions = slot.gameState.finances.transactions.map(
                  (t: { date: string | Date; [key: string]: unknown }) => ({
                    ...t,
                    date: new Date(t.date),
                  })
                );
              }

              // Apply contract migration
              slot.gameState = this.migratePlayerContracts(slot.gameState);

              legacySaves[parseInt(slotId)] = slot;
            }
          });

          console.log(`Found ${Object.keys(parsed).length} legacy multi-slot saves, will migrate`);
        } catch (error) {
          console.error('Failed to parse old multi-slot saves:', error);
        }
      }

      // Migrate to hybrid storage if we found any legacy saves
      if (Object.keys(legacySaves).length > 0) {
        console.log('Migrating legacy saves to hybrid storage...');
        await storage.migrateFromLegacyStorage(legacySaves);

        // Clean up old storage keys
        localStorage.removeItem(OLD_SAVE_KEY);
        localStorage.removeItem(SAVES_KEY);

        console.log('Legacy save migration complete!');
      }

      this.migrationComplete = true;
    } catch (error) {
      console.error('Failed to migrate legacy saves:', error);
    } finally {
      this.migrationInProgress = false;
    }
  }

  /**
   * Legacy method - save to active slot (backward compatible)
   */
  static async saveGame(state: GameState): Promise<void> {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      await this.saveToSlot(activeSlot, state);
    }
  }

  /**
   * Legacy method - load from active slot (backward compatible)
   */
  static async loadGame(): Promise<GameState | null> {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      return await this.loadFromSlot(activeSlot);
    }
    return null;
  }

  /**
   * Legacy method - delete active slot (backward compatible)
   */
  static async deleteSave(): Promise<void> {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      await this.deleteSlot(activeSlot);
    }
  }

  /**
   * Legacy method - check if active slot exists
   */
  static async hasSave(): Promise<boolean> {
    const activeSlot = this.getActiveSlot();
    if (activeSlot === null) return false;
    const slot = await this.getSlot(activeSlot);
    return slot !== null;
  }

  /**
   * Get storage usage information
   */
  static async getStorageInfo() {
    return await storage.getStorageInfo();
  }
}

// Re-export types from engine for convenience
export type { SaveMetadata } from '@playground/football-director-engine';
