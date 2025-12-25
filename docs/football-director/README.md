# Football Director Documentation

Complete documentation for the Football Director game application.

## Product & Planning

### Requirements & Vision
- **[PRD (Product Requirements)](prd.md)** - Brownfield enhancement plan and technical roadmap
- **[Project Brief](brief.md)** - Original project requirements and vision
- **[Spike Report](spike-report.md)** - Initial prototype analysis and findings

### Sprint Planning
- **[Hybrid Sprint Plan](hybrid-sprint-plan.md)** - 6-week balanced technical + feature sprint (Dec 2025 - Feb 2026)
- **[Getting Started - Hybrid Sprint](getting-started-hybrid-sprint.md)** - Pre-flight checklist and setup guide
- **[Phase 1 Sprint Plan](sprint-plan-phase1.md)** - Original Phase 1 technical foundation plan

### Stories
- **[Story 001: Refactor useGameState](stories/story-001-refactor-usegamestate.md)** - ✅ Completed Dec 2025
- **[Story 002: Cup Competitions](stories/story-002-cup-competitions.md)** - 🎯 Ready for Development (Days 4-10, Week 1-2)

## Architecture & Design

### Core Documentation
- **[Architecture Overview](architecture.md)** - Comprehensive system architecture document
- **[Source Tree](source-tree.md)** - File structure and module organization
- **[Tech Stack](tech-stack.md)** - Technology choices and versions
- **[Coding Standards](coding-standards.md)** - Patterns, conventions, and best practices

## Quick Start

**For AI Agents**: Start with these files in order:
1. `coding-standards.md` - Understand patterns and rules
2. `tech-stack.md` - Know the technology stack
3. `source-tree.md` - Navigate the codebase structure

**For Developers**:
1. Read `architecture.md` for system understanding
2. Check `coding-standards.md` for conventions
3. Refer to `source-tree.md` when navigating code

## Key Updates

### December 2025 - Hook Refactoring
- ✅ Refactored `useGameState` from 1,220 lines → 143 lines
- ✅ Created composable hook architecture:
  - `useGamePersistence` - Save/load operations
  - `useDerivedGameState` - Memoized calculations
  - `useGameActions` - User action handlers
  - `useWeeklySimulation` - Game simulation orchestration
- ✅ Added comprehensive test suite (42 tests)
- ✅ Maintained 100% backward compatibility

**See**: `coding-standards.md` for composable hook pattern details

## Additional Resources

- **Roadmap**: `apps/football-director/ROADMAP.md` - Feature roadmap
- **Stories**: `docs/stories/` - Development stories and tasks
- **Mobile Design**: `apps/football-director/MOBILE-FIRST-PLAN.md`

---

**Project Type**: Next.js 15 PWA in Nx Monorepo
**Location**: `apps/football-director/`
**Engine**: `libs/football-director-engine/`
**Last Updated**: December 2025
