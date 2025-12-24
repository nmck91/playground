# Football Director Engine - Testing Guide

## Overview

This library uses **Vitest** for fast, modern unit testing with TypeScript support.

## Running Tests

```bash
# Run all tests
nx test football-director-engine

# Run tests in watch mode
nx run football-director-engine:test:watch

# Run tests with UI
nx run football-director-engine:test:ui

# Run tests with coverage
nx run football-director-engine:test:coverage
```

## Test Structure

### Directory Organization

```
libs/football-director-engine/
├── src/
│   ├── lib/
│   │   ├── match-simulator.ts
│   │   ├── match-simulator.spec.ts    # Tests next to source
│   │   └── ...
│   └── __tests__/
│       ├── factories.ts                # Test data factories
│       ├── test-utils.ts               # Testing utilities
│       └── index.ts                    # Exports
```

### Test File Naming

- Unit tests: `*.spec.ts` (e.g., `match-simulator.spec.ts`)
- Integration tests: `*.test.ts` (e.g., `season-integration.test.ts`)

## Test Patterns

### Using Test Data Factories

Test data factories provide consistent, reusable mock data:

```typescript
import {
  createMockPlayer,
  createMockTeam,
  createStrongTeam,
  createWeakTeam,
} from '../__tests__';

describe('MatchSimulator', () => {
  it('should simulate a match', () => {
    const homeTeam = createStrongTeam({ name: 'Home FC' });
    const awayTeam = createWeakTeam({ name: 'Away United' });

    const result = simulator.simulateMatch(homeTeam, awayTeam);

    expect(result.homeScore).toBeGreaterThanOrEqual(0);
  });
});
```

### Available Factories

- `createMockPlayer(overrides?)` - Generic player
- `createMockTeam(overrides?)` - Generic team (skill 10)
- `createStrongTeam(overrides?)` - High-skill team (skill 15-19)
- `createWeakTeam(overrides?)` - Low-skill team (skill 4-6)
- `createMockSeason(overrides?)` - Season data
- `createMockFixture(overrides?)` - Fixture
- `createMockFinances(overrides?)` - Financial data
- `createMockStaff(overrides?)` - Staff member
- `createMockGameState(overrides?)` - Game state

### Test Utilities

#### Mocking Randomness

```typescript
import { mockRandom, mockRandomSequence } from '../__tests__';

it('should handle random outcomes', () => {
  // Always return 0.5
  mockRandom(0.5);

  // Your code that uses Math.random()

  restoreRandom();
});

it('should handle sequence of random values', () => {
  // Return 0.1, then 0.5, then 0.9, then repeat
  mockRandomSequence([0.1, 0.5, 0.9]);

  // Your code that calls Math.random() multiple times

  restoreRandom();
});
```

#### Seeded Random (Deterministic)

```typescript
import { createSeededRandom } from '../__tests__';

it('should produce deterministic results', () => {
  const random = createSeededRandom(12345);

  const value1 = random(); // Always same value for seed 12345
  const value2 = random(); // Next value in sequence
});
```

#### Performance Testing

```typescript
import { assertCompletesWithin } from '../__tests__';

it('should complete simulation quickly', async () => {
  await assertCompletesWithin(async () => {
    simulator.simulateSeason(teams);
  }, 100); // Must complete in <100ms
});
```

#### Assertions

```typescript
import { assertApproximately, assertInRange } from '../__tests__';

it('should calculate approximately correct value', () => {
  assertApproximately(actual, 10.5, 0.1); // Within 0.1
});

it('should produce value in range', () => {
  assertInRange(goals, 0, 10); // Between 0 and 10
});
```

## Writing Good Tests

### Arrange-Act-Assert Pattern

```typescript
it('should calculate team strength correctly', () => {
  // Arrange: Set up test data
  const team = createMockTeam({
    players: [
      createMockPlayer({ skill: 15 }),
      createMockPlayer({ skill: 10 }),
    ]
  });

  // Act: Execute the code under test
  const strength = calculator.calculateStrength(team);

  // Assert: Verify the result
  expect(strength).toBe(12.5); // Average of 15 and 10
});
```

### Test Descriptions

Use descriptive test names that explain:
- **What** is being tested
- **When** or under what conditions
- **Expected** behavior

```typescript
// ✅ Good
it('should return empty array when no fixtures exist')
it('should calculate higher income for 1st place than 10th place')
it('should produce deterministic results with same seed')

// ❌ Bad
it('works')
it('test fixtures')
it('returns correct value')
```

### Test Coverage

- **Happy Path**: Test normal/expected behavior
- **Edge Cases**: Test boundary conditions (0, negative, max)
- **Error Cases**: Test error handling and validation

```typescript
describe('calculateWeeklyWages', () => {
  it('should sum all player wages', () => {
    // Happy path
  });

  it('should return 0 for team with no players', () => {
    // Edge case: empty array
  });

  it('should handle negative wages', () => {
    // Edge case: unexpected values
  });
});
```

## Coverage Goals

- **Target**: >80% coverage for all modules
- **Branches**: >80% branch coverage
- **Functions**: >80% function coverage

Run coverage to see current status:

```bash
nx run football-director-engine:test:coverage
```

Coverage reports generated in: `coverage/libs/football-director-engine/`

## Common Patterns

### Testing Pure Functions

```typescript
import { calculatePlayerDevelopment } from './player-development';

it('should increase skill for young players', () => {
  const player = createMockPlayer({ age: 22, skill: 10 });

  const developed = calculatePlayerDevelopment(player);

  expect(developed.skill).toBeGreaterThan(10);
});
```

### Testing Classes with State

```typescript
let simulator: MatchSimulator;

beforeEach(() => {
  simulator = new MatchSimulator();
});

it('should simulate match', () => {
  const result = simulator.simulateMatch(homeTeam, awayTeam);
  expect(result).toBeDefined();
});
```

### Testing Probabilistic Code

```typescript
it('should favor stronger team (probabilistic)', () => {
  let strongerWins = 0;
  const iterations = 100;

  for (let i = 0; i < iterations; i++) {
    const result = simulator.simulateMatch(strongTeam, weakTeam, i);
    if (result.result === 'home') strongerWins++;
  }

  // Strong team should win >60% of matches
  expect(strongerWins).toBeGreaterThan(60);
});
```

## Troubleshooting

### Tests Failing Intermittently

- Check for code using `Math.random()` without a seed
- Use `mockRandom()` or `createSeededRandom()` for determinism

### Tests Running Slowly

- Check for unnecessary loops or large datasets
- Use smaller test datasets (5-10 items instead of 100+)
- Mock expensive operations

### Coverage Not Generated

- Ensure `@vitest/coverage-v8` is installed
- Run with explicit flag: `--coverage`
- Check `vitest.config.ts` coverage settings

## Best Practices

1. ✅ **Keep tests fast**: <1ms per test ideal
2. ✅ **Test behavior, not implementation**: Test what code does, not how
3. ✅ **Use factories**: Consistent test data via factories
4. ✅ **One assertion per test**: Makes failures clear
5. ✅ **Mock external dependencies**: Isolate code under test
6. ✅ **Descriptive names**: Test name explains what's being tested
7. ✅ **Arrange-Act-Assert**: Clear test structure

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Test Factory Pattern](https://github.com/thoughtbot/factory_bot)
- [Testing Best Practices](https://testingjavascript.com/)
