# AI Agent Guidelines

## Working with This Codebase

**This is an AI development playground**. All tasks should be performed by AI agents with these considerations:

1. **No Perfect Code Required**: This is experimental, optimize for speed and learning
2. **Documentation Target**: Write docs for AI agents, not junior developers
3. **State Management Flexibility**: Both RxJS and Signals patterns are acceptable
4. **Authentication Can Wait**: Multi-user support is future enhancement
5. **Bundle Size Acceptable**: Performance optimization not critical priority

## When Making Changes

1. **Use Nx Commands**: Always use `npx nx` for builds, tests, and generation
2. **Maintain Patterns**: Follow existing patterns within each app
3. **Update Documentation**: Modify this document when architecture changes
4. **Test Builds**: Run `npx nx build [app] --configuration=production` before pushing
5. **Commit Message Format**: Use conventional commits (feat:, fix:, docs:, etc.)

## Code Generation Preferences

```bash
# Components
npx nx g @nx/angular:component components/my-component --project=[app-name] --standalone

# Services
npx nx g @nx/angular:service services/my-service --project=[app-name]

# Libraries
npx nx g @nx/js:library my-lib --directory=libs/my-lib --bundler=none --unitTestRunner=jest
```

## Project-Specific Notes

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
