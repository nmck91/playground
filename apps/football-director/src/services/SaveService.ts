/**
 * Football Director - Save Service
 * Handles game state persistence to localStorage
 */

import {
  GameState,
  TeamGenerator,
  LeagueTableManager,
  SeasonManager,
  TransferMarket,
  BoardManager,
} from '@playground/football-director-engine';

const SAVE_KEY = 'football-director-save';

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

    // Generate fixtures
    const fixtures = seasonManager.generateFixtures(allTeams);

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

    // Initial season
    const season = {
      year: 2024,
      currentWeek: 1,
      totalWeeks: seasonManager.getTotalWeeks(fixtures),
      status: 'in-progress' as const,
    };

    // Generate initial transfer market
    const transferMarket = new TransferMarket();
    const initialMarket = transferMarket.generateMarket(aiTeams, 1, 15);

    // Initialize board status with objectives
    const boardManager = new BoardManager();
    const boardStatus = boardManager.initializeBoardStatus(playerTeam, season.year);

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
      boardStatus,
    };

    return gameState;
  }

  /**
   * Save game state to localStorage
   */
  static saveGame(state: GameState): void {
    try {
      const updatedState = {
        ...state,
        lastSaved: new Date(),
      };

      const serialized = JSON.stringify(updatedState);
      localStorage.setItem(SAVE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save game:', error);
      throw new Error('Failed to save game to localStorage');
    }
  }

  /**
   * Load game state from localStorage
   */
  static loadGame(): GameState | null {
    try {
      const serialized = localStorage.getItem(SAVE_KEY);

      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);

      // Convert date strings back to Date objects
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.lastSaved = new Date(parsed.lastSaved);
      parsed.finances.transactions = parsed.finances.transactions.map(
        (t: { date: string | Date; [key: string]: unknown }) => ({
          ...t,
          date: new Date(t.date),
        })
      );

      // Migration: Add boardStatus if it doesn't exist (for old saves)
      if (!parsed.boardStatus) {
        const boardManager = new BoardManager();
        parsed.boardStatus = boardManager.initializeBoardStatus(
          parsed.playerTeam,
          parsed.season.year
        );
      }

      return parsed as GameState;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Delete saved game from localStorage
   */
  static deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  }

  /**
   * Check if a save exists
   */
  static hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }
}
