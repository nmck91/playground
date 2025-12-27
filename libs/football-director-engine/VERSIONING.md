# Football Director Engine - GameState Versioning Guide

**Epic 1.5 - Story 1.5.3: Discriminated Unions for Type-Safe Versioning**

This guide explains the type-safe versioning system for GameState using discriminated unions, and provides step-by-step instructions for adding new versions.

---

## Overview

The Football Director Engine uses a **discriminated union** versioning system to ensure type safety when migrating save files between versions. This approach:

- ✅ **Type-safe migrations**: TypeScript enforces correct migration paths at compile time
- ✅ **Explicit versioning**: Each GameState version is a distinct type with a version discriminant field
- ✅ **Automated type narrowing**: Type guards automatically narrow union types
- ✅ **Compile-time guarantees**: Migration functions can't accidentally skip required fields

---

## Architecture

### Key Files

1. **`lib/game-state-versions.ts`**: Defines discriminated union types and version constants
2. **`lib/migration.ts`**: Contains migration functions with typed signatures
3. **`lib/types.ts`**: Contains base GameState interface (current version)
4. **`lib/game-state-versions.spec.ts`**: Tests for versioning and migrations

### Current Versions

- **V1** (Original): Implicit version, many optional fields
- **V2** (Current): Explicit `version: 2`, required fields for finances, tactics, player contracts, etc.

```typescript
// Current version constant
export const CURRENT_GAME_STATE_VERSION = 2;
```

---

## Type System

### Discriminated Union

The `GameState` type is a discriminated union of all versions:

```typescript
export type GameState = GameStateV1 | GameStateV2;
```

Each version has a **discriminant field** (`version`) that TypeScript uses for type narrowing.

### Version-Specific Types

#### GameStateV1
```typescript
export interface GameStateV1 {
  version?: 1; // Optional - may be missing in old saves
  id: string;
  // ... core fields
  // Many fields optional (finances?, matchHistory?, etc.)
}
```

#### GameStateV2 (Current)
```typescript
export type GameStateV2 = Omit<BaseGameState, 'version'> & {
  version: 2; // Required discriminant
};
```

### Type Guards

The system provides type guards for runtime version checking:

```typescript
// Check if state is V1
if (isGameStateV1(state)) {
  // TypeScript knows: state is GameStateV1
}

// Check if state is V2
if (isGameStateV2(state)) {
  // TypeScript knows: state is GameStateV2
}

// Get version number
const version = getGameStateVersion(state); // Returns 1 | 2

// Assert current version (throws if not V2)
assertCurrentVersion(state); // state is now GameStateV2
```

---

## Migration System

### Migration Functions

Migrations are **typed functions** that take a specific version and return the next version:

```typescript
// V1 → V2 migration (typed!)
export function migrateGameStateV1toV2(oldState: GameStateV1): GameStateV2 {
  // TypeScript enforces that we return valid GameStateV2
  return {
    version: 2,
    ...oldState,
    finances: oldState.finances || getDefaultFinances(),
    // ... all required V2 fields
  };
}
```

### Auto-Migration

The `migrateGameState` function uses type guards to detect version and apply migrations:

```typescript
export function migrateGameState(data: GameState): GameStateV2 {
  if (isGameStateV1(data)) {
    return migrateGameStateV1toV2(data);
  }

  if (isGameStateV2(data)) {
    return data; // Already current version
  }

  throw new Error(`Unknown GameState version`);
}
```

**Type Safety**: The function signature guarantees it always returns `GameStateV2` (current version).

---

## How to Add a New Version (V3 Example)

Follow these steps to add a new GameState version in a type-safe way:

### Step 1: Define the New Version Type

**File**: `lib/game-state-versions.ts`

```typescript
/**
 * GameState Version 3
 *
 * Changes in V3:
 * - Added playerMentality field to Team
 * - Added injuryHistory to Player
 * - Added sponsorshipDeals to TeamFinances
 */
export type GameStateV3 = Omit<BaseGameState, 'version'> & {
  version: 3; // New discriminant value
};
```

### Step 2: Update the Union Type

**File**: `lib/game-state-versions.ts`

```typescript
// Add V3 to the union
export type GameState = GameStateV1 | GameStateV2 | GameStateV3;
```

### Step 3: Update the Version Constant

**File**: `lib/game-state-versions.ts`

```typescript
export const CURRENT_GAME_STATE_VERSION = 3; // Update to 3
```

### Step 4: Add Type Guard

**File**: `lib/game-state-versions.ts`

```typescript
export function isGameStateV3(state: GameState): state is GameStateV3 {
  return state.version === 3;
}
```

### Step 5: Update Base GameState Interface

**File**: `lib/types.ts`

Update the `GameState` interface to include new V3 fields:

```typescript
export interface GameState {
  version: GameStateVersion; // Update type to include 3
  // ... existing fields

  // New V3 fields (add these):
  playerMentality?: PlayerMentality; // New in V3
}
```

### Step 6: Create Migration Function (V2 → V3)

**File**: `lib/migration.ts`

```typescript
/**
 * Migrate GameState from V2 to V3
 */
export function migrateGameStateV2toV3(oldState: GameStateV2): GameStateV3 {
  // TypeScript enforces correct input and output types!

  return {
    ...oldState,
    version: 3,
    // Provide defaults for new V3 fields
    playerMentality: oldState.playerMentality || getDefaultPlayerMentality(),
  };
}
```

### Step 7: Create Default Values Helper

**File**: `lib/migration.ts`

```typescript
export function getDefaultPlayerMentality(): PlayerMentality {
  return {
    aggression: 50,
    creativity: 50,
    workRate: 75,
  };
}
```

### Step 8: Update Auto-Migration Function

**File**: `lib/migration.ts`

```typescript
export function migrateGameState(data: GameState): GameStateV3 {
  // Apply migrations in sequence
  let current: GameState = data;

  if (isGameStateV1(current)) {
    current = migrateGameStateV1toV2(current);
  }

  if (isGameStateV2(current)) {
    current = migrateGameStateV2toV3(current);
  }

  if (isGameStateV3(current)) {
    return current; // Already current version
  }

  throw new Error(`Unknown GameState version: ${getGameStateVersion(data)}`);
}
```

**Important**: Update the return type from `GameStateV2` to `GameStateV3`.

### Step 9: Update SaveService

**File**: `apps/football-director/src/services/SaveService.ts`

Update `createNewGame()` to set version 3:

```typescript
const gameState: GameState = {
  version: 3, // Update to 3
  // ... rest of fields
};
```

### Step 10: Write Tests

**File**: `lib/game-state-versions.spec.ts`

Add tests for V3:

```typescript
describe('GameStateV3', () => {
  it('should correctly identify V3 game state', () => {
    const v3State: GameStateV3 = {
      version: 3,
      // ... required fields
    };

    expect(isGameStateV3(v3State)).toBe(true);
    expect(getGameStateVersion(v3State)).toBe(3);
  });

  it('should migrate V2 to V3', () => {
    const v2State: GameStateV2 = {
      version: 2,
      // ... V2 fields
    };

    const v3State = migrateGameStateV2toV3(v2State);

    expect(v3State.version).toBe(3);
    expect(v3State.playerMentality).toBeDefined();
  });

  it('should migrate V1 → V2 → V3 via auto-migration', () => {
    const v1State: GameStateV1 = {
      // ... V1 fields
    };

    const result = migrateGameState(v1State);

    expect(result.version).toBe(3);
    expect(result.playerMentality).toBeDefined();
  });
});
```

### Step 11: Run Tests

```bash
nx test football-director-engine
```

Ensure all tests pass, including migration tests.

### Step 12: Update Type Exports

**File**: `lib/index.ts`

Ensure the new types are exported:

```typescript
export * from './lib/game-state-versions'; // Exports all version types
```

---

## Best Practices

### DO:
✅ Always use discriminated unions for version types
✅ Make migration functions take and return specific version types
✅ Provide default values for new required fields
✅ Write comprehensive tests for each migration
✅ Update `CURRENT_GAME_STATE_VERSION` constant
✅ Document what changed in each version (comments)

### DON'T:
❌ Use `any` type in migration functions
❌ Skip versions in migration chain (V1 → V3)
❌ Modify existing version interfaces (create new version instead)
❌ Forget to update SaveService's `createNewGame()`
❌ Remove old version types (needed for migrations)

---

## Testing Your Migration

### Manual Testing

1. Create a save with the old version
2. Load the save in the new version
3. Verify all fields are correctly migrated
4. Verify new fields have appropriate defaults
5. Save and reload to ensure persistence works

### Automated Testing

The test suite automatically tests:
- Type guards correctly identify versions
- Migrations preserve existing data
- New fields get default values
- Multi-version migration chains work (V1 → V2 → V3)

Run tests:
```bash
nx test football-director-engine --testFile game-state-versions.spec.ts
```

---

## Debugging Migration Issues

### Common Issues

**Issue**: "Cannot read property X of undefined"
- **Cause**: Migration assumes field exists but it's optional in previous version
- **Fix**: Use optional chaining: `oldState.field?.subField || defaultValue`

**Issue**: "Type X is not assignable to type Y"
- **Cause**: Migration function return type doesn't match new version
- **Fix**: Ensure all new required fields are provided

**Issue**: "Version mismatch" error
- **Cause**: Migration chain doesn't handle a version
- **Fix**: Add migration step in `migrateGameState` function

### Debug Tips

1. Check version number: `console.log('Version:', state.version)`
2. Use type guards: `if (isGameStateV1(state)) { ... }`
3. Validate migrated state: `validateGameStateV2(state)` returns boolean
4. Check migration logs: Look for "Migrating save file from vX to vY..."

---

## Version History

### V1 (Original)
- Initial GameState structure
- Many optional fields
- No explicit version field

### V2 (Current)
**Epic 1.5 - Story 1.5.2**
- Added explicit `version: 2` field
- Made previously optional fields required:
  - `finances` (TeamFinances)
  - `matchHistory` (MatchResult[])
  - `boardStatus` (BoardStatus)
  - `clubRecords` (ClubRecords)
  - `matchPreviews` (MatchPreview[])
- Added required fields to Player:
  - `contract` (PlayerContract)
  - `morale` (number)
- Added required fields to Team:
  - `tactics` (Tactics)
  - `philosophy` (ClubPhilosophy)
- Added required fields to MatchResult:
  - `weather` (MatchWeather)
  - `stats` (MatchStats)
  - `playerRatings` (PlayerRating[])
  - `isDerby` (boolean)
  - `postMatchAnalysis` (PostMatchAnalysis)

---

## References

- **Discriminated Unions**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
- **Type Guards**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/intro.html

---

**Document Status**: Complete
**Last Updated**: 2025-12-27
**Story**: Epic 1.5 - Story 1.5.3
