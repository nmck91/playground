# Testing Reality

## Current Test Coverage

**Unit Tests**:
- **Framework**: Jest with jest-preset-angular
- **Coverage**: Minimal (newly generated components have skeleton tests)
- **Location**: `apps/*/src/**/*.spec.ts`
- **Run**: `npx nx test [app-name]`

**E2E Tests**:
- **Framework**: Playwright
- **Coverage**: Basic smoke tests in generated projects
- **Location**: `apps/*-e2e/src/**/*.spec.ts`
- **Run**: `npx nx e2e [app-name]-e2e`

**Integration Tests**: None currently

**Manual Testing**: Primary QA method (personal playground project)

## Running Tests

```bash
# Unit tests for specific app
npx nx test family-calendar
npx nx test reward-chart

# Unit tests with coverage
npx nx test family-calendar --coverage
npx nx test reward-chart --coverage

# E2E tests
npx nx e2e family-calendar-e2e
npx nx e2e reward-chart-e2e

# Run all tests
npx nx run-many -t test

# Lint
npx nx run-many -t lint
```

---
