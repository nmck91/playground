# Quick Reference - Key Files and Entry Points

## Critical Files for Understanding the System

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

**Shared Libraries (`libs/`):**
- **Tailwind Preset**: `libs/tailwind-preset/src/index.ts` - Shared design system tokens

**Documentation (`docs/`):**
- **Project Brief**: `docs/brief.md` - Reward chart app requirements and vision
- **UI Architecture**: `docs/ui-architecture.md` - Comprehensive frontend architecture documentation
- **Database Schemas**: `docs/supabase-schema.sql`, `docs/supabase-schema-simple.sql`
- **Deployment Guides**: `docs/VERCEL-SETUP.md`, `docs/deployment-standard.md`
- **Quick Start**: `docs/QUICK-START.md` - Getting started guide

---
