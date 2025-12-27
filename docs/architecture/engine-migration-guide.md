# Football Director Engine - Migration Guide

## Overview

This guide documents the changes made to the Football Director Engine during **Epic 1.4: Engine Module Reorganization** and provides guidance for updating code that consumes the engine.

**Epic 1.4 Goals**:
- Consolidate scattered news generation logic
- Separate match commentary from post-match news
- Add TypeScript interfaces to all modules for dependency injection
- Improve module documentation and examples

## Summary of Changes

### ✅ Story 1.4.1: Module Dependency Analysis
- **Impact**: Documentation only
- **Changes**: Created module dependency documentation
- **Action Required**: None

### ✅ Story 1.4.2: News Generation Consolidation
- **Impact**: Medium - NewsEngine API unified
- **Changes**: Consolidated news generation into single `NewsEngine` module
- **Action Required**: Update imports and method calls

### ✅ Story 1.4.3: Match Commentary Separation
- **Impact**: Low - Clear module boundaries
- **Changes**: Separated real-time commentary from post-match news
- **Action Required**: Minimal - existing code should work unchanged

### ✅ Story 1.4.4: Module Interfaces & Dependency Injection
- **Impact**: Low - Backward compatible
- **Changes**: Added TypeScript interfaces to all 24 modules
- **Action Required**: Optional - consider using DI for better testing

### ✅ Story 1.4.5: Documentation & Examples
- **Impact**: None - Documentation only
- **Changes**: Comprehensive documentation and examples added
- **Action Required**: None

## Detailed Migration Instructions

### Story 1.4.2: NewsEngine Consolidation

#### What Changed

**Before**: News generation logic was scattered across multiple modules:
- `news-generator.ts` - General news articles
- Various modules generating their own news (transfers, injuries, etc.)

**After**: All news generation consolidated into `NewsEngine`:
- Single unified API for all news types
- Clear separation from match commentary
- Template-based generation for consistency

#### Migration Steps

**Old Code** (Before Consolidation):
```typescript
// Old scattered approach
import { generateTransferNews } from './transfer-market';
import { generateInjuryNews } from './injury-manager';
import { generateMatchReport } from './match-simulator';

const transferNews = generateTransferNews(transfer);
const injuryNews = generateInjuryNews(player, injury);
const matchNews = generateMatchReport(result);
```

**New Code** (After Consolidation):
```typescript
// New unified approach
import { NewsEngine } from '@playground/football-director-engine';

const newsEngine = new NewsEngine();

const transferNews = newsEngine.generateTransferNews(transfer);
const injuryNews = newsEngine.generateInjuryNews(player, injury);
const matchNews = newsEngine.generateMatchNews(result);
```

#### NewsEngine API Reference

```typescript
interface INewsEngine {
  // Match-related news
  generateMatchPreview(fixture: Fixture, ...): NewsArticle;
  generateMatchNews(result: MatchResult): NewsArticle;

  // Transfer news
  generateTransferNews(transfer: TransferListing): NewsArticle;

  // Player news
  generateInjuryNews(player: Player, injury: Injury): NewsArticle;
  generateContractNews(player: Player, contract: PlayerContract): NewsArticle;

  // Achievement & season news
  generateAchievementNews(achievement: Achievement): NewsArticle;
  generateSeasonStartNews(season: Season): NewsArticle;
  generateSeasonEndNews(season: Season, finalPosition: number): NewsArticle;

  // Weekly flavor news
  generateWeeklyNews(week: number, teams: Team[]): NewsArticle[];
}
```

#### Breaking Changes

- ❌ **Removed**: Individual news generation functions from other modules
- ✅ **Added**: Unified `NewsEngine` with comprehensive API
- ⚠️ **Note**: If you were importing news functions from modules like `TransferMarket` or `InjuryManager`, update to use `NewsEngine` instead

### Story 1.4.3: Match Commentary Separation

#### What Changed

**Before**: Match commentary and post-match news were combined or overlapping.

**After**: Clear separation of concerns:
- **MatchCommentary**: Real-time match events (used during simulation)
- **PostMatchGenerator**: Post-match analysis (used after match completion)
- **NewsEngine**: Post-match news articles (used for news feed)

#### Module Responsibilities

| Module | Purpose | When Used |
|--------|---------|-----------|
| `MatchCommentary` | Real-time event narration | During match simulation |
| `PostMatchGenerator` | Post-match analysis & interviews | After match completion |
| `NewsEngine` | News articles for feed | After match for news display |

#### Migration Steps

**No Breaking Changes** - Existing code should work unchanged. The modules now have clearer boundaries:

```typescript
// During match simulation
import { MatchCommentary } from '@playground/football-director-engine';

const commentary = new MatchCommentary();
const eventCommentary = commentary.generateEventCommentary(event, homeTeam, awayTeam, score, minute);

// After match completion
import { PostMatchGenerator } from '@playground/football-director-engine';

const postMatch = new PostMatchGenerator();
const analysis = postMatch.generatePostMatchAnalysis(result, homeTeam, awayTeam, table);

// For news feed
import { NewsEngine } from '@playground/football-director-engine';

const newsEngine = new NewsEngine();
const newsArticle = newsEngine.generateMatchNews(result);
```

### Story 1.4.4: Module Interfaces & Dependency Injection

#### What Changed

**Before**: Modules were concrete classes with no formal interfaces.

**After**: All 24 modules now have TypeScript interfaces following the `I<ClassName>` naming convention:
- `IMatchSimulator`
- `ISeasonManager`
- `ITransferMarket`
- ... and 21 more

#### Benefits of Interfaces

1. **Better Testing**: Mock dependencies easily for isolated tests
2. **Flexibility**: Swap implementations without changing consumers
3. **Documentation**: Interface defines the contract clearly
4. **Type Safety**: TypeScript enforces correct usage

#### Migration Steps

**Option 1: Continue Using Concrete Classes (No Changes Required)**

```typescript
// Existing code works unchanged
import { MatchSimulator } from '@playground/football-director-engine';

const simulator = new MatchSimulator();
const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, week, year);
```

**Option 2: Use Interfaces for Dependency Injection (Recommended)**

```typescript
// New approach with DI
import {
  IMatchSimulator,
  MatchSimulator,
  IPlayerStatsTracker,
  PlayerStatsTracker
} from '@playground/football-director-engine';

// Production code
const statsTracker: IPlayerStatsTracker = new PlayerStatsTracker();
const simulator: IMatchSimulator = new MatchSimulator(statsTracker);

// Test code with mocks
const mockStatsTracker: IPlayerStatsTracker = {
  updatePlayerStats: vi.fn(),
  initializePlayerStats: vi.fn(),
  // ... other methods
};
const simulator: IMatchSimulator = new MatchSimulator(mockStatsTracker);
```

#### Interface Naming Convention

All interfaces follow the pattern: `I<ClassName>`

| Module | Interface | Class |
|--------|-----------|-------|
| Match Simulator | `IMatchSimulator` | `MatchSimulator` |
| Transfer Market | `ITransferMarket` | `TransferMarket` |
| Finance Engine | `IFinanceEngine` | `FinanceEngine` |
| ... | ... | ... |

#### No Breaking Changes

- All existing imports and usage patterns continue to work
- Interfaces are purely additive
- Can adopt DI incrementally as needed

## Complete Module List with Interfaces

### Core Simulation
- `IMatchSimulator` / `MatchSimulator`
- `ISeasonManager` / `SeasonManager`
- `ILeagueTableManager` / `LeagueTableManager`
- `ICupManager` / `CupManager`

### Player Management
- `IPlayerStatsTracker` / `PlayerStatsTracker`
- `IPlayerDevelopment` / `PlayerDevelopment`
- `IInjuryManager` / `InjuryManager`
- `IMoraleManager` / `MoraleManager`
- `IContractManager` / `ContractManager`
- `IAIContractManager` / `AIContractManager`
- `IYouthAcademyManager` / `YouthAcademyManager`

### Match Content
- `IMatchCommentary` / `MatchCommentary`
- `IMatchPreviewGenerator` / `MatchPreviewGenerator`
- `IPostMatchGenerator` / `PostMatchGenerator`
- `IWeatherGenerator` / `WeatherGenerator`

### Financial & Administrative
- `IFinanceEngine` / `FinanceEngine`
- `ITransferMarket` / `TransferMarket`
- `IBoardManager` / `BoardManager`
- `IStaffManager` / `StaffManager`

### Meta Game
- `IAchievementManager` / `AchievementManager`
- `IRecordsManager` / `RecordsManager`
- `INewsEngine` / `NewsEngine`
- `ITacticsManager` / `TacticsManager`
- `ITeamGenerator` / `TeamGenerator`

## Testing Improvements

### Before: Testing with Concrete Dependencies

```typescript
// Hard to test in isolation
describe('MatchSimulator', () => {
  it('should simulate a match', () => {
    const simulator = new MatchSimulator();
    // Can't easily mock internal dependencies
    const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, 1, 2025);

    expect(result).toBeDefined();
  });
});
```

### After: Testing with Mocked Dependencies

```typescript
// Easy to test in isolation
import { describe, it, expect, vi } from 'vitest';
import { MatchSimulator, IPlayerStatsTracker, IInjuryManager } from '../engine';

describe('MatchSimulator', () => {
  let simulator: MatchSimulator;
  let mockStatsTracker: IPlayerStatsTracker;
  let mockInjuryManager: IInjuryManager;

  beforeEach(() => {
    mockStatsTracker = {
      updatePlayerStats: vi.fn(),
      initializePlayerStats: vi.fn(),
      // ... all interface methods
    };

    mockInjuryManager = {
      generateInjury: vi.fn(),
      applyInjury: vi.fn(),
      isInjured: vi.fn(),
      // ... all interface methods
    };

    simulator = new MatchSimulator(mockStatsTracker, mockInjuryManager);
  });

  it('should simulate a match with mocked dependencies', () => {
    const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, 1, 2025);

    expect(result).toBeDefined();
    expect(mockStatsTracker.updatePlayerStats).toHaveBeenCalled();
  });
});
```

## Common Migration Scenarios

### Scenario 1: Updating News Generation

**Before**:
```typescript
// Scattered news logic
const news = generateSomeNews(data);
```

**After**:
```typescript
// Unified NewsEngine
import { NewsEngine } from '@playground/football-director-engine';

const newsEngine = new NewsEngine();
const news = newsEngine.generateMatchNews(result);
```

### Scenario 2: Match Simulation with Commentary

**Before**:
```typescript
// Potentially mixing commentary and news
const result = simulateMatch(...);
const commentary = getCommentary(result);
```

**After**:
```typescript
// Clear separation
import {
  MatchSimulator,
  MatchCommentary,
  PostMatchGenerator,
  NewsEngine
} from '@playground/football-director-engine';

// During simulation
const simulator = new MatchSimulator();
const commentary = new MatchCommentary();

const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, week, year);
const eventComments = result.events.map(event =>
  commentary.generateEventCommentary(event, homeTeam, awayTeam, score, minute)
);

// After simulation
const postMatch = new PostMatchGenerator();
const analysis = postMatch.generatePostMatchAnalysis(result, homeTeam, awayTeam, table);

// For news feed
const newsEngine = new NewsEngine();
const article = newsEngine.generateMatchNews(result);
```

### Scenario 3: Testing with Dependency Injection

**Before**:
```typescript
// Hard to test - concrete dependencies
const simulator = new MatchSimulator();
```

**After**:
```typescript
// Easy to test - injected dependencies
import { MatchSimulator, IPlayerStatsTracker } from '../engine';

// Production
const statsTracker = new PlayerStatsTracker();
const simulator = new MatchSimulator(statsTracker);

// Testing
const mockStatsTracker: IPlayerStatsTracker = {
  /* mock implementation */
};
const simulator = new MatchSimulator(mockStatsTracker);
```

## FAQ

### Q: Do I need to update all my code immediately?

**A**: No. The changes are mostly backward compatible. You can:
1. Continue using concrete classes (works unchanged)
2. Gradually adopt DI for better testing
3. Update news generation calls as needed

### Q: Will my existing tests break?

**A**: Existing tests should continue to work. You may want to:
1. Update news generation tests to use `NewsEngine`
2. Consider using mocks with new interfaces for better isolation

### Q: Are there any performance implications?

**A**: No. The refactoring maintains the same performance characteristics. Interfaces have zero runtime cost in TypeScript.

### Q: Can I use interfaces without dependency injection?

**A**: Yes. You can type your variables with interfaces even when using concrete classes:

```typescript
const simulator: IMatchSimulator = new MatchSimulator();
```

This provides type safety without requiring DI.

### Q: Where can I find examples of the new patterns?

**A**: See the `/examples/` directory (created in Story 1.4.5) for:
- `custom-match-simulation.ts` - Using MatchSimulator
- `custom-transfer-logic.ts` - Extending TransferMarket
- `testing-modules.ts` - Testing with DI and mocks

### Q: What if I find a bug or have questions?

**A**:
1. Check the comprehensive README: `libs/football-director-engine/README.md`
2. Review module documentation (JSDoc comments in source files)
3. Open a GitHub issue with details

## Deprecated Features

### ❌ Deprecated in Story 1.4.2

- **Individual news generation functions** scattered across modules
- **Recommendation**: Use `NewsEngine` for all news generation

### ⚠️ No Deprecated Features in Stories 1.4.3-1.4.5

Stories 1.4.3, 1.4.4, and 1.4.5 were additive changes with no deprecations.

## Timeline

| Story | Completed | Status |
|-------|-----------|--------|
| 1.4.1 - Module Analysis | ✅ Complete | Documentation created |
| 1.4.2 - News Consolidation | ✅ Complete | NewsEngine unified |
| 1.4.3 - Commentary Separation | ✅ Complete | Clear module boundaries |
| 1.4.4 - Module Interfaces | ✅ Complete | 24 interfaces added |
| 1.4.5 - Documentation | ✅ Complete | This guide created |

## Next Steps

1. **Read the Engine README**: `libs/football-director-engine/README.md`
2. **Review Examples**: Check `/examples/` directory
3. **Update Imports**: Migrate to `NewsEngine` for news generation
4. **Consider DI**: Adopt interfaces for better testing (optional)
5. **Run Tests**: Ensure everything works after migration

## Resources

- **Engine README**: `/libs/football-director-engine/README.md`
- **Contributing Guide**: `/libs/football-director-engine/CONTRIBUTING.md`
- **Architecture Docs**: `/docs/architecture/football-director-architecture.md`
- **Examples**: `/examples/` directory (Story 1.4.5)

## Support

For questions or issues during migration:
1. Review this guide and the README
2. Check examples in `/examples/`
3. Open a GitHub issue with:
   - What you're trying to do
   - Current code (before)
   - Expected result
   - Any error messages

---

**Last Updated**: 2025-12-27 (Epic 1.4 Complete)
