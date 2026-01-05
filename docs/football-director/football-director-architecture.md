# Football Director Engine - Architecture Overview

## Table of Contents

1. [Introduction](#introduction)
2. [High-Level Architecture](#high-level-architecture)
3. [Module Organization](#module-organization)
4. [Module Dependency Graph](#module-dependency-graph)
5. [Data Flow](#data-flow)
6. [Design Patterns](#design-patterns)
7. [Extension Points](#extension-points)
8. [Integration Guide](#integration-guide)

---

## Introduction

The Football Director Engine is a comprehensive TypeScript game engine for football (soccer) management simulation. It provides 24 specialized modules handling all aspects of a football management game, from match simulation to player development, transfers, finances, and more.

### Design Philosophy

The engine is built on these core principles:

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Interface-Based Design**: All modules expose TypeScript interfaces for dependency injection
3. **Pure Business Logic**: No UI dependencies - engine runs headless
4. **Comprehensive Testing**: >80% unit test coverage with deterministic tests
5. **Type Safety**: Strict TypeScript configuration throughout

### Key Characteristics

- **Headless**: No React, DOM, or UI dependencies
- **Deterministic**: Seeded random generation for reproducible results
- **Modular**: Each module can be tested and used independently
- **Extensible**: Clear interfaces for customization and extension
- **Testable**: Dependency injection enables isolated unit tests

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend/UI Layer                            │
│              (React, CLI, Mobile App, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Football Director Engine                       │
│                    (Pure Business Logic)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Core     │  │    Player    │  │    Match     │         │
│  │  Simulation  │  │  Management  │  │   Content    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │  Financial & │  │  Meta Game   │                            │
│  │    Admin     │  │              │                            │
│  └──────────────┘  └──────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer / Storage                          │
│                   (Zustand, Database, etc.)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Organization

The 24 modules are organized into 5 functional categories:

### 1. Core Simulation (4 modules)

**Purpose**: Handle the fundamental game simulation loop

- **MatchSimulator** - Simulates individual matches
- **SeasonManager** - Orchestrates 52-week seasons
- **LeagueTableManager** - Calculates standings
- **CupManager** - Manages knockout competitions

**Key Relationships**:
- SeasonManager uses MatchSimulator for match execution
- LeagueTableManager consumes MatchSimulator results
- CupManager integrates with SeasonManager for scheduling

### 2. Player Management (7 modules)

**Purpose**: Manage player lifecycle, stats, and development

- **PlayerStatsTracker** - Tracks statistics
- **PlayerDevelopment** - Handles aging and skill progression
- **InjuryManager** - Manages injuries and recovery
- **MoraleManager** - Calculates player morale
- **ContractManager** - Handles contracts and renewals
- **AIContractManager** - Automates AI team contracts
- **YouthAcademyManager** - Generates youth players

**Key Relationships**:
- MatchSimulator depends on PlayerStatsTracker, InjuryManager, MoraleManager
- AIContractManager depends on ContractManager
- Development and morale affect match performance

### 3. Match Content (4 modules)

**Purpose**: Generate narrative content around matches

- **MatchCommentary** - Real-time match commentary
- **MatchPreviewGenerator** - Pre-match previews
- **PostMatchGenerator** - Post-match analysis
- **WeatherGenerator** - Weather conditions

**Key Relationships**:
- MatchSimulator uses MatchCommentary during simulation
- PreviewGenerator and PostMatchGenerator consume match data
- WeatherGenerator provides conditions to MatchSimulator

### 4. Financial & Administrative (4 modules)

**Purpose**: Handle team finances, transfers, and management

- **FinanceEngine** - Budget and financial transactions
- **TransferMarket** - Player transfers and valuations
- **BoardManager** - Board objectives and job security
- **StaffManager** - Manager, coach, scout management

**Key Relationships**:
- TransferMarket affects team finances via FinanceEngine
- StaffManager bonuses affect MatchSimulator performance
- BoardManager evaluates season results from LeagueTableManager

### 5. Meta Game (5 modules)

**Purpose**: Provide progression systems and content generation

- **AchievementManager** - Tracks achievements and awards
- **RecordsManager** - Maintains season and club records
- **NewsEngine** - Generates news articles
- **TacticsManager** - Formations and tactical systems
- **TeamGenerator** - Generates teams and leagues

**Key Relationships**:
- NewsEngine consumes events from all other modules
- TacticsManager affects MatchSimulator performance
- AchievementManager monitors game state from all modules
- TeamGenerator initializes teams using StaffManager

---

## Module Dependency Graph

### Core Dependencies

```
MatchSimulator
  ├─ ITacticsManager
  ├─ IInjuryManager
  ├─ IMoraleManager
  ├─ IStaffManager
  ├─ IWeatherGenerator
  └─ IMatchCommentary

SeasonManager
  └─ (No direct dependencies)

LeagueTableManager
  └─ (No direct dependencies)

CupManager
  └─ (No direct dependencies)
```

### Player Management Dependencies

```
PlayerStatsTracker
  └─ (No direct dependencies)

PlayerDevelopment
  └─ (No direct dependencies)

InjuryManager
  └─ (No direct dependencies)

MoraleManager
  └─ (No direct dependencies)

ContractManager
  └─ (No direct dependencies)

AIContractManager
  └─ IContractManager

YouthAcademyManager
  └─ (No direct dependencies)
```

### Match Content Dependencies

```
MatchCommentary
  └─ (No direct dependencies)

MatchPreviewGenerator
  ├─ ILeagueTableManager
  └─ IWeatherGenerator

PostMatchGenerator
  └─ (No direct dependencies)

WeatherGenerator
  └─ (No direct dependencies)
```

### Financial & Administrative Dependencies

```
FinanceEngine
  └─ (No direct dependencies)

TransferMarket
  └─ (No direct dependencies)

BoardManager
  └─ (No direct dependencies)

StaffManager
  └─ (No direct dependencies)
```

### Meta Game Dependencies

```
AchievementManager
  └─ (Consumes full GameState)

RecordsManager
  └─ (No direct dependencies)

NewsEngine
  └─ (No direct dependencies)

TacticsManager
  └─ (No direct dependencies)

TeamGenerator
  ├─ IStaffManager
  ├─ ITacticsManager
  └─ IPlayerStatsTracker
```

### Dependency Layers

The engine follows a layered dependency structure:

**Layer 0 (No Dependencies)**:
- PlayerStatsTracker, PlayerDevelopment, InjuryManager, MoraleManager
- ContractManager, YouthAcademyManager
- WeatherGenerator, MatchCommentary, PostMatchGenerator
- FinanceEngine, TransferMarket, BoardManager, StaffManager
- TacticsManager, RecordsManager, NewsEngine
- SeasonManager, LeagueTableManager, CupManager

**Layer 1 (Depends on Layer 0)**:
- AIContractManager (→ ContractManager)
- MatchPreviewGenerator (→ LeagueTableManager, WeatherGenerator)
- TeamGenerator (→ StaffManager, TacticsManager, PlayerStatsTracker)

**Layer 2 (Depends on Layer 0-1)**:
- MatchSimulator (→ TacticsManager, InjuryManager, MoraleManager, StaffManager, WeatherGenerator, MatchCommentary)

**Layer 3 (Orchestration)**:
- AchievementManager (→ Full GameState)

---

## Data Flow

### Season Simulation Flow

```
1. Initialize Season
   TeamGenerator → SeasonManager.initializeSeason()
   ↓
2. Generate Fixtures
   SeasonManager.generateFixtures()
   ↓
3. Weekly Loop (Weeks 1-52)
   ┌──────────────────────────────────────┐
   │ Week Start                            │
   │   ↓                                   │
   │ Process Finances                      │
   │   FinanceEngine.processWeeklyFinances()│
   │   ↓                                   │
   │ Update Contracts                      │
   │   ContractManager.updateTeamContracts()│
   │   ↓                                   │
   │ Simulate Matches                      │
   │   MatchSimulator.simulateMatch()      │
   │   ↓                                   │
   │ Update League Table                   │
   │   LeagueTableManager.updateTable()    │
   │   ↓                                   │
   │ Generate News                         │
   │   NewsEngine.generateMatchNews()      │
   │   ↓                                   │
   │ Check Achievements                    │
   │   AchievementManager.checkAchievements()│
   │   ↓                                   │
   │ Advance Week                          │
   │   SeasonManager.advanceWeek()         │
   └──────────────────────────────────────┘
   ↓
4. Season End
   RecordsManager.calculateSeasonRecords()
   AchievementManager.awardSeasonPrizes()
   BoardManager.evaluateSeason()
```

### Match Simulation Flow

```
MatchSimulator.simulateMatch()
  ↓
1. Calculate Team Strengths
   - Get available players (InjuryManager)
   - Apply morale modifiers (MoraleManager)
   - Apply staff bonuses (StaffManager)
   - Apply tactical modifiers (TacticsManager)
   ↓
2. Generate Weather
   WeatherGenerator.generateWeather()
   ↓
3. Simulate Match Events
   For each minute:
     - Calculate event probability
     - Generate event (goal, card, injury, etc.)
     - Generate commentary (MatchCommentary)
     - Update player stats (PlayerStatsTracker)
     - Check for injuries (InjuryManager)
   ↓
4. Return MatchResult
   {
     goals: [],
     events: [],
     stats: {},
     commentary: [],
     manOfMatch: Player
   }
```

### Transfer Flow

```
User initiates transfer
  ↓
TransferMarket.buyPlayer()
  ↓
1. Validate budget (buyer has funds)
2. Remove player from seller team
3. Add player to buyer team
4. Update budgets (-price for buyer, +price for seller)
5. Remove listing from market
  ↓
Return updated teams and listings
  ↓
NewsEngine.generateTransferNews()
```

---

## Design Patterns

### 1. Dependency Injection

**Pattern**: Constructor injection with interfaces

**Implementation**:
```typescript
export interface IMatchSimulator {
  simulateMatch(/* params */): MatchResult;
}

export class MatchSimulator implements IMatchSimulator {
  constructor(
    private tacticsManager?: ITacticsManager,
    private injuryManager?: IInjuryManager,
    // ... more dependencies
  ) {
    // Use provided or create defaults
    this.tacticsManager = tacticsManager ?? new TacticsManager();
    this.injuryManager = injuryManager ?? new InjuryManager();
  }
}
```

**Benefits**:
- Easy to mock dependencies in tests
- Flexible module composition
- Clear dependency contracts

### 2. Strategy Pattern

**Pattern**: Tactical systems and formations

**Implementation**:
```typescript
interface Tactics {
  formation: FormationType;
  mentality: 'defensive' | 'balanced' | 'attacking';
  instructions: TeamInstructions;
}

// Different formations have different effects
calculateTacticalModifier(ownTactics: Tactics, opponentTactics: Tactics): number {
  // 4-3-3 vs 4-4-2 = different modifiers
  // Attacking vs Defensive = different modifiers
}
```

### 3. Factory Pattern

**Pattern**: Team and player generation

**Implementation**:
```typescript
export class TeamGenerator {
  generatePlayer(position, skillRange, seed): Player {
    // Factory method for player creation
  }

  generateTeam(name, tier, seed): Team {
    // Factory method for team creation
  }

  generateLeague(seed): Team[] {
    // Factory method for league creation
  }
}
```

### 4. Observer Pattern (Implicit)

**Pattern**: News generation observes game events

**Implementation**:
```typescript
// After any significant event:
match result → NewsEngine.generateMatchNews(result)
transfer → NewsEngine.generateTransferNews(transfer)
injury → NewsEngine.generateInjuryNews(player, injury)
achievement → NewsEngine.generateAchievementNews(achievement)
```

### 5. Template Method Pattern

**Pattern**: Match simulation structure

**Implementation**:
```typescript
simulateMatch() {
  // Template structure:
  1. Setup (calculate strengths, weather)
  2. Simulate events (loop through minutes)
  3. Generate results (stats, man of match)
  4. Return structured result
}
```

### 6. Singleton-like Pattern (Module Registry)

**Pattern**: Central module registry for dependency injection

**Implementation**:
```typescript
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules = new Map<ModuleKey, any>();

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  register<T>(key: ModuleKey, module: T): void {
    this.modules.set(key, module);
  }

  get<T>(key: ModuleKey): T | undefined {
    return this.modules.get(key) as T | undefined;
  }
}
```

---

## Extension Points

### 1. Custom Match Simulation Logic

**Extension Point**: Override MatchSimulator behavior

```typescript
import { MatchSimulator, IMatchSimulator } from '@playground/football-director-engine';

export class CustomMatchSimulator extends MatchSimulator implements IMatchSimulator {
  // Override specific methods
  calculateTeamStrength(team: Team, currentWeek: number): number {
    // Custom strength calculation
    const baseStrength = super.calculateTeamStrength(team, currentWeek);
    return baseStrength * customModifier;
  }
}

// Use in your game
const simulator = new CustomMatchSimulator();
```

### 2. Custom News Templates

**Extension Point**: Extend NewsEngine with custom templates

```typescript
import { NewsEngine } from '@playground/football-director-engine';

export class CustomNewsEngine extends NewsEngine {
  generateCustomEventNews(event: CustomEvent): NewsArticle {
    return {
      id: generateId(),
      title: 'Custom Event!',
      content: this.generateCustomTemplate(event),
      importance: 'high',
      week: event.week,
      year: event.year
    };
  }
}
```

### 3. Custom Achievement Definitions

**Extension Point**: Add custom achievements

```typescript
import { AchievementManager, Achievement } from '@playground/football-director-engine';

const customAchievements: Achievement[] = [
  {
    id: 'custom-achievement-1',
    name: 'Perfect Season',
    description: 'Win every match in a season',
    category: 'season',
    unlocked: false
  }
];

const achievementManager = new AchievementManager();
// Merge with existing achievements
```

### 4. Custom Tactical Systems

**Extension Point**: Add new formations or tactical instructions

```typescript
import { TacticsManager, FormationType } from '@playground/football-director-engine';

// Add to existing formations
const customFormation: FormationType = '3-5-2';

// Custom tactical calculation
export class CustomTacticsManager extends TacticsManager {
  calculateAdvancedTacticsModifier(tactics: Tactics): number {
    // Custom logic
    return baseModifier + customBonus;
  }
}
```

### 5. Custom Transfer Market Logic

**Extension Point**: Implement custom transfer valuation

```typescript
import { TransferMarket } from '@playground/football-director-engine';

export class CustomTransferMarket extends TransferMarket {
  calculatePlayerValue(player: Player): number {
    // Custom valuation formula
    const baseValue = super.calculatePlayerValue(player);
    return baseValue * (1 + player.marketHype);
  }
}
```

---

## Integration Guide

### Frontend Integration

The engine is designed to be UI-agnostic. Here's how to integrate with different frontends:

#### React Integration

```typescript
import { useGameEngineStore } from '@/stores/game-engine-store';
import {
  MatchSimulator,
  SeasonManager,
  LeagueTableManager
} from '@playground/football-director-engine';

export function useMatchSimulation() {
  const { teams, season, updateMatchResult } = useGameEngineStore();

  const simulateNextMatch = () => {
    const simulator = new MatchSimulator();
    const fixture = season.fixtures.find(f => !f.played);

    if (fixture) {
      const homeTeam = teams.find(t => t.id === fixture.homeTeamId)!;
      const awayTeam = teams.find(t => t.id === fixture.awayTeamId)!;

      const result = simulator.simulateMatch(
        homeTeam,
        awayTeam,
        fixture,
        season.currentWeek,
        season.year
      );

      updateMatchResult(result);
    }
  };

  return { simulateNextMatch };
}
```

#### CLI Integration

```typescript
import {
  TeamGenerator,
  SeasonManager,
  MatchSimulator
} from '@playground/football-director-engine';

async function runSimulation() {
  const generator = new TeamGenerator();
  const teams = generator.generateLeague();

  const seasonManager = new SeasonManager();
  const season = seasonManager.initializeSeason(teams, 2025);

  const simulator = new MatchSimulator();

  // Simulate entire season
  for (const fixture of season.fixtures) {
    const homeTeam = teams.find(t => t.id === fixture.homeTeamId)!;
    const awayTeam = teams.find(t => t.id === fixture.awayTeamId)!;

    const result = simulator.simulateMatch(
      homeTeam,
      awayTeam,
      fixture,
      fixture.week,
      season.year
    );

    console.log(`${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);
  }
}
```

### State Management Integration

#### Zustand Store Pattern

```typescript
import { create } from 'zustand';
import {
  MatchSimulator,
  SeasonManager,
  type Team,
  type Season,
  type MatchResult
} from '@playground/football-director-engine';

interface GameEngineState {
  teams: Team[];
  season: Season;
  matchSimulator: MatchSimulator;
  seasonManager: SeasonManager;

  initializeSeason: (year: number) => void;
  simulateMatch: (fixtureId: string) => MatchResult;
  advanceWeek: () => void;
}

export const useGameEngine = create<GameEngineState>((set, get) => ({
  teams: [],
  season: null!,
  matchSimulator: new MatchSimulator(),
  seasonManager: new SeasonManager(),

  initializeSeason: (year) => {
    const { seasonManager, teams } = get();
    const season = seasonManager.initializeSeason(teams, year);
    set({ season });
  },

  simulateMatch: (fixtureId) => {
    const { matchSimulator, teams, season } = get();
    const fixture = season.fixtures.find(f => f.id === fixtureId)!;
    const homeTeam = teams.find(t => t.id === fixture.homeTeamId)!;
    const awayTeam = teams.find(t => t.id === fixture.awayTeamId)!;

    return matchSimulator.simulateMatch(
      homeTeam,
      awayTeam,
      fixture,
      season.currentWeek,
      season.year
    );
  },

  advanceWeek: () => {
    const { seasonManager, season } = get();
    const updatedSeason = seasonManager.advanceWeek(season);
    set({ season: updatedSeason });
  }
}));
```

### Testing Integration

#### Vitest Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  MatchSimulator,
  TeamGenerator,
  type Team
} from '@playground/football-director-engine';

describe('MatchSimulator Integration', () => {
  let simulator: MatchSimulator;
  let teams: Team[];

  beforeEach(() => {
    const generator = new TeamGenerator();
    teams = generator.generateLeague(12345); // Seeded for determinism
    simulator = new MatchSimulator();
  });

  it('should simulate a match with deterministic results', () => {
    const homeTeam = teams[0];
    const awayTeam = teams[1];

    const fixture = {
      id: 'test-fixture',
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      week: 1,
      year: 2025,
      played: false
    };

    const result = simulator.simulateMatch(
      homeTeam,
      awayTeam,
      fixture,
      1,
      2025,
      12345 // Seed ensures same result
    );

    expect(result.homeGoals).toBeDefined();
    expect(result.awayGoals).toBeDefined();
    expect(result.homeGoals + result.awayGoals).toBeGreaterThanOrEqual(0);
  });
});
```

---

## Module Communication Patterns

### Synchronous Communication

Most modules communicate synchronously through direct method calls:

```typescript
// Direct dependency injection
const simulator = new MatchSimulator(
  tacticsManager,
  injuryManager,
  moraleManager
);

// Synchronous call
const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, week, year);
```

### Event-Driven Communication (via Frontend)

The engine doesn't implement an event bus, but frontends can implement one:

```typescript
// Frontend event bus pattern
eventBus.on('match:simulated', (result: MatchResult) => {
  newsEngine.generateMatchNews(result);
  achievementManager.checkAchievements(gameState);
  recordsManager.updateRecords(result);
});

// Trigger event after simulation
const result = simulator.simulateMatch(/* params */);
eventBus.emit('match:simulated', result);
```

### State Synchronization

The engine is stateless - state management is the frontend's responsibility:

```typescript
// Engine provides pure functions
const updatedTable = leagueTableManager.updateTable(currentTable, matchResult);
const newSeason = seasonManager.advanceWeek(currentSeason);

// Frontend stores the state
store.setState({ table: updatedTable, season: newSeason });
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Module Initialization**
   ```typescript
   // Only create modules when needed
   private _newsEngine?: NewsEngine;
   get newsEngine(): NewsEngine {
     if (!this._newsEngine) {
       this._newsEngine = new NewsEngine();
     }
     return this._newsEngine;
   }
   ```

2. **Batch Operations**
   ```typescript
   // Simulate multiple matches at once
   const results = fixtures.map(fixture =>
     simulator.simulateMatch(homeTeam, awayTeam, fixture, week, year)
   );
   ```

3. **Deterministic Caching**
   ```typescript
   // Cache deterministic calculations
   const strengthCache = new Map<string, number>();
   const cacheKey = `${teamId}-${week}`;

   if (!strengthCache.has(cacheKey)) {
     strengthCache.set(cacheKey, calculateTeamStrength(team, week));
   }
   ```

### Memory Management

- Modules are lightweight (no heavy state)
- Use immutable updates where possible
- Clear large data structures after season end

---

## Security Considerations

### Input Validation

The engine assumes valid inputs. Frontend should validate:

```typescript
// Validate before calling engine
if (budget < transferPrice) {
  throw new Error('Insufficient funds');
}

// Then call engine
const result = transferMarket.buyPlayer(listing, buyer, seller, listings, week);
```

### Determinism vs Randomness

- Use seeds for deterministic behavior in tests
- Use random seeds in production for variety
- Never expose seeds to users (prevents exploitation)

---

## Future Architecture Enhancements

### Potential Improvements

1. **Event Sourcing**: Log all engine events for replay/undo
2. **Web Workers**: Run simulations in background threads
3. **WASM Port**: Compile engine to WebAssembly for performance
4. **Plugin System**: Dynamic module loading for user mods
5. **Multi-League Support**: Simulate multiple leagues simultaneously

### Versioning Strategy

The engine uses discriminated unions for versioning:

```typescript
type GameState =
  | { version: 1; /* v1 fields */ }
  | { version: 2; /* v2 fields */ }
  | { version: 3; /* v3 fields */ };

// Migration function
function migrateGameState(state: GameState): GameStateV3 {
  if (state.version === 1) return migrateV1ToV2(migrateV2ToV3(state));
  if (state.version === 2) return migrateV2ToV3(state);
  return state;
}
```

---

## Conclusion

The Football Director Engine architecture prioritizes:

- **Modularity**: 24 independent, testable modules
- **Flexibility**: Interface-based design for easy customization
- **Testability**: Dependency injection and deterministic behavior
- **Maintainability**: Clear responsibilities and minimal coupling
- **Extensibility**: Multiple extension points for customization

For more information:
- **Module Details**: See [Engine README](../../libs/football-director-engine/README.md)
- **Migration Guide**: See [Migration Guide](./engine-migration-guide.md)
- **Examples**: See [Examples Directory](../../examples/)
- **Contributing**: See [Contributing Guide](../../libs/football-director-engine/CONTRIBUTING.md)

---

**Last Updated**: 2025-01-05 (Story 1.4.5 Complete)
