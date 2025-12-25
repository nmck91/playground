# Football Director - Brownfield Enhancement PRD

## Introduction

This document captures the comprehensive technical refactoring and feature enhancement plan for the Football Director application. This PRD prioritizes **technical debt resolution and architectural improvements** before adding new game features, ensuring a solid foundation for long-term development.

### Document Scope

**Phase 1 (PRIORITY)**: Technical Foundation - Complete refactoring of state management, testing infrastructure, backend architecture, and code organization.

**Phase 2 (FUTURE)**: Feature Enhancements - Multiple leagues, competition systems, happiness/sentiment tracking, and AI-driven insights.

### Change Log

| Date       | Version | Description                          | Author |
| ---------- | ------- | ------------------------------------ | ------ |
| 2025-12-24 | 1.0     | Initial brownfield enhancement PRD   | Sarah (Product Owner) |

---

## Existing Project Overview

### Analysis Source

- **Document-project output available**: `docs/football-director-architecture.md`
- **Supplementary docs**: `docs/architecture/coding-standards.md`, `tech-stack.md`, `source-tree.md`
- **IDE-based analysis**: Current codebase state analyzed

### Current Project State

Football Director is a **client-side Progressive Web App (PWA)** football management simulation game built with Next.js 15, React 19, and TypeScript. The game features:

- **52-week season system** with pre-season, competitive matches, and off-season
- **Complete football management**: Squad management, transfers, tactics, finances, staff, youth academy
- **Advanced simulation**: Match engine with events, player development, morale, injuries, contracts
- **Progressive features**: Achievements, records, news generation, board objectives
- **24+ game engine modules** in separate TypeScript library
- **localStorage persistence** with multi-slot save system (up to 5 slots)
- **Mobile-first PWA** with offline support, installable on devices

**Current Status**: In active development, not yet deployed to production.

---

## Available Documentation Analysis

### Available Documentation

- ✅ Tech Stack Documentation (`docs/architecture/tech-stack.md`)
- ✅ Source Tree/Architecture (`docs/architecture/source-tree.md`, `docs/football-director-architecture.md`)
- ✅ Coding Standards (`docs/architecture/coding-standards.md`)
- ✅ API Documentation (No external APIs - fully client-side)
- ⚠️ Technical Debt Documentation (Documented in architecture doc)
- ❌ UX/UI Guidelines (Mobile-first approach documented, no formal guidelines)
- ❌ Comprehensive test documentation (minimal testing currently)

**Status**: Using existing project analysis from document-project output (comprehensive 970-line architecture document created today).

---

## Enhancement Scope Definition

### Enhancement Type

- ✅ **Technology Stack Upgrade** (Zustand state management)
- ✅ **Performance/Scalability Improvements** (Backend architecture, code organization)
- ✅ **Bug Fix and Stability Improvements** (Comprehensive testing)
- ✅ **New Feature Addition** (Phase 2: Leagues, competitions, happiness systems)

### Enhancement Description

**Phase 1 - Technical Foundation (PRIORITY):**

This phase focuses on resolving critical technical debt and establishing a robust architectural foundation. The massive 1,220-line useGameState hook will be migrated to Zustand state management, comprehensive testing infrastructure will be implemented, an optional backend will be added for cloud saves while maintaining localStorage fallback, and engine modules will be reorganized for better maintainability.

**Phase 2 - Feature Enhancements (FUTURE):**

Building on the improved foundation, this phase will expand game depth with multiple league tiers, promotion/relegation systems, European and domestic cup competitions, comprehensive happiness tracking for players/coaches/fans, and AI-driven insights providing actionable recommendations.

### Impact Assessment

- ✅ **Major Impact (architectural changes required)** - Phase 1 involves fundamental refactoring of state management, introduction of backend services, and comprehensive reorganization of code structure.

---

## Goals and Background Context

### Goals

**Phase 1 - Technical Foundation:**
- Refactor state management from massive 1,220-line hook to maintainable Zustand architecture
- Establish comprehensive testing infrastructure (unit, integration, E2E) to prevent regressions
- Implement optional backend architecture enabling cloud saves and cross-device sync
- Reorganize 24+ engine modules for better boundaries, reduced overlap, and improved maintainability
- Improve type safety by eliminating optional field proliferation and migration complexity
- Upgrade PWA configuration to modern standards

**Phase 2 - Feature Enhancements:**
- Expand single-league game to multi-tier league system with realistic promotion/relegation
- Add prestigious European competitions (Champions League, Europa League, etc.)
- Implement domestic cup competitions (FA Cup, League Cup) with knockout formats
- Create comprehensive happiness/sentiment tracking for players, coaches, and fans
- Develop AI-driven insight engine providing actionable recommendations for club management
- Enable strategic depth through multi-season planning across league positions

### Background Context

The Football Director game has grown organically to include extensive features (52-week seasons, transfers, youth academy, morale, injuries, contracts, achievements, news, etc.), but the architecture has accumulated significant technical debt. The central useGameState hook has ballooned to 1,220 lines, making it difficult to maintain, test, and extend. With no production deployment yet, this is the optimal time to refactor the foundation before adding complex features like multiple leagues and competitions.

The current localStorage-only architecture limits scalability and user experience (no cross-device sync, storage quota issues). Breaking changes are acceptable at this stage, enabling proper architectural improvements. Phase 1 establishes the robust foundation needed for Phase 2's ambitious feature expansion, ensuring long-term maintainability and enabling AI agents to work effectively with the codebase.

---

## Requirements

### Functional Requirements - Phase 1 (Technical Foundation)

**State Management Migration:**
- **FR1**: Migrate game state management from 1,220-line useGameState hook to Zustand store architecture
- **FR2**: Create separate Zustand stores for distinct domains (match, transfer, finance, player, season, ui)
- **FR3**: Implement store actions with clear, testable business logic separated from React components
- **FR4**: Maintain all existing game functionality during migration without feature loss
- **FR5**: Provide Redux DevTools integration for state debugging and inspection

**Testing Infrastructure:**
- **FR6**: Implement unit tests for all 24+ game engine modules with >80% coverage target
- **FR7**: Create integration tests for Zustand store orchestration and cross-store interactions
- **FR8**: Develop E2E test suite covering critical user flows (new game, season simulation, transfers, saves)
- **FR9**: Set up continuous integration pipeline running tests on every commit
- **FR10**: Generate code coverage reports and enforce minimum coverage thresholds

**Backend Architecture:**
- **FR11**: Design and implement RESTful API for game save/load operations with authentication
- **FR12**: Create cloud database schema for game saves with user accounts and metadata
- **FR13**: Implement localStorage fallback ensuring offline-first PWA functionality remains intact
- **FR14**: Build automatic sync mechanism detecting online status and syncing saves bidirectionally
- **FR15**: Provide save conflict resolution for offline changes synced later
- **FR16**: Support save export/import in JSON format for data portability

**Engine Module Reorganization:**
- **FR17**: Consolidate scattered news generation logic into unified NewsEngine module
- **FR18**: Define clear module interfaces with explicit dependencies and data contracts
- **FR19**: Implement dependency injection pattern enabling module testing in isolation
- **FR20**: Create module documentation describing responsibilities, inputs, and outputs
- **FR21**: Reduce module count through logical consolidation while maintaining separation of concerns

**Type Safety Improvements:**
- **FR22**: Eliminate optional fields in core GameState interface requiring null checks everywhere
- **FR23**: Implement discriminated unions for game state versioning and migrations
- **FR24**: Create type guards and utility functions for runtime type validation
- **FR25**: Establish strict TypeScript configuration preventing implicit any and unsafe operations

**PWA Upgrades:**
- **FR26**: Upgrade next-pwa from v5 to latest stable version with improved caching strategies
- **FR27**: Implement proper service worker lifecycle management and update notifications
- **FR28**: Optimize PWA caching strategy for faster offline performance

### Functional Requirements - Phase 2 (Feature Enhancements)

**Multi-League System:**
- **FR29**: Implement configurable league pyramid structure (Premier League, Championship, League One, League Two)
- **FR30**: Create promotion/relegation system with configurable team counts (default: top 3 promoted, bottom 3 relegated)
- **FR31**: Generate realistic teams across all league tiers with skill distributions appropriate to division
- **FR32**: Enable player career progression tracking across teams in different leagues
- **FR33**: Implement league-specific prize money, attendance, and financial models

**Competition Systems:**
- **FR34**: Implement European competitions (Champions League, Europa League, Conference League) with qualification based on league position
- **FR35**: Create domestic cup competitions (FA Cup, League Cup) with multi-round knockout formats
- **FR36**: Schedule cup fixtures within existing 52-week season framework without conflicts
- **FR37**: Implement cup-specific rules (replays, away goals, extra time, penalties)
- **FR38**: Award cup trophies and add to trophy cabinet with achievement tracking

**Happiness/Sentiment System:**
- **FR39**: Implement player happiness system influenced by playing time, wages, team performance, and ambition
- **FR40**: Create coach happiness tracking based on budget, board support, results, and job security
- **FR41**: Develop fan happiness metrics affected by results, style of play, signings, and club ambition
- **FR42**: Expand board satisfaction system with more nuanced expectations and responses
- **FR43**: Trigger events and consequences based on happiness levels (players requesting transfers, coach resignations, fan protests)

**AI Insights & Recommendations:**
- **FR44**: Develop insight engine analyzing game state and identifying issues (weak positions, unhappy players, financial problems)
- **FR45**: Generate actionable recommendations with clear next steps (sign specific position, improve morale, adjust tactics)
- **FR46**: Present insights contextually at appropriate times (weekly reports, post-match, transfer windows)
- **FR47**: Implement priority ranking for insights helping user focus on most critical issues
- **FR48**: Provide "take action" buttons enabling direct execution of recommendations

### Non-Functional Requirements

**Performance:**
- **NFR1**: Match simulation must complete within 2 seconds on typical hardware to maintain gameplay flow
- **NFR2**: State updates in Zustand must trigger re-renders only for affected components (optimized selectors)
- **NFR3**: Backend API responses (save/load) must complete within 3 seconds on standard connection
- **NFR4**: PWA must remain responsive during offline usage with no degradation
- **NFR5**: Application bundle size must not exceed 500KB gzipped for initial load performance

**Maintainability:**
- **NFR6**: All new code must include TypeScript types with strict mode compliance
- **NFR7**: Modules must have single responsibility with clear interfaces
- **NFR8**: Code complexity metrics (cyclomatic complexity) must stay below 10 per function
- **NFR9**: All public functions and modules must have JSDoc documentation
- **NFR10**: Code must pass ESLint rules with zero warnings

**Testing:**
- **NFR11**: Unit test coverage must exceed 80% for engine modules
- **NFR12**: Integration test coverage must exceed 70% for store orchestration
- **NFR13**: E2E tests must cover all critical user paths with >95% success rate
- **NFR14**: Tests must run in under 5 minutes in CI pipeline
- **NFR15**: All tests must be deterministic and not depend on timing or randomness

**Reliability:**
- **NFR16**: Application must gracefully handle localStorage quota exceeded errors
- **NFR17**: Backend API must handle network failures with retry logic and user feedback
- **NFR18**: Save data must be validated before persistence to prevent corruption
- **NFR19**: Application must recover gracefully from invalid state without crashing
- **NFR20**: Error boundaries must catch React errors and display user-friendly messages

**Scalability:**
- **NFR21**: Backend architecture must support 10,000+ concurrent users (future-proofing)
- **NFR22**: Database schema must efficiently handle millions of save records
- **NFR23**: API must implement rate limiting to prevent abuse
- **NFR24**: Codebase must support addition of new leagues/competitions without major refactoring

**Security:**
- **NFR25**: Backend API must implement secure authentication (JWT or session-based)
- **NFR26**: User data must be encrypted at rest in database
- **NFR27**: API must validate and sanitize all inputs to prevent injection attacks
- **NFR28**: Sensitive operations must require re-authentication
- **NFR29**: HTTPS must be enforced for all API communications

### Compatibility Requirements

**CR1: Data Migration Strategy**
- **Requirement**: Provide clear migration path from current localStorage saves to new backend saves
- **Approach**: Build migration tool that reads localStorage saves, validates data, and uploads to backend with user confirmation
- **Note**: Breaking changes acceptable for save format during Phase 1, but provide migration utility

**CR2: Browser Compatibility**
- **Requirement**: Maintain support for modern browsers (Chrome/Edge/Firefox/Safari, last 2 versions)
- **Approach**: Continue using Next.js which handles transpilation and polyfills
- **Testing**: E2E tests must run across supported browser matrix

**CR3: Mobile Device Compatibility**
- **Requirement**: Maintain current mobile-first PWA functionality across iOS and Android
- **Approach**: Continue responsive design, test on physical devices
- **Note**: Backend sync must work seamlessly on mobile with intermittent connectivity

**CR4: Offline-First Architecture**
- **Requirement**: Application must remain fully functional offline even with backend integration
- **Approach**: localStorage fallback, queue sync operations, handle conflicts on reconnection
- **Critical**: Never regress offline capabilities during backend implementation

**CR5: API Versioning**
- **Requirement**: Backend API must support versioning to enable future schema changes
- **Approach**: Implement /api/v1/ prefix, support multiple versions during transitions
- **Benefit**: Allows gradual rollout of breaking changes without forcing all users to upgrade

**CR6: Module Interface Stability**
- **Requirement**: Engine module reorganization must maintain stable interfaces for existing consumers
- **Approach**: Define clear public APIs, mark internal functions, use semantic versioning
- **Testing**: Integration tests ensure module consumers aren't broken by refactoring

---

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Based on document-project analysis:**

**Languages**: TypeScript ~5.9.2 (strict mode)
**Frameworks**: Next.js 15.5.9 (App Router), React 19.0.0
**Database**: None currently (localStorage only) → **Will add**: Cloud database (Supabase/Firebase recommended)
**Infrastructure**: Nx monorepo 22.3.2, next-pwa 5.6.0
**External Dependencies**: Tailwind CSS 3.4.19, next-themes 0.4.6, Framer Motion 12.23.26

**New Additions for Phase 1:**
- **State Management**: Zustand (latest stable, ~1KB)
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Backend**: Serverless functions (Vercel/Netlify), Supabase or Firebase for database/auth

### Integration Approach

**Database Integration Strategy:**

Currently no database exists. Phase 1 will introduce optional backend:

- **Backend Stack**: Vercel serverless functions + Supabase (PostgreSQL) or Firebase
- **Database Schema**:
  - `users` table: id, email, password_hash, created_at
  - `saves` table: id, user_id, slot_number, save_data (JSONB), metadata, created_at, updated_at
  - Indexes on user_id, slot_number for fast queries
- **Migration Plan**:
  1. localStorage remains primary during development
  2. Backend endpoints created and tested independently
  3. Add sync logic with feature flag
  4. Gradual rollout with localStorage fallback always available
- **Conflict Resolution**: Last-write-wins with timestamps, user notified of conflicts

**API Integration Strategy:**

No existing APIs. New backend API will provide:

- **Endpoints**:
  - `POST /api/v1/auth/register` - Create user account
  - `POST /api/v1/auth/login` - Authenticate user
  - `GET /api/v1/saves` - List user's saves
  - `GET /api/v1/saves/:slot` - Load save from slot
  - `POST /api/v1/saves/:slot` - Save to slot
  - `DELETE /api/v1/saves/:slot` - Delete save
  - `POST /api/v1/saves/export` - Export save as JSON
  - `POST /api/v1/saves/import` - Import save from JSON
- **Authentication**: JWT tokens stored in httpOnly cookies
- **Error Handling**: Standardized error responses, graceful degradation to localStorage on failures

**Frontend Integration Strategy:**

Current architecture is React client components with useGameState hook. Integration plan:

- **State Management**: Zustand stores replace useGameState orchestration
  - `useMatchStore` - Match simulation, results, highlights
  - `useTransferStore` - Transfer market, player trading
  - `useFinanceStore` - Budget, wages, transactions
  - `usePlayerStore` - Player data, development, morale
  - `useSeasonStore` - Season progression, fixtures, phase
  - `useUIStore` - Modal states, notifications, loading
- **Component Updates**: Components consume specific store slices via selectors
- **Backward Compatibility**: Not required (breaking changes acceptable)
- **Migration Strategy**: Incremental migration by feature area, not big-bang

**Testing Integration Strategy:**

Currently minimal testing (20-30% engine coverage, 0% app coverage). Phase 1 establishes:

- **Unit Testing**: Vitest for engine modules and store actions
  - Mock dependencies using Vitest mocks
  - Test pure functions in isolation
  - Achieve >80% coverage
- **Integration Testing**: Vitest for store orchestration
  - Test cross-store interactions
  - Test complex workflows (season simulation, save/load)
  - Achieve >70% coverage
- **E2E Testing**: Playwright for user flows
  - Test critical paths: new game, play season, transfers, tactics, saves
  - Run across Chrome, Firefox, Safari
  - Screenshot/video recording on failures
- **CI Integration**: GitHub Actions running tests on every PR
  - Parallel test execution for speed
  - Coverage reports published
  - Required checks before merge

### Code Organization and Standards

**Based on existing project analysis:**

**File Structure Approach:**
- Application code: `apps/football-director/src/`
- Game engine: `libs/football-director-engine/src/lib/`
- **New additions**:
  - `apps/football-director/src/stores/` - Zustand stores
  - `apps/football-director/src/lib/api/` - Backend API client functions
  - `apps/football-director/src/lib/sync/` - Offline sync logic
  - `libs/football-director-engine/src/lib/__tests__/` - Unit tests
  - `apps/football-director/e2e/` - Playwright E2E tests

**Naming Conventions:**
- Zustand stores: `useMatchStore.ts`, `useTransferStore.ts`
- API functions: `apiClient.ts`, `saveApi.ts`, `authApi.ts`
- Test files: `match-simulator.spec.ts`, `useMatchStore.test.ts`
- E2E tests: `season-simulation.spec.ts`, `transfer-flow.spec.ts`

**Coding Standards:**
- Continue existing standards (see `docs/architecture/coding-standards.md`)
- **Additions**:
  - All Zustand stores must export typed hooks and actions
  - All API functions must return typed responses with error handling
  - All tests must follow Arrange-Act-Assert pattern
  - Mock data factories for consistent test data

**Documentation Standards:**
- JSDoc comments for all public functions
- README in each new directory explaining purpose
- Architecture Decision Records (ADRs) for major decisions
- Updated architecture docs after Phase 1 completion

### Deployment and Operations

**Build Process Integration:**

Current: Next.js build via Nx

**Phase 1 additions:**
- Backend deployment: Vercel serverless functions (or Netlify functions)
- Database provisioning: Supabase project setup or Firebase project
- Environment variables: API URLs, database credentials, JWT secrets
- Build pipeline: Test → Build → Deploy (staged rollout)

**Deployment Strategy:**

Current: Not deployed (development only)

**Phase 1 deployment plan:**
1. **Development Environment**: Local backend + local database for testing
2. **Staging Environment**: Deployed backend + staging database for integration testing
3. **Production Environment**: Production deployment when Phase 1 complete
4. **Rollout Strategy**: Feature flags for backend sync, gradual rollout to users
5. **Rollback Plan**: Disable backend sync via feature flag, localStorage remains functional

**Monitoring and Logging:**

Currently none. Phase 1 will add:

- **Frontend Monitoring**: Error tracking (Sentry or similar) for client-side errors
- **Backend Monitoring**: API request logging, error rates, response times
- **User Analytics**: (Optional) Track feature usage, performance metrics
- **Alerting**: Notify on error rate spikes, API downtime, database issues

**Configuration Management:**

Current: Minimal (Next.js env vars for PWA)

**Phase 1 additions:**
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL` - Backend API endpoint
  - `NEXT_PUBLIC_ENABLE_BACKEND_SYNC` - Feature flag for sync
  - `DATABASE_URL` - Database connection string (server-side)
  - `JWT_SECRET` - Token signing secret (server-side)
- **Feature Flags**: Toggle backend sync, new features during testing
- **Config Files**: Separate configs for dev/staging/prod environments

### Risk Assessment and Mitigation

**Based on document-project analysis (Technical Debt and Known Issues):**

**Technical Risks:**

**Risk 1: State Management Migration Complexity**
- **Description**: Migrating 1,220-line hook to Zustand while maintaining functionality
- **Probability**: High
- **Impact**: High (could break entire application)
- **Mitigation**:
  - Comprehensive test coverage BEFORE migration (FR6-FR10)
  - Incremental migration by feature area with feature flags
  - Parallel implementation (old hook + new stores) during transition
  - Dedicated testing sprint after each migration phase
  - Rollback plan if issues discovered

**Risk 2: Backend Integration Failures**
- **Description**: Network issues, API downtime, sync conflicts
- **Probability**: Medium
- **Impact**: Medium (degrades UX but localStorage fallback exists)
- **Mitigation**:
  - Robust offline-first architecture with localStorage fallback (CR4)
  - Retry logic with exponential backoff for failed requests
  - Queue system for offline operations synced when online
  - User feedback showing sync status clearly
  - Comprehensive error handling and logging

**Risk 3: Test Suite Flakiness**
- **Description**: E2E tests failing intermittently, slowing development
- **Probability**: Medium
- **Impact**: Medium (CI pipeline delays, developer frustration)
- **Mitigation**:
  - Use Playwright with auto-waiting and retry mechanisms
  - Deterministic test data, no reliance on timing
  - Parallel test execution with proper isolation
  - Clear test failure reporting with screenshots/videos
  - Regular test suite maintenance and refactoring

**Risk 4: Breaking Existing Saves**
- **Description**: Refactoring causes save corruption or load failures
- **Probability**: Low (breaking changes acceptable)
- **Impact**: High (user data loss if not handled)
- **Mitigation**:
  - Save data validation before and after migrations
  - Export/import functionality for user backup (FR16)
  - Migration tool with data integrity checks
  - Clear communication to users about save compatibility
  - Test migration with real save data samples

**Integration Risks:**

**Risk 5: Module Reorganization Breaking Dependencies**
- **Description**: Consolidating modules breaks existing integrations
- **Probability**: Medium
- **Impact**: Medium (temporary breakage during refactoring)
- **Mitigation**:
  - Integration tests for module interfaces (FR7)
  - Dependency injection enabling gradual migration (FR19)
  - Clear deprecation warnings before removing old APIs
  - Module interface contracts preventing breaking changes (FR18)
  - Staged rollout of new module structure

**Risk 6: Performance Regression**
- **Description**: Zustand/backend adds latency degrading gameplay experience
- **Probability**: Low
- **Impact**: High (poor user experience)
- **Mitigation**:
  - Performance benchmarks before and after refactoring (NFR1-NFR5)
  - Profiling Zustand selector performance
  - Optimistic UI updates (immediate feedback, sync in background)
  - Caching strategies for backend responses
  - Load testing backend API endpoints

**Deployment Risks:**

**Risk 7: Backend Infrastructure Costs**
- **Description**: Serverless/database costs exceed budget
- **Probability**: Low (free tiers sufficient initially)
- **Impact**: Low (can optimize or scale down)
- **Mitigation**:
  - Use free tiers: Vercel (free for hobby projects), Supabase (500MB free)
  - Monitoring usage and setting alerts
  - Rate limiting to prevent abuse (NFR23)
  - localStorage fallback reduces backend dependency
  - Can migrate to cheaper alternatives if needed

**Risk 8: Security Vulnerabilities**
- **Description**: Authentication bypass, data leaks, injection attacks
- **Probability**: Medium (new backend introduces attack surface)
- **Impact**: High (user data compromise)
- **Mitigation**:
  - Secure authentication best practices (JWT, httpOnly cookies)
  - Input validation and sanitization (NFR27)
  - HTTPS enforcement (NFR29)
  - Regular security audits and dependency updates
  - Principle of least privilege for database access

**Mitigation Strategies Summary:**

1. **Comprehensive Testing First**: Establish test infrastructure before major refactoring
2. **Incremental Migration**: Migrate piece-by-piece with feature flags, not big-bang
3. **Offline-First Always**: localStorage fallback ensures resilience to backend issues
4. **Clear Rollback Plans**: Feature flags and deployment staging enable quick rollback
5. **Monitoring and Alerts**: Early detection of issues before user impact
6. **User Communication**: Transparency about changes, save compatibility, and features

---

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: **Two-phase approach with multiple epics per phase**

**Rationale:**

This brownfield enhancement encompasses two distinct phases with different goals and timelines:

**Phase 1 (6 Epics)** focuses on technical foundation with each epic addressing a specific debt area. These epics are sequenced to build on each other:
1. Testing infrastructure first (enables confident refactoring)
2. State management migration (biggest complexity reduction)
3. Engine reorganization (simplifies codebase)
4. Backend architecture (unlocks future features)
5. Type safety (polish and maintainability)
6. PWA upgrades (final enhancement)

**Phase 2 (4+ Epics)** builds on the improved foundation to add game features. These epics are independent feature areas that can be developed in parallel or sequenced based on priority.

Each epic delivers incremental value while maintaining system integrity. Stories within epics are sized for AI agent execution with clear acceptance criteria and integration verification.

---

## Phase 1: Technical Foundation

---

## Epic 1.1: Comprehensive Testing Infrastructure

**Epic Goal**: Establish robust testing framework covering unit, integration, and E2E tests to enable confident refactoring and prevent regressions during state management migration and code reorganization.

**Integration Requirements**:
- Must integrate with existing Nx monorepo structure
- Must work with current Next.js 15 App Router architecture
- Must support both engine library and application testing
- Must integrate with CI/CD pipeline (GitHub Actions)

**Story Sequencing Rationale**: Testing infrastructure must be established FIRST before any major refactoring. This ensures we can verify existing behavior, detect regressions during migration, and maintain confidence throughout the technical transformation.

---

### Story 1.1.1: Set Up Unit Testing Infrastructure

As a **developer**,
I want **unit testing infrastructure with Vitest configured for the engine library**,
so that **I can write fast, reliable tests for individual engine modules and store logic**.

**Acceptance Criteria:**

1. Vitest installed and configured in `libs/football-director-engine`
2. Test configuration supports TypeScript with same strictness as production code
3. Mock utilities available for isolating modules under test
4. Test coverage reporting configured with HTML and terminal output
5. Can run tests via `nx test football-director-engine` command
6. Tests execute in under 1 minute for rapid feedback
7. Example test written for at least one engine module demonstrating patterns
8. Documentation added explaining test structure and best practices

**Integration Verification:**

- **IV1**: Existing engine modules run without errors after Vitest installation
- **IV2**: Nx caching works correctly with test commands
- **IV3**: Coverage reports accurately reflect code execution
- **IV4**: TypeScript types work correctly in test files

---

### Story 1.1.2: Write Unit Tests for Core Engine Modules

As a **developer**,
I want **comprehensive unit tests for all 24+ engine modules with >80% coverage**,
so that **refactoring and changes can be made confidently without breaking game logic**.

**Acceptance Criteria:**

1. Unit tests written for all engine modules: match-simulator, season-manager, league-table-manager, transfer-market, finance-engine, player-development, contract-manager, ai-contract-manager, morale-manager, injury-manager, youth-academy-manager, tactics-manager, news-generator, achievement-manager, records-manager, staff-manager, board-manager, player-stats-tracker, match-commentary, match-preview-generator, post-match-generator, weather-generator, team-generator
2. Overall unit test coverage exceeds 80% across engine library
3. Tests cover happy paths, edge cases, and error conditions
4. Tests use mock data factories for consistent, readable test setup
5. Tests are deterministic (no random failures due to timing or Math.random)
6. Each test follows Arrange-Act-Assert pattern with clear descriptions
7. Tests run in parallel for speed without interference
8. All tests pass consistently in local and CI environments

**Integration Verification:**

- **IV1**: Existing game functionality unchanged (no regressions introduced)
- **IV2**: Tests accurately catch bugs when code is intentionally broken
- **IV3**: Coverage reports identify untested code paths clearly
- **IV4**: Mock data matches production GameState structure exactly

---

### Story 1.1.3: Set Up Integration Testing for State Orchestration

As a **developer**,
I want **integration testing infrastructure using Vitest for testing store interactions**,
so that **I can verify complex workflows like season simulation and save/load work correctly after state management migration**.

**Acceptance Criteria:**

1. Integration test configuration added to `apps/football-director`
2. Test utilities created for setting up complete game state scenarios
3. Can test multi-store interactions (e.g., match results affecting finance and player morale)
4. Can test async operations (save/load, backend sync)
5. Integration tests run separately from unit tests via `nx test:integration football-director`
6. Example integration test written demonstrating season simulation workflow
7. Coverage reporting tracks integration test coverage separately
8. Tests execute in under 3 minutes

**Acceptance Criteria (continued):**

**Integration Verification:**

- **IV1**: Integration tests use same code paths as production application
- **IV2**: Test environment accurately simulates production state structure
- **IV3**: Async operations in tests match real timing characteristics
- **IV4**: Tests can be debugged easily with clear failure messages

---

### Story 1.1.4: Implement E2E Testing with Playwright

As a **user**,
I want **end-to-end tests covering critical game flows across browsers**,
so that **the complete user experience works correctly from start to finish**.

**Acceptance Criteria:**

1. Playwright installed and configured for `apps/football-director`
2. E2E tests written for critical flows:
   - Start new game → create save → verify dashboard loads
   - Play through 5 weeks → verify matches simulate → check table updates
   - Transfer flow → buy player → sell player → verify squad changes
   - Tactics change → set formation → verify saves and applies to next match
   - Save management → create multiple saves → switch between slots → verify independence
   - Season end → verify contracts expire → youth academy → new season starts
3. Tests run against local development server automatically
4. Tests execute across Chrome, Firefox, and Safari (via webkit)
5. Screenshot/video recording on test failures for debugging
6. E2E tests run via `nx e2e football-director` command
7. Tests execute in under 10 minutes (parallelized)
8. Clear documentation on running and writing E2E tests

**Integration Verification:**

- **IV1**: E2E tests catch real user-facing bugs that unit/integration tests miss
- **IV2**: Tests work consistently across different browsers
- **IV3**: Test failures provide clear screenshots/videos showing what went wrong
- **IV4**: Tests remain stable without flakiness or random failures

---

### Story 1.1.5: CI/CD Pipeline Integration

As a **developer**,
I want **automated test execution on every commit via GitHub Actions**,
so that **bugs are caught early before merging and deploying code**.

**Acceptance Criteria:**

1. GitHub Actions workflow created for running tests on PR and push to main
2. Workflow runs unit tests, integration tests, and E2E tests in parallel
3. Coverage reports generated and published as PR comments
4. Required checks prevent merging if tests fail or coverage drops below thresholds
5. Test execution completes in under 10 minutes total (parallel execution)
6. Workflow configured for matrix testing (multiple Node versions if needed)
7. Nx caching utilized to skip unchanged project tests
8. Clear failure notifications with links to logs and artifacts

**Integration Verification:**

- **IV1**: CI environment matches local development environment
- **IV2**: Tests pass consistently in CI without flakiness
- **IV3**: Coverage reports accurately reflect code coverage
- **IV4**: Failed tests block deployment to prevent shipping broken code

---

## Epic 1.2: Zustand State Management Migration

**Epic Goal**: Migrate from the massive 1,220-line useGameState hook to well-structured Zustand stores with clear separation of concerns, improved testability, and better developer experience.

**Integration Requirements**:
- Must maintain all existing game functionality without feature loss
- Must work with existing engine modules without breaking changes
- Must integrate with new testing infrastructure from Epic 1.1
- Must support gradual migration via feature flags

**Story Sequencing Rationale**: State management migration is the highest priority technical improvement. It must happen AFTER testing infrastructure (Epic 1.1) is established to ensure no regressions. Stories progress from store architecture design → core stores → migration → cleanup.

---

### Story 1.2.1: Design Zustand Store Architecture

As a **developer**,
I want **well-designed Zustand store architecture with clear domain boundaries**,
so that **state management is organized, maintainable, and testable**.

**Acceptance Criteria:**

1. Store architecture documented in `docs/architecture/zustand-architecture.md` covering:
   - Store domains and responsibilities
   - Data flow between stores
   - Action patterns and naming conventions
   - Selector patterns for performance
   - Integration with React components
2. Store domains defined:
   - `matchStore` - Match simulation, results, highlights, commentary
   - `transferStore` - Transfer market, player buying/selling, market refresh
   - `financeStore` - Budget, wages, transactions, prize money
   - `playerStore` - Player data, development, morale, injuries, contracts
   - `seasonStore` - Season progression, fixtures, phase, week management
   - `uiStore` - Modal states, notifications, loading indicators
   - `saveStore` - Save/load operations, slot management, sync state
3. Inter-store dependencies mapped (e.g., match results → finance updates)
4. Migration strategy defined for gradual transition from useGameState
5. TypeScript interfaces defined for all store states and actions
6. Performance considerations documented (selector usage, preventing re-renders)

**Integration Verification:**

- **IV1**: Architecture design reviewed and validated against current useGameState logic
- **IV2**: All existing functionality mapped to appropriate stores
- **IV3**: No circular dependencies between stores
- **IV4**: Design supports testing strategies from Epic 1.1

---

### Story 1.2.2: Implement Core Zustand Stores

As a **developer**,
I want **implemented Zustand stores for all domains with typed actions and selectors**,
so that **components can consume state with better performance and clarity**.

**Acceptance Criteria:**

1. All stores implemented in `apps/football-director/src/stores/`:
   - `useMatchStore.ts` - Match state and actions
   - `useTransferStore.ts` - Transfer market state and actions
   - `useFinanceStore.ts` - Financial state and actions
   - `usePlayerStore.ts` - Player management state and actions
   - `useSeasonStore.ts` - Season progression state and actions
   - `useUIStore.ts` - UI state and actions
   - `useSaveStore.ts` - Save/load state and actions
2. Each store exports:
   - Typed hook (e.g., `useMatchStore`) with full state
   - Typed selectors for common state slices
   - Typed actions for state mutations
   - Initial state factory for testing
3. Redux DevTools integration enabled for debugging
4. Store actions implement business logic (moved from components)
5. Selectors optimized to prevent unnecessary re-renders
6. Store persistence configured for saveStore (localStorage)
7. Comprehensive JSDoc comments for all exported functions

**Integration Verification:**

- **IV1**: All stores initialize correctly with valid initial state
- **IV2**: Redux DevTools shows state updates correctly
- **IV3**: Store actions can be tested in isolation (unit tests)
- **IV4**: No performance regressions compared to useGameState

---

### Story 1.2.3: Migrate Components to Zustand Stores

As a **developer**,
I want **all React components migrated from useGameState to Zustand stores**,
so that **state management is decoupled from component logic and easier to maintain**.

**Acceptance Criteria:**

1. All pages migrated to Zustand stores:
   - `app/page.tsx` (Dashboard)
   - `app/fixtures/page.tsx`
   - `app/squad/page.tsx`
   - `app/stats/page.tsx`
   - `app/table/page.tsx`
   - `app/tactics/page.tsx`
   - `app/transfers/page.tsx`
   - `app/staff/page.tsx`
   - `app/match/[id]/page.tsx`
   - `app/records/page.tsx`
   - `app/trophies/page.tsx`
   - `app/news/page.tsx`
2. All game components migrated:
   - All components in `src/components/game/`
   - All components in `src/components/saves/`
3. Components use store selectors to subscribe to specific state slices
4. Components dispatch store actions instead of calling hook functions
5. No direct state mutations (all updates via actions)
6. useGameState hook completely removed from codebase
7. All existing functionality works identically to before migration
8. Performance verified (no excessive re-renders)

**Integration Verification:**

- **IV1**: All game flows work end-to-end (new game, season simulation, transfers, saves)
- **IV2**: No regressions in game logic or UI behavior
- **IV3**: Browser localStorage saves still work correctly
- **IV4**: Integration tests pass after migration

---

### Story 1.2.4: Implement Store Orchestration Logic

As a **developer**,
I want **complex orchestration logic (weekly simulation, end of season) implemented in store actions**,
so that **multi-step workflows are coordinated correctly across stores**.

**Acceptance Criteria:**

1. Weekly simulation orchestration implemented in seasonStore:
   - `simulateWeek()` action coordinates:
     - Injury recovery (playerStore)
     - Morale updates (playerStore)
     - Contract status updates (playerStore)
     - Match simulation (matchStore)
     - League table updates (seasonStore)
     - Finance processing (financeStore)
     - AI transfers (transferStore)
     - News generation (uiStore)
     - Achievement checks (playerStore/seasonStore)
2. End of season orchestration implemented:
   - Contract expiry → free agents (playerStore)
   - Stats archival (playerStore)
   - Player development (playerStore)
   - Youth academy (playerStore)
   - Season records (seasonStore)
   - Prize money (financeStore)
   - Board evaluation (seasonStore)
3. Orchestration logic unit tested in isolation
4. Orchestration integrated tested with all stores
5. Performance benchmarked (weekly simulation under 2 seconds)
6. Clear logging of orchestration steps for debugging

**Integration Verification:**

- **IV1**: Weekly simulation produces same results as old useGameState implementation
- **IV2**: End of season transitions work correctly with all features
- **IV3**: Orchestration handles errors gracefully without corrupting state
- **IV4**: All store states remain consistent after orchestration

---

### Story 1.2.5: Performance Optimization and Testing

As a **developer**,
I want **optimized store selectors and comprehensive performance testing**,
so that **the Zustand migration doesn't degrade application performance**.

**Acceptance Criteria:**

1. Selector optimization:
   - Identify and optimize selectors causing excessive re-renders
   - Use shallow equality checks where appropriate
   - Implement computed selectors for derived state (e.g., top performers)
   - Document selector patterns in architecture docs
2. Performance benchmarks:
   - Match simulation: <2s (same as before)
   - Weekly simulation: <3s (same as before)
   - Component render counts reduced vs. useGameState baseline
   - Store action execution times measured and optimized
3. Memory profiling:
   - No memory leaks in stores
   - State size remains reasonable (<10MB typical)
4. Performance tests added to CI:
   - Benchmark tests fail if performance regresses >10%
   - Bundle size monitored (must not exceed 500KB gzipped)
5. React DevTools Profiler used to verify no performance regressions
6. Documentation on performance best practices for future development

**Integration Verification:**

- **IV1**: Application feels as responsive as before migration
- **IV2**: No performance regressions detected in E2E tests
- **IV3**: Bundle size increase minimal (<10% from adding Zustand)
- **IV4**: Store subscriptions clean up correctly (no memory leaks)

---

## Epic 1.3: Backend Architecture Implementation

**Epic Goal**: Implement optional backend with cloud saves, cross-device sync, and robust offline-first architecture while maintaining localStorage fallback for resilience.

**Integration Requirements**:
- Must maintain offline-first PWA functionality
- Must not regress localStorage save/load capabilities
- Must integrate with Zustand stores (saveStore) from Epic 1.2
- Must handle authentication, sync conflicts, and network failures gracefully

**Story Sequencing Rationale**: Backend architecture is the second highest priority, implemented after state management migration. This ensures backend API can integrate cleanly with Zustand stores. Stories progress from backend setup → API implementation → sync logic → migration tools.

---

### Story 1.3.1: Backend Infrastructure Setup

As a **developer**,
I want **serverless backend infrastructure with database and authentication configured**,
so that **I can implement save/load API endpoints securely**.

**Acceptance Criteria:**

1. Backend framework chosen and configured:
   - **Recommended**: Vercel serverless functions + Supabase
   - Alternative: Netlify functions + Firebase
2. Database schema created:
   - `users` table: id (UUID), email (unique), password_hash, created_at, updated_at
   - `saves` table: id (UUID), user_id (FK), slot_number (1-5), save_data (JSONB), metadata (JSONB with team, season, week, position), created_at, updated_at
   - Indexes: (user_id, slot_number) unique, (user_id), (created_at)
3. Authentication configured:
   - JWT-based authentication with httpOnly cookies
   - Password hashing (bcrypt or similar)
   - Email validation
4. Environment variables configured:
   - Development: `.env.local` with local database
   - Staging: Staging database credentials
   - Production: Production database credentials
5. CORS configured for frontend domains
6. Database migrations system set up for schema changes
7. Health check endpoint: `GET /api/health` returns 200

**Integration Verification:**

- **IV1**: Database connection works from serverless functions
- **IV2**: Authentication generates valid JWT tokens
- **IV3**: Environment variables load correctly in each environment
- **IV4**: Migrations can be run safely without data loss

---

### Story 1.3.2: Implement Authentication API Endpoints

As a **user**,
I want **to create an account and log in securely**,
so that **my game saves are private and accessible only to me**.

**Acceptance Criteria:**

1. **POST /api/v1/auth/register** endpoint:
   - Accepts: `{ email, password }`
   - Validates: Email format, password strength (min 8 chars)
   - Returns: `{ user: { id, email }, token }` or error
   - Stores: Password hashed in database
   - Error cases: Duplicate email, invalid input
2. **POST /api/v1/auth/login** endpoint:
   - Accepts: `{ email, password }`
   - Validates: Credentials against database
   - Returns: `{ user: { id, email }, token }` or error
   - Sets: httpOnly cookie with JWT token
   - Error cases: Invalid credentials, user not found
3. **POST /api/v1/auth/logout** endpoint:
   - Clears: JWT cookie
   - Returns: Success confirmation
4. **GET /api/v1/auth/me** endpoint:
   - Requires: Valid JWT token
   - Returns: `{ user: { id, email } }` or 401 Unauthorized
5. Frontend API client created in `src/lib/api/authApi.ts`:
   - `register(email, password)` - Call register endpoint
   - `login(email, password)` - Call login endpoint
   - `logout()` - Call logout endpoint
   - `getCurrentUser()` - Get authenticated user
   - Error handling with typed errors
6. Input validation and sanitization to prevent injection attacks
7. Rate limiting on auth endpoints to prevent brute force

**Integration Verification:**

- **IV1**: User can register, login, and logout successfully
- **IV2**: JWT tokens persist across page refreshes via cookies
- **IV3**: Invalid tokens return 401 errors appropriately
- **IV4**: Frontend handles auth errors gracefully

---

### Story 1.3.3: Implement Save/Load API Endpoints

As a **user**,
I want **to save my game progress to the cloud and load it on any device**,
so that **I can continue playing seamlessly across devices**.

**Acceptance Criteria:**

1. **GET /api/v1/saves** endpoint:
   - Requires: Authentication
   - Returns: `{ saves: [{ slot, metadata, updatedAt }] }` (list of user's saves)
   - Metadata includes: team name, season, week, position
2. **GET /api/v1/saves/:slot** endpoint:
   - Requires: Authentication
   - Accepts: slot (1-5)
   - Returns: `{ save: { slot, data, metadata, updatedAt } }` (full save data)
   - Error cases: Slot not found returns 404
3. **POST /api/v1/saves/:slot** endpoint:
   - Requires: Authentication
   - Accepts: `{ data: GameState, metadata }`
   - Validates: GameState structure
   - Stores: Save data in JSONB column
   - Returns: `{ save: { slot, metadata, updatedAt } }`
   - Upserts: Creates or updates save in slot
4. **DELETE /api/v1/saves/:slot** endpoint:
   - Requires: Authentication
   - Accepts: slot (1-5)
   - Deletes: Save from database
   - Returns: Success confirmation
5. Frontend API client created in `src/lib/api/saveApi.ts`:
   - `listSaves()` - Get all saves
   - `loadSave(slot)` - Load save from slot
   - `saveSave(slot, gameState)` - Save to slot
   - `deleteSave(slot)` - Delete save
   - Error handling with retry logic
6. Request/response validation using Zod or similar
7. Database queries optimized with indexes

**Integration Verification:**

- **IV1**: User can save game state to cloud successfully
- **IV2**: User can load saved game and resume playing
- **IV3**: Save metadata displays correctly in save slot UI
- **IV4**: Deleting save removes it from database and UI

---

### Story 1.3.4: Implement Offline Sync Logic

As a **user**,
I want **automatic sync between localStorage and cloud saves when online**,
so that **my progress is backed up without manual intervention**.

**Acceptance Criteria:**

1. Sync service created in `src/lib/sync/saveSync.ts`:
   - Detects online/offline status
   - Queues save operations when offline
   - Syncs queued operations when reconnecting
   - Implements last-write-wins conflict resolution
2. Sync logic integrated with saveStore:
   - On save action: Save to localStorage immediately (offline-first)
   - If online: Also sync to backend asynchronously
   - If offline: Queue for later sync
   - On network reconnect: Sync all pending changes
3. Conflict resolution:
   - Compare timestamps (localStorage vs. cloud)
   - Last write wins (most recent updatedAt)
   - Notify user if conflict detected with option to choose version
4. Sync status indicators in UI:
   - "Saved locally" (offline)
   - "Syncing..." (upload in progress)
   - "Synced to cloud" (success)
   - "Sync failed - will retry" (error)
5. Background sync worker:
   - Periodic background sync every 5 minutes when online
   - Service worker background sync API for offline queuing (optional)
6. Feature flag to enable/disable cloud sync:
   - `NEXT_PUBLIC_ENABLE_BACKEND_SYNC` environment variable
   - UI toggle in settings for user control
7. Sync error handling:
   - Retry failed syncs with exponential backoff
   - Log errors for debugging
   - Graceful degradation (localStorage always works)

**Integration Verification:**

- **IV1**: Saving while online uploads to cloud successfully
- **IV2**: Saving while offline queues for later sync
- **IV3**: Reconnecting triggers sync of pending changes
- **IV4**: Conflict resolution handles concurrent edits correctly

---

### Story 1.3.5: Migration Tool for Existing Saves

As a **user**,
I want **to migrate my existing localStorage saves to cloud saves**,
so that **I don't lose my progress when backend launches**.

**Acceptance Criteria:**

1. Migration tool component created: `src/components/saves/SaveMigration.tsx`
2. Migration UI flow:
   - Detects existing localStorage saves
   - Shows list of saves with metadata
   - Allows user to select saves to migrate
   - Prompts user to register/login if not authenticated
   - Uploads selected saves to cloud
   - Confirms successful migration
3. Migration logic in `src/lib/sync/saveMigration.ts`:
   - Reads localStorage saves
   - Validates save data structure
   - Transforms save data if schema changed
   - Uploads to backend via saveApi
   - Marks saves as migrated (flag in localStorage)
4. Validation and error handling:
   - Detects corrupted save data
   - Shows clear error messages
   - Allows retry on failure
   - Preserves localStorage saves (doesn't delete)
5. Migration triggered:
   - Automatically on first login (if saves detected)
   - Manually from settings page
6. Migration status tracking:
   - Shows progress during upload
   - Displays success/failure per save
7. Documentation for users explaining migration process

**Integration Verification:**

- **IV1**: Migration successfully uploads existing saves to backend
- **IV2**: Migrated saves load correctly from cloud
- **IV3**: localStorage saves preserved as backup during migration
- **IV4**: Migration handles edge cases (large saves, corrupted data) gracefully

---

## Epic 1.4: Engine Module Reorganization

**Epic Goal**: Reorganize 24+ engine modules with better boundaries, reduced overlap, improved testability, and clearer documentation to enhance maintainability for future development.

**Integration Requirements**:
- Must maintain backward compatibility with Zustand stores from Epic 1.2
- Must work with unit tests from Epic 1.1
- Must not break existing game functionality
- Must support dependency injection for testing

**Story Sequencing Rationale**: Engine reorganization happens after state management and testing are established. This allows confident refactoring with test coverage ensuring no regressions. Stories progress from analysis → consolidation → interfaces → documentation.

---

### Story 1.4.1: Analyze and Document Module Dependencies

As a **developer**,
I want **clear documentation of engine module dependencies and data flows**,
so that **I can identify consolidation opportunities and refactor safely**.

**Acceptance Criteria:**

1. Module dependency analysis document created: `docs/architecture/engine-module-dependencies.md`
2. Dependency graph generated showing:
   - Which modules depend on which others
   - Data flow between modules (inputs/outputs)
   - Circular dependencies identified (should be zero)
   - Shared types and interfaces
3. Module responsibility analysis:
   - List each module's current responsibilities
   - Identify overlapping responsibilities
   - Flag modules that are too large or too small
   - Identify modules that could be combined
4. Consolidation opportunities documented:
   - News generation scattered across multiple modules → consolidate
   - Commentary and post-match analysis overlap → unify
   - Player stats tracking and records have overlap → clarify boundaries
5. Refactoring plan created:
   - Phased approach to avoid big-bang changes
   - Priority order based on impact and risk
   - Testing strategy for each phase
6. Stakeholder review:
   - Validate analysis with domain experts
   - Get approval on consolidation plan

**Integration Verification:**

- **IV1**: Dependency graph accurately reflects current codebase
- **IV2**: All modules accounted for in analysis
- **IV3**: Consolidation plan reviewed and approved
- **IV4**: No critical dependencies missed in analysis

---

### Story 1.4.2: Consolidate News Generation Modules

As a **developer**,
I want **unified NewsEngine module consolidating scattered news generation logic**,
so that **news features are easier to maintain and extend**.

**Acceptance Criteria:**

1. New unified module created: `libs/football-director-engine/src/lib/news-engine.ts`
2. Consolidate news logic from:
   - `news-generator.ts` - Main news articles
   - `match-commentary.ts` - Match commentary (move to separate module)
   - `post-match-generator.ts` - Post-match analysis and interviews
   - Scattered news generation in other modules (transfer news, injury news, etc.)
3. NewsEngine provides:
   - `generateMatchNews(matchResult)` - Post-match news
   - `generateTransferNews(transfer)` - Transfer announcement
   - `generateInjuryNews(player, injury)` - Injury updates
   - `generateContractNews(player, contract)` - Contract signings/renewals
   - `generateAchievementNews(achievement)` - Achievement unlocked
   - `generateSeasonNews(season)` - Season start/end news
   - `generateRandomNews(week)` - Background flavor news
4. Clear interfaces for news generation:
   - Input types defined for each function
   - Output type: `NewsArticle` (title, content, timestamp, category)
   - Template system for news content (maintainable, extensible)
5. Unit tests for all news generation functions
6. Old modules deprecated with warnings, removed after migration
7. Documentation on adding new news types

**Integration Verification:**

- **IV1**: All existing news generation works identically after consolidation
- **IV2**: News articles appear correctly in game news feed
- **IV3**: No regressions in news timing or content
- **IV4**: Zustand stores consume NewsEngine correctly

---

### Story 1.4.3: Separate Match Commentary Module

As a **developer**,
I want **dedicated MatchCommentary module separate from news generation**,
so that **real-time match commentary and post-match news have clear boundaries**.

**Acceptance Criteria:**

1. MatchCommentary module refactored: `libs/football-director-engine/src/lib/match-commentary.ts`
2. MatchCommentary provides:
   - `generateEventCommentary(event)` - Real-time commentary for match events (goals, cards, saves, etc.)
   - `generateHalfTimeCommentary(matchState)` - Half-time analysis
   - `generateFullTimeCommentary(matchResult)` - Full-time summary
3. Clear separation from NewsEngine:
   - MatchCommentary: Real-time match narration (used during match simulation)
   - NewsEngine: Post-match articles (used after match completion)
4. Commentary templates:
   - Goal commentary variations (normal goal, penalty, header, volley, etc.)
   - Card commentary (yellow, red, second yellow)
   - Injury commentary (player off, serious injury)
   - Substitution commentary
   - Momentum shifts (team dominating, comeback attempt)
5. Context-aware commentary:
   - Consider score, time, importance of match
   - Reference player form, history against opponent
   - Build narrative throughout match
6. Unit tests for all commentary generation
7. Integration with match-simulator module

**Integration Verification:**

- **IV1**: Match commentary displays correctly during match simulation
- **IV2**: Commentary quality same or better than before refactoring
- **IV3**: No performance regression in match simulation
- **IV4**: Match highlights show appropriate commentary

---

### Story 1.4.4: Implement Module Interfaces and Dependency Injection

As a **developer**,
I want **clear interfaces for all engine modules with dependency injection support**,
so that **modules can be tested in isolation and dependencies are explicit**.

**Acceptance Criteria:**

1. Interface definitions created for all modules:
   - Example: `IMatchSimulator`, `ITransferMarket`, `IFinanceEngine`, etc.
   - Interfaces define public methods and contracts
   - Stored in: `libs/football-director-engine/src/lib/interfaces/`
2. Dependency injection pattern implemented:
   - Modules accept dependencies via constructor or function parameters
   - No hardcoded dependencies between modules
   - Example: MatchSimulator accepts IPlayerStatsTracker, IInjuryManager, etc.
3. Factory functions for creating module instances:
   - `createMatchSimulator(dependencies)` - Production instance
   - `createMockMatchSimulator(overrides)` - Test instance with mocks
4. Module registration system:
   - Central registry for module instances
   - Dependency resolution at application startup
   - Easy swapping of implementations for testing
5. Clear dependency rules:
   - Engine modules depend only on other engine modules (no React/UI)
   - Zustand stores depend on engine modules (not vice versa)
   - Components depend on stores (not directly on engine)
6. Documentation on module interface patterns and DI usage
7. Example test demonstrating DI for isolated testing

**Integration Verification:**

- **IV1**: All engine modules work with DI pattern
- **IV2**: Unit tests use mocked dependencies successfully
- **IV3**: No circular dependencies introduced
- **IV4**: Module interfaces accurately represent contracts

---

### Story 1.4.5: Create Module Documentation and Examples

As a **developer**,
I want **comprehensive documentation for each engine module with usage examples**,
so that **AI agents and developers can understand and extend modules easily**.

**Acceptance Criteria:**

1. Module documentation created for all 24+ modules:
   - Location: `libs/football-director-engine/src/lib/README.md` (overview)
   - Individual module docs: JSDoc comments in source files
2. Each module documented with:
   - **Purpose**: What does this module do?
   - **Responsibilities**: Specific responsibilities (single responsibility principle)
   - **Public API**: All exported functions/classes with signatures
   - **Dependencies**: What other modules does it depend on?
   - **Examples**: Code examples showing typical usage
   - **Testing**: How to test this module in isolation
3. Architecture overview updated:
   - `docs/architecture/football-director-architecture.md` updated
   - Reflects new consolidated structure
   - Includes module dependency diagram
4. Migration guide created:
   - `docs/architecture/engine-migration-guide.md`
   - Explains what changed from old structure
   - Helps developers update code consuming engine
5. Examples created:
   - `examples/custom-match-simulation.ts` - Using MatchSimulator
   - `examples/custom-transfer-logic.ts` - Extending TransferMarket
   - `examples/testing-modules.ts` - Testing with DI and mocks
6. Contribution guide:
   - How to add new modules
   - How to extend existing modules
   - Code review checklist for module changes

**Integration Verification:**

- **IV1**: Documentation accurately reflects actual module behavior
- **IV2**: Examples run successfully without errors
- **IV3**: AI agents can understand modules from documentation alone
- **IV4**: New developers can onboard using documentation

---

## Epic 1.5: Type Safety Improvements

**Epic Goal**: Eliminate optional field proliferation, implement discriminated unions for versioning, create type guards, and establish strict TypeScript configuration for long-term type safety.

**Integration Requirements**:
- Must work with refactored Zustand stores from Epic 1.2
- Must integrate with backend save schema from Epic 1.3
- Must not break existing game functionality
- Breaking changes to save format acceptable (migration tools provided)

**Story Sequencing Rationale**: Type safety improvements come after major refactoring (state management, backend, modules). This ensures types reflect the new architecture. Stories progress from type analysis → required fields → versioning → strict config.

---

### Story 1.5.1: Analyze and Document Type Issues

As a **developer**,
I want **documented analysis of current type safety issues and improvement plan**,
so that **type refactoring is systematic and addresses root causes**.

**Acceptance Criteria:**

1. Type safety analysis document created: `docs/architecture/type-safety-analysis.md`
2. Optional field audit:
   - List all optional fields in GameState and related types
   - Identify which are truly optional vs. migration artifacts
   - Calculate null check density (how many `if (field)` checks exist)
3. Type migration issues documented:
   - How save migrations introduced optional fields
   - Why backward compatibility required optionality
   - Breaking change acceptance enables cleanup
4. Improvement opportunities identified:
   - Fields that can become required
   - Union types that should be discriminated
   - Missing type guards for runtime validation
   - Areas lacking strict type checking
5. Refactoring plan created:
   - Phase 1: Make core fields required (Player, Team, GameState)
   - Phase 2: Implement discriminated unions for versioning
   - Phase 3: Create type guards and validation
   - Phase 4: Enable strict TypeScript config
6. Risk assessment:
   - Breaking changes impact (acceptable per requirements)
   - Migration complexity for existing saves
   - Testing requirements for type changes

**Integration Verification:**

- **IV1**: Analysis accurately identifies type issues
- **IV2**: Refactoring plan reviewed and approved
- **IV3**: Breaking changes documented for users
- **IV4**: Migration strategy defined

---

### Story 1.5.2: Convert Optional Fields to Required

As a **developer**,
I want **core GameState fields converted from optional to required**,
so that **null checks are eliminated and type safety is improved**.

**Acceptance Criteria:**

1. Core types updated to require previously optional fields:
   - `Player` type: `contract`, `morale`, `injury` converted to required
   - `Team` type: `philosophy`, `staff` converted to required
   - `GameState` type: `matchPreviews`, `boardStatus`, `achievements` converted to required
2. Default values provided where necessary:
   - `contract: null` → `contract: { ... }` (new contract object)
   - `morale: undefined` → `morale: 75` (neutral morale)
   - `injury: undefined` → `injury: null` (explicitly no injury)
3. Migration logic updated in SaveService:
   - `migrateToRequiredFields(oldSave)` function
   - Applies defaults to saves missing required fields
   - Validates migrated data structure
4. All null checks removed from codebase:
   - Search for `if (player.contract)` → remove checks
   - Replace with confident access: `player.contract.wages`
   - TypeScript compiler enforces correctness
5. Unit tests updated:
   - Test data factories provide all required fields
   - Tests for migration logic
   - Tests verify no null reference errors
6. Breaking change documentation:
   - Saves from before type refactoring won't load directly
   - Migration applied automatically on load
   - Users warned about potential save compatibility

**Integration Verification:**

- **IV1**: TypeScript compilation succeeds with no errors
- **IV2**: Existing saves load successfully after migration
- **IV3**: No runtime null reference errors
- **IV4**: Game functionality unchanged after type updates

---

### Story 1.5.3: Implement Discriminated Unions for Versioning

As a **developer**,
I want **discriminated unions for GameState versions**,
so that **save schema changes are type-safe and migrations are explicit**.

**Acceptance Criteria:**

1. GameState versioning implemented with discriminated unions:
   ```typescript
   type GameStateV1 = { version: 1; /* old fields */ }
   type GameStateV2 = { version: 2; /* new fields */ }
   type GameStateV3 = { version: 3; /* current fields */ }
   type GameState = GameStateV1 | GameStateV2 | GameStateV3
   ```
2. Current version constant defined:
   - `const CURRENT_GAME_STATE_VERSION = 3`
   - Used for all new saves
3. Migration functions for each version:
   - `migrateV1toV2(state: GameStateV1): GameStateV2`
   - `migrateV2toV3(state: GameStateV2): GameStateV3`
   - Migrations applied sequentially
4. SaveService updated:
   - Detect save version on load
   - Apply migrations to bring to current version
   - Save always uses current version
5. Type-safe migration pipeline:
   - TypeScript enforces correct migration chain
   - No possibility of skipping versions
   - Compile-time guarantee all fields handled
6. Documentation on adding new versions:
   - How to create GameStateV4
   - How to write migration from V3 to V4
   - Testing checklist for migrations
7. Unit tests for all migrations:
   - Test each version upgrade
   - Test full migration chain (V1 → V2 → V3)
   - Test edge cases and invalid data

**Integration Verification:**

- **IV1**: Saves from all versions migrate to current version successfully
- **IV2**: TypeScript prevents invalid version transitions
- **IV3**: No data loss during migrations
- **IV4**: Performance acceptable for migration (under 1 second)

---

### Story 1.5.4: Create Type Guards and Runtime Validation

As a **developer**,
I want **type guards and runtime validation for critical types**,
so that **invalid data is caught early and type assumptions are validated**.

**Acceptance Criteria:**

1. Type guard functions created for core types:
   - `isGameState(value: unknown): value is GameState`
   - `isPlayer(value: unknown): value is Player`
   - `isTeam(value: unknown): value is Team`
   - `isMatchResult(value: unknown): value is MatchResult`
   - Located in: `libs/football-director-engine/src/lib/type-guards.ts`
2. Runtime validation library integrated:
   - **Recommended**: Zod for schema validation
   - Schemas defined for all major types
   - Validation functions return typed results or errors
3. Validation applied at boundaries:
   - SaveService: Validate data before persisting to localStorage/backend
   - API endpoints: Validate request/response payloads
   - User input: Validate form submissions
4. Error handling for validation failures:
   - Clear error messages indicating what failed validation
   - Logging for debugging
   - Graceful degradation (don't crash app)
5. Type guard usage patterns documented:
   - When to use type guards vs. TypeScript types alone
   - Performance considerations (validation overhead)
   - Examples of runtime validation in critical paths
6. Unit tests for type guards:
   - Test valid data passes
   - Test invalid data rejected
   - Test edge cases (missing fields, wrong types, etc.)

**Integration Verification:**

- **IV1**: Type guards correctly identify valid/invalid data
- **IV2**: Validation catches corrupted save data
- **IV3**: Performance overhead acceptable (<100ms for validation)
- **IV4**: Error messages helpful for debugging

---

### Story 1.5.5: Enable Strict TypeScript Configuration

As a **developer**,
I want **strictest TypeScript configuration enabled project-wide**,
so that **type errors are caught at compile time and code quality is enforced**.

**Acceptance Criteria:**

1. TypeScript strict mode enabled in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "strictBindCallApply": true,
       "strictPropertyInitialization": true,
       "noImplicitThis": true,
       "alwaysStrict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true
     }
   }
   ```
2. All compilation errors resolved:
   - Fix implicit `any` types
   - Fix null/undefined handling
   - Fix function type mismatches
   - Fix unused variables/parameters
3. ESLint rules aligned with strict TypeScript:
   - `@typescript-eslint/no-explicit-any` error (not warning)
   - `@typescript-eslint/explicit-function-return-type` warn
   - `@typescript-eslint/no-unused-vars` error
4. CI pipeline enforces strict types:
   - Build fails on TypeScript errors
   - No warnings allowed in production builds
5. Documentation on strict TypeScript benefits:
   - Fewer runtime errors
   - Better IDE autocomplete
   - Easier refactoring
   - Self-documenting code
6. Team guidelines:
   - How to handle legacy code that doesn't pass strict checks
   - When explicit types are required
   - When type inference is sufficient

**Integration Verification:**

- **IV1**: Project compiles successfully with strict mode enabled
- **IV2**: No TypeScript errors in codebase
- **IV3**: CI pipeline enforces strict type checking
- **IV4**: Developer experience improved (better autocomplete, fewer bugs)

---

## Epic 1.6: PWA Upgrades

**Epic Goal**: Upgrade next-pwa to latest version, implement proper service worker lifecycle management, optimize caching strategies, and improve offline experience.

**Integration Requirements**:
- Must maintain offline-first functionality
- Must work with backend sync from Epic 1.3
- Must not break existing PWA features (installability, offline support)
- Must integrate with Next.js 15 App Router

**Story Sequencing Rationale**: PWA upgrades are lowest priority in Phase 1 but provide polish and improved user experience. This epic comes last after all major refactoring is complete.

---

### Story 1.6.1: Upgrade next-pwa to Latest Version

As a **developer**,
I want **next-pwa upgraded to latest stable version**,
so that **PWA features use modern standards and best practices**.

**Acceptance Criteria:**

1. Research current next-pwa version and latest stable:
   - Current: next-pwa v5.6.0
   - Latest: next-pwa v6+ or alternative (evaluate options)
   - Breaking changes documented
2. Upgrade next-pwa package:
   - Update `package.json` dependency
   - Update `next.config.js` configuration
   - Address breaking changes in config
3. Service worker configuration updated:
   - Review new caching strategies available
   - Update workbox config if needed
   - Test offline functionality after upgrade
4. Manifest file validated:
   - `public/manifest.json` compatible with new version
   - Icons, splash screens, theme colors correct
5. Testing across browsers:
   - Chrome/Edge (Chromium)
   - Firefox
   - Safari (iOS and desktop)
   - Verify installability on all platforms
6. Development mode behavior:
   - PWA disabled in dev (existing behavior maintained)
   - Production build required for testing PWA
7. Documentation updated:
   - `docs/architecture/tech-stack.md` reflects new version
   - Known issues or limitations documented

**Integration Verification:**

- **IV1**: PWA installs successfully on mobile and desktop
- **IV2**: Offline functionality works (localStorage saves, game playable offline)
- **IV3**: Service worker updates correctly on new deployments
- **IV4**: No regressions in PWA features

---

### Story 1.6.2: Implement Service Worker Lifecycle Management

As a **user**,
I want **proper service worker update notifications**,
so that **I know when a new version is available and can refresh to get latest features**.

**Acceptance Criteria:**

1. Service worker update detection implemented:
   - Detect when new service worker waiting to activate
   - Show user-friendly notification: "New version available!"
   - Provide action to refresh and activate new version
2. Update notification component created:
   - `src/components/pwa/UpdateNotification.tsx`
   - Toast/banner style notification
   - "Refresh Now" button triggers page reload
   - Dismissible but persists until user updates
3. Service worker lifecycle hooks:
   - `onSuccess` - Service worker installed (first time)
   - `onUpdate` - New service worker available
   - Integrated with UI store for notifications
4. Skip waiting on user action:
   - When user clicks "Refresh Now", call `skipWaiting()`
   - Reload page to activate new service worker
   - Ensure smooth transition without disrupting gameplay
5. Testing:
   - Simulate service worker update in development
   - Test notification appears correctly
   - Test refresh activates new version
   - Test during active gameplay (auto-save before refresh)
6. Analytics (optional):
   - Track update adoption rate
   - Track time from release to user update

**Integration Verification:**

- **IV1**: Update notification appears when new version deployed
- **IV2**: Clicking "Refresh Now" activates new service worker successfully
- **IV3**: No data loss during update (saves persist)
- **IV4**: Update flow works seamlessly for users

---

### Story 1.6.3: Optimize Caching Strategies

As a **user**,
I want **optimized PWA caching for faster offline performance**,
so that **the game loads quickly even without internet connection**.

**Acceptance Criteria:**

1. Caching strategy review and optimization:
   - Precache critical assets (app shell, core JS/CSS)
   - Runtime caching for dynamic content
   - Cache-first for static assets (images, fonts)
   - Network-first for API calls (with fallback)
2. Workbox configuration optimized:
   - `runtimeCaching` rules defined in `next.config.js`
   - Example:
     ```js
     {
       urlPattern: /^https:\/\/api\.football-director\.com\/.*/i,
       handler: 'NetworkFirst',
       options: {
         cacheName: 'api-cache',
         expiration: {
           maxEntries: 50,
           maxAgeSeconds: 60 * 60 * 24 // 24 hours
         }
       }
     }
     ```
3. Cache size management:
   - Limit cache size to reasonable bounds
   - Expire old cached entries
   - Clear cache on major version updates
4. Offline fallback page:
   - Custom offline page for when network fails
   - Friendly message explaining offline state
   - Option to play from localStorage saves
5. Performance testing:
   - Measure load time (online vs. offline)
   - Target: <2s load time offline (cached)
   - Monitor cache hit rate
6. Documentation:
   - Explain caching strategies to developers
   - How to update caching rules
   - How to test caching behavior

**Integration Verification:**

- **IV1**: App loads quickly when offline (cached assets)
- **IV2**: API calls fall back gracefully when offline
- **IV3**: Cache size remains reasonable (<50MB)
- **IV4**: Offline experience smooth and functional

---

### Story 1.6.4: Improve Install Prompt UX

As a **user**,
I want **better PWA install prompts and onboarding**,
so that **I understand the benefits of installing the app**.

**Acceptance Criteria:**

1. Enhanced install prompt component:
   - `src/components/pwa/InstallPrompt.tsx` improved
   - Show benefits: "Play offline, faster loading, app-like experience"
   - Screenshots or animation showing install process
   - Platform-specific instructions (iOS vs. Android)
2. Smart prompt timing:
   - Don't show immediately (wait for engagement signal)
   - Trigger after user plays for 5+ minutes or completes first season
   - Respect user dismissal (don't spam)
   - localStorage flag to track if user dismissed permanently
3. iOS-specific guidance:
   - iOS doesn't support `beforeinstallprompt` event
   - Show instructions: "Tap Share → Add to Home Screen"
   - Visual guide with icons/arrows
4. Analytics for install funnel:
   - Track install prompt impressions
   - Track install prompt dismissals
   - Track successful installs
   - Calculate conversion rate
5. Post-install onboarding:
   - Detect if app running as installed PWA
   - Show welcome message with tips
   - Highlight PWA benefits (offline play, notifications, etc.)
6. Testing:
   - Test on Android (Chrome, Firefox)
   - Test on iOS (Safari)
   - Test install flow end-to-end
   - Test various screen sizes

**Integration Verification:**

- **IV1**: Install prompt appears at appropriate times
- **IV2**: iOS users see clear install instructions
- **IV3**: Install completion tracked successfully
- **IV4**: Post-install experience polished

---

### Story 1.6.5: Add Push Notifications (Optional Enhancement)

As a **user**,
I want **push notifications for important game events**,
so that **I stay engaged with the game even when not actively playing**.

**Acceptance Criteria:**

1. Push notification infrastructure setup:
   - Service worker supports push notifications
   - VAPID keys generated for push service
   - Backend endpoint to trigger notifications
2. Notification permission flow:
   - Request permission at appropriate time (not immediately)
   - Explain benefits: "Get notified about match results, contract renewals, etc."
   - Respect user preference (opt-in, can disable later)
3. Notification types:
   - Match result (if playing in background during simulation)
   - Contract expiring soon (1 week warning)
   - Transfer target available (player you scouted now for sale)
   - Achievement unlocked
   - Season ending soon (week 45+)
4. Notification settings UI:
   - Toggle notifications on/off
   - Choose which types of notifications to receive
   - Settings page integration
5. Backend integration:
   - API endpoint: `POST /api/v1/notifications/send`
   - Accepts: user ID, notification type, payload
   - Sends push notification via web push service
6. Testing:
   - Test notifications on Android
   - Test notifications on desktop (Chrome, Firefox)
   - Test notification actions (click opens app)
   - Test permission denied scenario
7. Documentation:
   - User guide on enabling notifications
   - Developer guide on adding new notification types

**Integration Verification:**

- **IV1**: Push notifications send successfully when triggered
- **IV2**: Notifications appear on user's device
- **IV3**: Clicking notification opens app to relevant screen
- **IV4**: User can disable notifications and preference is respected

---

## Phase 2: Feature Enhancements (FUTURE)

**Note**: Phase 2 stories will be detailed in a future PRD iteration after Phase 1 completion. Below are placeholder epic descriptions to provide context.

---

## Epic 2.1: Multi-League System

**Epic Goal**: Implement configurable league pyramid with multiple tiers (Premier League, Championship, League One, League Two), realistic team distribution, and league-specific characteristics.

**Key Stories** (High-level):
- Design league pyramid structure and configuration
- Generate teams across all league tiers with appropriate skill levels
- Implement league-specific finances (prize money, attendance, wages)
- Create league navigation UI
- Test multi-league save/load

---

## Epic 2.2: Promotion and Relegation System

**Epic Goal**: Create dynamic promotion/relegation mechanics with configurable team counts, end-of-season transitions, and career progression tracking across leagues.

**Key Stories** (High-level):
- Implement promotion/relegation rules (top 3 up, bottom 3 down, etc.)
- Build end-of-season transition logic
- Handle player career tracking across leagues
- Create promotion/relegation celebration screens
- Test edge cases (newly promoted teams, player transfers between leagues)

---

## Epic 2.3: European Competitions

**Epic Goal**: Add European competitions (Champions League, Europa League, Conference League) with qualification criteria, multi-stage formats, and integration into existing season calendar.

**Key Stories** (High-level):
- Design European competition structures and formats
- Implement qualification based on league position
- Schedule European fixtures within 52-week season
- Create European match simulation with special rules
- Build European competition UI (tables, fixtures, knockout brackets)

---

## Epic 2.4: Domestic Cup Competitions

**Epic Goal**: Implement domestic cup competitions (FA Cup, League Cup) with knockout formats, draws, replays, and trophy tracking.

**Key Stories** (High-level):
- Design cup competition formats (rounds, byes, replays)
- Implement cup draws and scheduling
- Create cup-specific match rules (extra time, penalties)
- Build cup fixtures and results UI
- Integrate with trophy cabinet

---

## Epic 2.5: Comprehensive Happiness System

**Epic Goal**: Develop multi-dimensional happiness tracking for players, coaches, and fans with consequences for low morale and strategic depth for management decisions.

**Key Stories** (High-level):
- Design happiness models (factors, calculations, thresholds)
- Implement player happiness tracking
- Implement coach happiness tracking
- Implement fan happiness tracking
- Build happiness dashboards and insights UI
- Create events triggered by happiness levels (transfer requests, protests, etc.)

---

## Epic 2.6: AI Insights and Recommendations

**Epic Goal**: Create intelligent insight engine analyzing game state, identifying problems, and providing actionable recommendations with priority ranking and direct action integration.

**Key Stories** (High-level):
- Design insight engine architecture and algorithms
- Implement problem detection (weak positions, unhappy players, financial issues)
- Generate actionable recommendations
- Build insights UI with priority ranking
- Implement "take action" buttons for quick execution
- Create weekly insight reports

---

## Appendix: Requirements Traceability Matrix

| Epic | Stories | Functional Requirements Covered | Non-Functional Requirements Covered |
|------|---------|----------------------------------|--------------------------------------|
| Epic 1.1 | 1.1.1 - 1.1.5 | FR6-FR10 | NFR11-NFR15 |
| Epic 1.2 | 1.2.1 - 1.2.5 | FR1-FR5 | NFR2, NFR6-NFR10 |
| Epic 1.3 | 1.3.1 - 1.3.5 | FR11-FR16 | NFR3, NFR16-NFR17, NFR21-NFR29 |
| Epic 1.4 | 1.4.1 - 1.4.5 | FR17-FR21 | NFR7-NFR9, NFR24 |
| Epic 1.5 | 1.5.1 - 1.5.5 | FR22-FR25 | NFR6, NFR18-NFR19 |
| Epic 1.6 | 1.6.1 - 1.6.5 | FR26-FR28 | NFR4-NFR5, NFR16 |
| Phase 2 | TBD | FR29-FR48 | Performance and scalability (NFR1, NFR24) |

---

## Appendix: Glossary

- **Zustand**: Lightweight state management library for React
- **Vitest**: Fast unit testing framework (Vite-powered)
- **Playwright**: Modern E2E testing framework
- **Supabase**: Open-source Firebase alternative (PostgreSQL + Auth + Storage)
- **Discriminated Union**: TypeScript pattern for type-safe versioning
- **Service Worker**: Background script enabling offline PWA functionality
- **VAPID**: Voluntary Application Server Identification for web push
- **DI (Dependency Injection)**: Pattern for passing dependencies to modules explicitly

---

**End of PRD - Phase 1: Technical Foundation**

**Next Steps**:
1. Review and approve PRD
2. Assign stories to development sprints
3. Begin Epic 1.1: Testing Infrastructure
4. Track progress in project management tool
5. Update PRD with Phase 2 detailed stories after Phase 1 completion
