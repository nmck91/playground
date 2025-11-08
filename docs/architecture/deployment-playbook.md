# Deployment Playbook

## Overview

This playbook provides step-by-step deployment procedures for the Playground Nx monorepo applications.

**Current Deployment Strategy**:
- **Platform**: Vercel
- **Trigger**: GitHub push to `main` branch
- **Apps**: family-calendar, reward-chart
- **Backend**: Supabase (managed separately)

---

## Pre-Deployment Checklist

### Local Validation

- [ ] All tests pass: `npx nx run-many -t test`
- [ ] All lints pass: `npx nx run-many -t lint`
- [ ] Production build succeeds: `npx nx build [app] --configuration=production`
- [ ] E2E tests pass: `npx nx run-many -t e2e`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] `package-lock.json` is committed and up-to-date
- [ ] `.env` files NOT committed (check `.gitignore`)

### Code Review

- [ ] Changes reviewed and approved (if using PRs)
- [ ] Breaking changes documented
- [ ] Architecture documentation updated (if needed)
- [ ] ADRs created for significant decisions

### Environment Configuration

- [ ] Vercel environment variables configured:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- [ ] Vercel Root Directory set to `.` (workspace root)
- [ ] `vercel.json` at workspace root

---

## Deployment Process

### Automated Deployment (Recommended)

**Trigger**: Push to `main` branch

```bash
# 1. Ensure you're on main and up-to-date
git checkout main
git pull origin main

# 2. Run full CI suite locally
npx nx run-many -t lint test build e2e

# 3. Commit and push
git add .
git commit -m "feat: your feature description"
git push origin main

# 4. Monitor deployment
# Go to Vercel dashboard or use CLI:
npx vercel ls
```

**Automatic Steps** (handled by Vercel):
1. Webhook triggers on GitHub push
2. Vercel clones repository
3. Runs `npm ci` to install dependencies
4. Runs build command: `npx nx build [app] --configuration=production`
5. Deploys to edge network
6. Updates production URL

**Typical Duration**: 2-3 minutes

---

### Manual Deployment (Vercel CLI)

**Use Case**: Testing deployment without pushing to main

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Link to Vercel project (first time only)
npx vercel link

# 3. Deploy to preview
npx vercel

# 4. Deploy to production
npx vercel --prod
```

**Note**: Manual deployments bypass GitHub integration

---

## Deployment Verification

### Automated Checks

**GitHub Actions**:
1. Go to repository → Actions tab
2. Verify latest workflow is green ✅
3. Check logs for any warnings

**Vercel**:
1. Go to Vercel dashboard → Deployments
2. Verify status is "Ready" ✅
3. Check build logs for errors/warnings

### Manual Verification

**Smoke Tests**:

```bash
# Family Calendar
curl -I https://family-calendar-niall-mckinneys-projects.vercel.app
# Expected: 200 OK

# Reward Chart
curl -I https://family-reward-chart-niall-mckinneys-projects.vercel.app
# Expected: 200 OK
```

**Browser Tests**:
- [ ] App loads without errors (check console)
- [ ] Supabase connection works (check for data load)
- [ ] Primary user flows work:
  - **Family Calendar**: Create event, view calendar
  - **Reward Chart**: Toggle star, view rewards modal
- [ ] No console errors or warnings
- [ ] Lighthouse scores acceptable (Performance > 90)

**Database Verification**:
1. Open Supabase dashboard
2. Check recent activity logs
3. Verify connections from deployed apps

---

## Rollback Procedures

### Quick Rollback (Vercel Dashboard)

**If Deployment Breaks Production**:

1. Go to Vercel dashboard → Deployments
2. Find last working deployment
3. Click three dots (⋮) → "Promote to Production"
4. Confirm rollback

**Duration**: ~30 seconds

---

### Git-Based Rollback

**If Need to Revert Code**:

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to that commit
git revert HEAD  # Revert last commit
# OR
git revert <commit-hash>  # Revert specific commit

# 3. Push revert commit
git push origin main

# 4. Wait for automatic deployment
```

**Duration**: 2-3 minutes (automatic deployment time)

---

### Emergency Database Rollback

**If Database Schema Migration Failed**:

```sql
-- In Supabase SQL Editor

-- 1. Check migration history
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;

-- 2. Rollback to previous state
-- (Depends on your migration system)

-- 3. If no migration system, restore from backup
-- Go to Supabase → Database → Backups → Restore
```

**Prevention**: Always test schema changes on staging database first

---

## Environment-Specific Deployments

### Staging Environment (Not Yet Configured)

**To Set Up Staging**:

1. Create new Vercel project for staging
2. Configure to deploy from `develop` branch
3. Use separate Supabase project
4. Update environment variables

```bash
# Example staging deployment
git checkout develop
git push origin develop
# Vercel auto-deploys to staging URL
```

---

### Feature Branch Previews

**Automatic Preview Deployments**:

1. Create PR from feature branch
2. Vercel automatically creates preview deployment
3. Preview URL added as comment on PR
4. Each new commit updates preview

**Testing Previews**:
- Preview URLs are temporary
- Use for testing before merge
- Share with stakeholders for review

---

## Post-Deployment Tasks

### Monitoring

**Immediate** (First 15 minutes):
- [ ] Check Vercel deployment status
- [ ] Monitor error logs in browser console
- [ ] Check Supabase activity logs
- [ ] Test critical user flows

**Short-term** (First 24 hours):
- [ ] Monitor for increased error rates
- [ ] Check performance metrics
- [ ] Verify analytics tracking (if implemented)

**Long-term**:
- [ ] Review user feedback
- [ ] Monitor bundle size trends
- [ ] Check for deprecation warnings

### Communication

**For Significant Deployments**:
- [ ] Update changelog (if maintained)
- [ ] Notify users of new features (if applicable)
- [ ] Document known issues

---

## Deployment Configuration Reference

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npx nx build family-calendar --configuration=production",
  "outputDirectory": "dist/apps/family-calendar/browser",
  "devCommand": "npx nx serve family-calendar",
  "installCommand": "npm ci",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Key Settings**:
- `buildCommand`: Must use Nx CLI with production config
- `outputDirectory`: Must include `/browser` subdirectory (Angular 20.3)
- `installCommand`: Use `npm ci` for deterministic installs
- `rewrites`: Enable SPA routing

---

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx nx run-many -t lint test build e2e
      - run: npx nx fix-ci
        if: always()
```

**Triggers**:
- Push to `main`: Full CI suite
- Pull requests: Full CI suite

---

### Supabase Configuration

**Connection Details** (set in Vercel environment variables):
```
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
```

**Database Settings**:
- Connection pooling: Default (Supabase managed)
- SSL: Required (automatic)
- Region: Closest to users (set during Supabase project creation)

---

## Common Deployment Scenarios

### Scenario 1: Deploying New Feature

```bash
# 1. Feature development on branch
git checkout -b feature/new-calendar-view
# ... develop feature ...

# 2. Test locally
npx nx test family-calendar
npx nx build family-calendar --configuration=production

# 3. Create PR
git push origin feature/new-calendar-view
# GitHub PR + Vercel preview created automatically

# 4. Review preview deployment
# Vercel comment on PR has preview URL

# 5. Merge to main
git checkout main
git merge feature/new-calendar-view
git push origin main

# 6. Automatic production deployment
# Wait 2-3 minutes, verify at production URL
```

---

### Scenario 2: Hotfix Deployment

```bash
# 1. Create hotfix branch from main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix bug
# ... make changes ...

# 3. Test fix
npx nx test reward-chart
npx nx e2e reward-chart-e2e

# 4. Fast-track merge
git checkout main
git merge hotfix/critical-bug
git push origin main

# 5. Monitor deployment closely
# Verify fix in production immediately
```

---

### Scenario 3: Database Schema Change

```bash
# 1. Test schema change on Supabase staging (if available)

# 2. Run migration on production Supabase
# Via Supabase SQL Editor or CLI

# 3. Deploy app changes that use new schema
git push origin main

# 4. Verify data access works with new schema
# Check Supabase logs for query errors
```

**Critical**: Deploy schema changes BEFORE app code that depends on them

---

### Scenario 4: Dependency Update

```bash
# 1. Update dependency
npm update @angular/core

# 2. Test thoroughly
npx nx run-many -t test build e2e

# 3. Verify bundle size impact
npx nx build family-calendar --configuration=production
# Check build output for size warnings

# 4. Commit lock file
git add package.json package-lock.json
git commit -m "chore: update Angular to X.Y.Z"
git push origin main
```

---

## Deployment Metrics

### Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Time | < 30s | Vercel deployment logs |
| Deployment Frequency | Daily (as needed) | Git commits to main |
| Time to Production | < 5 min | Git push → Vercel ready |
| Rollback Time | < 2 min | Vercel promote previous |
| Zero-Downtime | 100% | Vercel edge deployment |

### Performance Targets

| App | Initial Load (Gzip) | Time to Interactive | First Contentful Paint |
|-----|---------------------|---------------------|------------------------|
| Family Calendar | < 160KB | < 2s | < 1s |
| Reward Chart | < 160KB | < 2s | < 1s |

---

## Security Considerations

### Secrets Management

**Never Commit**:
- `.env` files with real credentials
- Supabase service role keys
- API keys or tokens

**Use Vercel Environment Variables**:
- Set in Vercel dashboard → Settings → Environment Variables
- Separate variables for Production, Preview, Development
- Rotate keys periodically

### Access Control

**Vercel**:
- Limit team members with deployment access
- Use GitHub integration for audit trail
- Enable deployment protection (if needed)

**Supabase**:
- Use anon key for client apps (not service role key)
- Implement Row-Level Security (RLS) when adding auth
- Review database access logs regularly

---

## Troubleshooting Deployments

### Build Fails on Vercel

**Symptom**: "Error: Command exited with 1"

**Debug Steps**:
1. Check Vercel build logs for specific error
2. Reproduce locally: `npx nx build [app] --configuration=production`
3. Common causes:
   - TypeScript errors
   - Missing environment variables
   - Out-of-sync `package-lock.json`

**Solution**: Fix error locally, test, then push

---

### Deployment Succeeds but App Broken

**Symptom**: App shows blank page or errors

**Debug Steps**:
1. Open browser console (F12) on production URL
2. Check for JavaScript errors
3. Check Network tab for failed requests
4. Common causes:
   - Supabase env vars not set
   - API URL mismatch
   - Missing static assets

**Solution**: Verify environment variables in Vercel dashboard

---

### Slow Deployment Times

**Symptom**: Deployment takes > 5 minutes

**Possible Causes**:
- Nx cache not working
- Large dependencies causing slow install
- Build optimization taking longer

**Solutions**:
- Verify `nxCloudId` in `nx.json`
- Check for package.json changes causing full rebuild
- Review bundle size optimizations

---

## References

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Nx CLI Reference](https://nx.dev/nx-api/nx/documents/run)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Previous deployment issues: See commits e3ef66a, fc6f403
