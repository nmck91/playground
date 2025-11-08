# Deployment Quick Reference Guide

> **For the team:** Everything you need to know about deployments in one page

---

## 🚀 How Deployments Work

```
Push to main → CI runs (lint/test/build/e2e) → CI passes ✅ → Deploys to Vercel
```

**Important:** Deployments happen automatically only after CI passes successfully.

### Workflow Sequence
1. **CI Workflow** runs first (lint, test, build, e2e for all apps)
2. **Deployment Workflows** trigger only if CI succeeds
3. **Path Filtering** checks if app-specific files changed
4. **Deploy** happens only for apps with relevant changes

**Safety:** If CI fails, deployments are automatically blocked.

---

## 📱 Apps & URLs

| App | Workflow File | Deploys When |
|-----|---------------|--------------|
| **Reward Chart** | `.github/workflows/deploy-reward-chart.yml` | Changes to `apps/reward-chart/**` AND CI passes |
| **Family Calendar** | `.github/workflows/deploy-family-calendar.yml` | Changes to `apps/family-calendar/**` AND CI passes |

**Note:** Changes to `package.json`, `package-lock.json`, or `nx.json` can trigger deployments for multiple apps, but only after CI passes.

---

## ⚡ Quick Commands

### Test Build Locally
```bash
# Build an app (same as CI does)
npx nx build reward-chart --configuration=production
npx nx build family-calendar --configuration=production

# Serve it locally to test
cd dist/apps/family-calendar/browser
npx http-server -p 3000
```

### Check What Would Deploy
```bash
# See what's changed since last deploy
git diff origin/main --name-only

# See which apps are affected
npx nx affected --target=build --base=origin/main
```

### View Deployment Status
```bash
# In browser
https://github.com/nmck91/playground/actions

# Or check latest workflow
# (requires gh CLI)
gh run list --limit 5
```

---

## 🔧 Common Issues & Fixes

### Issue: "My changes didn't trigger a deployment"

**Check:**
1. Did CI pass? (Deployments only run after CI succeeds)
2. Did you push to `main` branch?
3. Are your changes in `apps/{app-name}/**` path?
4. Check GitHub Actions tab → Look for both CI and deployment workflows

**Fix:**
```bash
# Verify branch
git branch --show-current  # Should say "main"

# Check CI status
# Go to: https://github.com/nmck91/playground/actions
# Look for the "CI" workflow - it must show ✅

# If CI failed, fix the errors first, then push
# If CI passed but no deployment, check path filtering
git diff HEAD~1 --name-only  # Shows what changed
```

### Issue: "CI passed but deployment didn't run"

**Cause:** Your changes didn't affect the app's files

**Check:**
```bash
# See what files changed
git diff HEAD~1 --name-only

# Deployment triggers when these change:
# - apps/reward-chart/** (for reward-chart)
# - apps/family-calendar/** (for family-calendar)
# - package.json
# - package-lock.json
# - nx.json
```

**Fix:** This is expected behavior. Deployments only run when relevant files change.

### Issue: "The provided path does not exist" during deployment

**Error Message:** `Error: The provided path "~/work/.../apps/{app-name}" does not exist`

**Cause:** Vercel project has Root Directory set to `apps/{app-name}`, which conflicts with our deployment path

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Find "Root Directory" setting
3. Change from `apps/{app-name}` to `.` (just a period)
4. Click Save
5. Re-run deployment

### Issue: "Deployment succeeded but site shows old version"

**Cause:** Browser cache or CDN cache

**Fix:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Wait 1-2 minutes for CDN to update

### Issue: "Build failed in GitHub Actions"

**Steps:**
1. Check the Actions tab for error logs
2. Look for the failed step (usually "Build with Nx")
3. Run the same command locally: `npx nx build {app} --configuration=production`
4. Fix the error locally, then push again

**Common Causes:**
- TypeScript errors
- Linting errors
- Missing dependencies
- Bundle size exceeded budget

---

## 🎯 Deployment Checklist

Before pushing to main:

- [ ] Run `npx nx lint {app}` - No linting errors
- [ ] Run `npx nx test {app}` - All tests pass
- [ ] Run `npx nx build {app} --configuration=production` - Build succeeds
- [ ] Run `npx nx e2e {app}-e2e` - E2E tests pass
- [ ] Test the built app locally (see commands above)
- [ ] Check bundle size warnings (should be under 500kb)

**Note:** CI runs all these checks automatically. If any fail, deployment is blocked.

---

## 📊 Understanding the Workflow

### Complete Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. Push to main                                        │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  2. CI Workflow Runs (2-5 min)                          │
│     • Checkout code                                     │
│     • Install dependencies                              │
│     • Run lint for all apps                             │
│     • Run tests for all apps                            │
│     • Run builds for all apps                           │
│     • Run e2e tests for all apps                        │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
     CI Failed ❌      CI Passed ✅
         │                 │
    STOP HERE             │
  No deployment           │
                          ▼
         ┌────────────────────────────────┐
         │ 3. Check Changed Files         │
         │    (Path Filter)               │
         └────┬──────────────────┬────────┘
              │                  │
    reward-chart changed   family-calendar changed
              │                  │
              ▼                  ▼
    ┌─────────────────┐   ┌──────────────────┐
    │ 4a. Deploy      │   │ 4b. Deploy       │
    │ Reward Chart    │   │ Family Calendar  │
    │ (1-2 min)       │   │ (1-2 min)        │
    └─────────────────┘   └──────────────────┘
```

### Deployment Steps (after CI passes)

```yaml
1. Check changed files         # Skip if app unchanged
2. Checkout code               # Get latest from GitHub
3. Setup Node.js v20           # Install Node with npm cache
4. npm ci                      # Install dependencies
5. nx build {app} --prod       # Nx builds the app
6. Install Vercel CLI          # Get deployment tool
7. Create vercel.json          # Configure SPA routing
8. vercel deploy --prod        # Upload to Vercel
```

**Total Time:** Usually 3-7 minutes (CI + deployment)

---

## 🔐 Secrets & Configuration

**GitHub Secrets** (already configured, FYI):
- `VERCEL_TOKEN` - Authenticates with Vercel
- `VERCEL_ORG_ID` - Your Vercel organization
- `VERCEL_PROJECT_ID` - Reward Chart project ID
- `VERCEL_PROJECT_ID_CALENDAR` - Family Calendar project ID

**Don't touch these unless you know what you're doing!**

---

## 🌟 Best Practices

### ✅ Do

- Push small, incremental changes
- Test builds locally before pushing
- Check GitHub Actions logs if deployment fails
- Keep dependencies up to date
- Write good commit messages

### ❌ Don't

- Commit `vercel.json` files to repo (they're auto-generated)
- Push directly to main without testing
- Ignore build warnings about bundle size
- Skip linting or tests
- Force push to main

---

## 🆘 Getting Help

### Deployment Failed?
1. Check GitHub Actions logs (link in commit status)
2. Look for red ❌ in the workflow
3. Read the error message
4. Try reproducing locally

### Still Stuck?
1. Check `docs/deployment-standard.md` for detailed info
2. Check `docs/deployment-best-practices.md` for troubleshooting
3. Ask the team!

### Logs & Monitoring
- **GitHub Actions:** https://github.com/nmck91/playground/actions
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Nx Cloud:** Check build logs at links in terminal output

---

## 🔄 Rolling Back a Deployment

If something goes wrong in production:

**Option 1: Deploy Previous Commit (Recommended)**
```bash
# Revert to previous commit
git revert HEAD
git push

# This triggers a new deployment with the old code
```

**Option 2: Promote Old Deployment in Vercel**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Find a working deployment
5. Click "⋯" → "Promote to Production"

---

## 📚 More Documentation

- **Full Standard:** `docs/deployment-standard.md`
- **Best Practices:** `docs/deployment-best-practices.md`
- **Nx Docs:** https://nx.dev
- **Vercel Docs:** https://vercel.com/docs

---

## 🎓 Understanding the Architecture

### Why This Way?

**Nx builds, not Vercel:**
- ✅ Consistent builds (same locally and CI)
- ✅ Nx caching (faster builds)
- ✅ Easy to switch platforms (Netlify, etc.)

**Dynamic vercel.json:**
- ✅ No stale config files
- ✅ Single source of truth (in workflow)
- ✅ Easier to maintain

**Deploy from browser/ subdirectory:**
- ✅ Angular outputs to `dist/apps/{app}/browser/`
- ✅ That's where the actual SPA files are
- ✅ Correct path resolution

---

## 🚦 Deployment States

| Symbol | Meaning |
|--------|---------|
| 🟡 In Progress | Workflow is running |
| ✅ Success | Deployed successfully |
| ❌ Failed | Something went wrong |
| ⏸️ Skipped | No changes to this app |

Check GitHub commit status or Actions tab to see current state.

---

## 💡 Pro Tips

1. **Use Nx Cloud** - Already enabled! Speeds up builds significantly
2. **Check affected** - See what would deploy before pushing
3. **Monitor bundle size** - Keep it under 500kb for best performance
4. **Test locally** - Always build and test before pushing
5. **Read the logs** - GitHub Actions logs are very helpful

---

## 🆕 Adding a New App?

Follow the setup guide in `docs/deployment-standard.md` under "Setup Guide for New Apps"

**TLDR:**
1. Create Vercel project
2. Get project ID
3. Add GitHub secret
4. Copy and modify workflow file
5. Push!

---

**Last Updated:** 2025-11-07
**Maintained By:** Development Team
**Questions?** Check the docs or ask the team!

---

## 🎯 TL;DR - The Essentials

```bash
# Test locally
npx nx build {app} --configuration=production

# Push to deploy
git push origin main

# Check status
# → GitHub Actions tab in repo

# If something breaks
git revert HEAD && git push
```

**That's it! Deployments are automatic and consistent.** 🚀
