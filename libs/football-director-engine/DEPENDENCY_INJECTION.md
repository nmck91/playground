# Dependency Injection System

**Story 1.4.4 - Module Interfaces and Dependency Injection**

This document describes the dependency injection (DI) system implemented in the Football Director Engine library.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Usage Guide](#usage-guide)
4. [Dependency Rules](#dependency-rules)
5. [Testing with DI](#testing-with-di)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## Overview

The DI system provides:
- **Loose coupling** between modules through interfaces
- **Testability** via mock implementations
- **Flexibility** to swap implementations without changing consumer code
- **Centralized** module management through a registry

## Architecture

### Components

```
├── interfaces/              # Interface definitions for all modules
│   ├── match-simulator.interface.ts
│   ├── season-manager.interface.ts
│   └── ... (23 total)
├── factories/               # Factory functions for module instantiation
│   ├── match-simulator.factory.ts
│   ├── season-manager.factory.ts
│   └── ... (23 total)
├── module-registry.ts       # Module registry implementation
├── module-keys.ts           # Type-safe module key constants
└── setup-modules.ts         # Convenience functions for module registration
```

### Key Concepts

1. **Interfaces** (`I<ModuleName>`): Define the contract for each module
2. **Factories** (`create<ModuleName>()`): Create module instances
3. **Mock Factories** (`createMock<ModuleName>(overrides?)`): Create test doubles
4. **Module Registry**: Central storage for module instances
5. **Module Keys**: Type-safe constants for module identification

## Usage Guide

### Basic Usage

```typescript
import { createMatchSimulator } from '@football-director/engine';

// Direct instantiation (traditional approach)
const matchSimulator = createMatchSimulator();
const result = matchSimulator.simulateMatch(homeTeam, awayTeam, fixture);
```

### Using the Module Registry

```typescript
import {
  globalRegistry,
  registerAllModules,
  ModuleKeys,
  IMatchSimulator,
} from '@football-director/engine';

// 1. Register all modules at application startup
registerAllModules();

// 2. Retrieve modules from the registry
const matchSimulator = globalRegistry.get<IMatchSimulator>(
  ModuleKeys.MATCH_SIMULATOR
);

// 3. Use the module
const result = matchSimulator.simulateMatch(homeTeam, awayTeam, fixture);
```

### Creating an Isolated Registry

```typescript
import { createRegistry, ModuleKeys } from '@football-director/engine';
import { createMatchSimulator } from '@football-director/engine';

// Create a new registry (useful for testing or multiple game instances)
const registry = createRegistry();

// Register specific modules
registry.register(ModuleKeys.MATCH_SIMULATOR, createMatchSimulator, {
  singleton: true,
});

// Use the registry
const matchSimulator = registry.get(ModuleKeys.MATCH_SIMULATOR);
```

### Singleton vs Transient Instances

```typescript
// Singleton (default): Same instance returned every time
registry.register(ModuleKeys.MATCH_SIMULATOR, createMatchSimulator, {
  singleton: true,
});

const sim1 = registry.get(ModuleKeys.MATCH_SIMULATOR);
const sim2 = registry.get(ModuleKeys.MATCH_SIMULATOR);
console.log(sim1 === sim2); // true

// Transient: New instance returned every time
registry.register(ModuleKeys.TEAM_GENERATOR, createTeamGenerator, {
  singleton: false,
});

const gen1 = registry.get(ModuleKeys.TEAM_GENERATOR);
const gen2 = registry.get(ModuleKeys.TEAM_GENERATOR);
console.log(gen1 === gen2); // false
```

## Dependency Rules

### Module Categories

Modules are organized into categories with clear dependency rules:

#### 1. Core Engine Modules
- **Match Simulator** - Simulates individual matches
- **Season Manager** - Manages season progression and fixtures
- **Team Generator** - Creates teams and players

**Rules:**
- Core modules should have minimal dependencies on other modules
- Can depend on utility modules (Weather Generator, Name Generator)
- Should NOT depend on content generation or UI-specific modules

#### 2. Player & Team Management
- **Player Development** - Handles player aging and skill progression
- **Player Stats Tracker** - Tracks player statistics
- **Morale Manager** - Manages player happiness
- **Youth Academy Manager** - Generates youth prospects

**Rules:**
- Can depend on core modules for team/player data structures
- Should operate independently of match simulation
- Can be tested in isolation with mock teams/players

#### 3. Match & Competition
- **League Table Manager** - Manages league standings
- **Cup Manager** - Handles cup competitions
- **Tactics Manager** - Manages team tactics and formations
- **Weather Generator** - Generates match weather conditions

**Rules:**
- League/Cup managers depend on Season Manager and Match Simulator
- Tactics Manager should be independent and reusable
- Weather Generator should have no dependencies (pure utility)

#### 4. Content Generation
- **Match Story Generator** - Creates match previews
- **Match Commentary** - Generates match commentary
- **News Engine** - Creates news articles

**Rules:**
- Content generators can depend on any module for data
- Should NOT be depended on by core simulation modules
- Should be easily replaceable or customizable

#### 5. Financial & Business
- **Transfer Market** - Handles player transfers
- **Finance Engine** - Manages team finances
- **Staff Manager** - Manages coaching staff
- **Contract Manager** - Handles contract negotiations
- **AI Contract Manager** - AI-driven contract decisions

**Rules:**
- Can depend on Player/Team management modules
- Should operate independently of match simulation
- Finance changes should not directly affect match outcomes

#### 6. Records & Achievements
- **Records Manager** - Tracks historical records
- **Achievement Manager** - Manages player/team achievements

**Rules:**
- Read-only dependencies on all other modules
- Should NOT be depended on by other modules
- Can be disabled without affecting core gameplay

#### 7. Other Systems
- **Board Manager** - Simulates board decisions
- **Injury Manager** - Handles player injuries

**Rules:**
- Specialized modules with limited scope
- Can depend on core modules
- Should be testable in isolation

### Dependency Flow

```
┌──────────────────────────────────────────────────┐
│                Content Generation                 │
│  (Match Story, Commentary, News)                  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│           Records & Achievements                  │
│  (Records Manager, Achievement Manager)           │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Financial & Business Logic                │
│  (Transfer, Finance, Contracts, Staff)            │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Player & Team Management                  │
│  (Development, Stats, Morale, Youth)              │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Match & Competition Systems               │
│  (League, Cup, Tactics, Weather)                  │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              Core Engine Modules                  │
│  (Match Simulator, Season Manager, Team Gen)      │
└──────────────────────────────────────────────────┘
```

### Forbidden Dependencies

To maintain a clean architecture:

- ❌ Core modules MUST NOT depend on content generation
- ❌ Simulation modules MUST NOT depend on UI/presentation logic
- ❌ Lower-level modules MUST NOT depend on higher-level modules
- ❌ Utilities MUST NOT depend on domain modules

## Testing with DI

### Using Mock Factories

```typescript
import { createMockMatchSimulator } from '@football-director/engine';

describe('My Feature', () => {
  it('should use match simulator', () => {
    // Create a mock with custom behavior
    const mockSimulator = createMockMatchSimulator({
      simulateMatch: (home, away, fixture) => ({
        homeScore: 3,
        awayScore: 1,
        result: 'home',
        // ... other required fields
      }),
    });

    // Use the mock in your test
    const result = mockSimulator.simulateMatch(homeTeam, awayTeam, fixture);
    expect(result.homeScore).toBe(3);
  });
});
```

### Testing with Registry

```typescript
import { createRegistry, ModuleKeys } from '@football-director/engine';
import { createMockMatchSimulator } from '@football-director/engine';

describe('Season Simulation', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    // Create isolated registry for each test
    registry = createRegistry();

    // Register mocks
    registry.registerInstance(
      ModuleKeys.MATCH_SIMULATOR,
      createMockMatchSimulator()
    );
  });

  it('should simulate full season', () => {
    const simulator = registry.get(ModuleKeys.MATCH_SIMULATOR);
    // ... test logic
  });
});
```

### Integration Testing

```typescript
import {
  createRegistry,
  registerCoreModules,
  ModuleKeys,
} from '@football-director/engine';

describe('Integration Tests', () => {
  it('should run full match simulation', () => {
    // Use real implementations for integration tests
    const registry = createRegistry();
    registerCoreModules(registry);

    const matchSimulator = registry.get(ModuleKeys.MATCH_SIMULATOR);
    const teamGenerator = registry.get(ModuleKeys.TEAM_GENERATOR);

    // Generate real teams
    const homeTeam = teamGenerator.generateTeam('Home FC', 15);
    const awayTeam = teamGenerator.generateTeam('Away FC', 15);

    // Simulate with real implementation
    const result = matchSimulator.simulateMatch(
      homeTeam,
      awayTeam,
      mockFixture
    );

    expect(result.homeScore).toBeGreaterThanOrEqual(0);
    expect(result.awayScore).toBeGreaterThanOrEqual(0);
  });
});
```

## Best Practices

### 1. Prefer Interfaces Over Concrete Types

```typescript
// ✅ Good: Depend on interface
function processMatch(simulator: IMatchSimulator, home: Team, away: Team) {
  return simulator.simulateMatch(home, away, fixture);
}

// ❌ Bad: Depend on concrete class
function processMatch(simulator: MatchSimulator, home: Team, away: Team) {
  return simulator.simulateMatch(home, away, fixture);
}
```

### 2. Use Factories, Not Constructors

```typescript
// ✅ Good: Use factory function
const simulator = createMatchSimulator();

// ❌ Bad: Use constructor directly
const simulator = new MatchSimulator();
```

**Rationale:** Factories provide a stable API even if constructor signatures change.

### 3. Register Modules at Application Startup

```typescript
// ✅ Good: Register once at startup
function initializeApp() {
  registerAllModules();
  // ... rest of initialization
}

// ❌ Bad: Register on every use
function runSimulation() {
  registerAllModules(); // Don't do this repeatedly!
  const sim = globalRegistry.get(ModuleKeys.MATCH_SIMULATOR);
}
```

### 4. Use Type-Safe Module Keys

```typescript
// ✅ Good: Use ModuleKeys constant
const simulator = registry.get<IMatchSimulator>(ModuleKeys.MATCH_SIMULATOR);

// ❌ Bad: Use string literals
const simulator = registry.get<IMatchSimulator>('matchSimulator');
```

### 5. Prefer Singletons for Stateless Services

```typescript
// ✅ Good: Singleton for stateless service
registry.register(ModuleKeys.MATCH_SIMULATOR, createMatchSimulator, {
  singleton: true,
});

// ⚠️  Transient only if you need isolated state
registry.register(ModuleKeys.TEAM_GENERATOR, createTeamGenerator, {
  singleton: false, // Only if generator maintains state between calls
});
```

### 6. Mock Only What You Need

```typescript
// ✅ Good: Override only the methods you need
const mockSimulator = createMockMatchSimulator({
  simulateMatch: () => mockResult,
  // Other methods use default mock behavior
});

// ❌ Bad: Manually mock everything
const mockSimulator = {
  simulateMatch: () => mockResult,
  calculatePlayerRatings: () => [],
  generateMatchEvents: () => [],
  // ... tedious!
};
```

## Examples

### Example 1: Simple Match Simulation

```typescript
import { createMatchSimulator, createTeamGenerator } from '@football-director/engine';

// Create modules
const teamGen = createTeamGenerator();
const matchSim = createMatchSimulator();

// Generate teams
const homeTeam = teamGen.generateTeam('Manchester Rovers', 15);
const awayTeam = teamGen.generateTeam('London Athletic', 15);

// Simulate match
const result = matchSim.simulateMatch(homeTeam, awayTeam, {
  id: 'fixture-1',
  week: 1,
  homeTeamId: homeTeam.id,
  awayTeamId: awayTeam.id,
  played: false,
  matchType: 'competitive',
});

console.log(`${result.homeTeam} ${result.homeScore} - ${result.awayScore} ${result.awayTeam}`);
```

### Example 2: Using the Registry

```typescript
import {
  globalRegistry,
  initializeEngine,
  ModuleKeys,
  IMatchSimulator,
  ITeamGenerator,
} from '@football-director/engine';

// Initialize engine once
initializeEngine();

// Get modules from registry
const teamGen = globalRegistry.get<ITeamGenerator>(ModuleKeys.TEAM_GENERATOR);
const matchSim = globalRegistry.get<IMatchSimulator>(ModuleKeys.MATCH_SIMULATOR);

// Use modules (same as above)
const homeTeam = teamGen.generateTeam('Manchester Rovers', 15);
const awayTeam = teamGen.generateTeam('London Athletic', 15);
const result = matchSim.simulateMatch(homeTeam, awayTeam, fixture);
```

### Example 3: Testing with Mocks

```typescript
import { createMockMatchSimulator, createMockTeamGenerator } from '@football-director/engine';

describe('Season Results', () => {
  it('should record match results', () => {
    // Create predictable mocks
    const mockSimulator = createMockMatchSimulator({
      simulateMatch: () => ({
        homeScore: 2,
        awayScore: 1,
        result: 'home',
        homeTeam: 'Home FC',
        awayTeam: 'Away FC',
        // ... other required fields
      }),
    });

    const mockTeamGen = createMockTeamGenerator();

    // Test your logic with predictable results
    const result = mockSimulator.simulateMatch(
      mockTeamGen.generateTeam('Home FC', 15),
      mockTeamGen.generateTeam('Away FC', 15),
      fixture
    );

    expect(result.homeScore).toBe(2);
    expect(result.result).toBe('home');
  });
});
```

### Example 4: Custom Registry Configuration

```typescript
import {
  createRegistry,
  ModuleKeys,
  createMatchSimulator,
  createMockTeamGenerator,
} from '@football-director/engine';

// Create custom registry mixing real and mock modules
const customRegistry = createRegistry();

// Real match simulator for accurate results
customRegistry.register(
  ModuleKeys.MATCH_SIMULATOR,
  createMatchSimulator,
  { singleton: true }
);

// Mock team generator for test data
customRegistry.registerInstance(
  ModuleKeys.TEAM_GENERATOR,
  createMockTeamGenerator({
    generateTeam: (name: string, skill: number) => ({
      id: `team-${name}`,
      name,
      players: [], // Simplified for testing
      // ... other fields
    }),
  })
);

// Use mixed configuration
const matchSim = customRegistry.get(ModuleKeys.MATCH_SIMULATOR);
const teamGen = customRegistry.get(ModuleKeys.TEAM_GENERATOR);
```

## Summary

The dependency injection system provides:

- ✅ **Loose Coupling**: Modules depend on interfaces, not concrete implementations
- ✅ **Testability**: Easy to swap real implementations with mocks
- ✅ **Maintainability**: Clear dependency rules prevent tangled code
- ✅ **Flexibility**: Can customize module behavior without changing consumer code
- ✅ **Type Safety**: TypeScript interfaces and module keys prevent errors

For questions or contributions, see the main project documentation.
