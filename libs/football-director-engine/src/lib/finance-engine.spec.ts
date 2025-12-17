/**
 * Football Director Engine - Finance Engine Tests
 */

import { FinanceEngine } from './finance-engine';
import { Team, Player } from './types';

describe('FinanceEngine', () => {
  let engine: FinanceEngine;
  let testTeam: Team;

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
      },
      {
        id: 'p2',
        name: 'Player 2',
        position: 'DEF',
        skill: 10,
        age: 28,
        wages: 3000,
      },
      {
        id: 'p3',
        name: 'Player 3',
        position: 'MID',
        skill: 14,
        age: 23,
        wages: 7000,
      },
    ];

    testTeam = {
      id: 'team-1',
      name: 'Test FC',
      budget: 1000000,
      players: testPlayers,
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
          },
        ],
      };

      const wages = engine.calculateWeeklyWages(singlePlayerTeam);
      expect(wages).toBe(8000);
    });
  });

  describe('calculateWeeklyIncome', () => {
    it('should give higher income for 1st place', () => {
      const income1st = engine.calculateWeeklyIncome(1);
      const income10th = engine.calculateWeeklyIncome(10);

      expect(income1st).toBeGreaterThan(income10th);
    });

    it('should calculate correct income for 1st place', () => {
      const income = engine.calculateWeeklyIncome(1);
      // Base 50k + (21-1)*2500 = 50k + 50k = 100k
      expect(income).toBe(100000);
    });

    it('should calculate correct income for 10th place', () => {
      const income = engine.calculateWeeklyIncome(10);
      // Base 50k + (21-10)*2500 = 50k + 27.5k = 77.5k
      expect(income).toBe(77500);
    });

    it('should calculate correct income for 20th place', () => {
      const income = engine.calculateWeeklyIncome(20);
      // Base 50k + (21-20)*2500 = 50k + 2.5k = 52.5k
      expect(income).toBe(52500);
    });

    it('should give base income for positions beyond 20', () => {
      const income = engine.calculateWeeklyIncome(25);
      // Base 50k + max(0, (21-25)*2500) = 50k
      expect(income).toBe(50000);
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
      // Weekly income (pos 5): +90,000 (base 50k + 16*2.5k)
      // Match day: +30,000
      // Expected: 1,105,000
      expect(result.newBudget).toBe(1105000);
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
      expect(incomeTransaction!.amount).toBe(90000);

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
      // Weekly income (pos 5): +90,000
      // Expected: 1,075,000
      expect(result.newBudget).toBe(1075000);
      expect(result.transactions).toHaveLength(2); // No ticket sales
    });

    it('should handle team with no players', () => {
      const emptyTeam: Team = {
        id: 'team-2',
        name: 'Empty FC',
        budget: 500000,
        players: [],
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
      // Weekly income (pos 10): +77,500
      // Match day: +30,000
      // Expected: 607,500
      expect(result.newBudget).toBe(607500);
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
      // Weekly income (pos 20): +52,500
      // Expected: 47,500
      expect(result.newBudget).toBe(47500);
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
