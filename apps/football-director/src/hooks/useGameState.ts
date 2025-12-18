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
  PlayerStatsTracker,
  SeasonTopPerformers,
  RecordsManager,
  AchievementManager,
  Achievement,
  SeasonAward,
  NewsGenerator,
  Staff,
  StaffManager,
  InjuryManager,
  TacticsManager,
  FormationType,
  Mentality,
} from '@playground/football-director-engine';
import { SaveService } from '../services/SaveService';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSimulationResults, setLastSimulationResults] = useState<MatchResult[]>([]);
  const [developmentReports, setDevelopmentReports] = useState<DevelopmentReport[]>([]);
  const [seasonTopPerformers, setSeasonTopPerformers] = useState<SeasonTopPerformers | null>(null);
  const [seasonEvaluation, setSeasonEvaluation] = useState<{
    objective: BoardObjective;
    satisfied: boolean;
    sacked: boolean;
    message: string;
    brokenRecords?: string[];
    seasonAwards?: SeasonAward;
  } | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

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
  const newGame = useCallback((saveName?: string) => {
    try {
      const { gameState: newGameState } = SaveService.createNewSave(saveName);
      setGameState(newGameState);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create new game');
      console.error(err);
    }
  }, []);

  /**
   * Load game from specific slot
   */
  const loadSlot = useCallback((slotId: number) => {
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
      const statsTracker = new PlayerStatsTracker();
      const injuryManager = new InjuryManager();

      const currentWeek = gameState.season.currentWeek;

      // 0. Process weekly injury recoveries and suspension expirations
      let recoveredPlayers: string[] = [];
      const playerRecoveryResult = injuryManager.updateWeeklyInjuries(
        gameState.playerTeam,
        currentWeek
      );
      let updatedPlayerTeam = playerRecoveryResult.team;
      recoveredPlayers = playerRecoveryResult.recovered;

      // Update AI teams' injuries
      let updatedAITeams = gameState.aiTeams.map((team) => {
        const recoveryResult = injuryManager.updateWeeklyInjuries(team, currentWeek);
        return recoveryResult.team;
      });

      // 1. Simulate all matches for this week
      const { results, updatedFixtures } = seasonManager.simulateWeek(
        gameState.fixtures,
        [gameState.playerTeam, ...gameState.aiTeams],
        currentWeek,
        simulator
      );

      // 1b. Update player stats and process injuries/suspensions
      results.forEach((result) => {
        const isPlayerTeamHome = result.homeTeam === updatedPlayerTeam.name;
        const isPlayerTeamAway = result.awayTeam === updatedPlayerTeam.name;

        if (isPlayerTeamHome || isPlayerTeamAway) {
          // Update stats
          updatedPlayerTeam = statsTracker.processTeamMatchStats(
            updatedPlayerTeam,
            result,
            result.events || [],
            isPlayerTeamHome
          );

          // Process injuries
          const injuryResult = injuryManager.processMatchInjuries(
            updatedPlayerTeam,
            currentWeek
          );
          updatedPlayerTeam = injuryResult.team;

          // Process suspensions
          const suspensionResult = injuryManager.processSuspensions(
            updatedPlayerTeam,
            result.events || [],
            currentWeek,
            isPlayerTeamHome
          );
          updatedPlayerTeam = suspensionResult.team;
        }

        updatedAITeams = updatedAITeams.map((team) => {
          const isTeamHome = result.homeTeam === team.name;
          const isTeamAway = result.awayTeam === team.name;

          if (isTeamHome || isTeamAway) {
            // Update stats
            let processedTeam = statsTracker.processTeamMatchStats(
              team,
              result,
              result.events || [],
              isTeamHome
            );

            // Process injuries
            const injuryResult = injuryManager.processMatchInjuries(
              processedTeam,
              currentWeek
            );
            processedTeam = injuryResult.team;

            // Process suspensions
            const suspensionResult = injuryManager.processSuspensions(
              processedTeam,
              result.events || [],
              currentWeek,
              isTeamHome
            );
            processedTeam = suspensionResult.team;

            return processedTeam;
          }
          return team;
        });
      });

      // 2. Update league table
      let updatedTable = gameState.leagueTable;
      results.forEach((result) => {
        updatedTable = tableManager.updateTable(updatedTable, result);
      });
      updatedTable = tableManager.sortTable(updatedTable);

      // 3. Process finances
      const playerPosition = tableManager.getTeamPosition(
        updatedTable,
        updatedPlayerTeam.id
      );

      // Check if player has home match this week
      const playerFixtures = seasonManager.getFixturesForWeek(
        updatedFixtures,
        currentWeek
      );
      const playerHomeMatch = playerFixtures.find(
        (f) => f.homeTeamId === updatedPlayerTeam.id
      );
      const matchDayIncome = financeEngine.calculateMatchDayIncome(
        !!playerHomeMatch
      );

      const { newBudget, transactions } = financeEngine.processWeeklyFinances(
        gameState.finances.budget,
        updatedPlayerTeam,
        playerPosition,
        matchDayIncome,
        currentWeek
      );

      // 4. Simulate AI transfers and refresh market
      const transferMarket = new TransferMarket();
      const { updatedTeams, updatedListings } = transferMarket.simulateAITransfers(
        updatedAITeams,
        gameState.transferMarket
      );

      // Generate new listings every week (more listings to keep market active)
      let finalMarket = updatedListings;
      const newListings = transferMarket.generateMarket(updatedTeams, currentWeek, 15);
      finalMarket = [...updatedListings, ...newListings];

      // 5. Update game state
      const isComplete = seasonManager.isSeasonComplete(updatedFixtures);

      // Store simulation results for highlights
      setLastSimulationResults(results);

      // Calculate and store top performers for the season
      const currentTopPerformers = statsTracker.getTopPerformers(updatedPlayerTeam);
      setSeasonTopPerformers(currentTopPerformers);

      // 6. Update board status
      const boardManager = new BoardManager();
      const weeksRemaining = gameState.season.totalWeeks - currentWeek;
      let updatedBoardStatus = boardManager.updateBoardStatus(
        gameState.boardStatus,
        updatedTable,
        gameState.playerTeam.id,
        weeksRemaining
      );

      // 6b. Generate news for this week
      const newsGenerator = new NewsGenerator();
      let weeklyNews = [...gameState.newsFeed];

      // Match results news
      const matchNews = newsGenerator.generateMatchNews(
        results,
        gameState.playerTeam.name,
        updatedTable,
        currentWeek,
        gameState.season.year
      );
      weeklyNews = [...matchNews, ...weeklyNews];

      // Board status news
      const boardNews = newsGenerator.generateBoardNews(
        updatedBoardStatus,
        gameState.playerTeam.name,
        playerPosition,
        currentWeek,
        gameState.season.year
      );
      if (boardNews) {
        weeklyNews = [boardNews, ...weeklyNews];
      }

      // Standings changes news
      if (currentWeek > 1) {
        const standingsNews = newsGenerator.generateStandingsNews(
          gameState.leagueTable,
          updatedTable,
          currentWeek,
          gameState.season.year
        );
        weeklyNews = [...standingsNews, ...weeklyNews];
      }

      // 7. Apply player development and archive stats if season is complete
      let finalPlayerTeam = { ...updatedPlayerTeam, budget: newBudget };
      let finalAITeams = updatedTeams;
      let seasonAward = null;

      if (isComplete) {
        const playerDev = new PlayerDevelopment();

        // Archive season stats before development
        finalPlayerTeam = statsTracker.archiveAndResetTeamStats(
          finalPlayerTeam,
          gameState.season.year
        );
        finalAITeams = finalAITeams.map((team) =>
          statsTracker.archiveAndResetTeamStats(team, gameState.season.year)
        );

        // Develop player's team
        const { team: developedPlayerTeam, reports: playerReports } =
          playerDev.developTeam(finalPlayerTeam);
        finalPlayerTeam = developedPlayerTeam;

        // Develop AI teams
        const { teams: developedAITeams } = playerDev.developLeague(finalAITeams);
        finalAITeams = developedAITeams;

        // Store development reports for display
        setDevelopmentReports(playerReports);

        // Development news
        const devNews = newsGenerator.generateDevelopmentNews(
          playerReports,
          gameState.playerTeam.name,
          currentWeek,
          gameState.season.year
        );
        weeklyNews = [...devNews, ...weeklyNews];

        // Reset top performers for new season
        setSeasonTopPerformers(null);

        // 8. Calculate season records
        const recordsManager = new RecordsManager();
        const playerTableEntry = updatedTable.find(entry => entry.teamId === gameState.playerTeam.id);
        let brokenRecords: string[] = [];

        if (playerTableEntry) {
          const seasonRecords = recordsManager.calculateSeasonRecords(
            gameState.season.year,
            playerTableEntry,
            gameState.matchHistory,
            updatedFixtures,
            finalPlayerTeam,
            gameState.playerTeam.id
          );

          // Update club records
          const recordsUpdate = recordsManager.updateClubRecords(
            gameState.clubRecords,
            seasonRecords
          );

          // Store records in game state
          gameState.seasonRecords = [...gameState.seasonRecords, seasonRecords];
          gameState.clubRecords = recordsUpdate.records;
          brokenRecords = recordsUpdate.brokenRecords;
        }

        // 9. Award season prizes
        const achievementManager = new AchievementManager();
        seasonAward = achievementManager.awardSeasonPrizes({
          ...gameState,
          playerTeam: finalPlayerTeam,
          season: {
            ...gameState.season,
            status: 'completed',
          },
        });

        // 10. Evaluate season performance
        const finalPosition = tableManager.getTeamPosition(updatedTable, gameState.playerTeam.id);

        // Generate season end news
        const finalTableEntry = updatedTable.find(entry => entry.teamId === gameState.playerTeam.id);
        if (finalTableEntry) {
          const seasonEndNews = newsGenerator.generateSeasonEndNews(
            finalPosition,
            gameState.playerTeam.name,
            gameState.season.year,
            finalTableEntry
          );
          weeklyNews = [seasonEndNews, ...weeklyNews];
        }

        const evaluation = boardManager.evaluateSeason(updatedBoardStatus, finalPosition);

        // Store evaluation with broken records and season awards for display
        setSeasonEvaluation({
          ...evaluation,
          brokenRecords: brokenRecords.length > 0 ? brokenRecords : undefined,
          seasonAwards: seasonAward,
        });

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

      // Add season award to game state if season is complete
      let updatedSeasonAwards = [...gameState.seasonAwards];
      if (seasonAward) {
        updatedSeasonAwards = [...updatedSeasonAwards, seasonAward];
      }

      // Prune old news (keep last 3 seasons)
      weeklyNews = newsGenerator.pruneOldNews(weeklyNews, gameState.season.year);

      // Build updated game state
      const updatedGameState: GameState = {
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
        seasonAwards: updatedSeasonAwards,
        newsFeed: weeklyNews,
      };

      // 11. Check achievements
      const achievementManager = new AchievementManager();
      const newlyUnlocked = achievementManager.checkAchievements(
        updatedGameState,
        updatedGameState.achievements
      );

      if (newlyUnlocked.length > 0) {
        setPendingAchievements((prev) => [...prev, ...newlyUnlocked]);
      }

      setGameState(updatedGameState);
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
   * Dismiss an achievement toast
   */
  const dismissAchievement = useCallback((achievementId: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.id !== achievementId));
  }, []);

  /**
   * Mark all news as read
   */
  const markAllNewsRead = useCallback(() => {
    if (!gameState) return;

    setGameState({
      ...gameState,
      newsFeed: gameState.newsFeed.map(article => ({
        ...article,
        read: true,
      })),
    });
  }, [gameState]);

  /**
   * Hire a staff member
   */
  const hireStaff = useCallback(
    (staff: Staff) => {
      if (!gameState) return;

      try {
        const staffManager = new StaffManager();

        const result = staffManager.hireStaff(
          staff,
          gameState.playerTeam,
          gameState.staffMarket
        );

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (result.updatedTeam && result.updatedMarket) {
          setGameState({
            ...gameState,
            playerTeam: result.updatedTeam,
            staffMarket: result.updatedMarket,
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to hire staff');
        console.error(err);
      }
    },
    [gameState]
  );

  /**
   * Fire a staff member
   */
  const fireStaff = useCallback(
    (staff: Staff) => {
      if (!gameState) return;

      try {
        const staffManager = new StaffManager();

        const result = staffManager.fireStaff(staff, gameState.playerTeam);

        if (!result.success) {
          setError(result.message);
          return;
        }

        // Add severance transaction
        if (result.updatedTeam && result.severancePay) {
          const severanceTransaction = {
            id: `txn-${Date.now()}-severance`,
            date: new Date(),
            type: 'expense' as const,
            category: 'other' as const,
            amount: result.severancePay,
            description: `Severance pay for ${staff.name}`,
            weekNumber: gameState.season.currentWeek,
          };

          setGameState({
            ...gameState,
            playerTeam: result.updatedTeam,
            finances: {
              ...gameState.finances,
              budget: result.updatedTeam.budget,
              totalExpenses: gameState.finances.totalExpenses + result.severancePay,
              transactions: [...gameState.finances.transactions, severanceTransaction],
            },
          });
        }

        setError(null);
      } catch (err) {
        setError('Failed to fire staff');
        console.error(err);
      }
    },
    [gameState]
  );

  /**
   * Continue to next season after season ends
   */
  const continueToNextSeason = useCallback(() => {
    if (!gameState || gameState.season.status !== 'completed') return;

    try {
      const seasonManager = new SeasonManager();
      const tableManager = new LeagueTableManager();
      const transferMarket = new TransferMarket();

      // Generate new season fixtures
      const newFixtures = seasonManager.generateFixtures([gameState.playerTeam, ...gameState.aiTeams]);

      // Reset league table for new season
      const newTable = tableManager.initializeTable([gameState.playerTeam, ...gameState.aiTeams]);

      // Generate fresh transfer market for new season
      const newMarket = transferMarket.generateMarket(gameState.aiTeams, 1, 15);

      // Clear modal states
      setSeasonEvaluation(null);
      setDevelopmentReports([]);
      setLastSimulationResults([]);

      // Update game state with new season
      setGameState({
        ...gameState,
        season: {
          year: gameState.season.year + 1,
          currentWeek: 1,
          totalWeeks: seasonManager.getTotalWeeks(newFixtures),
          status: 'in-progress',
        },
        fixtures: newFixtures,
        leagueTable: newTable,
        transferMarket: newMarket,
        matchHistory: [], // Reset match history for new season (or could keep for records)
      });

      setError(null);
    } catch (err) {
      setError('Failed to start new season');
      console.error(err);
    }
  }, [gameState]);

  /**
   * Delete current save and reset
   */
  const deleteSave = useCallback(() => {
    SaveService.deleteSave();
    setGameState(null);
    setError(null);
  }, []);

  /**
   * Update team tactics (formation and mentality)
   */
  const setTeamTactics = useCallback(
    (formation: FormationType, mentality: Mentality) => {
      if (!gameState) return;

      try {
        const tacticsManager = new TacticsManager();
        const updatedTeam = tacticsManager.setTeamTactics(gameState.playerTeam, {
          formation,
          mentality,
        });

        setGameState({
          ...gameState,
          playerTeam: updatedTeam,
        });

        setError(null);
      } catch (err) {
        setError('Failed to update tactics');
        console.error(err);
      }
    },
    [gameState]
  );

  return {
    gameState,
    loading,
    error,
    lastSimulationResults,
    developmentReports,
    seasonTopPerformers,
    seasonEvaluation,
    pendingAchievements,
    hasSave: !!gameState,
    actions: {
      newGame,
      loadSlot,
      simulateNextWeek,
      buyPlayer,
      sellPlayer,
      hireStaff,
      fireStaff,
      deleteSave,
      dismissAchievement,
      markAllNewsRead,
      continueToNextSeason,
      setTeamTactics,
    },
  };
}
