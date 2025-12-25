# Football Director - Brownfield Architecture Document

## Introduction

This document captures the **CURRENT STATE** of the Football Director application codebase, a Progressive Web App (PWA) football management game built with Next.js and React. This is AI-optimized documentation designed to enable AI agents to understand, navigate, and modify the codebase effectively.

### Document Scope

**Comprehensive documentation of entire Football Director system** - This project is a fully-featured football management simulation game where players manage a football club through multiple seasons, handling tactics, transfers, player development, finances, and more. All development tasks are expected to be performed by AI agents.

### Change Log

| Date       | Version | Description                                    | Author  |
| ---------- | ------- | ---------------------------------------------- | ------- |
| 2025-12-24 | 1.0     | Initial brownfield architecture documentation  | Winston (Architect Agent) |

---

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

**Application Root (`apps/football-director/`):**
- **Main Entry**: `src/app/page.tsx` - Dashboard page with game state management
- **App Layout**: `src/app/layout.tsx` - Root layout with theme provider, navigation, PWA components
- **App Config**: `project.json` - Nx project targets and build configuration
- **Next Config**: `next.config.js` - Next.js config with PWA setup (next-pwa)
- **Build**: `tailwind.config.js` - Tailwind configuration using shared workspace preset

**Core State Management:**
- **Game State Hook**: `src/hooks/useGameState.ts` - **CRITICAL** Main game logic orchestration (1,220 lines)
- **Save Service**: `src/services/SaveService.ts` - localStorage persistence with multi-slot saves (653 lines)

**Game Engine Library (`libs/football-director-engine/src/lib/`):**
- **Types**: `types.ts` - Core type definitions (GameState, Player, Team, Match, etc.)
- **Match Simulator**: `match-simulator.ts` - Match simulation engine with detailed events
- **Season Manager**: `season-manager.ts` - 52-week season orchestration, fixtures generation
- **League Table Manager**: `league-table-manager.ts` - Table updates, sorting, position tracking
- **Cup Manager**: `cup-manager.ts` - Cup competition system with knockout mechanics
- **Transfer Market**: `transfer-market.ts` - Player transfer system, AI transfer logic
- **Finance Engine**: `finance-engine.ts` - Budget management, wage processing
- **Player Development**: `player-development.ts` - Age-based skill progression
- **Contract Manager**: `contract-manager.ts` - Player contract system (wages, expiry, renewals)
- **AI Contract Manager**: `ai-contract-manager.ts` - AI teams' contract management
- **Morale Manager**: `morale-manager.ts` - Player happiness system affecting performance
- **Injury Manager**: `injury-manager.ts` - Injury simulation, suspensions, recovery
- **Youth Academy**: `youth-academy-manager.ts` - Youth player generation and selection
- **Tactics Manager**: `tactics-manager.ts` - Formation and mentality system
- **News Generator**: `news-generator.ts` - Dynamic news article generation
- **Achievement Manager**: `achievement-manager.ts` - Achievement tracking and unlocking
- **Records Manager**: `records-manager.ts` - Season and club records tracking
- **Staff Manager**: `staff-manager.ts` - Coaching staff hiring and management
- **Board Manager**: `board-manager.ts` - Board objectives and satisfaction
- **Player Stats Tracker**: `player-stats-tracker.ts` - Match statistics tracking
- **Match Commentary**: `match-commentary.ts` - Match event narrative generation
- **Match Preview Generator**: `match-preview-generator.ts` - Pre-match analysis
- **Post Match Generator**: `post-match-generator.ts` - Post-match analysis and interviews
- **Weather Generator**: `weather-generator.ts` - Match day weather simulation
- **Team Generator**: `team-generator.ts` - League and team generation

**UI Components (`src/components/`):**
- **Navigation**: `navigation/BottomNav.tsx` - Mobile-first bottom navigation bar
- **Game Components**: `game/` - Match highlights, development reports, modals, widgets
- **UI Kit**: `ui/` - Reusable UI components (buttons, modals, badges, cards, etc.)
- **PWA**: `pwa/InstallPrompt.tsx`, `pwa/OfflineIndicator.tsx` - Progressive Web App features
- **Saves**: `saves/SaveSlotManager.tsx` - Multi-slot save management UI

**Providers:**
- **Theme Provider**: `src/providers/ThemeProvider.tsx` - Dark/light theme support using next-themes

**Routes/Pages:**
- `/` - Dashboard (main game interface)
- `/squad` - Squad management, player details
- `/fixtures` - Fixture list with form guide
- `/table` - League table with form indicators
- `/cup` - Cup competition bracket and results
- `/stats` - League-wide statistics (top scorers, assists, team stats)
- `/transfers` - Transfer market and selling players
- `/tactics` - Formation and mentality selection
- `/match/[id]` - Detailed match report with events
- `/staff` - Staff management (hire/fire coaches, scouts)
- `/more` - Additional pages (records, trophies, news)
- `/records` - Club and season records
- `/trophies` - Trophy cabinet and achievements
- `/news` - News feed

**Documentation:**
- **Roadmap**: `apps/football-director/ROADMAP.md` - Feature roadmap with completed/planned features
- **Mobile Plan**: `apps/football-director/MOBILE-FIRST-PLAN.md` - Mobile-first design approach
- **Football Director Brief**: `docs/football-director-brief.md` - Original project brief
- **Spike Report**: `docs/football-director-spike-report.md` - Initial prototype analysis

---

## High Level Architecture

### Technical Summary

**Architecture Pattern**: Next.js App Router + Client-Side Game Engine + localStorage Persistence

**Application Type**: Progressive Web App (PWA) - Single Page Application with offline support

**Key Architectural Decisions:**
- **Client-Side First**: All game logic runs in the browser, no backend server required
- **Engine Separation**: Game logic isolated in separate library (`football-director-engine`)
- **Immutable State**: Game state managed immutably with React hooks
- **Auto-Save**: Game automatically saves to localStorage after every state change
- **Multi-Slot Saves**: Up to 5 save slots with metadata (team, season, position)
- **Progressive Enhancement**: PWA with offline support, installable on mobile/desktop

### Actual Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 15.5.9 | App Router, React Server Components |
| **UI Library** | React | 19.0.0 | Client components, hooks-based architecture |
| **Language** | TypeScript | ~5.9.2 | Strict typing throughout |
| **Styling** | Tailwind CSS | ^3.4.19 | Utility-first CSS with shared workspace preset |
| **Theming** | next-themes | ^0.4.6 | Dark/light mode support |
| **Animation** | Framer Motion | ^12.23.26 | Used for UI transitions and animations |
| **PWA** | next-pwa | ^5.6.0 | Service worker, offline caching, installability |
| **Build Tool** | Nx | ^22.3.2 | Monorepo build orchestration, caching |
| **Package Manager** | npm | - | Workspace dependency management |
| **Testing** | Jest | ^29.7.0 | Unit tests for game engine (some modules) |
| **Linting** | ESLint | ^9.8.0 | Code quality enforcement |

### Repository Structure

**Type**: Nx Monorepo (football-director is one of multiple apps)

**Project Structure:**
```
playground/ (workspace root)
├── apps/
│   └── football-director/        # Next.js PWA application
│       ├── src/
│       │   ├── app/              # Next.js App Router pages
│       │   ├── components/       # React components
│       │   ├── hooks/            # React hooks (useGameState is critical)
│       │   ├── providers/        # Context providers (theme)
│       │   └── services/         # Services (SaveService)
│       ├── public/               # Static assets (icons, manifest, images)
│       ├── next.config.js        # Next.js + PWA configuration
│       ├── tailwind.config.js    # Tailwind configuration
│       └── project.json          # Nx project configuration
├── libs/
│   └── football-director-engine/ # Game logic library
│       └── src/lib/              # 24+ TypeScript modules
└── docs/
    └── football-director-architecture.md  # This document
```

---

## Source Tree and Module Organization

### Application Structure (apps/football-director/src)

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
│   ├── cup/page.tsx              # Cup competition page
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
│   │   └── YouthAcademyModal.tsx # Youth player selection
│   ├── navigation/
│   │   └── BottomNav.tsx         # Mobile bottom navigation
│   ├── pwa/
│   │   ├── InstallPrompt.tsx     # PWA install banner
│   │   └── OfflineIndicator.tsx  # Offline status indicator
│   ├── saves/
│   │   └── SaveSlotManager.tsx   # Save slot management UI
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

### Game Engine Structure (libs/football-director-engine/src/lib)

**NOTE**: The game engine is the heart of the application. All game logic lives here, separated from the UI layer.

```
lib/
├── types.ts                      # Core type definitions (GameState, Player, Team, etc.)
├── match-simulator.ts            # Match simulation with events, goals, cards, knockout mechanics
├── season-manager.ts             # 52-week season system, fixtures generation
├── league-table-manager.ts       # Table updates, sorting, position calculations
├── cup-manager.ts                # Cup competition system (knockout tournament, prize money)
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

### Key Modules and Their Purpose

**State Management (src/hooks/useGameState.ts):**
- **PURPOSE**: Central orchestration of all game logic
- **COMPLEXITY**: 1,220 lines - most complex file in the application
- **RESPONSIBILITIES**:
  - Load/save game state from localStorage
  - Orchestrate weekly simulation (matches, injuries, morale, contracts, finances)
  - Coordinate all engine modules (match simulator, season manager, finance, etc.)
  - Manage UI state (modals, highlights, notifications)
  - Handle user actions (buy/sell players, set tactics, hire staff, etc.)
- **PATTERN**: Single massive hook that returns game state and action functions
- **STATE**: Multiple useState hooks for different aspects (gameState, loading, error, results, reports, etc.)

**Save System (src/services/SaveService.ts):**
- **PURPOSE**: Persist game state to browser localStorage
- **FEATURES**:
  - Multi-slot saves (up to 5 slots)
  - Save metadata (team name, season, week, position, timestamps)
  - Storage optimization (limits match history, news feed, transactions)
  - Save migration system (handles old save format upgrades)
  - Export/import functionality (JSON format)
  - Backward compatibility with single-save format
- **STORAGE LIMITS**: Handles QuotaExceededError with aggressive optimization
- **MIGRATIONS**: Automatically migrates old saves to new schema

**Game Engine Coordination:**
The engine modules are designed to be stateless and pure - they take input, perform calculations, and return updated data. The useGameState hook orchestrates them in a specific order:

1. **Weekly Simulation Order**:
   - Process injury recoveries
   - Update player morale
   - Update contract statuses
   - Generate match previews
   - Simulate matches (MatchSimulator)
   - Process match injuries and suspensions
   - Update league table
   - Process finances
   - AI transfers and market refresh
   - Generate news articles
   - Check achievements

2. **End of Season**:
   - Process expired contracts → free agents
   - Archive player statistics
   - Apply player development
   - Generate youth academy prospects
   - Calculate season records
   - Award season prizes
   - Evaluate board satisfaction
   - Generate new season objective

---

## Data Models and APIs

### Core Data Types

The application uses TypeScript interfaces for all data models. **CRITICAL**: All types are defined in `libs/football-director-engine/src/lib/types.ts`.

**Key Type Definitions:**

**GameState** - Root state object containing all game data
```typescript
interface GameState {
  id: string;
  createdAt: Date;
  lastSaved: Date;
  playerTeam: Team;                    // Player's team
  aiTeams: Team[];                     // All other teams (19 teams)
  season: Season;                       // Current season info
  fixtures: Fixture[];                  // All fixtures (friendlies + competitive)
  leagueTable: LeagueTableEntry[];     // Current standings
  finances: Finances;                   // Budget, income, expenses
  matchHistory: MatchResult[];         // Played matches
  transferMarket: TransferListing[];   // Available players
  staffMarket: Staff[];                // Available staff
  freeAgents: FreeAgent[];             // Players with expired contracts
  boardStatus: BoardStatus;            // Board satisfaction and objectives
  seasonRecords: SeasonRecords[];      // Historical season data
  clubRecords: ClubRecords;            // Best-ever records
  achievements: Achievement[];         // All achievements (locked/unlocked)
  seasonAwards: SeasonAward[];         // End-of-season awards
  newsFeed: NewsArticle[];             // Generated news articles
  matchPreviews?: MatchPreview[];      // Pre-match analysis
}
```

**Player** - Individual player data
```typescript
interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  skill: number;                 // 1-20 scale
  age: number;
  wages: number;                 // Weekly wage
  stats: PlayerStats;            // Season and career stats
  history: PlayerHistoryRecord[]; // Historical seasons
  injury?: Injury;               // Current injury status
  suspendedUntil?: number;       // Week number when suspension ends
  contract?: PlayerContract;     // Contract details
  morale?: number;               // Happiness (0-100)
}
```

**Team** - Team data structure
```typescript
interface Team {
  id: string;
  name: string;
  players: Player[];
  staff: Staff[];
  budget: number;
  formation: FormationType;      // e.g., '4-4-2', '4-3-3'
  mentality: Mentality;          // 'defensive', 'balanced', 'attacking'
  philosophy?: ClubPhilosophy;   // Playing style
}
```

**Season** - 52-week season structure
```typescript
interface Season {
  year: number;                  // e.g., 2024
  currentWeek: number;           // 1-52
  totalWeeks: number;            // Always 52
  competitiveWeeks: number;      // Always 38
  preSeasonWeeks: number;        // Always 7
  status: 'in-progress' | 'completed';
  phase: 'pre-season' | 'competitive' | 'off-season';
  transferWindow: 'open' | 'closed';
}
```

**Fixture** - Match fixture
```typescript
interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  week: number;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  matchType: 'friendly' | 'competitive';
}
```

**MatchResult** - Match outcome with events
```typescript
interface MatchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  week: number;
  season: number;
  events?: MatchEvent[];         // Goals, cards, penalties
  manOfMatch?: MatchManOfMatch;
  attendance?: number;
  weather?: WeatherCondition;
  postMatchAnalysis?: PostMatchAnalysis;
}
```

### No External APIs

**IMPORTANT**: This application has NO backend API. All data lives in the browser:
- **Storage**: localStorage only
- **Persistence**: Automatic on every state change
- **Network**: None (fully offline-capable PWA)

---

## Technical Debt and Known Issues

### Current Technical Debt

1. **Massive Game State Hook**:
   - **File**: `src/hooks/useGameState.ts`
   - **Issue**: 1,220 lines in a single hook
   - **Impact**: Difficult to maintain, test, and understand
   - **Ideal**: Break into multiple smaller hooks or use state management library
   - **Reality**: Works reliably but needs refactoring for long-term maintainability

2. **No Backend Architecture**:
   - **Issue**: All game state in browser localStorage
   - **Limitations**:
     - No cross-device sync
     - Storage quota limits (~10MB typical)
     - Data loss if localStorage cleared
   - **Mitigation**: Storage optimization, export/import feature exists
   - **Note**: Intentional design choice for simplicity

3. **Limited Test Coverage**:
   - **Status**: Some unit tests exist for engine modules (`.spec.ts` files)
   - **Coverage**: Estimated 20-30% coverage
   - **Missing**: No integration tests, no E2E tests
   - **Impact**: Regressions possible when modifying complex logic

4. **Engine Module Organization**:
   - **Issue**: 24+ separate module files, some overlap in responsibility
   - **Example**: News generation scattered across multiple modules
   - **Impact**: Finding where to make changes can be challenging
   - **Pattern**: Each module is stateless/pure which helps

5. **Type Migrations in GameState**:
   - **Issue**: Multiple optional fields due to backward compatibility
   - **Example**: `contract?: PlayerContract`, `morale?: number`
   - **Impact**: Need null checks throughout codebase
   - **Reason**: Save file migration support for older versions

6. **PWA Configuration**:
   - **Issue**: next-pwa v5 (older version, v6 exists)
   - **Note**: Disabled in development mode
   - **Impact**: Testing PWA features requires production build

### Known Workarounds and Gotchas

1. **localStorage Quota**:
   - **Issue**: Browser limits storage to ~5-10MB
   - **Workaround**: SaveService optimizes by:
     - Limiting match history to last 76 matches
     - Pruning news feed to last 100 items
     - Limiting transactions to last 50
     - Removing AI team player history
   - **Fallback**: If quota exceeded, applies aggressive optimization

2. **Save Migrations**:
   - **Issue**: Old saves may not have newer fields
   - **Workaround**: SaveService.loadFromSlot applies migrations
   - **Important**: Always add new fields as optional in types
   - **Example**: When adding contracts, code checks `if (player.contract)` before accessing

3. **Season Week Numbers**:
   - **System**: 52-week season (weeks 1-52)
   - **Breakdown**:
     - Weeks 1-7: Pre-season (transfer window open)
     - Weeks 4-6: Friendly matches
     - Weeks 8-45: Competitive season
     - Weeks 46-52: Off-season (transfer window open weeks 46-52)
   - **Gotcha**: Many engine modules check week ranges, ensure consistency

4. **Match Simulation Randomness**:
   - **Issue**: Uses Math.random() throughout
   - **Impact**: Non-deterministic results
   - **Note**: Intended behavior for gameplay variety
   - **Consideration**: Cannot reproduce exact match results

5. **Hydration Mismatches**:
   - **Issue**: Theme toggle causes React hydration warnings
   - **Workaround**: `suppressHydrationWarning` on `<html>` tag
   - **Reason**: Theme determined client-side, not during SSR

6. **Monorepo Context**:
   - **Issue**: Football Director coexists with Angular apps in same repo
   - **Different**: Uses Next.js/React while other apps use Angular
   - **Impact**: Different build tools, different patterns
   - **Note**: Well-isolated, minimal conflicts

---

## Integration Points and External Dependencies

### Workspace Dependencies

**Shared Libraries:**
- `@playground/football-director-engine` - Game logic library (local, this project)
- `@playground/tailwind-preset` - Shared Tailwind design tokens (local workspace library)

**No External Services:**
- No database
- No backend API
- No authentication service
- No analytics (could be added)
- No payment processing

### Browser APIs Used

1. **localStorage**:
   - Game saves
   - Active slot tracking
   - Save metadata

2. **Service Worker** (via next-pwa):
   - Offline caching
   - Resource pre-caching
   - Runtime caching strategies

3. **Web App Manifest**:
   - PWA installability
   - App icons and splash screens
   - Display mode (standalone)

4. **matchMedia** (via next-themes):
   - System theme detection
   - Dark/light mode preference

---

## Development and Deployment

### Local Development Setup

1. **Prerequisites**:
   - Node.js (version in package.json: not strictly specified, recommend v18+)
   - npm (package manager)
   - Nx CLI (optional but recommended: `npm install -g nx`)

2. **Install Dependencies**:
   ```bash
   cd /Users/nmckinney/dev/playground
   npm install
   ```

3. **Run Development Server**:
   ```bash
   # Using Nx
   nx dev football-director

   # Or from project directory
   cd apps/football-director
   npx next dev
   ```
   - Runs on http://localhost:3000
   - Hot reload enabled
   - PWA disabled in dev mode

4. **Build for Production**:
   ```bash
   nx build football-director
   # or
   npx next build
   ```

5. **Linting**:
   ```bash
   nx lint football-director
   ```

6. **Testing** (engine only):
   ```bash
   nx test football-director-engine
   ```

### Project Structure Commands

**Nx Targets** (from project.json):
- `nx dev football-director` - Start development server
- `nx build football-director` - Production build
- `nx start football-director` - Start production server (requires build first)
- `nx lint football-director` - Run ESLint

### Build Process

**Build Pipeline**:
1. TypeScript compilation
2. Next.js build (App Router)
3. PWA service worker generation (next-pwa)
4. Static optimization
5. Output to `.next/` directory

**Build Configuration**:
- TypeScript: `tsconfig.json` (strict mode enabled)
- Next.js: `next.config.js` (PWA, SWC compiler)
- Tailwind: `tailwind.config.js` (shared preset)
- Nx: `project.json` (build orchestration)

### Deployment

**Current Status**: Not deployed (development only)

**Deployment Options**:
- **Vercel**: Optimal choice (Next.js native platform)
- **Netlify**: Works well with Next.js
- **Static Export**: Could use `next export` for pure static hosting
- **Self-Hosted**: Node.js server required

**Deployment Considerations**:
- PWA requires HTTPS
- Service worker requires HTTPS (except localhost)
- No backend needed (all client-side)
- No environment variables currently used
- No build-time secrets needed

---

## Testing Reality

### Current Test Coverage

**Engine Library Tests**:
- Files: `*.spec.ts` in `libs/football-director-engine/src/lib/`
- Found tests for:
  - `player-development.spec.ts`
  - `season-manager.spec.ts`
  - `league-table-manager.spec.ts`
- Coverage: Partial (estimated 20-30% of engine)

**Application Tests**:
- **Status**: NO tests for React components
- **No Tests For**:
  - useGameState hook
  - SaveService
  - UI components
  - Pages
  - Integration testing

### Running Tests

```bash
# Run engine tests
nx test football-director-engine

# Run with coverage
nx test football-director-engine --coverage

# Run in watch mode
nx test football-director-engine --watch
```

**Test Framework**:
- Jest 29.7.0
- ts-jest for TypeScript
- Configuration: `jest.config.ts` in engine library

### Testing Gaps

**Critical Untested Areas**:
1. Game state orchestration (useGameState)
2. Save/load functionality
3. UI component behavior
4. Match simulation edge cases
5. Contract expiry logic
6. End-of-season transitions

**Testing Recommendations** (if adding tests):
- Unit test each engine module
- Integration test useGameState simulation flow
- Test SaveService with mock localStorage
- Snapshot tests for UI components
- E2E tests for critical game flows

---

## Code Patterns and Conventions

### Architectural Patterns

**Separation of Concerns**:
- **Engine Layer**: Pure TypeScript, no React/UI dependencies
- **Application Layer**: React components, hooks, routing
- **Service Layer**: Minimal (only SaveService for now)

**State Management**:
- **Pattern**: Single source of truth (GameState in useGameState)
- **Updates**: Immutable state updates with spread operators
- **Persistence**: Auto-save on every state change
- **Derivation**: Calculate derived state (like top performers) via useEffect

**Component Patterns**:
- **Client Components**: All components use `'use client'` directive
- **Modals**: Controlled by parent state (show/hide flags)
- **Forms**: Controlled components with local state
- **Loading States**: Skeleton screens for async operations

**Engine Module Pattern**:
```typescript
// Each engine module exports:
// 1. Interfaces/types specific to that module
// 2. A class with static or instance methods
// 3. Pure functions that take state, return new state

export class MatchSimulator {
  simulateMatch(
    homeTeam: Team,
    awayTeam: Team,
    // ...other params
  ): MatchResult {
    // Pure logic, no side effects
    return result;
  }
}
```

### Coding Conventions

**TypeScript**:
- Strict mode enabled
- Explicit return types preferred
- Interface over type for object shapes
- Enum usage minimal (prefer string literal unions)

**React**:
- Function components only (no class components)
- Hooks for state and side effects
- Props destructuring in function parameters
- Component files use `.tsx` extension

**Naming**:
- Components: PascalCase (`PlayerStatsModal.tsx`)
- Hooks: camelCase with `use` prefix (`useGameState.ts`)
- Engine classes: PascalCase (`MatchSimulator`)
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase (no `I` prefix)

**File Organization**:
- One component per file
- Co-locate related components in subdirectories
- Index files for clean imports (`components/ui/index.ts`)
- Engine modules are flat (no nested directories)

**Styling**:
- Tailwind utility classes in JSX
- No CSS modules
- Theme colors via Tailwind config
- Dark mode: `dark:` prefix utilities

---

## AI Agent Guidelines

### Working with This Codebase

**For Feature Development**:

1. **Start Here**:
   - Read `ROADMAP.md` for planned features
   - Check `types.ts` for data structure
   - Review useGameState to understand flow

2. **Engine Changes**:
   - Add logic to appropriate module in `libs/football-director-engine/src/lib/`
   - Keep modules stateless and pure
   - Update types.ts if adding new data structures
   - Export new modules from `index.ts`

3. **UI Changes**:
   - Add/modify components in `src/components/`
   - Update useGameState for new actions
   - Add new routes in `src/app/` if needed
   - Update BottomNav if adding main navigation

4. **State Changes**:
   - Modify GameState interface in types.ts
   - Add migration logic in SaveService if needed
   - Make new fields optional for backward compatibility
   - Update useGameState to handle new state

**For Bug Fixes**:

1. **Reproduce**:
   - Understand which week/phase triggers issue
   - Check browser console for errors
   - Review relevant engine module

2. **Locate**:
   - For game logic: Search engine modules
   - For UI: Search components
   - For saves: Check SaveService
   - For state: Review useGameState

3. **Fix**:
   - Prefer minimal changes
   - Maintain immutability
   - Test across multiple game weeks
   - Verify save/load still works

**For Refactoring**:

1. **High-Value Targets**:
   - Breaking up useGameState (1,220 lines)
   - Consolidating news generation
   - Adding tests to critical modules
   - Type safety improvements

2. **Caution Areas**:
   - SaveService migrations (breaking saves is bad)
   - Match simulation (complex, interconnected)
   - Contract system (affects AI behavior)
   - Season transitions (many edge cases)

### Important Context

**Season System** (52 weeks):
- Pre-season: Weeks 1-7 (transfer window open)
- Friendlies: Weeks 4-6
- Competitive: Weeks 8-45 (38 match weeks)
- Off-season: Weeks 46-52 (transfer window weeks 46-52)

**Development Timing**:
- Player development occurs at week 52 (season end)
- Development varies by age (peak at 24-28)
- Youth academy offers prospects at week 52

**Financial Timing**:
- Wages deducted weekly
- Match day income on home matches
- Prize money based on final position
- Transactions tracked for history

**AI Behavior**:
- AI transfers during windows (probabilistic)
- AI contract renewals every 4 weeks
- AI signs free agents during windows
- AI tactics are static (set during generation)

**Save System**:
- Auto-save after every action
- Multi-slot (up to 5 saves)
- Storage optimization applied
- Migration system for old saves

---

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
nx dev football-director              # Start dev server
nx lint football-director             # Lint code
nx test football-director-engine      # Run engine tests

# Build
nx build football-director            # Production build
nx build football-director --configuration=production

# Nx utilities
nx graph                              # View project graph
nx show project football-director     # Show project details
nx reset                              # Clear Nx cache

# From football-director directory
cd apps/football-director
npx next dev                          # Start dev server
npx next build                        # Build
npx next start                        # Start prod server
```

### Debugging and Troubleshooting

**Common Issues**:

1. **Build Errors**:
   - Clear Nx cache: `nx reset`
   - Clear Next cache: `rm -rf apps/football-director/.next`
   - Reinstall: `rm -rf node_modules && npm install`

2. **localStorage Full**:
   - Symptoms: Save fails silently or with quota error
   - Solution: Export saves, clear localStorage, import back
   - Check: DevTools → Application → localStorage

3. **Hydration Warnings**:
   - Common with theme toggle
   - Usually harmless
   - Caused by client/server mismatch

4. **PWA Not Updating**:
   - PWA disabled in development
   - Need production build to test: `nx build && nx start`
   - Clear service worker: DevTools → Application → Service Workers → Unregister

**Development Tools**:
- React DevTools: Inspect component tree
- Redux DevTools: Not used (no Redux)
- Nx Console (VS Code extension): GUI for Nx commands
- localStorage Inspector: DevTools → Application → Storage

**Key Debugging Locations**:
- Game state: `useGameState` hook state variables
- Save data: localStorage → `football-director-saves`
- Match results: `lastSimulationResults` in useGameState
- Console errors: Look for engine module stack traces

---

## Summary for AI Agents

**Quick Orientation**:

This is a **client-side Progressive Web App** football management game built with **Next.js 15 + React 19**. All game logic lives in a separate TypeScript library (`football-director-engine`) with 24+ modules handling match simulation, player development, transfers, finances, and more.

**Architecture**:
- State managed by massive `useGameState` hook (1,220 lines)
- Persistence via localStorage (multi-slot saves)
- No backend, no database, fully offline-capable
- PWA with service worker caching

**Key Files to Know**:
1. `hooks/useGameState.ts` - Game orchestration
2. `services/SaveService.ts` - Save/load system
3. `libs/football-director-engine/src/lib/types.ts` - All data types
4. `libs/football-director-engine/src/lib/match-simulator.ts` - Match engine
5. `libs/football-director-engine/src/lib/season-manager.ts` - Season flow

**When Making Changes**:
- Engine changes: Add logic to appropriate module in libs/football-director-engine
- UI changes: Modify components in src/components/
- State changes: Update types.ts, add migration in SaveService, handle in useGameState
- New features: Check ROADMAP.md for planned work

**Critical Rules**:
- ✅ Keep engine modules pure and stateless
- ✅ Make new GameState fields optional for migration
- ✅ Test save/load after state structure changes
- ✅ Maintain immutable state updates
- ❌ Don't break the 52-week season system
- ❌ Don't modify SaveService without migration plan
- ❌ Don't add dependencies to engine library

**Tech Stack**:
Next.js 15, React 19, TypeScript, Tailwind, next-pwa, next-themes, Framer Motion

**Development**:
`nx dev football-director` → http://localhost:3000

---

**Document Version**: 1.0
**Last Updated**: 2025-12-24
**For**: AI Agents and Developers
**Project**: Football Director PWA Game
