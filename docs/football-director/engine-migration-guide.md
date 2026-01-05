# Football Director Engine - Migration Guide

## Overview

This guide helps developers migrate from the old engine structure to the new modular architecture with dependency injection (DI). The refactoring was completed in Epic 1.4 (Engine Module Reorganization) and introduces significant improvements in testability, maintainability, and code organization.

## What Changed

### Story 1.4.2: News Generation Consolidation

**Before:**
- News generation logic scattered across multiple modules
- `news-generator.ts` - Basic news articles
- Match commentary mixed with post-match news
- News generation duplicated in various modules

**After:**
- Unified `news-engine.ts` consolidating all news generation
- Clear, template-based news generation
- Single source of truth for all game event news

**Migration:**
```typescript
// OLD - Scattered news generation
import { generateMatchNews } from './news-generator';
import { generateTransferNews } from './somewhere';
const news1 = generateMatchNews(result);
const news2 = generateTransferNews(transfer);

// NEW - Unified news engine
import { getModule } from './module-registry';
import { NewsEngine } from './module-keys';

const newsEngine = getModule(NewsEngine);
const matchNews = newsEngine.generateMatchNews(results, teamName, table, week, season);
const transferNews = newsEngine.generateTransferNews(transfer, 'buy', week, season);
```

---

### Story 1.4.3: Match Commentary Separation

**Before:**
- Match commentary mixed with post-match news generation
- Unclear boundaries between real-time commentary and post-match articles

**After:**
- Dedicated `match-commentary.ts` module for real-time match narration
- `news-engine.ts` handles post-match articles
- Clear separation of concerns

**Migration:**
```typescript
// OLD - Mixed commentary and news
import { generateCommentary } from './old-module';
const commentary = generateCommentary(event);

// NEW - Dedicated match commentary
import { getModule } from './module-registry';
import { MatchCommentary } from './module-keys';

const commentary = getModule(MatchCommentary);
const eventText = commentary.generateEventCommentary(event, matchState);
const halfTime = commentary.generateHalfTimeCommentary(1, 0, 'Arsenal', 'Chelsea');
const fullTime = commentary.generateFullTimeCommentary(result);
```

---

### Story 1.4.4: Module Interfaces and Dependency Injection

**Before:**
- Modules created dependencies inline with `new Module()`
- Hard to test in isolation (couldn't mock dependencies)
- Implicit dependencies made relationships unclear
- Repeated module instantiation every operation

**After:**
- All modules implement typed interfaces
- Dependencies injected via constructors
- Module registry provides singleton instances
- Easy to mock dependencies for testing

**Migration:**

#### Old Pattern - Direct Instantiation
```typescript
// OLD - Creating modules directly
import { MatchSimulator } from './match-simulator';
import { InjuryManager } from './injury-manager';

const matchSim = new MatchSimulator();
const result = matchSim.simulateMatch(homeTeam, awayTeam, 10);
```

#### New Pattern - Module Registry
```typescript
// NEW - Using module registry (recommended)
import { getModule } from './module-registry';
import { MatchSimulator } from './module-keys';

// Get singleton instance from registry
const matchSim = getModule(MatchSimulator);
const result = matchSim.simulateMatch(homeTeam, awayTeam, 10);
```

#### New Pattern - Testing with Mocks
```typescript
// NEW - Testing with dependency injection
import { createMockMatchSimulator } from './factories/match-simulator.factory';
import { IInjuryManager } from './interfaces/injury-manager.interface';

// Create mock dependency
const mockInjuryManager: IInjuryManager = {
  processInjuries: vi.fn().mockReturnValue([]),
  updateInjuries: vi.fn().mockReturnValue([]),
  isPlayerAvailable: vi.fn().mockReturnValue(true)
};

// Inject mock
const simulator = createMockMatchSimulator({
  injuryManager: mockInjuryManager
});

// Test in isolation
const result = simulator.simulateMatch(homeTeam, awayTeam, 10);
expect(mockInjuryManager.processInjuries).toHaveBeenCalled();
```

---

## Breaking Changes

### 1. Module Instantiation

**Breaking Change**: Direct instantiation with `new Module()` is deprecated.

**Migration Path**:
```typescript
// ❌ DEPRECATED - Don't do this
import { MatchSimulator } from '@/libs/football-director-engine';
const simulator = new MatchSimulator();

// ✅ RECOMMENDED - Use module registry
import { getModule } from '@/libs/football-director-engine/module-registry';
import { MatchSimulator } from '@/libs/football-director-engine/module-keys';
const simulator = getModule(MatchSimulator);

// ✅ ALTERNATIVE - Use factories for custom instances
import { createMatchSimulator } from '@/libs/football-director-engine/factories/match-simulator.factory';
const simulator = createMatchSimulator();
```

---

### 2. News Generation API

**Breaking Change**: Old `news-generator.ts` functions removed, replaced by `NewsEngine` methods.

**Migration Path**:
```typescript
// ❌ REMOVED
import { generateNews, generateMatchNews } from './news-generator';

// ✅ NEW API
import { getModule } from './module-registry';
import { NewsEngine } from './module-keys';

const newsEngine = getModule(NewsEngine);

// Match news
const matchNews = newsEngine.generateMatchNews(
  results,
  'Manchester United',
  leagueTable,
  week,
  season
);

// Transfer news
const transferNews = newsEngine.generateTransferNews(
  listing,
  'buy',
  week,
  season
);

// Injury news
const injuryNews = newsEngine.generateInjuryNews(
  player,
  injury,
  teamName,
  week,
  season
);

// Contract news
const contractNews = newsEngine.generateContractNews(
  player,
  'renewal',
  teamName,
  week,
  season
);

// Achievement news
const achievementNews = newsEngine.generateAchievementNews(
  achievement,
  week,
  season
);

// Season news
const seasonStartNews = newsEngine.generateSeasonNews('start', season);
const seasonEndNews = newsEngine.generateSeasonNews('end', season, finalTable);

// Random background news
const randomNews = newsEngine.generateRandomNews(week, season);
```

---

### 3. Match Commentary API

**Breaking Change**: Commentary separated from news generation.

**Migration Path**:
```typescript
// ❌ OLD - Mixed API
import { generateMatchCommentary } from './old-module';

// ✅ NEW - Dedicated match commentary
import { getModule } from './module-registry';
import { MatchCommentary } from './module-keys';

const commentary = getModule(MatchCommentary);

// Event commentary (goals, cards, injuries)
const goalCommentary = commentary.generateEventCommentary(goalEvent, matchState);

// Half-time summary
const halfTimeText = commentary.generateHalfTimeCommentary(
  homeScore,
  awayScore,
  'Arsenal',
  'Chelsea'
);

// Full-time summary
const fullTimeText = commentary.generateFullTimeCommentary(result);
```

---

### 4. Engine Initialization

**Breaking Change**: Must call `initializeEngine()` at app startup.

**Migration Path**:
```typescript
// In your app's entry point (e.g., app/layout.tsx or main.ts)

// OLD - No initialization needed
// Modules created on-demand

// NEW - Initialize engine on startup
import { initializeEngine } from '@/libs/football-director-engine';

// Call once when app starts
initializeEngine();

// Now modules can be accessed from registry
import { getModule } from '@/libs/football-director-engine/module-registry';
import { MatchSimulator } from '@/libs/football-director-engine/module-keys';
const simulator = getModule(MatchSimulator);
```

**Example in Next.js App Router**:
```typescript
// apps/football-director/src/app/layout.tsx
import { initializeEngine } from '@/libs/football-director-engine';

// Initialize engine when layout mounts
if (typeof window !== 'undefined') {
  initializeEngine();
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

---

## Module-by-Module Migration

### MatchSimulator

```typescript
// OLD
import { MatchSimulator } from './match-simulator';
const simulator = new MatchSimulator();
const result = simulator.simulateMatch(home, away, 10);

// NEW
import { getModule } from './module-registry';
import { MatchSimulator } from './module-keys';
const simulator = getModule(MatchSimulator);
const result = simulator.simulateMatch(home, away, 10);
```

### SeasonManager

```typescript
// OLD
import { SeasonManager } from './season-manager';
const manager = new SeasonManager();
const fixtures = manager.generateFixtures(teams);

// NEW
import { getModule } from './module-registry';
import { SeasonManager } from './module-keys';
const manager = getModule(SeasonManager);
const fixtures = manager.generateFixtures(teams);
```

### TransferMarket

```typescript
// OLD
import { TransferMarket } from './transfer-market';
const market = new TransferMarket();
const listings = market.generateTransferListings(teams, 'Arsenal', 15);

// NEW
import { getModule } from './module-registry';
import { TransferMarket } from './module-keys';
const market = getModule(TransferMarket);
const listings = market.generateTransferListings(teams, 'Arsenal', 15);
```

### FinanceEngine

```typescript
// OLD
import { FinanceEngine } from './finance-engine';
const finance = new FinanceEngine();
const cost = finance.calculateWeeklyCosts(squad, staff);

// NEW
import { getModule } from './module-registry';
import { FinanceEngine } from './module-keys';
const finance = getModule(FinanceEngine);
const cost = finance.calculateWeeklyCosts(squad, staff);
```

### All Other Modules

The pattern is consistent for all modules:
1. Import `getModule` from `module-registry`
2. Import the module key from `module-keys`
3. Get the singleton instance
4. Use the module as before

---

## Testing Migration

### Unit Tests

**OLD Pattern**:
```typescript
import { MatchSimulator } from './match-simulator';

describe('MatchSimulator', () => {
  it('should simulate a match', () => {
    const simulator = new MatchSimulator();
    const result = simulator.simulateMatch(home, away, 10);
    expect(result).toBeDefined();
  });
});
```

**NEW Pattern with Mocks**:
```typescript
import { createMockMatchSimulator } from './factories/match-simulator.factory';
import { IInjuryManager } from './interfaces/injury-manager.interface';

describe('MatchSimulator', () => {
  it('should simulate a match without injuries', () => {
    // Mock the injury manager
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([]),
      updateInjuries: vi.fn(),
      isPlayerAvailable: vi.fn().mockReturnValue(true)
    };

    // Create simulator with mocked dependency
    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager
    });

    const result = simulator.simulateMatch(home, away, 10);

    expect(result).toBeDefined();
    expect(result.injuries).toHaveLength(0);
    expect(mockInjuryManager.processInjuries).toHaveBeenCalled();
  });

  it('should simulate a match with injuries', () => {
    // Mock with injuries
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([
        { playerId: '1', type: 'muscle', weeksOut: 2 }
      ]),
      updateInjuries: vi.fn(),
      isPlayerAvailable: vi.fn().mockReturnValue(true)
    };

    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager
    });

    const result = simulator.simulateMatch(home, away, 10);

    expect(result.injuries).toHaveLength(1);
  });
});
```

---

## Performance Improvements

### Before DI

Every operation created new module instances:
```typescript
// Called 17 times per week simulation
for (let i = 0; i < 52; i++) {
  const matchSim = new MatchSimulator();           // ❌ New instance
  const injuryMgr = new InjuryManager();           // ❌ New instance
  const moraleMgr = new MoraleManager();           // ❌ New instance
  // ... 14 more modules
  // = 17 instantiations × 52 weeks = 884 per season
}
```

### After DI

Singleton pattern eliminates repeated instantiation:
```typescript
// Initialize once
initializeEngine();

// Reuse singleton instances
for (let i = 0; i < 52; i++) {
  const matchSim = getModule(MatchSimulator);      // ✅ Singleton
  const injuryMgr = getModule(InjuryManager);      // ✅ Singleton
  const moraleMgr = getModule(MoraleManager);      // ✅ Singleton
  // = 0 instantiations during simulation
}
```

**Performance Gain**: Eliminated 884+ object creations per season.

---

## Common Migration Errors

### Error 1: Module Not Registered

```
Error: Module not registered: MatchSimulator
```

**Cause**: Forgot to call `initializeEngine()`.

**Fix**:
```typescript
import { initializeEngine } from '@/libs/football-director-engine';

// Call this once at app startup
initializeEngine();
```

---

### Error 2: Using Old Import Paths

```
Error: Cannot find module './news-generator'
```

**Cause**: Old module imports that no longer exist.

**Fix**:
```typescript
// ❌ OLD
import { generateNews } from './news-generator';

// ✅ NEW
import { getModule } from './module-registry';
import { NewsEngine } from './module-keys';
const newsEngine = getModule(NewsEngine);
```

---

### Error 3: Direct Instantiation

```
TypeError: Cannot instantiate MatchSimulator - dependencies required
```

**Cause**: Trying to use `new MatchSimulator()` without providing dependencies.

**Fix**:
```typescript
// ❌ WRONG
const simulator = new MatchSimulator();

// ✅ CORRECT
const simulator = getModule(MatchSimulator);
```

---

### Error 4: Missing Module Keys Import

```
Error: MatchSimulator is not defined
```

**Cause**: Importing module class instead of module key constant.

**Fix**:
```typescript
// ❌ WRONG
import { MatchSimulator } from './match-simulator';
const sim = getModule(MatchSimulator);

// ✅ CORRECT
import { MatchSimulator } from './module-keys';  // Import the KEY
const sim = getModule(MatchSimulator);
```

---

## Migration Checklist

Use this checklist to migrate your code:

- [ ] Remove all `new Module()` instantiations
- [ ] Replace with `getModule(ModuleKey)` pattern
- [ ] Add `initializeEngine()` call at app startup
- [ ] Update news generation to use `NewsEngine`
- [ ] Update commentary to use `MatchCommentary`
- [ ] Update imports to use `module-keys` instead of module files
- [ ] Refactor tests to use mock factories
- [ ] Remove old `news-generator.ts` imports
- [ ] Remove old mixed commentary/news imports
- [ ] Run type checker: `nx run football-director:type-check`
- [ ] Run tests: `nx test football-director-engine`
- [ ] Run build: `nx build football-director-engine`
- [ ] Test in development: `nx serve football-director`
- [ ] Verify all game flows work (new game, simulation, transfers, saves)

---

## Additional Resources

- [Engine Module Documentation](../../libs/football-director-engine/src/lib/README.md)
- [Module Interfaces Documentation](../../libs/football-director-engine/src/lib/interfaces/README.md)
- [Architecture Overview](./architecture.md)
- [Testing Guide](./testing-guide.md)
- [Contribution Guide](./engine-contribution-guide.md)

---

## Support

If you encounter issues during migration:

1. Check this migration guide for common errors
2. Review the module documentation
3. Look at test examples in `__tests__/di-examples.spec.ts`
4. Check the module registry implementation
5. Create an issue with details about the problem

---

## Summary

The new modular architecture with dependency injection provides:

**Benefits**:
- Improved testability (easy to mock dependencies)
- Better maintainability (clear module boundaries)
- Enhanced performance (singleton pattern)
- Clearer dependencies (explicit injection)
- Type safety (interface-driven)

**Migration Effort**:
- Low-medium effort for most code
- Pattern is consistent across all modules
- Tests benefit most from new architecture
- Performance improvements are automatic

**Timeline**:
- Simple migrations: ~15 minutes
- Complex modules: ~1 hour
- Full codebase: Estimated 4-8 hours

---

Last Updated: 2026-01-05
Version: 1.0
