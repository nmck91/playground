# Football Director Engine - Type Guards and Runtime Validation Guide

**Epic 1.5 - Story 1.5.4: Type Guards and Runtime Validation**

This guide explains the runtime validation system using Zod, type guards for TypeScript type narrowing, and best practices for validating data at system boundaries.

---

## Overview

While TypeScript provides compile-time type safety, runtime validation is essential for:
- **Data from external sources**: localStorage, API responses, user input
- **Deserialized data**: JSON.parse can return any type
- **Migration edge cases**: Ensuring migrated data is valid
- **Debugging**: Catching corrupt data early with clear error messages

This engine uses **Zod** for runtime validation and provides type guard functions for type-safe runtime checks.

---

## Architecture

### Key Files

1. **`lib/type-guards.ts`**: Zod schemas, type guards, and validation functions
2. **`lib/type-guards.spec.ts`**: Comprehensive tests for type guards
3. **`apps/football-director/src/services/SaveService.ts`**: Validation at save/load boundaries

### Components

- **Zod Schemas**: Define structure and validation rules
- **Type Guards**: Boolean functions that narrow TypeScript types
- **Validation Functions**: Return detailed error information
- **Assertion Functions**: Throw on validation failure with context

---

## Type Guards

Type guards are functions that return a boolean and use TypeScript's `is` predicate to narrow types.

### Basic Usage

```typescript
import { isPlayer, isTeam, isGameState } from '@playground/football-director-engine';

function processPlayer(data: unknown) {
  if (isPlayer(data)) {
    // TypeScript knows: data is Player
    console.log(data.name, data.position, data.skill);
  } else {
    console.error('Invalid player data');
  }
}
```

### Available Type Guards

```typescript
// Core game types
isPlayer(value: unknown): value is Player
isTeam(value: unknown): value is Team
isMatchResult(value: unknown): value is MatchResult
isGameState(value: unknown): value is GameState
isSeason(value: unknown): value is Season

// Also available from game-state-versions.ts
isGameStateV1(state: GameState): state is GameStateV1
isGameStateV2(state: GameState): state is GameStateV2
```

### When to Use Type Guards

✅ **USE type guards when:**
- Checking data from external sources (localStorage, APIs)
- Type narrowing in conditional logic
- Validating function parameters before processing
- Defensive programming at boundaries

❌ **DON'T use type guards when:**
- Data is known to be correct (internal function calls)
- Performance is critical and validation overhead matters
- TypeScript compiler already guarantees the type

---

## Validation Functions

Validation functions provide detailed error information using Zod's error reporting.

### Validation with Error Details

```typescript
import { validatePlayer, formatValidationErrors } from '@playground/football-director-engine';

function loadPlayer(data: unknown) {
  const result = validatePlayer(data);

  if (result.success) {
    // TypeScript knows: result.data is Player
    const player = result.data;
    console.log(`Loaded player: ${player.name}`);
    return player;
  } else {
    // result.errors is z.ZodError
    const errorMessage = formatValidationErrors(result.errors);
    console.error(`Invalid player:`, errorMessage);
    return null;
  }
}
```

### Available Validation Functions

```typescript
validatePlayer(value: unknown): ValidationResult<Player>
validateTeam(value: unknown): ValidationResult<Team>
validateMatchResult(value: unknown): ValidationResult<MatchResult>
validateGameState(value: unknown): ValidationResult<GameState>
```

### ValidationResult Type

```typescript
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: z.ZodError };
```

---

## Assertion Functions

Assertions throw errors when validation fails, useful for defensive programming.

### Basic Assertions

```typescript
import { assertPlayer, assertTeam, assertGameState } from '@playground/football-director-engine';

function processPlayerData(data: unknown) {
  // Throws if data is not a valid Player
  assertPlayer(data, 'processPlayerData');

  // TypeScript knows: data is Player
  console.log(data.name);
}

try {
  processPlayerData(invalidData);
} catch (error) {
  // Error: Invalid Player in processPlayerData: name: Required; position: Invalid enum value
  console.error(error.message);
}
```

### Available Assertions

```typescript
assertPlayer(value: unknown, context?: string): asserts value is Player
assertTeam(value: unknown, context?: string): asserts value is Team
assertGameState(value: unknown, context?: string): asserts value is GameState
```

### When to Use Assertions

✅ **USE assertions when:**
- Validation failure should halt execution
- You want early error detection with stack traces
- Code assumes data is valid (fail fast if not)

❌ **DON'T use assertions when:**
- Errors should be handled gracefully
- User-facing code (use validation functions instead)
- Performance-critical paths

---

## Zod Schemas

All validation is powered by Zod schemas. You can access them directly for advanced use cases.

### Direct Schema Usage

```typescript
import { Schemas } from '@playground/football-director-engine';

// Parse and validate
const result = Schemas.Player.safeParse(data);

// Parse or throw
const player = Schemas.Player.parse(data);

// Get schema type
type Player = z.infer<typeof Schemas.Player>;

// Partial validation
const partialPlayer = Schemas.Player.partial().parse(data);

// Custom validation
const extendedPlayer = Schemas.Player.extend({
  customField: z.string(),
});
```

### Available Schemas

```typescript
Schemas.Player
Schemas.Team
Schemas.MatchResult
Schemas.GameState
Schemas.Season
Schemas.Staff
Schemas.Tactics
Schemas.TeamFinances
Schemas.MatchWeather
Schemas.MatchStats
```

---

## Validation at Boundaries

The engine applies validation at key system boundaries to catch invalid data early.

### SaveService Boundaries

**Before Saving**:
```typescript
// In SaveService.saveToSlot()
const validationResult = validateGameState(gameState);
if (!validationResult.success) {
  const errors = formatValidationErrors(validationResult.errors);
  throw new Error(`Cannot save invalid GameState: ${errors}`);
}
```

**After Loading**:
```typescript
// In SaveService.loadFromSlot()
const validationResult = validateGameState(gameState);
if (!validationResult.success) {
  const errors = formatValidationErrors(validationResult.errors);
  throw new Error(`Loaded save data is corrupted: ${errors}`);
}
```

### Where to Add Validation

✅ **Critical boundaries for validation:**
1. **SaveService**: Before save, after load
2. **API endpoints**: Request/response validation
3. **User input**: Form submissions, file uploads
4. **External data**: Third-party APIs, imported files
5. **Deserialization**: JSON.parse, localStorage.getItem

---

## Best Practices

### DO:

✅ **Validate at system boundaries**
```typescript
// Good: Validate external data
const data = JSON.parse(localStorage.getItem('save'));
if (!isGameState(data)) {
  throw new Error('Invalid save data');
}
```

✅ **Use type guards for type narrowing**
```typescript
// Good: Type guard narrows the type
function process(data: unknown) {
  if (isPlayer(data)) {
    // data is Player here
    console.log(data.name);
  }
}
```

✅ **Provide context in assertions**
```typescript
// Good: Context helps debugging
assertGameState(data, 'SaveService.loadFromSlot');
```

✅ **Format errors for users**
```typescript
// Good: User-friendly error messages
const result = validatePlayer(data);
if (!result.success) {
  const errors = formatValidationErrors(result.errors);
  showUserError(`Invalid player data: ${errors}`);
}
```

### DON'T:

❌ **Don't validate trusted internal data**
```typescript
// Bad: Unnecessary validation overhead
function internalFunction(player: Player) {
  assertPlayer(player, 'internalFunction'); // Wasteful
  // ...
}
```

❌ **Don't ignore validation errors**
```typescript
// Bad: Silent failure
if (!isGameState(data)) {
  // Do nothing - data might be used incorrectly later
}
```

❌ **Don't use type assertions without validation**
```typescript
// Bad: Unsafe type assertion
const player = data as Player; // Could be anything!

// Good: Validate first
assertPlayer(data, 'loadPlayer');
const player = data; // Now safe
```

---

## Performance Considerations

### Validation Overhead

Type guards and validation have performance overhead. Benchmarks:
- **Simple type guard** (isPlayer): ~0.01ms
- **Complex validation** (GameState): ~10-50ms
- **Assertion** (same as validation + error formatting)

### Optimization Strategies

**1. Validate Once at Boundaries**
```typescript
// Good: Validate once when loading
const gameState = loadGameState();
assertGameState(gameState, 'loadGameState');

// Now pass around with confidence (no re-validation)
processGame(gameState);
simulateWeek(gameState);
```

**2. Use Partial Validation When Appropriate**
```typescript
// Only validate changed fields
const updates = Schemas.Player.partial().parse(formData);
```

**3. Skip Validation in Development (if needed)**
```typescript
if (process.env.NODE_ENV === 'production') {
  assertGameState(data, 'critical path');
}
```

---

## Error Messages

### Understanding Validation Errors

Zod errors include:
- **Path**: Field that failed validation (e.g., `playerTeam.players.0.skill`)
- **Message**: What went wrong (e.g., "Expected number, received string")
- **Code**: Error type (e.g., "invalid_type", "too_small")

### Example Error

```typescript
const result = validatePlayer({
  id: '',
  name: '',
  position: 'INVALID',
  skill: 25,
});

if (!result.success) {
  console.log(formatValidationErrors(result.errors));
  // Output:
  // "id: String must contain at least 1 character(s);
  //  name: String must contain at least 1 character(s);
  //  position: Invalid enum value. Expected 'GK' | 'DEF' | 'MID' | 'FWD', received 'INVALID';
  //  skill: Number must be less than or equal to 20"
}
```

---

## Common Validation Scenarios

### 1. Loading from localStorage

```typescript
function loadSave(slotId: number): GameState | null {
  const raw = localStorage.getItem(`save-${slotId}`);
  if (!raw) return null;

  const data = JSON.parse(raw);

  // Validate before using
  const result = validateGameState(data);
  if (!result.success) {
    console.error('Corrupted save:', formatValidationErrors(result.errors));
    return null;
  }

  return result.data;
}
```

### 2. API Response Validation

```typescript
async function fetchPlayer(id: string): Promise<Player> {
  const response = await fetch(`/api/players/${id}`);
  const data = await response.json();

  // Validate API response
  assertPlayer(data, 'fetchPlayer API response');

  return data;
}
```

### 3. User Form Validation

```typescript
function handlePlayerForm(formData: unknown) {
  const result = validatePlayer(formData);

  if (!result.success) {
    // Show user-friendly errors
    const errors = formatValidationErrors(result.errors);
    showFormErrors(errors);
    return;
  }

  // Save valid player
  savePlayer(result.data);
}
```

### 4. File Import Validation

```typescript
async function importSave(file: File): Promise<GameState> {
  const text = await file.text();
  const data = JSON.parse(text);

  // Critical: Validate imported data
  const result = validateGameState(data);
  if (!result.success) {
    throw new Error(`Invalid save file: ${formatValidationErrors(result.errors)}`);
  }

  return result.data;
}
```

---

## Testing Type Guards

The engine includes comprehensive tests for all type guards.

### Running Tests

```bash
# Run all type guard tests
nx test football-director-engine --testFile type-guards.spec.ts

# Run all engine tests (includes type guards)
nx test football-director-engine
```

### Test Coverage

The test suite covers:
- ✅ Valid data passes validation
- ✅ Invalid data is rejected
- ✅ Edge cases (null, undefined, empty objects)
- ✅ Type narrowing works correctly
- ✅ Error messages are helpful
- ✅ Performance is acceptable (<100ms for GameState)

---

## Extending Validation

### Adding New Schemas

```typescript
// In type-guards.ts
const MyNewTypeSchema = z.object({
  id: z.string(),
  value: z.number().positive(),
});

export function isMyNewType(value: unknown): value is MyNewType {
  return MyNewTypeSchema.safeParse(value).success;
}

export function validateMyNewType(value: unknown): ValidationResult<MyNewType> {
  const result = MyNewTypeSchema.safeParse(value);
  if (result.success) {
    return { success: true, data: result.data as MyNewType };
  }
  return { success: false, errors: result.error };
}
```

### Custom Validation Rules

```typescript
// Custom skill range validation
const PlayerSchema = z.object({
  // ...
  skill: z.number().refine(
    (val) => val >= 1 && val <= 20,
    { message: "Skill must be between 1 and 20" }
  ),
});

// Custom team size validation
const TeamSchema = z.object({
  players: z.array(PlayerSchema).refine(
    (players) => players.length >= 11 && players.length <= 30,
    { message: "Team must have between 11 and 30 players" }
  ),
});
```

---

## Troubleshooting

### "Validation is slow"
- Profile with `performance.now()` to identify bottleneck
- Validate once at boundaries, not repeatedly
- Use partial schemas for incremental updates
- Consider caching validation results

### "Error messages are unclear"
- Use `formatValidationErrors()` for formatted output
- Add custom error messages with `.refine()`
- Include context in assertions

### "TypeScript not narrowing types"
- Ensure using type guards with `is` predicate
- Check that function returns boolean
- Use assertion functions for throw-based narrowing

---

## References

- **Zod Documentation**: https://zod.dev/
- **TypeScript Type Guards**: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
- **Discriminated Unions**: See VERSIONING.md

---

**Document Status**: Complete
**Last Updated**: 2025-12-27
**Story**: Epic 1.5 - Story 1.5.4
