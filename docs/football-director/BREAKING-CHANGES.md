# Breaking Changes - Football Director

This document tracks all breaking changes to the Football Director save file format and how they're handled.

## Save File Version History

### Version 2 (December 2025) - Epic 1.5: Type Safety Improvements

**Status**: ✅ Auto-migrated

**Story**: 1.5.2 - Convert Optional Fields to Required

#### What Changed

Several previously optional fields have been converted to required fields to improve type safety and eliminate null checks throughout the codebase.

#### Required Fields Added

**Player Type:**
- `contract: PlayerContract` - Now required (was optional)
  - **Default**: 3-year contract starting from current season
  - **Why**: All players must have contracts in professional football
- `morale: number` - Now required (was optional)
  - **Default**: 75 (neutral morale)
  - **Why**: Player happiness affects performance and is always relevant

**Team Type:**
- `tactics: Tactics` - Now required (was optional)
  - **Default**: 4-4-2 balanced formation with default roles/instructions
  - **Why**: Every team has tactical approach
- `philosophy: ClubPhilosophy` - Now required (was optional)
  - **Default**: 'balanced'
  - **Why**: Club philosophy defines long-term playing style

**GameState Type:**
- `matchPreviews: MatchPreview[]` - Now required (was optional)
  - **Default**: Empty array `[]`
  - **Why**: Match previews are generated for upcoming fixtures
- `boardStatus: BoardStatus` - Now required (was optional)
  - **Default**: Safe job security with 75% satisfaction
  - **Why**: Board objectives and pressure are core to manager mode
- `achievements: Achievement[]` - Now required (was optional)
  - **Default**: All achievements unlocked based on save state
  - **Why**: Achievement system is integral to progression
- `finances: TeamFinances` - Now required (was optional)
  - **Default**: £5M budget with zero income/expenses
  - **Why**: Financial management is core gameplay

**MatchResult Type:**
- `weather: MatchWeather` - Now required (was optional)
  - **Default**: Sunny, 20°C
  - **Why**: Weather affects match conditions
- `stats: MatchStats` - Now required (was optional)
  - **Default**: 50-50 possession, zero shots/corners/fouls
  - **Why**: Match statistics enhance realism
- `playerRatings: PlayerRating[]` - Now required (was optional)
  - **Default**: Empty array `[]`
  - **Why**: Player ratings available for all matches
- `postMatchAnalysis: PostMatchAnalysis` - Now required (was optional)
  - **Default**: Neutral manager quotes and basic stats
  - **Why**: Post-match analysis adds depth
- `isDerby: boolean` - Now required (was optional)
  - **Default**: `false`
  - **Why**: Derby matches have enhanced atmosphere

#### Migration Behavior

**Automatic Migration**: All old saves (v1) are automatically migrated to v2 when loaded. No user action required.

**Migration Process**:
1. Save file is loaded from storage
2. Version is detected using discriminated union type guards
3. If version is 1, migration function `migrateGameStateV1toV2` runs
4. Missing required fields are populated with sensible defaults
5. Migrated save is validated using Zod schemas
6. Game continues with v2 format

**Example Migration**:
```typescript
// V1 Player (old format)
{
  id: "p1",
  name: "Harry Kane",
  wages: 50000
  // contract and morale missing
}

// Migrated to V2
{
  id: "p1",
  name: "Harry Kane",
  wages: 50000,
  contract: {
    weeklyWage: 50000,
    startYear: 2025,
    expiryYear: 2028,  // 3 years
    status: 'active'
  },
  morale: 75  // Neutral
}
```

#### Impact on Players

**✅ No Manual Migration Required**: Old saves load automatically

**✅ No Data Loss**: All existing data is preserved

**✅ Enhanced Features**: New fields enable features like:
- Contract negotiations and renewals
- Player morale affecting performance
- Tactical depth with formations/instructions
- Detailed match statistics and weather effects
- Board objectives and job pressure

**⚠️ Save File Growth**: Migrated saves may be slightly larger due to added fields, but compression handles this efficiently.

#### Developer Impact

**Benefits**:
- ✅ Eliminated 342 optional chaining operators (`?.`)
- ✅ Removed 100+ null checks
- ✅ Full TypeScript strict mode enabled
- ✅ Better IDE autocomplete
- ✅ Fewer runtime errors
- ✅ Easier refactoring

**Code Changes**:
```typescript
// Before (v1): Optional chaining everywhere
const wage = player.contract?.weeklyWage ?? 0;
const morale = player.morale ?? 75;

// After (v2): Confident access
const wage = player.contract.weeklyWage;
const morale = player.morale;
```

#### Testing

**Migration Tests**: 25+ test cases covering:
- Default value generation
- Player migration (contract, morale)
- Team migration (tactics, philosophy)
- MatchResult migration (weather, stats, analysis)
- Full GameState v1 → v2 migration
- Auto-detection and validation

**Test Coverage**:
- ✅ All required fields have valid defaults
- ✅ Migration preserves existing data
- ✅ v2 validation catches invalid states
- ✅ v2 saves pass through unchanged

#### Rollback

**Not Possible**: Once a save is migrated to v2, it cannot be loaded in older versions of the game.

**Recommendation**: Keep backups of important saves before updating if concerned about compatibility.

---

### Version 1 (Pre-December 2025)

Original save format with many optional fields for backward compatibility.

**Issues**:
- Excessive null checks required
- Type safety compromised with `any` types
- Optional fields led to defensive programming
- Difficult to refactor

**Replaced By**: Version 2 (December 2025)

---

## Migration Architecture

### Discriminated Unions (Story 1.5.3)

Save versioning uses TypeScript discriminated unions:

```typescript
type GameStateV1 = { version: 1; /* old fields */ }
type GameStateV2 = { version: 2; /* new fields */ }
type GameState = GameStateV1 | GameStateV2

// Type guard automatically narrows type
if (isGameStateV1(data)) {
  // TypeScript knows this is V1
  const migrated = migrateGameStateV1toV2(data);
}
```

### Type Guards (Story 1.5.4)

Runtime validation using Zod schemas:

```typescript
const result = validateGameState(gameState);
if (!result.success) {
  // Corrupted save - show error
  throw new Error(formatValidationErrors(result.errors));
}
```

### Migration Pipeline

```
Load Save → Detect Version → Apply Migrations → Validate → Load Game
                ↓                    ↓               ↓
           Type Guard         v1→v2, v2→v3...   Zod Schema
```

## Future Versions

### Version 3 (Planned)

Potential future breaking changes (not yet implemented):

- Enhanced player attributes (potential, personality traits)
- Multi-division support
- European competitions
- Dynamic league structure

**When Implemented**: Will follow same migration pattern:
1. Create `GameStateV3` type
2. Write `migrateGameStateV2toV3` function
3. Update `migrateGameState` to handle v3
4. Add tests
5. Document breaking changes

## FAQs

### Will my old saves work?

**Yes!** All v1 saves are automatically migrated to v2 when loaded. No manual action required.

### Can I downgrade to an older version?

**No.** Once migrated to v2, saves cannot be loaded in older versions. We recommend keeping backups if you need to revert.

### Will migration break my game?

**Unlikely.** Migration has been extensively tested with:
- 25+ automated test cases
- Validation to catch corrupted data
- Default values for all missing fields
- Preservation of all existing data

If you encounter issues, please report them with your save file (if possible).

### How do I backup my saves?

**Export Feature**: Use the in-game save export feature:
1. Main Menu → Load Game
2. Select your save slot
3. Click "Export"
4. Save the JSON file somewhere safe

**Manual Backup**: Copy from localStorage (advanced):
- Open browser DevTools (F12)
- Application → Local Storage
- Look for `football-director-slot-*` keys
- Copy the data

### Why make breaking changes?

**Type Safety**: These changes enable:
- Stricter TypeScript checking
- Better developer experience
- Fewer bugs and runtime errors
- Easier feature development
- Better performance

The migration system ensures users don't experience disruption while developers get better code quality.

---

**Epic 1.5: Type Safety Improvements**
**Stories**: 1.5.2 (Required Fields), 1.5.3 (Discriminated Unions), 1.5.4 (Type Guards)
**Last Updated**: December 2025
