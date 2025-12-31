# Integration Testing Guide

Guide for writing integration tests that verify multi-component interactions, especially for Zustand store orchestration.

## Table of Contents

1. [Overview](#overview)
2. [Store Integration Tests](#store-integration-tests)
3. [Testing Patterns](#testing-patterns)
4. [Common Scenarios](#common-scenarios)
5. [Best Practices](#best-practices)

## Overview

Integration tests verify that multiple components work together correctly. In Football Director, this primarily means testing:

- **Store Orchestration**: Multiple Zustand stores coordinating
- **Game Simulation**: Engine + stores working together
- **State Synchronization**: Stores staying in sync
- **Error Handling**: Graceful failures across components

### Integration vs Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Scope** | Single function/class | Multiple components |
| **Dependencies** | Mocked | Real (mostly) |
| **Speed** | Fast (<1ms) | Slower (10-100ms) |
| **Coverage** | Specific logic | Workflows |
| **Failures** | Pinpoint issues | Identify integration problems |

## Store Integration Tests

### Zustand Store Testing Pattern

**✅ CORRECT: Direct Store Access**

```typescript
import { act } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { useUIStore } from '../uiStore';

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset stores before each test
    useGameStore.getState().resetGame();
    useUIStore.getState().resetUI();
  });

  it('should coordinate GameStore and UIStore', () => {
    const gameState = createMockGameState();

    // Use direct store access (NOT renderHook)
    act(() => {
      useGameStore.getState().setGameState(gameState);
      useGameStore.getState().setGameId('game-123');
    });

    // Direct state assertions
    expect(useGameStore.getState().gameState).toEqual(gameState);
    expect(useGameStore.getState().gameId).toBe('game-123');
    expect(useUIStore.getState().isSimulating).toBe(false);
  });
});
```

**❌ INCORRECT: Using renderHook**

```typescript
// DON'T DO THIS - renderHook is for React hooks that need component lifecycle
const gameHook = renderHook(() => useGameStore());
const uiHook = renderHook(() => useUIStore());

act(() => {
  gameHook.result.current.setGameState(gameState); // Overcomplicated
});

expect(gameHook.result.current.gameState).toEqual(gameState);
```

### File Structure

```
apps/football-director/src/stores/
├── __tests__/
│   └── orchestration.integration.test.ts    # Store orchestration tests
├── gameStore.ts
├── uiStore.ts
├── saveStore.ts
└── gameOrchestratorStore.ts
```

### Test Template

```typescript
/**
 * Store Orchestration Integration Tests
 *
 * Tests the coordination between multiple stores:
 * - GameStore (game state management)
 * - UIStore (UI state)
 * - SaveStore (persistence)
 * - GameOrchestratorStore (complex operations)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { useUIStore } from '../uiStore';
import { useSaveStore } from '../saveStore';
import { useGameOrchestratorStore } from '../gameOrchestratorStore';
import type { GameState } from '@playground/football-director-engine';

// Helper functions
function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    id: 'game-123',
    playerName: 'Test Manager',
    season: { year: 1, currentWeek: 1, ... },
    playerTeam: createMockTeam(),
    aiTeams: [],
    leagueTable: [],
    fixtures: [],
    ...overrides,
  } as GameState;
}

describe('Store Orchestration Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useGameStore.getState().resetGame();
    useUIStore.getState().resetUI();
    useSaveStore.getState().resetSaveStore();
    useGameOrchestratorStore.getState().resetOrchestrator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-Store Coordination', () => {
    it('should initialize stores correctly', () => {
      const gameState = createMockGameState();

      act(() => {
        useGameStore.getState().setGameState(gameState);
      });

      expect(useGameStore.getState().gameState).toEqual(gameState);
      expect(useUIStore.getState().isSimulating).toBe(false);
    });
  });
});
```

## Testing Patterns

### 1. Testing Async Store Operations

```typescript
describe('Async Operations', () => {
  it('should handle async simulation', async () => {
    const gameState = createMockGameState();

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    // Mock async dependencies
    const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
      .mockResolvedValue();

    // Execute async operation
    await act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    // Wait for async state updates
    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });

    // Verify results
    expect(useGameStore.getState().gameState?.season.currentWeek).toBe(2);
    expect(autoSaveSpy).toHaveBeenCalled();

    autoSaveSpy.mockRestore();
  });
});
```

### 2. Testing State Transitions

```typescript
describe('State Transitions', () => {
  it('should manage simulation state correctly', async () => {
    const gameState = createMockGameState();

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
      .mockResolvedValue();

    // Start simulation
    const simulationPromise = act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    // During simulation, isSimulating should be true
    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(true);
      expect(useUIStore.getState().isSimulating).toBe(true);
    }, { timeout: 100 });

    // Wait for completion
    await simulationPromise;
    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });

    // After simulation, both should be false
    expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    expect(useUIStore.getState().isSimulating).toBe(false);

    autoSaveSpy.mockRestore();
  });
});
```

### 3. Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle errors gracefully', async () => {
    // No game state set - should cause error
    await act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    // Should not be simulating after error
    expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    expect(useUIStore.getState().isSimulating).toBe(false);
  });

  it('should clean up state even if auto-save fails', async () => {
    const gameState = createMockGameState();

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    // Mock auto-save to fail
    const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
      .mockRejectedValue(new Error('Save failed'));

    await act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });

    // Simulation state should still be cleaned up
    expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);

    autoSaveSpy.mockRestore();
  });
});
```

### 4. Testing Data Flow

```typescript
describe('Data Flow', () => {
  it('should propagate changes across stores', () => {
    const gameState = createMockGameState();

    // Update GameStore
    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    // Trigger orchestrator action
    act(() => {
      useGameOrchestratorStore.getState().clearSimulationResults();
    });

    // Verify state changes
    expect(useGameOrchestratorStore.getState().lastSimulationResults).toEqual([]);

    // UI should reflect completion
    expect(useUIStore.getState().isSimulating).toBe(false);
  });
});
```

## Common Scenarios

### Season Transition

```typescript
describe('Season Transition Orchestration', () => {
  it('should orchestrate season transition across all stores', async () => {
    // Set up end-of-season state
    const gameState = createMockGameState({
      season: {
        year: 1,
        currentWeek: 52,
        totalWeeks: 52,
        phase: 'competitive',
        status: 'in-progress',
        transferWindow: 'closed',
      },
    });

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
      .mockResolvedValue();

    // Simulate final week
    await act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });

    // Season evaluation should be set
    expect(useGameOrchestratorStore.getState().seasonEvaluation).not.toBeNull();

    // Continue to next season
    act(() => {
      useGameOrchestratorStore.getState().continueToNextSeason();
    });

    // Verify GameStore updated
    expect(useGameStore.getState().gameState?.season.year).toBe(2);
    expect(useGameStore.getState().gameState?.season.currentWeek).toBe(1);

    // Verify orchestrator state cleared
    expect(useGameOrchestratorStore.getState().seasonEvaluation).toBeNull();

    // Verify UI notification
    expect(useUIStore.getState().notifications.length).toBeGreaterThan(0);

    autoSaveSpy.mockRestore();
  });
});
```

### Achievement Flow

```typescript
describe('Achievement Flow Orchestration', () => {
  it('should manage pending achievements across simulation', async () => {
    const gameState = createMockGameState({
      achievements: [
        {
          id: 'first-season',
          name: 'First Season',
          description: 'Complete first season',
          category: 'special',
          target: 1,
          progress: 0,
          unlocked: false,
        },
      ],
    });

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
      .mockResolvedValue();

    await act(async () => {
      await useGameOrchestratorStore.getState().simulateNextWeek();
    });

    await waitFor(() => {
      expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
    });

    // Check if any achievements were unlocked
    const pendingCount = useGameOrchestratorStore.getState().pendingAchievements.length;

    // Dismiss an achievement if any exist
    if (pendingCount > 0) {
      const firstAchievement = useGameOrchestratorStore.getState().pendingAchievements[0];

      act(() => {
        useGameOrchestratorStore.getState().dismissAchievement(firstAchievement.id);
      });

      expect(useGameOrchestratorStore.getState().pendingAchievements.length)
        .toBe(pendingCount - 1);
    }

    autoSaveSpy.mockRestore();
  });
});
```

### Youth Academy Integration

```typescript
describe('Youth Academy Orchestration', () => {
  it('should handle youth player selection', () => {
    const gameState = createMockGameState();

    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    const youthPlayers = [
      createMockPlayer({ id: 'youth-1', age: 17, potential: 85 }),
      createMockPlayer({ id: 'youth-2', age: 16, potential: 80 }),
    ];

    act(() => {
      useGameOrchestratorStore.setState({ youthProspects: youthPlayers });
    });

    const initialSquadSize = useGameStore.getState().gameState?.playerTeam.players.length || 0;

    act(() => {
      useGameOrchestratorStore.getState().selectYouthPlayers(['youth-1']);
    });

    // Squad size should increase
    const newSquadSize = useGameStore.getState().gameState?.playerTeam.players.length || 0;
    expect(newSquadSize).toBe(initialSquadSize + 1);

    // Youth prospects should be cleared
    expect(useGameOrchestratorStore.getState().youthProspects.length).toBe(0);
  });
});
```

## Best Practices

### ✅ DO

- **Reset stores before each test** - Prevent test pollution
- **Use direct store access** - `useStore.getState()` for Zustand
- **Test real interactions** - Minimal mocking of stores
- **Wrap actions in act()** - Ensure state updates complete
- **Use waitFor() for async** - Don't assume immediate completion
- **Mock external dependencies** - localStorage, APIs, etc.
- **Test error paths** - Verify graceful degradation
- **Verify state synchronization** - Multiple stores stay in sync

### ❌ DON'T

- **Use renderHook for simple stores** - Overcomplicated
- **Skip store resets** - Leads to flaky tests
- **Mock too much** - Defeats purpose of integration tests
- **Ignore timing** - Async operations need proper handling
- **Test implementation details** - Focus on observable behavior
- **Create interdependent tests** - Each test should be isolated

### Common Pitfalls

#### 1. Not Resetting Stores

```typescript
// ❌ BAD - State leaks between tests
describe('Tests', () => {
  it('test 1', () => {
    useGameStore.getState().setGameState(gameState1);
    // ... test
  });

  it('test 2', () => {
    // gameState1 still in store! ⚠️
    // ... test will behave unexpectedly
  });
});

// ✅ GOOD - Clean state for each test
describe('Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
    useUIStore.getState().resetUI();
  });

  it('test 1', () => {
    useGameStore.getState().setGameState(gameState1);
    // ... test
  });

  it('test 2', () => {
    useGameStore.getState().setGameState(gameState2);
    // ... test with clean state
  });
});
```

#### 2. Not Using act()

```typescript
// ❌ BAD - State updates may not complete
it('updates state', () => {
  useGameStore.getState().setGameState(gameState);
  expect(useGameStore.getState().gameState).toEqual(gameState); // May fail
});

// ✅ GOOD - Wrapped in act()
it('updates state', () => {
  act(() => {
    useGameStore.getState().setGameState(gameState);
  });
  expect(useGameStore.getState().gameState).toEqual(gameState);
});
```

#### 3. Not Waiting for Async

```typescript
// ❌ BAD - Not waiting for async completion
it('simulates week', async () => {
  await useGameOrchestratorStore.getState().simulateNextWeek();
  expect(useGameOrchestratorStore.getState().isSimulating).toBe(false); // May fail
});

// ✅ GOOD - Using waitFor
it('simulates week', async () => {
  await act(async () => {
    await useGameOrchestratorStore.getState().simulateNextWeek();
  });

  await waitFor(() => {
    expect(useGameOrchestratorStore.getState().isSimulating).toBe(false);
  });
});
```

### Test Organization

```typescript
describe('Store Orchestration Integration Tests', () => {
  // Group by feature/workflow
  describe('Multi-Store Coordination', () => {
    // Related tests
  });

  describe('Week Simulation Orchestration', () => {
    // Related tests
  });

  describe('Season Transition Orchestration', () => {
    // Related tests
  });

  describe('Error Handling Orchestration', () => {
    // Related tests
  });
});
```

## Performance Tips

### 1. Minimize Store Resets

```typescript
// Group tests that can share initial state
describe('with initialized game', () => {
  const gameState = createMockGameState();

  beforeAll(() => {
    act(() => {
      useGameStore.getState().setGameState(gameState);
    });
  });

  afterAll(() => {
    useGameStore.getState().resetGame();
  });

  it('test 1 - read-only', () => {
    // Can share state since we're only reading
  });

  it('test 2 - read-only', () => {
    // Can share state since we're only reading
  });
});
```

### 2. Use Spies Instead of Full Mocks

```typescript
// ✅ GOOD - Spy on specific method
const autoSaveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
  .mockResolvedValue();

// ❌ AVOID - Mocking entire store
vi.mock('../saveStore', () => ({
  useSaveStore: vi.fn(), // Loses all other functionality
}));
```

---

**Related Guides:**
- [Unit Testing Guide](./unit-testing-guide.md)
- [CI/CD Pipeline Guide](./cicd-guide.md)
- [Main Testing Documentation](./README.md)
