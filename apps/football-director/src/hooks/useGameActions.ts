/**
 * Football Director - useGameActions Hook
 * User actions (buy, sell, hire, fire, tactics, contracts, etc.)
 */

'use client';

import { useCallback } from 'react';
import {
  GameState,
  TransferMarket,
  TransferListing,
  Player,
  Staff,
  StaffManager,
  TacticsManager,
  Tactics,
  ClubPhilosophy,
  ContractManager,
  YouthAcademyManager,
  NewsGenerator,
  Achievement,
  SeasonManager,
  LeagueTableManager,
} from '@playground/football-director-engine';
import { SaveService } from '../services/SaveService';

/**
 * Hook for managing user actions
 *
 * @param gameState - Current game state
 * @param setGameState - Function to update game state
 * @param setError - Function to set error message
 * @param setPendingAchievements - Function to update pending achievements
 * @param setYouthProspects - Function to update youth prospects
 * @returns User action callbacks
 */
export function useGameActions(
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  setError: (error: string | null) => void,
  setPendingAchievements: React.Dispatch<React.SetStateAction<Achievement[]>>,
  setYouthProspects: React.Dispatch<React.SetStateAction<Player[]>>
) {
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
          gameState.transferMarket,
          gameState.season.currentWeek
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
    [gameState, setGameState, setError]
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
    [gameState, setGameState, setError]
  );

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
    [gameState, setGameState, setError]
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
    [gameState, setGameState, setError]
  );

  /**
   * Update team tactics (formation, mentality, roles, instructions, set pieces)
   */
  const setTeamTactics = useCallback(
    (tactics: Tactics) => {
      if (!gameState) return;

      try {
        const tacticsManager = new TacticsManager();
        const updatedTeam = tacticsManager.setTeamTactics(gameState.playerTeam, tactics);

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
    [gameState, setGameState, setError]
  );

  /**
   * Update club philosophy
   */
  const setClubPhilosophy = useCallback(
    (philosophy: ClubPhilosophy) => {
      if (!gameState) return;

      try {
        const updatedTeam = {
          ...gameState.playerTeam,
          philosophy,
        };

        const updatedState = {
          ...gameState,
          playerTeam: updatedTeam,
        };

        setGameState(updatedState);
        SaveService.saveGame(updatedState);

        setError(null);
      } catch (err) {
        setError('Failed to update club philosophy');
        console.error(err);
      }
    },
    [gameState, setGameState, setError]
  );

  /**
   * Offer a contract to a player
   */
  const offerContract = useCallback(
    (player: Player, weeklyWage: number, contractYears: number) => {
      if (!gameState) return;

      try {
        const contractManager = new ContractManager();
        const demands = contractManager.calculatePlayerDemands(player);

        // Reject if too low
        if (weeklyWage < demands.minWage) {
          setError(`${player.name} rejected - wage too low (minimum £${demands.minWage.toLocaleString()}/wk)`);
          return;
        }

        // Acceptance chance (higher wage = higher chance)
        const acceptChance = weeklyWage >= demands.minWage * 1.1 ? 1.0 : 0.7;
        if (Math.random() > acceptChance) {
          setError(`${player.name} rejected your offer`);
          return;
        }

        // Accept contract
        const updatedPlayer = contractManager.acceptContractOffer(
          player,
          weeklyWage,
          contractYears,
          gameState.season.year,
          gameState.season.currentWeek
        );

        setGameState({
          ...gameState,
          playerTeam: {
            ...gameState.playerTeam,
            players: gameState.playerTeam.players.map((p) =>
              p.id === player.id ? updatedPlayer : p
            ),
          },
        });

        setError(null);
      } catch (err) {
        setError('Failed to offer contract');
        console.error(err);
      }
    },
    [gameState, setGameState, setError]
  );

  /**
   * Select youth players to add to team
   */
  const selectYouthPlayers = useCallback(
    (selectedPlayers: Player[]) => {
      if (!gameState) return;

      try {
        const youthAcademyManager = new YouthAcademyManager();

        // Add selected players to team
        const updatedTeam = youthAcademyManager.addYouthPlayersToTeam(
          gameState.playerTeam,
          selectedPlayers
        );

        // Generate news if any players were selected
        let updatedNews = gameState.newsFeed || [];
        if (selectedPlayers.length > 0) {
          const newsGenerator = new NewsGenerator();
          const youthNews = newsGenerator.generateYouthAcademyNews(
            selectedPlayers,
            gameState.playerTeam.name,
            gameState.season.currentWeek,
            gameState.season.year
          );
          updatedNews = [youthNews, ...updatedNews];
        }

        const newState = {
          ...gameState,
          playerTeam: updatedTeam,
          newsFeed: updatedNews,
        };

        setGameState(newState);
        SaveService.saveGame(newState);
        setYouthProspects([]);
        setError(null);
      } catch (err) {
        setError('Failed to add youth players');
        console.error(err);
      }
    },
    [gameState, setGameState, setError, setYouthProspects]
  );

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
  }, [gameState, setGameState]);

  /**
   * Continue to next season after season ends
   */
  const continueToNextSeason = useCallback(() => {
    if (!gameState || gameState.season.status !== 'completed') return;

    try {
      const seasonManager = new SeasonManager();
      const tableManager = new LeagueTableManager();
      const transferMarket = new TransferMarket();

      // Generate new season fixtures (competitive + friendlies)
      const competitiveFixtures = seasonManager.generateFixtures([gameState.playerTeam, ...gameState.aiTeams]);
      const friendlyFixtures = seasonManager.generateFriendlyFixtures([gameState.playerTeam, ...gameState.aiTeams]);
      const newFixtures = [...friendlyFixtures, ...competitiveFixtures];

      // Reset league table for new season
      const newTable = tableManager.initializeTable([gameState.playerTeam, ...gameState.aiTeams]);

      // Generate fresh transfer market for new season (week 1 = pre-season, transfer window open)
      const newMarket = transferMarket.generateMarket(gameState.aiTeams, 1, 15);

      // Update game state with new season
      setGameState({
        ...gameState,
        season: {
          year: gameState.season.year + 1,
          currentWeek: 1,
          totalWeeks: 52,
          competitiveWeeks: 38,
          preSeasonWeeks: 7,
          status: 'in-progress',
          phase: 'pre-season',
          transferWindow: 'open',
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
  }, [gameState, setGameState, setError]);

  /**
   * Dismiss an achievement toast
   */
  const dismissAchievement = useCallback((achievementId: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.id !== achievementId));
  }, [setPendingAchievements]);

  return {
    buyPlayer,
    sellPlayer,
    hireStaff,
    fireStaff,
    setTeamTactics,
    setClubPhilosophy,
    offerContract,
    selectYouthPlayers,
    markAllNewsRead,
    continueToNextSeason,
    dismissAchievement,
  };
}
