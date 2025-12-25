/**
 * Football Director - useWeeklySimulation Hook
 * Weekly simulation orchestration
 */

'use client';

import { useCallback } from 'react';
import {
  GameState,
  MatchSimulator,
  LeagueTableManager,
  FinanceEngine,
  SeasonManager,
  PlayerStatsTracker,
  InjuryManager,
  ContractManager,
  MoraleManager,
  AIContractManager,
  TransferMarket,
  BoardManager,
  NewsGenerator,
  PlayerDevelopment,
  YouthAcademyManager,
  RecordsManager,
  AchievementManager,
  MatchPreviewGenerator,
  PostMatchGenerator,
  MatchResult,
  DevelopmentReport,
  Player,
  Achievement,
  MatchPreview,
} from '@playground/football-director-engine';

/**
 * Hook for managing weekly simulation
 *
 * @param gameState - Current game state
 * @param setGameState - Function to update game state
 * @param setError - Function to set error message
 * @param setLastSimulationResults - Function to update last simulation results
 * @param setDevelopmentReports - Function to update development reports
 * @param setSeasonTopPerformers - Function to update season top performers
 * @param setSeasonEvaluation - Function to update season evaluation
 * @param setPendingAchievements - Function to update pending achievements
 * @param setYouthProspects - Function to update youth prospects
 * @returns Weekly simulation action
 */
export function useWeeklySimulation(
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  setError: (error: string | null) => void,
  setLastSimulationResults: React.Dispatch<React.SetStateAction<MatchResult[]>>,
  setDevelopmentReports: React.Dispatch<React.SetStateAction<DevelopmentReport[]>>,
  setSeasonTopPerformers: React.Dispatch<React.SetStateAction<any>>,
  setSeasonEvaluation: React.Dispatch<React.SetStateAction<any>>,
  setPendingAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>,
  setYouthProspects: React.Dispatch<React.SetStateAction<Player[]>>
) {
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
      const contractManager = new ContractManager();
      const moraleManager = new MoraleManager();

      const currentWeek = gameState.season.currentWeek;
      const hasMatches = seasonManager.hasMatchesThisWeek(currentWeek);

      // 0. Process weekly injury recoveries and suspension expirations
      const playerRecoveryResult = injuryManager.updateWeeklyInjuries(
        gameState.playerTeam,
        currentWeek
      );
      let updatedPlayerTeam = playerRecoveryResult.team;

      // Update AI teams' injuries
      let updatedAITeams = gameState.aiTeams.map((team) => {
        const recoveryResult = injuryManager.updateWeeklyInjuries(team, currentWeek);
        return recoveryResult.team;
      });

      // Update morale for all teams
      const playerMoraleResult = moraleManager.updateTeamMorale(
        updatedPlayerTeam,
        gameState.leagueTable,
        currentWeek
      );
      updatedPlayerTeam = playerMoraleResult.team;

      updatedAITeams = updatedAITeams.map((team) => {
        const moraleResult = moraleManager.updateTeamMorale(
          team,
          gameState.leagueTable,
          currentWeek
        );
        return moraleResult.team;
      });

      // Update all contracts with current status
      updatedPlayerTeam = contractManager.updateTeamContracts(
        updatedPlayerTeam,
        gameState.season.year,
        currentWeek
      );

      updatedAITeams = updatedAITeams.map(team =>
        contractManager.updateTeamContracts(
          team,
          gameState.season.year,
          currentWeek
        )
      );

      // AI teams process contract renewals every 4 weeks during season
      const aiContractManager = new AIContractManager();
      if (currentWeek % 4 === 0 && currentWeek >= 8 && currentWeek <= 45) {
        updatedAITeams = updatedAITeams.map(team =>
          aiContractManager.processTeamContracts(
            team,
            gameState.season.year,
            currentWeek
          )
        );
      }

      // 0b. Generate match previews for upcoming player matches (before simulation)
      let matchPreviews: MatchPreview[] = gameState.matchPreviews || [];

      if (hasMatches) {
        const previewGen = new MatchPreviewGenerator();
        const upcomingPlayerFixtures = gameState.fixtures.filter(
          (f) =>
            !f.played &&
            f.week === currentWeek &&
            (f.homeTeamId === updatedPlayerTeam.id || f.awayTeamId === updatedPlayerTeam.id)
        );

        // Generate previews for each upcoming player match
        const newPreviews = upcomingPlayerFixtures.map((fixture) => {
          const homeTeam =
            fixture.homeTeamId === updatedPlayerTeam.id
              ? updatedPlayerTeam
              : updatedAITeams.find((t) => t.id === fixture.homeTeamId)!;
          const awayTeam =
            fixture.awayTeamId === updatedPlayerTeam.id
              ? updatedPlayerTeam
              : updatedAITeams.find((t) => t.id === fixture.awayTeamId)!;

          // Get all played fixtures for head-to-head calculation
          const playedFixtures = gameState.fixtures.filter((f) => f.played);

          return previewGen.generatePreview(
            fixture,
            homeTeam,
            awayTeam,
            gameState.leagueTable,
            playedFixtures,
            currentWeek,
            gameState.season.year,
            gameState.season.year * 1000 + currentWeek // Seed for consistency
          );
        });

        // Add new previews to the list (keep previous ones for reference)
        matchPreviews = [...matchPreviews, ...newPreviews];
      }

      // 1. Simulate all matches for this week (only during competitive season)
      let results: MatchResult[] = [];
      let updatedFixtures = gameState.fixtures;

      if (hasMatches) {
        const simulationResult = seasonManager.simulateWeek(
          gameState.fixtures,
          [gameState.playerTeam, ...gameState.aiTeams],
          currentWeek,
          simulator
        );
        results = simulationResult.results;
        updatedFixtures = simulationResult.updatedFixtures;

        // 1a. Generate post-match analysis for player matches
        const postMatchGen = new PostMatchGenerator();
        results = results.map((result) => {
          const isPlayerMatch = result.homeTeam === updatedPlayerTeam.name || result.awayTeam === updatedPlayerTeam.name;

          if (isPlayerMatch) {
            // Find the teams
            const homeTeam = result.homeTeam === updatedPlayerTeam.name
              ? updatedPlayerTeam
              : updatedAITeams.find((t) => t.name === result.homeTeam)!;
            const awayTeam = result.awayTeam === updatedPlayerTeam.name
              ? updatedPlayerTeam
              : updatedAITeams.find((t) => t.name === result.awayTeam)!;

            // Generate post-match analysis
            const postMatchAnalysis = postMatchGen.generatePostMatchAnalysis(
              result,
              homeTeam,
              awayTeam,
              gameState.leagueTable,
              gameState.season.year * 1000 + currentWeek // Seed for consistency
            );

            // Add teamName to player interview
            if (postMatchAnalysis.playerInterview) {
              postMatchAnalysis.playerInterview.teamName =
                postMatchAnalysis.playerInterview.playerId === result.manOfMatch?.playerId
                  ? (result.manOfMatch.team === 'home' ? result.homeTeam : result.awayTeam)
                  : '';
            }

            return {
              ...result,
              postMatchAnalysis,
            };
          }

          return result;
        });
      }

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

      // Check if player has home match this week (only during competitive season)
      let matchDayIncome = 0;
      if (hasMatches) {
        const playerFixtures = seasonManager.getFixturesForWeek(
          updatedFixtures,
          currentWeek
        );
        const playerHomeMatch = playerFixtures.find(
          (f) => f.homeTeamId === updatedPlayerTeam.id
        );
        matchDayIncome = financeEngine.calculateMatchDayIncome(
          !!playerHomeMatch
        );
      }

      const { newBudget, transactions } = financeEngine.processWeeklyFinances(
        gameState.finances.budget,
        updatedPlayerTeam,
        playerPosition,
        matchDayIncome,
        currentWeek
      );

      // 4. Simulate AI transfers and refresh market (only during transfer windows)
      const transferMarket = new TransferMarket();
      const { updatedTeams, updatedListings } = transferMarket.simulateAITransfers(
        updatedAITeams,
        gameState.transferMarket,
        currentWeek
      );

      // Generate new listings every week (more listings to keep market active)
      let finalMarket = updatedListings;
      const newListings = transferMarket.generateMarket(updatedTeams, currentWeek, 15);
      finalMarket = [...updatedListings, ...newListings];

      // AI teams sign free agents during active transfer windows (weeks 1-7, 46-52)
      let finalUpdatedTeams = updatedTeams;
      let currentFreeAgents = [...(gameState.freeAgents || [])];
      if ((currentWeek >= 1 && currentWeek <= 7) || (currentWeek >= 46 && currentWeek <= 52)) {
        if (currentFreeAgents.length > 0) {
          finalUpdatedTeams = updatedTeams.map(team => {
            const result = aiContractManager.signFreeAgents(
              team,
              currentFreeAgents,
              gameState.season.year,
              currentWeek
            );

            // Remove signed players from free agent pool
            if (result.signed.length > 0) {
              currentFreeAgents = currentFreeAgents.filter(fa =>
                !result.signed.find(p => p.id === fa.player.id)
              );
            }

            return result.team;
          });
        }
      }

      // 5. Update game state
      // Season is complete when we've finished week 52 (7 pre-season + 38 competitive + 7 off-season)
      const isComplete = currentWeek >= 52;

      // Store simulation results for highlights
      setLastSimulationResults(results);

      // Calculate and store top performers for the season
      const currentTopPerformers = statsTracker.getTopPerformers(updatedPlayerTeam);
      setSeasonTopPerformers(currentTopPerformers);

      // 6. Update board status (only during competitive season: weeks 8-45)
      const boardManager = new BoardManager();
      const weeksRemaining = gameState.season.totalWeeks - currentWeek;
      let updatedBoardStatus = gameState.boardStatus;

      // Only evaluate board status during competitive season
      if (currentWeek >= 8 && currentWeek <= 45) {
        updatedBoardStatus = boardManager.updateBoardStatus(
          gameState.boardStatus,
          updatedTable,
          gameState.playerTeam.id,
          weeksRemaining
        );
      }

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
      let finalAITeams = finalUpdatedTeams;
      let seasonAward = null;
      const newFreeAgents = currentFreeAgents;

      if (isComplete) {
        // Process expired contracts → create free agents
        const playerResult = contractManager.processExpiredContracts(
          finalPlayerTeam,
          currentWeek
        );
        finalPlayerTeam = playerResult.updatedTeam;
        newFreeAgents.push(...playerResult.freeAgents);

        finalAITeams = finalAITeams.map(team => {
          const result = contractManager.processExpiredContracts(team, currentWeek);
          newFreeAgents.push(...result.freeAgents);
          return result.updatedTeam;
        });

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

        // Generate youth academy players
        const youthAcademyManager = new YouthAcademyManager();

        // Player team youth generation - generate prospects for selection
        if (finalPlayerTeam.players.length < 25) {
          const prospects = youthAcademyManager.generateYouthProspects(
            gameState.season.year,
            gameState.season.year * 999 // Seed for reproducibility
          );

          // Store prospects for player to select from
          setYouthProspects(prospects);
        }

        // AI teams also generate youth players
        finalAITeams = finalAITeams.map((team) => {
          if (team.players.length < 25) {
            return youthAcademyManager.generateYouthPlayers(
              team,
              gameState.season.year
            ).team;
          }
          return team;
        });

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
      const nextWeek = currentWeek + 1;
      const updatedGameState: GameState = {
        ...gameState,
        playerTeam: finalPlayerTeam,
        aiTeams: finalAITeams,
        season: {
          ...gameState.season,
          currentWeek: isComplete ? currentWeek : nextWeek,
          status: isComplete ? 'completed' : 'in-progress',
          phase: isComplete ? gameState.season.phase : seasonManager.getSeasonPhase(nextWeek),
          transferWindow: isComplete ? gameState.season.transferWindow : seasonManager.getTransferWindowStatus(nextWeek),
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
        freeAgents: newFreeAgents,
        matchPreviews,
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
  }, [
    gameState,
    setGameState,
    setError,
    setLastSimulationResults,
    setDevelopmentReports,
    setSeasonTopPerformers,
    setSeasonEvaluation,
    setPendingAchievements,
    setYouthProspects,
  ]);

  return {
    simulateNextWeek,
  };
}
