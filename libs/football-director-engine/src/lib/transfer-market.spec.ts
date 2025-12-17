/**
 * Football Director Engine - Transfer Market Tests
 */

import { TransferMarket } from './transfer-market';
import { Player, Team, TransferListing } from './types';

describe('TransferMarket', () => {
  let market: TransferMarket;
  let testPlayer: Player;
  let testTeam: Team;

  beforeEach(() => {
    market = new TransferMarket();

    testPlayer = {
      id: 'player-1',
      name: 'Test Player',
      position: 'MID',
      skill: 12,
      age: 25,
      wages: 5000,
    };

    testTeam = {
      id: 'team-1',
      name: 'Test FC',
      budget: 1000000,
      players: [testPlayer],
    };
  });

  describe('calculatePlayerValue', () => {
    it('should calculate value based on skill', () => {
      const lowSkillPlayer: Player = { ...testPlayer, skill: 5, age: 25 };
      const highSkillPlayer: Player = { ...testPlayer, skill: 18, age: 25 };

      const lowValue = market.calculatePlayerValue(lowSkillPlayer);
      const highValue = market.calculatePlayerValue(highSkillPlayer);

      expect(highValue).toBeGreaterThan(lowValue);
    });

    it('should value peak age players higher', () => {
      const youngPlayer: Player = { ...testPlayer, age: 20 };
      const peakPlayer: Player = { ...testPlayer, age: 26 };
      const oldPlayer: Player = { ...testPlayer, age: 34 };

      const youngValue = market.calculatePlayerValue(youngPlayer);
      const peakValue = market.calculatePlayerValue(peakPlayer);
      const oldValue = market.calculatePlayerValue(oldPlayer);

      expect(peakValue).toBeGreaterThan(youngValue);
      expect(peakValue).toBeGreaterThan(oldValue);
    });

    it('should value forwards higher than defenders', () => {
      const defender: Player = { ...testPlayer, position: 'DEF' };
      const forward: Player = { ...testPlayer, position: 'FWD' };

      const defValue = market.calculatePlayerValue(defender);
      const fwdValue = market.calculatePlayerValue(forward);

      expect(fwdValue).toBeGreaterThan(defValue);
    });

    it('should round values to nearest 1000', () => {
      const value = market.calculatePlayerValue(testPlayer);
      expect(value % 1000).toBe(0);
    });

    it('should calculate correctly for all positions', () => {
      const positions: Player['position'][] = ['GK', 'DEF', 'MID', 'FWD'];

      positions.forEach((position) => {
        const player: Player = { ...testPlayer, position };
        const value = market.calculatePlayerValue(player);
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('generateMarket', () => {
    let aiTeams: Team[];

    beforeEach(() => {
      aiTeams = Array.from({ length: 5 }, (_, i) => ({
        id: `team-${i}`,
        name: `Team ${i}`,
        budget: 1000000,
        players: Array.from({ length: 15 }, (_, j) => ({
          id: `p${i}-${j}`,
          name: `Player ${j}`,
          position: (['GK', 'DEF', 'MID', 'FWD'] as const)[j % 4],
          skill: 10,
          age: 25,
          wages: 3000,
        })),
      }));
    });

    it('should generate listings', () => {
      const listings = market.generateMarket(aiTeams, 1, 10);
      expect(listings.length).toBeGreaterThan(0);
      expect(listings.length).toBeLessThanOrEqual(20); // 10 teams * 2 max players
    });

    it('should include required listing fields', () => {
      const listings = market.generateMarket(aiTeams, 1, 5);

      listings.forEach((listing) => {
        expect(listing.id).toBeDefined();
        expect(listing.player).toBeDefined();
        expect(listing.sellingTeamId).toBeDefined();
        expect(listing.sellingTeamName).toBeDefined();
        expect(listing.askingPrice).toBeGreaterThan(0);
        expect(listing.listedWeek).toBe(1);
      });
    });

    it('should not list players if squad too small', () => {
      const smallSquad: Team[] = [
        {
          id: 'small-team',
          name: 'Small Team',
          budget: 1000000,
          players: Array.from({ length: 11 }, (_, i) => ({
            id: `p-${i}`,
            name: `Player ${i}`,
            position: 'MID',
            skill: 10,
            age: 25,
            wages: 3000,
          })),
        },
      ];

      const listings = market.generateMarket(smallSquad, 1, 10);
      expect(listings.length).toBe(0);
    });
  });

  describe('buyPlayer', () => {
    let buyer: Team;
    let seller: Team;
    let listing: TransferListing;

    beforeEach(() => {
      const playerToBuy: Player = {
        id: 'player-buy',
        name: 'Star Player',
        position: 'FWD',
        skill: 15,
        age: 24,
        wages: 8000,
      };

      buyer = {
        id: 'buyer',
        name: 'Buyer FC',
        budget: 500000,
        players: Array.from({ length: 11 }, (_, i) => ({
          id: `buyer-p${i}`,
          name: `Player ${i}`,
          position: 'MID',
          skill: 10,
          age: 25,
          wages: 3000,
        })),
      };

      seller = {
        id: 'seller',
        name: 'Seller FC',
        budget: 200000,
        players: [
          playerToBuy,
          ...Array.from({ length: 11 }, (_, i) => ({
            id: `seller-p${i}`,
            name: `Player ${i}`,
            position: 'DEF' as const,
            skill: 10,
            age: 25,
            wages: 3000,
          })),
        ],
      };

      listing = {
        id: 'listing-1',
        player: playerToBuy,
        sellingTeamId: seller.id,
        sellingTeamName: seller.name,
        askingPrice: 300000,
        listedWeek: 1,
      };
    });

    it('should successfully buy player with sufficient budget', () => {
      const result = market.buyPlayer(listing, buyer, seller, [listing]);

      expect(result.success).toBe(true);
      expect(result.updatedBuyerTeam).toBeDefined();
      expect(result.updatedSellerTeam).toBeDefined();
      expect(result.updatedListings).toBeDefined();
    });

    it('should update buyer squad and budget', () => {
      const result = market.buyPlayer(listing, buyer, seller, [listing]);

      expect(result.updatedBuyerTeam!.players).toHaveLength(12);
      expect(result.updatedBuyerTeam!.budget).toBe(200000); // 500k - 300k
      expect(result.updatedBuyerTeam!.players).toContainEqual(listing.player);
    });

    it('should update seller squad and budget', () => {
      const result = market.buyPlayer(listing, buyer, seller, [listing]);

      expect(result.updatedSellerTeam!.players).toHaveLength(11);
      expect(result.updatedSellerTeam!.budget).toBe(500000); // 200k + 300k
      expect(result.updatedSellerTeam!.players).not.toContainEqual(listing.player);
    });

    it('should remove listing from market', () => {
      const result = market.buyPlayer(listing, buyer, seller, [listing]);

      expect(result.updatedListings).toHaveLength(0);
    });

    it('should fail with insufficient budget', () => {
      const poorBuyer = { ...buyer, budget: 100000 };
      const result = market.buyPlayer(listing, poorBuyer, seller, [listing]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient budget');
      expect(result.updatedBuyerTeam).toBeUndefined();
    });

    it('should fail with full squad', () => {
      const fullSquad = {
        ...buyer,
        players: Array.from({ length: 25 }, (_, i) => ({
          id: `p${i}`,
          name: `Player ${i}`,
          position: 'MID' as const,
          skill: 10,
          age: 25,
          wages: 3000,
        })),
      };

      const result = market.buyPlayer(listing, fullSquad, seller, [listing]);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Squad full');
    });
  });

  describe('sellPlayer', () => {
    let team: Team;
    let playerToSell: Player;

    beforeEach(() => {
      playerToSell = {
        id: 'player-sell',
        name: 'Surplus Player',
        position: 'DEF',
        skill: 10,
        age: 28,
        wages: 4000,
      };

      team = {
        id: 'team-1',
        name: 'Test FC',
        budget: 500000,
        players: [
          playerToSell,
          ...Array.from({ length: 11 }, (_, i) => ({
            id: `p${i}`,
            name: `Player ${i}`,
            position: 'MID' as const,
            skill: 10,
            age: 25,
            wages: 3000,
          })),
        ],
      };
    });

    it('should successfully sell player', () => {
      const result = market.sellPlayer(playerToSell, team, 150000, [], 1);

      expect(result.success).toBe(true);
      expect(result.updatedTeam).toBeDefined();
      expect(result.updatedListings).toBeDefined();
    });

    it('should remove player from squad', () => {
      const result = market.sellPlayer(playerToSell, team, 150000, [], 1);

      expect(result.updatedTeam!.players).toHaveLength(11);
      expect(result.updatedTeam!.players).not.toContainEqual(playerToSell);
    });

    it('should create listing', () => {
      const result = market.sellPlayer(playerToSell, team, 150000, [], 1);

      expect(result.updatedListings).toHaveLength(1);
      expect(result.updatedListings![0].player).toEqual(playerToSell);
      expect(result.updatedListings![0].askingPrice).toBe(150000);
      expect(result.updatedListings![0].listedWeek).toBe(1);
    });

    it('should fail with minimum squad size', () => {
      const minSquad = {
        ...team,
        players: Array.from({ length: 11 }, (_, i) => ({
          id: `p${i}`,
          name: `Player ${i}`,
          position: 'MID' as const,
          skill: 10,
          age: 25,
          wages: 3000,
        })),
      };

      const result = market.sellPlayer(minSquad.players[0], minSquad, 100000, [], 1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('squad too small');
    });

    it('should fail for non-existent player', () => {
      const wrongPlayer: Player = {
        id: 'wrong',
        name: 'Wrong',
        position: 'FWD',
        skill: 10,
        age: 25,
        wages: 3000,
      };

      const result = market.sellPlayer(wrongPlayer, team, 100000, [], 1);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('simulateAITransfers', () => {
    let aiTeams: Team[];
    let listings: TransferListing[];

    beforeEach(() => {
      aiTeams = Array.from({ length: 3 }, (_, i) => ({
        id: `team-${i}`,
        name: `Team ${i}`,
        budget: 500000,
        players: Array.from({ length: 12 }, (_, j) => ({
          id: `p${i}-${j}`,
          name: `Player ${j}`,
          position: (['GK', 'DEF', 'MID', 'FWD'] as const)[j % 4],
          skill: 10,
          age: 25,
          wages: 3000,
        })),
      }));

      listings = [
        {
          id: 'listing-1',
          player: {
            id: 'transfer-player',
            name: 'Transfer Player',
            position: 'MID',
            skill: 12,
            age: 24,
            wages: 4000,
          },
          sellingTeamId: 'team-0',
          sellingTeamName: 'Team 0',
          askingPrice: 100000,
          listedWeek: 1,
        },
      ];
    });

    it('should return updated teams and listings', () => {
      const result = market.simulateAITransfers(aiTeams, listings);

      expect(result.updatedTeams).toBeDefined();
      expect(result.updatedListings).toBeDefined();
      expect(result.updatedTeams.length).toBe(aiTeams.length);
    });

    it('should not modify teams if no transfers occur', () => {
      const emptyListings: TransferListing[] = [];
      const result = market.simulateAITransfers(aiTeams, emptyListings);

      expect(result.updatedTeams.length).toBe(aiTeams.length);
      expect(result.updatedListings.length).toBe(0);
    });
  });
});
