# Unit Testing Guide

Best practices and patterns for writing unit tests in the Football Director project.

## Table of Contents

1. [Test Structure](#test-structure)
2. [Testing Patterns](#testing-patterns)
3. [Common Test Cases](#common-test-cases)
4. [Mocking Strategies](#mocking-strategies)
5. [Coverage Optimization](#coverage-optimization)

## Test Structure

### File Organization

```
src/lib/
├── example-manager.ts          # Source file
└── example-manager.spec.ts     # Test file (same directory)
```

### Test File Template

```typescript
/**
 * Example Manager - Unit Tests
 *
 * Tests for example functionality including:
 * - Feature A
 * - Feature B
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExampleManager } from './example-manager';
import type { GameState, Player } from './types';

// Helper to create mock data
function createMockGameState(): GameState {
  return {
    // ... minimal valid game state
  };
}

describe('ExampleManager', () => {
  let manager: ExampleManager;

  beforeEach(() => {
    manager = new ExampleManager();
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(manager).toBeDefined();
      expect(manager.isInitialized()).toBe(true);
    });
  });

  describe('methodName', () => {
    it('should handle basic case', () => {
      const result = manager.methodName('input');
      expect(result).toBe('expected');
    });

    it('should handle edge case with null', () => {
      const result = manager.methodName(null);
      expect(result).toBeNull();
    });

    it('should throw error for invalid input', () => {
      expect(() => manager.methodName('invalid'))
        .toThrow('Invalid input');
    });
  });
});
```

## Testing Patterns

### Arrange-Act-Assert (AAA)

```typescript
it('should calculate player rating correctly', () => {
  // Arrange - Set up test data
  const player = createMockPlayer({
    overall: 80,
    morale: 90,
    fitness: 100,
  });
  const manager = new PlayerManager();

  // Act - Execute the code being tested
  const rating = manager.calculateRating(player);

  // Assert - Verify the result
  expect(rating).toBe(85);
});
```

### Test Each Branch

```typescript
describe('determineResult', () => {
  it('should return "win" when home score > away score', () => {
    const result = determineResult(3, 1);
    expect(result).toBe('win');
  });

  it('should return "lose" when home score < away score', () => {
    const result = determineResult(1, 3);
    expect(result).toBe('lose');
  });

  it('should return "draw" when scores are equal', () => {
    const result = determineResult(2, 2);
    expect(result).toBe('draw');
  });
});
```

### Parameterized Tests

```typescript
describe.each([
  { input: 0, expected: 'poor' },
  { input: 25, expected: 'poor' },
  { input: 50, expected: 'average' },
  { input: 75, expected: 'good' },
  { input: 100, expected: 'excellent' },
])('morale rating for $input', ({ input, expected }) => {
  it(`should return "${expected}"`, () => {
    expect(getMoraleRating(input)).toBe(expected);
  });
});
```

### Testing Async Functions

```typescript
describe('async operations', () => {
  it('should resolve successfully', async () => {
    const result = await asyncOperation();
    expect(result).toBe('success');
  });

  it('should reject with error', async () => {
    await expect(asyncOperation('invalid'))
      .rejects
      .toThrow('Operation failed');
  });

  it('should handle timeout', async () => {
    vi.useFakeTimers();

    const promise = asyncOperationWithTimeout();
    vi.advanceTimersByTime(5000);

    await expect(promise).rejects.toThrow('Timeout');

    vi.useRealTimers();
  });
});
```

## Common Test Cases

### Testing Arrays

```typescript
describe('array operations', () => {
  it('should return empty array for no results', () => {
    const results = filterPlayers([]);
    expect(results).toEqual([]);
  });

  it('should filter players correctly', () => {
    const players = [
      createMockPlayer({ position: 'FWD' }),
      createMockPlayer({ position: 'DEF' }),
      createMockPlayer({ position: 'FWD' }),
    ];

    const forwards = filterPlayers(players, 'FWD');

    expect(forwards).toHaveLength(2);
    expect(forwards[0].position).toBe('FWD');
  });

  it('should maintain order', () => {
    const sorted = sortPlayersByRating(players);
    expect(sorted[0].overall).toBeGreaterThanOrEqual(sorted[1].overall);
  });
});
```

### Testing Objects

```typescript
describe('object mutations', () => {
  it('should update player stats', () => {
    const player = createMockPlayer();
    const initial = { ...player.stats };

    updatePlayerStats(player, { goals: 1, assists: 2 });

    expect(player.stats.goals).toBe(initial.goals + 1);
    expect(player.stats.assists).toBe(initial.assists + 2);
  });

  it('should return new object (immutability)', () => {
    const original = { value: 1 };
    const updated = updateValue(original, 2);

    expect(updated).not.toBe(original);
    expect(updated.value).toBe(2);
    expect(original.value).toBe(1);
  });
});
```

### Testing Error Handling

```typescript
describe('error cases', () => {
  it('should throw for invalid team size', () => {
    const players = Array(10).fill(createMockPlayer());

    expect(() => validateTeam(players))
      .toThrow('Team must have exactly 11 players');
  });

  it('should return error object for validation failure', () => {
    const result = validatePlayer({ age: -1 });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Age must be positive');
  });

  it('should handle missing required field', () => {
    const incomplete = { name: 'Player' };

    expect(() => createPlayer(incomplete as Player))
      .toThrow('Missing required field: position');
  });
});
```

### Testing Random/Seeded Functions

```typescript
describe('random events', () => {
  it('should use seed for deterministic results', () => {
    const result1 = generateRandomEvent(12345);
    const result2 = generateRandomEvent(12345);

    expect(result1).toEqual(result2);
  });

  it('should produce different results with different seeds', () => {
    const result1 = generateRandomEvent(12345);
    const result2 = generateRandomEvent(54321);

    expect(result1).not.toEqual(result2);
  });

  it('should stay within valid range', () => {
    const result = generateRandomNumber(0, 100, 12345);

    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

## Mocking Strategies

### Mock Functions

```typescript
describe('with mocked dependencies', () => {
  it('should call dependency with correct args', () => {
    const mockFn = vi.fn().mockReturnValue('result');

    const manager = new Manager(mockFn);
    manager.doSomething('input');

    expect(mockFn).toHaveBeenCalledWith('input');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

### Spy on Methods

```typescript
describe('method calls', () => {
  it('should call internal method', () => {
    const manager = new Manager();
    const spy = vi.spyOn(manager, 'internalMethod');

    manager.publicMethod();

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
```

### Mock Modules

```typescript
// At top of file
vi.mock('./utils', () => ({
  calculateValue: vi.fn().mockReturnValue(100),
  formatDate: vi.fn().mockReturnValue('2024-01-01'),
}));

describe('with mocked module', () => {
  it('should use mocked utils', () => {
    const result = processData();
    expect(result.value).toBe(100);
  });
});
```

### Partial Mocks

```typescript
describe('partial mocks', () => {
  it('should mock only specific methods', async () => {
    const manager = new Manager();

    // Mock just one method
    vi.spyOn(manager, 'expensive').mockResolvedValue('cached');

    const result = await manager.process();

    expect(result).toContain('cached');
  });
});
```

## Coverage Optimization

### Identify Uncovered Code

```bash
# Generate coverage with --coverage flag
npx nx test football-director-engine --coverage

# Open HTML report to see uncovered lines
open coverage/libs/football-director-engine/index.html
```

### Common Coverage Gaps

#### 1. Error Branches

```typescript
// ❌ Only testing success case
it('should process data', () => {
  const result = processData(validInput);
  expect(result).toBeDefined();
});

// ✅ Test both success and error
it('should process valid data', () => {
  const result = processData(validInput);
  expect(result).toBeDefined();
});

it('should throw for invalid data', () => {
  expect(() => processData(invalidInput)).toThrow();
});
```

#### 2. Edge Cases

```typescript
// Test boundary conditions
describe('boundary tests', () => {
  it('should handle empty input', () => {
    expect(process([])).toEqual([]);
  });

  it('should handle single item', () => {
    expect(process([item])).toHaveLength(1);
  });

  it('should handle max capacity', () => {
    const max = Array(100).fill(item);
    expect(process(max)).toHaveLength(100);
  });
});
```

#### 3. Conditional Logic

```typescript
// Cover all conditions
describe('conditional logic', () => {
  it('should handle condition A', () => {
    const result = evaluate({ conditionA: true });
    expect(result).toBe('A');
  });

  it('should handle condition B', () => {
    const result = evaluate({ conditionB: true });
    expect(result).toBe('B');
  });

  it('should handle both conditions', () => {
    const result = evaluate({ conditionA: true, conditionB: true });
    expect(result).toBe('both');
  });

  it('should handle neither condition', () => {
    const result = evaluate({});
    expect(result).toBe('neither');
  });
});
```

### Coverage Goals by File Type

| File Type | Target Coverage |
|-----------|----------------|
| **Core Logic** (managers, engines) | 90%+ |
| **Utilities** | 95%+ |
| **Type Definitions** | 0% (not testable) |
| **Integration** | 80%+ |

### Exclude from Coverage

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'src/**/*.spec.ts',      // Test files
        'src/**/*.test.ts',      // Test files
        'src/index.ts',          // Re-exports only
        'src/__tests__/**',      // Test utilities
        'src/types.ts',          // Type definitions
      ],
    },
  },
});
```

## Best Practices Summary

### ✅ DO

- Write tests before fixing bugs (TDD)
- Test public API, not implementation
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Clean up after tests (beforeEach/afterEach)
- Test edge cases and errors
- Aim for >80% coverage

### ❌ DON'T

- Test private methods directly
- Write tests that depend on each other
- Use hard-coded dates/times (use mocks)
- Ignore test warnings
- Skip flaky tests (fix them)
- Test third-party libraries
- Duplicate test logic
- Write tests just for coverage

---

**Related Guides:**
- [Integration Testing Guide](./integration-testing-guide.md)
- [CI/CD Pipeline Guide](./cicd-guide.md)
- [Coverage Requirements](./README.md#coverage-requirements)
