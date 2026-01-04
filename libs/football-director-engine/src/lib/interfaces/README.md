# Engine Module Interfaces

This directory contains TypeScript interfaces for all Football Director engine modules. These interfaces enable dependency injection, improve testability, and make module dependencies explicit.

## Naming Conventions

- Interface names follow the pattern: `I<ModuleName>`
- Example: `MatchSimulator` → `IMatchSimulator`
- All interfaces use PascalCase
- Interface files match their module names: `match-simulator.interface.ts`

## Interface Design Principles

### 1. Contract Definition
Each interface defines the public API contract for its module:
- All public methods that consumers depend on
- Method signatures with typed parameters and return types
- No implementation details (those stay in the concrete class)

### 2. Dependency Clarity
Interfaces make dependencies explicit:
- Constructor/function parameters declare required dependencies
- No hidden/implicit dependencies
- Easy to see what a module needs to function

### 3. Testability
Interfaces enable easy mocking in tests:
- Create mock implementations for testing
- Inject mocks instead of real dependencies
- Test modules in isolation

## Usage Patterns

### Implementing an Interface

```typescript
// interface file: interfaces/match-simulator.interface.ts
export interface IMatchSimulator {
  simulateMatch(homeTeam: Team, awayTeam: Team, week: number): MatchResult;
}

// implementation file: match-simulator.ts
import { IMatchSimulator } from './interfaces/match-simulator.interface';

export class MatchSimulator implements IMatchSimulator {
  constructor(
    private injuryManager: IInjuryManager,
    private statsTracker: IPlayerStatsTracker
  ) {}

  simulateMatch(homeTeam: Team, awayTeam: Team, week: number): MatchResult {
    // Implementation using injected dependencies
  }
}
```

### Creating Production Instances

```typescript
// Factory function for production use
export function createMatchSimulator(): IMatchSimulator {
  return new MatchSimulator(
    createInjuryManager(),
    createPlayerStatsTracker()
  );
}
```

### Creating Test Instances

```typescript
// Factory function for testing with mocks
export function createMockMatchSimulator(overrides?: {
  injuryManager?: IInjuryManager;
  statsTracker?: IPlayerStatsTracker;
}): IMatchSimulator {
  return new MatchSimulator(
    overrides?.injuryManager ?? createMockInjuryManager(),
    overrides?.statsTracker ?? createMockPlayerStatsTracker()
  );
}
```

### Using in Tests

```typescript
import { createMockMatchSimulator } from './match-simulator';
import { IInjuryManager } from './interfaces/injury-manager.interface';

describe('MatchSimulator', () => {
  it('should process injuries during match', () => {
    // Create a mock injury manager with controlled behavior
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([/* mock injuries */])
    };

    // Inject the mock into the simulator
    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager
    });

    // Test in isolation
    const result = simulator.simulateMatch(homeTeam, awayTeam, 1);
    expect(mockInjuryManager.processInjuries).toHaveBeenCalled();
  });
});
```

## Dependency Rules

### Engine Layer
- **Engine modules** depend only on other engine modules
- **NO** dependencies on React, UI components, or hooks
- Pure TypeScript/JavaScript logic only

### Application Layer
- **Hooks/Stores** depend on engine modules (via interfaces)
- **Components** depend on hooks/stores (NOT directly on engine)

### Dependency Flow
```
Components → Hooks/Stores → Engine Modules
```

This unidirectional flow keeps the architecture clean and maintainable.

## Adding New Interfaces

When adding a new engine module:

1. **Create the interface file**: `interfaces/<module-name>.interface.ts`
2. **Define the interface**: Export `I<ModuleName>` with public methods
3. **Implement in module**: Have your class implement the interface
4. **Add to index**: Export from `interfaces/index.ts`
5. **Create factories**: Add `create<ModuleName>()` and `createMock<ModuleName>()`
6. **Write tests**: Demonstrate DI usage in tests

## Benefits

✅ **Testability**: Easy to mock dependencies
✅ **Flexibility**: Swap implementations without changing consumers
✅ **Clarity**: Explicit dependencies make relationships clear
✅ **Maintainability**: Easier refactoring with defined contracts
✅ **Type Safety**: TypeScript ensures implementations match contracts
