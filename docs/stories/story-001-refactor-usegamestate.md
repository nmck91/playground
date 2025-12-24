# Story 001: Refactor useGameState into Composable Hooks

**Status**: Ready for Development
**Priority**: High
**Complexity**: Medium
**Estimated Duration**: 3-5 days
**Assigned To**: Dev Agent
**Created**: 2025-12-24
**Sprint**: Hybrid Approach - Week 1-2

---

## Story Description

Refactor the massive `useGameState` hook (1,220 lines) into smaller, composable hooks that are easier to maintain, test, and understand. This refactoring will maintain 100% backward compatibility while improving code organization and testability.

---

## Business Value

**Why This Matters**:
- **Maintainability**: Easier for AI agents to modify specific functionality
- **Testability**: Can test individual hooks in isolation
- **Debugging**: Clearer separation of concerns makes issues easier to locate
- **Future Development**: Simplified hook structure enables faster feature development
- **Code Quality**: Follows React best practices and separation of concerns

---

## Current State Analysis

**Problem**:
- `apps/football-director/src/hooks/useGameState.ts` is 1,220 lines
- Single responsibility principle violated
- Difficult to test individual features
- Hard to understand the full simulation flow
- Multiple useState hooks managing different concerns

**Current Responsibilities** (too many):
1. Game state loading/saving
2. Weekly simulation orchestration
3. Player/transfer actions
4. Staff management
5. Tactics management
6. Save slot management
7. UI state management (modals, highlights)
8. Achievement tracking
9. News management
10. Youth academy selection

---

## Target Architecture

### New Hook Structure

```
hooks/
├── useGameState.ts              # Main orchestrator (simplified, ~200 lines)
├── useGamePersistence.ts        # Save/load logic (~150 lines)
├── useWeeklySimulation.ts       # Weekly simulation orchestration (~400 lines)
├── useGameActions.ts            # User actions (buy, sell, hire, etc.) (~300 lines)
├── useDerivedGameState.ts       # Computed values (~100 lines)
└── useModalState.ts             # UI modal management (~70 lines)
```

### Responsibility Distribution

**useGameState** (Main Orchestrator):
- Composes all other hooks
- Exposes unified API
- Maintains backward compatibility
- Returns same interface as current hook

**useGamePersistence**:
- Load game on mount
- Auto-save on state changes
- Multi-slot save operations
- Import/export functionality

**useWeeklySimulation**:
- Orchestrate weekly simulation
- Coordinate all engine modules
- Process injuries, morale, contracts
- Generate match results
- Handle end-of-season logic

**useGameActions**:
- Player transfer actions (buy/sell)
- Staff management (hire/fire)
- Tactics updates
- Contract offers
- Youth academy selection
- Continue to next season

**useDerivedGameState**:
- Calculate top performers
- Determine season status
- Compute derived metrics
- Memoized calculations

**useModalState**:
- Manage modal visibility
- Track pending UI notifications
- Handle achievement toasts
- Development reports visibility

---

## Acceptance Criteria

### Must Have

✅ **AC1: Backward Compatibility**
- `useGameState` returns exact same interface as current implementation
- All existing components work without modification
- No breaking changes to return values or action signatures

✅ **AC2: Functionality Preserved**
- All game features work identically to current implementation
- Weekly simulation produces same results
- Save/load works correctly
- All user actions function properly

✅ **AC3: Code Organization**
- `useGameState.ts` reduced to ~200 lines (orchestrator only)
- Each new hook has single, clear responsibility
- All hooks properly typed with TypeScript
- Clear JSDoc comments for each hook

✅ **AC4: Testing Foundation**
- Unit tests for `useGamePersistence`
- Unit tests for `useDerivedGameState`
- Mock-based tests for `useWeeklySimulation`
- Integration test for composed `useGameState`

✅ **AC5: No Regressions**
- Existing game saves load correctly
- Weekly simulation completes without errors
- All existing UI components render properly
- No console errors or warnings

### Should Have

⭐ **AC6: Performance**
- No performance degradation
- Proper memoization of expensive calculations
- React DevTools Profiler shows no new re-renders

⭐ **AC7: Documentation**
- Each hook has clear JSDoc with examples
- Architecture decision documented
- Migration guide for future hook modifications

### Could Have

💡 **AC8: Dev Experience**
- React DevTools shows clear hook hierarchy
- Helpful error messages if hooks misused
- TypeScript autocomplete works well

---

## Technical Approach

### Phase 1: Extract UI State (Day 1)

**Create `useModalState.ts`**:
```typescript
export function useModalState() {
  const [showHighlights, setShowHighlights] = useState(false);
  const [showDevelopment, setShowDevelopment] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showTrophyCabinet, setShowTrophyCabinet] = useState(false);
  const [showNewsFeed, setShowNewsFeed] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  return {
    modals: {
      showHighlights, setShowHighlights,
      showDevelopment, setShowDevelopment,
      showEvaluation, setShowEvaluation,
      showPlayerStats, setShowPlayerStats,
      showRecords, setShowRecords,
      showTrophyCabinet, setShowTrophyCabinet,
      showNewsFeed, setShowNewsFeed,
      showMoreMenu, setShowMoreMenu,
      showDeleteConfirm, setShowDeleteConfirm,
    },
    selectedPlayer,
    setSelectedPlayer,
  };
}
```

**Update `useGameState.ts`**: Replace modal useState declarations with `useModalState()`

**Test**: Verify modals still open/close correctly

---

### Phase 2: Extract Persistence (Day 2)

**Create `useGamePersistence.ts`**:
```typescript
export function useGamePersistence(gameState: GameState | null) {
  // Load game on mount
  useEffect(() => {
    const savedGame = SaveService.loadGame();
    if (savedGame) {
      setGameState(savedGame);
    }
  }, []);

  // Auto-save when game state changes
  useEffect(() => {
    if (gameState && !loading) {
      SaveService.saveGame(gameState);
    }
  }, [gameState, loading]);

  return {
    loadSlot: (slotId: number) => { /* ... */ },
    deleteSave: () => { /* ... */ },
    // ... other save operations
  };
}
```

**Test**: Create unit tests for save/load operations with mock localStorage

---

### Phase 3: Extract Derived State (Day 2)

**Create `useDerivedGameState.ts`**:
```typescript
export function useDerivedGameState(gameState: GameState | null, loading: boolean) {
  const seasonTopPerformers = useMemo(() => {
    if (!gameState || loading) return null;
    const statsTracker = new PlayerStatsTracker();
    return statsTracker.getTopPerformers(gameState.playerTeam);
  }, [gameState?.playerTeam.players, loading]);

  const hasSave = !!gameState;

  return {
    seasonTopPerformers,
    hasSave,
    // ... other derived values
  };
}
```

**Test**: Verify calculations are correct and properly memoized

---

### Phase 4: Extract Actions (Day 3)

**Create `useGameActions.ts`**:
```typescript
export function useGameActions(
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  setError: (error: string | null) => void
) {
  const buyPlayer = useCallback((listing: TransferListing) => {
    // Move buyPlayer logic here
  }, [gameState]);

  const sellPlayer = useCallback((player: Player, price: number) => {
    // Move sellPlayer logic here
  }, [gameState]);

  // ... all other action functions

  return {
    buyPlayer,
    sellPlayer,
    hireStaff,
    fireStaff,
    setTeamTactics,
    setClubPhilosophy,
    offerContract,
    selectYouthPlayers,
    markAllNewsRead,
    continueToNextSeason,
  };
}
```

**Test**: Mock gameState and test each action independently

---

### Phase 5: Extract Weekly Simulation (Day 4)

**Create `useWeeklySimulation.ts`**:
```typescript
export function useWeeklySimulation(
  gameState: GameState | null,
  setGameState: (state: GameState) => void,
  setLastSimulationResults: (results: MatchResult[]) => void,
  setDevelopmentReports: (reports: DevelopmentReport[]) => void,
  setSeasonEvaluation: (evaluation: any) => void,
  setPendingAchievements: (achievements: Achievement[]) => void,
  setYouthProspects: (prospects: Player[]) => void,
  setError: (error: string | null) => void
) {
  const simulateNextWeek = useCallback(() => {
    // Move massive simulation logic here
    // Keep exact same logic, just in dedicated hook
  }, [gameState, /* ... */]);

  return {
    simulateNextWeek,
  };
}
```

**Test**: Integration test with mock game state, verify weekly progression

---

### Phase 6: Compose Final Hook (Day 5)

**Refactor `useGameState.ts`**:
```typescript
export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSimulationResults, setLastSimulationResults] = useState<MatchResult[]>([]);
  const [developmentReports, setDevelopmentReports] = useState<DevelopmentReport[]>([]);
  const [seasonEvaluation, setSeasonEvaluation] = useState<any>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [youthProspects, setYouthProspects] = useState<Player[]>([]);

  // Compose other hooks
  const modalState = useModalState();
  const persistence = useGamePersistence(gameState);
  const derived = useDerivedGameState(gameState, loading);
  const actions = useGameActions(gameState, setGameState, setError);
  const simulation = useWeeklySimulation(
    gameState, setGameState, setLastSimulationResults,
    setDevelopmentReports, setSeasonEvaluation,
    setPendingAchievements, setYouthProspects, setError
  );

  // Return unified interface (SAME AS BEFORE)
  return {
    gameState,
    loading,
    error,
    lastSimulationResults,
    developmentReports,
    seasonTopPerformers: derived.seasonTopPerformers,
    seasonEvaluation,
    pendingAchievements,
    youthProspects,
    hasSave: derived.hasSave,
    actions: {
      newGame: persistence.newGame,
      loadSlot: persistence.loadSlot,
      simulateNextWeek: simulation.simulateNextWeek,
      ...actions,
    },
  };
}
```

**Test**: Full integration test - load game, simulate week, perform actions

---

## Testing Strategy

### Unit Tests (New Files)

**`useGamePersistence.test.ts`**:
- ✅ Loads game from localStorage on mount
- ✅ Auto-saves when game state changes
- ✅ Handles missing save gracefully
- ✅ Multi-slot operations work correctly
- ✅ Migration logic runs for old saves

**`useDerivedGameState.test.ts`**:
- ✅ Calculates top performers correctly
- ✅ Memoization prevents unnecessary recalculations
- ✅ Returns null when no game state
- ✅ Handles edge cases (empty player list)

**`useModalState.test.ts`**:
- ✅ All modal states initialize correctly
- ✅ Toggle functions work
- ✅ Selected player state updates

**`useGameActions.test.ts`**:
- ✅ Buy player validates budget
- ✅ Sell player updates state correctly
- ✅ Hire staff validates conditions
- ✅ Contract offers calculate demands
- ✅ Error handling works

**`useWeeklySimulation.test.ts`**:
- ✅ Simulates week correctly
- ✅ Processes all engine modules in order
- ✅ Handles end of season
- ✅ Generates news articles
- ✅ Updates all state correctly

### Integration Tests

**`useGameState.integration.test.ts`**:
- ✅ Full game flow: new game → simulate weeks → save → load
- ✅ All actions work with composed hook
- ✅ Backward compatibility maintained

---

## Definition of Done

- [ ] All 6 hooks created and properly exported
- [ ] `useGameState.ts` reduced to ~200 lines (orchestrator only)
- [ ] All unit tests passing (minimum 80% coverage for new hooks)
- [ ] Integration test passing
- [ ] No regressions in existing functionality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Existing game saves load correctly
- [ ] Documentation updated (JSDoc for each hook)
- [ ] Code reviewed (can be AI-assisted)
- [ ] Performance verified (React Profiler shows no degradation)

---

## Dependencies

**Required Before Starting**:
- Architecture documentation complete ✅
- Understanding of current useGameState flow ✅

**Blockers**:
- None

---

## Risks and Mitigation

**Risk 1: Breaking Existing Functionality**
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Comprehensive testing at each phase
  - Keep original useGameState as backup during refactor
  - Test with actual saved games

**Risk 2: Performance Regression**
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Use React Profiler before and after
  - Proper memoization with useMemo/useCallback
  - Monitor re-render counts

**Risk 3: Complex State Dependencies**
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Careful analysis of state dependencies
  - Clear documentation of data flow
  - Gradual extraction (one hook at a time)

---

## Success Metrics

**Code Quality**:
- Lines of code: 1,220 → ~1,220 (distributed across 6 files)
- Cyclomatic complexity: High → Low (per file)
- Test coverage: ~0% → 80%+

**Maintainability**:
- Time to understand hook: 30 min → 5 min (per hook)
- Time to add feature: Baseline → 20% faster
- Bug surface area: High → Low (isolated concerns)

**Developer Experience**:
- Clear separation of concerns
- Easier to test
- Better TypeScript autocomplete
- Clearer error messages

---

## Notes for Dev Agent

**Important Context**:
- This is a refactoring story - NO new features
- Goal is 100% functional equivalence
- Take your time with testing - this is foundation work
- Use React Testing Library for hook tests
- Consider using `@testing-library/react-hooks` for isolated hook testing

**Implementation Order is Critical**:
1. Start with simplest (UI state)
2. Progress to more complex (simulation)
3. Compose at the end
4. Test thoroughly at each step

**If You Get Stuck**:
- Compare before/after behavior carefully
- Use console.log to trace data flow
- Test with actual game saves, not just mocks
- Break down further if any hook is still too complex

---

## Related Documents

- Architecture: `/docs/football-director-architecture.md`
- Current Hook: `/apps/football-director/src/hooks/useGameState.ts`
- Engine Types: `/libs/football-director-engine/src/lib/types.ts`
- Save Service: `/apps/football-director/src/services/SaveService.ts`

---

**Ready to implement!** This story provides the foundation for cleaner, more maintainable code and easier future development.
