/**
 * Football Director Engine - Transfer Market
 * Manages player transfers, pricing, and market generation
 */

import { Player, Team, TransferListing } from './types';

// Transfer window periods
const PRE_SEASON_TRANSFER_START = 1;
const PRE_SEASON_TRANSFER_END = 8;
const WINTER_TRANSFER_START = 28;
const WINTER_TRANSFER_END = 32;

/**
 * Transfer Market Interface
 *
 * Defines the contract for managing player transfers.
 */
export interface ITransferMarket {
  isTransferWindowOpen(currentWeek: number): boolean;
  calculatePlayerValue(player: Player): number;
  generateMarket(
    aiTeams: Team[],
    currentWeek: number,
    listingsPerWeek?: number
  ): TransferListing[];
  buyPlayer(
    listing: TransferListing,
    buyerTeam: Team,
    sellerTeam: Team,
    currentListings: TransferListing[],
    currentWeek: number
  ): {
    success: boolean;
    message: string;
    updatedBuyerTeam?: Team;
    updatedSellerTeam?: Team;
    updatedListings?: TransferListing[];
  };
}

/**
 * Transfer Market Implementation
 */
export class TransferMarket implements ITransferMarket {
  /**
   * Check if transfers are allowed in the current week
   */
  isTransferWindowOpen(currentWeek: number): boolean {
    // Pre-season transfer window: weeks 1-8
    if (currentWeek >= PRE_SEASON_TRANSFER_START && currentWeek <= PRE_SEASON_TRANSFER_END) {
      return true;
    }
    // Winter transfer window: weeks 28-32 (mid-season)
    if (currentWeek >= WINTER_TRANSFER_START && currentWeek <= WINTER_TRANSFER_END) {
      return true;
    }
    return false;
  }

  /**
   * Calculate a player's market value based on skill and age
   */
  calculatePlayerValue(player: Player): number {
    // Base value from skill (exponential growth)
    const skillValue = Math.pow(player.skill, 2.5) * 10000;

    // Age multiplier (peak at 25-28, decline after)
    let ageMultiplier = 1.0;
    if (player.age < 22) {
      ageMultiplier = 0.7 + (player.age - 18) * 0.075; // Young potential
    } else if (player.age <= 28) {
      ageMultiplier = 1.0; // Peak years
    } else if (player.age <= 32) {
      ageMultiplier = 1.0 - (player.age - 28) * 0.1; // Gradual decline
    } else {
      ageMultiplier = 0.4; // Veteran
    }

    // Position multiplier (attackers worth more)
    const positionMultiplier = {
      GK: 0.9,
      DEF: 0.95,
      MID: 1.0,
      FWD: 1.1,
    };

    const value = skillValue * ageMultiplier * positionMultiplier[player.position];

    return Math.round(value / 1000) * 1000; // Round to nearest 1000
  }

  /**
   * Generate transfer market listings from AI teams
   * Each week, some AI teams list players for sale
   */
  generateMarket(
    aiTeams: Team[],
    currentWeek: number,
    listingsPerWeek = 10
  ): TransferListing[] {
    const listings: TransferListing[] = [];

    // Randomly select teams to list players
    const shuffledTeams = [...aiTeams].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(listingsPerWeek, shuffledTeams.length); i++) {
      const team = shuffledTeams[i];

      // Each team lists 1-2 players
      const playersToList = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < playersToList && team.players.length > 11; j++) {
        // Don't sell if squad is too small
        const randomPlayer = team.players[Math.floor(Math.random() * team.players.length)];

        const askingPrice = this.calculatePlayerValue(randomPlayer);

        listings.push({
          id: `listing-${Date.now()}-${i}-${j}`,
          player: randomPlayer,
          sellingTeamId: team.id,
          sellingTeamName: team.name,
          askingPrice,
          listedWeek: currentWeek,
        });
      }
    }

    return listings;
  }

  /**
   * Buy a player from the transfer market
   * Returns updated buyer team, seller team, and remaining listings
   */
  buyPlayer(
    listing: TransferListing,
    buyerTeam: Team,
    sellerTeam: Team,
    currentListings: TransferListing[],
    currentWeek: number
  ): {
    success: boolean;
    message: string;
    updatedBuyerTeam?: Team;
    updatedSellerTeam?: Team;
    updatedListings?: TransferListing[];
  } {
    // Check transfer window
    if (!this.isTransferWindowOpen(currentWeek)) {
      return {
        success: false,
        message: 'Transfer window is closed',
      };
    }

    // Validate budget
    if (buyerTeam.budget < listing.askingPrice) {
      return {
        success: false,
        message: 'Insufficient budget',
      };
    }

    // Validate squad size (max 25 players)
    if (buyerTeam.players.length >= 25) {
      return {
        success: false,
        message: 'Squad full (max 25 players)',
      };
    }

    // Remove player from seller
    const updatedSellerPlayers = sellerTeam.players.filter(
      (p) => p.id !== listing.player.id
    );

    // Add player to buyer
    const updatedBuyerPlayers = [...buyerTeam.players, listing.player];

    // Update budgets
    const updatedBuyerTeam: Team = {
      ...buyerTeam,
      players: updatedBuyerPlayers,
      budget: buyerTeam.budget - listing.askingPrice,
    };

    const updatedSellerTeam: Team = {
      ...sellerTeam,
      players: updatedSellerPlayers,
      budget: sellerTeam.budget + listing.askingPrice,
    };

    // Remove listing from market
    const updatedListings = currentListings.filter((l) => l.id !== listing.id);

    return {
      success: true,
      message: `Signed ${listing.player.name} for £${listing.askingPrice.toLocaleString()}`,
      updatedBuyerTeam,
      updatedSellerTeam,
      updatedListings,
    };
  }

  /**
   * Sell a player from your squad
   * Lists player on market and removes from team
   */
  sellPlayer(
    player: Player,
    sellingTeam: Team,
    askingPrice: number,
    currentListings: TransferListing[],
    currentWeek: number
  ): {
    success: boolean;
    message: string;
    updatedTeam?: Team;
    updatedListings?: TransferListing[];
  } {
    // Check transfer window
    if (!this.isTransferWindowOpen(currentWeek)) {
      return {
        success: false,
        message: 'Transfer window is closed',
      };
    }

    // Validate squad size (min 11 players)
    if (sellingTeam.players.length <= 11) {
      return {
        success: false,
        message: 'Cannot sell - squad too small (min 11 players)',
      };
    }

    // Check if player exists in team
    const playerExists = sellingTeam.players.find((p) => p.id === player.id);
    if (!playerExists) {
      return {
        success: false,
        message: 'Player not found in squad',
      };
    }

    // Create listing
    const newListing: TransferListing = {
      id: `listing-${Date.now()}-${player.id}`,
      player,
      sellingTeamId: sellingTeam.id,
      sellingTeamName: sellingTeam.name,
      askingPrice,
      listedWeek: currentWeek,
    };

    // Remove player from team
    const updatedPlayers = sellingTeam.players.filter((p) => p.id !== player.id);

    const updatedTeam: Team = {
      ...sellingTeam,
      players: updatedPlayers,
    };

    const updatedListings = [...currentListings, newListing];

    return {
      success: true,
      message: `Listed ${player.name} for £${askingPrice.toLocaleString()}`,
      updatedTeam,
      updatedListings,
    };
  }

  /**
   * AI teams buy players from the market
   * Simulates transfer activity
   */
  simulateAITransfers(
    aiTeams: Team[],
    currentListings: TransferListing[],
    currentWeek: number
  ): {
    updatedTeams: Team[];
    updatedListings: TransferListing[];
  } {
    let updatedTeams = [...aiTeams];
    let updatedListings = [...currentListings];

    // Only simulate transfers during transfer windows
    if (!this.isTransferWindowOpen(currentWeek)) {
      return { updatedTeams, updatedListings };
    }

    // 30% chance each AI team attempts a transfer
    aiTeams.forEach((team) => {
      if (Math.random() < 0.3 && updatedListings.length > 0) {
        // Find affordable players
        const affordableListings = updatedListings.filter(
          (l) => l.askingPrice <= team.budget && l.sellingTeamId !== team.id
        );

        if (affordableListings.length > 0) {
          const randomListing =
            affordableListings[Math.floor(Math.random() * affordableListings.length)];

          const sellerTeam = updatedTeams.find((t) => t.id === randomListing.sellingTeamId);

          if (sellerTeam) {
            const result = this.buyPlayer(randomListing, team, sellerTeam, updatedListings, currentWeek);

            if (result.success && result.updatedBuyerTeam && result.updatedSellerTeam) {
              // Update teams array
              updatedTeams = updatedTeams.map((t) => {
                if (t.id === team.id) return result.updatedBuyerTeam!;
                if (t.id === sellerTeam.id) return result.updatedSellerTeam!;
                return t;
              });

              updatedListings = result.updatedListings!;
            }
          }
        }
      }
    });

    return { updatedTeams, updatedListings };
  }
}
