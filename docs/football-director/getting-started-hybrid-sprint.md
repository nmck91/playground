# Getting Started - Hybrid Sprint

**Welcome to Phase 4!** This guide will help you start the 6-week hybrid approach sprint.

---

## 📋 Pre-Flight Checklist

Before starting development, ensure you have:

- ✅ **Architecture Documentation**: `docs/football-director-architecture.md`
- ✅ **Sprint Plan**: `docs/HYBRID-SPRINT-PLAN.md`
- ✅ **First Story**: `docs/stories/story-001-refactor-usegamestate.md`
- ✅ **Roadmap Updated**: `apps/football-director/ROADMAP.md` (Phase 4 marked)
- ✅ **Development Environment**: Working and tested

---

## 🚀 Quick Start (Next 5 Minutes)

### Step 1: Review the First Story

```bash
# Read the story document
cat docs/stories/story-001-refactor-usegamestate.md
```

**Key sections to understand**:
- **Story Description**: What we're doing and why
- **Target Architecture**: How we'll split the hook
- **Acceptance Criteria**: How we know it's done
- **Technical Approach**: Step-by-step phases

---

### Step 2: Start Development with Dev Agent

Open the project in your IDE and invoke the Dev Agent:

```bash
# From your terminal or IDE
/dev develop-story docs/stories/story-001-refactor-usegamestate.md
```

The Dev Agent will:
1. Read and understand the story
2. Load the architecture documentation
3. Begin implementing Phase 1 (Extract UI State)
4. Write tests as it goes
5. Update the story checklist

---

### Step 3: Monitor Progress

The Dev Agent will update the story file with:
- ✅ Completed checklist items
- 📝 Debug log entries (if issues arise)
- 💡 Completion notes
- 📄 File list (what was modified)

**Check progress**:
```bash
# View the story file
cat docs/stories/story-001-refactor-usegamestate.md

# Or open in your editor and watch it update
```

---

## 📚 What's Been Prepared

### Documentation Created

1. **Architecture Document** (`docs/football-director-architecture.md`)
   - Complete codebase overview
   - 1,220-line useGameState identified as technical debt
   - AI-optimized for agent understanding

2. **Sprint Plan** (`docs/HYBRID-SPRINT-PLAN.md`)
   - 6-week schedule
   - Quality gates for every story
   - Risk management
   - Success metrics

3. **Story 001** (`docs/stories/story-001-refactor-usegamestate.md`)
   - Detailed refactoring plan
   - 6 phases over 5 days
   - Testing strategy
   - Success criteria

4. **Updated Roadmap** (`apps/football-director/ROADMAP.md`)
   - Phase 3 marked complete ✅
   - Phase 4 Hybrid Approach in progress 🔄

---

## 🎯 First Sprint Goals (Week 1-2)

### Week 1: Refactoring (Days 1-3)

**Goal**: Break 1,220-line hook into 6 composable hooks

**What Gets Done**:
- ✅ `useModalState.ts` (Day 1)
- ✅ `useGamePersistence.ts` (Day 2)
- ✅ `useDerivedGameState.ts` (Day 2)
- ✅ `useGameActions.ts` (Day 3)
- ✅ `useWeeklySimulation.ts` (Day 4)
- ✅ Composed `useGameState.ts` (Day 5)
- ✅ Unit tests for each hook
- ✅ Integration test for composed hook

**Success Metric**: Same functionality, better organization, 80%+ test coverage

---

### Week 2: Cup Competitions (Days 4-10)

**Goal**: Add knockout tournament competition

**What Gets Done**:
- ✅ Knockout tournament system in engine
- ✅ Random draw generation
- ✅ Extra time & penalties
- ✅ Cup fixtures integration
- ✅ Trophy for winner
- ✅ Prize money system
- ✅ UI for cup page
- ✅ Tests for cup logic

**Success Metric**: Playable FA Cup-style competition with AI teams

---

## 🔧 Development Workflow

### Daily Cycle

**Morning** (Planning):
1. Review yesterday's progress
2. Check story checklist
3. Identify today's tasks
4. Start Dev Agent if needed

**During Development**:
1. Dev Agent implements features
2. Writes tests alongside code
3. Updates story file with progress
4. Logs issues in Debug Log

**Evening** (Review):
1. Review completed work
2. Run manual tests
3. Check test coverage
4. Update sprint plan if needed

---

### Working with Dev Agent

**Start Development**:
```bash
/dev develop-story docs/stories/story-001-refactor-usegamestate.md
```

**Check on Progress**:
- Story file updates automatically
- Check `Debug Log` section for issues
- Review `File List` for what changed

**When Story Completes**:
- Status changes to "Ready for Review"
- Review all changes
- Run full test suite
- Manually test features
- Mark story complete if satisfied

---

## 🧪 Testing Strategy

### Running Tests

```bash
# Run all tests
nx test football-director-engine

# Run with coverage
nx test football-director-engine --coverage

# Run specific test file
nx test football-director-engine --testFile=useGamePersistence.test.ts

# Watch mode
nx test football-director-engine --watch
```

### Manual Testing

After each phase:
1. Start dev server: `nx dev football-director`
2. Create new game
3. Simulate several weeks
4. Test specific features changed
5. Save and reload game
6. Verify no regressions

---

## 📊 Tracking Progress

### Story Status Indicators

- **Ready for Development** ⚪ - Not started
- **In Progress** 🔄 - Dev Agent working
- **Ready for Review** ⏸️ - Awaiting your review
- **Complete** ✅ - Reviewed and accepted
- **Blocked** 🚫 - Waiting for something

### Update Sprint Plan Weekly

At end of each week:
```markdown
## Week 1 Progress (COMPLETED ✅)
- Story 001: Complete ✅
- Story 002: 60% complete 🔄
- Next week: Finish Story 002, start Story 003
```

---

## 🚨 What If Things Go Wrong?

### Dev Agent Gets Stuck

**Symptoms**: Progress stops, lots of errors in Debug Log

**Solutions**:
1. Read Debug Log to understand issue
2. Use `/dev explain` to get detailed explanation
3. Provide clarification or fix blockers
4. Continue with same story

### Tests Failing

**Symptoms**: CI fails, test suite errors

**Solutions**:
1. Review test output carefully
2. Fix issues in implementation
3. Update tests if requirements changed
4. Ask Dev Agent to fix with context

### Functionality Broken

**Symptoms**: Game doesn't work, features regressed

**Solutions**:
1. Roll back to last working commit
2. Review what changed
3. Fix incrementally
4. Add test to prevent regression

---

## 💡 Tips for Success

### Do's ✅

- **Test Early and Often**: Run tests after each phase
- **Small Commits**: Commit after each working phase
- **Document Decisions**: Add notes to story files
- **Stay Focused**: One story at a time
- **Review Thoroughly**: Check all changes before marking complete

### Don'ts ❌

- **Don't Skip Testing**: Tests catch issues early
- **Don't Rush**: Quality over speed
- **Don't Change Scope**: Stick to story acceptance criteria
- **Don't Ignore Warnings**: TypeScript/ESLint warnings matter
- **Don't Break Saves**: Always test save/load compatibility

---

## 📞 Getting Help

### Documentation Resources

- **Architecture Questions**: `docs/football-director-architecture.md`
- **Sprint Questions**: `docs/HYBRID-SPRINT-PLAN.md`
- **Story Questions**: Story file (story-001-*.md)
- **Code Questions**: Inline comments and JSDoc

### Agent Support

```bash
# Ask Dev Agent to explain what it's doing
/dev explain

# Get Architect help with design questions
/architect

# Get QA help with testing strategies
/qa

# Get PM help with prioritization
/pm
```

### Useful Commands

```bash
# Check what's changed
git status
git diff

# View project structure
nx show project football-director

# Lint code
nx lint football-director

# Build for production
nx build football-director

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 🎉 Ready to Start!

You're all set! Here's your immediate next action:

### 👉 Next Command to Run:

```bash
/dev develop-story docs/stories/story-001-refactor-usegamestate.md
```

This will:
1. Start the Dev Agent
2. Load the story
3. Begin Phase 1 (Extract UI State)
4. Create tests as it goes
5. Update story with progress

**Estimated Time**: 3-5 days for Story 001

**What You'll Have**:
- Clean, composable hooks
- Better code organization
- 80%+ test coverage
- Foundation for faster feature development

---

## 📅 Week 1 Milestones

- **Day 3**: UI state extracted, persistence extracted
- **Day 5**: All hooks extracted and tested
- **Day 7**: Integration tests passing
- **End of Week 1**: Story 001 complete ✅

---

**Good luck! Let's build something great! 🚀**

*Remember: This is a marathon, not a sprint. Quality over speed.*
*Focus on one task at a time, test thoroughly, and enjoy the process.*
