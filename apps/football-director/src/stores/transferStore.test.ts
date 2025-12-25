/**
 * Football Director - Transfer Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransferStore, transferSelectors } from './transferStore';
import { useGameStore } from './gameStore';
import { usePlayerStore } from './playerStore';
import { useFinanceStore } from './financeStore';
import type { TransferListing, Player, GameState, Team } from '@playground/football-director-engine';

// Mock player
const mockPlayer: Player = {
  id: 'player-1',
  name: 'Test Player',
  age: 25,
  position: 'midfielder',
  skill: 70,
  potential: 85,
  morale: 75,
  nationality: 'England',
  contract: {
    wage: 2,
    weeksRemaining: 52,
    bonuses: 0,
  },
  stats: {
    goals: 5,
    assists: 3,
    appearances: 20,
    yellowCards: 2,
    redCards: 0,
    averageRating: 7.2,
  },
  injury: null,
} as Player;

const mockFreeAgent: Player = {
  id: 'free-agent-1',
  name: 'Free Agent',
  age: 28,
  position: 'forward',
  skill: 65,
  potential: 70,
  morale: 60,
  nationality: 'Spain',
  contract: null,
  stats: {
    goals: 10,
    assists: 2,
    appearances: 30,
    yellowCards: 1,
    redCards: 0,
    averageRating: 7.0,
  },
  injury: null,
} as Player;

const mockExpensivePlayer: Player = {
  id: 'expensive-player-1',
  name: 'Star Player',
  age: 26,
  position: 'forward',
  skill: 90,
  potential: 95,
  morale: 80,
  nationality: 'Brazil',
  contract: {
    wage: 10,
    weeksRemaining: 104,
    bonuses: 0,
  },
  stats: {
    goals: 30,
    assists: 15,
    appearances: 40,
    yellowCards: 0,
    redCards: 0,
    averageRating: 8.5,
  },
  injury: null,
} as Player;

// Mock teams
const mockPlayerTeam: Team = {
  id: 'team-1',
  name: 'Test FC',
  budget: 50,
  players: [mockPlayer],
  staff: [],
  tactics: {} as any,
} as Team;

const mockOpponentTeam: Team = {
  id: 'team-2',
  name: 'Opponent FC',
  budget: 40,
  players: [mockExpensivePlayer],
  staff: [],
  tactics: {} as any,
} as Team;

const mockGameState: Partial<GameState> = {
  id: 'game-123',
  playerTeam: mockPlayerTeam,
  teams: [mockOpponentTeam],
  freeAgents: [mockFreeAgent],
  season: {
    currentWeek: 1,
    currentYear: 2024,
    weeksSinceSeasonStart: 0,
    leagueTable: [],
    fixtures: [],
  },
} as GameState;

const mockFreeAgentListing: TransferListing = {
  id: 'listing-free-agent-1',
  player: mockFreeAgent,
  sellingTeamId: 'free-agent',
  sellingTeamName: 'Free Agent',
  askingPrice: 0,
  listedWeek: 1,
};

const mockPaidListing: TransferListing = {
  id: 'listing-expensive-player-1',
  player: mockExpensivePlayer,
  sellingTeamId: 'team-2',
  sellingTeamName: 'Opponent FC',
  askingPrice: 100,
  listedWeek: 1,
};

describe('TransferStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    useTransferStore.setState({
      transferListings: [],
      marketLastRefreshed: null,
      selectedListing: null,
      showTransferModal: false,
    });
    useGameStore.setState({ gameState: null, gameId: null, currentSaveSlot: null, lastSaved: null });
    usePlayerStore.getState().syncFromGameState();
    useFinanceStore.getState().syncFromGameState();
  });

  describe('Sync from GameStore', () => {
    it('should sync from game state', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        useGameStore.getState().setGameState(mockGameState as GameState);
        result.current.syncFromGameState();
      });

      // TransferStore doesn't sync listings from GameState, this is intentional
      expect(result.current.transferListings).toHaveLength(0);
    });

    it('should clear state when no game', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.syncFromGameState();
      });

      expect(result.current.transferListings).toHaveLength(0);
    });
  });

  describe('Market Generation', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
      useFinanceStore.getState().syncFromGameState();
    });

    it('should generate transfer market', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.generateMarket();
      });

      expect(result.current.transferListings.length).toBeGreaterThan(0);
      expect(result.current.marketLastRefreshed).toBeInstanceOf(Date);
    });

    it('should include free agents in market', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.generateMarket();
      });

      const freeAgentListings = result.current.transferListings.filter(
        (l) => l.sellingTeamId === 'free-agent'
      );
      expect(freeAgentListings.length).toBeGreaterThan(0);
    });

    it('should refresh market', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.refreshMarket();
      });

      expect(result.current.transferListings.length).toBeGreaterThan(0);
      expect(result.current.marketLastRefreshed).toBeInstanceOf(Date);
    });

    it('should not generate market when no game state', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        useGameStore.getState().setGameState(null);
        result.current.generateMarket();
      });

      expect(result.current.transferListings).toHaveLength(0);
    });
  });

  describe('Player Buying', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
      useFinanceStore.getState().syncFromGameState();
    });

    it('should buy free agent successfully', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());
      const { result: financeResult } = renderHook(() => useFinanceStore());

      const initialBudget = financeResult.current.currentBudget;
      const initialSquadSize = playerResult.current.squadPlayers.length;

      let success: boolean;
      act(() => {
        transferResult.current.transferListings = [mockFreeAgentListing];
        success = transferResult.current.buyPlayer(mockFreeAgentListing);
      });

      expect(success!).toBe(true);
      expect(playerResult.current.squadPlayers.length).toBe(initialSquadSize + 1);
      // Free agent costs 0, budget should be unchanged
      expect(financeResult.current.currentBudget).toBe(initialBudget);
    });

    it('should buy paid player successfully', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());
      const { result: financeResult } = renderHook(() => useFinanceStore());

      // Create affordable listing
      const affordableListing: TransferListing = {
        ...mockPaidListing,
        askingPrice: 10, // Affordable
      };

      const initialBudget = financeResult.current.currentBudget;
      const initialSquadSize = playerResult.current.squadPlayers.length;

      let success: boolean;
      act(() => {
        transferResult.current.transferListings = [affordableListing];
        success = transferResult.current.buyPlayer(affordableListing);
      });

      expect(success!).toBe(true);
      expect(playerResult.current.squadPlayers.length).toBe(initialSquadSize + 1);
      expect(financeResult.current.currentBudget).toBe(initialBudget - 10);
    });

    it('should fail when cannot afford player', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());

      const initialSquadSize = playerResult.current.squadPlayers.length;

      let success: boolean;
      act(() => {
        transferResult.current.transferListings = [mockPaidListing];
        success = transferResult.current.buyPlayer(mockPaidListing); // £100m asking price
      });

      expect(success!).toBe(false);
      expect(playerResult.current.squadPlayers.length).toBe(initialSquadSize);
    });

    it('should fail when squad is full', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());

      // Fill squad to 30 players
      const fullSquad = Array.from({ length: 30 }, (_, i) => ({
        ...mockPlayer,
        id: `player-${i}`,
      }));

      act(() => {
        useGameStore.getState().setGameState({
          ...mockGameState,
          playerTeam: {
            ...mockPlayerTeam,
            players: fullSquad,
          },
        } as GameState);
        playerResult.current.syncFromGameState();
      });

      let success: boolean;
      act(() => {
        transferResult.current.transferListings = [mockFreeAgentListing];
        success = transferResult.current.buyPlayer(mockFreeAgentListing);
      });

      expect(success!).toBe(false);
      expect(playerResult.current.squadPlayers.length).toBe(30);
    });

    it('should remove listing from market after purchase', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());

      act(() => {
        transferResult.current.transferListings = [mockFreeAgentListing];
        transferResult.current.buyPlayer(mockFreeAgentListing);
      });

      expect(transferResult.current.transferListings).toHaveLength(0);
    });

    it('should remove player from free agents after purchase', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());

      act(() => {
        transferResult.current.transferListings = [mockFreeAgentListing];
        transferResult.current.buyPlayer(mockFreeAgentListing);
      });

      const gameState = useGameStore.getState().gameState;
      expect(gameState?.freeAgents?.length).toBe(0);
    });

    it('should assign 3-year contract to purchased player', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());

      act(() => {
        transferResult.current.transferListings = [mockFreeAgentListing];
        transferResult.current.buyPlayer(mockFreeAgentListing);
      });

      const purchasedPlayer = playerResult.current.getPlayerById('free-agent-1');
      expect(purchasedPlayer?.contract?.weeksRemaining).toBe(52 * 3); // 3 years
      // Wage is calculated as player.skill * 0.05 (65 * 0.05 = 3.25)
      expect(purchasedPlayer?.contract?.wage).toBe(mockFreeAgent.skill * 0.05);
    });

    it('should return false when no game state', () => {
      const { result } = renderHook(() => useTransferStore());

      let success: boolean;
      act(() => {
        useGameStore.getState().setGameState(null);
        success = result.current.buyPlayer(mockFreeAgentListing);
      });

      expect(success!).toBe(false);
    });
  });

  describe('Player Selling', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
      useFinanceStore.getState().syncFromGameState();
    });

    it('should sell player successfully', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());
      const { result: financeResult } = renderHook(() => useFinanceStore());

      const initialBudget = financeResult.current.currentBudget;
      const initialSquadSize = playerResult.current.squadPlayers.length;

      act(() => {
        transferResult.current.sellPlayer('player-1', 15);
      });

      expect(playerResult.current.squadPlayers.length).toBe(initialSquadSize - 1);
      expect(financeResult.current.currentBudget).toBe(initialBudget + 15);
    });

    it('should add sold player to free agents', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());

      act(() => {
        transferResult.current.sellPlayer('player-1', 15);
      });

      const gameState = useGameStore.getState().gameState;
      expect(gameState?.freeAgents?.length).toBe(2); // Original 1 + sold player
    });

    it('should not add to budget when selling for free', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: financeResult } = renderHook(() => useFinanceStore());

      const initialBudget = financeResult.current.currentBudget;

      act(() => {
        transferResult.current.sellPlayer('player-1', 0);
      });

      expect(financeResult.current.currentBudget).toBe(initialBudget);
    });

    it('should not sell non-existent player', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());
      const { result: playerResult } = renderHook(() => usePlayerStore());

      const initialSquadSize = playerResult.current.squadPlayers.length;

      act(() => {
        transferResult.current.sellPlayer('non-existent', 10);
      });

      expect(playerResult.current.squadPlayers.length).toBe(initialSquadSize);
    });

    it('should not sell when no game state', () => {
      const { result: transferResult } = renderHook(() => useTransferStore());

      act(() => {
        useGameStore.getState().setGameState(null);
        transferResult.current.sellPlayer('player-1', 10);
      });

      // When no game state, the function should exit early and do nothing
      // Just verify it doesn't crash
      expect(useGameStore.getState().gameState).toBeNull();
    });
  });

  describe('AI Transfers', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
      useFinanceStore.getState().syncFromGameState();
    });

    it('should process AI transfers', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.generateMarket();
        const initialListingCount = result.current.transferListings.length;
        result.current.processAITransfers();
        // AI transfers are random, so we can't guarantee exact results
        // Just verify it doesn't crash
        expect(result.current.transferListings.length).toBeLessThanOrEqual(initialListingCount);
      });
    });

    it('should not process AI transfers when no game state', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        useGameStore.getState().setGameState(null);
        result.current.processAITransfers();
      });

      expect(result.current.transferListings).toHaveLength(0);
    });
  });

  describe('Queries', () => {
    beforeEach(() => {
      useGameStore.getState().setGameState(mockGameState as GameState);
      usePlayerStore.getState().syncFromGameState();
      useFinanceStore.getState().syncFromGameState();

      // Set up test listings
      useTransferStore.setState({
        transferListings: [
          mockFreeAgentListing,
          mockPaidListing,
          {
            id: 'listing-defender',
            player: { ...mockPlayer, id: 'defender-1', position: 'defender', skill: 75 },
            sellingTeamId: 'team-3',
            sellingTeamName: 'Team 3',
            askingPrice: 20,
            listedWeek: 1,
          },
          {
            id: 'listing-goalkeeper',
            player: { ...mockPlayer, id: 'gk-1', position: 'goalkeeper', skill: 80 },
            sellingTeamId: 'team-4',
            sellingTeamName: 'Team 4',
            askingPrice: 30,
            listedWeek: 1,
          },
        ],
      });
    });

    it('should get all available listings', () => {
      const { result } = renderHook(() => useTransferStore());

      const listings = result.current.availableListings();
      expect(listings).toHaveLength(4);
    });

    it('should get affordable listings', () => {
      const { result } = renderHook(() => useTransferStore());

      const affordable = result.current.affordableListings(25);
      expect(affordable).toHaveLength(2); // Free agent (0) + defender (20)
    });

    it('should get listings by position - forward', () => {
      const { result } = renderHook(() => useTransferStore());

      const forwards = result.current.listingsByPosition('forward');
      expect(forwards).toHaveLength(2); // Free agent + expensive player
    });

    it('should get listings by position - defender', () => {
      const { result } = renderHook(() => useTransferStore());

      const defenders = result.current.listingsByPosition('defender');
      expect(defenders).toHaveLength(1);
    });

    it('should get listings by position - goalkeeper', () => {
      const { result } = renderHook(() => useTransferStore());

      const goalkeepers = result.current.listingsByPosition('goalkeeper');
      expect(goalkeepers).toHaveLength(1);
    });

    it('should get listings by skill range', () => {
      const { result } = renderHook(() => useTransferStore());

      const midRange = result.current.listingsBySkillRange(70, 80);
      expect(midRange.length).toBeGreaterThan(0);
      midRange.forEach((listing) => {
        expect(listing.player.skill).toBeGreaterThanOrEqual(70);
        expect(listing.player.skill).toBeLessThanOrEqual(80);
      });
    });

    it('should get listings by skill range - high skill', () => {
      const { result } = renderHook(() => useTransferStore());

      const highSkill = result.current.listingsBySkillRange(85, 95);
      expect(highSkill).toHaveLength(1); // Only expensive player
      expect(highSkill[0].player.skill).toBe(90);
    });
  });

  describe('UI State Management', () => {
    it('should set selected listing', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.setSelectedListing(mockFreeAgentListing);
      });

      expect(result.current.selectedListing).toEqual(mockFreeAgentListing);
    });

    it('should clear selected listing', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.setSelectedListing(mockFreeAgentListing);
        result.current.setSelectedListing(null);
      });

      expect(result.current.selectedListing).toBeNull();
    });

    it('should set show transfer modal', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.setShowTransferModal(true);
      });

      expect(result.current.showTransferModal).toBe(true);
    });

    it('should hide transfer modal', () => {
      const { result } = renderHook(() => useTransferStore());

      act(() => {
        result.current.setShowTransferModal(true);
        result.current.setShowTransferModal(false);
      });

      expect(result.current.showTransferModal).toBe(false);
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      useTransferStore.setState({
        transferListings: [
          mockFreeAgentListing,
          mockPaidListing,
          {
            id: 'listing-defender',
            player: { ...mockPlayer, id: 'defender-1', position: 'defender' },
            sellingTeamId: 'team-3',
            sellingTeamName: 'Team 3',
            askingPrice: 20,
            listedWeek: 1,
          },
          {
            id: 'listing-midfielder',
            player: { ...mockPlayer, id: 'midfielder-1', position: 'midfielder' },
            sellingTeamId: 'team-4',
            sellingTeamName: 'Team 4',
            askingPrice: 15,
            listedWeek: 1,
          },
          {
            id: 'listing-goalkeeper',
            player: { ...mockPlayer, id: 'gk-1', position: 'goalkeeper' },
            sellingTeamId: 'team-5',
            sellingTeamName: 'Team 5',
            askingPrice: 25,
            listedWeek: 1,
          },
        ],
        marketLastRefreshed: new Date(),
        selectedListing: mockFreeAgentListing,
        showTransferModal: true,
      });
    });

    it('should select all listings', () => {
      const { result } = renderHook(() => useTransferStore(transferSelectors.allListings));
      expect(result.current).toHaveLength(5);
    });

    it('should select listing count', () => {
      const { result } = renderHook(() => useTransferStore(transferSelectors.listingCount));
      expect(result.current).toBe(5);
    });

    it('should select free agents', () => {
      const { result } = renderHook(() => useTransferStore());
      const freeAgents = result.current.transferListings.filter((l) => l.sellingTeamId === 'free-agent');
      expect(freeAgents).toHaveLength(1);
      expect(freeAgents[0].sellingTeamId).toBe('free-agent');
    });

    it('should select available listings', () => {
      const { result } = renderHook(() => useTransferStore());
      const available = result.current.availableListings();
      expect(available).toHaveLength(5);
    });

    it('should select affordable listings', () => {
      const { result } = renderHook(() => useTransferStore());
      const affordable = result.current.affordableListings(20);
      expect(affordable.length).toBeGreaterThan(0);
      affordable.forEach((listing) => {
        expect(listing.askingPrice).toBeLessThanOrEqual(20);
      });
    });

    it('should select defenders', () => {
      const { result } = renderHook(() => useTransferStore());
      const defenders = result.current.listingsByPosition('defender');
      expect(defenders).toHaveLength(1);
      expect(defenders[0].player.position).toBe('defender');
    });

    it('should select midfielders', () => {
      const { result } = renderHook(() => useTransferStore());
      const midfielders = result.current.listingsByPosition('midfielder');
      expect(midfielders).toHaveLength(1);
      expect(midfielders[0].player.position).toBe('midfielder');
    });

    it('should select forwards', () => {
      const { result } = renderHook(() => useTransferStore());
      const forwards = result.current.listingsByPosition('forward');
      expect(forwards).toHaveLength(2); // Free agent + expensive player
    });

    it('should select goalkeepers', () => {
      const { result } = renderHook(() => useTransferStore());
      const goalkeepers = result.current.listingsByPosition('goalkeeper');
      expect(goalkeepers).toHaveLength(1);
      expect(goalkeepers[0].player.position).toBe('goalkeeper');
    });

    it('should select selected listing', () => {
      const { result } = renderHook(() => useTransferStore(transferSelectors.selectedListing));
      expect(result.current).toEqual(mockFreeAgentListing);
    });

    it('should select show transfer modal', () => {
      const { result } = renderHook(() => useTransferStore(transferSelectors.showTransferModal));
      expect(result.current).toBe(true);
    });

    it('should select market last refreshed', () => {
      const { result } = renderHook(() => useTransferStore(transferSelectors.marketLastRefreshed));
      expect(result.current).toBeInstanceOf(Date);
    });
  });
});
