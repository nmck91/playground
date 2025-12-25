/**
 * Football Director - Transfer Store
 * Transfer market, player trading, and AI transfers
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { usePlayerStore } from './playerStore';
import { useFinanceStore } from './financeStore';
import { useUIStore } from './uiStore';
import {
  TransferMarket,
  type TransferListing,
  type Player,
} from '@playground/football-director-engine';

/**
 * Transfer Store State Interface
 */
interface TransferStoreState {
  // Transfer market
  transferListings: TransferListing[];
  marketLastRefreshed: Date | null;

  // UI state
  selectedListing: TransferListing | null;
  showTransferModal: boolean;
}

/**
 * Transfer Store Actions Interface
 */
interface TransferStoreActions {
  // Market operations
  refreshMarket: () => void;
  generateMarket: () => void;

  // Transfer operations
  buyPlayer: (listing: TransferListing) => boolean;
  sellPlayer: (playerId: string, askingPrice: number) => void;

  // AI transfers
  processAITransfers: () => void;

  // Queries
  availableListings: () => TransferListing[];
  affordableListings: (budget: number) => TransferListing[];
  listingsByPosition: (position: string) => TransferListing[];
  listingsBySkillRange: (minSkill: number, maxSkill: number) => TransferListing[];

  // UI
  setSelectedListing: (listing: TransferListing | null) => void;
  setShowTransferModal: (show: boolean) => void;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Transfer Store Type
 */
export type TransferStore = TransferStoreState & TransferStoreActions;

/**
 * Initial state
 */
const initialState: TransferStoreState = {
  transferListings: [],
  marketLastRefreshed: null,
  selectedListing: null,
  showTransferModal: false,
};

/**
 * Transfer Store
 *
 * Manages transfer market, player buying/selling, and AI team transfers.
 * Integrates with PlayerStore for player management and FinanceStore for budget.
 *
 * @example
 * ```typescript
 * // Refresh transfer market
 * const refreshMarket = useTransferStore(state => state.refreshMarket);
 * refreshMarket();
 *
 * // Buy player
 * const buyPlayer = useTransferStore(state => state.buyPlayer);
 * const success = buyPlayer(listing);
 * ```
 */
export const useTransferStore = create<TransferStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          set(initialState, false, 'transferStore/syncFromGameState/noGame');
          return;
        }

        // Transfer listings are generated, not stored in GameState
        // So we don't need to sync here
      },

      // Refresh market (re-generate listings)
      refreshMarket: () => {
        get().generateMarket();
      },

      // Generate transfer market
      generateMarket: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const transferMarket = new TransferMarket();
        const currentWeek = gameState.season?.currentWeek || 1;

        // Generate listings from AI team players
        const aiListings = transferMarket.generateMarket(gameState.teams, currentWeek, 30);

        // Generate listings from free agents (no fee, just wages)
        const freeAgents = gameState.freeAgents || [];
        const freeAgentListings: TransferListing[] = freeAgents.slice(0, 20).map((player) => ({
          id: `listing-${player.id}`,
          player,
          sellingTeamId: 'free-agent',
          sellingTeamName: 'Free Agent',
          askingPrice: 0,
          listedWeek: currentWeek,
        }));

        const allListings = [...freeAgentListings, ...aiListings];

        set(
          {
            transferListings: allListings,
            marketLastRefreshed: new Date(),
          },
          false,
          'transferStore/generateMarket'
        );

        useUIStore.getState().addNotification({
          type: 'info',
          message: `Transfer market refreshed - ${allListings.length} players available`,
          duration: 3000,
        });
      },

      // Buy player
      buyPlayer: (listing) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return false;

        const financeStore = useFinanceStore.getState();
        const playerStore = usePlayerStore.getState();

        // Check if can afford transfer fee
        const totalCost = listing.askingPrice;
        if (!financeStore.canAfford(totalCost)) {
          useUIStore.getState().addNotification({
            type: 'error',
            message: `Cannot afford £${totalCost}m for ${listing.player.name}`,
            duration: 3000,
          });
          return false;
        }

        // Check squad size limit
        if (gameState.playerTeam.players.length >= 30) {
          useUIStore.getState().addNotification({
            type: 'error',
            message: 'Squad is full (30 players max)',
            duration: 3000,
          });
          return false;
        }

        // Deduct transfer fee
        if (totalCost > 0) {
          financeStore.updateBudget(-totalCost, `Signed ${listing.player.name}`);
        }

        // Calculate wage based on player skill
        const wage = listing.player.contract?.wage || listing.player.skill * 0.05;

        // Add player to squad
        const playerWithContract = {
          ...listing.player,
          contract: {
            wage,
            weeksRemaining: 52 * 3, // 3-year contract
            bonuses: 0,
          },
        };

        playerStore.addPlayer(playerWithContract);

        // Remove listing from market
        const updatedListings = get().transferListings.filter((l) => l.id !== listing.id);
        set({ transferListings: updatedListings }, false, 'transferStore/buyPlayer');

        // Remove from free agents if applicable (free agents have sellingTeamId === 'free-agent')
        if (listing.sellingTeamId === 'free-agent') {
          const updatedFreeAgents = gameState.freeAgents?.filter(
            (p) => p.id !== listing.player.id
          ) || [];

          useGameStore.getState().updateGameState((state) => ({
            ...state,
            freeAgents: updatedFreeAgents,
          }));
        }

        useUIStore.getState().addNotification({
          type: 'success',
          message: `${listing.player.name} signed for £${totalCost}m!`,
          duration: 4000,
        });

        return true;
      },

      // Sell player
      sellPlayer: (playerId, askingPrice) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const playerStore = usePlayerStore.getState();
        const player = playerStore.getPlayerById(playerId);
        if (!player) return;

        // Remove player from squad
        playerStore.removePlayer(playerId);

        // Add to transfer fee
        if (askingPrice > 0) {
          useFinanceStore.getState().updateBudget(askingPrice, `Sold ${player.name}`);
        }

        // Add to free agents or remove from game
        const updatedFreeAgents = [...(gameState.freeAgents || []), player];

        useGameStore.getState().updateGameState((state) => ({
          ...state,
          freeAgents: updatedFreeAgents,
        }));

        useUIStore.getState().addNotification({
          type: 'success',
          message: `${player.name} sold for £${askingPrice}m`,
          duration: 3000,
        });
      },

      // Process AI team transfers
      processAITransfers: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        // Simplified AI transfer logic
        // In a real implementation, this would be more sophisticated
        const transferMarket = new TransferMarket();

        gameState.teams.forEach((team) => {
          // Random chance AI team makes a transfer
          if (Math.random() < 0.2) {
            // 20% chance
            const listings = get().transferListings.filter(
              (l) => l.askingPrice <= team.budget
            );

            if (listings.length > 0) {
              const randomListing = listings[Math.floor(Math.random() * listings.length)];

              // AI team buys player
              const updatedListings = get().transferListings.filter(
                (l) => l.id !== randomListing.id
              );
              set(
                { transferListings: updatedListings },
                false,
                'transferStore/aiTransfer'
              );
            }
          }
        });
      },

      // Get available listings
      availableListings: () => {
        return get().transferListings;
      },

      // Get affordable listings
      affordableListings: (budget) => {
        return get().transferListings.filter((l) => l.askingPrice <= budget);
      },

      // Get listings by position
      listingsByPosition: (position) => {
        return get().transferListings.filter((l) => l.player.position === position);
      },

      // Get listings by skill range
      listingsBySkillRange: (minSkill, maxSkill) => {
        return get().transferListings.filter(
          (l) => l.player.skill >= minSkill && l.player.skill <= maxSkill
        );
      },

      // Set selected listing
      setSelectedListing: (listing) => {
        set({ selectedListing: listing }, false, 'transferStore/setSelectedListing');
      },

      // Set show transfer modal
      setShowTransferModal: (show) => {
        set({ showTransferModal: show }, false, 'transferStore/setShowTransferModal');
      },
    }),
    {
      name: 'TransferStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Transfer Store Selectors
 */
export const transferSelectors = {
  // Listings
  allListings: (state: TransferStore) => state.transferListings,
  listingCount: (state: TransferStore) => state.transferListings.length,
  freeAgents: (state: TransferStore) =>
    state.transferListings.filter((l) => l.sellingTeamId === 'free-agent'),

  // Queries
  availableListings: (state: TransferStore) => state.availableListings(),
  affordableListings: (budget: number) => (state: TransferStore) =>
    state.affordableListings(budget),

  // By position
  defenders: (state: TransferStore) => state.listingsByPosition('defender'),
  midfielders: (state: TransferStore) => state.listingsByPosition('midfielder'),
  forwards: (state: TransferStore) => state.listingsByPosition('forward'),
  goalkeepers: (state: TransferStore) => state.listingsByPosition('goalkeeper'),

  // UI
  selectedListing: (state: TransferStore) => state.selectedListing,
  showTransferModal: (state: TransferStore) => state.showTransferModal,
  marketLastRefreshed: (state: TransferStore) => state.marketLastRefreshed,
};
