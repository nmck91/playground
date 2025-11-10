# Developer Testing Checklist

## Purpose

This checklist ensures complete testing coverage for all story implementations. Use this BEFORE marking any story as "Review" status.

## Required Tests for ALL Stories

### 1. Linting ✅
```bash
npx nx lint <project-name>
```
**Must Pass:** Zero errors, zero warnings

### 2. Unit Tests (if applicable)
```bash
npx nx test <project-name>
```
**Must Pass:** All unit tests green

### 3. Production Build ✅
```bash
npx nx build <project-name> --configuration=production
```
**Must Pass:** Build succeeds without errors
**Check:** Bundle size warnings are expected/acceptable

### 4. Development Server ✅
```bash
npx nx serve <project-name>
```
**Must Pass:** Server starts, app loads without console errors

### 5. E2E Tests ✅ **[CRITICAL - DO NOT SKIP]**
```bash
npx nx e2e <project-name>-e2e
```
**Must Pass:** All E2E tests pass in all browsers
**Why:** E2E tests verify actual user functionality end-to-end

## Story 1.1 Lesson Learned

**Issue:** Initially completed story without running E2E tests
**Fix:** User caught this, E2E tests were run retroactively (all passed)
**Takeaway:** E2E tests are MANDATORY for all future stories

## Story-Specific Testing

### Frontend/UI Stories:
- [ ] Manual visual regression (before/after screenshots if possible)
- [ ] Responsive breakpoints tested (mobile, tablet, desktop)
- [ ] Hover states and interactions verified
- [ ] Accessibility check (keyboard navigation, screen reader)

### Backend/API Stories:
- [ ] Integration tests pass
- [ ] API contracts verified
- [ ] Error handling tested
- [ ] Database migrations tested (if applicable)

### Full-Stack Stories:
- All of the above

## Test Execution Order

1. **First:** Linting (fast, catches simple errors)
2. **Second:** Unit tests (fast, catches logic errors)
3. **Third:** Production build (medium, catches build issues)
4. **Fourth:** Dev server smoke test (medium, catches runtime issues)
5. **Fifth:** E2E tests (slow, catches functional regressions) **[DO NOT SKIP]**

## Definition of Done

**A story is NOT complete until:**
- ✅ All applicable tests from this checklist pass
- ✅ E2E tests have been run and passed
- ✅ Test results documented in story's Dev Agent Record

## Future Improvements

Consider adding to this checklist:
- Visual regression testing automation (Percy, Chromatic)
- Performance benchmarks (Lighthouse CI)
- Bundle size budgets (automated checks)
- Accessibility audits (axe-core)

---

**Last Updated:** 2025-11-10
**Created By:** James (Developer) after Story 1.1 feedback
