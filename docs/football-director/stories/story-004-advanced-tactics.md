# Story 004: Advanced Tactics System - Brownfield Addition

**Status**: ✅ COMPLETE
**Priority**: High
**Complexity**: Medium-High
**Estimated Duration**: 2 weeks (Weeks 4-5)
**Assigned To**: Dev Agent (James)
**Created**: 2025-12-25
**Completed**: 2025-12-25
**Sprint**: Hybrid Approach - Weeks 4-5
**Dependencies**: Story 001 (Refactored hooks), Story 002 (Cup Competitions), Story 003 (Testing Foundation)

---

## ✅ IMPLEMENTATION COMPLETE (2025-12-25)

**Implementation Summary:**
- ✅ All engine logic (types, TacticsManager class, modifiers, AI generation)
- ✅ Match simulator integration (roles, instructions, set pieces all working)
- ✅ TacticsManager.tsx UI component (fully built)
- ✅ UI Integration via Squad page (Story 004b)
- ✅ Unit tests and documentation
- ✅ User accessible from `/squad` page via "Change Tactics" button

**Resolution:**
Story 004b completed the UI integration by adding TacticsManager modal to Squad page. Users can now access all advanced tactics features (formation, mentality, player roles, team instructions, set pieces) from the Squad management screen.

---

## User Story

As a **Football Director player**,
I want **advanced tactical controls including player roles, team instructions, and set piece assignments**,
So that **I can implement sophisticated match strategies, counter opponent tactics, and have deeper tactical gameplay**.

---

## Story Context

**Existing System Integration:**

- Integrates with: Existing tactics system (formation + mentality)
- Technology: TypeScript engine library (`football-director-engine`) + React UI components
- Follows pattern: TacticsManager class for logic, TacticsManager.tsx for UI
- Touch points: `types.ts` (Tactics interface), `tactics-manager.ts`, `match-simulator.ts`, `TacticsManager.tsx`

**Current Baseline:**
- Tactics interface has 2 fields: `formation` (6 types) and `mentality` (3 types)
- TacticsManager provides simple tactical modifiers (0.8x to 1.2x) based on formation counters
- Match simulator applies tactical modifiers to goal probability
- UI allows selecting formation and mentality only
- No player-specific roles or team-wide instructions

**Enhancement Scope:**
This story extends the existing simple tactics system with three new layers of depth:
1. **Player Roles** - Position-specific tactical roles (e.g., Wing Back vs Full Back)
2. **Team Instructions** - Match-wide tactical settings (tempo, width, pressing, passing)
3. **Set Pieces** - Designated players for corners, free kicks, penalties

---

## Acceptance Criteria

### Functional Requirements

1. **Player Roles System**
   - Each position (DEF, MID, FWD) has 2-3 role options with distinct characteristics
   - Roles affect match simulation (e.g., Wing Back increases attack, Full Back increases defense)
   - Player roles can be assigned in tactics screen
   - AI teams use varied roles (not all default)

2. **Team Instructions**
   - Four instruction categories: Tempo, Width, Pressing, Passing Style
   - Each category has 2-3 options (e.g., Tempo: Slow / Balanced / Fast)
   - Instructions affect match simulation measurably (goal probability, possession, events)
   - Instructions saved with tactics and persist across sessions

3. **Set Piece Assignments**
   - Designate corner taker (player with best relevant attributes)
   - Designate free kick taker
   - Designate penalty taker
   - Assignments used in match simulation for set piece events
   - UI shows player skills to help with selection

### Integration Requirements

4. Existing tactical modifiers (formation counters, mentality) continue to work unchanged
5. New tactical features follow existing `TacticsManager` class pattern
6. Match simulator integrates new modifiers without breaking existing match logic
7. Tactics save/load works with new fields (backward compatible with old saves)
8. UI maintains existing design patterns and mobile responsiveness

### Quality Requirements

9. All new engine code covered by unit tests (80%+ coverage target)
10. Documentation updated (architecture.md, source-tree.md, types documented)
11. No regressions in existing functionality verified through test suite

---

## Technical Notes

**Integration Approach:**

1. **Type Extensions** (types.ts):
   - Extend `Tactics` interface with new fields (roles, instructions, setPieces)
   - Define new types: `PlayerRole`, `TeamInstructions`, `SetPieceAssignments`
   - Make new fields optional for backward compatibility

2. **Engine Logic** (tactics-manager.ts):
   - Add methods: `calculateRoleModifier()`, `calculateInstructionsModifier()`
   - Add helper: `getAvailableRoles(position)`, `getDefaultInstructions()`
   - Integrate with existing `calculateTacticalModifier()`

3. **Match Simulation** (match-simulator.ts):
   - Apply role modifiers to player performance during match events
   - Apply team instructions to overall match flow (goal rate, possession split)
   - Use set piece assignments when generating corner/FK/penalty events

4. **UI Component** (TacticsManager.tsx):
   - Add "Advanced" tab or expandable section for new controls
   - Role selection dropdowns per position
   - Team instructions toggle/radio buttons
   - Set piece assignment dropdowns with player skill display

**Existing Pattern Reference:**
- TacticsManager class methods (see `getFormationRequirements()`, `calculateTacticalModifier()`)
- Match simulator morale modifier pattern (see Story 003 tests)
- Cup competition type extension pattern (see Story 002 CupResult extending MatchResult)

**Key Constraints:**
- Must maintain backward compatibility with existing saves (optional fields)
- Must not break existing tactical modifiers (additive, not replacing)
- Performance impact should be minimal (<50ms additional per match simulation)
- UI must remain mobile-friendly and not overwhelm casual players

---

## Definition of Done

- [x] **Type Definitions Created**
  - PlayerRole types defined for each position
  - TeamInstructions interface with 4 categories
  - SetPieceAssignments interface
  - Tactics interface extended with new optional fields

- [x] **Engine Logic Implemented**
  - TacticsManager methods for role/instruction modifiers
  - Match simulator applies player role modifiers
  - Match simulator applies team instruction modifiers
  - Set piece events use designated players
  - AI teams generate varied tactics (not all default)

- [x] **UI Component Enhanced**
  - [x] Advanced tactics section added to TacticsManager.tsx
  - [x] Player role selection per position
  - [x] Team instructions controls
  - [x] Set piece assignment dropdowns
  - [x] Mobile-responsive design maintained
  - [x] **INTEGRATED** - Component accessible from Squad page (Story 004b)

- [x] **Testing Complete**
  - Unit tests for new TacticsManager methods (80%+ coverage)
  - Unit tests for role/instruction modifiers in match simulator
  - Integration test: full match with advanced tactics applied
  - Regression test: existing tactics still work
  - Manual testing: AI uses varied tactics

- [x] **Quality Gates**
  - No TypeScript errors
  - No ESLint warnings (new code)
  - Backward compatibility verified (old saves load correctly)
  - Documentation updated (architecture, source tree, inline JSDoc)
  - Code follows existing patterns and standards

---

## Minimal Risk Assessment

**Primary Risk:**
Complexity in match simulator integration could lead to bugs or unbalanced gameplay (e.g., one tactic dominates all others).

**Mitigation:**
- Start with conservative modifiers (±5-10% impact, not ±50%)
- Use existing tactical modifier as template (proven pattern)
- Comprehensive unit tests with varied tactical combinations
- Statistical testing (100+ simulated matches to verify balance)
- Easy to tune modifier values post-implementation

**Rollback:**
If advanced tactics cause issues:
- Make new Tactics fields optional (already planned)
- Default to `undefined` for new fields = existing behavior
- Can disable feature in UI while keeping type definitions
- No database migration needed (localStorage is flexible)

---

## Compatibility Verification

- [x] No breaking changes to existing Tactics interface (new fields are optional)
- [x] Database changes are additive only (new optional fields in Tactics object)
- [x] UI changes follow existing TacticsManager.tsx patterns (modal, Tailwind, dark mode)
- [x] Performance impact is negligible (simple calculations, no API calls)

---

## Scope Validation

- [x] Can be completed in 2-week development period (Week 4-5 estimate)
- [x] Integration approach is straightforward (extends existing pattern)
- [x] Follows existing TacticsManager pattern exactly
- [x] No design or architecture work required (brownfield enhancement)

---

## Clarity Check

- [x] Requirements are unambiguous (specific roles, instructions, assignments listed)
- [x] Integration points clearly specified (4 files to modify)
- [x] Success criteria are testable (unit tests, integration tests, manual checks)
- [x] Rollback approach is simple (optional fields default to undefined)

---

## Technical Approach

### Phase 1: Type Definitions & Planning (Day 1)

**Morning: Type System Design**
- Define `PlayerRole` types for each position:
  - DEF: 'full-back' | 'wing-back' | 'ball-playing-defender'
  - MID: 'defensive-midfielder' | 'box-to-box' | 'attacking-midfielder'
  - FWD: 'target-man' | 'poacher' | 'false-nine'
- Define `TeamInstructions` interface:
  ```typescript
  interface TeamInstructions {
    tempo: 'slow' | 'balanced' | 'fast';
    width: 'narrow' | 'balanced' | 'wide';
    pressing: 'low' | 'medium' | 'high';
    passingStyle: 'short' | 'mixed' | 'long';
  }
  ```
- Define `SetPieceAssignments`:
  ```typescript
  interface SetPieceAssignments {
    cornerTaker?: string; // playerId
    freeKickTaker?: string;
    penaltyTaker?: string;
  }
  ```
- Extend `Tactics` interface with optional fields for backward compatibility

**Afternoon: Modifier Design**
- Document role impact on match simulation (e.g., wing-back +10% attack, -5% defense)
- Document instruction impact (e.g., high pressing +15% turnovers, -10% stamina)
- Plan integration points in match simulator
- Write ADR (Architecture Decision Record) for modifier values

---

### Phase 2: Engine Implementation (Days 2-4)

**Day 2 Morning: TacticsManager Extensions**
- Add `getAvailableRoles(position)` method
- Add `getDefaultInstructions()` method
- Add `getRoleDescription(role)` method
- Add `getInstructionDescription(category, value)` method
- Add `calculateRoleModifier(role, context)` method

**Day 2 Afternoon: Role Modifiers**
- Implement role-based modifiers for each position
- Test role modifiers in isolation
- Write unit tests for role selection logic
- Verify role modifiers are balanced (no one role dominates)

**Day 3 Morning: Instruction Modifiers**
- Implement `calculateInstructionsModifier(instructions)`
- Tempo affects goal frequency and match pace
- Width affects wing vs center play distribution
- Pressing affects turnover rate and defensive positioning
- Passing style affects possession and chance creation

**Day 3 Afternoon: Set Piece Logic**
- Extend match simulator to use set piece assignments
- Corner events use designated corner taker's skill
- Free kick events use designated FK taker's skill
- Penalty events use designated penalty taker's skill
- Fallback to best available player if no assignment

**Day 4: Match Simulator Integration**
- Integrate role modifiers into match event generation
- Integrate instruction modifiers into goal probability calculation
- Ensure existing tactical modifiers still apply (additive approach)
- Test combined effect of all tactical systems
- Write integration tests for complex tactical scenarios

---

### Phase 3: AI Tactics Generation (Day 5)

**Morning: AI Variety**
- Update team generation to assign varied roles
- Generate realistic team instructions based on team style
- Assign set piece takers based on player skills
- Ensure AI tactics make logical sense (e.g., attacking teams use high pressing)

**Afternoon: Testing AI Tactics**
- Simulate 100 matches with varied AI tactics
- Verify no single tactic combination is overpowered
- Check statistical distribution of results is realistic
- Adjust modifiers if needed for balance
- Write tests for AI tactics generation

---

### Phase 4: UI Implementation (Days 6-7)

**Day 6 Morning: Tactics UI Layout**
- Add "Advanced Tactics" expandable section to TacticsManager.tsx
- Design layout for role selection (one dropdown per position group)
- Design layout for team instructions (4 categories with radio buttons)
- Design layout for set piece assignments (3 dropdowns with player previews)
- Maintain mobile responsiveness

**Day 6 Afternoon: Role Selection Component**
- Implement role selection dropdowns
- Show role descriptions on hover/select
- Highlight current roles
- Save role selections to tactics state

**Day 7 Morning: Instructions & Set Pieces**
- Implement team instructions controls
- Implement set piece assignment dropdowns
- Show player skills in dropdown (e.g., "Messi (Skill: 18)")
- Add tooltips explaining each instruction

**Day 7 Afternoon: UI Polish**
- Add visual preview of tactics impact
- Test mobile layout (ensure all controls accessible)
- Test dark mode compatibility
- Add keyboard navigation support
- Write interaction tests

---

### Phase 5: Testing & Documentation (Days 8-10)

**Day 8: Comprehensive Testing**
- Run all existing tests (verify no regressions)
- Write unit tests for all new TacticsManager methods
- Write unit tests for new match simulator modifiers
- Write integration test: match with full advanced tactics
- Achieve 80%+ coverage for new code

**Day 9: Balance Testing**
- Simulate 1000 matches with random tactics combinations
- Analyze win rate distributions (should be ~33% win / 33% draw / 33% lose)
- Identify any overpowered combinations
- Tune modifiers if needed
- Document final modifier values

**Day 10: Documentation & Polish**
- Update `docs/football-director/architecture.md` with advanced tactics system
- Update `docs/football-director/source-tree.md` with new types
- Add JSDoc comments to all new methods
- Create user guide section in architecture doc
- Final code review and cleanup
- Mark story complete

---

## Testing Strategy

### Unit Tests

**TacticsManager Tests** (`tactics-manager.spec.ts`):
```typescript
describe('TacticsManager - Advanced Tactics', () => {
  describe('getAvailableRoles', () => {
    it('should return correct roles for each position');
    it('should handle invalid position gracefully');
  });

  describe('calculateRoleModifier', () => {
    it('should apply wing-back offensive bonus');
    it('should apply full-back defensive bonus');
    it('should apply attacking midfielder creativity bonus');
    // ... more role tests
  });

  describe('calculateInstructionsModifier', () => {
    it('should increase goals with fast tempo');
    it('should increase possession with slow tempo');
    it('should increase wing play with wide instruction');
    it('should increase turnovers with high pressing');
    // ... more instruction tests
  });

  describe('setpiece assignments', () => {
    it('should use designated penalty taker for penalties');
    it('should fall back to best player if no assignment');
  });
});
```

**Match Simulator Tests** (`match-simulator.spec.ts`):
```typescript
describe('MatchSimulator - Advanced Tactics', () => {
  it('should apply role modifiers to match events');
  it('should apply instruction modifiers to goal probability');
  it('should use set piece takers for set piece events');

  it('should combine all tactical modifiers correctly', () => {
    // Test formation + mentality + roles + instructions together
    // Verify modifiers stack appropriately (not multiplicative to avoid extremes)
  });

  it('should maintain realistic score ranges with advanced tactics', () => {
    // Run 100 simulations, verify scores stay 0-7 range typically
  });
});
```

### Integration Tests

**Full Tactics Integration** (`advanced-tactics-integration.spec.ts`):
```typescript
describe('Advanced Tactics Integration', () => {
  it('should simulate match with full advanced tactics', () => {
    const tactics: Tactics = {
      formation: '4-3-3',
      mentality: 'attacking',
      roles: {
        defenders: 'wing-back',
        midfielders: 'box-to-box',
        forwards: 'poacher',
      },
      instructions: {
        tempo: 'fast',
        width: 'wide',
        pressing: 'high',
        passingStyle: 'mixed',
      },
      setPieces: {
        cornerTaker: 'player1',
        freeKickTaker: 'player2',
        penaltyTaker: 'player3',
      },
    };

    const result = simulator.simulateMatch(homeTeam, awayTeam, 1, false);
    expect(result).toBeDefined();
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('should save and load advanced tactics', () => {
    // Test backward compatibility
  });
});
```

### Balance Testing

**Statistical Balance** (`tactics-balance.spec.ts`):
```typescript
describe('Tactics Balance', () => {
  it('should not allow one tactic to dominate', () => {
    const iterations = 1000;
    const results = {
      'high-press-wins': 0,
      'low-press-wins': 0,
      // ... test various combinations
    };

    for (let i = 0; i < iterations; i++) {
      // Simulate matches with different tactics
    }

    // Verify reasonable distribution (no tactic wins >60% of time)
    expect(results['high-press-wins'] / iterations).toBeLessThan(0.6);
  });
});
```

---

## Success Metrics

**Functionality**:
- ✅ All player roles implemented and affect matches
- ✅ All team instructions implemented and affect matches
- ✅ Set piece assignments work correctly
- ✅ AI uses varied tactics (not all default)
- ✅ Tactics save/load with new fields

**Code Quality**:
- ✅ 80%+ test coverage for new code
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Backward compatible with existing saves
- ✅ Performance <50ms additional per match

**User Experience**:
- ✅ UI is intuitive and not overwhelming
- ✅ Mobile-responsive design maintained
- ✅ Dark mode compatible
- ✅ Role/instruction descriptions clear
- ✅ Set piece selection shows player skills

**Balance**:
- ✅ No single tactic dominates (verified via 1000-match simulation)
- ✅ All tactics feel impactful but not overpowered
- ✅ Modifiers stack appropriately (additive, not multiplicative)
- ✅ Match outcomes remain realistic

---

## Related Documents

- **Story 001**: `/docs/football-director/stories/story-001-refactor-usegamestate.md` - Hook architecture
- **Story 002**: `/docs/football-director/stories/story-002-cup-competitions.md` - Type extension pattern
- **Story 003**: `/docs/football-director/stories/story-003-testing-foundation.md` - Testing patterns
- **Hybrid Sprint Plan**: `/docs/football-director/hybrid-sprint-plan.md` - Week 4-5 schedule
- **Architecture**: `/docs/football-director/architecture.md` - System overview
- **Tech Stack**: `/docs/football-director/tech-stack.md` - Technology details
- **Tactics Manager**: `/libs/football-director-engine/src/lib/tactics-manager.ts` - Existing logic
- **Types**: `/libs/football-director-engine/src/lib/types.ts` - Type definitions

---

**This story adds significant tactical depth to the game while maintaining simplicity for casual players through sensible defaults and an intuitive UI.** ⚽🎯

---

## Dev Agent Notes

**Ready to Implement**: Yes - Clear requirements, existing patterns to follow, well-scoped

**Key Implementation Tips**:
1. Start conservative with modifiers (±5-10%, not ±50%)
2. Make ALL new Tactics fields optional for backward compatibility
3. Use existing `calculateTacticalModifier()` as template for new modifiers
4. Test balance early and often (100-match simulations)
5. Follow CupResult pattern for type extensions (Story 002 reference)
6. Use TacticsManager.tsx existing modal pattern for UI

**If You Get Stuck**:
- Modifier balance: Start small (±5%), iterate based on testing
- UI complexity: Use expandable/collapsible sections to avoid overwhelming users
- Performance: Profile with 100-match simulation, optimize if >50ms per match
- Testing: Use statistical testing pattern from Story 003 (match simulator tests)

**Priority Order**:
1. Type definitions (foundation for everything)
2. Role modifiers (simplest, most impactful)
3. Instruction modifiers (next layer of depth)
4. Set pieces (nice-to-have, easiest to implement)
5. AI variety (important for replayability)
6. UI (last, after engine logic proven)
