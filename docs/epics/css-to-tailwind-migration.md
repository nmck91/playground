# CSS to Tailwind Migration - Brownfield Enhancement Epic

## Epic Goal

Consolidate all custom CSS styling across the Playground monorepo into Tailwind utility classes, eliminating 9 component CSS files (~500+ lines) and duplicate design tokens while maintaining existing visual design and functionality.

## Epic Description

### Existing System Context

**Current relevant functionality:**
- Two Angular applications (reward-chart, family-calendar) with working UI components
- Mix of global CSS custom properties (design tokens) and component-specific CSS files
- All visual styling currently functional with no known styling bugs

**Technology stack:**
- Angular 20.3 with standalone components
- Tailwind CSS 3.0.2 (already configured via `libs/tailwind-preset`)
- PrimeNG component library with Aura theme
- Design tokens already defined in Tailwind preset (colors, typography, spacing, shadows)

**Integration points:**
- Component templates (*.component.html) reference CSS classes
- Component decorators use `styleUrl` property
- Global styles.css files define base styles and animations
- Tailwind preset provides shared design system

### Enhancement Details

**What's being added/changed:**
- Remove all component `.css` files (9 files total)
- Replace custom CSS classes with Tailwind utility classes in component templates
- Simplify global styles.css to only essential items (@tailwind directives, PrimeIcons, custom animations)
- Implement TypeScript helper functions for dynamic styling (family member color variants)
- Remove duplicate CSS custom properties that already exist in Tailwind preset

**How it integrates:**
- Component templates will use Tailwind classes instead of custom CSS classes
- Component decorators will have `styleUrl` property removed
- Global styles remain but are drastically simplified
- Existing Tailwind preset continues to provide design tokens
- No changes to TypeScript logic or data models

**Success criteria:**
1. All 9 component CSS files deleted
2. Visual appearance identical to current state (pixel-perfect)
3. All responsive breakpoints working correctly
4. Animations (celebration effect) still functioning
5. Build succeeds with no errors
6. Bundle size impact documented (should be neutral or reduced)
7. All existing tests still passing

## Stories

### Story 1: Reward Chart - Global Styles & Header Component
**Goal:** Establish migration pattern and prove approach works

**Scope:**
- Cleanup `apps/reward-chart/src/styles.css` (reduce from 220 lines to ~30 lines)
  - Remove CSS custom properties (137 lines of duplicated design tokens)
  - Remove `.btn` utility classes
  - Remove `.hidden` class
  - Keep `@tailwind` directives, PrimeIcons import, `.celebration` animation
- Migrate `header.component.css` to Tailwind utilities
  - Convert CSS classes to Tailwind in header.component.html
  - Remove `styleUrl` from component decorator
  - Delete header.component.css file
- Test: Header looks identical, celebration animation works, responsive breakpoints functional

**Acceptance Criteria:**
- Global styles.css reduced to ~30 lines with only essential styles
- Header component has no CSS file, uses only Tailwind classes
- Visual regression check: header looks identical to before
- Build succeeds: `npx nx build reward-chart --configuration=production`
- Dev server works: `npx nx serve reward-chart`

### Story 2: Reward Chart - Remaining Components (Child Card & Modals)
**Goal:** Complete reward-chart migration with dynamic styling pattern

**Scope:**
- Migrate `child-card.component.css` to Tailwind with dynamic colors
  - Implement TypeScript helper function `getCardClasses()` for dynamic color variants
  - Use Tailwind classes: `border-child-1`, `bg-child-1/10`, etc.
  - Convert template to use `[class]="getCardClasses()"`
  - Delete child-card.component.css
- Migrate `settings-modal.component.css` to Tailwind
  - Convert modal structure to Tailwind utilities
  - Delete settings-modal.component.css
- Migrate `rewards-modal.component.css` to Tailwind
  - Convert modal structure to Tailwind utilities
  - Delete rewards-modal.component.css
- Test: All components look identical, dynamic colors work correctly

**Acceptance Criteria:**
- All child card color variants display correctly (child-1, child-2, child-3, parent)
- Both modals render identically to current design
- No CSS files remain in reward-chart components
- All TypeScript helper functions are properly typed
- Build succeeds with no warnings about dynamic classes
- Manual testing: Open modals, view all family member cards

### Story 3: Family Calendar - Complete Migration
**Goal:** Apply learned patterns to family-calendar app

**Scope:**
- Cleanup `apps/family-calendar/src/styles.css` (reduce from 23 lines to ~15 lines)
  - Simplify to @tailwind directives, PrimeIcons, basic body styles
- Migrate `calendar.component.css` to Tailwind
  - Convert calendar grid and event display to Tailwind utilities
  - Delete calendar.component.css
- Migrate `event-form.component.css` to Tailwind
  - Convert form styling to Tailwind utilities
  - Delete event-form.component.css
- Final verification across both apps

**Acceptance Criteria:**
- Family calendar visual design unchanged
- Calendar grid displays correctly
- Event forms styled identically to current
- No component CSS files in family-calendar
- Build succeeds for both apps: `npx nx run-many -t build`
- All existing tests pass: `npx nx run-many -t test`
- Bundle size impact documented (compare before/after)

## Compatibility Requirements

- [x] Existing APIs remain unchanged (no API changes in this work)
- [x] Database schema changes are backward compatible (no database changes)
- [x] UI changes follow existing patterns (using established Tailwind preset)
- [x] Performance impact is minimal (static CSS, potential bundle size reduction)
- [x] No TypeScript logic changes (only template and styling changes)
- [x] Component interfaces unchanged (public APIs remain the same)

## Risk Mitigation

**Primary Risk:** Visual regression - components may not look identical after migration, breaking user experience

**Mitigation:**
- Migration guide already documents exact CSS-to-Tailwind mappings
- Work incrementally: one component at a time with visual verification
- Keep dev server running to see changes immediately
- Take screenshots before migration for comparison
- Test all responsive breakpoints (mobile, tablet, desktop)
- Use browser DevTools to compare computed styles if discrepancies appear

**Secondary Risk:** Dynamic styling (child color variants) may not work correctly with Tailwind

**Mitigation:**
- Use TypeScript helper functions returning class strings (documented approach)
- Tailwind preset already has all color variants defined
- Test all color variants explicitly (child-1, child-2, child-3, parent)
- Fallback option: keep minimal CSS custom properties if needed (hybrid approach documented)

**Rollback Plan:**
1. All changes committed incrementally (one story at a time)
2. Git revert to previous commit if issues found
3. Each story is independently deployable
4. No database migrations involved (easy rollback)
5. If Vercel deployment breaks, promote previous deployment in dashboard (~30 seconds)

## Definition of Done

- [x] All stories completed with acceptance criteria met
- [x] Existing functionality verified through manual testing
  - All components render correctly
  - All modals open and display properly
  - All animations work
  - Responsive breakpoints functional
- [x] Integration points working correctly
  - Tailwind preset still referenced correctly
  - PrimeNG components still styled correctly
  - No conflicts between Tailwind and PrimeNG
- [x] Documentation updated appropriately
  - Architecture docs updated with new styling approach
  - Migration guide marked as "completed"
  - Any lessons learned documented
- [x] No regression in existing features
  - All builds succeed: `npx nx run-many -t build`
  - All tests pass: `npx nx run-many -t test`
  - All lints pass: `npx nx run-many -t lint`
  - E2E tests pass: `npx nx run-many -t e2e`
  - Visual regression testing completed (manual)
  - Bundle size impact measured and documented

## Additional Notes

**Files to be deleted (9 total):**
- `apps/reward-chart/src/app/components/header/header.component.css`
- `apps/reward-chart/src/app/components/child-card/child-card.component.css`
- `apps/reward-chart/src/app/components/settings-modal/settings-modal.component.css`
- `apps/reward-chart/src/app/components/rewards-modal/rewards-modal.component.css`
- `apps/family-calendar/src/app/components/calendar/calendar.component.css`
- `apps/family-calendar/src/app/components/event-form/event-form.component.css`

**Files to be modified (2 total):**
- `apps/reward-chart/src/styles.css` (220 lines → ~30 lines)
- `apps/family-calendar/src/styles.css` (23 lines → ~15 lines)

**Reference Documentation:**
- Comprehensive migration guide: `docs/CSS-TO-TAILWIND-MIGRATION.md`
- Tailwind preset with all design tokens: `libs/tailwind-preset/src/index.ts`
- Architecture patterns: `docs/architecture/code-patterns-and-conventions.md`

**Benefits Expected:**
- ✅ Consistency: All apps use same design system
- ✅ Reduced CSS: Eliminate ~500+ lines of custom CSS
- ✅ Better DX: IntelliSense for utility classes
- ✅ Maintainability: Change design tokens in one place (Tailwind preset)
- ✅ Bundle Size: Tree-shaken unused utilities
- ✅ No Duplication: Design tokens not duplicated in `:root` and Tailwind

---

## Story Manager Handoff

Please develop detailed user stories for this brownfield epic. Key considerations:

- This is an enhancement to an existing Nx monorepo running Angular 20.3 with Tailwind CSS already configured
- Integration points:
  - Component templates reference CSS classes that must be converted
  - Component decorators use `styleUrl` property that must be removed
  - Tailwind preset at `libs/tailwind-preset/src/index.ts` provides all design tokens
  - PrimeNG components must continue working alongside Tailwind utilities
- Existing patterns to follow:
  - Standalone components (no NgModules)
  - TypeScript helper functions for dynamic styling
  - Responsive design with mobile-first Tailwind breakpoints
  - Migration guide at `docs/CSS-TO-TAILWIND-MIGRATION.md` documents exact mappings
- Critical compatibility requirements:
  - Visual design must remain pixel-perfect (no regressions)
  - All animations must continue working (celebration effect)
  - Dynamic color variants for family members must work (child-1, child-2, child-3, parent)
  - All existing tests must continue passing
  - Bundle size impact must be neutral or positive
- Each story must include verification that existing functionality remains intact

The epic should maintain system integrity while delivering a consolidated Tailwind-only styling approach with no custom component CSS files.
