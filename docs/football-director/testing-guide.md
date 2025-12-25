# Football Director - Testing Guide

## Overview

This guide covers the testing infrastructure for the Football Director game, including how to run tests, write new tests, and maintain code quality through comprehensive test coverage.

## Test Infrastructure

**Test Framework**: Vitest (Vite-native test runner, compatible with Jest API)
**Coverage Tool**: v8 (built into Vitest)
**Environment**: jsdom (for React component testing)

### Current Test Coverage

As of December 2025:
- **Engine Library**: 606 tests across 25 modules
- **Overall Coverage**: 83.81% (exceeds 60% target)
- **Critical Modules**:
  - Match Simulator: 95.13% coverage ✅
  - Contract Manager: 100% coverage ✅
  - Finance Engine: 97.29% coverage ✅
  - Cup Manager: 95.40% coverage ✅

## Running Tests

### Engine Tests (Recommended)

Run all engine tests:
```bash
nx test football-director-engine
```

Run with coverage report:
```bash
nx test football-director-engine --coverage
```

Run specific test file:
```bash
cd libs/football-director-engine
npx vitest run src/lib/match-simulator.spec.ts
```

Run in watch mode (for development):
```bash
cd libs/football-director-engine
npx vitest watch
```

### Application Tests

Run app tests (hooks, services):
```bash
nx test football-director
```

**Note**: The football-director app test target may require memory configuration for large test suites:
```bash
NODE_OPTIONS="--max-old-space-size=4096" nx test football-director
```

## Test Organization

### Engine Tests (libs/football-director-engine)

```
libs/football-director-engine/
├── src/
│   ├── lib/
│   │   ├── match-simulator.ts
│   │   ├── match-simulator.spec.ts          ← Co-located with source
│   │   ├── contract-manager.ts
│   │   ├── contract-manager.spec.ts
│   │   └── ... (all engine modules with .spec.ts)
│   └── __tests__/
│       ├── factories.ts                      ← Test data factories
│       ├── test-utils.ts                     ← Test utilities
│       └── index.ts                          ← Test exports
```

### Application Tests (apps/football-director)

```
apps/football-director/
└── src/
    ├── hooks/
    │   ├── useGameState.ts
    │   ├── useGameState.test.ts             ← Co-located with source
    │   └── ... (other hooks with .test.ts)
    └── services/
        ├── SaveService.ts
        └── SaveService.test.ts              ← Co-located with source
```

## Test File Naming Conventions

- **Engine tests**: `.spec.ts` extension (e.g., `match-simulator.spec.ts`)
- **App tests**: `.test.ts` extension (e.g., `useGameState.test.ts`)
- **Test files are co-located** with their source files
- **One test file per source file** (e.g., `player-development.ts` → `player-development.spec.ts`)

## Writing Tests

### Test Structure Pattern

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MatchSimulator } from './match-simulator';
import { createTestTeam } from '../__tests__/factories';

describe('MatchSimulator', () => {
  let simulator: MatchSimulator;
  let homeTeam: Team;
  let awayTeam: Team;

  beforeEach(() => {
    simulator = new MatchSimulator();
    homeTeam = createTestTeam({ name: 'Home FC', avgSkill: 70 });
    awayTeam = createTestTeam({ name: 'Away FC', avgSkill: 60 });
  });

  describe('simulateMatch', () => {
    it('should produce a valid match result', () => {
      const result = simulator.simulateMatch(homeTeam, awayTeam, 1, false);

      expect(result.homeScore).toBeGreaterThanOrEqual(0);
      expect(result.awayScore).toBeGreaterThanOrEqual(0);
      expect(result.events).toBeDefined();
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('should favor stronger team statistically', () => {
      const iterations = 100;
      let homeWins = 0;
      let awayWins = 0;

      for (let i = 0; i < iterations; i++) {
        const result = simulator.simulateMatch(homeTeam, awayTeam, 1, false);
        if (result.homeScore > result.awayScore) homeWins++;
        else if (result.awayScore > result.homeScore) awayWins++;
      }

      // Home team (skill 70) should win more than away team (skill 60)
      expect(homeWins).toBeGreaterThan(awayWins);
      // But away team should still win occasionally (realism)
      expect(awayWins).toBeGreaterThan(5);
    });
  });

  describe('simulateKnockoutMatch', () => {
    it('should always determine a winner', () => {
      const result = simulator.simulateKnockoutMatch(homeTeam, awayTeam, 1, 1);

      expect(result.winner).toBeDefined();
      expect(result.loser).toBeDefined();
      expect(result.winner).not.toBe(result.loser);
    });
  });
});
```

### Test Naming Conventions

**Describe blocks**: Use the class/function name
```typescript
describe('MatchSimulator', () => {})
describe('ContractManager', () => {})
```

**Nested describe blocks**: Use the method name
```typescript
describe('simulateMatch', () => {})
describe('processWeeklyContracts', () => {})
```

**It blocks**: Use clear, descriptive sentences
```typescript
it('should produce a valid match result', () => {})
it('should detect contracts expiring in current week', () => {})
it('should throw error for invalid slot number', () => {})
```

### Test Factories (libs/football-director-engine/src/__tests__/factories.ts)

Use factory functions to create test data:

```typescript
import {
  createTestGameState,
  createTestTeam,
  createTestPlayer,
  createTestMatch,
} from '../__tests__/factories';

// Example usage
const gameState = createTestGameState({
  currentWeek: 10,
  season: 2,
});

const team = createTestTeam({
  name: 'Test FC',
  budget: 50000000,
  players: [
    createTestPlayer({ name: 'Player 1', skill: 75, position: 'ST' }),
    createTestPlayer({ name: 'Player 2', skill: 68, position: 'MF' }),
  ],
});
```

**Benefits of factories**:
- Consistent test data across tests
- Reduce boilerplate
- Easy to customize specific properties
- Maintainable when types change

## Testing Patterns

### 1. Unit Tests (Engine Modules)

Test individual modules in isolation:

```typescript
describe('FinanceEngine', () => {
  let financeEngine: FinanceEngine;

  beforeEach(() => {
    financeEngine = new FinanceEngine();
  });

  it('should deduct weekly wages from budget', () => {
    const gameState = createTestGameState({
      finances: { budget: 100000000, weeklyWages: 500000 },
    });

    financeEngine.processWeeklyWages(gameState);

    expect(gameState.finances.budget).toBe(99500000);
  });
});
```

### 2. Statistical Testing (Probabilistic Logic)

For systems with randomness (match simulation, injuries, etc.):

```typescript
it('should apply morale modifier to performance', () => {
  const highMoraleTeam = createTestTeam({ avgMorale: 90 });
  const lowMoraleTeam = createTestTeam({ avgMorale: 30 });

  const iterations = 100;
  let highMoraleWins = 0;

  for (let i = 0; i < iterations; i++) {
    const result = simulator.simulateMatch(highMoraleTeam, lowMoraleTeam, 1, false);
    if (result.homeScore > result.awayScore) highMoraleWins++;
  }

  // High morale should lead to significantly more wins (statistical trend)
  expect(highMoraleWins).toBeGreaterThan(60);
});
```

**Key principles**:
- Run many iterations (100+)
- Test for statistical trends, not exact values
- Ensure both outcomes can occur (realism)

### 3. Edge Case Testing

Test boundary conditions and error cases:

```typescript
it('should handle empty team roster gracefully', () => {
  const emptyTeam = createTestTeam({ players: [] });

  expect(() => {
    simulator.simulateMatch(emptyTeam, awayTeam, 1, false);
  }).toThrow('Team must have at least 11 players');
});

it('should handle maximum skill players', () => {
  const superTeam = createTestTeam({
    players: Array(11).fill(null).map(() => createTestPlayer({ skill: 99 })),
  });

  const result = simulator.simulateMatch(superTeam, awayTeam, 1, false);

  expect(result).toBeDefined();
  expect(result.homeScore).toBeGreaterThanOrEqual(0);
});
```

### 4. Integration Testing (Cross-Module)

Test multiple modules working together:

```typescript
describe('Season Simulation Integration', () => {
  it('should simulate full season without errors', () => {
    const gameState = createTestGameState({ currentWeek: 1 });
    const seasonManager = new SeasonManager();
    const matchSimulator = new MatchSimulator();
    const contractManager = new ContractManager();

    // Simulate all 52 weeks
    for (let week = 1; week <= 52; week++) {
      gameState.currentWeek = week;
      contractManager.processWeeklyContracts(gameState);

      const fixtures = seasonManager.getFixturesForWeek(week, gameState);
      fixtures.forEach(fixture => {
        const result = matchSimulator.simulateMatch(
          fixture.homeTeam,
          fixture.awayTeam,
          week,
          false
        );
        gameState.results.push(result);
      });
    }

    expect(gameState.currentWeek).toBe(52);
    expect(gameState.results.length).toBeGreaterThan(0);
  });
});
```

### 5. Mocking (External Dependencies)

For testing services that depend on browser APIs:

```typescript
import { vi } from 'vitest';

describe('SaveService', () => {
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};

    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  it('should save game state to localStorage', () => {
    const gameState = createTestGameState();
    SaveService.saveToSlot(1, gameState);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'football-director-saves',
      expect.any(String)
    );
  });
});
```

## Coverage Reports

### Generate Coverage Report

```bash
nx test football-director-engine --coverage
```

This generates:
- **Terminal output**: Summary with percentages
- **HTML report**: `coverage/libs/football-director-engine/index.html`
- **JSON report**: For CI/CD integration

### View HTML Coverage Report

```bash
# Generate coverage
nx test football-director-engine --coverage

# Open in browser (macOS)
open coverage/libs/football-director-engine/index.html

# Or (Linux)
xdg-open coverage/libs/football-director-engine/index.html
```

### Coverage Thresholds

The project aims for:
- **Critical modules**: 80%+ coverage (Match Simulator, Contract Manager, SaveService)
- **High-impact modules**: 60%+ coverage (Transfer Market, Finance Engine, Player Development)
- **Supporting modules**: 40%+ coverage (News Generator, Achievement Manager)
- **Overall project**: 60%+ coverage

Current status: **83.81% overall** ✅

## Common Testing Scenarios

### Testing Pure Functions (Engine Modules)

```typescript
it('should calculate player value correctly', () => {
  const player = createTestPlayer({
    skill: 80,
    age: 25,
    potential: 85,
  });

  const value = TransferMarket.calculatePlayerValue(player);

  expect(value).toBeGreaterThan(10000000); // At least 10M
  expect(value).toBeLessThan(100000000); // Less than 100M
});
```

### Testing State Changes

```typescript
it('should update contract weeks remaining', () => {
  const gameState = createTestGameState();
  const player = gameState.playerTeam.players[0];
  player.contract = { ...player.contract, weeksRemaining: 52 };

  contractManager.processWeeklyContracts(gameState);

  expect(player.contract.weeksRemaining).toBe(51);
});
```

### Testing Error Handling

```typescript
it('should throw error when saving to invalid slot', () => {
  const gameState = createTestGameState();

  expect(() => {
    SaveService.saveToSlot(0, gameState); // Slot 0 invalid
  }).toThrow('Invalid save slot');

  expect(() => {
    SaveService.saveToSlot(6, gameState); // Slot 6 invalid (max is 5)
  }).toThrow('Invalid save slot');
});
```

### Testing Arrays and Collections

```typescript
it('should generate correct number of fixtures', () => {
  const teams = Array(20).fill(null).map((_, i) =>
    createTestTeam({ name: `Team ${i + 1}` })
  );

  const fixtures = seasonManager.generateFixtures(teams);

  // Each team plays 38 games (19 home + 19 away) = 380 fixtures total
  expect(fixtures.length).toBe(380);
});
```

## Best Practices

### ✅ DO

- **Co-locate tests** with source files
- **Use factory functions** for test data creation
- **Test behavior**, not implementation
- **Write descriptive test names** that explain what's being tested
- **Keep tests independent** - each test should run in isolation
- **Use beforeEach** to set up common test state
- **Test edge cases** and error conditions
- **Run tests frequently** during development

### ❌ DON'T

- Don't test framework/library code (e.g., React, Next.js internals)
- Don't write tests that depend on execution order
- Don't use real browser APIs without mocking (localStorage, fetch)
- Don't aim for 100% coverage at the expense of test quality
- Don't write tests that are slower than the code they test
- Don't duplicate tests across files
- Don't hardcode brittle values (use realistic ranges)

## Debugging Tests

### Run Single Test File

```bash
cd libs/football-director-engine
npx vitest run src/lib/match-simulator.spec.ts
```

### Run Specific Test

```bash
# Use .only to run just one test
it.only('should produce a valid match result', () => {
  // This test will run, others will be skipped
});
```

### Skip Failing Test Temporarily

```bash
# Use .skip to temporarily disable a test
it.skip('should handle complex edge case', () => {
  // This test will be skipped
});
```

### Verbose Output

```bash
nx test football-director-engine --reporter=verbose
```

## Performance Considerations

### Test Execution Speed

Current performance:
- **606 tests** run in **~900ms** ⚡
- **Average**: ~1.5ms per test
- **Target**: Keep total test suite under 30 seconds

### Optimizing Slow Tests

If tests become slow:
1. **Reduce iterations** in statistical tests (100 → 50)
2. **Use smaller test data** (fewer players, teams)
3. **Mock expensive operations** (file I/O, network)
4. **Parallelize tests** (Vitest does this automatically)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: nx test football-director-engine --coverage
      - run: nx test football-director --coverage
```

## Troubleshooting

### "Cannot find module" errors

Ensure path aliases are configured in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@playground/football-director-engine': resolve(
      __dirname,
      '../../libs/football-director-engine/src/index.ts'
    ),
  },
}
```

### Memory issues with large test suites

Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" nx test football-director
```

### Flaky tests (non-deterministic)

- Use fixed random seeds for probabilistic tests
- Mock date/time functions (use vitest's `vi.useFakeTimers()`)
- Ensure tests clean up after themselves

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Jest API Reference](https://jestjs.io/docs/api) (Vitest is compatible)
- [Test Coverage Best Practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)

## Summary

The Football Director testing infrastructure provides:
- ✅ 606 comprehensive tests across 25 engine modules
- ✅ 83.81% overall coverage (exceeds 60% target)
- ✅ Factory pattern for consistent test data
- ✅ Fast test execution (~900ms for 606 tests)
- ✅ Well-organized, co-located test files
- ✅ Clear patterns for unit, statistical, and integration testing

This foundation enables confident development, prevents regressions, and ensures code quality as the project grows.
