# Strict TypeScript Configuration Guide

**Epic 1.5 - Story 1.5.5: Enable Strict TypeScript Configuration**

This guide explains the strict TypeScript configuration enabled in the Football Director project, its benefits, and best practices for development.

## Overview

As of Story 1.5.5, the Football Director project uses the strictest TypeScript configuration to catch errors at compile time and improve code quality. This is part of Epic 1.5: Type Safety Improvements.

## Configuration

The following strict TypeScript options are enabled in `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Benefits of Strict TypeScript

### 1. **Fewer Runtime Errors**
Strict type checking catches many bugs at compile time that would otherwise cause runtime errors:
- Null/undefined reference errors
- Type mismatches
- Missing return statements
- Fallthrough cases in switch statements

**Example:**
```typescript
// Without strict: compiles but crashes at runtime
function getPlayerName(player: Player | undefined) {
  return player.name; // Runtime error if player is undefined!
}

// With strict: compiler error forces you to handle undefined
function getPlayerName(player: Player | undefined) {
  return player?.name ?? 'Unknown'; // Safe!
}
```

### 2. **Better IDE Autocomplete**
Explicit types enable better IntelliSense and autocomplete suggestions, making development faster and reducing typos.

```typescript
// IDE knows exactly what properties are available
const player: Player = getTopScorer();
player.stats. // IDE shows: appearances, goals, assists, etc.
```

### 3. **Easier Refactoring**
When you change a type, the compiler tells you everywhere that needs to be updated. No more "find and hope you got them all."

```typescript
// Change Player interface:
interface Player {
  name: string;
  position: Position; // Changed from string to Position enum
}

// Compiler immediately flags all invalid assignments:
const player: Player = {
  name: "Kane",
  position: "forward" // Error: Type 'string' not assignable to Position
};
```

### 4. **Self-Documenting Code**
Types serve as inline documentation, making code easier to understand without reading implementation details.

```typescript
// Clear what this function accepts and returns
function simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  weather: WeatherConditions
): MatchResult {
  // Implementation
}
```

### 5. **Prevents Implicit `any` Bugs**
The `any` type defeats TypeScript's purpose. Strict mode prevents accidental `any` types that silently disable type checking.

```typescript
// Without noImplicitAny: silently becomes 'any'
function processData(data) { // Implicit any - dangerous!
  return data.whatever; // No type checking!
}

// With noImplicitAny: compiler error forces explicit types
function processData(data: GameState) { // Must specify type
  return data.playerTeam.budget; // Type-safe!
}
```

### 6. **Better Team Collaboration**
Strict types create a clear contract between modules and developers, reducing misunderstandings and integration bugs.

## Team Guidelines

### When to Use Explicit Types vs. Type Inference

#### ✅ Use Type Inference When:

**1. The type is obvious from initialization**
```typescript
// Good: type is clear from literal
const season = 1;
const teamName = "Manchester United";
const isActive = true;
```

**2. Return types are inferred from single return**
```typescript
// Good: return type clearly Player
function createPlayer(name: string) {
  return {
    id: generateId(),
    name,
    position: 'FWD' as const,
    skill: 15
  } satisfies Player;
}
```

**3. Simple variable assignments**
```typescript
// Good: type obvious
const players = gameState.playerTeam.players;
const budget = gameState.playerTeam.finances.budget;
```

#### ⚠️ Use Explicit Types When:

**1. Function parameters (always)**
```typescript
// Required: never rely on inference for parameters
function updatePlayer(player: Player, stats: PlayerStats) {
  // Implementation
}
```

**2. Public API/exported functions (return types)**
```typescript
// Good: explicit return type for public API
export function calculateTablePosition(
  team: Team,
  table: LeagueTable
): number {
  // Implementation
  return position;
}
```

**3. Complex or ambiguous expressions**
```typescript
// Good: explicit type clarifies intent
const matchResult: MatchResult = processMatchData(
  simulateEvents(),
  calculateStats()
);

// Bad: unclear what type this produces
const matchResult = processMatchData(
  simulateEvents(),
  calculateStats()
);
```

**4. Arrays that will be populated later**
```typescript
// Good: explicit type for empty array
const transfers: Transfer[] = [];

// Bad: inferred as never[]
const transfers = [];
```

**5. Union types or discriminated unions**
```typescript
// Good: explicit union type
const gamePhase: 'pre-season' | 'in-season' | 'off-season' = 'pre-season';

// Bad: inferred as literal 'pre-season' only
const gamePhase = 'pre-season';
```

### Handling Legacy Code

When working with code that doesn't meet current strict TypeScript standards:

#### 1. **Gradual Migration**
Don't try to fix everything at once. Fix types as you touch code for other reasons.

```typescript
// Legacy code
function doSomething(data: any) { // TODO: add proper types
  // Old implementation
}

// Updated when adding new feature
function doSomething(data: GameState): void {
  // Updated implementation with proper types
}
```

#### 2. **Use Type Assertions Sparingly**
Only use `as` when you have more information than TypeScript can infer.

```typescript
// Acceptable: you know the shape from external API
const savedData = JSON.parse(localStorage.getItem('save')!) as GameState;

// Better: validate with type guard
const rawData = JSON.parse(localStorage.getItem('save')!);
if (isGameState(rawData)) {
  const savedData = rawData; // Type-safe
}
```

#### 3. **Add TODO Comments**
Mark areas that need type improvements for future work.

```typescript
// TODO (Epic 1.5): Replace any with proper TransferData type
function processTransfer(data: any) {
  // Legacy implementation
}
```

#### 4. **Create Type Stubs**
For complex types, create basic versions and improve over time.

```typescript
// Initial stub
type MatchSimulation = any; // TODO: define proper type

// Improved version
type MatchSimulation = {
  events: MatchEvent[];
  timeline: number[];
  // More properties to be added
};
```

### Handling Unused Variables

#### Parameters You Can't Remove

When a parameter must exist for interface compatibility but isn't used, prefix with `_`:

```typescript
// Interface requires all parameters
interface GameEngine {
  simulateWeek(week: number, weather: Weather, seed?: number): void;
}

// Implementation doesn't need seed yet
class FootballEngine implements GameEngine {
  simulateWeek(week: number, weather: Weather, _seed?: number): void {
    // _seed prefix tells linter this is intentionally unused
    this.processWeek(week, weather);
  }
}
```

#### Variables Reserved for Future Use

Sometimes variables are assigned for planned features:

```typescript
// Reserved for future statistical analysis
const _firstSeason = player.history[0]; // Will be used in Story 2.X

// Current logic doesn't need it yet
return player.skill >= 18 && player.age < 25;
```

### Non-Null Assertions

Use the non-null assertion operator (`!`) only when you're absolutely certain a value isn't null/undefined:

```typescript
// ✅ Acceptable: just checked length
if (players.length > 0) {
  const topScorer = players[0]!; // Safe: array has at least one item
}

// ✅ Acceptable: type guard ensures existence
if (team.captain) {
  console.log(team.captain.name); // No ! needed - TypeScript knows it exists
}

// ❌ Dangerous: no guarantee
const topScorer = players[0]!; // Could be undefined!

// ✅ Better: handle undefined
const topScorer = players[0] ?? defaultPlayer;
```

### Test Files

Test files can be slightly less strict than production code:

```typescript
// Acceptable in tests: non-null assertions when you control test data
const result = gameEngine.simulate()!;
expect(result.homeScore).toBe(3);

// Acceptable in tests: unused test helper parameters
function createTestPlayer(
  name: string,
  _position?: Position, // Will be used in future tests
): Player {
  return { name, position: 'FWD', skill: 15 };
}
```

## ESLint Configuration

The following ESLint rules enforce strict TypeScript usage:

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/no-unused-vars": ["error", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }]
}
```

## CI/CD Enforcement

The CI pipeline enforces strict type checking:
- Build fails on TypeScript errors
- Warnings are allowed but monitored
- Coverage must not regress

```yaml
# GitHub Actions (example)
- name: Type Check
  run: npx nx run-many --target=lint --all

- name: Build
  run: npx nx run-many --target=build --all
```

## Common Patterns

### Optional Chaining
```typescript
// Safe access to nested optional properties
const captainAge = gameState.playerTeam.captain?.age ?? 0;
```

### Nullish Coalescing
```typescript
// Default only for null/undefined, not falsy values
const budget = team.finances.budget ?? 1000000;
```

### Type Guards
```typescript
// Runtime validation with type narrowing
if (isPlayer(entity)) {
  // TypeScript knows entity is Player here
  console.log(entity.skill);
}
```

### Discriminated Unions
```typescript
// Type-safe state versioning
type GameStateV1 = { version: 1; /* old fields */ };
type GameStateV2 = { version: 2; /* new fields */ };
type GameState = GameStateV1 | GameStateV2;

function migrate(state: GameState): GameStateV2 {
  switch (state.version) {
    case 1: return migrateV1toV2(state);
    case 2: return state;
  }
}
```

## Quick Reference

### DO ✅
- Always type function parameters
- Type public API return values
- Use type guards for runtime validation
- Prefix intentionally unused parameters with `_`
- Handle null/undefined explicitly
- Use `satisfies` for type checking without losing inference

### DON'T ❌
- Use `any` (use `unknown` if truly unknown)
- Suppress TypeScript errors without understanding them
- Use `!` unless absolutely certain
- Rely on type inference for public APIs
- Skip type checking in tests (maintain some standards)

## Related Documentation

- [Type Guards and Runtime Validation](type-guards-api.md) - Story 1.5.4
- [Discriminated Unions for Versioning](discriminated-unions.md) - Story 1.5.3
- [Coding Standards](coding-standards.md) - General project standards
- [Architecture Overview](architecture.md) - System architecture

## Version History

- **2025-12-28**: Story 1.5.5 - Strict TypeScript configuration enabled
- **2025-12-24**: Epic 1.5 started - Type safety improvements

---

**Epic 1.5: Type Safety Improvements**
**Story 1.5.5: Enable Strict TypeScript Configuration** ✅
**Last Updated**: December 2025
