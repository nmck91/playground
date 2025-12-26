/**
 * Football Director - Finance Store
 * Budget, wages, transactions, and prize money management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useGameStore } from './gameStore';
import { useUIStore } from './uiStore';
import type { FinancialRecord } from '@playground/football-director-engine';

// Type alias for backward compatibility
type Transaction = FinancialRecord;

/**
 * Finance Store State Interface
 */
interface FinanceStoreState {
  // Cached financial data (derived from gameState)
  currentBudget: number;
  weeklyWageBill: number;
  transactions: Transaction[];
}

/**
 * Finance Store Actions Interface
 */
interface FinanceStoreActions {
  // Budget operations
  updateBudget: (amount: number, reason: string) => void;
  canAfford: (amount: number) => boolean;

  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;

  // Weekly operations
  processWeeklyFinances: () => void;
  payWages: () => void;

  // Prize money
  awardPrizeMoney: (amount: number, reason: string) => void;

  // Derived calculations
  recentTransactions: (count: number) => Transaction[];
  totalIncome: (weeks: number) => number;
  totalExpenses: (weeks: number) => number;
  netCashflow: (weeks: number) => number;

  // Sync with GameStore
  syncFromGameState: () => void;
}

/**
 * Combined Finance Store Type
 */
export type FinanceStore = FinanceStoreState & FinanceStoreActions;

/**
 * Initial state
 */
const initialState: FinanceStoreState = {
  currentBudget: 0,
  weeklyWageBill: 0,
  transactions: [],
};

/**
 * Generate transaction ID
 */
let transactionIdCounter = 0;
const generateTransactionId = () => `txn-${Date.now()}-${transactionIdCounter++}`;

/**
 * Finance Store
 *
 * Manages budget, wages, transactions, and financial calculations.
 * Reads from and writes to GameStore.
 *
 * @example
 * ```typescript
 * // Check if can afford transfer
 * const canAfford = useFinanceStore(state => state.canAfford);
 * if (canAfford(10)) {
 *   // Buy player
 * }
 *
 * // Update budget
 * const updateBudget = useFinanceStore(state => state.updateBudget);
 * updateBudget(-10, 'Player transfer');
 * ```
 */
export const useFinanceStore = create<FinanceStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Sync from GameStore
      syncFromGameState: () => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) {
          set(initialState, false, 'financeStore/syncFromGameState/noGame');
          return;
        }

        // Calculate weekly wage bill
        const players = gameState.playerTeam.players || [];
        const staff = gameState.playerTeam.staff || [];
        const playerWages = players.reduce((sum, p) => sum + (p.contract?.weeklyWage || 0), 0);
        const staffWages = staff.reduce((sum, s) => sum + (s.salary || 0), 0);
        const weeklyWageBill = playerWages + staffWages;

        set(
          {
            currentBudget: gameState.playerTeam.budget,
            weeklyWageBill,
            // TODO: Transactions not yet implemented in Team type
            transactions: [],
          },
          false,
          'financeStore/syncFromGameState'
        );
      },

      // Update budget
      updateBudget: (amount, reason) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const newBudget = gameState.playerTeam.budget + amount;

        // Update GameStore
        useGameStore.getState().updateGameState((state) => ({
          ...state,
          playerTeam: {
            ...state.playerTeam,
            budget: newBudget,
          },
        }));

        // Add transaction
        get().addTransaction({
          type: amount > 0 ? 'income' : 'expense',
          amount: Math.abs(amount),
          description: reason,
          category: 'other',
          weekNumber: gameState.season?.currentWeek || 1,
        });

        // Sync local state
        set({ currentBudget: newBudget }, false, 'financeStore/updateBudget');

        // Notify user if significant change
        if (Math.abs(amount) >= 5) {
          useUIStore.getState().addNotification({
            type: amount > 0 ? 'success' : 'info',
            message: `${amount > 0 ? '+' : ''}£${amount}m - ${reason}`,
            duration: 3000,
          });
        }
      },

      // Check if can afford
      canAfford: (amount) => {
        const budget = get().currentBudget;
        return budget >= amount;
      },

      // Add transaction
      addTransaction: (transaction) => {
        const gameState = useGameStore.getState().gameState;
        if (!gameState) return;

        const newTransaction: Transaction = {
          ...transaction,
          id: generateTransactionId(),
          date: new Date(),
        };

        // TODO: Transactions not yet implemented in Team type
        // For now, just store locally in the store
        const updatedTransactions = [...get().transactions, newTransaction];

        // Sync local state
        set({ transactions: updatedTransactions }, false, 'financeStore/addTransaction');
      },

      // Process weekly finances
      processWeeklyFinances: () => {
        get().payWages();
        // Future: Add weekly maintenance costs, sponsorship income, etc.
      },

      // Pay weekly wages
      payWages: () => {
        const wageBill = get().weeklyWageBill;
        if (wageBill > 0) {
          get().updateBudget(-wageBill, 'Weekly wages');
        }
      },

      // Award prize money
      awardPrizeMoney: (amount, reason) => {
        get().updateBudget(amount, reason);
      },

      // Get recent transactions
      recentTransactions: (count) => {
        const transactions = get().transactions;
        return transactions.slice(-count).reverse();
      },

      // Calculate total income over weeks
      totalIncome: (weeks) => {
        const transactions = get().transactions;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

        return transactions
          .filter((t) => t.type === 'income' && new Date(t.date) >= cutoffDate)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      // Calculate total expenses over weeks
      totalExpenses: (weeks) => {
        const transactions = get().transactions;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

        return transactions
          .filter((t) => t.type === 'expense' && new Date(t.date) >= cutoffDate)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      // Calculate net cashflow
      netCashflow: (weeks) => {
        return get().totalIncome(weeks) - get().totalExpenses(weeks);
      },
    }),
    {
      name: 'FinanceStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Finance Store Selectors
 */
export const financeSelectors = {
  // Budget
  currentBudget: (state: FinanceStore) => state.currentBudget,
  weeklyWageBill: (state: FinanceStore) => state.weeklyWageBill,

  // Derived
  canAffordAmount: (amount: number) => (state: FinanceStore) => state.canAfford(amount),

  // Transactions
  allTransactions: (state: FinanceStore) => state.transactions,
  transactionCount: (state: FinanceStore) => state.transactions.length,

  // Recent data
  last10Transactions: (state: FinanceStore) => state.recentTransactions(10),
  weeklyIncome: (state: FinanceStore) => state.totalIncome(1),
  weeklyExpenses: (state: FinanceStore) => state.totalExpenses(1),
  weeklyCashflow: (state: FinanceStore) => state.netCashflow(1),
};

/**
 * Subscribe to GameStore changes to keep finance data in sync
 * Note: Subscription is now set up in stores/index.ts via setupStoreSubscriptions()
 */
