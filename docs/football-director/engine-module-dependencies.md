# Engine Module Dependencies Analysis

**Story:** 1.4.1 - Analyze and Document Module Dependencies
**Date:** 2025-12-27
**Author:** James (Developer)

## Executive Summary

This document provides a comprehensive analysis of the 24 engine modules in the Football Director game, their dependencies, data flows, and consolidation opportunities. The analysis reveals several areas of overlapping responsibility, particularly in news/commentary generation, that can be consolidated to improve maintainability.

## Module Catalog

### All Engine Modules (24 Total)

| # | Module | Primary Responsibility | Lines of Code |
|---|--------|----------------------|---------------|
| 1 | `achievement-manager.ts` | Achievement tracking and unlocking | ~630 |
| 2 | `ai-contract-manager.ts` | AI team contract management | ~70 |
| 3 | `board-manager.ts` | Board objectives and job security | ~225 |
| 4 | `contract-manager.ts` | Player contract management | ~107 |
| 5 | `cup-manager.ts` | Cup competition management | ~224 |
| 6 | `finance-engine.ts` | Financial tracking and transactions | ~98 |
| 7 | `injury-manager.ts` | Player injury system | ~212 |
| 8 | `league-table-manager.ts` | League standings calculation | ~80 |
| 9 | `match-commentary.ts` | Real-time match event commentary | ~570 |
| 10 | `match-preview-generator.ts` | Pre-match analysis and previews | ~239 |
| 11 | `match-simulator.ts` | Match simulation engine | ~580 |
| 12 | `morale-manager.ts` | Player morale/happiness system | ~143 |
| 13 | `news-generator.ts` | News article generation | ~425 |
| 14 | `player-development.ts` | Player skill progression | ~157 |
| 15 | `player-stats-tracker.ts` | Player statistics tracking | ~148 |
| 16 | `post-match-generator.ts` | Post-match quotes and analysis | ~291 |
| 17 | `records-manager.ts` | Season and club records | ~302 |
| 18 | `season-manager.ts` | Fixture generation and season flow | ~181 |
| 19 | `staff-manager.ts` | Staff hiring and management | ~315 |
| 20 | `tactics-manager.ts` | Tactical calculations | ~252 |
| 21 | `team-generator.ts` | Team/player generation | ~231 |
| 22 | `transfer-market.ts` | Transfer market operations | ~209 |
| 23 | `weather-generator.ts` | Match weather conditions | ~129 |
| 24 | `youth-academy-manager.ts` | Youth player development | ~72 |
| **Core** | `types.ts` | Type definitions (shared by all) | ~430 |

**Total Production Code:** ~6,800 lines (excluding tests)

## Module Dependencies

### Dependency Graph

#### Core Type Dependencies (all modules depend on `types.ts`)

```
types.ts (core) ← All modules import types from here
```

#### High-Level Module Clusters

**1. Match Simulation Cluster**
```
match-simulator.ts
├─→ match-commentary.ts (generates events, goal scorers, attendance)
├─→ tactics-manager.ts (tactical modifiers)
├─→ injury-manager.ts (available players)
├─→ morale-manager.ts (morale effects on skill)
├─→ staff-manager.ts (manager bonus)
└─→ weather-generator.ts (weather conditions)
```

**2. Season Management Cluster**
```
season-manager.ts
└─→ match-simulator.ts (simulates weekly matches)
```

**3. News & Commentary Cluster (OVERLAP DETECTED)**
```
news-generator.ts
├─→ player-development.ts (development reports for news)
└─→ (generates match news, transfer news, milestone news)

match-commentary.ts
└─→ (generates real-time match events)

post-match-generator.ts
└─→ (generates post-match analysis, manager quotes, player interviews)

match-preview-generator.ts
└─→ (generates pre-match analysis)
```
**ISSUE:** These 4 modules have overlapping responsibilities around match-related content generation.

**4. Player Management Cluster**
```
contract-manager.ts
└─→ (manages contracts, free agents)

ai-contract-manager.ts
└─→ (AI team contract decisions)

injury-manager.ts
└─→ (injury tracking, recovery)

morale-manager.ts
└─→ (morale calculations)

player-development.ts
└─→ (skill progression)

player-stats-tracker.ts
└─→ (statistics updates)
```

**5. Competition Management Cluster**
```
league-table-manager.ts
└─→ (calculates league standings)

cup-manager.ts
└─→ (manages cup competitions)
```

**6. Records & Achievements Cluster (POTENTIAL OVERLAP)**
```
achievement-manager.ts
└─→ (tracks and unlocks achievements)

records-manager.ts
└─→ (tracks season/club records)

player-stats-tracker.ts
└─→ (tracks player statistics)
```
**ISSUE:** Some overlap in tracking player/team performance milestones

**7. Economy Cluster**
```
transfer-market.ts
└─→ (transfer listings, AI buying)

finance-engine.ts
└─→ (budget tracking, transactions)
```

**8. Organizational Cluster**
```
board-manager.ts
└─→ (objectives, job security)

staff-manager.ts
└─→ (staff hiring, manager bonuses)

youth-academy-manager.ts
└─→ (youth development)

tactics-manager.ts
└─→ (tactical calculations)
```

**9. Utility Modules**
```
team-generator.ts
└─→ (creates teams and players)

weather-generator.ts
└─→ (generates weather conditions)
```

### Detailed Module-by-Module Dependencies

| Module | Depends On (besides types.ts) | Used By |
|--------|------------------------------|---------|
| `achievement-manager.ts` | None | App (game state) |
| `ai-contract-manager.ts` | None | App (weekly simulation) |
| `board-manager.ts` | None | App (board evaluation) |
| `contract-manager.ts` | None | App (contract management) |
| `cup-manager.ts` | None | App (cup competition) |
| `finance-engine.ts` | None | App (financial tracking) |
| `injury-manager.ts` | None | match-simulator, App |
| `league-table-manager.ts` | None | App (standings) |
| `match-commentary.ts` | None | match-simulator |
| `match-preview-generator.ts` | None | App (pre-match) |
| `match-simulator.ts` | match-commentary, tactics-manager, injury-manager, morale-manager, staff-manager, weather-generator | season-manager, App |
| `morale-manager.ts` | None | match-simulator, App |
| `news-generator.ts` | player-development (DevelopmentReport type) | App (news generation) |
| `player-development.ts` | None | news-generator, App |
| `player-stats-tracker.ts` | None | App (stats updates) |
| `post-match-generator.ts` | None | App (post-match content) |
| `records-manager.ts` | None | App (records tracking) |
| `season-manager.ts` | match-simulator | App (season flow) |
| `staff-manager.ts` | None | match-simulator, App |
| `tactics-manager.ts` | None | match-simulator, App |
| `team-generator.ts` | None | App (team creation) |
| `transfer-market.ts` | None | App (transfers) |
| `weather-generator.ts` | None | match-simulator |
| `youth-academy-manager.ts` | None | App (youth development) |

### Circular Dependencies Analysis

**Result: ZERO circular dependencies detected** ✅

All module dependencies flow in one direction:
- Utility modules → Core modules → App
- No module imports another module that imports it back
- Clean dependency hierarchy

This is excellent architecture - no refactoring needed for circular dependency issues.

## Data Flow Analysis

### Match Simulation Data Flow

```
App
 ↓ (Team, Fixture, current week)
season-manager.simulateWeek()
 ↓ (Team, Match)
match-simulator.simulateMatch()
 ↓ (Team data)
├─→ injury-manager.getAvailablePlayers() → available squad
├─→ morale-manager.applyMoraleToSkill() → effective skill
├─→ tactics-manager.calculateTacticalModifier() → tactical advantage
├─→ staff-manager.getManagerBonus() → manager bonus
├─→ weather-generator.generateWeather() → weather conditions
└─→ match-commentary.generateMatchEvents() → match events
 ↓ (MatchResult with events, stats, ratings)
App stores result, updates tables, triggers news
```

### News Generation Data Flow (FRAGMENTED - CONSOLIDATION OPPORTUNITY)

```
Match Result Generated
 ↓
Three separate paths:
1. news-generator.generateMatchNews() → NewsArticle
2. match-commentary (already generated events during match)
3. post-match-generator.generatePostMatchAnalysis() → PostMatchAnalysis
   └─→ manager quotes, player interviews, turning points

ISSUE: Match-related content generation scattered across 3 modules
```

### Player Progression Data Flow

```
Week Simulation
 ↓
├─→ player-development.developPlayers() → skill changes
├─→ player-stats-tracker.updateStats() → stat updates
├─→ injury-manager.updateInjuries() → injury recovery
├─→ morale-manager.updateMorale() → morale changes
├─→ contract-manager.updateContracts() → contract status
└─→ achievement-manager.checkAchievements() → unlocked achievements
 ↓
news-generator might generate milestone news
```

## Module Responsibility Analysis

### Well-Scoped Modules (Single Responsibility)

✅ **Good Examples:**
- `league-table-manager.ts` (80 lines) - Only calculates league standings
- `weather-generator.ts` (129 lines) - Only generates weather
- `finance-engine.ts` (98 lines) - Only tracks financial transactions
- `injury-manager.ts` (212 lines) - Only manages injuries
- `tactics-manager.ts` (252 lines) - Only calculates tactical modifiers

### Overlapping Responsibilities (Consolidation Candidates)

❌ **Issue: News/Commentary Fragmentation**

**Module: `news-generator.ts` (425 lines)**
- Responsibilities:
  - Match result news articles
  - Transfer news articles
  - Milestone news articles
  - Board news articles
  - Standings news articles
  - Development news articles

**Module: `match-commentary.ts` (570 lines)**
- Responsibilities:
  - Real-time match event descriptions
  - Goal commentary
  - Card commentary
  - Attendance generation
  - Goal scorer selection

**Module: `post-match-generator.ts` (291 lines)**
- Responsibilities:
  - Manager quotes (home/away)
  - Player interviews
  - Turning point identification
  - Key stats compilation

**Module: `match-preview-generator.ts` (239 lines)**
- Responsibilities:
  - Pre-match preview content
  - Head-to-head history
  - Team news (injuries, suspensions)
  - Expected attendance
  - Manager quotes (pre-match)

**Overlap:**
- All 4 modules generate text content about matches
- `news-generator` generates news about matches
- `post-match-generator` generates post-match quotes/analysis
- `match-commentary` generates real-time commentary
- `match-preview-generator` generates pre-match content
- Manager quotes appear in both post-match and preview generators

**Proposed Consolidation:**
- **NewsEngine** (consolidate news articles): match news, transfer news, milestone news, board news
- **MatchCommentary** (keep separate): Real-time commentary during match simulation
- **MatchStoryGenerator** (new, consolidates preview + post-match): Pre-match previews, post-match analysis

❌ **Issue: Stats/Records Overlap**

**Module: `player-stats-tracker.ts` (148 lines)**
- Updates player statistics (goals, assists, appearances)

**Module: `records-manager.ts` (302 lines)**
- Tracks season records (top scorer, biggest win, etc.)
- Tracks club records (best season, longest streak, etc.)

**Module: `achievement-manager.ts` (630 lines)**
- Checks achievement criteria
- Many achievements based on player stats or records

**Overlap:**
- All three modules track performance milestones
- player-stats-tracker updates raw stats
- records-manager uses stats to update records
- achievement-manager uses stats/records to unlock achievements

**Proposed Consolidation:**
- Keep as separate modules (good separation of concerns)
- But clarify interfaces:
  - `player-stats-tracker`: Source of truth for current season stats
  - `records-manager`: Aggregates stats into historical records
  - `achievement-manager`: Consumes stats/records to check criteria

### Modules Too Small (Potential Combination)

**Small Modules:**
- `ai-contract-manager.ts` (70 lines) - Could merge with contract-manager
- `youth-academy-manager.ts` (72 lines) - Could merge with player-development
- `finance-engine.ts` (98 lines) - Fine as-is (single responsibility)
- `league-table-manager.ts` (80 lines) - Fine as-is (single responsibility)

**Recommendation:**
- `ai-contract-manager` + `contract-manager` → `ContractManager` (unified contract management)
- `youth-academy-manager` + `player-development` → `PlayerDevelopment` (unified player growth)

### Modules Too Large (Potential Split)

**Large Modules:**
- `achievement-manager.ts` (630 lines) - Many achievement definitions, consider splitting
- `match-simulator.ts` (580 lines) - Core simulation logic, size justified
- `match-commentary.ts` (570 lines) - Commentary variations, size justified

**Recommendation:**
- `achievement-manager`: Consider moving achievement definitions to data files (JSON/YAML)
- `match-simulator` and `match-commentary`: Keep as-is (core logic, size justified)

## Consolidation Opportunities

### Priority 1: News Generation Consolidation (HIGH IMPACT)

**Current State:**
- 4 modules handling content generation (1,525 total lines)
- Scattered responsibilities
- No clear separation between news articles vs. match commentary vs. post-match analysis

**Proposed New Structure:**

**1. `NewsEngine` (consolidates `news-generator.ts`)**
- Responsibilities:
  - Match result news articles
  - Transfer news articles
  - Milestone news articles
  - Board news articles
  - Standings news articles
  - Contract news articles
  - Development news articles
- Estimated size: ~450 lines
- Dependencies: DevelopmentReport type

**2. `MatchCommentary` (keep as-is, minor cleanup)**
- Responsibilities:
  - Real-time match event generation (goals, cards, shots, saves)
  - Goal scorer selection
  - Assist provider selection
  - Attendance calculation
- Estimated size: ~400 lines (remove some overlap)
- Dependencies: None (used by match-simulator)

**3. `MatchStoryGenerator` (NEW - merges preview + post-match)**
- Responsibilities:
  - Pre-match preview content
  - Head-to-head analysis
  - Team news (injuries/suspensions)
  - Pre-match manager quotes
  - Post-match manager quotes
  - Player interviews
  - Turning point identification
  - Key stats compilation
- Estimated size: ~450 lines
- Dependencies: None

**Benefits:**
- Clear separation: News articles vs. Real-time commentary vs. Match stories
- Reduced duplication in manager quote generation
- Easier to extend with new content types
- Better testability (isolated responsibilities)

**Migration Path:**
1. Create `MatchStoryGenerator` (merge preview + post-match)
2. Update `match-simulator` to use new module
3. Clean up `MatchCommentary` (remove non-commentary code)
4. Update `NewsEngine` (rename from news-generator, remove match story overlap)
5. Delete old `post-match-generator` and `match-preview-generator`

### Priority 2: Contract Management Consolidation (MEDIUM IMPACT)

**Current State:**
- `contract-manager.ts` (107 lines) - Player contract logic
- `ai-contract-manager.ts` (70 lines) - AI team contract decisions

**Proposed:**
- Merge into single `ContractManager` class
- Separate concerns:
  - `ContractService`: Core contract logic (expiry, renewal, free agents)
  - `AIContractStrategy`: AI decision-making for contracts
- Estimated size: ~180 lines total

**Benefits:**
- Single source of truth for contract logic
- Easier to maintain AI contract behavior
- Reduce code duplication

### Priority 3: Youth Development Consolidation (LOW IMPACT)

**Current State:**
- `youth-academy-manager.ts` (72 lines) - Youth academy operations
- `player-development.ts` (157 lines) - Player skill development

**Proposed:**
- Consider merging into `PlayerDevelopment` module
- Separate concerns within:
  - Youth academy logic (generating youth players)
  - Skill development logic (age-based progression)

**Benefits:**
- Unified player growth system
- Easier to balance youth vs. senior development

**Risks:**
- Module might become too large (230 lines acceptable)
- Keep as separate if youth academy expands significantly

## Interface and Contract Documentation

### Current State: Implicit Interfaces

Most modules export a class with methods, but there are no formal TypeScript interfaces defining contracts.

**Example Current Pattern:**
```typescript
export class MatchSimulator {
  simulateMatch(match: Match, currentWeek: number): MatchResult { ... }
  calculateTeamStrength(team: Team): number { ... }
}
```

**Proposed: Explicit Interfaces**

```typescript
export interface IMatchSimulator {
  simulateMatch(match: Match, currentWeek: number, seed?: number): MatchResult;
  simulateKnockoutMatch(match: Match, currentWeek: number, seed?: number): CupResult;
  calculateTeamStrength(team: Team, currentWeek: number): number;
}

export class MatchSimulator implements IMatchSimulator {
  // Implementation
}
```

### Recommended Interfaces to Define

| Module | Interface Name | Purpose |
|--------|---------------|---------|
| match-simulator | IMatchSimulator | Simulate matches |
| news-engine | INewsEngine | Generate news articles |
| match-commentary | IMatchCommentary | Generate match events |
| match-story-generator | IMatchStoryGenerator | Generate match stories |
| season-manager | ISeasonManager | Manage season flow |
| league-table-manager | ILeagueTableManager | Calculate standings |
| contract-manager | IContractManager | Manage contracts |
| injury-manager | IInjuryManager | Manage injuries |
| morale-manager | IMoraleManager | Manage morale |
| player-development | IPlayerDevelopment | Develop players |
| tactics-manager | ITacticsManager | Calculate tactics |
| transfer-market | ITransferMarket | Manage transfers |
| finance-engine | IFinanceEngine | Track finances |
| achievement-manager | IAchievementManager | Track achievements |
| records-manager | IRecordsManager | Track records |
| board-manager | IBoardManager | Manage board |
| staff-manager | IStaffManager | Manage staff |
| youth-academy-manager | IYouthAcademyManager | Manage youth |
| cup-manager | ICupManager | Manage cups |
| weather-generator | IWeatherGenerator | Generate weather |
| team-generator | ITeamGenerator | Generate teams |
| player-stats-tracker | IPlayerStatsTracker | Track stats |

## Refactoring Plan

### Phase 1: News & Commentary Consolidation (Weeks 1-2)

**Stories:**
1. **Story 1.4.2**: Consolidate News Generation Modules
   - Create unified `NewsEngine`
   - Migrate news generation logic from news-generator
   - Add tests for all news types
   - Update app to use new module

2. **Story 1.4.3**: Separate Match Commentary Module
   - Create `MatchStoryGenerator` (merge preview + post-match)
   - Clean up `MatchCommentary` (focus on real-time events)
   - Add tests for match stories
   - Update match-simulator integration

**Validation:**
- All existing news articles still generated
- Match commentary still works in match simulator
- Pre-match previews and post-match analysis still generated
- All tests passing

### Phase 2: Module Interfaces & DI (Weeks 3-4)

**Stories:**
1. **Story 1.4.4**: Implement Module Interfaces and Dependency Injection
   - Define TypeScript interfaces for all modules
   - Refactor modules to implement interfaces
   - Create factory functions for DI
   - Add interface-based tests

**Validation:**
- All modules have explicit interfaces
- Modules can be mocked easily in tests
- No circular dependencies introduced

### Phase 3: Documentation & Examples (Week 5)

**Stories:**
1. **Story 1.4.5**: Create Module Documentation and Examples
   - Document each module's purpose and API
   - Create usage examples
   - Update architecture docs
   - Write contribution guide

**Validation:**
- Documentation complete for all modules
- Examples run successfully
- Architecture docs reflect new structure

### Phase 4: Optional Consolidations (Week 6 - If Time Permits)

**Optional Stories:**
- Merge contract managers
- Merge youth academy + player development

**Decision Point:** Evaluate whether these consolidations are necessary based on Phase 1-3 outcomes.

## Risk Assessment

### Consolidation Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing functionality | Medium | High | Comprehensive test suite before refactoring |
| Module too large after merge | Low | Medium | Monitor module size, split if >500 lines |
| Interface complexity | Low | Low | Keep interfaces simple, single responsibility |
| Migration effort underestimated | Medium | Medium | Phased approach, validate each phase |

### Dependencies on External Systems

**No external dependencies identified** ✅

All modules are self-contained TypeScript classes with no external API calls, database connections, or third-party service dependencies. This simplifies refactoring significantly.

## Testing Strategy

### Current Test Coverage

Based on .spec.ts files:
- All 24 modules have test files
- Test coverage varies by module (estimated 60-80% average)

### Recommended Testing for Refactoring

**Before Refactoring:**
1. Run full test suite to establish baseline
2. Document any failing tests
3. Add integration tests for critical paths:
   - Match simulation → news generation
   - Match simulation → commentary generation
   - Match simulation → post-match analysis

**During Refactoring:**
1. Keep old modules alongside new modules temporarily
2. Run tests for both old and new modules in parallel
3. Ensure identical outputs for same inputs

**After Refactoring:**
1. Run full regression test suite
2. Delete old modules only after all tests pass
3. Update documentation with new module structure

## Stakeholder Review

### Questions for Product Owner / Tech Lead

1. **News Consolidation:** Do you approve the 3-module split (NewsEngine, MatchCommentary, MatchStoryGenerator)?
2. **Contract Merge:** Should we merge contract managers now or defer to later?
3. **Youth Academy:** Keep separate or merge with player development?
4. **Module Interfaces:** Do we need interfaces for ALL modules or just core ones?
5. **Timeline:** Is 5-6 week timeline acceptable for this epic?

## Conclusion

The Football Director engine has a well-structured dependency graph with zero circular dependencies, which is excellent. However, there are clear consolidation opportunities:

**High Priority:**
- ✅ **Consolidate news/commentary modules** (4 → 3 modules, clearer responsibilities)
- ✅ **Define module interfaces** (enables better testing and DI)
- ✅ **Document module APIs** (improve maintainability)

**Medium Priority:**
- ⚠️ **Merge contract managers** (2 → 1 module, reduce duplication)

**Low Priority:**
- ⚠️ **Merge youth academy into player development** (minor benefit, optional)

**Next Steps:**
1. Review this analysis with stakeholders
2. Get approval on consolidation plan
3. Proceed with Story 1.4.2 (News consolidation)

---

**Status:** ✅ Analysis Complete - Ready for Review
**Next Story:** 1.4.2 - Consolidate News Generation Modules
