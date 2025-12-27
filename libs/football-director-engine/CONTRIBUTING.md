# Contributing to Football Director Engine

Thank you for your interest in contributing to the Football Director Engine! This guide will help you add new modules, extend existing ones, and ensure your contributions meet our quality standards.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Module](#adding-a-new-module)
- [Extending an Existing Module](#extending-an-existing-module)
- [Testing Requirements](#testing-requirements)
- [Documentation Requirements](#documentation-requirements)
- [Code Review Checklist](#code-review-checklist)
- [Common Patterns](#common-patterns)

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Familiarity with TypeScript and Object-Oriented Programming
- Understanding of football (soccer) management game concepts

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `nx test football-director-engine`
4. Build the library: `nx build football-director-engine`

### Project Structure

```
libs/football-director-engine/
├── src/
│   └── lib/
│       ├── types.ts                    # Shared types
│       ├── match-simulator.ts          # Module files
│       ├── match-simulator.spec.ts     # Test files
│       └── ...
├── README.md                           # Module documentation
├── CONTRIBUTING.md                     # This file
└── package.json
```

## Development Workflow

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Follow the patterns and guidelines below
3. **Write tests**: Ensure >80% coverage for new code
4. **Run tests**: `nx test football-director-engine`
5. **Update documentation**: Update README and JSDoc comments
6. **Create pull request**: Include description and test results
7. **Code review**: Address feedback and make requested changes

## Adding a New Module

### Step 1: Define the Interface

Start by defining the TypeScript interface for your module:

```typescript
// my-new-module.ts

/**
 * MyNewModule Interface
 *
 * Defines the contract for [describe module purpose].
 */
export interface IMyNewModule {
  /**
   * [Method description]
   *
   * @param param1 - [Description]
   * @param param2 - [Description]
   * @returns [Return value description]
   */
  myMethod(param1: Type1, param2: Type2): ReturnType;

  // Add all public methods with JSDoc
}
```

**Interface Naming Convention**: `I<ClassName>`

**Requirements**:
- All public methods must be in the interface
- Comprehensive JSDoc comments for each method
- Only public API methods (no private implementation details)

### Step 2: Implement the Class

```typescript
/**
 * MyNewModule Implementation
 *
 * [Detailed module description]
 *
 * @example
 * ```typescript
 * const module = new MyNewModule();
 * const result = module.myMethod(param1, param2);
 * ```
 */
export class MyNewModule implements IMyNewModule {
  /**
   * [Method implementation description]
   */
  myMethod(param1: Type1, param2: Type2): ReturnType {
    // Implementation
  }

  /**
   * Private helper methods (not in interface)
   */
  private helperMethod(): void {
    // Private implementation
  }
}
```

**Class Requirements**:
- Implement the interface explicitly using `implements IMyNewModule`
- Single Responsibility Principle: One clear purpose
- No UI/React dependencies
- Deterministic where possible (accept seeds for randomness)
- Immutable operations (return new objects, don't mutate parameters)

### Step 3: Add Types (if needed)

If your module needs new types, add them to `types.ts`:

```typescript
// types.ts

/**
 * [Type description]
 */
export interface MyNewType {
  id: string;
  name: string;
  // ... properties
}
```

### Step 4: Write Comprehensive Tests

```typescript
// my-new-module.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { MyNewModule } from './my-new-module';

describe('MyNewModule', () => {
  let module: MyNewModule;

  beforeEach(() => {
    module = new MyNewModule();
  });

  describe('myMethod', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const param1 = /* test data */;
      const param2 = /* test data */;

      // Act
      const result = module.myMethod(param1, param2);

      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });

    it('should handle edge case: [describe case]', () => {
      // Test edge cases
    });

    it('should be deterministic with seed', () => {
      const result1 = module.myMethod(param, seed);
      const result2 = module.myMethod(param, seed);

      expect(result1).toEqual(result2);
    });
  });
});
```

**Test Requirements**:
- >80% code coverage
- Arrange-Act-Assert pattern
- Descriptive test names
- Test happy paths and edge cases
- Test determinism (if using randomness)
- Fast execution (< 100ms per test)

### Step 5: Update Documentation

1. **Update README.md**:
   - Add module to appropriate category section
   - Add detailed module description with API docs
   - Update module count if needed

2. **Add JSDoc to all exports**:
   ```typescript
   /**
    * Calculates [what it calculates]
    *
    * @param input - [Description of input]
    * @returns [Description of return value]
    *
    * @example
    * ```typescript
    * const result = calculateSomething(input);
    * console.log(result); // Expected output
    * ```
    */
   export function calculateSomething(input: Input): Output {
     // Implementation
   }
   ```

3. **Export from index**:
   ```typescript
   // libs/football-director-engine/src/index.ts
   export * from './lib/my-new-module';
   ```

### Step 6: Code Review Checklist

Before submitting, verify:

- [ ] Interface defined with `I<ClassName>` naming
- [ ] Class implements interface explicitly
- [ ] All public methods have JSDoc comments
- [ ] Tests written with >80% coverage
- [ ] All tests passing
- [ ] No TypeScript errors or warnings
- [ ] No ESLint errors or warnings
- [ ] README updated with module documentation
- [ ] Exported from index.ts
- [ ] Follows existing code patterns and style
- [ ] No UI/React dependencies
- [ ] Deterministic where applicable (seeds used)
- [ ] Immutable operations (no parameter mutation)

## Extending an Existing Module

### When to Extend vs. Create New

**Extend existing module when**:
- Functionality is closely related to existing module
- Module has clear space for the feature (not overloaded)
- Fits module's single responsibility

**Create new module when**:
- Functionality is distinct from existing modules
- Existing module is already complex (>300 lines)
- Different domain/responsibility

### Extension Process

1. **Read existing module code and tests**
2. **Update interface with new methods**:
   ```typescript
   export interface IExistingModule {
     existingMethod(): void;

     // New method
     newMethod(param: Type): Return;
   }
   ```

3. **Implement new methods in class**
4. **Write tests for new functionality**
5. **Update module documentation in README**
6. **Verify all existing tests still pass**

### Backward Compatibility

When modifying existing modules:

- ✅ **DO**: Add new optional parameters at end of parameter lists
- ✅ **DO**: Add new methods to interfaces
- ✅ **DO**: Add new properties to return types
- ❌ **DON'T**: Change existing method signatures (breaking change)
- ❌ **DON'T**: Remove methods or properties
- ❌ **DON'T**: Change return types

If a breaking change is necessary, document it clearly and discuss with maintainers.

## Testing Requirements

### Coverage Requirements

- **Minimum coverage**: 80% overall
- **Preferred coverage**: >90% for new modules
- Run coverage: `nx test football-director-engine --coverage`

### Test Structure

```typescript
describe('ModuleName', () => {
  // Setup
  let module: ModuleName;
  let mockDependency: IDependency;

  beforeEach(() => {
    mockDependency = {
      method: vi.fn().mockReturnValue(value)
    };
    module = new ModuleName(mockDependency);
  });

  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = module.methodName(input);

      // Assert
      expect(result).toBe(expected);
      expect(mockDependency.method).toHaveBeenCalledWith(expected);
    });
  });
});
```

### Test Data Factories

Create reusable test data factories:

```typescript
// test-helpers.ts

export function createTestPlayer(overrides?: Partial<Player>): Player {
  return {
    id: 'player-1',
    name: 'Test Player',
    position: 'FWD',
    skill: 10,
    age: 25,
    wages: 2000,
    stats: { /* ... */ },
    history: [],
    ...overrides
  };
}

export function createTestTeam(overrides?: Partial<Team>): Team {
  return {
    id: 'team-1',
    name: 'Test Team',
    budget: 1000000,
    players: [createTestPlayer(), createTestPlayer()],
    staff: [],
    tactics: { /* ... */ },
    ...overrides
  };
}
```

### Deterministic Testing

For modules with randomness, always support seeds:

```typescript
it('should be deterministic with same seed', () => {
  const result1 = module.generateWithSeed(seed);
  const result2 = module.generateWithSeed(seed);

  expect(result1).toEqual(result2);
});

it('should produce different results with different seeds', () => {
  const result1 = module.generateWithSeed(123);
  const result2 = module.generateWithSeed(456);

  expect(result1).not.toEqual(result2);
});
```

## Documentation Requirements

### JSDoc Comments

All public exports must have JSDoc:

```typescript
/**
 * Brief one-line description
 *
 * Optional longer description explaining behavior, edge cases,
 * or usage patterns. Can span multiple paragraphs.
 *
 * @param param1 - Description of parameter
 * @param param2 - Description of parameter
 * @returns Description of return value
 *
 * @throws {ErrorType} When [condition that causes error]
 *
 * @example
 * ```typescript
 * const result = myFunction(value1, value2);
 * console.log(result); // Expected output
 * ```
 *
 * @see {@link RelatedFunction} for related functionality
 */
export function myFunction(param1: Type1, param2: Type2): ReturnType {
  // Implementation
}
```

### README Updates

When adding or significantly modifying a module, update the README:

1. **Module Organization section**: Add to appropriate category
2. **Module Descriptions section**: Add detailed documentation
3. **Quick Start section**: Update if new module affects basic usage
4. **Dependencies**: Update dependency information

### Inline Comments

Use inline comments for:

- Complex algorithms or calculations
- Non-obvious business logic
- Workarounds or edge cases
- Performance optimizations

```typescript
// Calculate skill change using age-based curve
// Younger players (18-24) have higher growth potential
// Peak players (25-30) maintain skill
// Older players (31+) decline gradually
const skillChange = this.calculateAgeBasedChange(player.age);
```

## Code Review Checklist

### Before Submitting PR

- [ ] **Code Quality**
  - [ ] Follows TypeScript strict mode (no `any` types)
  - [ ] No ESLint errors or warnings
  - [ ] No TypeScript compilation errors
  - [ ] Follows existing code style and patterns
  - [ ] Single Responsibility Principle followed
  - [ ] DRY principle (no code duplication)

- [ ] **Testing**
  - [ ] All tests passing (`nx test football-director-engine`)
  - [ ] New code has >80% test coverage
  - [ ] Tests are deterministic (no flaky tests)
  - [ ] Edge cases tested
  - [ ] Error conditions tested

- [ ] **Documentation**
  - [ ] JSDoc comments on all public exports
  - [ ] README updated with module docs
  - [ ] Examples provided for complex functionality
  - [ ] Breaking changes documented (if any)

- [ ] **Architecture**
  - [ ] Interface defined for new modules
  - [ ] Class implements interface
  - [ ] No UI/React dependencies
  - [ ] Dependencies injected (not hardcoded)
  - [ ] Immutable operations (no mutations)

- [ ] **Integration**
  - [ ] Exported from index.ts
  - [ ] Types added to types.ts (if needed)
  - [ ] Backward compatible (or breaking changes documented)
  - [ ] Works with existing modules

### During Code Review

Reviewers should check for:

1. **Correctness**: Does the code do what it's supposed to?
2. **Testing**: Is test coverage adequate and meaningful?
3. **Clarity**: Is the code easy to understand?
4. **Performance**: Are there obvious performance issues?
5. **Security**: Are there any security vulnerabilities?
6. **Maintainability**: Will this be easy to maintain and extend?

## Common Patterns

### Pattern 1: Seeded Random Generation

```typescript
private seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

public generateWithSeed(seed?: number): Result {
  const random = seed !== undefined ? this.seededRandom(seed) : Math.random;

  const randomValue = Math.floor(random() * 100);
  // Use randomValue...
}
```

### Pattern 2: Immutable Updates

```typescript
// ✅ Good - Returns new object
public updatePlayer(player: Player, changes: Partial<Player>): Player {
  return {
    ...player,
    ...changes
  };
}

// ❌ Bad - Mutates parameter
public updatePlayer(player: Player, changes: Partial<Player>): Player {
  Object.assign(player, changes);
  return player;
}
```

### Pattern 3: Result Objects for Operations

```typescript
public performOperation(input: Input): {
  success: boolean;
  message: string;
  result?: Result;
  error?: Error;
} {
  try {
    const result = this.doOperation(input);
    return {
      success: true,
      message: 'Operation successful',
      result
    };
  } catch (error) {
    return {
      success: false,
      message: 'Operation failed',
      error: error as Error
    };
  }
}
```

### Pattern 4: Dependency Injection

```typescript
// Interface for dependency
export interface IDependency {
  doSomething(): void;
}

// Module accepts dependency via constructor
export class MyModule implements IMyModule {
  constructor(
    private dependency: IDependency
  ) {}

  public myMethod(): void {
    this.dependency.doSomething();
  }
}

// Testing with mock
const mockDependency: IDependency = {
  doSomething: vi.fn()
};
const module = new MyModule(mockDependency);
```

### Pattern 5: Validation and Error Handling

```typescript
public validateAndProcess(input: Input): Result {
  // Validate input
  if (!input || !input.required Property) {
    throw new Error('Invalid input: requiredProperty is missing');
  }

  if (input.value < 0) {
    throw new Error('Invalid input: value must be non-negative');
  }

  // Process valid input
  return this.process(input);
}
```

## Getting Help

- **Questions**: Open a GitHub issue with the `question` label
- **Bug Reports**: Open a GitHub issue with the `bug` label
- **Feature Requests**: Open a GitHub issue with the `enhancement` label
- **Discussions**: Use GitHub Discussions for broader topics

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
