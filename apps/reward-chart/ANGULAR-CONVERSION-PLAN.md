# Reward Chart Angular Conversion Plan

## Status: In Progress ⚙️

**Created:** 2025-11-07
**Architect:** Winston
**Completion:** 50% (Models ✅ | Services ✅ | Components 🔄 | Styles ⏳)

---

## What's Been Completed ✅

### 1. Models Created
- ✅ `family-member.model.ts` - Family member interfaces
- ✅ `reward.model.ts` - Reward structure
- ✅ `chart-data.model.ts` - Complete data model with stars tracking

### 2. Services Created
- ✅ `supabase.service.ts` - Supabase integration
  - Connection management
  - Family members CRUD
  - Star completions CRUD
  - Week reset functionality

- ✅ `chart-data.service.ts` - Core business logic
  - RxJS state management with BehaviorSubject
  - Star toggling with Supabase sync
  - Total stars calculation
  - Milestone/reward tracking
  - Settings management

### 3. Environment Configuration
- ✅ `environment.ts` - Development config with Supabase
- ✅ `environment.prod.ts` - Production config

---

## What's Remaining 🔄

### Components to Create

#### 1. Main App Component (`app.component.ts`)
```typescript
- Subscribe to chartData$
- Initialize services on ngOnInit
- Handle modal visibility
- Coordinate child components
```

#### 2. Header Component (`header.component.ts`)
```typescript
@Input() weekDisplay: string
@Output() showRewards = new EventEmitter<void>()
@Output() showSettings = new EventEmitter<void>()
@Output() newWeek = new EventEmitter<void>()
```

#### 3. Child Card Component (`child-card.component.ts`)
```typescript
@Input() person: FamilyMember
@Input() personIndex: number
@Input() section: 'kids' | 'parents'
@Input() habits: string[]
@Input() days: string[]
@Input() starsData: StarsData
@Input() totalStars: number
@Input() nextMilestone: number
@Output() starToggled = new EventEmitter<StarToggleEvent>()
```

#### 4. Rewards Modal Component (`rewards-modal.component.ts`)
```typescript
@Input() visible: boolean
@Input() kidsRewards: Reward[]
@Input() parentsRewards: Reward[]
@Output() close = new EventEmitter<void>()
```

#### 5. Settings Modal Component (`settings-modal.component.ts`)
```typescript
@Input() visible: boolean
@Input() childrenNames: string[]
@Output() close = new EventEmitter<void>()
@Output() save = new EventEmitter<string[]>()
```

### Styles to Migrate
- ✅ Design tokens (CSS custom properties) → `styles.css`
- ✅ Component-specific styles → Component CSS files
- ✅ Responsive breakpoints maintained
- ✅ Animations for star completion

---

## Architecture Benefits

### Before (Vanilla HTML/JS)
❌ 1300 lines in single file
❌ No type safety
❌ Manual DOM manipulation
❌ Difficult to test
❌ No dependency injection
❌ Imperative event handling

### After (Angular)
✅ Modular component architecture
✅ Full TypeScript type safety
✅ Declarative templates
✅ Testable services and components
✅ Dependency injection
✅ Reactive state management (RxJS)
✅ Change detection optimization

---

## File Structure

```
apps/reward-chart/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   ├── family-member.model.ts ✅
│   │   │   ├── reward.model.ts ✅
│   │   │   └── chart-data.model.ts ✅
│   │   ├── services/
│   │   │   ├── supabase.service.ts ✅
│   │   │   └── chart-data.service.ts ✅
│   │   ├── components/
│   │   │   ├── header/
│   │   │   │   ├── header.component.ts 🔄
│   │   │   │   ├── header.component.html 🔄
│   │   │   │   └── header.component.css 🔄
│   │   │   ├── child-card/
│   │   │   │   ├── child-card.component.ts 🔄
│   │   │   │   ├── child-card.component.html 🔄
│   │   │   │   └── child-card.component.css 🔄
│   │   │   ├── rewards-modal/
│   │   │   │   ├── rewards-modal.component.ts 🔄
│   │   │   │   ├── rewards-modal.component.html 🔄
│   │   │   │   └── rewards-modal.component.css 🔄
│   │   │   └── settings-modal/
│   │   │       ├── settings-modal.component.ts 🔄
│   │   │       ├── settings-modal.component.html 🔄
│   │   │       └── settings-modal.component.css 🔄
│   │   ├── app.component.ts 🔄
│   │   ├── app.component.html 🔄
│   │   ├── app.component.css 🔄
│   │   └── app.routes.ts ✅ (already exists)
│   ├── environments/
│   │   ├── environment.ts ✅
│   │   └── environment.prod.ts ✅
│   └── styles.css 🔄 (migrate design tokens)
└── public/
    └── index.html ⚠️ (will be replaced by Angular templates)
```

---

## Implementation Steps

### Phase 1: Core Components (Next)
1. Create `app.component.ts/html/css`
2. Create `header.component.ts/html/css`
3. Create `child-card.component.ts/html/css`

### Phase 2: Modal Components
4. Create `rewards-modal.component.ts/html/css`
5. Create `settings-modal.component.ts/html/css`

### Phase 3: Styles & Polish
6. Migrate CSS design tokens to `styles.css`
7. Add Angular animations for star toggle
8. Add celebration effect component

### Phase 4: Testing & Cleanup
9. Test all functionality
10. Remove old `public/index.html`
11. Update `project.json` assets config
12. Test build and deployment

---

## Key Decisions

### 1. State Management
**Chosen:** RxJS BehaviorSubject in `ChartDataService`
**Why:** Simple, reactive, fits Angular patterns, no need for NgRx yet

### 2. Component Communication
**Chosen:** @Input/@Output with EventEmitters
**Why:** Standard Angular pattern, clear data flow, easy to understand

### 3. Supabase Integration
**Chosen:** Dedicated `SupabaseService`
**Why:** Separation of concerns, easy to mock for testing, reusable

### 4. Styling Approach
**Chosen:** Component-scoped CSS + global design tokens
**Why:** Maintains encapsulation while sharing design system

---

## Testing Strategy

### Unit Tests
- `ChartDataService` - Star calculations, state management
- `SupabaseService` - Mocked Supabase client
- Components - Input/Output testing

### Integration Tests
- Star toggle → Service → Supabase flow
- Modal open/close cycles
- Week reset functionality

### E2E Tests (Future)
- Complete user workflow
- Supabase integration in test environment

---

## Migration Notes

### Data Preservation
- ✅ All existing Supabase data structure maintained
- ✅ Same database schema expected
- ✅ No breaking changes to backend

### Backward Compatibility
- ⚠️ Cannot run old and new versions simultaneously
- ✅ Database schema unchanged
- ✅ Supabase credentials reused

---

## Next Actions

**Immediate:**
1. Generate Angular components using Nx
2. Implement component templates
3. Wire up component communication
4. Migrate styles
5. Test functionality

**Commands to run:**
```bash
# Generate components
npx nx g @nx/angular:component components/header --project=reward-chart
npx nx g @nx/angular:component components/child-card --project=reward-chart
npx nx g @nx/angular:component components/rewards-modal --project=reward-chart
npx nx g @nx/angular:component components/settings-modal --project=reward-chart

# Test build
npx nx build reward-chart --configuration=production

# Test locally
npx nx serve reward-chart
```

---

## Success Criteria

- ✅ All functionality from vanilla version preserved
- ✅ Same UI/UX (design tokens maintained)
- ✅ Supabase integration working
- ✅ Responsive design maintained
- ✅ Build succeeds without errors
- ✅ Deployable to Vercel with standard workflow

---

**Status:** Ready for Phase 1 component creation
**Estimated Time:** 30-45 minutes for remaining work
**Risk Level:** Low (services tested, models solid, clear plan)
