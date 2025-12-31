# Testing Infrastructure Documentation

Comprehensive guide to the Football Director testing infrastructure, including unit tests, integration tests, coverage requirements, and CI/CD pipeline.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Suite Structure](#test-suite-structure)
4. [Running Tests](#running-tests)
5. [Coverage Requirements](#coverage-requirements)
6. [Writing Tests](#writing-tests)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

## Overview

The Football Director project maintains a comprehensive testing infrastructure with:

- **791+ unit tests** across the game engine
- **16 integration tests** for store orchestration
- **93.8% overall code coverage**
- **Automated CI/CD pipeline** with quality gates
- **Coverage threshold validation** on every build

### Testing Stack

- **Test Runner**: [Vitest](https://vitest.dev/) - Fast, modern test framework
- **React Testing**: [@testing-library/react](https://testing-library.com/react) - Integration testing
- **Coverage**: [v8](https://v8.dev/) - Native code coverage
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) - Automated testing & deployment

## Quick Start

### Run All Tests

```bash
# Run all tests (engine + app)
npm run test

# Run tests for specific project
npx nx test football-director-engine
npx nx test football-director
```

### Run Tests with Coverage

```bash
# Generate coverage report for engine
npx nx test football-director-engine --coverage

# Generate coverage for app
npx nx test football-director --coverage
```

### Run Tests in Watch Mode

```bash
# Watch mode for development
npx nx test football-director-engine --watch

# Watch specific test file
npx nx test football-director-engine -- achievement-manager.spec.ts
```

## Test Suite Structure

### Engine Tests (`libs/football-director-engine/src/lib/`)

```
📦 football-director-engine
├── achievement-manager.spec.ts (39 tests, 81.93% coverage)
├── records-manager.spec.ts (23 tests, 99.07% coverage)
├── tactics-manager.spec.ts (61 tests, 100% coverage)
├── post-match-generator.spec.ts (24 tests, 98.86% coverage)
├── match-simulator.spec.ts (25 tests, 93.24% coverage)
├── season-manager.spec.ts (44 tests, 100% coverage)
├── player-development.spec.ts (28 tests, 89.83% coverage)
└── ... (21+ more test files)
```

### App Tests (`apps/football-director/src/`)

```
📦 football-director
├── stores/
│   ├── __tests__/
│   │   └── orchestration.integration.test.ts (16 tests)
│   ├── gameStore.test.ts
│   ├── playerStore.test.ts
│   └── uiStore.test.ts
└── services/
    └── SaveService.test.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific project tests
npx nx test <project-name>

# Run with coverage
npx nx test <project-name> --coverage

# Run in watch mode
npx nx test <project-name> --watch

# Run specific test file
npx nx test <project-name> -- <filename>
```

### Advanced Options

```bash
# Run tests matching a pattern
npx nx test football-director-engine -- -t "achievement"

# Update snapshots
npx nx test football-director-engine -- -u

# Run tests in sequence (no parallel)
npx nx test football-director-engine -- --no-threads

# Set custom timeout
npx nx test football-director-engine -- --testTimeout=10000
```

### Running Integration Tests Only

```bash
# Run store orchestration integration tests
npx nx test football-director -- orchestration.integration.test.ts
```

## Coverage Requirements

### Global Thresholds

All projects must meet these minimum thresholds:

| Metric | Threshold | Current (Engine) |
|--------|-----------|------------------|
| **Lines** | ≥ 80% | 93.21% ✅ |
| **Branches** | ≥ 70% | 83.15% ✅ |
| **Functions** | ≥ 80% | 94.85% ✅ |
| **Statements** | ≥ 80% | 91.9% ✅ |

### Per-File Minimum

- **Lines**: ≥ 60% coverage per file

### Viewing Coverage Reports

```bash
# Generate coverage report
npx nx test football-director-engine --coverage

# View HTML report (opens in browser)
open coverage/libs/football-director-engine/index.html

# View summary in terminal
cat coverage/libs/football-director-engine/coverage-summary.json | jq '.total'
```

### Coverage Validation Script

The CI pipeline uses an automated coverage checker:

```bash
# Run coverage validation locally
node .github/scripts/check-coverage.js "football-director-engine" "coverage/libs/football-director-engine"
```

**Output Example:**
```
📊 Checking coverage for football-director-engine...

📈 Coverage Summary:
  Lines:      93.21%
  Branches:   83.15%
  Functions:  94.85%
  Statements: 91.9%

✅ football-director-engine coverage meets all thresholds!
```

## Writing Tests

### Unit Test Example

```typescript
// libs/football-director-engine/src/lib/example.spec.ts
import { describe, it, expect } from 'vitest';
import { ExampleManager } from './example';

describe('ExampleManager', () => {
  describe('methodName', () => {
    it('should handle basic case', () => {
      const manager = new ExampleManager();
      const result = manager.methodName('input');

      expect(result).toBe('expected output');
    });

    it('should handle edge case', () => {
      const manager = new ExampleManager();
      const result = manager.methodName('');

      expect(result).toBeNull();
    });
  });
});
```

### Integration Test Example (Zustand Stores)

```typescript
// apps/football-director/src/stores/__tests__/example.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useGameStore } from '../gameStore';
import { useUIStore } from '../uiStore';

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset stores before each test
    useGameStore.getState().resetGame();
    useUIStore.getState().resetUI();
  });

  it('should coordinate between stores', () => {
    const gameState = createMockGameState();

    // Use direct store access (not renderHook)
    act(() => {
      useGameStore.getState().setGameState(gameState);
    });

    expect(useGameStore.getState().gameState).toEqual(gameState);
    expect(useUIStore.getState().isLoading).toBe(false);
  });
});
```

### Testing Best Practices

#### ✅ DO

- **Arrange-Act-Assert** pattern for clarity
- **Test one thing per test** - focused, single-purpose tests
- **Use descriptive test names** - "should do X when Y"
- **Test edge cases** - empty arrays, null values, boundary conditions
- **Mock external dependencies** - APIs, localStorage, timers
- **Clean up after tests** - reset stores, clear mocks

#### ❌ DON'T

- **Test implementation details** - test behavior, not internals
- **Write flaky tests** - tests should be deterministic
- **Skip error cases** - test both success and failure paths
- **Over-mock** - only mock what you need to
- **Ignore warnings** - fix or suppress intentionally

### Mocking Examples

```typescript
// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

// Spy on functions
const saveSpy = vi.spyOn(useSaveStore.getState(), 'autoSave')
  .mockResolvedValue();

expect(saveSpy).toHaveBeenCalled();
saveSpy.mockRestore();
```

## CI/CD Pipeline

### Workflows

#### 1. Main CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to any branch

**Steps:**
1. **Checkout** - Fetch code with full history
2. **Setup Node.js** - Install Node 22 with npm caching
3. **Install Dependencies** - `npm ci` for reproducible builds
4. **Install Playwright** - Browser testing dependencies
5. **Reset Nx** - Clean build artifacts
6. **Build** - Compile all projects (required ✅)
7. **Lint** - Code quality checks (required ✅)
8. **Test Engine** - Run engine tests with coverage (required ✅)
9. **Validate Coverage** - Check coverage thresholds (required ✅)
10. **Test App** - Run app tests (required ✅)
11. **Test Other Projects** - All remaining tests (required ✅)
12. **Upload Coverage** - Send reports to Codecov
13. **Archive Artifacts** - Save coverage & test results (30 days)

**Quality Gates:**
- All builds must pass
- All lints must pass
- All tests must pass
- Coverage thresholds must be met

#### 2. PR Comment Workflow (`.github/workflows/pr-comment.yml`)

**Triggers:**
- After CI workflow completes successfully
- Only for pull requests

**Behavior:**
- Downloads coverage artifacts from CI run
- Parses coverage metrics
- Posts/updates PR comment with:
  - Coverage percentages
  - Visual status indicators (🟢/🟡/🔴)
  - Threshold information

**Example PR Comment:**
```markdown
## 📊 Coverage Report

### football-director-engine
| Metric | Coverage | Status |
|--------|----------|--------|
| Lines | 93.21% | 🟢 |
| Branches | 83.15% | 🟢 |
| Functions | 94.85% | 🟢 |

### Thresholds
- 🟢 ≥ 90% (Excellent)
- 🟡 ≥ 80% (Good)
- 🔴 < 80% (Needs Improvement)
```

#### 3. Release Merge Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch (after CI passes)

**Behavior:**
- Auto-merges `main` to `release` branch
- Fast-forward only (ensures clean history)
- Ensures release branch always has passing code

### CI/CD Best Practices

#### Before Pushing

```bash
# Run full test suite locally
npm test

# Check coverage
npx nx test football-director-engine --coverage

# Validate coverage thresholds
node .github/scripts/check-coverage.js "football-director-engine" "coverage/libs/football-director-engine"

# Lint code
npx nx run-many -t lint
```

#### During PR Review

1. **Check CI status** - All checks must be green ✅
2. **Review coverage report** - Check PR comment for metrics
3. **Review test results** - Look for new failures
4. **Check coverage changes** - Ensure no significant drops

#### After Merge

- Release branch automatically updated
- Coverage reports archived
- Artifacts available for 30 days

## Troubleshooting

### Common Issues

#### Tests Failing Locally But Passing in CI

**Cause**: Different Node versions or dependencies

**Fix**:
```bash
# Ensure you're using Node 22
node --version  # Should be v22.x.x

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Nx cache
npx nx reset
```

#### Coverage Below Threshold

**Cause**: New code added without tests

**Fix**:
```bash
# Find files with low coverage
npx nx test football-director-engine --coverage
open coverage/libs/football-director-engine/index.html

# Add tests for uncovered lines
# Re-run coverage validation
node .github/scripts/check-coverage.js "football-director-engine" "coverage/libs/football-director-engine"
```

#### Flaky Integration Tests

**Cause**: Async timing issues, shared state

**Fix**:
```typescript
// Use waitFor for async assertions
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(useGameStore.getState().isLoading).toBe(false);
});

// Reset stores before each test
beforeEach(() => {
  useGameStore.getState().resetGame();
  useUIStore.getState().resetUI();
});
```

#### CI Timeout

**Cause**: Tests taking too long (>2min default)

**Fix**:
```typescript
// Increase timeout for specific test
it('long running test', async () => {
  // test code
}, { timeout: 10000 }); // 10 seconds

// Or in test file
import { describe, it, expect, beforeEach } from 'vitest';

describe('Suite', () => {
  it.concurrent.each([...])('test', async () => {
    // Parallel execution for faster runs
  });
});
```

### Debug Mode

```bash
# Run tests with debug output
DEBUG=* npx nx test football-director-engine

# Run single test in debug mode
npx nx test football-director-engine -- -t "specific test name"

# Use Node debugger
node --inspect-brk node_modules/.bin/vitest run
```

### Getting Help

1. **Check test output** - Error messages are usually helpful
2. **Review coverage report** - Identify missing test cases
3. **Check CI logs** - View full build output on GitHub
4. **Run locally first** - Reproduce issues before pushing

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Nx Testing](https://nx.dev/recipes/other/test-applications)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Last Updated**: 2025-12-31
**Coverage**: 93.8% overall (791+ tests)
**CI/CD**: Fully automated with quality gates
