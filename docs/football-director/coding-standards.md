# Football Director - Coding Standards

## Architectural Patterns

### Separation of Concerns
- **Engine Layer**: Pure TypeScript, no React/UI dependencies
- **Application Layer**: React components, hooks, routing
- **Service Layer**: Minimal (only SaveService for now)

### State Management
- **Pattern**: Composable hooks architecture - single source of truth composed from specialized hooks
- **Main Hook**: `useGameState` orchestrates all sub-hooks and maintains backward compatibility
- **Sub-Hooks**: Each handles a specific concern (persistence, actions, simulation, derived state)
- **Updates**: Immutable state updates with spread operators
- **Persistence**: Auto-save on every state change via `useGamePersistence`
- **Derivation**: Calculate derived state (like top performers) via `useDerivedGameState` with useMemo
- **Memoization**: All action handlers use useCallback, all computed values use useMemo

### Component Patterns
- **Client Components**: All components use `'use client'` directive
- **Modals**: Controlled by parent state (show/hide flags)
- **Forms**: Controlled components with local state
- **Loading States**: Skeleton screens for async operations

### Engine Module Pattern
```typescript
// Each engine module exports:
// 1. Interfaces/types specific to that module
// 2. A class with static or instance methods
// 3. Pure functions that take state, return new state

export class MatchSimulator {
  simulateMatch(
    homeTeam: Team,
    awayTeam: Team,
    // ...other params
  ): MatchResult {
    // Pure logic, no side effects
    return result;
  }
}
```

## Coding Conventions

### TypeScript
- Strict mode enabled
- Explicit return types preferred
- Interface over type for object shapes
- Enum usage minimal (prefer string literal unions)

### React
- Function components only (no class components)
- Hooks for state and side effects
- Props destructuring in function parameters
- Component files use `.tsx` extension

### Naming
- Components: PascalCase (`PlayerStatsModal.tsx`)
- Hooks: camelCase with `use` prefix (`useGameState.ts`)
- Engine classes: PascalCase (`MatchSimulator`)
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase (no `I` prefix)

### File Organization
- One component per file
- Co-locate related components in subdirectories
- Index files for clean imports (`components/ui/index.ts`)
- Engine modules are flat (no nested directories)

### Styling
- Tailwind utility classes in JSX
- No CSS modules
- Theme colors via Tailwind config
- Dark mode: `dark:` prefix utilities

## Critical Rules for AI Agents

### DO ✅
- Keep engine modules pure and stateless
- Make new GameState fields optional for migration compatibility
- Test save/load after state structure changes
- Maintain immutable state updates
- Add tests when modifying critical modules

### DON'T ❌
- Don't break the 52-week season system
- Don't modify SaveService without migration plan
- Don't add dependencies to engine library
- Don't use class components
- Don't add side effects to engine modules

## Key Development Guidelines

### For Feature Development
1. **Engine Changes**: Add logic to appropriate module in `libs/football-director-engine/src/lib/`
2. **UI Changes**: Add/modify components in `src/components/`
3. **State Changes**: Update types.ts, add migration in SaveService, handle in useGameState

### For Bug Fixes
- Prefer minimal changes
- Maintain immutability
- Test across multiple game weeks
- Verify save/load still works

### For Refactoring
- **Completed**: ✅ Refactored useGameState (1,220 lines → 143 lines) into composable hooks (Dec 2025)
  - Created 4 specialized hooks: useGamePersistence, useDerivedGameState, useGameActions, useWeeklySimulation
  - Added comprehensive test suite (42 tests)
  - Maintained 100% backward compatibility
- **Composable Hook Pattern**: When creating complex hooks, follow the established pattern:
  1. Extract concerns into focused sub-hooks (single responsibility)
  2. Use proper memoization (useMemo for values, useCallback for functions)
  3. Create a main orchestrator hook that composes sub-hooks
  4. Maintain backward compatibility in the main hook's API
  5. Write unit tests for each sub-hook + integration test for composition
- **Future Targets**: Consolidating news generation modules
- **Caution Areas**: SaveService migrations, match simulation, contract system, season transitions
