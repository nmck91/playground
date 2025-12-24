# Football Director - Source Tree Organization

## Project Location

**Path**: `/Users/nmckinney/dev/playground/apps/football-director`

**Type**: Next.js Application in Nx Monorepo

## High-Level Structure

```
playground/ (workspace root)
├── apps/
│   └── football-director/        # Next.js PWA application
│       ├── src/                  # Application source code
│       ├── public/               # Static assets
│       ├── next.config.js        # Next.js + PWA configuration
│       ├── tailwind.config.js    # Tailwind configuration
│       └── project.json          # Nx project configuration
├── libs/
│   └── football-director-engine/ # Game logic library (24+ modules)
│       └── src/lib/              # TypeScript modules
└── docs/
    └── architecture/             # Architecture documentation
```

## Application Structure (apps/football-director/src)

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers, navigation
│   ├── page.tsx                  # Dashboard (main game page)
│   ├── template.tsx              # Page transition wrapper
│   ├── global.css                # Global styles, Tailwind imports
│   ├── fixtures/page.tsx         # Fixtures list page
│   ├── squad/page.tsx            # Squad management page
│   ├── stats/page.tsx            # League statistics page
│   ├── table/page.tsx            # League table page
│   ├── tactics/page.tsx          # Tactics selection page
│   ├── transfers/page.tsx        # Transfer market page
│   ├── staff/page.tsx            # Staff management page
│   ├── match/[id]/page.tsx       # Match detail page (dynamic route)
│   ├── more/page.tsx             # More options page
│   ├── records/page.tsx          # Records page
│   ├── trophies/page.tsx         # Trophy cabinet page
│   ├── news/page.tsx             # News feed page
│   └── api/hello/route.ts        # Sample API route (unused in practice)
├── components/
│   ├── game/                     # Game-specific components
│   │   ├── MatchHighlights.tsx   # Match results modal
│   │   ├── DevelopmentReport.tsx # Player development modal
│   │   ├── SeasonEvaluation.tsx  # Season end evaluation modal
│   │   ├── TopPerformersWidget.tsx # Dashboard widget
│   │   ├── PlayerStatsModal.tsx  # Player statistics modal
│   │   ├── RecordsModal.tsx      # Club records modal
│   │   ├── TrophyCabinet.tsx     # Trophy display
│   │   ├── AchievementToast.tsx  # Achievement notifications
│   │   ├── NewsFeed.tsx          # News feed component
│   │   ├── NewsTickerWidget.tsx  # Dashboard news ticker
│   │   ├── YouthAcademyModal.tsx # Youth player selection
│   │   ├── ContractNegotiationModal.tsx # Contract renewals
│   │   ├── MatchPreviewModal.tsx # Pre-match preview
│   │   ├── TacticsManager.tsx    # Tactics selection UI
│   │   └── NewsBadge.tsx         # News notification badge
│   ├── navigation/
│   │   └── BottomNav.tsx         # Mobile bottom navigation
│   ├── pwa/
│   │   ├── InstallPrompt.tsx     # PWA install banner
│   │   └── OfflineIndicator.tsx  # Offline status indicator
│   ├── saves/
│   │   ├── SaveSlotManager.tsx   # Save slot management UI
│   │   └── SaveSlotCard.tsx      # Individual save slot
│   └── ui/                       # Reusable UI components
│       ├── GradientButton.tsx
│       ├── Tabs.tsx
│       ├── CollapsibleSection.tsx
│       ├── StatCard.tsx
│       ├── ThemeToggle.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── ContractBadge.tsx
│       ├── Skeleton.tsx
│       └── index.ts              # UI exports
├── hooks/
│   └── useGameState.ts           # **CRITICAL** Main game state hook (1,220 lines)
├── providers/
│   └── ThemeProvider.tsx         # next-themes wrapper
└── services/
    └── SaveService.ts            # localStorage save/load service (653 lines)
```

## Game Engine Structure (libs/football-director-engine/src/lib)

**NOTE**: The game engine is the heart of the application. All game logic lives here, separated from the UI layer.

```
lib/
├── types.ts                      # Core type definitions (GameState, Player, Team, etc.)
├── match-simulator.ts            # Match simulation with events, goals, cards
├── season-manager.ts             # 52-week season system, fixtures generation
├── league-table-manager.ts       # Table updates, sorting, position calculations
├── transfer-market.ts            # Player transfers, AI transfer logic
├── finance-engine.ts             # Budget, wages, prize money, transactions
├── player-development.ts         # Age-based development, peak years, decline
├── contract-manager.ts           # Contract expiry, renewals, free agents
├── ai-contract-manager.ts        # AI teams contract management, free agent signing
├── morale-manager.ts             # Player morale calculation and effects
├── injury-manager.ts             # Injury simulation, recovery, suspensions
├── youth-academy-manager.ts      # Youth generation, prospect selection
├── tactics-manager.ts            # Formation, mentality, philosophy
├── news-generator.ts             # Dynamic news article generation
├── achievement-manager.ts        # Achievement tracking and unlocking
├── records-manager.ts            # Season and club records tracking
├── staff-manager.ts              # Staff hiring, firing, market generation
├── board-manager.ts              # Board objectives, satisfaction, evaluation
├── player-stats-tracker.ts       # Stats tracking, archiving, top performers
├── match-commentary.ts           # Match event narratives
├── match-preview-generator.ts    # Pre-match analysis and predictions
├── post-match-generator.ts       # Post-match analysis, interviews, quotes
├── weather-generator.ts          # Match day weather conditions
└── team-generator.ts             # League and team generation with realistic names
```

## Key Modules and Their Purpose

### State Management
- **useGameState.ts** (1,220 lines): Central orchestration of all game logic
  - Load/save game state from localStorage
  - Orchestrate weekly simulation (matches, injuries, morale, contracts, finances)
  - Coordinate all engine modules
  - Manage UI state (modals, highlights, notifications)
  - Handle user actions (buy/sell players, set tactics, hire staff)

### Save System
- **SaveService.ts** (653 lines): Persist game state to browser localStorage
  - Multi-slot saves (up to 5 slots)
  - Save metadata (team name, season, week, position, timestamps)
  - Storage optimization (limits match history, news feed, transactions)
  - Save migration system (handles old save format upgrades)
  - Export/import functionality (JSON format)

### Engine Coordination
Engine modules are stateless and pure - they take input, perform calculations, and return updated data. The useGameState hook orchestrates them in a specific order.

## Routes/Pages

- `/` - Dashboard (main game interface)
- `/squad` - Squad management, player details
- `/fixtures` - Fixture list with form guide
- `/table` - League table with form indicators
- `/stats` - League-wide statistics (top scorers, assists, team stats)
- `/transfers` - Transfer market and selling players
- `/tactics` - Formation and mentality selection
- `/match/[id]` - Detailed match report with events
- `/staff` - Staff management (hire/fire coaches, scouts)
- `/more` - Additional pages (records, trophies, news)
- `/records` - Club and season records
- `/trophies` - Trophy cabinet and achievements
- `/news` - News feed

## Documentation Files

- `apps/football-director/ROADMAP.md` - Feature roadmap with completed/planned features
- `apps/football-director/MOBILE-FIRST-PLAN.md` - Mobile-first design approach
- `docs/football-director-brief.md` - Original project brief
- `docs/football-director-spike-report.md` - Initial prototype analysis
- `docs/football-director-architecture.md` - Comprehensive architecture document
- `docs/architecture/coding-standards.md` - Coding conventions (this project)
- `docs/architecture/tech-stack.md` - Technology stack details
- `docs/architecture/source-tree.md` - This document

## Critical Files for Understanding the System

**Application Root:**
- `src/app/page.tsx` - Dashboard page with game state management
- `src/app/layout.tsx` - Root layout with theme provider, navigation, PWA components
- `project.json` - Nx project targets and build configuration
- `next.config.js` - Next.js config with PWA setup (next-pwa)
- `tailwind.config.js` - Tailwind configuration using shared workspace preset

**Core State Management:**
- `src/hooks/useGameState.ts` - **CRITICAL** Main game logic orchestration (1,220 lines)
- `src/services/SaveService.ts` - localStorage persistence with multi-slot saves (653 lines)

**Game Engine Library:**
- `libs/football-director-engine/src/lib/types.ts` - Core type definitions
- `libs/football-director-engine/src/lib/match-simulator.ts` - Match simulation engine
- `libs/football-director-engine/src/lib/season-manager.ts` - Season orchestration
- All other modules in `libs/football-director-engine/src/lib/`

## File Organization Principles

- One component per file
- Co-locate related components in subdirectories
- Index files for clean imports (`components/ui/index.ts`)
- Engine modules are flat (no nested directories)
- Component files use `.tsx` extension
- Engine files use `.ts` extension
