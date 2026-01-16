# Reward Chart - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Reward Chart application, including technical decisions, workarounds, and real-world patterns discovered during recent development work. It serves as a reference for AI agents and developers working on enhancements.

### Document Scope

Comprehensive documentation of the Reward Chart MVP - a family-friendly star-tracking application for kids' habits and rewards.

### Change Log

| Date       | Version | Description                 | Author          |
| ---------- | ------- | --------------------------- | --------------- |
| 2025-11-15 | 1.0     | Initial brownfield analysis | Mary (Analyst) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/main.ts` - Angular bootstrap
- **App Component**: `src/app/app.ts` + `src/app/app.html` - Main application shell
- **Configuration**: `src/environments/environment.ts` (dev), `src/environments/environment.prod.ts` (prod)
- **Core Business Logic**:
  - `src/app/services/chart-data.service.ts` - Chart state management, star tracking
  - `src/app/services/supabase.service.ts` - Database integration
- **Data Models**:
  - `src/app/models/chart-data.model.ts` - Main data structures
  - `src/app/models/family-member.model.ts`
  - `src/app/models/reward.model.ts`
- **Components**:
  - `src/app/components/child-card/` - Individual child/parent reward cards
  - `src/app/components/header/` - App header with actions
  - `src/app/components/rewards-modal/` - Reward catalog display
  - `src/app/components/settings-modal/` - Settings UI

### Database Schema

- **Primary Schema**: `docs/supabase-playground-consolidated-schema.sql` - Full consolidated schema for all workspace apps
- **MVP Tables**: `docs/supabase-add-star-completions.sql` - Simplified tables for MVP (no auth)
- **RLS Fix**: `docs/supabase-reward-chart-mvp-rls-fix.sql` - Required for anonymous access

## High Level Architecture

### Technical Summary

The Reward Chart is an **Angular 18+ standalone component application** built for families to track children's (and parents') daily habits using a star-based reward system. It features:

- **Frontend-only MVP** with optional Supabase persistence
- **Standalone Angular components** (no NgModules)
- **Reactive state management** using RxJS BehaviorSubjects
- **Tailwind CSS** with custom workspace preset for styling
- **Mobile-first responsive design**

### Actual Tech Stack

| Category       | Technology        | Version | Notes                                    |
| -------------- | ----------------- | ------- | ---------------------------------------- |
| Framework      | Angular           | 18+     | Standalone components, signals ready     |
| Language       | TypeScript        | 5.x     | Strict mode enabled                      |
| State          | RxJS              | 7.x     | BehaviorSubject pattern for chart data   |
| Database       | Supabase          | Latest  | **Optional** - app works without DB      |
| Styling        | Tailwind CSS      | 3.x     | Custom workspace preset (see below)      |
| UI Components  | PrimeNG           | 18.x    | Minimal usage, mostly custom components  |
| Build Tool     | Angular CLI       | 18+     | Nx-managed build                         |
| Package Mgr    | npm               | -       | Standard npm                             |
| Testing        | Jest              | -       | Via @nx/jest                             |
| Monorepo       | Nx                | 22.0.2  | Part of playground workspace             |

### Repository Structure Reality Check

- **Type**: Nx Monorepo (`/playground`)
- **App Location**: `apps/reward-chart/`
- **Shared Libraries**: `libs/tailwind-preset/` (custom Tailwind tokens)
- **Package Manager**: npm
- **Notable**: Part of multi-app workspace (family-calendar, reward-chart, football-director, math-quest, dadai-dev)

## Source Tree and Module Organization

### Project Structure (Actual)

```text
apps/reward-chart/
├── src/
│   ├── app/
│   │   ├── components/           # UI components (all standalone)
│   │   │   ├── child-card/       # Main card for each family member
│   │   │   ├── header/           # Top navigation/actions
│   │   │   ├── rewards-modal/    # Rewards catalog display
│   │   │   └── settings-modal/   # Settings UI
│   │   ├── models/               # TypeScript interfaces
│   │   │   ├── chart-data.model.ts
│   │   │   ├── family-member.model.ts
│   │   │   └── reward.model.ts
│   │   ├── services/             # Business logic services
│   │   │   ├── chart-data.service.ts  # Core state management
│   │   │   └── supabase.service.ts    # Database layer
│   │   ├── app.ts                # Root component (logic)
│   │   ├── app.html              # Root template
│   │   ├── app.css               # Minimal app-level styles
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing (currently empty)
│   ├── environments/             # Environment configs
│   │   ├── environment.ts        # Dev (with Supabase)
│   │   └── environment.prod.ts   # Prod
│   ├── main.ts                   # Angular bootstrap
│   ├── styles.css                # Global Tailwind imports
│   └── index.html                # HTML shell
├── docs/                         # Documentation (this file)
├── tailwind.config.js            # Tailwind config (uses workspace preset)
├── project.json                  # Nx project config
└── tsconfig.*.json               # TypeScript configs
```

### Key Modules and Their Purpose

#### Core Services

**`chart-data.service.ts`** - Core state management service
- Manages `chartData$` Observable (BehaviorSubject pattern)
- Holds hardcoded initial data (family members, habits, rewards)
- Syncs with Supabase if configured
- **Critical**: Auto-creates family members in DB on first load via `ensureFamilyMembersExist()`
- **Pattern**: Stores `familyMemberIds` Map to link UI data to DB records

**`supabase.service.ts`** - Database integration layer
- Initializes Supabase client with anon key
- Provides CRUD operations for `family_members` and `star_completions` tables
- **MVP Mode**: Works without auth (requires RLS policies to allow anonymous access)
- **Auto-sync**: `ensureFamilyMembersExist()` creates missing family members and returns IDs

#### Components

**`child-card.component.ts`** - Main UI component for tracking
- Displays grid of habits × days with star toggles
- Shows progress bar toward next reward milestone
- **Styling**: All Tailwind classes inline (no component CSS file)
- **Pattern**: Emits `StarToggleEvent` upward to app component

**`header.component.ts`** - Top bar navigation
- Shows current week (Mon-Sun range)
- Actions: Show Rewards, Settings, New Week (reset)

**`rewards-modal.component.ts`** - Reward catalog viewer
- Displays available rewards grouped by star count
- Separate lists for kids vs parents

**`settings-modal.component.ts`** - Configuration UI
- Currently only supports editing children's names
- Future: Could add habit customization, reward editing

## Data Models and APIs

### Data Models

See actual TypeScript interfaces in `src/app/models/`:

**`ChartData`** (`chart-data.model.ts`):
```typescript
interface ChartData {
  children: FamilyMember[];          // Kids to track
  parents: FamilyMember[];           // Parents (can be rated by kids!)
  kidsHabits: string[];              // 5 hardcoded habits
  parentHabits: string[];            // 5 hardcoded habits
  days: string[];                    // ['Mon', 'Tue', ...]
  kidsRewards: Reward[];             // Reward catalog for kids
  parentsRewards: Reward[];          // Reward catalog for parents
  kidsStars: StarsData;              // Nested object: [childIdx][habitIdx][dayIdx]
  parentsStars: StarsData;           // Nested object: [parentIdx][habitIdx][dayIdx]
  parentsVisible: boolean;           // Toggle for parents section
}
```

**`StarCompletion`** (DB record structure):
```typescript
interface StarCompletion {
  member_id: string;      // UUID from family_members table
  habit_index: number;    // 0-4 (which habit)
  day_index: number;      // 0-6 (Mon-Sun)
  is_completed: boolean;  // Star on/off
  updated_at?: string;
}
```

### Database Schema (Supabase)

**Relevant Tables for Reward Chart**:

1. **`families`** - Top-level family entity
   - `id` (UUID, PK)
   - `name` (TEXT)
   - RLS: Public access for MVP (see "Known Issues" below)

2. **`family_members`** - Children and parents
   - `id` (UUID, PK)
   - `family_id` (UUID, FK → families)
   - `name` (TEXT)
   - `member_type` ('child' | 'parent')
   - `color_code` (TEXT) - hex color for UI
   - `display_order` (INTEGER)
   - RLS: Public access for MVP

3. **`star_completions`** - Star tracking (simplified MVP table)
   - `id` (UUID, PK)
   - `member_id` (UUID, FK → family_members)
   - `habit_index` (INTEGER 0-4)
   - `day_index` (INTEGER 0-6)
   - `is_completed` (BOOLEAN)
   - `updated_at` (TIMESTAMP)
   - **UNIQUE**: `(member_id, habit_index, day_index)`
   - **RLS**: Disabled for MVP (anonymous access)

**Future Tables** (defined but not used in MVP):
- `habits` - For dynamic habit configuration
- `rewards` - For dynamic reward catalog
- `weeks` - For week tracking
- `daily_completions` - More structured star tracking

### API (Supabase Client)

No REST API - uses Supabase JavaScript client library directly:
- `supabase.from('family_members').select('*')`
- `supabase.from('star_completions').upsert({ ... })`

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Hardcoded Initial Data** (`chart-data.service.ts` lines 13-67)
   - Family member names, habits, and rewards are hardcoded in the service
   - **Why**: MVP simplicity, faster to prototype
   - **Future**: Should read from `habits` and `rewards` tables
   - **Workaround**: Use Settings modal to change child names (parents are fixed)

2. **Row Level Security (RLS) Workaround**
   - `families` and `family_members` tables have RLS enabled but no auth in MVP
   - **Required**: Must run `docs/supabase-reward-chart-mvp-rls-fix.sql` to add public policies
   - **Why**: Schema was designed for multi-tenant future, but MVP is single-family anonymous
   - **Impact**: Without this fix, app cannot create/read family members from DB
   - **Future**: Add proper auth (Supabase Auth) and remove public policies

3. **Tailwind Custom Spacing Scale** (`libs/tailwind-preset/src/index.ts`)
   - Custom spacing scale only includes: `4, 6, 8, 12, 16, 20, 24, 32px`
   - **Gotcha**: `mb-6` = 6px (not 1.5rem like default Tailwind!)
   - **Why**: Initially had CSS variables that didn't work, switched to Tailwind
   - **Pattern**: Use `mb-24` for section spacing (24px), `p-16` for padding (16px), `gap-16` for grids

4. **No Authentication**
   - App uses Supabase anonymous key, no user login
   - **Impact**: Anyone can access/modify any family's data
   - **Future**: Needs Supabase Auth integration

5. **Single Family Assumption**
   - `ensureFamilyMembersExist()` creates one default family named "My Family"
   - **Impact**: Multiple families would conflict
   - **Future**: Needs family selection/creation UI

### Workarounds and Gotchas

- **Supabase Environment Setup**:
  - Dev environment (`environment.ts`) has Supabase URL + anon key
  - Prod environment likely needs different project
  - **Critical**: Must run RLS fix SQL script or app won't save to DB

- **Tailwind Spacing**:
  - **DO NOT** use standard Tailwind spacing values (mb-4, p-6, etc. won't match expectations)
  - **USE**: Custom scale values (16, 24, 32) for proper spacing
  - See `libs/tailwind-preset/src/index.ts` for full scale

- **Component Styling Pattern**:
  - All components use inline Tailwind classes (no `.component.css` files)
  - Exception: `app.css` has minimal empty placeholder
  - **Why**: Tailwind-first approach, cleaner for utility-based styling

- **Star Toggle Flow**:
  - User clicks star → `child-card` emits event → `app.ts` calls `chartDataService.toggleStar()`
  - `toggleStar()` updates local state immediately (optimistic UI)
  - Then calls `supabaseService.saveStarCompletion()` in background
  - **Impact**: Stars appear instantly even if DB save fails (no error UI currently)

## Integration Points and External Dependencies

### External Services

| Service  | Purpose          | Integration Type     | Key Files                       |
| -------- | ---------------- | -------------------- | ------------------------------- |
| Supabase | Data persistence | JavaScript SDK (@supabase/supabase-js) | `services/supabase.service.ts`, `environments/environment.ts` |

### Workspace Dependencies

| Dependency       | Purpose                | Location                      |
| ---------------- | ---------------------- | ----------------------------- |
| tailwind-preset  | Shared design tokens   | `libs/tailwind-preset/`       |

### Angular-Specific Integration

- **Standalone Components**: No NgModules, all components are standalone
- **Dependency Injection**: Services use `providedIn: 'root'` or `inject()` function
- **Reactive Patterns**: `BehaviorSubject` + `async` pipe in templates

## Development and Deployment

### Local Development Setup

1. **Prerequisites**:
   ```bash
   Node.js 18+
   npm
   ```

2. **Install Dependencies** (from workspace root):
   ```bash
   npm install
   ```

3. **Configure Supabase** (optional - app works without DB):
   - Get Supabase project URL and anon key
   - Update `apps/reward-chart/src/environments/environment.ts`:
     ```typescript
     supabase: {
       url: 'YOUR_PROJECT_URL',
       anonKey: 'YOUR_ANON_KEY'
     }
     ```
   - Run SQL scripts in Supabase SQL Editor:
     1. `docs/supabase-playground-consolidated-schema.sql` (main schema)
     2. `docs/supabase-reward-chart-mvp-rls-fix.sql` (RLS fix for anonymous access)

4. **Run Dev Server**:
   ```bash
   nx serve reward-chart
   ```
   - Opens on `http://localhost:4300`
   - Hot reload enabled

### Build and Deployment Process

- **Build Command**:
  ```bash
  nx build reward-chart
  ```
  - Output: `dist/apps/reward-chart/`
  - Production build uses `environment.prod.ts`

- **Build Configuration**:
  - Defined in `apps/reward-chart/project.json`
  - Uses `@angular/build:application` executor
  - Tailwind processed during build

- **Deployment**:
  - Static files can be deployed to any static host (Vercel, Netlify, etc.)
  - No server-side rendering (CSR only)
  - Supabase connection works from client-side

### Known Build Warnings

- **Bundle size warning**: Initial bundle exceeds 500kb budget (645kb actual)
  - **Why**: Supabase client + Angular + PrimeNG are large
  - **Impact**: None for MVP, may need optimization for production

- **CommonJS dependency warning**: `tslib` used by Supabase PostgREST
  - **Impact**: Minor optimization bailout, acceptable for MVP

## Testing Reality

### Current Test Coverage

- **Unit Tests**: Minimal (basic app.spec.ts only)
- **Integration Tests**: None
- **E2E Tests**: None
- **Manual Testing**: Primary QA method

### Running Tests

```bash
nx test reward-chart          # Run unit tests (Jest)
nx lint reward-chart           # Run ESLint
```

### Test Configuration

- Jest config: `apps/reward-chart/jest.config.ts`
- Uses `jest-preset-angular` for Angular support
- Test setup: `src/test-setup.ts`

## Architecture Decisions and Patterns

### State Management Pattern

**BehaviorSubject + Service Pattern**:
```typescript
// chart-data.service.ts
private chartDataSubject = new BehaviorSubject<ChartData>(initialData);
public chartData$ = this.chartDataSubject.asObservable();
```

**Why this pattern**:
- Simpler than NgRx/NGXS for small app
- Reactive updates via RxJS
- Easy to test and understand

### Database Sync Strategy

**Optimistic UI + Background Sync**:
1. Update local state immediately
2. Fire-and-forget Supabase save
3. No loading spinners or error handling (MVP simplicity)

**Auto-create Pattern**:
- On app init, sync hardcoded family members to DB
- Creates missing members, returns IDs
- Maps names → UUIDs for future saves

### Styling Architecture

**Tailwind-First Approach**:
- No component-level CSS files
- All styles via utility classes in templates
- Custom design tokens in workspace preset

**Why**:
- Faster development
- Consistent with workspace standards
- Easier to maintain (styles co-located with markup)

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
nx serve reward-chart                  # Start dev server (port 4300)
nx build reward-chart                  # Production build
nx lint reward-chart                   # Run linter
nx test reward-chart                   # Run tests

# Workspace-level
nx graph                                # View project dependency graph
nx affected:test                        # Test affected projects

# Cleanup
rm -rf dist/apps/reward-chart          # Clean build output
```

### Debugging and Troubleshooting

**Console Logs to Watch**:
- `✅ Supabase connected!` - DB initialization successful
- `🔄 Syncing family members to database...` - Auto-sync starting
- `✅ Created family member: {name}` - New member created in DB
- `📋 Family member IDs mapped: [...]` - Name→UUID mapping complete
- `💾 Saved to Supabase: {id} {habit} {day} {completed}` - Star save successful
- `⚠️ Could not save star - member ID not found` - **ERROR**: Sync failed or RLS blocking

**Common Issues**:

1. **"Could not save star - member ID not found"**
   - **Cause**: RLS policies blocking family member creation
   - **Fix**: Run `docs/supabase-reward-chart-mvp-rls-fix.sql` in Supabase

2. **No spacing between charts**
   - **Cause**: Using wrong Tailwind spacing values
   - **Fix**: Use custom scale (mb-24, p-16, gap-16) not default values

3. **"Supabase not configured - running in local-only mode"**
   - **Expected**: App works without DB, stars won't persist
   - **Fix**: Add Supabase credentials to `environment.ts` if persistence needed

### Development Tips

- **Hot Reload**: Works well, no need to restart server
- **Tailwind**: Changes to `tailwind.config.js` require dev server restart
- **Database**: Changes to Supabase schema require manual SQL execution
- **State**: Check `chartDataSubject.value` in console to debug state issues

---

## Summary

The Reward Chart is a functional MVP with:
- ✅ Working star tracking UI
- ✅ Optional Supabase persistence
- ✅ Responsive mobile-first design
- ✅ Auto-sync pattern for family members
- ⚠️ Requires RLS fix for DB persistence
- ⚠️ Hardcoded data (habits, rewards)
- ⚠️ No authentication
- ⚠️ Single family assumption

**Next Steps** for production:
1. Add Supabase Auth
2. Multi-family support
3. Dynamic habits/rewards from DB
4. Error handling and loading states
5. E2E tests
6. Bundle size optimization
