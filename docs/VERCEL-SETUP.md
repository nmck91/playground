# Vercel Deployment Setup (Free Tier)

Since we're using Vercel's free tier, we use **Vercel's GitHub Integration** instead of CI/CD workflows with tokens (which requires Pro plan).

## How It Works

```
Push to main → CI runs → Vercel detects push → Vercel builds & deploys
```

Vercel watches your GitHub repository and automatically builds/deploys when you push to main.

---

## Initial Setup (One-Time)

### 1. Connect Repository to Vercel

For **Family Calendar**:

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `nmck91/playground`
4. Configure project:
   - **Project Name**: `family-calendar`
   - **Framework Preset**: Other
   - **Root Directory**: `apps/family-calendar` ⚠️ IMPORTANT
   - Leave build settings empty (vercel.json handles this)
5. Click "Deploy"

For **Reward Chart**:

1. Go to https://vercel.com/new again
2. Click "Import Git Repository"
3. Select `nmck91/playground` (same repo)
4. Configure project:
   - **Project Name**: `reward-chart`
   - **Framework Preset**: Other
   - **Root Directory**: `apps/reward-chart` ⚠️ IMPORTANT
   - Leave build settings empty (vercel.json handles this)
5. Click "Deploy"

### 2. Verify Configuration

Each app has a `vercel.json` file that tells Vercel how to build:

**apps/family-calendar/vercel.json**:
```json
{
  "buildCommand": "cd ../.. && npx nx build family-calendar --configuration=production",
  "outputDirectory": "../../dist/apps/family-calendar/browser",
  "installCommand": "cd ../.. && npm ci",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This tells Vercel:
- Install dependencies from repo root
- Build using Nx from repo root
- Output is in dist/apps/.../browser
- Use SPA routing (all routes → index.html)

---

## How Deployments Work

### Automatic Deployments

1. You push code to `main`
2. GitHub Actions CI runs (lint, test, build, e2e)
3. Vercel detects the push
4. Vercel builds and deploys **automatically**
5. Done! ✅

### What Gets Deployed

- **Production**: Every push to `main` → production deployment
- **Preview**: Every pull request → preview deployment

### Deployment Safety

⚠️ **Important**: Vercel deploys even if CI fails! To prevent deploying broken code:

**Option 1: Use Vercel's GitHub Checks Integration** (Recommended)
1. Go to Vercel Project Settings → Git
2. Enable "Wait for GitHub CI"
3. Vercel will wait for CI to pass before deploying

**Option 2: Manual Review**
- Check CI status in GitHub Actions before merging PRs
- Only merge to main when CI is green ✅

---

## Monitoring Deployments

### View Deployment Status

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Commits**: Each commit shows Vercel deployment status
- **Vercel Bot**: Comments on PRs with preview URLs

### Deployment URLs

Once deployed, you'll get:
- **Production URL**: `https://family-calendar.vercel.app`
- **Production URL**: `https://reward-chart.vercel.app`
- **Custom domains**: Can add in Vercel project settings

---

## Troubleshooting

### Build Fails on Vercel

1. Check Vercel build logs in dashboard
2. Verify `vercel.json` paths are correct
3. Test build locally:
   ```bash
   npx nx build family-calendar --configuration=production
   ```

### Wrong Files Deployed

- Verify "Root Directory" is set to `apps/{app-name}` in Vercel project settings
- Check that `outputDirectory` in vercel.json is correct

### Deployment Takes Too Long

- Vercel free tier has build time limits
- If builds timeout, consider:
  - Optimizing bundle size
  - Reducing dependencies
  - Upgrading to Pro plan

---

## Removing Old Setup

The following are **NO LONGER NEEDED** (deleted):
- ❌ `.github/workflows/deploy-family-calendar.yml`
- ❌ `.github/workflows/deploy-reward-chart.yml`
- ❌ Vercel secrets (VERCEL_TOKEN, VERCEL_ORG_ID, etc.)

These were for CLI-based deployments which require Vercel Pro.

---

## Benefits of GitHub Integration

✅ **Free**: No Pro plan required
✅ **Automatic**: Deploys on every push
✅ **Preview Deployments**: Auto-deploy PRs
✅ **Rollbacks**: Easy rollback in dashboard
✅ **No Token Management**: No secrets to maintain

---

## CI Still Runs

Your GitHub Actions CI workflow still runs and provides:
- ✅ Linting
- ✅ Unit tests
- ✅ E2E tests
- ✅ Build verification

This ensures code quality even though Vercel handles deployment.

---

## Next Steps

1. Follow "Initial Setup" above to connect your projects
2. Push this commit to trigger first deployment
3. Verify deployments in Vercel dashboard
4. (Optional) Add custom domains in Vercel settings
5. (Optional) Enable "Wait for CI" in Vercel Git settings
