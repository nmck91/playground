/**
 * Football Director - Game Orchestrator Store
 * High-level orchestration of game simulation and season progression
 *
 * This store coordinates actions across multiple domain stores to handle:
 * - Weekly simulation (matches, injuries, development, etc.)
 * - Season progression and evaluation
 * - Multi-store updates in proper sequence
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
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
  NewsEngine,
  PlayerDevelopment,
  YouthAcademyManager,
  RecordsManager,
  AchievementManager,
  MatchPreviewGenerator,
  PostMatchGenerator,
  CupManager,
  type MatchResult,
  type DevelopmentReport,
  type Player,
  type Achievement,
  type BoardObjective,
  type SeasonAward,
  type SeasonTopPerformers,
} from '@playground/football-director-engine';
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import { useSaveStore } from './saveStore';

/**
 * Season Evaluation Result
 */
export interface SeasonEvaluation {
  objective: BoardObjective;
  satisfied: boolean;
  sacked: boolean;
  message: string;
  brokenRecords?: string[];
  seasonAwards?: SeasonAward;
}

/**
 * Game Orchestrator Store State Interface
 */
interface GameOrchestratorState {
  // Simulation UI state
  lastSimulationResults: MatchResult[];
  developmentReports: DevelopmentReport[];
  seasonTopPerformers: SeasonTopPerformers | null;
  seasonEvaluation: SeasonEvaluation | null;
  pendingAchievements: Achievement[];
  youthProspects: Player[];

  // Simulation in progress
  isSimulating: boolean;
}

/**
 * Game Orchestrator Store Actions Interface
 */
interface GameOrchestratorActions {
  // Weekly simulation
  simulateNextWeek: () => Promise<void>;

  // Season progression
  continueToNextSeason: () => void;

  // Clear transient state
  clearSimulationResults: () => void;
  clearSeasonEvaluation: () => void;
  clearDevelopmentReports: () => void;

  // Achievement handling
  dismissAchievement: (id: string) => void;

  // Youth academy
  selectYouthPlayers: (playerIds: string[]) => void;

  // Reset
  resetOrchestrator: () => void;
}

/**
 * Combined Game Orchestrator Store Type
 */
export type GameOrchestratorStore = GameOrchestratorState & GameOrchestratorActions;

/**
 * Initial state
 */
const initialState: GameOrchestratorState = {
  lastSimulationResults: [],
  developmentReports: [],
  seasonTopPerformers: null,
  seasonEvaluation: null,
  pendingAchievements: [],
  youthProspects: [],
  isSimulating: false,
};

/**
 * Game Orchestrator Store
 *
 * Coordinates complex multi-store operations like weekly simulation and season progression.
 *
 * @example
 * ```typescript
 * // Simulate next week
 * const simulateNextWeek = useGameOrchestratorStore(state => state.simulateNextWeek);
 * await simulateNextWeek();
 *
 * // Get simulation results
 * const lastResults = useGameOrchestratorStore(state => state.lastSimulationResults);
 * ```
 */
export const useGameOrchestratorStore = create<GameOrchestratorStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Actions
      simulateNextWeek: async () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          console.error('simulateNextWeek: No game state');
          return;
        }

        // Set simulating state
        set({ isSimulating: true }, false, 'orchestrator/simulateStart');
        useUIStore.getState().setSimulating(true);

        try {
          // Initialize engine managers
          const simulator = new MatchSimulator();
          const tableManager = new LeagueTableManager();
          const financeEngine = new FinanceEngine();
          const seasonManager = new SeasonManager();
          const statsTracker = new PlayerStatsTracker();
          const injuryManager = new InjuryManager();
          const contractManager = new ContractManager();
          const moraleManager = new MoraleManager();
          const aiContractManager = new AIContractManager();
          const transferMarket = new TransferMarket();
          const boardManager = new BoardManager();
          const newsEngine = new NewsEngine();
          const playerDevelopment = new PlayerDevelopment();
          const youthAcademyManager = new YouthAcademyManager();
          const recordsManager = new RecordsManager();
          const achievementManager = new AchievementManager();
          const matchPreviewGenerator = new MatchPreviewGenerator();
          const postMatchGenerator = new PostMatchGenerator();
          const cupManager = new CupManager();

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
            const aiMoraleResult = moraleManager.updateTeamMorale(
              team,
              gameState.leagueTable,
              currentWeek
            );
            return aiMoraleResult.team;
          });

          // Weekly news before matches
          // TODO: generateWeeklyNews method doesn't exist - news generated elsewhere
          // const weeklyNews = newsEngine.generateWeeklyNews(...);

          let allNews = [...gameState.newsFeed];

          // Simulate matches if it's a match week
          let matchResults: MatchResult[] = [];
          let updatedFixtures = gameState.fixtures;
          let updatedLeagueTable = gameState.leagueTable;
          let updatedMatchHistory = gameState.matchHistory;
          let cupResults: any[] = []; // TODO: Import CupResult type
          let updatedCupCompetition = gameState.cupCompetition;

          if (hasMatches) {
            // Get this week's fixtures
            const weekFixtures = gameState.fixtures.filter(
              (f) => f.week === currentWeek && !f.played
            );

            // Generate match previews
            const previews = weekFixtures.map((fixture) => {
              const homeTeam =
                fixture.homeTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.homeTeamId);
              const awayTeam =
                fixture.awayTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.awayTeamId);

              if (!homeTeam || !awayTeam) {
                throw new Error(`Missing team for preview: home=${fixture.homeTeamId}, away=${fixture.awayTeamId}`);
              }

              return matchPreviewGenerator.generatePreview(
                fixture,
                homeTeam,
                awayTeam,
                gameState.leagueTable,
                gameState.fixtures,
                currentWeek,
                gameState.season.year,
                Date.now() + parseInt(fixture.id.slice(-4))
              );
            });

            // Simulate each match
            matchResults = weekFixtures.map((fixture) => {
              const homeTeam =
                fixture.homeTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.homeTeamId);
              const awayTeam =
                fixture.awayTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.awayTeamId);

              // Defensive check - ensure both teams exist
              if (!homeTeam) {
                throw new Error(`Home team not found: ${fixture.homeTeamId}`);
              }
              if (!awayTeam) {
                throw new Error(`Away team not found: ${fixture.awayTeamId}`);
              }

              // Construct Match object with both teams
              const match = {
                homeTeam,
                awayTeam,
              };

              const result = simulator.simulateMatch(match, currentWeek);

              // Add fixture metadata to result
              return {
                ...result,
                homeTeamId: fixture.homeTeamId,
                awayTeamId: fixture.awayTeamId,
                fixtureId: fixture.id,
              };
            });

            // Update player stats from match results
            matchResults.forEach((result) => {
              if (result.homeTeamId === updatedPlayerTeam.id) {
                updatedPlayerTeam = statsTracker.processTeamMatchStats(
                  updatedPlayerTeam,
                  result,
                  result.events || [],
                  true
                );
              } else if (result.awayTeamId === updatedPlayerTeam.id) {
                updatedPlayerTeam = statsTracker.processTeamMatchStats(
                  updatedPlayerTeam,
                  result,
                  result.events || [],
                  false
                );
              }

              // Update AI team stats
              updatedAITeams = updatedAITeams.map((team) => {
                if (team.id === result.homeTeamId) {
                  return statsTracker.processTeamMatchStats(team, result, result.events || [], true);
                } else if (team.id === result.awayTeamId) {
                  return statsTracker.processTeamMatchStats(team, result, result.events || [], false);
                }
                return team;
              });
            });

            // Process injuries from matches
            matchResults.forEach((result) => {
              if (result.homeTeamId === updatedPlayerTeam.id) {
                const injuryResult = injuryManager.processMatchInjuries(
                  updatedPlayerTeam,
                  result,
                  'home'
                );
                updatedPlayerTeam = injuryResult.team;
              } else if (result.awayTeamId === updatedPlayerTeam.id) {
                const injuryResult = injuryManager.processMatchInjuries(
                  updatedPlayerTeam,
                  result,
                  'away'
                );
                updatedPlayerTeam = injuryResult.team;
              }

              // Process AI team injuries
              updatedAITeams = updatedAITeams.map((team) => {
                if (team.id === result.homeTeamId) {
                  const injuryResult = injuryManager.processMatchInjuries(team, result, 'home');
                  return injuryResult.team;
                } else if (team.id === result.awayTeamId) {
                  const injuryResult = injuryManager.processMatchInjuries(team, result, 'away');
                  return injuryResult.team;
                }
                return team;
              });
            });

            // Update league table
            updatedLeagueTable = matchResults.reduce(
              (table, result) => tableManager.updateTable(table, result),
              gameState.leagueTable
            );

            // Mark fixtures as played
            updatedFixtures = gameState.fixtures.map((fixture) => {
              const played = matchResults.find((r) => r.fixtureId === fixture.id);
              return played ? { ...fixture, played: true } : fixture;
            });

            // Add to match history (limit to 76 matches)
            updatedMatchHistory = [...matchResults, ...gameState.matchHistory].slice(0, 76);

            // Generate post-match news for player team matches
            const playerTeamResults = matchResults.filter(
              (result) =>
                result.homeTeamId === updatedPlayerTeam.id ||
                result.awayTeamId === updatedPlayerTeam.id
            );

            if (playerTeamResults.length > 0) {
              const postMatchNews = newsEngine.generateMatchNews(
                playerTeamResults,
                updatedPlayerTeam.name,
                updatedLeagueTable,
                currentWeek,
                gameState.season.year
              );
              allNews = [...postMatchNews, ...allNews];
            }

            // Handle cup matches if any - TODO: Implement cup processing
            // const cupFixtures = weekFixtures.filter((f) => f.matchType === 'cup');
            // if (cupFixtures.length > 0) {
            //   // Process cup results
            // }
          }

          // Weekly finances
          if (!gameState.finances) {
            throw new Error('GameState is missing finances - this should not happen. Try creating a new game.');
          }

          // Get player position in league table
          const sortedTable = [...updatedLeagueTable].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
          });
          const position = sortedTable.findIndex(entry => entry.teamId === gameState.playerTeam.id) + 1;

          // Calculate match day income (0 if no match this week)
          const matchDayIncome = 0; // TODO: Calculate based on attendance for matches this week

          const financeResult = financeEngine.processWeeklyFinances(
            gameState.finances.budget,
            updatedPlayerTeam,
            position,
            matchDayIncome,
            currentWeek
          );

          // Construct updated finances object from result
          const updatedFinances = {
            budget: financeResult.newBudget,
            weeklyIncome: gameState.finances.weeklyIncome,
            weeklyExpenses: gameState.finances.weeklyExpenses,
            totalIncome: gameState.finances.totalIncome + financeResult.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: gameState.finances.totalExpenses + financeResult.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            transactions: [...gameState.finances.transactions, ...financeResult.transactions],
          };

          // AI contract renewals and transfers during transfer windows
          if (gameState.season.transferWindow === 'open') {
            updatedAITeams = updatedAITeams.map((team) => {
              // AI contract management
              return aiContractManager.processTeamContracts(
                team,
                gameState.season.year,
                gameState.season.currentWeek
              );
            });

            // AI transfers - TODO: Implement processAITransfers method
            // const aiTransferResult = transferMarket.processAITransfers(
            //   updatedAITeams,
            //   gameState.season.currentWeek
            // );
            // updatedAITeams = aiTransferResult.teams;
          }

          // Board evaluation - TODO: Implement evaluateManager method
          // const boardEvaluation = boardManager.evaluateManager(
          //   updatedPlayerTeam,
          //   gameState.boardStatus,
          //   updatedLeagueTable,
          //   currentWeek,
          //   gameState.season.totalWeeks
          // );

          // Check for end of season
          const isEndOfSeason = currentWeek >= gameState.season.totalWeeks;

          let newSeasonEvaluation: SeasonEvaluation | null = null;
          let newSeasonTopPerformers: SeasonTopPerformers | null = null;
          const newDevelopmentReports: DevelopmentReport[] = [];
          const newYouthProspects: Player[] = [];
          let newAchievements: Achievement[] = [];

          if (isEndOfSeason) {
            // Calculate season top performers
            const playersWithGoals = updatedPlayerTeam.players.filter(p => p.stats.goals > 0);
            const playersWithAssists = updatedPlayerTeam.players.filter(p => p.stats.assists > 0);

            newSeasonTopPerformers = {
              topScorer: playersWithGoals.length > 0
                ? playersWithGoals.reduce((prev, current) =>
                    current.stats.goals > prev.stats.goals ? current : prev
                  )
                : updatedPlayerTeam.players[0],
              topAssister: playersWithAssists.length > 0
                ? playersWithAssists.reduce((prev, current) =>
                    current.stats.assists > prev.stats.assists ? current : prev
                  )
                : updatedPlayerTeam.players[0],
              playerOfSeason: updatedPlayerTeam.players[0], // TODO: Implement rating system
            };

            // Season evaluation
            const finalPosition =
              updatedLeagueTable.findIndex((t) => t.teamId === updatedPlayerTeam.id) + 1;
            // TODO: Implement proper board evaluation with objectives
            const satisfied = finalPosition <= 10; // Simple placeholder: top half = satisfied

            newSeasonEvaluation = {
              objective: `Finish in top ${gameState.boardStatus.minimumLeaguePosition || 10}`,
              satisfied,
              sacked: false, // TODO: Implement job security system
              message: satisfied
                ? 'Excellent work this season! The board is very pleased with your performance.'
                : 'The board is disappointed with this season\'s results.',
            };

            // Check for records broken - TODO: Fix updateRecords signature
            // const recordsResult = recordsManager.updateClubRecords(
            //   gameState.clubRecords,
            //   updatedPlayerTeam,
            //   gameState.season.year
            // );

            // Check for achievements
            const updatedGameState = {
              ...gameState,
              playerTeam: updatedPlayerTeam,
              aiTeams: updatedAITeams,
              leagueTable: updatedLeagueTable,
              matchHistory: updatedMatchHistory,
            };
            achievementManager.checkAchievements(updatedGameState, gameState.achievements);
            // Achievements are updated in-place
          }

          // Advance week
          const nextWeek = currentWeek + 1;
          const updatedSeason = {
            ...gameState.season,
            currentWeek: nextWeek,
            phase: seasonManager.getSeasonPhase(nextWeek),
            transferWindow: seasonManager.getTransferWindowStatus(nextWeek),
          };

          // Set simulation results in orchestrator store
          set(
            {
              lastSimulationResults: matchResults,
              seasonTopPerformers: newSeasonTopPerformers,
              seasonEvaluation: newSeasonEvaluation,
              developmentReports: newDevelopmentReports,
              pendingAchievements: [...get().pendingAchievements, ...newAchievements],
              youthProspects: newYouthProspects,
            },
            false,
            'orchestrator/setSimulationResults'
          );

          // Update game state
          useGameStore.getState().updateGameState((state) => ({
            ...state,
            season: updatedSeason,
            playerTeam: updatedPlayerTeam,
            aiTeams: updatedAITeams,
            fixtures: updatedFixtures,
            leagueTable: updatedLeagueTable,
            matchHistory: updatedMatchHistory,
            cupCompetition: updatedCupCompetition,
            finances: updatedFinances,
            newsFeed: allNews.slice(0, 100), // Limit news feed to 100 items
          }));

          // Auto-save after simulation
          await useSaveStore.getState().autoSave();
        } catch (error) {
          console.error('Simulation error:', error);
          useUIStore.getState().addNotification({
            type: 'error',
            message: 'Error during simulation. Please try again.',
            duration: 5000,
          });
        } finally {
          // Clear simulating state
          set({ isSimulating: false }, false, 'orchestrator/simulateEnd');
          useUIStore.getState().setSimulating(false);
        }
      },

      continueToNextSeason: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        try {
          // Initialize managers
          const seasonManager = new SeasonManager();
          const playerDevelopment = new PlayerDevelopment();
          const contractManager = new ContractManager();
          const youthAcademyManager = new YouthAcademyManager();
          const financeEngine = new FinanceEngine();

          // TODO: Implement end of season processing
          // Process end of season
          // const nextSeasonResult = seasonManager.startNewSeason(...);
          // For now, just reset to week 1
          console.log('End of season reached - functionality not yet implemented');

          // Update game state for new season - TODO: Implement properly
          // For now, just notify that end of season was reached
          // useGameStore.getState().updateGameState((state) => ({
          //   ...state,
          //   season: { ...state.season, currentWeek: 1 },
          // }));

          // Clear season evaluation
          set(
            {
              seasonEvaluation: null,
              seasonTopPerformers: null,
              developmentReports: [],
            },
            false,
            'orchestrator/clearSeasonEvaluation'
          );

          // Auto-save
          useSaveStore.getState().autoSave();
        } catch (error) {
          console.error('Error continuing to next season:', error);
          useUIStore.getState().addNotification({
            type: 'error',
            message: 'Error starting new season. Please try again.',
            duration: 5000,
          });
        }
      },

      clearSimulationResults: () =>
        set(
          { lastSimulationResults: [] },
          false,
          'orchestrator/clearSimulationResults'
        ),

      clearSeasonEvaluation: () =>
        set(
          { seasonEvaluation: null },
          false,
          'orchestrator/clearSeasonEvaluation'
        ),

      clearDevelopmentReports: () =>
        set(
          { developmentReports: [] },
          false,
          'orchestrator/clearDevelopmentReports'
        ),

      dismissAchievement: (id: string) =>
        set(
          (state) => ({
            pendingAchievements: state.pendingAchievements.filter((a) => a.id !== id),
          }),
          false,
          'orchestrator/dismissAchievement'
        ),

      selectYouthPlayers: (playerIds: string[]) => {
        // Clear youth prospects
        set({ youthProspects: [] }, false, 'orchestrator/selectYouthPlayers');

        if (playerIds.length === 0) return;

        // Add selected players to squad (handled by player store or game state update)
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const selectedPlayers = get().youthProspects.filter((p) =>
          playerIds.includes(p.id)
        );

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: [...state.playerTeam.players, ...selectedPlayers],
          },
        }));
      },

      resetOrchestrator: () => set(initialState, false, 'orchestrator/reset'),
    }),
    { name: 'GameOrchestratorStore' }
  )
);

/**
 * Selectors
 */
export const orchestratorSelectors = {
  lastResults: (state: GameOrchestratorStore) => state.lastSimulationResults,
  hasResults: (state: GameOrchestratorStore) => state.lastSimulationResults.length > 0,
  developmentReports: (state: GameOrchestratorStore) => state.developmentReports,
  seasonTopPerformers: (state: GameOrchestratorStore) => state.seasonTopPerformers,
  seasonEvaluation: (state: GameOrchestratorStore) => state.seasonEvaluation,
  pendingAchievements: (state: GameOrchestratorStore) => state.pendingAchievements,
  youthProspects: (state: GameOrchestratorStore) => state.youthProspects,
  isSimulating: (state: GameOrchestratorStore) => state.isSimulating,
};
