# Technical Debt and Known Issues

## Critical Technical Debt

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

## Workarounds and Gotchas

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
