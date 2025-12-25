# Hybrid Approach - 6 Week Sprint Plan

**Strategy**: Option C - Balanced technical improvement + feature development
**Start Date**: 2025-12-24
**End Date**: 2026-02-04
**Goal**: Refactor foundation + deliver Cup Competitions + establish quality practices

---

## Sprint Overview

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1-2 | Refactor + Feature Prep | Composable hooks + Cup Competitions implementation |
| 3 | Testing Foundation | Test suite for critical modules |
| 4-5 | Advanced Tactics | Player roles and team instructions |
| 6 | Storage + Polish | Save compression + mobile optimization |

---

## Week 1-2: Foundation + Quick Win

### Days 1-3: Refactor useGameState ⚙️

**Story**: `story-001-refactor-usegamestate.md`

**Tasks**:
- [ ] Day 1: Extract UI state → `useModalState.ts`
- [ ] Day 2: Extract persistence → `useGamePersistence.ts` + derived state → `useDerivedGameState.ts`
- [ ] Day 3: Extract actions → `useGameActions.ts`

**Definition of Done**:
- All new hooks created
- Unit tests for each hook
- No regressions in existing functionality

---

### Days 4-10: Cup Competitions 🏆

**Story**: `story-002-cup-competitions.md` (to be created)

**Features**:
1. Knockout tournament system
2. Random draw generation
3. Extra time & penalties simulation
4. Cup fixture integration
5. Trophy for winner
6. Prize money per round

**Technical Approach**:
- Create `CupManager` in engine library
- Add `cupFixtures` to GameState
- Extend match simulator for knockout rules
- Add cup page to UI

**Definition of Done**:
- 20-team knockout tournament works
- Integrates with season calendar
- Trophy awarded to winner
- AI teams participate
- Tests for cup logic

---

## Week 3: Testing Foundation 🧪

### Test Suite Development

**Story**: `story-003-testing-foundation.md` (to be created)

**Coverage Targets**:

**1. Match Simulator Tests** (Critical):
```typescript
describe('MatchSimulator', () => {
  test('simulates realistic score ranges');
  test('higher skill teams win more often');
  test('generates appropriate match events');
  test('morale affects match outcome');
  test('injuries occur at realistic rates');
  test('suspensions are tracked correctly');
  test('extra time and penalties work');
});
```

**2. Contract Manager Tests** (High Impact):
```typescript
describe('ContractManager', () => {
  test('expires contracts correctly');
  test('creates free agents on expiry');
  test('calculates player demands accurately');
  test('updates contract status weekly');
  test('handles contract offers');
});
```

**3. SaveService Tests** (Data Integrity):
```typescript
describe('SaveService', () => {
  test('saves and loads game correctly');
  test('handles storage quota errors');
  test('migrates old saves');
  test('multi-slot operations work');
  test('optimizes storage correctly');
});
```

**Definition of Done**:
- Minimum 80% coverage for tested modules
- All tests passing
- CI integration (optional)
- Test documentation

---

## Week 4-5: Advanced Tactics ⚽

### Enhanced Tactical System

**Story**: `story-004-advanced-tactics.md` (to be created)

**Features**:

**1. Player Roles**:
- Wing Back vs Full Back
- Attacking Midfielder vs Defensive Midfielder
- Target Man vs Poacher
- Role affects match simulation

**2. Team Instructions**:
- Tempo (slow build-up vs direct)
- Width (narrow vs wide)
- Pressing (high press vs drop deep)
- Passing style (short vs long)

**3. Set Pieces**:
- Designate corner takers
- Free kick specialists
- Penalty taker selection

**Technical Approach**:
- Extend `Tactics` interface in types.ts
- Enhance `TacticsManager`
- Modify match simulator to use instructions
- Create tactics page with advanced controls

**Definition of Done**:
- All tactical options available
- AI uses varied tactics
- Affects match outcomes measurably
- UI is intuitive
- Tested

---

## Week 6: Storage + Polish ✨

### Infrastructure Improvements

**Story**: `story-005-storage-and-polish.md` (to be created)

**Tasks**:

**1. Save Compression** (2 days):
- Implement LZ-string compression
- Reduce save size by 60-70%
- Maintain backward compatibility
- Test with large saves

**2. Mobile Optimization** (2 days):
- Touch gesture improvements
- Performance profiling on mobile
- Optimize bundle size
- PWA install flow testing

**3. Performance Audit** (1 day):
- React Profiler analysis
- Identify unnecessary re-renders
- Optimize expensive calculations
- Lighthouse score improvement

**Definition of Done**:
- Save size reduced significantly
- Mobile experience smooth
- Lighthouse score > 90
- No performance regressions

---

## Quality Gates (All Stories)

### Every Story Must Meet

**Code Quality**:
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Proper JSDoc comments
- [ ] Follows existing patterns

**Testing**:
- [ ] Unit tests for new engine modules
- [ ] Integration tests where applicable
- [ ] No regressions in existing features
- [ ] All tests passing

**Functionality**:
- [ ] Feature works as specified
- [ ] Edge cases handled
- [ ] Error states considered
- [ ] Save/load compatibility maintained

**Documentation**:
- [ ] Story updated with completion notes
- [ ] Code comments for complex logic
- [ ] Architecture docs updated if needed
- [ ] ROADMAP.md updated

**User Experience**:
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Loading states appropriate
- [ ] Error messages helpful

---

## Success Metrics

### Code Health
- **Lines per Hook**: <400 (from 1,220 in single hook)
- **Test Coverage**: 60%+ (from ~20%)
- **TypeScript Strict**: Yes (from Yes, but maintain)
- **Save Size**: -60% (with compression)

### Features
- **Cup Competitions**: Complete
- **Advanced Tactics**: Complete
- **New Trophies**: 1 (FA Cup equivalent)
- **User Engagement**: Higher (new competitive mode)

### Performance
- **Lighthouse Score**: 90+ (from unknown)
- **Save/Load Time**: <500ms (even with compression)
- **Weekly Simulation**: <1s (maintain)
- **Bundle Size**: Track and optimize

---

## Risk Management

### High Risk Items

**1. Refactoring Breaking Changes**
- **Mitigation**: Thorough testing at each phase
- **Contingency**: Keep backup of original hook
- **Monitor**: Test with real saved games

**2. Storage Quota with Cup Data**
- **Mitigation**: Implement compression early
- **Contingency**: More aggressive history pruning
- **Monitor**: Track localStorage usage

**3. Scope Creep**
- **Mitigation**: Strict adherence to story acceptance criteria
- **Contingency**: Move lower priority items to Phase 5
- **Monitor**: Weekly progress reviews

---

## Weekly Checkpoints

### End of Each Week

**Review**:
- [ ] Stories completed vs planned
- [ ] Test coverage current vs target
- [ ] Technical debt added vs removed
- [ ] Blockers identified
- [ ] Next week plan confirmed

**Adjust**:
- Replan if behind schedule
- Identify needed support
- Update ROADMAP.md
- Document learnings

---

## After Sprint (Week 7+)

### Phase 5 Options

**If Ahead of Schedule**:
1. Scouting System (high value)
2. Dashboard Customization
3. More cup competitions (League Cup)

**If On Schedule**:
1. Polish and bug fixes
2. Performance optimization
3. Additional tests

**If Behind**:
1. Complete remaining Week 6 items
2. Stabilize and test
3. Replan Phase 5

---

## Developer Notes

### Working with Dev Agent

When assigning stories to the Dev Agent (`/dev`):

1. **Start Story**:
   ```
   /dev develop-story docs/stories/story-001-refactor-usegamestate.md
   ```

2. **Check Progress**:
   - Review checklist completion in story file
   - Check Debug Log for issues
   - Verify tests passing

3. **Quality Check**:
   - Run `nx lint football-director`
   - Run `nx test football-director-engine`
   - Manual smoke test of features

4. **Story Completion**:
   - Dev Agent marks story "Ready for Review"
   - You review changes
   - Merge if acceptable
   - Move to next story

### Best Practices

- **One Story at a Time**: Don't start story-002 until story-001 is complete
- **Test Early**: Write tests as you go, not at the end
- **Commit Often**: Small commits with clear messages
- **Document Decisions**: Add notes to story files for context
- **Maintain Momentum**: Aim for daily progress, even if small

---

## Sprint Artifacts

### Documents Created
- ✅ `story-001-refactor-usegamestate.md` - Ready
- ⏳ `story-002-cup-competitions.md` - Create before Day 4
- ⏳ `story-003-testing-foundation.md` - Create before Week 3
- ⏳ `story-004-advanced-tactics.md` - Create before Week 4
- ⏳ `story-005-storage-and-polish.md` - Create before Week 6

### Progress Tracking
- Update this document weekly
- Mark completed items with ✅
- Add notes for decisions made
- Track actual vs estimated time

---

## Questions or Issues?

**Getting Stuck?**
- Review architecture documentation
- Check similar existing code
- Ask for clarification before deviating
- Document assumptions

**Need Help Planning?**
- Architect agent (`/architect`) for design questions
- QA agent (`/qa`) for testing strategies
- PM agent (`/pm`) for prioritization decisions

---

**Let's build something great! 🚀**

*Sprint Start*: 2025-12-24
*Next Checkpoint*: 2025-12-31 (End of Week 1)
