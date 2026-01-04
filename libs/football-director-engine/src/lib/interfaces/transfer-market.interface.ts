/**
 * Transfer Market Interface
 *
 * Defines the contract for player transfer operations.
 */

import { Player, Team, TransferListing } from '../types';

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
