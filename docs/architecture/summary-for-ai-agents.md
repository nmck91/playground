# Summary for AI Agents

**This codebase is**:
- ✅ Nx monorepo with Angular 20.3 + Supabase
- ✅ Two production SPAs (reward-chart, family-calendar)
- ✅ Deployed to Vercel, CI via GitHub Actions
- ✅ Uses modern Angular patterns (standalone, Signals, inject())
- ✅ Shared Tailwind design system in libs/

**Key characteristics**:
- Personal playground for AI-assisted development
- Pragmatic over perfect (bundle size, test coverage acceptable)
- Two different state management patterns (learning experiments)
- Authentication not implemented (future enhancement)
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
