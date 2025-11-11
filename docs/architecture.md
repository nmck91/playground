# Playground Nx Monorepo - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Playground Nx monorepo codebase, a personal AI-assisted development sandbox containing two production Angular applications. This is AI-optimized documentation designed to enable AI agents to understand, navigate, and modify the codebase effectively.

### Document Scope

**Comprehensive documentation of entire system** - This is a playground workspace for experimenting with AI-driven development across different project types. All tasks are expected to be performed by AI agents.

### Change Log

| Date       | Version | Description                      | Author  |
| ---------- | ------- | -------------------------------- | ------- |
| 2025-11-11 | 1.1     | Added Last Player Standing app, removed Nx Cloud references | Claude Code |
| 2025-11-08 | 1.0     | Initial brownfield analysis      | Winston (Architect Agent) |

---

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

**Workspace Root:**
- **Workspace Config**: `nx.json` - Nx workspace configuration, caching, and target defaults
- **Dependencies**: `package.json` - All workspace dependencies (Angular 20.3, Nx 22.0.2, Supabase, PrimeNG, Tailwind)
- **TypeScript Base**: `tsconfig.base.json` - Workspace-wide TypeScript configuration and path mappings
- **Root Build Tools**: `jest.preset.js`, `eslint.config.mjs`, `vercel.json`

**Reward Chart Application (`apps/reward-chart/`):**
- **Main Entry**: `src/main.ts` - Angular bootstrap
- **App Config**: `project.json` - Nx project targets and build configuration
- **State Management**: `src/app/services/chart-data.service.ts` - BehaviorSubject-based state
- **Backend Client**: `src/app/services/supabase.service.ts` - Database operations
- **Components**: `src/app/components/` - Header, ChildCard, SettingsModal, RewardsModal
- **Models**: `src/app/models/` - ChartData, FamilyMember, Reward type definitions
- **Styles**: `src/styles.css` - Global styles with CSS custom properties
- **Build**: `tailwind.config.js` - Tailwind configuration using shared preset

**Family Calendar Application (`apps/family-calendar/`):**
- **Main Entry**: `src/main.ts` - Angular bootstrap
- **App Config**: `project.json` - Nx project targets and build configuration
- **State Management**: `src/app/services/event.service.ts` - Signal-based state
- **Backend Client**: `src/app/services/supabase.service.ts` - Database operations
- **Components**: `src/app/components/` - Calendar, EventForm
- **Models**: `src/app/models/event.model.ts` - CalendarEvent, RecurrenceRule type definitions
- **Styles**: `src/styles.css` - Global styles with CSS custom properties
- **Build**: `tailwind.config.js` - Tailwind configuration using shared preset

**Last Player Standing Application (`apps/last-player-standing/`):**
- **Main Entry**: `src/main.ts` - Angular bootstrap (NgModule architecture)
- **App Module**: `src/app/app-module.ts` - PrimeNG Aura theme configuration
- **Core Services**: `src/app/core/services/` - Auth, Supabase, Payment (Stripe)
- **Guards**: `src/app/core/guards/` - Auth guard, Admin guard
- **Features**: `src/app/features/` - Public (home, login, register), Dashboard, Admin
- **Components**: `src/app/shared/components/header.component.ts` - Navigation header
- **Environments**: `src/environments/` - Supabase and Stripe configuration
- **Docs**: `docs/last-player-standing/` - Setup guide, database schema, Supabase fixes

**Shared Libraries (`libs/`):**
- **Tailwind Preset**: `libs/tailwind-preset/src/index.ts` - Shared design system tokens

**Documentation (`docs/`):**
- **Project Brief**: `docs/brief.md` - Reward chart app requirements and vision
- **UI Architecture**: `docs/ui-architecture.md` - Comprehensive frontend architecture documentation
- **Database Schemas**: `docs/supabase-schema.sql`, `docs/supabase-schema-simple.sql`
- **Deployment Guides**: `docs/VERCEL-SETUP.md`, `docs/deployment-standard.md`
- **Quick Start**: `docs/QUICK-START.md` - Getting started guide

---

## High Level Architecture

### Technical Summary

**Architecture Pattern**: Nx Monorepo with Angular SPAs + Supabase Backend-as-a-Service (BaaS)

**Repository Type**: Monorepo managed by Nx 22.0.2
- Three Angular applications (2 production, 1 in development)
- One shared library (Tailwind design system)
- E2E test projects for each app
- Shared tooling and configuration

**Deployment Model**:
- **Frontend**: Deployed to Vercel via GitHub integration (CI-gated release branch)
  - `family-calendar` → Production (Vercel)
  - `reward-chart` → Production (Vercel)
  - `last-player-standing` → Development (not yet deployed)
- **Backend**: Supabase (managed PostgreSQL + Auth + Real-time)
- **Payments**: Stripe (Last Player Standing only)
- **CI/CD**: GitHub Actions for testing, auto-merge to release branch, Vercel for deployment

### Actual Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Monorepo Manager** | Nx | 22.0.2 | Build caching, affected command detection, task orchestration |
| **Frontend Framework** | Angular | ~20.3.0 | Standalone components, Signals, modern reactive patterns |
| **UI Components** | PrimeNG | ^20.3.0 | Component library with Aura theme integration |
| **Styling** | Tailwind CSS | ^3.0.2 | Utility-first CSS with shared workspace preset |
| **Backend (BaaS)** | Supabase | Client SDK ^2.80.0 | PostgreSQL, Auth, Real-time subscriptions |
| **State Management (Reward Chart)** | RxJS BehaviorSubject | ~7.8.0 | Observable-based state for complex streams |
| **State Management (Calendar)** | Angular Signals | Built-in | Fine-grained reactivity for simple state |
| **Build Tool** | Angular Build (esbuild) | ~20.3.0 | Fast production builds with optimization |
| **Package Manager** | npm | Native | Standard npm with package-lock.json |
| **Testing - Unit** | Jest + jest-preset-angular | ^29.7.0 / ~14.6.1 | Fast parallel test execution |
| **Testing - E2E** | Playwright | ^1.36.0 | Modern browser automation |
| **Linting** | ESLint + angular-eslint | ^9.8.0 / ^20.3.0 | Flat config with Angular-specific rules |
| **Type Checking** | TypeScript | ~5.9.2 | Strict mode enabled |
| **CI/CD** | GitHub Actions | N/A | CI-gated release branch workflow |
| **Deployment** | Vercel | N/A | GitHub integration, auto-deploy from release branch only |
| **Payments** | Stripe | SDK (Last Player Standing) | Payment processing for competition entries |

### Repository Structure Reality Check

- **Type**: Monorepo
- **Package Manager**: npm with package-lock.json (lockfileVersion 3)
- **Apps**: 3 apps (2 production, 1 in development) + 3 e2e test apps
- **Libs**: 1 shared library (Tailwind preset)
- **Notable**:
  - CI-gated release branch strategy (main → CI ✅ → release → deploy)
  - Vercel deployments controlled via `git.deploymentEnabled` in vercel.json
  - Uses Nx plugins for automatic target inference
  - Shared Tailwind preset in libs/

---

## Source Tree and Module Organization

### Project Structure (Actual)

```text
playground/
├── apps/
│   ├── family-calendar/              # Family calendar SPA
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/      # Calendar, EventForm components
│   │   │   │   ├── services/        # EventService (Signals), SupabaseService
│   │   │   │   └── models/          # CalendarEvent, RecurrenceRule models
│   │   │   ├── main.ts              # Angular bootstrap
│   │   │   └── styles.css           # Global styles + Tailwind imports
│   │   ├── public/                   # Static assets
│   │   ├── project.json             # Nx build/serve/test targets
│   │   ├── tailwind.config.js       # Tailwind config (uses libs/tailwind-preset)
│   │   ├── vercel.json              # Vercel deployment config (release branch only)
│   │   └── tsconfig.app.json        # App-specific TypeScript config
│   │
│   ├── family-calendar-e2e/         # Playwright E2E tests
│   │   ├── src/                      # E2E test specs
│   │   └── playwright.config.ts     # Playwright configuration
│   │
│   ├── reward-chart/                 # Reward tracking SPA
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── components/      # Header, ChildCard, Modals, Confetti
│   │   │   │   ├── services/        # ChartDataService (BehaviorSubject), Supabase
│   │   │   │   └── models/          # ChartData, FamilyMember, Reward models
│   │   │   ├── main.ts              # Angular bootstrap
│   │   │   └── styles.css           # Global styles + Tailwind imports
│   │   ├── public/                   # Static assets
│   │   ├── project.json             # Nx build/serve/test targets
│   │   ├── tailwind.config.js       # Tailwind config (uses libs/tailwind-preset)
│   │   ├── vercel.json              # Vercel deployment config (release branch only)
│   │   └── tsconfig.app.json        # App-specific TypeScript config
│   │
│   ├── reward-chart-e2e/            # Playwright E2E tests
│   │   ├── src/                      # E2E test specs
│   │   └── playwright.config.ts     # Playwright configuration
│   │
│   ├── last-player-standing/         # Football competition app (NgModule)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/
│   │   │   │   │   ├── guards/      # Auth guard, Admin guard
│   │   │   │   │   └── services/    # AuthService, SupabaseService, PaymentService
│   │   │   │   ├── features/
│   │   │   │   │   ├── public/      # HomeComponent, LoginComponent, RegisterComponent
│   │   │   │   │   ├── dashboard/   # User dashboard
│   │   │   │   │   └── admin/       # Admin panel
│   │   │   │   ├── shared/
│   │   │   │   │   └── components/  # HeaderComponent
│   │   │   │   ├── app-module.ts    # NgModule with PrimeNG Aura theme
│   │   │   │   └── app.routes.ts    # Route configuration
│   │   │   ├── environments/        # Supabase and Stripe config
│   │   │   ├── main.ts              # Angular bootstrap
│   │   │   └── styles.css           # Global styles + Tailwind imports
│   │   ├── project.json             # Nx build/serve/test targets
│   │   ├── tailwind.config.js       # Tailwind config (uses libs/tailwind-preset)
│   │   ├── vercel.json              # Vercel deployment config (release branch only)
│   │   └── tsconfig.app.json        # App-specific TypeScript config
│   │
│   └── last-player-standing-e2e/    # Playwright E2E tests
│       ├── src/                      # E2E test specs
│       └── playwright.config.ts     # Playwright configuration
│
├── libs/
│   └── tailwind-preset/              # Shared Tailwind design system
│       ├── src/
│       │   └── index.ts             # Tailwind config export (colors, fonts, spacing)
│       ├── project.json              # Library metadata
│       ├── package.json              # Library package definition
│       └── tsconfig.lib.json        # Library TypeScript config
│
├── docs/                             # Project documentation
│   ├── brief.md                      # Reward chart project requirements
│   ├── ui-architecture.md            # Frontend architecture deep dive
│   ├── supabase-schema.sql          # Full database schema
│   ├── supabase-schema-simple.sql   # Simplified schema
│   ├── VERCEL-SETUP.md              # Vercel deployment guide
│   ├── deployment-standard.md        # Deployment standards
│   ├── QUICK-START.md               # Getting started guide
│   └── example/                      # Original prototype HTML files
│
├── .bmad-core/                       # BMAD agent framework
│   ├── agents/                       # Agent personas (architect, dev, po, etc.)
│   ├── tasks/                        # Reusable task workflows
│   ├── checklists/                   # Quality checklists
│   ├── templates/                    # Document templates
│   └── workflows/                    # Multi-step workflows
│
├── .github/workflows/                # CI/CD
│   └── ci.yml                        # GitHub Actions: lint, test, build, e2e
│
├── nx.json                           # Nx workspace configuration
├── package.json                      # Workspace dependencies
├── tsconfig.base.json                # Base TypeScript config + path mappings
├── jest.preset.js                    # Jest configuration preset
├── eslint.config.mjs                 # ESLint flat config
├── vercel.json                       # Vercel deployment config (workspace root)
└── README.md                         # Basic Nx workspace readme
```

### Key Modules and Their Purpose

**Reward Chart Application:**
- `chart-data.service.ts` - State management using RxJS BehaviorSubject, Supabase sync
- `supabase.service.ts` - Database client wrapper for family members, habits, stars
- `header.component.ts` - Top navigation with rewards/settings buttons, week display
- `child-card.component.ts` - Individual family member card with star grid
- `rewards-modal.component.ts` - Reward redemption interface
- `settings-modal.component.ts` - App configuration (habits, rewards, family members)

**Family Calendar Application:**
- `event.service.ts` - State management using Angular Signals, Supabase/localStorage fallback
- `supabase.service.ts` - Database client for calendar events with recurrence support
- `calendar.component.ts` - Month view calendar with event display
- `event-form.component.ts` - Event creation/editing with recurrence rules

**Last Player Standing Application:**
- `auth.service.ts` - Supabase authentication with profile management via database triggers
- `payment.service.ts` - Stripe integration for £10 entry fee processing
- `admin.guard.ts` - Functional guard protecting admin-only routes
- `home.component.ts` - Landing page with competition information
- `dashboard.component.ts` - User dashboard for making weekly picks
- Database triggers handle profile creation automatically (bypasses RLS)

**Shared Libraries:**
- `libs/tailwind-preset/src/index.ts` - Design system tokens (colors, typography, spacing, shadows)

---

## Data Models and APIs

### Data Models

**Reward Chart Models** (see `apps/reward-chart/src/app/models/`):
- **ChartData**: Complete app state structure
- **FamilyMember**: Child/parent with name, color, className
- **Reward**: Reward definition with name and star cost

**Calendar Models** (see `apps/family-calendar/src/app/models/event.model.ts`):
- **CalendarEvent**: Event with title, dates, category, recurrence
- **RecurrenceRule**: Frequency, interval, end date, days of week
- **EventCategory**: 'work' | 'personal' | 'family' | 'other'

### Database Schema

**Supabase Tables** (see `docs/supabase-schema.sql`):

**Reward Chart Schema:**
```sql
family_members (id, name, type, color, display_order)
habits (id, name, type, display_order)
stars (id, family_member_id, day, habit_id, week_start)
rewards (id, name, stars_required, type)
settings (id, key, value, updated_at)
```

**Calendar Schema:**
```sql
events (
  id, title, description,
  start_date, end_date, category,
  is_recurring, recurrence_frequency, recurrence_interval,
  recurrence_end_date, recurrence_days_of_week, recurrence_count,
  color, location, created_by, attendees
)
```

### API Specifications

**Supabase Client SDK** (via @supabase/supabase-js):
- Authentication: Currently not implemented, uses anonymous access
- Database: CRUD operations via Supabase client
- Real-time: Not currently utilized but available

**No REST API** - Direct database access via Supabase client SDK

---

## Technical Debt and Known Issues

### Critical Technical Debt

1. **No Authentication**: Both apps currently use direct Supabase access without user authentication
   - **Impact**: Multi-tenancy not supported, all users share same data
   - **Location**: `apps/*/src/app/services/supabase.service.ts`
   - **Fix Required**: Implement Supabase Auth before multi-user deployment

2. **Inconsistent State Management Patterns**:
   - Reward Chart uses RxJS BehaviorSubject
   - Family Calendar uses Angular Signals
   - **Impact**: Different mental models for AI agents working across apps
   - **Reason**: Signals are newer, calendar was built later
   - **Not a blocker**: Both patterns work well, just inconsistent

3. **Hardcoded Family Data in Reward Chart**:
   - Family member names, colors hardcoded in `chart-data.service.ts:13-22`
   - **Impact**: Not truly multi-family without database customization
   - **Workaround**: Settings modal allows runtime changes but resets on page reload

4. **Bundle Size Warnings**:
   - Both apps exceed 500KB initial bundle budget (actual: ~640KB)
   - **Impact**: Performance on slow connections
   - **Cause**: PrimeNG and Supabase SDK add significant bundle size
   - **Not critical**: Acceptable for personal/family use case

5. **No Shared Component Library**:
   - Both apps have separate Supabase service implementations
   - Potential for shared UI components not extracted
   - **Impact**: Code duplication, maintenance overhead

### Workarounds and Gotchas

1. **Vercel Root Directory**: Must be set to workspace root (`.`), not app subdirectory
   - **History**: Originally had per-app vercel.json files causing build failures
   - **Fix**: Moved to root `vercel.json` in commit fc6f403

2. **Tailwind Config Path**: Apps reference `libs/tailwind-preset/src/index.ts` via relative path
   - **Reason**: Tailwind uses CommonJS require(), doesn't respect TypeScript path mappings
   - **Location**: `apps/*/tailwind.config.js:7`

3. **Environment Variables**: Supabase URL/Key expected in environment
   - Apps check `isConfigured()` before attempting Supabase operations
   - **Fallback**: Calendar falls back to localStorage if Supabase not configured
   - **Location**: See `apps/*/src/app/services/supabase.service.ts`

4. **npm ci Requirement**: Vercel uses `npm ci`, requires valid package-lock.json
   - **History**: Had issues with out-of-sync package-lock.json in commit e3ef66a
   - **Solution**: Keep package-lock.json committed and in sync

---

## Integration Points and External Dependencies

### External Services

| Service | Purpose | Integration Type | Key Files |
|---------|---------|------------------|-----------|
| Supabase | Backend database, auth (future) | Official JS SDK | `apps/*/src/app/services/supabase.service.ts` |
| Vercel | Frontend hosting and deployment | GitHub integration | `vercel.json`, `.vercel/project.json` |
| Nx Cloud | Build caching and task distribution | Nx CLI integration | `nx.json` (nxCloudId: 690bb8b50b43db7aa6c2f781) |
| GitHub Actions | CI/CD pipeline | Workflow YAML | `.github/workflows/ci.yml` |

### Internal Integration Points

- **Shared Design System**: Both apps import Tailwind preset via `require('../../libs/tailwind-preset/src/index.ts')`
- **No Runtime Dependencies**: Apps are independent SPAs, no shared runtime code
- **Build Dependencies**: Both apps depend on workspace-level tooling (ESLint, Jest, Nx)

---

## Development and Deployment

### Local Development Setup

1. **Prerequisites**:
   ```bash
   Node.js 20.x
   npm (comes with Node)
   ```

2. **Clone and Install**:
   ```bash
   git clone https://github.com/nmck91/playground.git
   cd playground
   npm install
   ```

3. **Environment Variables** (Optional - for Supabase):
   Create `.env` files in app directories:
   ```bash
   # apps/reward-chart/.env (or family-calendar)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run Development Server**:
   ```bash
   # Reward Chart on port 4300
   npx nx serve reward-chart

   # Family Calendar on default port 4200
   npx nx serve family-calendar
   ```

5. **Known Setup Issues**:
   - If `nx` commands fail with "Could not find Nx modules", run `npm install` again
   - Playwright requires `npx playwright install --with-deps` for E2E tests

### Build and Deployment Process

**Local Production Build**:
```bash
# Build specific app
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production

# Build all apps
npx nx run-many -t build --configuration=production

# Output locations
dist/apps/family-calendar/browser/
dist/apps/reward-chart/browser/
```

**CI/CD Pipeline** (`.github/workflows/ci.yml`):
1. Checkout code
2. Setup Node 20.x with npm cache
3. Run `npm ci`
4. Install Playwright browsers
5. Run `npx nx run-many -t lint test build e2e`
6. Run `npx nx fix-ci` if failures occur

**Vercel Deployment**:
- **Trigger**: Push to `main` branch or PR
- **Config**: `vercel.json` at workspace root
- **Build Command**: `npx nx build [app-name] --configuration=production`
- **Output Dir**: `dist/apps/[app-name]/browser`
- **Install**: `npm ci`
- **Projects**:
  - family-calendar → https://family-calendar-niall-mckinneys-projects.vercel.app
  - reward-chart → https://family-reward-chart-niall-mckinneys-projects.vercel.app

**Environment Variables in Vercel**:
- Set in Vercel dashboard per project
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` must be configured for production

---

## Testing Reality

### Current Test Coverage

**Unit Tests**:
- **Framework**: Jest with jest-preset-angular
- **Coverage**: Minimal (newly generated components have skeleton tests)
- **Location**: `apps/*/src/**/*.spec.ts`
- **Run**: `npx nx test [app-name]`

**E2E Tests**:
- **Framework**: Playwright
- **Coverage**: Basic smoke tests in generated projects
- **Location**: `apps/*-e2e/src/**/*.spec.ts`
- **Run**: `npx nx e2e [app-name]-e2e`

**Integration Tests**: None currently

**Manual Testing**: Primary QA method (personal playground project)

### Running Tests

```bash
# Unit tests for specific app
npx nx test family-calendar
npx nx test reward-chart

# Unit tests with coverage
npx nx test family-calendar --coverage
npx nx test reward-chart --coverage

# E2E tests
npx nx e2e family-calendar-e2e
npx nx e2e reward-chart-e2e

# Run all tests
npx nx run-many -t test

# Lint
npx nx run-many -t lint
```

---

## Code Patterns and Conventions

### Angular Patterns

**Component Architecture**:
- **Standalone components** - No NgModules
- **inject() function** - Modern dependency injection
- **OnPush change detection** - Not explicitly set, could be optimization opportunity

**State Management**:
- **Reward Chart**: RxJS BehaviorSubject pattern with observable streams
  ```typescript
  private chartDataSubject = new BehaviorSubject<ChartData>(initialData);
  public chartData$ = this.chartDataSubject.asObservable();
  ```
- **Family Calendar**: Angular Signals with readonly exposure
  ```typescript
  private events = signal<CalendarEvent[]>([]);
  readonly eventsSignal = this.events.asReadonly();
  ```

**Service Patterns**:
- `providedIn: 'root'` - All services use root injection
- `inject()` for dependency injection in constructors
- Async/await for Supabase operations

### Naming Conventions

**Files**:
- Components: `*.component.ts`, `*.component.html`, `*.component.css`
- Services: `*.service.ts`
- Models: `*.model.ts`
- Kebab-case filenames: `chart-data.service.ts`, `child-card.component.ts`

**TypeScript**:
- PascalCase for classes, interfaces, types
- camelCase for variables, methods
- UPPER_SNAKE_CASE for constants (not heavily used)

**Selectors**:
- Component selectors: `app-*` or `dadai-*` (family-calendar prefix)

### Styling Patterns

**Tailwind Utility-First**:
- Shared design tokens in `libs/tailwind-preset/src/index.ts`
- Component-specific styles use CSS files with custom properties

**CSS Custom Properties**:
- Used for dynamic theming (family member colors)
- Example: `--child-1-color: #87CEEB`

**No CSS-in-JS**: Pure CSS files, no styled-components or emotion

---

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
npx nx serve family-calendar       # Start dev server (port 4200)
npx nx serve reward-chart          # Start dev server (port 4300)

# Production Builds
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production

# Testing
npx nx test family-calendar        # Unit tests
npx nx e2e family-calendar-e2e     # E2E tests
npx nx run-many -t test            # All unit tests
npx nx run-many -t lint test build e2e  # Full CI suite

# Code Quality
npx nx lint family-calendar        # ESLint
npx nx run-many -t lint            # Lint all projects

# Nx Utilities
npx nx graph                       # Visualize project dependencies
npx nx show project family-calendar  # Show project details
npx nx list                        # List installed plugins
npx nx affected -t test            # Test only affected projects

# Generators
npx nx g @nx/angular:component my-component --project=reward-chart
npx nx g @nx/angular:service my-service --project=family-calendar
npx nx g @nx/js:library my-lib --directory=libs/my-lib

# Vercel CLI (if installed)
npx vercel ls                      # List deployments
npx vercel inspect [deployment-url]  # Inspect deployment
```

### Debugging and Troubleshooting

**Common Issues**:

1. **"Could not find Nx modules"**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Supabase connection failing**:
   - Check `.env` files exist in app directories
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
   - Check browser console for Supabase client errors

3. **Build failing on Vercel**:
   - Ensure `vercel.json` is at workspace root
   - Verify Root Directory is set to `.` in Vercel dashboard
   - Check `package-lock.json` is committed and in sync

4. **Bundle size warnings**:
   - Expected behavior with PrimeNG and Supabase
   - Can be ignored for personal projects
   - For optimization: analyze with `npx nx build --stats-json` and webpack-bundle-analyzer

**Logs**:
- **Build logs**: Nx output in terminal
- **Dev server**: `http://localhost:4200` or `http://localhost:4300`
- **CI logs**: GitHub Actions tab in repository
- **Deployment logs**: Vercel dashboard

---

## AI Agent Guidelines

### Working with This Codebase

**This is an AI development playground**. All tasks should be performed by AI agents with these considerations:

1. **No Perfect Code Required**: This is experimental, optimize for speed and learning
2. **Documentation Target**: Write docs for AI agents, not junior developers
3. **State Management Flexibility**: Both RxJS and Signals patterns are acceptable
4. **Authentication Can Wait**: Multi-user support is future enhancement
5. **Bundle Size Acceptable**: Performance optimization not critical priority

### When Making Changes

1. **Use Nx Commands**: Always use `npx nx` for builds, tests, and generation
2. **Maintain Patterns**: Follow existing patterns within each app
3. **Update Documentation**: Modify this document when architecture changes
4. **Test Builds**: Run `npx nx build [app] --configuration=production` before pushing
5. **Commit Message Format**: Use conventional commits (feat:, fix:, docs:, etc.)

### Code Generation Preferences

```bash
# Components
npx nx g @nx/angular:component components/my-component --project=[app-name] --standalone

# Services
npx nx g @nx/angular:service services/my-service --project=[app-name]

# Libraries
npx nx g @nx/js:library my-lib --directory=libs/my-lib --bundler=none --unitTestRunner=jest
```

### Project-Specific Notes

**Reward Chart**:
- Family data currently hardcoded, can be modified in `chart-data.service.ts`
- Star tracking uses week-based system (Monday start)
- Database schema supports multiple families (not implemented in UI)

**Family Calendar**:
- Supports complex recurrence rules (RRULE-like)
- Falls back to localStorage if Supabase not configured
- Uses Signals for simpler state management than Reward Chart

**Shared Libraries**:
- Tailwind preset is reference via relative path (not TypeScript path mapping)
- Design tokens intentionally simple (not overwhelming)
- Can be extended for app-specific tokens

---

## Version History

### Recent Significant Changes

**Commit accf7f1** (2025-11-08): Refactor Tailwind preset into libs folder
- Moved `tailwind-workspace-preset.js` → `libs/tailwind-preset/src/index.ts`
- Updated both apps to reference new location
- Improved Nx dependency graph visibility

**Commit e3ef66a** (2025-11-08): Move Vercel configuration to repository root
- Fixed deployment by moving `vercel.json` from app-specific to workspace root
- Resolved Vercel root directory issue causing `npm ci` failures

**Commit fc6f403** (2025-11-08): Regenerate package-lock.json to fix Vercel deployment
- Fixed out-of-sync package-lock.json causing build failures
- Ensured npm ci works in Vercel environment

---

## Summary for AI Agents

**This codebase is**:
- ✅ Nx monorepo with Angular 18-20.3 + Supabase
- ✅ Three SPAs: reward-chart, family-calendar (production), last-player-standing (development)
- ✅ CI-gated release branch strategy with auto-merge
- ✅ Uses modern Angular patterns (standalone, Signals, inject(), NgModule)
- ✅ Shared Tailwind design system in libs/
- ✅ Stripe payments integration (Last Player Standing)

**Key characteristics**:
- Personal playground for AI-assisted development
- Pragmatic over perfect (bundle size, test coverage acceptable)
- Multiple state management patterns (RxJS, Signals, inject())
- Multiple Angular architectures (standalone vs NgModule)
- Authentication implemented in Last Player Standing via Supabase
- CI-gated deployments ensure quality in production
- Well-documented for AI agent navigation

**When extending**:
- Follow existing patterns within each app
- Use Nx generators for new code
- Update this document when architecture changes
- Test production builds before deploying
- Commit messages should be clear and conventional

**Most important files for AI agents**:
1. This document (`docs/architecture.md`) - Complete system overview
2. `docs/ui-architecture.md` - Frontend architecture deep dive
3. `docs/brief.md` - Reward chart app requirements
4. `apps/*/src/app/services/*.service.ts` - State and backend logic
5. `libs/tailwind-preset/src/index.ts` - Design system tokens
