# Deployment Quick Reference Guide

> **For the team:** Everything you need to know about deployments in one page

---

## 🚀 How Deployments Work

```
Push to main → GitHub Actions builds with Nx → Deploys to Vercel
```

**Important:** Deployments happen automatically when you push changes to `main` branch.

---

## 📱 Apps & URLs

| App | Workflow File | Deploys When |
|-----|---------------|--------------|
| **Reward Chart** | `.github/workflows/deploy.yml` | Changes to `apps/reward-chart/**` |
| **Family Calendar** | `.github/workflows/deploy-family-calendar.yml` | Changes to `apps/family-calendar/**` |

**Note:** Changes to `package.json`, `package-lock.json`, or `nx.json` trigger ALL app deployments.

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
1. Did you push to `main` branch?
2. Are your changes in `apps/{app-name}/**` path?
3. Check GitHub Actions tab for workflow runs

**Fix:**
```bash
# Verify branch
git branch --show-current  # Should say "main"

# Trigger deployment manually if needed
git commit --allow-empty -m "Trigger deployment"
git push
```

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
- [ ] Test the built app locally (see commands above)
- [ ] Check bundle size warnings (should be under 500kb)

---

## 📊 Understanding the Workflow

Each deployment follows these exact steps:

```yaml
1. Checkout code               # Get latest from GitHub
2. Setup Node.js v20           # Install Node with npm cache
3. npm ci                      # Install dependencies (fast)
4. nx build {app} --prod       # Nx builds the app
5. Install Vercel CLI          # Get deployment tool
6. Create vercel.json          # Configure SPA routing
7. vercel deploy --prod        # Upload to Vercel
```

**Time:** Usually 2-4 minutes total

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
