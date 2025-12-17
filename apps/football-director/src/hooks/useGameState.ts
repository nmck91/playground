/**
 * Football Director - useGameState Hook
 * Main game state management hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  MatchSimulator,
  LeagueTableManager,
  FinanceEngine,
  SeasonManager,
  TransferMarket,
  TransferListing,
  Player,
  PlayerDevelopment,
  DevelopmentReport,
  BoardManager,
  BoardObjective,
  MatchResult,
} from '@playground/football-director-engine';
import { SaveService } from '../services/SaveService';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSimulationResults, setLastSimulationResults] = useState<MatchResult[]>([]);
  const [developmentReports, setDevelopmentReports] = useState<DevelopmentReport[]>([]);
  const [seasonEvaluation, setSeasonEvaluation] = useState<{
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
  } | null>(null);

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
  }, []);

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
  const newGame = useCallback(() => {
    try {
      const newGameState = SaveService.createNewGame();
      setGameState(newGameState);
      setError(null);
    } catch (err) {
      setError('Failed to create new game');
      console.error(err);
    }
  }, []);

  /**
   * Simulate the next week of matches
   */
  const simulateNextWeek = useCallback(() => {
    if (!gameState) return;

    try {
      const simulator = new MatchSimulator();
      const tableManager = new LeagueTableManager();
      const financeEngine = new FinanceEngine();
      const seasonManager = new SeasonManager();

      const currentWeek = gameState.season.currentWeek;

      // 1. Simulate all matches for this week
      const { results, updatedFixtures } = seasonManager.simulateWeek(
        gameState.fixtures,
        [gameState.playerTeam, ...gameState.aiTeams],
        currentWeek,
        simulator
      );

      // 2. Update league table
      let updatedTable = gameState.leagueTable;
      results.forEach((result) => {
        updatedTable = tableManager.updateTable(updatedTable, result);
      });
      updatedTable = tableManager.sortTable(updatedTable);

      // 3. Process finances
      const playerPosition = tableManager.getTeamPosition(
        updatedTable,
        gameState.playerTeam.id
      );

      // Check if player has home match this week
      const playerFixtures = seasonManager.getFixturesForWeek(
        updatedFixtures,
        currentWeek
      );
      const playerHomeMatch = playerFixtures.find(
        (f) => f.homeTeamId === gameState.playerTeam.id
      );
      const matchDayIncome = financeEngine.calculateMatchDayIncome(
        !!playerHomeMatch
      );

      const { newBudget, transactions } = financeEngine.processWeeklyFinances(
        gameState.finances.budget,
        gameState.playerTeam,
        playerPosition,
        matchDayIncome,
        currentWeek
      );

      // 4. Simulate AI transfers and refresh market
      const transferMarket = new TransferMarket();
      const { updatedTeams, updatedListings } = transferMarket.simulateAITransfers(
        gameState.aiTeams,
        gameState.transferMarket
      );

      // Generate new listings every 2 weeks
      let finalMarket = updatedListings;
      if (currentWeek % 2 === 0) {
        const newListings = transferMarket.generateMarket(updatedTeams, currentWeek, 5);
        finalMarket = [...updatedListings, ...newListings];
      }

      // 5. Update game state
      const isComplete = seasonManager.isSeasonComplete(updatedFixtures);

      // Store simulation results for highlights
      setLastSimulationResults(results);

      // 6. Update board status
      const boardManager = new BoardManager();
      const weeksRemaining = gameState.season.totalWeeks - currentWeek;
      let updatedBoardStatus = boardManager.updateBoardStatus(
        gameState.boardStatus,
        updatedTable,
        gameState.playerTeam.id,
        weeksRemaining
      );

      // 7. Apply player development if season is complete
      let finalPlayerTeam = { ...gameState.playerTeam, budget: newBudget };
      let finalAITeams = updatedTeams;

      if (isComplete) {
        const playerDev = new PlayerDevelopment();

        // Develop player's team
        const { team: developedPlayerTeam, reports: playerReports } =
          playerDev.developTeam(finalPlayerTeam);
        finalPlayerTeam = developedPlayerTeam;

        // Develop AI teams
        const { teams: developedAITeams } = playerDev.developLeague(finalAITeams);
        finalAITeams = developedAITeams;

        // Store development reports for display
        setDevelopmentReports(playerReports);

        // 8. Evaluate season performance
        const finalPosition = tableManager.getTeamPosition(updatedTable, gameState.playerTeam.id);
        const evaluation = boardManager.evaluateSeason(updatedBoardStatus, finalPosition);

        // Store evaluation for display
        setSeasonEvaluation(evaluation);

        // Update board status with final objective
        updatedBoardStatus = {
          ...updatedBoardStatus,
          currentObjective: evaluation.objective,
          objectiveHistory: [
            ...updatedBoardStatus.objectiveHistory,
            evaluation.objective,
          ],
        };

        // If sacked, handle game over
        if (evaluation.sacked) {
          // Don't update state, just show evaluation
          return;
        }

        // Generate new objective for next season
        const newObjective = boardManager.generateObjective(
          finalPlayerTeam,
          gameState.season.year + 1,
          finalPosition
        );
        updatedBoardStatus = {
          ...updatedBoardStatus,
          currentObjective: newObjective,
          satisfaction: evaluation.satisfied ? Math.min(100, updatedBoardStatus.satisfaction + 10) : updatedBoardStatus.satisfaction,
        };
      }

      setGameState({
        ...gameState,
        playerTeam: finalPlayerTeam,
        aiTeams: finalAITeams,
        season: {
          ...gameState.season,
          currentWeek: isComplete ? currentWeek : currentWeek + 1,
          status: isComplete ? 'completed' : 'in-progress',
        },
        fixtures: updatedFixtures,
        leagueTable: updatedTable,
        matchHistory: [...gameState.matchHistory, ...results],
        transferMarket: finalMarket,
        boardStatus: updatedBoardStatus,
        finances: {
          ...gameState.finances,
          budget: newBudget,
          weeklyIncome:
            transactions.find((t) => t.category === 'prize-money')?.amount || 0,
          weeklyExpenses:
            transactions.find((t) => t.category === 'wages')?.amount || 0,
          totalIncome:
            gameState.finances.totalIncome +
            transactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0),
          totalExpenses:
            gameState.finances.totalExpenses +
            transactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0),
          transactions: [...gameState.finances.transactions, ...transactions],
        },
      });
    } catch (err) {
      setError('Failed to simulate week');
      console.error(err);
    }
  }, [gameState]);

  /**
   * Buy a player from the transfer market
   */
  const buyPlayer = useCallback(
    (listing: TransferListing) => {
      if (!gameState) return;

      try {
        const transferMarket = new TransferMarket();
        const sellerTeam = gameState.aiTeams.find((t) => t.id === listing.sellingTeamId);

        if (!sellerTeam) {
          setError('Seller team not found');
          return;
        }

        const result = transferMarket.buyPlayer(
          listing,
          gameState.playerTeam,
          sellerTeam,
          gameState.transferMarket
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        // Add transfer transaction
        const transferTransaction = {
          id: `txn-${Date.now()}-transfer`,
          date: new Date(),
          type: 'expense' as const,
          category: 'transfers' as const,
          amount: listing.askingPrice,
          description: `Signed ${listing.player.name} from ${listing.sellingTeamName}`,
          weekNumber: gameState.season.currentWeek,
        };

        if (result.updatedBuyerTeam && result.updatedSellerTeam && result.updatedListings) {
          const updatedBuyerTeam = result.updatedBuyerTeam;
          const updatedSellerTeam = result.updatedSellerTeam;
          const updatedListings = result.updatedListings;

          setGameState({
            ...gameState,
            playerTeam: updatedBuyerTeam,
            aiTeams: gameState.aiTeams.map((t) =>
              t.id === sellerTeam.id ? updatedSellerTeam : t
            ),
            transferMarket: updatedListings,
            finances: {
              ...gameState.finances,
              budget: updatedBuyerTeam.budget,
              totalExpenses: gameState.finances.totalExpenses + listing.askingPrice,
              transactions: [...gameState.finances.transactions, transferTransaction],
            },
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to buy player');
        console.error(err);
      }
    },
    [gameState]
  );

  /**
   * Sell a player from your squad
   */
  const sellPlayer = useCallback(
    (player: Player, askingPrice: number) => {
      if (!gameState) return;

      try {
        const transferMarket = new TransferMarket();

        const result = transferMarket.sellPlayer(
          player,
          gameState.playerTeam,
          askingPrice,
          gameState.transferMarket,
          gameState.season.currentWeek
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (result.updatedTeam && result.updatedListings) {
          const updatedTeam = result.updatedTeam;
          const updatedListings = result.updatedListings;

          setGameState({
            ...gameState,
            playerTeam: updatedTeam,
            transferMarket: updatedListings,
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to sell player');
        console.error(err);
      }
    },
    [gameState]
  );

  /**
   * Delete current save and reset
   */
  const deleteSave = useCallback(() => {
    SaveService.deleteSave();
    setGameState(null);
    setError(null);
  }, []);

  return {
    gameState,
    loading,
    error,
    lastSimulationResults,
    developmentReports,
    seasonEvaluation,
    hasSave: !!gameState,
    actions: {
      newGame,
      simulateNextWeek,
      buyPlayer,
      sellPlayer,
      deleteSave,
    },
  };
}
