# Troubleshooting Guide

## Common Issues and Solutions

### Build & Development Issues

#### Issue: "Could not find Nx modules in this workspace"

**Symptoms**:
```bash
$ npx nx serve family-calendar
Error: Could not find Nx modules in this workspace.
```

**Cause**: `node_modules` is missing or corrupted

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Prevention**: Commit `package-lock.json` and run `npm ci` in CI

---

#### Issue: `npm ci` fails with "no package-lock.json" error

**Symptoms**:
```bash
$ npm ci
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Cause**: `package-lock.json` missing or out of sync with `package.json`

**Solution**:
```bash
# Regenerate lock file
npm install

# Commit the new lock file
git add package-lock.json
git commit -m "Regenerate package-lock.json"
```

**Historical Context**: This was the root cause of Vercel deployment failures (see commit fc6f403)

---

#### Issue: Vercel deployment fails with "cannot find package-lock.json"

**Symptoms**:
```
Running "install" command: `cd ../.. && npm ci`...
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Cause**: Vercel Root Directory setting incorrect

**Solution**:
1. Go to Vercel project settings
2. Navigate to **Settings** → **General** → **Build & Development Settings**
3. Set **Root Directory** to `.` (dot, meaning repository root)
4. Ensure `vercel.json` is at workspace root, not in app directory

**Historical Fix**: Commit e3ef66a moved `vercel.json` to workspace root

---

#### Issue: Tailwind styles not applying

**Symptoms**:
- Components render but have no styling
- Console error: `Cannot find module '@playground/tailwind-preset'`

**Cause**: Tailwind config trying to use TypeScript path mapping

**Solution**: Use relative path in `tailwind.config.js`:
```javascript
module.exports = {
  presets: [require('../../libs/tailwind-preset/src/index.ts')], // ✅ Correct
  // NOT: require('@playground/tailwind-preset') // ❌ Won't work
};
```

**Why**: Tailwind uses CommonJS `require()` which doesn't respect TypeScript path mappings

---

#### Issue: Bundle size warnings exceeding budget

**Symptoms**:
```
▲ [WARNING] bundle initial exceeded maximum budget.
Budget 500.00 kB was not met by 157.15 kB with a total of 657.15 kB.
```

**Cause**: PrimeNG and Supabase SDK add significant bundle size

**Solution**: **This is expected behavior** for these apps. Options:
1. **Accept it** - Personal apps don't need extreme optimization
2. **Adjust budgets** in `project.json`:
   ```json
   "budgets": [{
     "type": "initial",
     "maximumWarning": "700kb",
     "maximumError": "1mb"
   }]
   ```
3. **Optimize** (if needed):
   - Tree-shake PrimeNG: Import only used components
   - Code-split by route
   - Lazy load heavy features

**Recommendation**: Accept warnings for personal playground projects

---

### Supabase Integration Issues

#### Issue: "Supabase client failed to initialize"

**Symptoms**:
- Console error about Supabase initialization
- App falls back to localStorage (Calendar only)
- Data not persisting to cloud

**Cause**: Missing environment variables

**Solution**:
1. Create `.env` file in app directory:
   ```bash
   # apps/reward-chart/.env or apps/family-calendar/.env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart dev server
3. Check console: Should see "✅ Using Supabase for data storage"

**Verification**:
```typescript
// In browser console
console.log(this.supabaseService.isConfigured()); // Should be true
```

---

#### Issue: Supabase queries returning empty results

**Symptoms**:
- No data loads from Supabase
- Console shows no errors
- Database has data (verified in Supabase dashboard)

**Possible Causes & Solutions**:

**1. Row-Level Security (RLS) enabled without policies**:
```sql
-- Check in Supabase SQL Editor
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- If RLS is enabled but no policies, disable it:
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
```

**2. Wrong table schema**:
- Verify table exists: Check Supabase Table Editor
- Verify column names match TypeScript models

**3. Network issues**:
```javascript
// Check network tab in DevTools
// Should see requests to supabase.co
// Status should be 200, not 401/403/404
```

---

#### Issue: Supabase real-time subscriptions not working

**Symptoms**:
- Changes in database don't reflect immediately in UI
- Manual refresh shows new data

**Cause**: Real-time not currently implemented

**Status**: **Not a bug** - Real-time subscriptions are available but not yet utilized

**Future Implementation**:
```typescript
// Example implementation (not yet added)
this.supabase
  .from('events')
  .on('*', payload => {
    console.log('Change received!', payload);
    this.loadEventsFromSupabase();
  })
  .subscribe();
```

---

### Test & Lint Issues

#### Issue: Playwright tests fail with "browser not found"

**Symptoms**:
```bash
$ npx nx e2e family-calendar-e2e
Error: browserType.launch: Executable doesn't exist
```

**Cause**: Playwright browsers not installed

**Solution**:
```bash
npx playwright install --with-deps
```

**Prevention**: Add to CI setup (already in `.github/workflows/ci.yml`)

---

#### Issue: Jest tests fail with "Cannot find module"

**Symptoms**:
```bash
Cannot find module '@playground/tailwind-preset' from 'tailwind.config.js'
```

**Cause**: Jest trying to process Tailwind config

**Solution**: Add to Jest config:
```typescript
// jest.config.ts
modulePathIgnorePatterns: ['tailwind.config.js'],
```

**Status**: Not currently an issue (Tailwind config not imported in tests)

---

#### Issue: ESLint errors in IDE but passes in CLI

**Symptoms**:
- VS Code shows ESLint errors
- `npx nx lint` passes

**Cause**: IDE using different ESLint config

**Solution**:
1. Install ESLint extension in VS Code
2. Reload VS Code window
3. Check output panel → ESLint for errors
4. Ensure workspace settings don't override

**Verification**:
```bash
npx nx lint family-calendar --verbose
```

---

### Git & CI/CD Issues

#### Issue: GitHub Actions workflow failing on `npm ci`

**Symptoms**:
```
Error: The `npm ci` command can only install with an existing package-lock.json
```

**Cause**: `package-lock.json` not committed or out of sync

**Solution**:
```bash
# Ensure lock file is tracked
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

**Prevention**: Add to `.gitignore` check - ensure `package-lock.json` is NOT listed

---

#### Issue: Nx Cloud caching not working in CI

**Symptoms**:
- Every CI run rebuilds everything
- No cache hits in GitHub Actions logs

**Cause**: Nx Cloud access token not configured

**Solution**: Check `nx.json` has `nxCloudId`:
```json
{
  "nxCloudId": "690bb8b50b43db7aa6c2f781"
}
```

**Verification**: Look for "Nx Cloud" messages in CI logs

---

### Deployment Issues

#### Issue: Vercel deployment succeeds but shows 404

**Symptoms**:
- Build succeeds in Vercel
- Deployment URL shows 404 for all routes
- Static files not found

**Cause**: Incorrect output directory

**Solution**: Verify `vercel.json`:
```json
{
  "outputDirectory": "dist/apps/family-calendar/browser" // ✅ Correct
  // NOT: "dist/apps/family-calendar" // ❌ Missing /browser
}
```

**Why**: Angular 20.3 outputs to `/browser` subdirectory

---

#### Issue: SPA routing doesn't work on Vercel (404 on refresh)

**Symptoms**:
- App works on initial load
- Refresh on `/some-route` shows 404
- Direct navigation to routes fails

**Cause**: Missing SPA fallback configuration

**Solution**: Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Status**: Already configured correctly in current `vercel.json`

---

## Performance Debugging

### Slow Development Server

**Symptoms**: `nx serve` takes > 10 seconds to start

**Diagnosis**:
```bash
# Check for node_modules bloat
du -sh node_modules

# Check for large cache
du -sh .nx/cache

# Check for TypeScript compilation issues
npx nx serve --verbose
```

**Solutions**:
- Clear Nx cache: `npx nx reset`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

---

### Slow Production Builds

**Symptoms**: `nx build --configuration=production` takes > 30 seconds

**Diagnosis**:
```bash
# Verbose build output
npx nx build family-calendar --configuration=production --verbose

# Build with stats
npx nx build family-calendar --configuration=production --stats-json

# Analyze bundle with webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/apps/family-calendar/browser/stats.json
```

**Common Causes**:
- Large dependencies (PrimeNG, Supabase)
- Not using Nx cache
- TypeScript strictness issues

---

## Debugging Techniques

### Enable Nx Verbose Logging

```bash
NX_VERBOSE_LOGGING=true npx nx serve family-calendar
```

### Check Nx Cache

```bash
# Show cache status
npx nx show project family-calendar --web

# Reset cache
npx nx reset
```

### Debug Angular DevServer

```bash
# Verbose output
npx nx serve family-calendar --verbose

# Specific port
npx nx serve family-calendar --port=4201

# Open browser automatically
npx nx serve family-calendar --open
```

### Debug Supabase Queries

```typescript
// Add to service methods
const { data, error } = await this.supabase
  .from('events')
  .select('*');

console.log('Supabase Response:', { data, error });
if (error) console.error('Supabase Error:', error);
```

### Debug TypeScript Issues

```bash
# Check for type errors without running
npx tsc --noEmit

# Verbose TypeScript compilation
npx tsc --noEmit --listFiles
```

---

## Getting Help

### Check Logs

**Browser Console**:
- F12 → Console tab
- Look for errors (red) and warnings (yellow)
- Check Network tab for failed requests

**Build Logs**:
```bash
# Nx build logs
npx nx build family-calendar --verbose 2>&1 | tee build.log

# Vercel deployment logs
# Check Vercel dashboard → Deployments → View Function Logs
```

**GitHub Actions Logs**:
- Go to repository → Actions tab
- Click on failed workflow
- Expand failed step

### Useful Commands for Diagnosis

```bash
# Check Nx workspace health
npx nx report

# Show project configuration
npx nx show project family-calendar

# Show dependency graph
npx nx graph

# Lint with fixes
npx nx lint family-calendar --fix

# Test with coverage
npx nx test family-calendar --coverage

# Clear everything and start fresh
rm -rf node_modules package-lock.json dist .nx
npm install
```

### Log Files

- **Error log**: `error.log` (in workspace root, if exists)
- **NPM logs**: `~/.npm/_logs/` (recent debug logs)
- **Nx cache**: `.nx/cache/` (cached task outputs)

---

## Emergency Recovery

### Complete Reset

```bash
# Nuclear option - reset everything
rm -rf node_modules package-lock.json dist .nx .angular
npm install
npx nx reset
npx nx build family-calendar
```

### Restore from Git

```bash
# Discard all local changes
git reset --hard HEAD
git clean -fd

# Reinstall dependencies
npm ci
```

### Vercel Redeploy

```bash
# Trigger new deployment via CLI
npx vercel --prod

# Or via Git
git commit --allow-empty -m "Trigger rebuild"
git push
```

---

## Known Limitations (Not Bugs)

1. **Bundle size warnings**: Expected with PrimeNG + Supabase
2. **No authentication**: Planned future enhancement
3. **Different state patterns**: Intentional design decision (see ADR 0004)
4. **npm ci fails locally**: May occur with corrupted cache, use `npm install` instead
5. **Hardcoded family data**: Design choice for Reward Chart initial data

---

## References

- [Nx Troubleshooting](https://nx.dev/troubleshooting/resolve-circular-dependencies)
- [Angular Debugging](https://angular.dev/tools/debugging)
- [Supabase Error Codes](https://supabase.com/docs/guides/api/error-codes)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
