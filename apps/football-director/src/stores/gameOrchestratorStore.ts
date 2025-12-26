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
  NewsGenerator,
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
          const newsGenerator = new NewsGenerator();
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
          const weeklyNews = newsGenerator.generateWeeklyNews(
            gameState.season.currentWeek,
            gameState.season.phase,
            gameState.playerTeam,
            updatedPlayerTeam, // use updated team for injury/recovery news
            gameState.leagueTable,
            gameState.fixtures,
            gameState.season.transferWindow,
            gameState.finances.budget
          );

          let allNews = [...weeklyNews, ...gameState.newsFeed];

          // Simulate matches if it's a match week
          let matchResults: MatchResult[] = [];
          let updatedFixtures = gameState.fixtures;
          let updatedLeagueTable = gameState.leagueTable;
          let updatedMatchHistory = gameState.matchHistory;
          let cupResults: CupResult[] = [];
          let updatedCupData = gameState.cupData;

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
                  : updatedAITeams.find((t) => t.id === fixture.homeTeamId)!;
              const awayTeam =
                fixture.awayTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.awayTeamId)!;

              return matchPreviewGenerator.generatePreview(
                fixture,
                homeTeam,
                awayTeam,
                gameState.leagueTable
              );
            });

            // Simulate each match
            matchResults = weekFixtures.map((fixture) => {
              const homeTeam =
                fixture.homeTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.homeTeamId)!;
              const awayTeam =
                fixture.awayTeamId === updatedPlayerTeam.id
                  ? updatedPlayerTeam
                  : updatedAITeams.find((t) => t.id === fixture.awayTeamId)!;

              return simulator.simulateMatch(homeTeam, awayTeam, fixture);
            });

            // Update player stats from match results
            matchResults.forEach((result) => {
              if (result.homeTeamId === updatedPlayerTeam.id) {
                updatedPlayerTeam = statsTracker.updatePlayerStats(
                  updatedPlayerTeam,
                  result,
                  'home'
                );
              } else if (result.awayTeamId === updatedPlayerTeam.id) {
                updatedPlayerTeam = statsTracker.updatePlayerStats(
                  updatedPlayerTeam,
                  result,
                  'away'
                );
              }

              // Update AI team stats
              updatedAITeams = updatedAITeams.map((team) => {
                if (team.id === result.homeTeamId) {
                  return statsTracker.updatePlayerStats(team, result, 'home');
                } else if (team.id === result.awayTeamId) {
                  return statsTracker.updatePlayerStats(team, result, 'away');
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
            updatedLeagueTable = tableManager.updateTable(
              gameState.leagueTable,
              matchResults
            );

            // Mark fixtures as played
            updatedFixtures = gameState.fixtures.map((fixture) => {
              const played = matchResults.find((r) => r.fixtureId === fixture.id);
              return played ? { ...fixture, played: true } : fixture;
            });

            // Add to match history (limit to 76 matches)
            updatedMatchHistory = [...matchResults, ...gameState.matchHistory].slice(0, 76);

            // Generate post-match news
            const postMatchNews = matchResults.flatMap((result) => {
              const isPlayerTeam =
                result.homeTeamId === updatedPlayerTeam.id ||
                result.awayTeamId === updatedPlayerTeam.id;

              if (!isPlayerTeam) return [];

              const fixture = weekFixtures.find((f) => f.id === result.fixtureId)!;
              return postMatchGenerator.generatePostMatchNews(
                result,
                fixture,
                updatedPlayerTeam,
                gameState.leagueTable
              );
            });

            allNews = [...postMatchNews, ...allNews];

            // Handle cup matches if any
            const cupFixtures = weekFixtures.filter((f) => f.isCupMatch);
            if (cupFixtures.length > 0) {
              cupResults = cupFixtures.map((fixture) => {
                const matchResult = matchResults.find((r) => r.fixtureId === fixture.id)!;
                return cupManager.processCupResult(
                  gameState.cupData,
                  fixture,
                  matchResult
                );
              });

              // Update cup data
              cupResults.forEach((cupResult) => {
                updatedCupData = cupResult.cupData;
              });
            }
          }

          // Weekly finances
          const financeResult = financeEngine.processWeeklyFinances(
            gameState.finances,
            updatedPlayerTeam,
            currentWeek
          );

          // AI contract renewals and transfers during transfer windows
          if (gameState.season.transferWindow === 'open') {
            updatedAITeams = updatedAITeams.map((team) => {
              // AI contract management
              const contractResult = aiContractManager.processAIContracts(
                team,
                gameState.season.currentWeek,
                gameState.season.year
              );
              return contractResult.team;
            });

            // AI transfers
            const aiTransferResult = transferMarket.processAITransfers(
              updatedAITeams,
              gameState.season.currentWeek
            );
            updatedAITeams = aiTransferResult.teams;
          }

          // Board evaluation
          const boardEvaluation = boardManager.evaluateManager(
            updatedPlayerTeam,
            gameState.boardStatus,
            updatedLeagueTable,
            currentWeek,
            gameState.season.totalWeeks
          );

          // Check for end of season
          const isEndOfSeason = seasonManager.isEndOfSeason(
            currentWeek,
            gameState.season.totalWeeks
          );

          let newSeasonEvaluation: SeasonEvaluation | null = null;
          let newSeasonTopPerformers: SeasonTopPerformers | null = null;
          const newDevelopmentReports: DevelopmentReport[] = [];
          const newYouthProspects: Player[] = [];
          let newAchievements: Achievement[] = [];

          if (isEndOfSeason) {
            // Calculate season top performers
            newSeasonTopPerformers = {
              topScorer: updatedPlayerTeam.players.reduce((prev, current) =>
                current.stats.goals > prev.stats.goals ? current : prev
              ),
              topAssister: updatedPlayerTeam.players.reduce((prev, current) =>
                current.stats.assists > prev.stats.assists ? current : prev
              ),
              playerOfSeason: updatedPlayerTeam.players.reduce((prev, current) =>
                current.stats.averageRating > prev.stats.averageRating ? current : prev
              ),
            };

            // Season evaluation
            const finalPosition =
              updatedLeagueTable.findIndex((t) => t.teamId === updatedPlayerTeam.id) + 1;
            const objective = gameState.boardStatus.seasonObjective;
            const satisfied =
              boardManager.isObjectiveMet(objective, finalPosition) &&
              boardEvaluation.status.satisfaction >= 40;

            newSeasonEvaluation = {
              objective,
              satisfied,
              sacked: !satisfied && boardEvaluation.status.jobSecurity === 'critical',
              message: satisfied
                ? 'Excellent work this season! The board is very pleased with your performance.'
                : 'The board is disappointed with this season\'s results.',
            };

            // Check for records broken
            const recordsResult = recordsManager.updateRecords(
              gameState.clubRecords,
              gameState.seasonRecords,
              updatedPlayerTeam,
              gameState.season.year,
              matchResults
            );

            if (recordsResult.brokenRecords.length > 0) {
              newSeasonEvaluation.brokenRecords = recordsResult.brokenRecords;
            }

            // Check for achievements
            const achievementResults = achievementManager.checkAchievements(
              gameState.achievements,
              {
                season: gameState.season,
                playerTeam: updatedPlayerTeam,
                leagueTable: updatedLeagueTable,
                matchHistory: updatedMatchHistory,
                cupData: updatedCupData,
              }
            );

            newAchievements = achievementResults.newAchievements;
          }

          // Advance week
          const nextWeek = currentWeek + 1;
          const updatedSeason = seasonManager.advanceWeek(gameState.season);

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
            cupData: updatedCupData,
            finances: financeResult.finances,
            boardStatus: boardEvaluation.status,
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

          // Process end of season
          const nextSeasonResult = seasonManager.startNewSeason(
            gameState.season,
            gameState.playerTeam,
            gameState.aiTeams,
            gameState.leagueTable
          );

          // Player development (aging + skill changes)
          const developmentResult = playerDevelopment.developPlayers(
            nextSeasonResult.playerTeam.players,
            gameState.season.year
          );

          // Process contract expiries
          const playerContractResult = contractManager.processEndOfSeason(
            { ...nextSeasonResult.playerTeam, players: developmentResult.players },
            gameState.season.currentWeek,
            gameState.season.year
          );

          // Youth academy graduates
          const youthResult = youthAcademyManager.selectYouthGraduates(
            gameState.youthAcademy,
            []
          );

          // Award prize money
          const finalPosition =
            gameState.leagueTable.findIndex((t) => t.teamId === gameState.playerTeam.id) + 1;
          const prizeMoney = financeEngine.calculatePrizeMoney(finalPosition);
          const updatedFinances = {
            ...gameState.finances,
            budget: gameState.finances.budget + prizeMoney,
          };

          // Update game state for new season
          useGameStore.getState().updateGameState((state) => ({
            ...state,
            season: nextSeasonResult.season,
            playerTeam: {
              ...playerContractResult.team,
              players: [...playerContractResult.team.players, ...youthResult.selectedPlayers],
            },
            aiTeams: nextSeasonResult.aiTeams,
            fixtures: nextSeasonResult.fixtures,
            leagueTable: nextSeasonResult.leagueTable,
            finances: updatedFinances,
            youthAcademy: youthResult.academy,
          }));

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
