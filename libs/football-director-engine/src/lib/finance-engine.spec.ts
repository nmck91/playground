/**
 * Football Director Engine - Finance Engine Tests
 */

import { FinanceEngine } from './finance-engine';
import { PlayerStatsTracker } from './player-stats-tracker';
import { Team, Player } from './types';

describe('FinanceEngine', () => {
  let engine: FinanceEngine;
  let testTeam: Team;
  const statsTracker = new PlayerStatsTracker();

  beforeEach(() => {
    engine = new FinanceEngine();

    const testPlayers: Player[] = [
      {
        id: 'p1',
        name: 'Player 1',
        position: 'GK',
        skill: 12,
        age: 25,
        wages: 5000,
        stats: statsTracker.initializePlayerStats(),
        history: [],
      },
      {
        id: 'p2',
        name: 'Player 2',
        position: 'DEF',
        skill: 10,
        age: 28,
        wages: 3000,
        stats: statsTracker.initializePlayerStats(),
        history: [],
      },
      {
        id: 'p3',
        name: 'Player 3',
        position: 'MID',
        skill: 14,
        age: 23,
        wages: 7000,
        stats: statsTracker.initializePlayerStats(),
        history: [],
      },
    ];

    testTeam = {
      id: 'team-1',
      name: 'Test FC',
      budget: 1000000,
      players: testPlayers,
      staff: [],
    };
  });

  describe('calculateWeeklyWages', () => {
    it('should sum all player wages', () => {
      const wages = engine.calculateWeeklyWages(testTeam);
      expect(wages).toBe(15000); // 5000 + 3000 + 7000
    });

    it('should return 0 for team with no players', () => {
      const emptyTeam: Team = {
        id: 'team-2',
        name: 'Empty FC',
        budget: 500000,
        players: [],
        staff: [],
      };

      const wages = engine.calculateWeeklyWages(emptyTeam);
      expect(wages).toBe(0);
    });

    it('should handle single player', () => {
      const singlePlayerTeam: Team = {
        id: 'team-3',
        name: 'Single FC',
        budget: 300000,
        players: [
          {
            id: 'p1',
            name: 'Solo Player',
            position: 'FWD',
            skill: 15,
            age: 26,
            wages: 8000,
            stats: statsTracker.initializePlayerStats(),
            history: [],
          },
        ],
        staff: [],
      };

      const wages = engine.calculateWeeklyWages(singlePlayerTeam);
      expect(wages).toBe(8000);
    });
  });

  describe('calculateWeeklyIncome', () => {
    it('should give higher income for 1st place', () => {
      const income1st = engine.calculateWeeklyIncome(1, 8); // Week 8 = competitive season
      const income10th = engine.calculateWeeklyIncome(10, 8);

      expect(income1st).toBeGreaterThan(income10th);
    });

    it('should calculate correct income for 1st place during competitive season', () => {
      const income = engine.calculateWeeklyIncome(1, 8); // Week 8 = competitive season
      // Base 75k + (21-1)*3750 = 75k + 75k = 150k
      expect(income).toBe(150000);
    });

    it('should calculate correct income for 10th place during competitive season', () => {
      const income = engine.calculateWeeklyIncome(10, 8); // Week 8 = competitive season
      // Base 75k + (21-10)*3750 = 75k + 41.25k = 116.25k
      expect(income).toBe(116250);
    });

    it('should calculate correct income for 20th place during competitive season', () => {
      const income = engine.calculateWeeklyIncome(20, 8); // Week 8 = competitive season
      // Base 75k + (21-20)*3750 = 75k + 3.75k = 78.75k
      expect(income).toBe(78750);
    });

    it('should give base income for positions beyond 20', () => {
      const income = engine.calculateWeeklyIncome(25, 8); // Week 8 = competitive season
      // Base 75k + max(0, (21-25)*3750) = 75k
      expect(income).toBe(75000);
    });

    it('should reduce income during pre-season (40% of competitive)', () => {
      const competitiveIncome = engine.calculateWeeklyIncome(1, 8); // Week 8 = competitive
      const preSeasonIncome = engine.calculateWeeklyIncome(1, 1); // Week 1 = pre-season

      // Pre-season should be 40% of competitive
      expect(preSeasonIncome).toBe(Math.round(competitiveIncome * 0.4));
      expect(preSeasonIncome).toBe(60000); // 150k * 0.4 = 60k
    });

    it('should reduce income during off-season (40% of competitive)', () => {
      const competitiveIncome = engine.calculateWeeklyIncome(1, 8); // Week 8 = competitive
      const offSeasonIncome = engine.calculateWeeklyIncome(1, 46); // Week 46 = off-season

      // Off-season should be 40% of competitive
      expect(offSeasonIncome).toBe(Math.round(competitiveIncome * 0.4));
      expect(offSeasonIncome).toBe(60000); // 150k * 0.4 = 60k
    });
  });

  describe('calculateMatchDayIncome', () => {
    it('should return income for home matches', () => {
      const income = engine.calculateMatchDayIncome(true);
      expect(income).toBe(30000);
    });

    it('should return 0 for away matches', () => {
      const income = engine.calculateMatchDayIncome(false);
      expect(income).toBe(0);
    });
  });

  describe('processWeeklyFinances', () => {
    it('should process finances with home match', () => {
      const result = engine.processWeeklyFinances(
        1000000, // budget
        testTeam,
        5, // position
        30000, // match day income (home)
        1 // week number
      );

      // Starting: 1,000,000
      // Wages: -15,000
      // Weekly income (pos 5, week 1 pre-season): +(75k + 16*3.75k) * 0.4 = 135k * 0.4 = 54,000
      // Match day: +30,000
      // Expected: 1,069,000
      expect(result.newBudget).toBe(1069000);
      expect(result.transactions).toHaveLength(3);

      // Check transaction types
      const wagesTransaction = result.transactions.find((t) => t.category === 'wages');
      const incomeTransaction = result.transactions.find((t) => t.category === 'prize-money');
      const ticketTransaction = result.transactions.find((t) => t.category === 'ticket-sales');

      expect(wagesTransaction).toBeDefined();
      expect(wagesTransaction!.type).toBe('expense');
      expect(wagesTransaction!.amount).toBe(15000);
      expect(wagesTransaction!.weekNumber).toBe(1);

      expect(incomeTransaction).toBeDefined();
      expect(incomeTransaction!.type).toBe('income');
      expect(incomeTransaction!.amount).toBe(54000);

      expect(ticketTransaction).toBeDefined();
      expect(ticketTransaction!.type).toBe('income');
      expect(ticketTransaction!.amount).toBe(30000);
    });

    it('should process finances with away match', () => {
      const result = engine.processWeeklyFinances(
        1000000, // budget
        testTeam,
        5, // position
        0, // no match day income (away)
        1 // week number
      );

      // Starting: 1,000,000
      // Wages: -15,000
      // Weekly income (pos 5, week 1 pre-season): +54,000
      // Expected: 1,039,000
      expect(result.newBudget).toBe(1039000);
      expect(result.transactions).toHaveLength(2); // No ticket sales
    });

    it('should handle team with no players', () => {
      const emptyTeam: Team = {
        id: 'team-2',
        name: 'Empty FC',
        budget: 500000,
        players: [],
        staff: [],
      };

      const result = engine.processWeeklyFinances(
        500000,
        emptyTeam,
        10,
        30000,
        1
      );

      // Starting: 500,000
      // Wages: 0
      // Weekly income (pos 10, week 1 pre-season): +(75k + 11*3.75k) * 0.4 = 116.25k * 0.4 = 46,500
      // Match day: +30,000
      // Expected: 576,500
      expect(result.newBudget).toBe(576500);
      expect(result.transactions).toHaveLength(2); // Only income + tickets (no wages)
    });

    it('should handle negative budget', () => {
      const result = engine.processWeeklyFinances(
        10000, // low budget
        testTeam,
        20, // bad position
        0, // away match
        1
      );

      // Starting: 10,000
      // Wages: -15,000
      // Weekly income (pos 20, week 1 pre-season): +(75k + 1*3.75k) * 0.4 = 78.75k * 0.4 = 31,500
      // Expected: 26,500
      expect(result.newBudget).toBe(26500);
    });

    it('should create unique transaction IDs', () => {
      const result = engine.processWeeklyFinances(1000000, testTeam, 5, 30000, 1);

      const ids = result.transactions.map((t) => t.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include correct week number in all transactions', () => {
      const weekNumber = 15;
      const result = engine.processWeeklyFinances(1000000, testTeam, 5, 30000, weekNumber);

      result.transactions.forEach((transaction) => {
        expect(transaction.weekNumber).toBe(weekNumber);
      });
    });

    it('should include dates in all transactions', () => {
      const result = engine.processWeeklyFinances(1000000, testTeam, 5, 30000, 1);

      result.transactions.forEach((transaction) => {
        expect(transaction.date).toBeInstanceOf(Date);
      });
    });
  });
});
