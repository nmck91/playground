# Football Director Engine - Contribution Guide

## Welcome Contributors!

Thank you for your interest in contributing to the Football Director Engine! This guide will help you understand how to add new modules, extend existing ones, and ensure your contributions meet our quality standards.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Adding a New Module](#adding-a-new-module)
4. [Extending Existing Modules](#extending-existing-modules)
5. [Testing Requirements](#testing-requirements)
6. [Code Review Checklist](#code-review-checklist)
7. [Documentation Standards](#documentation-standards)
8. [Common Patterns](#common-patterns)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- TypeScript knowledge
- Familiarity with the Football Director codebase
- Understanding of dependency injection patterns

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd playground

# Install dependencies
npm install

# Run tests to ensure everything works
nx test football-director-engine

# Start development server
nx serve football-director
```

### Understanding the Architecture

Before contributing, read these docs:
- [Engine Module Documentation](../../libs/football-director-engine/src/lib/README.md)
- [Architecture Overview](./architecture.md)
- [Module Interfaces Documentation](../../libs/football-director-engine/src/lib/interfaces/README.md)

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow the patterns described in this guide.

### 3. Write Tests

All new code must include tests (see [Testing Requirements](#testing-requirements)).

### 4. Run Quality Checks

```bash
# Type check
nx run football-director-engine:type-check

# Lint
nx lint football-director-engine

# Tests
nx test football-director-engine

# Build
nx build football-director-engine
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: Add new feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions/changes
- `refactor:` Code refactoring
- `perf:` Performance improvements

### 6. Create Pull Request

Push your branch and create a PR with a clear description of changes.

---

## Adding a New Module

### Step 1: Define the Interface

Create your interface in `libs/football-director-engine/src/lib/interfaces/`:

```typescript
// libs/football-director-engine/src/lib/interfaces/formation-analyzer.interface.ts
import type { Team, Formation } from '../types';

/**
 * Formation Analyzer Interface
 *
 * Analyzes team formations and provides tactical recommendations.
 */
export interface IFormationAnalyzer {
  /**
   * Analyze a team's formation strengths and weaknesses
   */
  analyzeFormation(team: Team): FormationAnalysis;

  /**
   * Recommend formation changes based on opponent
   */
  recommendFormation(team: Team, opponent: Team): Formation;

  /**
   * Calculate formation effectiveness rating
   */
  rateFormation(formation: Formation, squad: Player[]): number;
}

export interface FormationAnalysis {
  strengths: string[];
  weaknesses: string[];
  rating: number;
}
```

### Step 2: Implement the Module

Create the implementation:

```typescript
// libs/football-director-engine/src/lib/formation-analyzer.ts
import { IFormationAnalyzer, FormationAnalysis } from './interfaces/formation-analyzer.interface';
import type { Team, Formation, Player } from './types';

/**
 * Formation Analyzer Implementation
 *
 * Analyzes team formations and provides tactical recommendations.
 * Considers player positions, skills, and tactical matchups.
 */
export class FormationAnalyzer implements IFormationAnalyzer {
  /**
   * Create a new FormationAnalyzer instance
   *
   * @param tacticsManager - Tactics manager for tactical calculations
   */
  constructor(
    private tacticsManager: ITacticsManager
  ) {}

  analyzeFormation(team: Team): FormationAnalysis {
    // Implementation
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    let rating = 0;

    // Analyze formation...

    return { strengths, weaknesses, rating };
  }

  recommendFormation(team: Team, opponent: Team): Formation {
    // Implementation
    return '4-4-2';
  }

  rateFormation(formation: Formation, squad: Player[]): number {
    // Implementation
    return 85;
  }
}

// Re-export interface for convenience
export { IFormationAnalyzer };
```

### Step 3: Create Factory Functions

```typescript
// libs/football-director-engine/src/lib/factories/formation-analyzer.factory.ts
import { FormationAnalyzer } from '../formation-analyzer';
import { IFormationAnalyzer } from '../interfaces/formation-analyzer.interface';
import { createTacticsManager, createMockTacticsManager } from './tactics-manager.factory';

/**
 * Create a production FormationAnalyzer instance
 */
export function createFormationAnalyzer(): IFormationAnalyzer {
  return new FormationAnalyzer(
    createTacticsManager()
  );
}

/**
 * Create a mock FormationAnalyzer instance for testing
 */
export function createMockFormationAnalyzer(overrides?: {
  tacticsManager?: ITacticsManager;
}): IFormationAnalyzer {
  return new FormationAnalyzer(
    overrides?.tacticsManager ?? createMockTacticsManager()
  );
}
```

### Step 4: Register in Module Registry

Add to `libs/football-director-engine/src/lib/module-keys.ts`:

```typescript
export const FormationAnalyzer = 'FormationAnalyzer';
```

Add to `libs/football-director-engine/src/lib/setup-modules.ts`:

```typescript
import { createFormationAnalyzer } from './factories/formation-analyzer.factory';
import { FormationAnalyzer } from './module-keys';

export function initializeEngine() {
  // ... existing modules

  // Register new module
  registerModule(FormationAnalyzer, createFormationAnalyzer());
}
```

### Step 5: Update Interface Index

Add to `libs/football-director-engine/src/lib/interfaces/index.ts`:

```typescript
export * from './formation-analyzer.interface';
```

### Step 6: Write Tests

```typescript
// libs/football-director-engine/src/lib/formation-analyzer.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { FormationAnalyzer } from './formation-analyzer';
import { createMockFormationAnalyzer } from './factories/formation-analyzer.factory';
import type { Team, Player } from './types';

describe('FormationAnalyzer', () => {
  describe('analyzeFormation', () => {
    it('should analyze formation strengths', () => {
      const analyzer = createMockFormationAnalyzer();
      const team: Team = {
        name: 'Test FC',
        formation: '4-4-2',
        squad: [],
        league: 'Test League',
        mentality: 'balanced',
      };

      const analysis = analyzer.analyzeFormation(team);

      expect(analysis).toBeDefined();
      expect(analysis.strengths).toBeInstanceOf(Array);
      expect(analysis.weaknesses).toBeInstanceOf(Array);
      expect(analysis.rating).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recommendFormation', () => {
    it('should recommend formation based on opponent', () => {
      const analyzer = createMockFormationAnalyzer();
      const team: Team = { name: 'Test FC', formation: '4-4-2', squad: [], league: 'Test', mentality: 'balanced' };
      const opponent: Team = { name: 'Opponent FC', formation: '5-4-1', squad: [], league: 'Test', mentality: 'defensive' };

      const recommendation = analyzer.recommendFormation(team, opponent);

      expect(recommendation).toBeDefined();
      expect(typeof recommendation).toBe('string');
    });
  });

  describe('with mocked dependencies', () => {
    it('should use injected tactics manager', () => {
      const mockTacticsManager = {
        calculateTacticalBonus: vi.fn().mockReturnValue(10),
        analyzeTacticalMatchup: vi.fn(),
      };

      const analyzer = createMockFormationAnalyzer({
        tacticsManager: mockTacticsManager,
      });

      const team: Team = { name: 'Test FC', formation: '4-4-2', squad: [], league: 'Test', mentality: 'balanced' };
      analyzer.analyzeFormation(team);

      expect(mockTacticsManager.calculateTacticalBonus).toHaveBeenCalled();
    });
  });
});
```

### Step 7: Update Documentation

Add module documentation to `libs/football-director-engine/src/lib/README.md`:

```markdown
#### formation-analyzer.ts

**Purpose**: Analyzes team formations and provides tactical recommendations.

**Responsibilities**:
- Analyze formation strengths and weaknesses
- Recommend formations based on opponent
- Rate formation effectiveness

**Public API**:
\`\`\`typescript
interface IFormationAnalyzer {
  analyzeFormation(team: Team): FormationAnalysis;
  recommendFormation(team: Team, opponent: Team): Formation;
  rateFormation(formation: Formation, squad: Player[]): number;
}
\`\`\`

**Dependencies**:
- `ITacticsManager` - Tactical calculations

**Example**:
\`\`\`typescript
import { getModule } from './module-registry';
import { FormationAnalyzer } from './module-keys';

const analyzer = getModule(FormationAnalyzer);
const analysis = analyzer.analyzeFormation(team);
console.log(\`Formation rating: \${analysis.rating}\`);
\`\`\`
```

---

## Extending Existing Modules

### Adding Methods to Existing Modules

1. **Update the interface** first:
```typescript
// interfaces/match-simulator.interface.ts
export interface IMatchSimulator {
  // Existing methods...
  simulateMatch(homeTeam: Team, awayTeam: Team, week: number): MatchResult;

  // NEW: Add your method
  simulateMatchWithCustomRules(
    homeTeam: Team,
    awayTeam: Team,
    week: number,
    rules: CustomRules
  ): MatchResult;
}
```

2. **Implement in the module**:
```typescript
// match-simulator.ts
simulateMatchWithCustomRules(
  homeTeam: Team,
  awayTeam: Team,
  week: number,
  rules: CustomRules
): MatchResult {
  // Implementation
}
```

3. **Update tests** to cover the new method

4. **Update factory** if needed (usually not needed)

5. **Document** the new method

### Modifying Existing Logic

1. **Write tests first** that capture current behavior
2. **Make your changes**
3. **Ensure all tests pass**
4. **Add new tests** for new behavior
5. **Update documentation** if API changes

---

## Testing Requirements

### Coverage Requirements

- **Unit Tests**: >80% coverage for all modules
- **Integration Tests**: >70% coverage for module interactions
- **All new code must include tests**

### Test Structure

Use the Arrange-Act-Assert pattern:

```typescript
it('should calculate player morale correctly', () => {
  // Arrange
  const moraleManager = createMockMoraleManager();
  const player: Player = { /* test data */ };
  const team: Team = { /* test data */ };
  const results: MatchResult[] = [/* test data */];

  // Act
  const morale = moraleManager.calculateMorale(player, team, results);

  // Assert
  expect(morale).toBeGreaterThanOrEqual(0);
  expect(morale).toBeLessThanOrEqual(100);
});
```

### Test Types

1. **Unit Tests**: Test individual modules in isolation
2. **Integration Tests**: Test module interactions
3. **Mocking**: Always mock dependencies using interfaces

### Running Tests

```bash
# Run all tests
nx test football-director-engine

# Run tests in watch mode
nx test football-director-engine --watch

# Run tests with coverage
nx test football-director-engine --coverage

# Run specific test file
nx test football-director-engine --testFile=match-simulator.spec.ts
```

---

## Code Review Checklist

Before submitting a PR, ensure:

### Code Quality
- [ ] Follows TypeScript strict mode (no `any` types)
- [ ] Uses interfaces for all dependencies
- [ ] No circular dependencies
- [ ] No hardcoded dependencies (uses DI)
- [ ] No UI/React dependencies in engine code
- [ ] Functions are pure where possible
- [ ] Immutable state updates (no mutations)

### Testing
- [ ] Unit tests written for all new code
- [ ] Tests use mocks via interfaces
- [ ] Tests are deterministic (no random failures)
- [ ] All tests pass locally
- [ ] Coverage meets >80% threshold

### Documentation
- [ ] JSDoc comments for all public methods
- [ ] Interface documented in README.md
- [ ] Examples provided for complex features
- [ ] Migration guide updated if breaking changes

### Module Structure
- [ ] Interface defined in `interfaces/` directory
- [ ] Implementation follows single responsibility
- [ ] Factory functions created
- [ ] Module registered in registry
- [ ] Exported from appropriate index files

### Performance
- [ ] No unnecessary computations in loops
- [ ] Caching used where appropriate
- [ ] Module can be used as singleton

---

## Documentation Standards

### JSDoc Comments

All public methods must have JSDoc comments:

```typescript
/**
 * Calculate player morale based on various factors
 *
 * Considers playing time, team performance, wages, and
 * contract situation to determine overall morale.
 *
 * @param player - The player to calculate morale for
 * @param team - The player's team
 * @param recentResults - Recent match results (last 5 games)
 * @returns Morale value between 0-100
 *
 * @example
 * ```typescript
 * const morale = moraleManager.calculateMorale(player, team, results);
 * console.log(`Player morale: ${morale}`);
 * ```
 */
calculateMorale(player: Player, team: Team, recentResults: MatchResult[]): number {
  // Implementation
}
```

### README Updates

When adding a module, add a section to the README:

1. **Purpose**: What does it do?
2. **Responsibilities**: Specific responsibilities
3. **Public API**: Interface with types
4. **Dependencies**: What it depends on
5. **Example**: Usage example
6. **Testing**: How to test it

---

## Common Patterns

### Singleton Pattern via Registry

```typescript
// Access singleton instance
import { getModule } from './module-registry';
import { MatchSimulator } from './module-keys';

const simulator = getModule(MatchSimulator);
```

### Dependency Injection Pattern

```typescript
// Module with injected dependencies
export class MyModule implements IMyModule {
  constructor(
    private dependency1: IDependency1,
    private dependency2: IDependency2
  ) {}

  myMethod() {
    // Use this.dependency1 and this.dependency2
  }
}
```

### Factory Pattern

```typescript
// Production factory
export function createMyModule(): IMyModule {
  return new MyModule(
    createDependency1(),
    createDependency2()
  );
}

// Test factory with overrides
export function createMockMyModule(overrides?: {
  dependency1?: IDependency1;
  dependency2?: IDependency2;
}): IMyModule {
  return new MyModule(
    overrides?.dependency1 ?? createMockDependency1(),
    overrides?.dependency2 ?? createMockDependency2()
  );
}
```

### Interface-First Development

Always define the interface before implementation:

1. Define interface
2. Write tests using the interface
3. Implement the module
4. Tests pass without modification

---

## Questions or Issues?

- Check existing documentation in `docs/football-director/`
- Review similar modules for patterns
- Ask in pull request comments
- Create an issue for discussion

---

## Thank You!

Your contributions help make Football Director better for everyone. We appreciate your time and effort!

---

Last Updated: 2026-01-05
Version: 1.0
