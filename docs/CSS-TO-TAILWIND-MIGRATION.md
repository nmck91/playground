# CSS to Tailwind Migration Guide

## Overview

This document outlines the strategy for migrating from custom CSS to Tailwind utility classes across the Playground monorepo.

**Current State**:
- Mix of CSS custom properties (design tokens) and component-specific CSS
- Tailwind already configured via `libs/tailwind-preset`
- Global styles define reusable tokens but also duplicate what's in Tailwind preset

**Goal**:
- Remove all component `.css` files
- Replace custom CSS with Tailwind utility classes
- Keep only essential global styles (@tailwind directives, animations, PrimeIcons)
- Leverage existing Tailwind preset for design tokens

---

## Migration Strategy

### Phase 1: Global Styles Cleanup

**Reward Chart** (`apps/reward-chart/src/styles.css`):
- ✅ **Keep**: `@tailwind` directives, PrimeIcons import
- ❌ **Remove**: CSS custom properties (`:root` block) - already in Tailwind preset
- ❌ **Remove**: `.btn` classes - replace with Tailwind utilities
- ✅ **Keep**: `.celebration` animation (custom animation not in Tailwind)
- ❌ **Remove**: `.hidden` class - use Tailwind's `hidden`

**Family Calendar** (`apps/family-calendar/src/styles.css`):
- ✅ **Keep**: `@tailwind` directives, PrimeIcons import
- ✅ **Keep**: Basic resets (`*`, `body`) but simplify with Tailwind classes

### Phase 2: Component CSS Migration

**Migration Pattern**:
```css
/* OLD: component.css */
.header {
  text-align: center;
  margin-bottom: var(--space-24);
}

.header h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
```

```html
<!-- NEW: component.html with Tailwind -->
<div class="text-center mb-24">
  <h1 class="text-4xl font-bold text-teal-500">
    <!-- content -->
  </h1>
</div>
```

### Phase 3: Dynamic Styling Strategy

**Challenge**: Dynamic child colors (child-1, child-2, child-3, parent)

**Solution Options**:

**Option A: Tailwind Dynamic Classes** (Recommended)
```typescript
// In component
getCardClasses(member: FamilyMember): string {
  const baseClasses = 'rounded-lg p-4 shadow-sm';
  const colorMap: Record<string, string> = {
    'child-1': 'border-2 border-child-1 bg-child-1/10',
    'child-2': 'border-2 border-child-2 bg-child-2/10',
    'child-3': 'border-2 border-child-3 bg-child-2/10',
    'parent': 'border-2 border-parent bg-parent/10',
  };
  return `${baseClasses} ${colorMap[member.className]}`;
}
```

```html
<div [class]="getCardClasses(child)">
  <!-- content -->
</div>
```

**Option B: CSS Custom Properties (Hybrid)**
Keep minimal CSS custom properties for truly dynamic colors:
```css
/* styles.css - MINIMAL */
.child-card {
  border-color: var(--card-color);
  background-color: var(--card-bg-color);
}
```

```typescript
// In component
@HostBinding('style.--card-color') get cardColor() {
  return this.child.color;
}
@HostBinding('style.--card-bg-color') get cardBgColor() {
  return `${this.child.color}1a`; // 10% opacity
}
```

---

## File-by-File Migration Plan

### Reward Chart App

#### `apps/reward-chart/src/styles.css`

**Before** (220 lines):
- CSS custom properties (137 lines)
- Utility classes (.btn, .hidden)
- Animations
- Media queries

**After** (~30 lines):
```css
/* PrimeIcons */
@import "primeicons/primeicons.css";

/* Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base layer customizations */
@layer base {
  body {
    @apply font-base bg-cream-50 text-slate-900 leading-normal;
  }
}

/* Custom animations not in Tailwind */
@keyframes celebrate {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.celebration {
  @apply fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
  @apply text-6xl z-[1001] pointer-events-none;
  animation: celebrate 0.6s ease-out;
}
```

#### Component CSS Files

**`header.component.css`** → DELETE
```html
<!-- OLD -->
<div class="header">
  <h1>{{ title }}</h1>
  <div class="week-display">{{ weekDisplay }}</div>
  <div class="controls">
    <button class="btn btn--primary">Rewards</button>
  </div>
</div>

<!-- NEW -->
<div class="text-center mb-24">
  <h1 class="text-4xl md:text-2xl font-bold text-teal-500 mb-8 md:mb-4">
    {{ title }}
  </h1>
  <div class="text-lg md:text-sm text-slate-500 mb-16 md:mb-12">
    {{ weekDisplay }}
  </div>
  <div class="flex flex-col md:flex-row gap-3 md:gap-12 justify-center flex-wrap mb-24">
    <button class="inline-flex items-center justify-center px-4 py-2 rounded-md text-base font-medium bg-teal-500 text-cream-50 hover:bg-teal-600 transition-all duration-250 ease-standard">
      Rewards
    </button>
  </div>
</div>
```

**`child-card.component.css`** → DELETE
```html
<!-- Use Tailwind classes with dynamic binding -->
<div [class]="getCardClasses()">
  <div class="flex justify-between items-center mb-4">
    <span class="text-xl font-semibold">{{ child.name }}</span>
    <span class="text-lg font-bold text-teal-500">{{ totalStars }} ⭐</span>
  </div>
  <div class="grid gap-2">
    <!-- habits grid -->
  </div>
</div>
```

**`settings-modal.component.css`** → DELETE (migrate to Tailwind)

**`rewards-modal.component.css`** → DELETE (migrate to Tailwind)

---

### Family Calendar App

#### `apps/family-calendar/src/styles.css`

**Before** (23 lines):
- Basic resets
- System font stack

**After** (~15 lines):
```css
/* PrimeIcons */
@import "primeicons/primeicons.css";

/* Tailwind CSS */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base layer customizations */
@layer base {
  body {
    @apply m-0 p-0 antialiased;
  }
}
```

#### Component CSS Files

**`calendar.component.css`** → DELETE (migrate to Tailwind)

**`event-form.component.css`** → DELETE (migrate to Tailwind)

---

## Tailwind Preset Updates Needed

The current `libs/tailwind-preset/src/index.ts` already has most tokens, but verify:

✅ **Already Defined**:
- Colors (cream, teal, slate, brown, charcoal, red, orange, child-1/2/3, parent)
- Typography (font families, sizes, weights, line heights)
- Spacing (0-32px)
- Border radius
- Box shadows
- Animation durations/timing

❌ **May Need to Add**:
- Custom animations (celebrate keyframes)
- Specific utility classes for modals

**Recommendation**: Keep custom animations in app-level `styles.css` using `@layer utilities`

---

## Migration Checklist

### Pre-Migration

- [ ] Audit all CSS files for unique styles not in Tailwind
- [ ] Identify dynamic styles requiring special handling
- [ ] Backup current CSS files (git commit)
- [ ] Test all components in current state

### During Migration

**Per Component**:
- [ ] Identify all CSS classes used in template
- [ ] Map each CSS property to Tailwind utility
- [ ] Update HTML template with Tailwind classes
- [ ] Handle dynamic styles (color variants, etc.)
- [ ] Test component renders correctly
- [ ] Delete `.css` file
- [ ] Remove `styleUrl` from `@Component` decorator

### Post-Migration

- [ ] Run builds: `npx nx run-many -t build`
- [ ] Visual regression testing (manual)
- [ ] Test responsive breakpoints
- [ ] Verify animations still work
- [ ] Check bundle size impact
- [ ] Update architecture docs

---

## Common CSS → Tailwind Mappings

### Layout
```css
display: flex;              → flex
flex-direction: column;     → flex-col
justify-content: center;    → justify-center
align-items: center;        → items-center
gap: 12px;                  → gap-3
```

### Spacing
```css
margin-bottom: 24px;        → mb-6 (or mb-24 if using px values)
padding: 16px;              → p-4
```

### Typography
```css
font-size: 30px;            → text-4xl
font-weight: 600;           → font-bold
color: var(--color-primary); → text-teal-500
```

### Borders & Radius
```css
border-radius: 10px;        → rounded-lg
border: 2px solid #87CEEB;  → border-2 border-child-1
```

### Shadows
```css
box-shadow: 0 1px 3px...;   → shadow-sm
```

### Colors
```css
background: var(--color-surface);     → bg-cream-100
color: var(--color-text-secondary);   → text-slate-500
```

### Responsive
```css
@media (max-width: 768px) {
  font-size: 20px;
}
```
→ `text-4xl md:text-2xl` (Tailwind mobile-first)

---

## Benefits of Migration

✅ **Consistency**: All apps use same design system
✅ **Reduced CSS**: Eliminate ~500+ lines of custom CSS
✅ **Better DX**: IntelliSense for utility classes
✅ **Maintainability**: Change design tokens in one place (Tailwind preset)
✅ **Bundle Size**: Tree-shaken unused utilities
✅ **No Duplication**: Design tokens not duplicated in `:root` and Tailwind

---

## Risks & Mitigation

**Risk**: Breaking existing layouts
**Mitigation**: Migrate one component at a time, test thoroughly

**Risk**: Dynamic colors harder to manage
**Mitigation**: Use TypeScript helper functions or minimal CSS custom properties

**Risk**: Loss of BEM naming clarity
**Mitigation**: Use semantic component structure and good HTML

**Risk**: Verbose HTML with many classes
**Mitigation**: Extract repeated patterns into TypeScript helper functions returning class strings

---

## Next Steps

1. **Review this strategy** with team/user
2. **Spike on one component** (e.g., `header.component`) to validate approach
3. **Create helper utilities** for dynamic styling patterns
4. **Migrate incrementally** - one component at a time
5. **Update architecture docs** after migration complete

---

## Example: Complete Component Migration

**Before**:
```typescript
// header.component.ts
@Component({
  selector: 'app-header',
  styleUrl: './header.component.css',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // ...
}
```

```css
/* header.component.css */
.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 30px;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 8px;
}
```

```html
<!-- header.component.html -->
<div class="header">
  <h1>Reward Chart</h1>
</div>
```

**After**:
```typescript
// header.component.ts
@Component({
  selector: 'app-header',
  // NO styleUrl!
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class HeaderComponent {
  // ...
}
```

```html
<!-- header.component.html -->
<div class="text-center mb-6">
  <h1 class="text-4xl font-bold text-teal-500 mb-2">
    Reward Chart
  </h1>
</div>
```

**Files Deleted**:
- ❌ `header.component.css` (44 lines)

**Result**:
- ✅ Same visual appearance
- ✅ Fully responsive
- ✅ Using design system tokens from Tailwind preset
- ✅ No custom CSS to maintain
