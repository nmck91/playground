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
  globalRegistry,
  ModuleKeys,
  type IMatchSimulator,
  type ILeagueTableManager,
  type IFinanceEngine,
  type ISeasonManager,
  type IPlayerStatsTracker,
  type IInjuryManager,
  // type IContractManager, // Reserved for future use
  type IMoraleManager,
  type IAIContractManager,
  // type ITransferMarket, // Reserved for AI transfers feature
  // type IBoardManager, // Reserved for board evaluation feature
  type INewsEngine,
  // type IPlayerDevelopment, // Reserved for player development feature
  // type IYouthAcademyManager, // Reserved for youth academy feature
  // type IRecordsManager, // Reserved for club records feature
  type IAchievementManager,
  // type IMatchStoryGenerator, // Reserved for match preview feature
  type ICupManager,
  type MatchResult,
  type CupResult,
  type Team,
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
  selectYouthPlayers: (selectedPlayers: Player[]) => void;

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
          // Get engine managers from registry (singletons)
          const simulator = globalRegistry.get<IMatchSimulator>(ModuleKeys.MATCH_SIMULATOR);
          const tableManager = globalRegistry.get<ILeagueTableManager>(ModuleKeys.LEAGUE_TABLE_MANAGER);
          const financeEngine = globalRegistry.get<IFinanceEngine>(ModuleKeys.FINANCE_ENGINE);
          const seasonManager = globalRegistry.get<ISeasonManager>(ModuleKeys.SEASON_MANAGER);
          const statsTracker = globalRegistry.get<IPlayerStatsTracker>(ModuleKeys.PLAYER_STATS_TRACKER);
          const injuryManager = globalRegistry.get<IInjuryManager>(ModuleKeys.INJURY_MANAGER);
          // const contractManager = globalRegistry.get<IContractManager>(ModuleKeys.CONTRACT_MANAGER);
          const moraleManager = globalRegistry.get<IMoraleManager>(ModuleKeys.MORALE_MANAGER);
          const aiContractManager = globalRegistry.get<IAIContractManager>(ModuleKeys.AI_CONTRACT_MANAGER);
          // const transferMarket = globalRegistry.get<ITransferMarket>(ModuleKeys.TRANSFER_MARKET);
          // const boardManager = globalRegistry.get<IBoardManager>(ModuleKeys.BOARD_MANAGER);
          const newsEngine = globalRegistry.get<INewsEngine>(ModuleKeys.NEWS_ENGINE);
          // const playerDevelopment = globalRegistry.get<IPlayerDevelopment>(ModuleKeys.PLAYER_DEVELOPMENT);
          // const youthAcademyManager = globalRegistry.get<IYouthAcademyManager>(ModuleKeys.YOUTH_ACADEMY_MANAGER);
          // const recordsManager = globalRegistry.get<IRecordsManager>(ModuleKeys.RECORDS_MANAGER);
          const achievementManager = globalRegistry.get<IAchievementManager>(ModuleKeys.ACHIEVEMENT_MANAGER);
          // const matchStoryGenerator = globalRegistry.get<IMatchStoryGenerator>(ModuleKeys.MATCH_STORY_GENERATOR);
          const cupManager = globalRegistry.get<ICupManager>(ModuleKeys.CUP_MANAGER);

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
          // let cupResults: any[] = []; // Reserved for cup simulation
          let updatedCupCompetition = gameState.cupCompetition;
          let updatedLeagueCupCompetition = gameState.leagueCupCompetition;
          let cupPrizeTransactions: typeof gameState.finances.transactions = [];

          if (hasMatches) {
            // Get this week's fixtures
            const weekFixtures = gameState.fixtures.filter(
              (f) => f.week === currentWeek && !f.played
            );

            // Generate match previews (Reserved for match preview feature)
            // const previews = weekFixtures.map((fixture) => {
            //   const homeTeam =
            //     fixture.homeTeamId === updatedPlayerTeam.id
            //       ? updatedPlayerTeam
            //       : updatedAITeams.find((t) => t.id === fixture.homeTeamId);
            //   const awayTeam =
            //     fixture.awayTeamId === updatedPlayerTeam.id
            //       ? updatedPlayerTeam
            //       : updatedAITeams.find((t) => t.id === fixture.awayTeamId);

            //   if (!homeTeam || !awayTeam) {
            //     throw new Error(`Missing team for preview: home=${fixture.homeTeamId}, away=${fixture.awayTeamId}`);
            //   }

            //   return matchStoryGenerator.generatePreview(
            //     fixture,
            //     homeTeam,
            //     awayTeam,
            //     gameState.leagueTable,
            //     gameState.fixtures,
            //     currentWeek,
            //     Date.now() + parseInt(fixture.id.slice(-4))
            //   );
            // });

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

              return simulator.simulateMatch(match, currentWeek, undefined, fixture.matchType);
            });

            // Update player stats from COMPETITIVE match results only (league matches)
            // Friendly matches don't count toward player stats
            const competitiveResults = matchResults.filter(r => r.matchType === 'competitive');

            competitiveResults.forEach((result) => {
              if (result.homeTeam === updatedPlayerTeam.name) {
                updatedPlayerTeam = statsTracker.processTeamMatchStats(
                  updatedPlayerTeam,
                  result,
                  result.events || [],
                  true
                );
              } else if (result.awayTeam === updatedPlayerTeam.name) {
                updatedPlayerTeam = statsTracker.processTeamMatchStats(
                  updatedPlayerTeam,
                  result,
                  result.events || [],
                  false
                );
              }

              // Update AI team stats
              updatedAITeams = updatedAITeams.map((team) => {
                if (team.name === result.homeTeam) {
                  return statsTracker.processTeamMatchStats(team, result, result.events || [], true);
                } else if (team.name === result.awayTeam) {
                  return statsTracker.processTeamMatchStats(team, result, result.events || [], false);
                }
                return team;
              });
            });

            // Process injuries from matches
            matchResults.forEach((result) => {
              if (result.homeTeam === updatedPlayerTeam.name) {
                const injuryResult = injuryManager.processMatchInjuries(
                  updatedPlayerTeam,
                  currentWeek
                );
                updatedPlayerTeam = injuryResult.team;
              } else if (result.awayTeam === updatedPlayerTeam.name) {
                const injuryResult = injuryManager.processMatchInjuries(
                  updatedPlayerTeam,
                  currentWeek
                );
                updatedPlayerTeam = injuryResult.team;
              }

              // Process AI team injuries
              updatedAITeams = updatedAITeams.map((team) => {
                if (team.name === result.homeTeam) {
                  const injuryResult = injuryManager.processMatchInjuries(team, currentWeek);
                  return injuryResult.team;
                } else if (team.name === result.awayTeam) {
                  const injuryResult = injuryManager.processMatchInjuries(team, currentWeek);
                  return injuryResult.team;
                }
                return team;
              });
            });

            // Update league table with COMPETITIVE matches only (league matches)
            // Friendly matches don't count toward league standings
            updatedLeagueTable = competitiveResults.reduce(
              (table, result) => tableManager.updateTable(table, result),
              gameState.leagueTable
            );

            // Mark fixtures as played (ONLY for current week!)
            const playedFixtureIds = new Set(weekFixtures.map(f => f.id));
            updatedFixtures = gameState.fixtures.map((fixture) => {
              // Only mark fixtures from this week as played
              if (playedFixtureIds.has(fixture.id)) {
                return { ...fixture, played: true };
              }
              return fixture;
            });

            // Add to match history (limit to 76 matches)
            updatedMatchHistory = [...matchResults, ...gameState.matchHistory].slice(0, 76);

            // Generate post-match news for player team matches
            const playerTeamResults = matchResults.filter(
              (result) =>
                result.homeTeam === updatedPlayerTeam.name ||
                result.awayTeam === updatedPlayerTeam.name
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

            // Handle FA Cup matches if any
            if (updatedCupCompetition && cupManager.hasCupFixturesThisWeek(updatedCupCompetition, currentWeek)) {
              const cupFixtures = cupManager.getCupFixturesForWeek(updatedCupCompetition, currentWeek);

              // Create array of all teams for lookups
              const allTeams: Team[] = [updatedPlayerTeam, ...updatedAITeams];

              // Simulate each cup match
              const cupResults: CupResult[] = [];
              for (const cupFixture of cupFixtures) {
                const homeTeam = allTeams.find(t => t.id === cupFixture.homeTeamId);
                const awayTeam = allTeams.find(t => t.id === cupFixture.awayTeamId);

                if (!homeTeam || !awayTeam) {
                  console.error(`Cup match teams not found: home=${cupFixture.homeTeamId}, away=${cupFixture.awayTeamId}`);
                  continue;
                }

                // Simulate knockout match (includes extra time and penalties if needed)
                const match = { homeTeam, awayTeam };
                const cupResult = simulator.simulateKnockoutMatch(match, currentWeek);
                cupResults.push(cupResult);

                // Update player stats for cup matches
                if (cupResult.homeTeam === updatedPlayerTeam.name) {
                  updatedPlayerTeam = statsTracker.processTeamMatchStats(
                    updatedPlayerTeam,
                    cupResult,
                    cupResult.events || [],
                    true
                  );
                } else if (cupResult.awayTeam === updatedPlayerTeam.name) {
                  updatedPlayerTeam = statsTracker.processTeamMatchStats(
                    updatedPlayerTeam,
                    cupResult,
                    cupResult.events || [],
                    false
                  );
                }

                // Update AI team stats for cup matches
                updatedAITeams = updatedAITeams.map((team) => {
                  if (team.name === cupResult.homeTeam) {
                    return statsTracker.processTeamMatchStats(
                      team,
                      cupResult,
                      cupResult.events || [],
                      true
                    );
                  } else if (team.name === cupResult.awayTeam) {
                    return statsTracker.processTeamMatchStats(
                      team,
                      cupResult,
                      cupResult.events || [],
                      false
                    );
                  }
                  return team;
                });

                // Update cup fixture with result
                const currentRound = updatedCupCompetition!.rounds.find(
                  r => r.roundNumber === updatedCupCompetition!.currentRound
                );
                if (currentRound) {
                  const fixtureIndex = currentRound.fixtures.findIndex(
                    f => f.id === cupFixture.id
                  );
                  if (fixtureIndex !== -1) {
                    currentRound.fixtures[fixtureIndex] = {
                      ...cupFixture,
                      played: true,
                      result: cupResult,
                    };
                  }
                }
              }

              // Update cup progress (marks round as complete if all fixtures played)
              updatedCupCompetition = cupManager.updateCupProgress(updatedCupCompetition!);

              // Award prize money for eliminated teams
              for (const cupResult of cupResults) {
                // If player's team lost, award them prize money for reaching this round
                if (cupResult.loserId === updatedPlayerTeam.id) {
                  const roundNumber = updatedCupCompetition!.currentRound;
                  const prizeAmount = cupManager.getPrizeMoney(
                    `round${roundNumber}`,
                    false
                  );

                  cupPrizeTransactions.push({
                    id: `cup-prize-${updatedCupCompetition!.id}-r${roundNumber}-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: prizeAmount,
                    description: `${updatedCupCompetition!.name} - Round ${roundNumber}`,
                    weekNumber: currentWeek,
                  });
                }
              }

              // Advance tournament to next round if current round is complete
              const currentRound = updatedCupCompetition!.rounds.find(
                r => r.roundNumber === updatedCupCompetition!.currentRound
              );
              if (currentRound?.completed) {
                updatedCupCompetition = cupManager.advanceTournament(
                  updatedCupCompetition!,
                  allTeams
                ) || updatedCupCompetition;
              }

              // Award winner and runner-up prizes if cup is complete
              if (cupManager.isCupComplete(updatedCupCompetition!) && updatedCupCompetition!.winner) {
                // Award runner-up prize
                if (updatedCupCompetition!.runnerUp?.teamId === updatedPlayerTeam.id) {
                  const runnerUpPrize = cupManager.getPrizeMoney('runnerUp', false);
                  cupPrizeTransactions.push({
                    id: `cup-prize-${updatedCupCompetition!.id}-runnerUp-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: runnerUpPrize,
                    description: `${updatedCupCompetition!.name} - Runner-up`,
                    weekNumber: currentWeek,
                  });
                }

                // Award winner prize
                if (updatedCupCompetition!.winner.teamId === updatedPlayerTeam.id) {
                  const winnerPrize = cupManager.getPrizeMoney('winner', true);
                  cupPrizeTransactions.push({
                    id: `cup-prize-${updatedCupCompetition!.id}-winner-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: winnerPrize,
                    description: `${updatedCupCompetition!.name} - Winners!`,
                    weekNumber: currentWeek,
                  });
                }
              }

              // Cup prize transactions will be added to finances in the weekly finances section below

              // Generate cup match news
              if (cupResults.length > 0) {
                const cupNews = newsEngine.generateCupMatchNews(
                  cupResults,
                  updatedPlayerTeam.name,
                  updatedCupCompetition!,
                  currentWeek,
                  gameState.season.year
                );
                allNews = [...cupNews, ...allNews];

                // Also add to match history for consistency
                updatedMatchHistory = [...cupResults, ...updatedMatchHistory].slice(0, 76);
              }
            }

            // Handle League Cup matches if any
            if (updatedLeagueCupCompetition && cupManager.hasCupFixturesThisWeek(updatedLeagueCupCompetition, currentWeek)) {
              const leagueCupFixtures = cupManager.getCupFixturesForWeek(updatedLeagueCupCompetition, currentWeek);

              // Create array of all teams for lookups
              const allTeams: Team[] = [updatedPlayerTeam, ...updatedAITeams];

              // Simulate each League Cup match
              const leagueCupResults: CupResult[] = [];
              for (const cupFixture of leagueCupFixtures) {
                const homeTeam = allTeams.find(t => t.id === cupFixture.homeTeamId);
                const awayTeam = allTeams.find(t => t.id === cupFixture.awayTeamId);

                if (!homeTeam || !awayTeam) {
                  console.error(`League Cup match teams not found: home=${cupFixture.homeTeamId}, away=${cupFixture.awayTeamId}`);
                  continue;
                }

                // Simulate knockout match
                const match = { homeTeam, awayTeam };
                const cupResult = simulator.simulateKnockoutMatch(match, currentWeek);
                leagueCupResults.push(cupResult);

                // Update player stats for League Cup matches
                if (cupResult.homeTeam === updatedPlayerTeam.name) {
                  updatedPlayerTeam = statsTracker.processTeamMatchStats(
                    updatedPlayerTeam,
                    cupResult,
                    cupResult.events || [],
                    true
                  );
                } else if (cupResult.awayTeam === updatedPlayerTeam.name) {
                  updatedPlayerTeam = statsTracker.processTeamMatchStats(
                    updatedPlayerTeam,
                    cupResult,
                    cupResult.events || [],
                    false
                  );
                }

                // Update AI team stats for League Cup matches
                updatedAITeams = updatedAITeams.map((team) => {
                  if (team.name === cupResult.homeTeam) {
                    return statsTracker.processTeamMatchStats(
                      team,
                      cupResult,
                      cupResult.events || [],
                      true
                    );
                  } else if (team.name === cupResult.awayTeam) {
                    return statsTracker.processTeamMatchStats(
                      team,
                      cupResult,
                      cupResult.events || [],
                      false
                    );
                  }
                  return team;
                });

                // Update League Cup fixture with result
                const currentRound = updatedLeagueCupCompetition!.rounds.find(
                  r => r.roundNumber === updatedLeagueCupCompetition!.currentRound
                );
                if (currentRound) {
                  const fixtureIndex = currentRound.fixtures.findIndex(
                    f => f.id === cupFixture.id
                  );
                  if (fixtureIndex !== -1) {
                    currentRound.fixtures[fixtureIndex] = {
                      ...cupFixture,
                      played: true,
                      result: cupResult,
                    };
                  }
                }
              }

              // Update League Cup progress
              updatedLeagueCupCompetition = cupManager.updateCupProgress(updatedLeagueCupCompetition!);

              // Award League Cup prize money
              for (const cupResult of leagueCupResults) {
                if (cupResult.loserId === updatedPlayerTeam.id) {
                  const roundNumber = updatedLeagueCupCompetition!.currentRound;
                  const prizeAmount = cupManager.getPrizeMoney(`round${roundNumber}`, false);

                  cupPrizeTransactions.push({
                    id: `league-cup-prize-${updatedLeagueCupCompetition!.id}-r${roundNumber}-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: prizeAmount,
                    description: `${updatedLeagueCupCompetition!.name} - Round ${roundNumber}`,
                    weekNumber: currentWeek,
                  });
                }
              }

              // Advance League Cup to next round if current round is complete
              const currentRound = updatedLeagueCupCompetition!.rounds.find(
                r => r.roundNumber === updatedLeagueCupCompetition!.currentRound
              );
              if (currentRound?.completed) {
                updatedLeagueCupCompetition = cupManager.advanceTournament(
                  updatedLeagueCupCompetition!,
                  allTeams
                ) || updatedLeagueCupCompetition;
              }

              // Award League Cup winner and runner-up prizes
              if (cupManager.isCupComplete(updatedLeagueCupCompetition!) && updatedLeagueCupCompetition!.winner) {
                if (updatedLeagueCupCompetition!.runnerUp?.teamId === updatedPlayerTeam.id) {
                  const runnerUpPrize = cupManager.getPrizeMoney('runnerUp', false);
                  cupPrizeTransactions.push({
                    id: `league-cup-prize-${updatedLeagueCupCompetition!.id}-runnerUp-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: runnerUpPrize,
                    description: `${updatedLeagueCupCompetition!.name} - Runner-up`,
                    weekNumber: currentWeek,
                  });
                }

                if (updatedLeagueCupCompetition!.winner.teamId === updatedPlayerTeam.id) {
                  const winnerPrize = cupManager.getPrizeMoney('winner', true);
                  cupPrizeTransactions.push({
                    id: `league-cup-prize-${updatedLeagueCupCompetition!.id}-winner-${Date.now()}`,
                    date: new Date(),
                    type: 'income',
                    category: 'prize-money',
                    amount: winnerPrize,
                    description: `${updatedLeagueCupCompetition!.name} - Winners!`,
                    weekNumber: currentWeek,
                  });
                }
              }

              // Generate League Cup match news
              if (leagueCupResults.length > 0) {
                const leagueCupNews = newsEngine.generateCupMatchNews(
                  leagueCupResults,
                  updatedPlayerTeam.name,
                  updatedLeagueCupCompetition!,
                  currentWeek,
                  gameState.season.year
                );
                allNews = [...leagueCupNews, ...allNews];

                // Also add to match history
                updatedMatchHistory = [...leagueCupResults, ...updatedMatchHistory].slice(0, 76);
              }
            }
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
          const cupPrizeIncome = cupPrizeTransactions.reduce((sum, t) => sum + t.amount, 0);
          const updatedFinances = {
            budget: financeResult.newBudget + cupPrizeIncome,
            weeklyIncome: gameState.finances.weeklyIncome,
            weeklyExpenses: gameState.finances.weeklyExpenses,
            totalIncome: gameState.finances.totalIncome + financeResult.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) + cupPrizeIncome,
            totalExpenses: gameState.finances.totalExpenses + financeResult.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            transactions: [...gameState.finances.transactions, ...financeResult.transactions, ...cupPrizeTransactions],
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
          const newDevelopmentReports: DevelopmentReport[] = [];
          const newYouthProspects: Player[] = [];
          let newAchievements: Achievement[] = [];

          // Calculate season top performers (updated every week, not just at end of season)
          const playersWithGoals = updatedPlayerTeam.players.filter(p => p.stats.goals > 0);
          const playersWithAssists = updatedPlayerTeam.players.filter(p => p.stats.assists > 0);
          const playersWithAppearances = updatedPlayerTeam.players.filter(p => p.stats.appearances > 0);
          const goalkeepersWithCleanSheets = updatedPlayerTeam.players.filter(p => p.position === 'GK' && p.stats.cleanSheets > 0);

          const topScorer = playersWithGoals.length > 0
            ? playersWithGoals.reduce((prev, current) =>
                current.stats.goals > prev.stats.goals ? current : prev
              )
            : null;

          const topAssister = playersWithAssists.length > 0
            ? playersWithAssists.reduce((prev, current) =>
                current.stats.assists > prev.stats.assists ? current : prev
              )
            : null;

          const mostAppearances = playersWithAppearances.length > 0
            ? playersWithAppearances.reduce((prev, current) =>
                current.stats.appearances > prev.stats.appearances ? current : prev
              )
            : null;

          const cleanSheetKing = goalkeepersWithCleanSheets.length > 0
            ? goalkeepersWithCleanSheets.reduce((prev, current) =>
                current.stats.cleanSheets > prev.stats.cleanSheets ? current : prev
              )
            : null;

          const newSeasonTopPerformers: SeasonTopPerformers = {
            topScorer: topScorer ? { player: topScorer, goals: topScorer.stats.goals } : null,
            topAssists: topAssister ? { player: topAssister, assists: topAssister.stats.assists } : null,
            mostAppearances: mostAppearances ? { player: mostAppearances, appearances: mostAppearances.stats.appearances } : null,
            cleanSheetKing: cleanSheetKing ? { player: cleanSheetKing, cleanSheets: cleanSheetKing.stats.cleanSheets } : null,
          };

          if (isEndOfSeason) {

            // Season evaluation
            const finalPosition =
              updatedLeagueTable.findIndex((t) => t.teamId === updatedPlayerTeam.id) + 1;
            const targetPosition = gameState.boardStatus.currentObjective?.target || 10;
            const satisfied = finalPosition <= targetPosition;

            const boardObjective: BoardObjective = {
              id: `season-${gameState.season.year}-objective`,
              season: gameState.season.year,
              type: 'league-position',
              target: targetPosition,
              description: `Finish in top ${targetPosition}`,
              status: satisfied ? 'achieved' : 'failed',
            };

            newSeasonEvaluation = {
              objective: boardObjective,
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
            // Check for newly unlocked achievements
            newAchievements = achievementManager.checkAchievements(updatedGameState, gameState.achievements);
          }

          // Advance week (but don't exceed totalWeeks to prevent validation errors)
          // If we're at end of season, keep week at current value until user continues to next season
          const nextWeek = isEndOfSeason ? currentWeek : currentWeek + 1;
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
            leagueCupCompetition: updatedLeagueCupCompetition,
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
          // Get managers from registry
          const seasonManager = globalRegistry.get<ISeasonManager>(ModuleKeys.SEASON_MANAGER);
          // const contractManager = globalRegistry.get<IContractManager>(ModuleKeys.CONTRACT_MANAGER);

          // 1. Archive current season to season records
          const currentPosition = gameState.leagueTable
            .sort((a, b) => {
              if (b.points !== a.points) return b.points - a.points;
              if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
              return b.goalsFor - a.goalsFor;
            })
            .findIndex((t) => t.teamId === gameState.playerTeam.id) + 1;

          const playerTableEntry = gameState.leagueTable.find(
            (t) => t.teamId === gameState.playerTeam.id
          );

          const newSeasonRecord = playerTableEntry
            ? {
                season: gameState.season.year,
                finalPosition: currentPosition,
                points: playerTableEntry.points,
                won: playerTableEntry.won,
                drawn: playerTableEntry.drawn,
                lost: playerTableEntry.lost,
                goalsFor: playerTableEntry.goalsFor,
                goalsAgainst: playerTableEntry.goalsAgainst,
                goalDifference: playerTableEntry.goalDifference,
                longestWinStreak: 0, // TODO: Track win streaks during season
                longestUnbeatenStreak: 0, // TODO: Track unbeaten streaks during season
                cleanSheets: 0, // TODO: Track team clean sheets during season
              }
            : undefined;

          const updatedSeasonRecords = newSeasonRecord
            ? [...gameState.seasonRecords, newSeasonRecord]
            : gameState.seasonRecords;

          // 2. Process contract expirations
          // Auto-renew expiring contracts to maintain minimum squad size
          const nextYear = gameState.season.year + 1;

          // Auto-renew contracts for player team to ensure minimum 11 players
          const renewedPlayerTeamPlayers = gameState.playerTeam.players.map((player) => {
            if (player.contract.expiryYear < nextYear) {
              // Contract expired - auto-renew for 1 year
              return {
                ...player,
                contract: {
                  ...player.contract,
                  endYear: nextYear,
                },
              };
            }
            return player;
          });

          // Auto-renew contracts for AI teams
          const updatedAITeams = gameState.aiTeams.map((team) => ({
            ...team,
            players: team.players.map((player) => {
              if (player.contract.expiryYear < nextYear) {
                // Contract expired - auto-renew for 1 year
                return {
                  ...player,
                  contract: {
                    ...player.contract,
                    endYear: nextYear,
                  },
                };
              }
              return player;
            }),
          }));

          // 3. Reset player stats for new season
          const resetPlayerStats = (players: typeof gameState.playerTeam.players) =>
            players.map((player) => ({
              ...player,
              stats: {
                // Reset current season stats
                appearances: 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0,
                cleanSheets: 0,
                // Preserve career stats
                careerAppearances: player.stats.careerAppearances || 0,
                careerGoals: player.stats.careerGoals || 0,
                careerAssists: player.stats.careerAssists || 0,
                careerCleanSheets: player.stats.careerCleanSheets || 0,
              },
            }));

          const updatedPlayerTeam = {
            ...gameState.playerTeam,
            players: resetPlayerStats(renewedPlayerTeamPlayers),
          };

          const updatedAITeamsWithResetStats = updatedAITeams.map((team) => ({
            ...team,
            players: resetPlayerStats(team.players),
          }));

          // 4. Reset league table
          const allTeams = [updatedPlayerTeam, ...updatedAITeamsWithResetStats];
          const resetLeagueTable = allTeams.map((team) => ({
            teamId: team.id,
            teamName: team.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            form: [] as ('W' | 'D' | 'L')[],
          }));

          // 5. Generate new fixtures
          const newFixtures = [
            ...seasonManager.generateFixtures(allTeams),
            ...seasonManager.generateFriendlyFixtures(allTeams),
          ];

          // 6. Update season
          const updatedSeason = {
            ...gameState.season,
            year: nextYear,
            currentWeek: 1,
            status: 'in-progress' as const,
            phase: 'pre-season' as const,
            transferWindow: 'open' as const,
          };

          // 7. Clear transient data
          const updatedMatchHistory: typeof gameState.matchHistory = []; // Clear for new season
          const updatedNewsFeed = gameState.newsFeed.slice(0, 20); // Keep only recent news

          // Update game state
          useGameStore.getState().updateGameState((state) => ({
            ...state,
            season: updatedSeason,
            playerTeam: updatedPlayerTeam,
            aiTeams: updatedAITeamsWithResetStats,
            leagueTable: resetLeagueTable,
            fixtures: newFixtures,
            matchHistory: updatedMatchHistory,
            seasonRecords: updatedSeasonRecords,
            newsFeed: updatedNewsFeed,
          }));

          // Clear season evaluation
          set(
            {
              seasonEvaluation: null,
              seasonTopPerformers: null,
              developmentReports: [],
              lastSimulationResults: [],
            },
            false,
            'orchestrator/continueToNextSeason'
          );

          // Notify user
          useUIStore.getState().addNotification({
            type: 'success',
            message: `Welcome to the ${nextYear}/${nextYear + 1} season!`,
            duration: 5000,
          });

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

      selectYouthPlayers: (selectedPlayers: Player[]) => {
        if (selectedPlayers.length === 0) {
          // Just clear youth prospects if no players selected
          set({ youthProspects: [] }, false, 'orchestrator/selectYouthPlayers');
          return;
        }

        // Add selected players to squad (handled by player store or game state update)
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            players: [...state.playerTeam.players, ...selectedPlayers],
          },
        }));

        // Clear youth prospects AFTER adding selected players to squad
        set({ youthProspects: [] }, false, 'orchestrator/selectYouthPlayers/clear');
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
