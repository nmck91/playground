# Zustand Store Architecture - Football Director

**Status**: Design Phase
**Created**: 2025-12-25
**Epic**: 1.2 - Zustand State Management Migration
**Story**: 1.2.1 - Design Zustand Store Architecture

---

## Overview

This document defines the Zustand store architecture for Football Director, replacing the current composable hooks pattern with a centralized, performant state management solution.

### Why Zustand?

- **Lightweight**: ~1KB, minimal bundle impact
- **Performance**: Selective subscriptions via selectors prevent unnecessary re-renders
- **DevTools**: Redux DevTools integration for debugging
- **Simplicity**: No providers, no context, just hooks
- **TypeScript**: Excellent TypeScript support
- **Testing**: Easy to test stores in isolation

### Current State (Hooks)

The game currently uses a refactored hook architecture:
- `useGameState.ts` (142 lines) - Main orchestrator
- `useGamePersistence.ts` (2.8K) - Save/load operations
- `useGameActions.ts` (13K) - User actions (buy, sell, hire, tactics)
- `useDerivedGameState.ts` (1.2K) - Computed values
- `useWeeklySimulation.ts` (27K) - Weekly simulation orchestration

**Total**: ~44K lines of hook code

---

## Store Domains

Zustand stores will be organized by domain, with clear boundaries and responsibilities.

### 1. Game Store (`useGameStore`)
**Purpose**: Core game state and metadata

**State**:
```typescript
interface GameStore {
  // Core game state
  gameState: GameState | null;

  // Metadata
  gameId: string | null;
  currentSaveSlot: number | null;
  lastSaved: Date | null;

  // Actions
  setGameState: (state: GameState) => void;
  updateGameState: (updater: (state: GameState) => GameState) => void;
  resetGame: () => void;
}
```

**Responsibilities**:
- Hold the main GameState object
- Track which save slot is active
- Provide basic state update methods
- NOT responsible for business logic (that's in other stores)

---

### 2. Season Store (`useSeasonStore`)
**Purpose**: Season progression, fixtures, and week management

**State**:
```typescript
interface SeasonStore {
  // Derived from gameState.season
  currentWeek: number;
  currentPhase: SeasonPhase;
  fixtures: Fixture[];
  cupFixtures: CupFixture[];
  leagueTable: TableEntry[];

  // UI state
  seasonTopPerformers: SeasonTopPerformers | null;
  seasonEvaluation: SeasonEvaluation | null;

  // Actions
  simulateWeek: () => Promise<void>;
  continueToNextSeason: () => void;
  updateLeagueTable: (results: MatchResult[]) => void;

  // Selectors (computed)
  hasMatchesThisWeek: () => boolean;
  nextFixture: () => Fixture | null;
  remainingWeeks: () => number;
}
```

**Responsibilities**:
- Season progression logic
- Fixture scheduling and management
- League table calculations
- Week-by-week simulation orchestration
- End of season processing

**Dependencies**:
- Reads from: `GameStore` (gameState.season, gameState.league)
- Writes to: `GameStore` (via setGameState)
- Calls: `MatchStore`, `PlayerStore`, `FinanceStore`

---

### 3. Match Store (`useMatchStore`)
**Purpose**: Match simulation, results, and commentary

**State**:
```typescript
interface MatchStore {
  // Match results
  lastSimulationResults: MatchResult[];
  matchPreviews: MatchPreview[];
  matchHighlights: MatchEvent[];

  // UI state
  selectedMatchId: string | null;
  showMatchReport: boolean;

  // Actions
  simulateMatch: (fixture: Fixture) => MatchResult;
  simulateMatches: (fixtures: Fixture[]) => MatchResult[];
  generatePreview: (fixture: Fixture) => MatchPreview;
  clearMatchResults: () => void;

  // Selectors
  getMatchResult: (fixtureId: string) => MatchResult | null;
  playerMatchStats: (playerId: string) => MatchStats;
}
```

**Responsibilities**:
- Match simulation via MatchSimulator engine
- Match commentary and event generation
- Match previews and analysis
- Match result storage and retrieval
- Player match statistics

**Dependencies**:
- Reads from: `GameStore` (teams, players, tactics)
- Writes to: `PlayerStore` (stats, injuries, morale)
- Independent of other stores during simulation

---

### 4. Player Store (`usePlayerStore`)
**Purpose**: Player management, development, contracts, and morale

**State**:
```typescript
interface PlayerStore {
  // Cached player data (derived from gameState)
  allPlayers: Player[];
  squadPlayers: Player[];
  freeAgents: Player[];

  // Development tracking
  developmentReports: DevelopmentReport[];
  youthProspects: Player[];

  // UI state
  selectedPlayerId: string | null;
  showPlayerModal: boolean;

  // Actions
  updatePlayerStats: (playerId: string, stats: Partial<PlayerStats>) => void;
  updatePlayerMorale: (playerId: string, change: number) => void;
  injurePlayer: (playerId: string, injury: Injury) => void;
  developPlayers: (players: Player[]) => DevelopmentReport[];
  processContractExpiries: () => void;
  offerContract: (playerId: string, terms: ContractTerms) => boolean;

  // Selectors
  getPlayerById: (id: string) => Player | null;
  topPerformers: (category: string, limit: number) => Player[];
  expiringContracts: (weeksRemaining: number) => Player[];
  injuredPlayers: () => Player[];
}
```

**Responsibilities**:
- Player data management
- Player development and aging
- Injury management
- Contract processing and renewals
- Morale calculations
- Free agent creation
- Youth academy management

**Dependencies**:
- Reads from: `GameStore` (players, youth academy)
- Writes to: `GameStore` (via player updates)
- Called by: `MatchStore`, `SeasonStore`, `TransferStore`

---

### 5. Transfer Store (`useTransferStore`)
**Purpose**: Transfer market, player trading, and AI transfers

**State**:
```typescript
interface TransferStore {
  // Transfer market
  transferListings: TransferListing[];
  marketLastRefreshed: Date | null;

  // UI state
  selectedListing: TransferListing | null;
  showTransferModal: boolean;

  // Actions
  refreshMarket: () => void;
  buyPlayer: (listing: TransferListing) => boolean;
  sellPlayer: (playerId: string, askingPrice: number) => void;
  processAITransfers: () => void;

  // Selectors
  availableListings: () => TransferListing[];
  affordableListings: (budget: number) => TransferListing[];
  listingsByPosition: (position: string) => TransferListing[];
}
```

**Responsibilities**:
- Transfer market generation and refresh
- Player buying/selling logic
- AI team transfer decisions
- Budget validation for transfers
- Transfer history tracking

**Dependencies**:
- Reads from: `GameStore` (players, teams, budget)
- Writes to: `GameStore`, `PlayerStore`, `FinanceStore`
- Calls: `PlayerStore` (add/remove players), `FinanceStore` (budget updates)

---

### 6. Finance Store (`useFinanceStore`)
**Purpose**: Budget, wages, transactions, and prize money

**State**:
```typescript
interface FinanceStore {
  // Financial state (derived from gameState)
  currentBudget: number;
  weeklyWageBill: number;
  transactions: Transaction[];

  // Actions
  processWeeklyFinances: () => void;
  addTransaction: (transaction: Transaction) => void;
  updateBudget: (amount: number, reason: string) => void;
  payWages: () => void;
  awardPrizeMoney: (amount: number, reason: string) => void;

  // Selectors
  canAfford: (amount: number) => boolean;
  recentTransactions: (count: number) => Transaction[];
  totalIncome: (weeks: number) => number;
  totalExpenses: (weeks: number) => number;
  netCashflow: (weeks: number) => number;
}
```

**Responsibilities**:
- Budget management
- Weekly wage processing
- Transaction logging
- Prize money distribution
- Financial calculations

**Dependencies**:
- Reads from: `GameStore` (budget, players for wages)
- Writes to: `GameStore` (budget updates, transactions)
- Called by: `TransferStore`, `SeasonStore`, `StaffStore`

---

### 7. Staff Store (`useStaffStore`)
**Purpose**: Staff management (coaches, scouts, physios)

**State**:
```typescript
interface StaffStore {
  // Staff (derived from gameState)
  currentStaff: Staff[];

  // Actions
  hireStaff: (staff: Staff) => boolean;
  fireStaff: (staffId: string) => void;
  processStaffEffects: () => void;

  // Selectors
  getStaffByRole: (role: StaffRole) => Staff[];
  totalStaffWages: () => number;
  staffBonus: (type: string) => number;
}
```

**Responsibilities**:
- Staff hiring and firing
- Staff wage management
- Staff bonuses to player development/morale/recovery

**Dependencies**:
- Reads from: `GameStore` (staff)
- Writes to: `GameStore`, `FinanceStore`
- Called by: `PlayerStore` (for bonuses)

---

### 8. Tactics Store (`useTacticsStore`)
**Purpose**: Team tactics, formation, and player roles

**State**:
```typescript
interface TacticsStore {
  // Tactics (derived from gameState.playerTeam.tactics)
  currentFormation: Formation;
  currentMentality: Mentality;
  playerRoles: Record<string, PlayerRole>;
  teamInstructions: TeamInstructions;
  setPieceTakers: SetPieceTakers;

  // Actions
  setFormation: (formation: Formation) => void;
  setMentality: (mentality: Mentality) => void;
  setPlayerRole: (playerId: string, role: PlayerRole) => void;
  setTeamInstructions: (instructions: Partial<TeamInstructions>) => void;
  setSetPieceTakers: (takers: Partial<SetPieceTakers>) => void;
  setTeamTactics: (tactics: Tactics) => void;

  // Selectors
  getTacticsForMatch: () => Tactics;
  formationPositions: () => Record<string, Position>;
}
```

**Responsibilities**:
- Tactics management
- Formation changes
- Player role assignments
- Team instructions
- Set piece taker selection

**Dependencies**:
- Reads from: `GameStore` (playerTeam.tactics)
- Writes to: `GameStore`
- Used by: `MatchStore` (for match simulation)

---

### 9. UI Store (`useUIStore`)
**Purpose**: Modal states, notifications, loading indicators, and UI-only state

**State**:
```typescript
interface UIStore {
  // Modal states
  modals: {
    playerStats: boolean;
    transferMarket: boolean;
    tactics: boolean;
    contractNegotiation: boolean;
    youthAcademy: boolean;
    // ... more modals
  };
  modalData: Record<string, any>;

  // Notifications
  notifications: Notification[];
  pendingAchievements: Achievement[];

  // Loading states
  isSimulating: boolean;
  isSaving: boolean;
  isLoading: boolean;

  // News
  unreadNewsCount: number;

  // Actions
  openModal: (modal: string, data?: any) => void;
  closeModal: (modal: string) => void;
  closeAllModals: () => void;
  addNotification: (notification: Notification) => void;
  dismissNotification: (id: string) => void;
  addAchievement: (achievement: Achievement) => void;
  dismissAchievement: (id: string) => void;
  markNewsRead: () => void;
  setSimulating: (value: boolean) => void;

  // Selectors
  isModalOpen: (modal: string) => boolean;
  activeNotifications: () => Notification[];
}
```

**Responsibilities**:
- Modal state management (open/close)
- Notification system
- Achievement popups
- Loading indicators
- News read/unread tracking
- Pure UI state (no game logic)

**Dependencies**:
- Independent (no dependencies on other stores)
- Other stores can write notifications/achievements here

---

### 10. Save Store (`useSaveStore`)
**Purpose**: Save/load operations, slot management, and sync state

**State**:
```typescript
interface SaveStore {
  // Save metadata
  availableSlots: SaveSlot[];
  currentSlot: number | null;
  lastSaved: Date | null;
  autoSaveEnabled: boolean;

  // Sync state (future: backend sync)
  syncStatus: 'synced' | 'syncing' | 'offline' | 'conflict';
  lastSynced: Date | null;

  // Loading state
  isLoading: boolean;
  loadError: string | null;

  // Actions
  loadGame: (slot: number) => Promise<void>;
  saveGame: () => Promise<void>;
  newGame: (saveName: string) => Promise<void>;
  deleteSave: (slot: number) => Promise<void>;
  exportSave: (slot: number) => string;
  importSave: (data: string, slot: number) => Promise<void>;

  // Selectors
  hasSave: () => boolean;
  getSaveMetadata: (slot: number) => SaveMetadata | null;
}
```

**Responsibilities**:
- Save/load game state to localStorage
- Multi-slot save management
- Auto-save functionality
- Save import/export
- Future: Cloud sync logic

**Dependencies**:
- Reads/Writes: `GameStore` (entire game state)
- Writes to: `UIStore` (loading indicators, errors)

---

## Inter-Store Dependencies

### Dependency Graph

```
GameStore (Core State)
    ↓ (reads)
    ├── SeasonStore → MatchStore → PlayerStore
    ├── TransferStore → PlayerStore, FinanceStore
    ├── StaffStore → FinanceStore
    ├── PlayerStore → FinanceStore
    ├── TacticsStore
    └── SaveStore

UIStore (Independent)
    ← (writes notifications)
    All stores can write to UIStore
```

### Data Flow Patterns

#### 1. Weekly Simulation Flow
```
User clicks "Simulate Week"
    ↓
SeasonStore.simulateWeek()
    ↓
    ├── MatchStore.simulateMatches() → PlayerStore.updateStats()
    ├── PlayerStore.processInjuries()
    ├── PlayerStore.updateMorale()
    ├── PlayerStore.processContracts()
    ├── FinanceStore.processWeeklyFinances()
    ├── TransferStore.processAITransfers()
    ├── PlayerStore.developPlayers()
    └── SeasonStore.updateLeagueTable()
    ↓
GameStore.setGameState(updated)
    ↓
SaveStore.autoSave() (if enabled)
    ↓
UIStore.setSimulating(false)
```

#### 2. Transfer Flow
```
User buys player
    ↓
TransferStore.buyPlayer(listing)
    ↓
    ├── FinanceStore.canAfford(price) → validate
    ├── PlayerStore.addPlayer(player)
    ├── FinanceStore.updateBudget(-price)
    └── UIStore.addNotification("Player signed!")
    ↓
GameStore.updateGameState(changes)
    ↓
SaveStore.autoSave()
```

#### 3. End of Season Flow
```
Last week simulated
    ↓
SeasonStore.continueToNextSeason()
    ↓
    ├── PlayerStore.processContractExpiries() → create free agents
    ├── PlayerStore.developPlayers() → age +1, skill changes
    ├── PlayerStore.selectYouthProspects()
    ├── FinanceStore.awardPrizeMoney(finalPosition)
    ├── SeasonStore.archiveStats()
    └── SeasonStore.startNewSeason()
    ↓
UIStore.setSeasonEvaluation(results)
UIStore.setDevelopmentReports(reports)
```

### Circular Dependency Prevention

**Rule**: Stores should NOT directly call actions on other stores.

**Instead**:
- Use **events** for cross-store communication
- Use **middleware** for orchestration
- Use **derived state** (selectors) to read from other stores

**Example**: TransferStore needs to update PlayerStore and FinanceStore:

❌ **Bad** (direct coupling):
```typescript
// In TransferStore
buyPlayer(listing) {
  playerStore.addPlayer(listing.player); // Direct call
  financeStore.updateBudget(-listing.price); // Direct call
}
```

✅ **Good** (update GameStore, others react):
```typescript
// In TransferStore
buyPlayer(listing) {
  const gameState = useGameStore.getState().gameState;
  const updated = {
    ...gameState,
    playerTeam: {
      ...gameState.playerTeam,
      players: [...gameState.playerTeam.players, listing.player],
      budget: gameState.playerTeam.budget - listing.price
    }
  };
  useGameStore.getState().setGameState(updated);
}
```

Or use an **orchestration action** in GameStore:
```typescript
// In GameStore
executeTransfer(listing) {
  // Orchestrate multiple updates atomically
  this.updateGameState(state => {
    const newPlayers = [...state.playerTeam.players, listing.player];
    const newBudget = state.playerTeam.budget - listing.price;
    return {
      ...state,
      playerTeam: {
        ...state.playerTeam,
        players: newPlayers,
        budget: newBudget
      }
    };
  });
}
```

---

## TypeScript Interfaces

### Store Type Definitions

All stores will use Zustand's TypeScript patterns:

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Store State Interface
interface GameState {
  gameState: GameState | null;
  gameId: string | null;
  currentSaveSlot: number | null;
}

// Store Actions Interface
interface GameActions {
  setGameState: (state: GameState) => void;
  updateGameState: (updater: (state: GameState) => GameState) => void;
  resetGame: () => void;
}

// Combined Store Interface
type GameStore = GameState & GameActions;

// Store Creation
export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      // State
      gameState: null,
      gameId: null,
      currentSaveSlot: null,

      // Actions
      setGameState: (state) => set({ gameState: state }),
      updateGameState: (updater) => set((state) => ({
        gameState: state.gameState ? updater(state.gameState) : null
      })),
      resetGame: () => set({ gameState: null, gameId: null, currentSaveSlot: null }),
    }),
    { name: 'GameStore' }
  )
);
```

### Selector Types

```typescript
// Selector function types
type Selector<T, U> = (state: T) => U;

// Example selectors
const selectCurrentWeek: Selector<GameStore, number | null> =
  (state) => state.gameState?.season.currentWeek ?? null;

const selectPlayerBudget: Selector<GameStore, number> =
  (state) => state.gameState?.playerTeam.budget ?? 0;
```

---

## Selector Patterns for Performance

### Problem: Re-renders

React components re-render when **any** part of their subscribed state changes. Without selectors, subscribing to a store causes re-renders on every state change.

### Solution: Selective Subscriptions

Use **selectors** to subscribe only to specific slices of state.

### Pattern 1: Basic Selector

```typescript
// ❌ Bad - Re-renders on ANY game state change
function Dashboard() {
  const gameState = useGameStore(state => state.gameState);
  const currentWeek = gameState?.season.currentWeek;
  // ...
}

// ✅ Good - Only re-renders when currentWeek changes
function Dashboard() {
  const currentWeek = useGameStore(state => state.gameState?.season.currentWeek);
  // ...
}
```

### Pattern 2: Multiple Selectors

```typescript
// ✅ Separate selectors for independent values
function PlayerList() {
  const players = useGameStore(state => state.gameState?.playerTeam.players);
  const budget = useGameStore(state => state.gameState?.playerTeam.budget);
  // Only re-renders when players OR budget changes
}
```

### Pattern 3: Derived Selectors

```typescript
// ✅ Create selector functions for complex derivations
const selectTopScorers = (state: GameStore) => {
  const players = state.gameState?.playerTeam.players ?? [];
  return players
    .filter(p => p.stats.goals > 0)
    .sort((a, b) => b.stats.goals - a.stats.goals)
    .slice(0, 10);
};

function TopScorers() {
  const topScorers = useGameStore(selectTopScorers);
  // Only re-renders when top scorers list changes
}
```

### Pattern 4: Shallow Equality

For objects/arrays, use Zustand's `shallow` comparator:

```typescript
import { shallow } from 'zustand/shallow';

// ✅ Compare object contents, not reference
function Squad() {
  const { players, budget } = useGameStore(
    state => ({
      players: state.gameState?.playerTeam.players,
      budget: state.gameState?.playerTeam.budget
    }),
    shallow // Shallow comparison
  );
}
```

### Pattern 5: Memoized Selectors

For expensive computations, create reusable selectors:

```typescript
// In a separate file: selectors.ts
export const selectAffordableListings = (budget: number) => (state: TransferStore) => {
  return state.transferListings.filter(listing => listing.price <= budget);
};

// In component
function TransferMarket() {
  const budget = useGameStore(state => state.gameState?.playerTeam.budget ?? 0);
  const affordable = useTransferStore(selectAffordableListings(budget));
}
```

### Pattern 6: Computed Values in Store

Store frequently-used derived values in the store itself:

```typescript
// In store definition
interface SeasonStore {
  // Derived state (updated when gameState changes)
  hasMatchesThisWeek: boolean;
  remainingWeeks: number;

  // Actions update derived state
  updateDerivedState: () => void;
}

// Update derived state whenever game state changes
useGameStore.subscribe(
  (state) => state.gameState?.season.currentWeek,
  () => useSeasonStore.getState().updateDerivedState()
);
```

---

## Migration Strategy

### Phase 1: Infrastructure Setup (Story 1.2.2)

**Goal**: Install Zustand, create empty stores, configure DevTools

**Tasks**:
1. Install `zustand` package
2. Create store directory structure:
   ```
   apps/football-director/src/stores/
     ├── gameStore.ts
     ├── seasonStore.ts
     ├── matchStore.ts
     ├── playerStore.ts
     ├── transferStore.ts
     ├── financeStore.ts
     ├── staffStore.ts
     ├── tacticsStore.ts
     ├── uiStore.ts
     ├── saveStore.ts
     ├── index.ts (exports all stores)
     └── selectors/
         ├── gameSelectors.ts
         ├── playerSelectors.ts
         └── ...
   ```
3. Create initial store skeletons with DevTools middleware
4. Export store hooks from index.ts

**Validation**: Stores can be imported and used (even if empty)

---

### Phase 2: Parallel Implementation (Stories 1.2.3 - 1.2.4)

**Goal**: Implement Zustand stores alongside existing hooks (no breaking changes)

**Approach**: Dual-write pattern
- Hooks continue to work as before
- New Zustand stores mirror the state
- Both systems updated simultaneously

**Example**:
```typescript
// Old hook (still works)
const { gameState, actions } = useGameState();

// New store (being tested)
const gameState = useGameStore(state => state.gameState);
const setGameState = useGameStore(state => state.setGameState);

// Both stay in sync during migration
```

**Tasks per Store**:
1. Implement store state interface
2. Implement store actions
3. Write unit tests for store
4. Test integration with other stores
5. Add selectors for common use cases

**Order of Implementation**:
1. **GameStore** (foundation - holds core state)
2. **UIStore** (independent, can be migrated immediately)
3. **SaveStore** (interacts with GameStore only)
4. **FinanceStore** (simple, few dependencies)
5. **TacticsStore** (simple, independent)
6. **StaffStore** (simple, calls FinanceStore)
7. **PlayerStore** (complex, many dependencies)
8. **MatchStore** (depends on PlayerStore)
9. **TransferStore** (depends on PlayerStore, FinanceStore)
10. **SeasonStore** (orchestrator, depends on all others)

---

### Phase 3: Component Migration (Story 1.2.5)

**Goal**: Migrate components from hooks to Zustand stores, one page at a time

**Migration Order** (least to most complex):
1. **Records Page** (read-only, simple)
2. **Trophies Page** (read-only, simple)
3. **News Page** (read-only + mark as read)
4. **Stats Page** (read-only, derived data)
5. **Table Page** (read-only, derived data)
6. **Tactics Page** (reads + updates tactics)
7. **Staff Page** (reads + hire/fire actions)
8. **Squad Page** (reads players, modal interactions)
9. **Fixtures Page** (reads fixtures, simulates matches)
10. **Transfers Page** (complex buy/sell logic)
11. **Dashboard** (orchestrates everything, simulate week)

**Per-Page Migration Process**:
1. Identify which hooks the page uses
2. Replace hook usage with equivalent Zustand selectors/actions
3. Test page functionality
4. Verify no performance regressions
5. Remove old hook import

---

### Phase 4: Hook Removal (Story 1.2.6)

**Goal**: Remove old hooks once all components migrated

**Tasks**:
1. Verify all components use Zustand stores
2. Remove `useGameState.ts` and sub-hooks
3. Delete hook test files
4. Remove hook-related utilities
5. Update documentation
6. Clean up exports from hooks/index.ts

**Validation**:
- Search codebase for `useGameState` imports (should be zero)
- All pages work correctly
- All tests pass
- No bundle size regression

---

### Phase 5: Optimization (Story 1.2.7)

**Goal**: Optimize store performance and bundle size

**Tasks**:
1. Analyze re-render patterns with React DevTools Profiler
2. Optimize selectors to prevent unnecessary re-renders
3. Add computed values to stores for frequently-used derivations
4. Implement memoization where needed
5. Benchmark performance vs. old hooks
6. Document optimizations

**Success Metrics**:
- Component re-renders reduced by >50%
- Weekly simulation performance maintained (<2s)
- Bundle size increase <10KB (Zustand is tiny)

---

## Integration with React Components

### Basic Usage

```typescript
// Simple selector
function Dashboard() {
  const currentWeek = useGameStore(state => state.gameState?.season.currentWeek);
  return <div>Week {currentWeek}</div>;
}
```

### Multiple Values

```typescript
// Multiple selectors with shallow comparison
import { shallow } from 'zustand/shallow';

function Header() {
  const { teamName, budget, week } = useGameStore(
    state => ({
      teamName: state.gameState?.playerTeam.name,
      budget: state.gameState?.playerTeam.budget,
      week: state.gameState?.season.currentWeek,
    }),
    shallow
  );

  return (
    <header>
      <h1>{teamName}</h1>
      <p>Budget: £{budget}m | Week {week}</p>
    </header>
  );
}
```

### Actions

```typescript
// Call store actions
function SimulateButton() {
  const simulateWeek = useSeasonStore(state => state.simulateWeek);
  const isSimulating = useUIStore(state => state.isSimulating);

  return (
    <button onClick={simulateWeek} disabled={isSimulating}>
      {isSimulating ? 'Simulating...' : 'Simulate Week'}
    </button>
  );
}
```

### Derived State

```typescript
// Using selector functions
import { selectTopScorers } from '../stores/selectors/playerSelectors';

function TopScorers() {
  const topScorers = usePlayerStore(selectTopScorers);

  return (
    <ul>
      {topScorers.map(player => (
        <li key={player.id}>
          {player.name} - {player.stats.goals} goals
        </li>
      ))}
    </ul>
  );
}
```

---

## Testing Strategy

### Unit Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './gameStore';

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().resetGame();
  });

  it('should set game state', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setGameState(mockGameState);
    });

    expect(result.current.gameState).toEqual(mockGameState);
  });

  it('should update game state with updater function', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setGameState(mockGameState);
      result.current.updateGameState(state => ({
        ...state,
        season: { ...state.season, currentWeek: 10 }
      }));
    });

    expect(result.current.gameState?.season.currentWeek).toBe(10);
  });
});
```

### Integration Testing

```typescript
// Test cross-store interactions
describe('Transfer Integration', () => {
  it('should update player list and budget when buying player', () => {
    const gameStore = useGameStore.getState();
    const transferStore = useTransferStore.getState();

    // Setup
    gameStore.setGameState(mockGameStateWithBudget);

    // Action
    const success = transferStore.buyPlayer(mockListing);

    // Assertions
    expect(success).toBe(true);
    const newState = gameStore.gameState;
    expect(newState.playerTeam.players).toContainEqual(mockListing.player);
    expect(newState.playerTeam.budget).toBe(mockBudget - mockListing.price);
  });
});
```

---

## Performance Considerations

### Selector Optimization

**Best Practices**:
1. **Granular Selectors**: Subscribe to smallest possible slice
2. **Shallow Comparison**: Use `shallow` for object/array selectors
3. **Memoized Selectors**: Cache expensive computations
4. **Computed State**: Store derived values in store when accessed frequently

### Re-render Prevention

**Common Causes**:
- Subscribing to entire store
- Creating new objects/arrays in selectors
- Not using shallow comparison for objects

**Solutions**:
- Use specific selectors
- Use `shallow` from zustand
- Memoize selectors with `useMemo` if needed

### DevTools Impact

Redux DevTools has minimal performance impact but can be disabled in production:

```typescript
export const useGameStore = create<GameStore>()(
  process.env.NODE_ENV === 'development'
    ? devtools(storeImpl, { name: 'GameStore' })
    : storeImpl
);
```

---

## Future Enhancements

### 1. Persistence Middleware

Zustand supports middleware for automatic persistence:

```typescript
import { persist } from 'zustand/middleware';

export const useGameStore = create<GameStore>()(
  persist(
    devtools(storeImpl),
    { name: 'football-director-game' }
  )
);
```

### 2. Immer Middleware

For easier immutable updates:

```typescript
import { immer } from 'zustand/middleware/immer';

export const useGameStore = create<GameStore>()(
  immer((set) => ({
    // Can use mutable-style updates
    updateGameState: (updater) => set((state) => {
      state.gameState = updater(state.gameState);
    })
  }))
);
```

### 3. Subscriptions

Subscribe to state changes outside React:

```typescript
useGameStore.subscribe(
  (state) => state.gameState?.season.currentWeek,
  (currentWeek) => {
    console.log('Week changed:', currentWeek);
    // Trigger side effects
  }
);
```

### 4. Middleware for Auto-Save

```typescript
// Auto-save middleware
const autoSaveMiddleware = (config) => (set, get, api) => {
  api.subscribe((state) => {
    // Save to localStorage whenever game state changes
    if (state.gameState) {
      SaveService.autoSave(state.gameState);
    }
  });
  return config(set, get, api);
};
```

---

## Appendix: Comparison with Current Hooks

| Aspect | Current Hooks | Zustand Stores |
|--------|---------------|----------------|
| **Lines of Code** | ~44K (hooks) | ~30K estimated (stores + selectors) |
| **Complexity** | Medium (composable hooks) | Low (flat stores) |
| **Performance** | Good (optimized hooks) | Excellent (selective subscriptions) |
| **Testing** | Complex (mock all hooks) | Simple (test stores independently) |
| **DevTools** | Limited | Redux DevTools integration |
| **Bundle Size** | ~0KB (React built-in) | ~1KB (Zustand) |
| **Learning Curve** | Familiar to React devs | Minimal (simple API) |
| **Scalability** | Moderate (prop drilling) | High (global state) |

---

## Acceptance Criteria

- [x] Store domains defined (10 stores)
- [x] Responsibilities documented for each store
- [x] Inter-store dependencies mapped
- [x] TypeScript interfaces designed
- [x] Selector patterns documented
- [x] Migration strategy defined (5 phases)
- [x] Integration patterns with React documented
- [x] Testing strategy defined
- [x] Performance considerations documented
- [ ] Architecture review and approval

---

## Next Steps

1. **Review**: Get approval on store architecture design
2. **Story 1.2.2**: Implement core Zustand stores (GameStore, UIStore, SaveStore)
3. **Story 1.2.3**: Implement domain stores (PlayerStore, MatchStore, etc.)
4. **Story 1.2.4**: Implement orchestration logic (SeasonStore)
5. **Story 1.2.5**: Migrate components to Zustand
6. **Story 1.2.6**: Remove old hooks
7. **Story 1.2.7**: Performance optimization

---

**Document Status**: Ready for Review
**Last Updated**: 2025-12-25
**Author**: John (PM Agent) + Claude Sonnet 4.5
