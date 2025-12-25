# Football Director - Zustand Stores

Centralized state management using Zustand for the Football Director game.

## Store Overview

### Core Stores (Implemented ✅)

1. **GameStore** (`gameStore.ts`) - Core game state holder
   - Holds the main GameState object
   - Tracks game metadata (ID, save slot, last saved)
   - Provides basic state update methods

2. **UIStore** (`uiStore.ts`) - UI state management
   - Modal state management
   - Notifications system
   - Achievement popups
   - Loading indicators
   - News read/unread tracking

3. **SaveStore** (`saveStore.ts`) - Save/load operations
   - Save/load game state
   - Multi-slot save management
   - Auto-save functionality
   - Import/export saves
   - Integrates with SaveService

### Planned Stores (Not Yet Implemented)

4. **SeasonStore** - Season progression & fixtures
5. **MatchStore** - Match simulation & results
6. **PlayerStore** - Player management & development
7. **TransferStore** - Transfer market & trading
8. **FinanceStore** - Budget & financial tracking
9. **StaffStore** - Staff management
10. **TacticsStore** - Tactics & formations

## Usage

### Basic Usage

```typescript
import { useGameStore, useUIStore, useSaveStore } from '@/stores';

function MyComponent() {
  // Select specific state (prevents unnecessary re-renders)
  const currentWeek = useGameStore(state => state.gameState?.season.currentWeek);
  const isSimulating = useUIStore(state => state.isSimulating);

  // Get actions
  const saveGame = useSaveStore(state => state.saveGame);

  return (
    <div>
      <p>Week {currentWeek}</p>
      <button onClick={saveGame} disabled={isSimulating}>
        Save Game
      </button>
    </div>
  );
}
```

### Using Selectors

```typescript
import { useGameStore, gameSelectors } from '@/stores';

function Dashboard() {
  // Use pre-defined selectors
  const teamName = useGameStore(gameSelectors.teamName);
  const budget = useGameStore(gameSelectors.budget);
  const hasGame = useGameStore(gameSelectors.hasGame);

  if (!hasGame) {
    return <div>No game loaded</div>;
  }

  return (
    <div>
      <h1>{teamName}</h1>
      <p>Budget: £{budget}m</p>
    </div>
  );
}
```

### Multiple State Values

```typescript
import { useUIStore } from '@/stores';
import { shallow } from 'zustand/shallow';

function Notifications() {
  // Use shallow comparison for objects
  const { notifications, dismissNotification } = useUIStore(
    state => ({
      notifications: state.notifications,
      dismissNotification: state.dismissNotification,
    }),
    shallow
  );

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => dismissNotification(notification.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Actions

```typescript
import { useUIStore, useSaveStore } from '@/stores';

function GameControls() {
  const openModal = useUIStore(state => state.openModal);
  const newGame = useSaveStore(state => state.newGame);
  const loadGame = useSaveStore(state => state.loadGame);

  const handleNewGame = async () => {
    await newGame('My Save');
    openModal('seasonEvaluation');
  };

  return (
    <div>
      <button onClick={handleNewGame}>New Game</button>
      <button onClick={() => loadGame(1)}>Load Slot 1</button>
    </div>
  );
}
```

## Redux DevTools

All stores are integrated with Redux DevTools for debugging in development mode.

### How to Use DevTools

1. Install Redux DevTools extension in your browser
2. Open DevTools (F12) and go to the Redux tab
3. You'll see all stores listed (GameStore, UIStore, SaveStore)
4. Each action is logged with its name (e.g., `gameStore/setGameState`)
5. You can time-travel, inspect state, and dispatch actions

### Action Names

Actions follow the pattern `storeName/actionName`:
- `gameStore/setGameState`
- `gameStore/updateGameState`
- `uiStore/openModal`
- `uiStore/addNotification`
- `saveStore/loadGame`
- etc.

## Testing

All stores have comprehensive unit tests using Vitest and @testing-library/react.

### Running Tests

```bash
# Run all tests
npx nx test football-director

# Run only store tests
npx nx test football-director --testPathPattern=stores
```

### Test Coverage

- **GameStore**: 12 tests covering state management and selectors
- **UIStore**: 24 tests covering modals, notifications, achievements, loading states
- **SaveStore**: (tests to be added)

## Migration from Hooks

The Zustand stores are currently implemented alongside the existing hooks in a **dual-write pattern**:

1. **Current State**: Both hooks and stores work independently
2. **Next Steps**: Migrate components from hooks to stores
3. **Final State**: Remove old hooks once all components migrated

### Benefits vs Hooks

| Feature | Hooks | Zustand |
|---------|-------|---------|
| Bundle Size | 0KB | +1KB |
| DevTools | Limited | Full Redux DevTools |
| Performance | Good | Better (selective subscriptions) |
| Testing | Complex | Simple (isolated stores) |
| Code Complexity | Medium | Low |

## Architecture

See `docs/football-director/zustand-architecture.md` for the complete architecture design.

### Key Design Decisions

1. **No Circular Dependencies**: Stores update GameStore, not each other
2. **Selective Subscriptions**: Use selectors to prevent unnecessary re-renders
3. **Shallow Equality**: Use `shallow` from zustand for object comparisons
4. **DevTools Integration**: Enabled in development for debugging
5. **TypeScript First**: Full type safety with TypeScript interfaces

## Future Enhancements

1. **Persistence Middleware**: Auto-persist to localStorage
2. **Immer Middleware**: Easier immutable updates
3. **Subscriptions**: React to state changes outside components
4. **Auto-save Middleware**: Automatic game saves on state changes

## Contributing

When adding new stores:

1. Follow the pattern in existing stores (GameStore, UIStore, SaveStore)
2. Add DevTools middleware with descriptive action names
3. Create pre-defined selectors for common use cases
4. Write comprehensive unit tests
5. Update this README with the new store
6. Export from `index.ts`
