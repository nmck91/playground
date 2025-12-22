/**
 * Football Director - Save Service
 * Handles game state persistence to localStorage with multi-slot support
 */

import {
  GameState,
  SaveMetadata,
  SaveSlot,
  TeamGenerator,
  LeagueTableManager,
  SeasonManager,
  TransferMarket,
  BoardManager,
  PlayerStatsTracker,
  RecordsManager,
  AchievementManager,
  NewsGenerator,
  StaffManager,
  Team,
  Player,
  PlayerContract,
} from '@playground/football-director-engine';

const OLD_SAVE_KEY = 'football-director-save'; // Legacy single-save key
const SAVES_KEY = 'football-director-saves'; // Multi-slot container
const ACTIVE_SLOT_KEY = 'football-director-active-slot'; // Active slot ID

export interface SaveSlotContainer {
  [slotId: number]: SaveSlot;
}

export class SaveService {
  /**
   * Create a new game with initial state
   */
  static createNewGame(): GameState {
    const generator = new TeamGenerator();
    const tableManager = new LeagueTableManager();
    const seasonManager = new SeasonManager();

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
    const transferMarket = new TransferMarket();
    const initialMarket = transferMarket.generateMarket(aiTeams, 1, 15);

    // Generate initial staff market
    const staffManager = new StaffManager();
    const initialStaffMarket = staffManager.generateStaffMarket(1, 15);

    // Initialize board status with objectives
    const boardManager = new BoardManager();
    const boardStatus = boardManager.initializeBoardStatus(playerTeam, season.year);

    // Initialize records
    const recordsManager = new RecordsManager();
    const clubRecords = recordsManager.initializeClubRecords(season.year);

    // Initialize achievements
    const achievementManager = new AchievementManager();
    const achievements = achievementManager.getAllAchievements();

    // Initialize news feed with welcome message
    const newsGenerator = new NewsGenerator();
    const welcomeNews = newsGenerator.generateWelcomeNews(playerTeam.name, season.year);

    const gameState: GameState = {
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
   * Get all save slots (returns empty object if none exist)
   */
  static getAllSaves(): SaveSlotContainer {
    try {
      // Check for migration first
      this.migrateOldSave();

      const serialized = localStorage.getItem(SAVES_KEY);
      if (!serialized || serialized.trim() === '') {
        return {};
      }

      const parsed = JSON.parse(serialized);

      // Convert date strings back to Date objects
      Object.keys(parsed).forEach((slotId) => {
        const slot = parsed[slotId];
        slot.metadata.createdAt = new Date(slot.metadata.createdAt);
        slot.metadata.lastSaved = new Date(slot.metadata.lastSaved);
        slot.gameState.createdAt = new Date(slot.gameState.createdAt);
        slot.gameState.lastSaved = new Date(slot.gameState.lastSaved);
        slot.gameState.finances.transactions = slot.gameState.finances.transactions.map(
          (t: { date: string | Date; [key: string]: unknown }) => ({
            ...t,
            date: new Date(t.date),
          })
        );

        // Apply contract migration
        slot.gameState = this.migratePlayerContracts(slot.gameState);
      });

      return parsed;
    } catch (error) {
      console.error('Failed to load saves:', error);
      return {};
    }
  }

  /**
   * Get a specific save slot
   */
  static getSlot(slotId: number): SaveSlot | null {
    const saves = this.getAllSaves();
    return saves[slotId] || null;
  }

  /**
   * Save game to specific slot
   */
  static saveToSlot(slotId: number, gameState: GameState, saveName?: string): void {
    try {
      const saves = this.getAllSaves();
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
        saveName: saveName || saves[slotId]?.metadata.saveName || `Save ${slotId}`,
        teamName: gameState.playerTeam.name,
        season: gameState.season.year,
        week: gameState.season.currentWeek,
        position,
        lastSaved: now,
        createdAt: saves[slotId]?.metadata.createdAt || now,
      };

      const slot: SaveSlot = {
        metadata,
        gameState: {
          ...gameState,
          lastSaved: now,
        },
      };

      saves[slotId] = slot;
      localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    } catch (error) {
      console.error('Failed to save to slot:', error);
      throw new Error(`Failed to save to slot ${slotId}`);
    }
  }

  /**
   * Load game from specific slot
   */
  static loadFromSlot(slotId: number): GameState | null {
    const slot = this.getSlot(slotId);
    if (!slot) {
      return null;
    }

    // Apply migrations
    const gameState = slot.gameState;

    // Migration: Add boardStatus if it doesn't exist (for old saves)
    if (!gameState.boardStatus) {
      const boardManager = new BoardManager();
      gameState.boardStatus = boardManager.initializeBoardStatus(
        gameState.playerTeam,
        gameState.season.year
      );
    }

    // Migration: Add player stats and history if they don't exist (for old saves)
    const statsTracker = new PlayerStatsTracker();
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
      const recordsManager = new RecordsManager();
      gameState.clubRecords = recordsManager.initializeClubRecords(gameState.season.year);
    }

    // Migration: Add achievements and seasonAwards if they don't exist (for old saves)
    if (!gameState.achievements) {
      const achievementManager = new AchievementManager();
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
    const staffManager = new StaffManager();
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
    const seasonManager = new SeasonManager();
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

    return gameState;
  }

  /**
   * Delete a specific save slot
   */
  static deleteSlot(slotId: number): void {
    try {
      const saves = this.getAllSaves();
      delete saves[slotId];
      localStorage.setItem(SAVES_KEY, JSON.stringify(saves));

      // If this was the active slot, clear it
      if (this.getActiveSlot() === slotId) {
        localStorage.removeItem(ACTIVE_SLOT_KEY);
      }
    } catch (error) {
      console.error('Failed to delete slot:', error);
    }
  }

  /**
   * Rename a save slot
   */
  static renameSlot(slotId: number, newName: string): void {
    try {
      const saves = this.getAllSaves();
      if (saves[slotId]) {
        saves[slotId].metadata.saveName = newName;
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
      }
    } catch (error) {
      console.error('Failed to rename slot:', error);
    }
  }

  /**
   * Get active slot ID
   */
  static getActiveSlot(): number | null {
    try {
      const slotId = localStorage.getItem(ACTIVE_SLOT_KEY);
      return slotId ? parseInt(slotId, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set active slot ID
   */
  static setActiveSlot(slotId: number): void {
    try {
      localStorage.setItem(ACTIVE_SLOT_KEY, slotId.toString());
    } catch (error) {
      console.error('Failed to set active slot:', error);
    }
  }

  /**
   * Create a new save in the first available slot (1-5)
   */
  static createNewSave(saveName?: string): { slotId: number; gameState: GameState } {
    const saves = this.getAllSaves();

    // Find first available slot (1-5)
    let slotId = 1;
    for (let i = 1; i <= 5; i++) {
      if (!saves[i]) {
        slotId = i;
        break;
      }
    }

    // If all slots are full, throw error
    if (saves[slotId]) {
      throw new Error('All save slots are full. Please delete a save first.');
    }

    const gameState = this.createNewGame();
    this.saveToSlot(slotId, gameState, saveName);
    this.setActiveSlot(slotId);

    return { slotId, gameState };
  }

  /**
   * Export save to JSON string
   */
  static exportSave(slotId: number): string | null {
    const slot = this.getSlot(slotId);
    if (!slot) {
      return null;
    }
    return JSON.stringify(slot, null, 2);
  }

  /**
   * Import save from JSON string
   */
  static importSave(jsonString: string, targetSlotId?: number): number {
    try {
      const slot: SaveSlot = JSON.parse(jsonString);

      // Validate structure
      if (!slot.metadata || !slot.gameState) {
        throw new Error('Invalid save file format');
      }

      const saves = this.getAllSaves();

      // Find target slot
      let slotId = targetSlotId;
      if (!slotId) {
        // Find first available slot
        for (let i = 1; i <= 5; i++) {
          if (!saves[i]) {
            slotId = i;
            break;
          }
        }
      }

      if (!slotId || saves[slotId]) {
        throw new Error('Target slot is occupied or no slots available');
      }

      // Update slot ID in metadata
      slot.metadata.slotId = slotId;

      this.saveToSlot(slotId, slot.gameState, slot.metadata.saveName);
      return slotId;
    } catch (error) {
      console.error('Failed to import save:', error);
      throw new Error('Failed to import save. Invalid format.');
    }
  }

  /**
   * Migrate old single-save to slot-1
   */
  static migrateOldSave(): void {
    try {
      const oldSave = localStorage.getItem(OLD_SAVE_KEY);
      const newSaves = localStorage.getItem(SAVES_KEY);

      // Only migrate if old save exists and new saves don't
      if (oldSave && oldSave.trim() !== '' && !newSaves) {
        const gameState = JSON.parse(oldSave);

        // Convert dates
        gameState.createdAt = new Date(gameState.createdAt);
        gameState.lastSaved = new Date(gameState.lastSaved);
        gameState.finances.transactions = gameState.finances.transactions.map(
          (t: { date: string | Date; [key: string]: unknown }) => ({
            ...t,
            date: new Date(t.date),
          })
        );

        // Save to slot 1
        this.saveToSlot(1, gameState, 'Migrated Save');
        this.setActiveSlot(1);

        // Remove old save
        localStorage.removeItem(OLD_SAVE_KEY);
      }
    } catch (error) {
      console.error('Failed to migrate old save:', error);
    }
  }

  /**
   * Legacy method - save to active slot (backward compatible)
   */
  static saveGame(state: GameState): void {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      this.saveToSlot(activeSlot, state);
    }
  }

  /**
   * Legacy method - load from active slot (backward compatible)
   */
  static loadGame(): GameState | null {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      return this.loadFromSlot(activeSlot);
    }
    return null;
  }

  /**
   * Legacy method - delete active slot (backward compatible)
   */
  static deleteSave(): void {
    const activeSlot = this.getActiveSlot();
    if (activeSlot) {
      this.deleteSlot(activeSlot);
    }
  }

  /**
   * Legacy method - check if active slot exists
   */
  static hasSave(): boolean {
    const activeSlot = this.getActiveSlot();
    return activeSlot !== null && this.getSlot(activeSlot) !== null;
  }
}
