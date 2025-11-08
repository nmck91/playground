# Source Tree and Module Organization

## Project Structure (Actual)

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
│   │   └── tsconfig.app.json        # App-specific TypeScript config
│   │
│   └── reward-chart-e2e/            # Playwright E2E tests
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

## Key Modules and Their Purpose

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

**Shared Libraries:**
- `libs/tailwind-preset/src/index.ts` - Design system tokens (colors, typography, spacing, shadows)

---
