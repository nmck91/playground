/**
 * Transfer Market Factory
 *
 * Factory functions for creating TransferMarket instances.
 * Provides both production and test/mock instances.
 */

import { ITransferMarket } from '../interfaces/transfer-market.interface';
import { TransferMarket } from '../transfer-market';
import { Player, Team, TransferListing } from '../types';

/**
 * Create a production TransferMarket instance
 */
export function createTransferMarket(): ITransferMarket {
  return new TransferMarket();
}

/**
 * Create a mock TransferMarket for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockTransferMarket(
  overrides?: Partial<ITransferMarket>
): ITransferMarket {
  const mockPlayer: Player = {
    id: 'transfer-1',
    name: 'Transfer Target',
    position: 'FWD',
    skill: 15,
    age: 25,
    wages: 10000,
    stats: {
      appearances: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      careerAppearances: 0,
      careerGoals: 0,
      careerAssists: 0,
      careerCleanSheets: 0,
    },
    history: [],
    contract: {
      weeklyWage: 10000,
      startYear: 2024,
      startWeek: 1,
      expiryYear: 2027,
      expiryWeek: 1,
      yearsRemaining: 3,
      weeksRemaining: 156,
      status: 'active',
    },
    morale: 50,
  };

  const mockListing: TransferListing = {
    id: 'listing-1',
    player: mockPlayer,
    sellingTeamId: 'team-1',
    sellingTeamName: 'Test FC',
    askingPrice: 5000000,
    listedWeek: 1,
  };

  const mock: ITransferMarket = {
    isTransferWindowOpen: (_currentWeek: number): boolean => true,
    calculatePlayerValue: (_player: Player): number => 5000000,
    generateMarket: (_aiTeams: Team[], _currentWeek: number, _listingsPerWeek?: number): TransferListing[] => [mockListing],
    buyPlayer: (_listing: TransferListing, buyerTeam: Team, sellerTeam: Team, _currentListings: TransferListing[], _currentWeek: number) => ({
      success: true,
      message: 'Transfer completed',
      updatedBuyerTeam: buyerTeam,
      updatedSellerTeam: sellerTeam,
      updatedListings: [],
    }),
    ...overrides,
  };
  return mock;
}
