# Standardized Deployment Pattern for Nx Monorepo

**Status:** ✅ Active Standard
**Last Updated:** 2025-11-07
**Applies To:** All Angular apps in this monorepo

---

## Philosophy

This monorepo uses a **platform-agnostic, CI/CD-first deployment strategy**:

- ✅ **GitHub Actions owns the entire pipeline** (install → build → deploy)
- ✅ **Nx handles all builds** (leveraging caching and dependency graph)
- ✅ **Hosting platforms are simple static hosts** (Vercel, Netlify, etc.)
- ✅ **100% consistent across all apps** (same pattern, easy to maintain)
- ✅ **Easy to migrate** (swap Vercel for Netlify by changing 3 lines)

---

## Architecture Overview

```
┌────────────────────────────────────────────────────┐
│            Git Push to Main Branch                  │
│         (apps/reward-chart/** changes)             │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│          GitHub Actions Workflow Triggers           │
│      (.github/workflows/deploy-{app}.yml)          │
└──────────────────┬─────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  1. npm ci           │  Install dependencies
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  2. nx build {app}   │  Nx builds (with caching)
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  3. Create config    │  Generate vercel.json for SPA
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  4. vercel deploy    │  Deploy to hosting platform
        └──────────┬───────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────┐
│              Production Deployment                  │
│         https://{app}.vercel.app                   │
└────────────────────────────────────────────────────┘
```

---

## Standard Workflow Template

Every app uses this **exact same pattern**:

```yaml
name: Deploy {App Name} to Vercel

on:
  push:
    branches:
      - main
    paths:
      - 'apps/{app-name}/**'
      - 'package.json'
      - 'package-lock.json'
      - 'nx.json'

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_XXX }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build with Nx
        run: npx nx build {app-name} --configuration=production

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Create Vercel SPA Configuration
        run: |
          cat > dist/apps/{app-name}/browser/vercel.json << 'EOF'
          {
            "version": 2,
            "rewrites": [
              { "source": "/(.*)", "destination": "/index.html" }
            ]
          }
          EOF

      - name: Deploy to Vercel
        run: vercel deploy dist/apps/{app-name}/browser --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_XXX }}
```

---

## Current Apps

### Reward Chart
- **Workflow:** `.github/workflows/deploy.yml`
- **Project ID Secret:** `VERCEL_PROJECT_ID`
- **Build Output:** `dist/apps/reward-chart/browser/`
- **URL:** TBD

### Family Calendar
- **Workflow:** `.github/workflows/deploy-family-calendar.yml`
- **Project ID Secret:** `VERCEL_PROJECT_ID_CALENDAR`
- **Build Output:** `dist/apps/family-calendar/browser/`
- **URL:** TBD

---

## Key Design Decisions

### Why Build with Nx (not Vercel)?

**Benefits:**
1. ✅ **Nx Caching** - Don't rebuild unchanged code
2. ✅ **Consistent Builds** - Same locally and in CI
3. ✅ **Monorepo Awareness** - Nx understands dependencies
4. ✅ **Developer Testing** - Test exact production build locally
5. ✅ **Platform Independence** - Not locked to Vercel's build system

**Trade-off:**
- ❌ CI minutes used for builds (but we save on Vercel build minutes)

### Why Deploy from `browser/` Subdirectory?

Angular's `@angular/build:application` executor outputs:
```
dist/apps/{app}/
├── browser/           ← THIS is the SPA root
│   ├── index.html
│   ├── main-xxx.js
│   └── ...
├── 3rdpartylicenses.txt
└── prerendered-routes.json
```

The `browser/` directory contains the actual static site. Deploying from there ensures:
- ✅ Correct path resolution for assets
- ✅ index.html at the root
- ✅ Proper SPA routing

### Why Generate `vercel.json` in Workflow?

Instead of committing vercel.json files to the repo:

**Benefits:**
1. ✅ **Single Source of Truth** - Config lives in workflow
2. ✅ **No Stale Files** - Can't accidentally deploy old config
3. ✅ **Clear Intent** - Deployment config visible where it's used
4. ✅ **Easy to Update** - Change workflow, affects all future deployments

### Why Use `vercel deploy` (not `vercel deploy --prebuilt`)?

When deploying from `browser/` with vercel.json present:
- ✅ Vercel treats the directory as a static site
- ✅ No build step needed (already built by Nx)
- ✅ Fast deployment (just uploads files)
- ✅ Proper routing configured via vercel.json rewrites

---

## Switching to Netlify

To migrate from Vercel to Netlify, change only the deployment step:

```yaml
# Replace this:
- name: Install Vercel CLI
  run: npm install --global vercel@latest

- name: Create Vercel SPA Configuration
  run: |
    cat > dist/apps/{app-name}/browser/vercel.json << 'EOF'
    {
      "version": 2,
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    EOF

- name: Deploy to Vercel
  run: |
    cd dist/apps/{app-name}/browser
    vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }} --yes
  env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_XXX }}

# With this:
- name: Install Netlify CLI
  run: npm install --global netlify-cli

- name: Create Netlify Configuration
  run: |
    cat > dist/apps/{app-name}/browser/_redirects << 'EOF'
    /*    /index.html   200
    EOF

- name: Deploy to Netlify
  run: netlify deploy --prod --dir=dist/apps/{app-name}/browser --site=${{ secrets.NETLIFY_SITE_ID }} --auth=${{ secrets.NETLIFY_AUTH_TOKEN }}
```

Everything else stays the same! 🎉

---

## Local Testing

Test the exact production build locally:

```bash
# Build the app
npx nx build family-calendar --configuration=production

# Serve it locally
cd dist/apps/family-calendar/browser
npx http-server -p 3000

# Test in browser
open http://localhost:3000
```

Test routing by navigating to routes and refreshing - should not 404.

---

## Setup Guide for New Apps

When adding a new Angular app to the monorepo:

### 1. Create Vercel Project
- Go to https://vercel.com/dashboard
- Click "Add New..." → "Project"
- Import your GitHub repo
- **Important:** Select "Other" framework (not Angular)
- Leave all build settings **empty**
- Click "Deploy"

### 2. Get Project ID
```bash
# From Vercel Dashboard
Settings → General → Project ID
```

### 3. Add GitHub Secret
- Go to GitHub repo → Settings → Secrets → Actions
- Click "New repository secret"
- Name: `VERCEL_PROJECT_ID_{APP_NAME_UPPER}`
- Value: `{the-project-id}`

### 4. Create Workflow File
Copy `.github/workflows/deploy.yml` and replace:
- App name (3 places)
- Secret name (2 places)

### 5. Push and Deploy
```bash
git add .github/workflows/deploy-{new-app}.yml
git commit -m "Add deployment for {new-app}"
git push
```

Done! 🚀

---

## Required GitHub Secrets

| Secret Name | Purpose | Shared? |
|-------------|---------|---------|
| `VERCEL_TOKEN` | Vercel API authentication | ✅ All apps |
| `VERCEL_ORG_ID` | Your Vercel organization | ✅ All apps |
| `VERCEL_PROJECT_ID` | Reward Chart project | ❌ App-specific |
| `VERCEL_PROJECT_ID_CALENDAR` | Family Calendar project | ❌ App-specific |

---

## Troubleshooting

### Issue: 404 on All Routes

**Symptoms:** App loads at `/` but refreshing on `/events` gives 404

**Cause:** Missing or incorrect SPA rewrites

**Fix:** Verify vercel.json is created in workflow:
```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: Assets 404 (CSS/JS not loading)

**Symptoms:** Page loads but looks broken, missing styles/scripts

**Cause:** Deploying from wrong directory

**Fix:** Ensure workflow deploys from `dist/apps/{app}/browser/`, not `dist/apps/{app}/`

### Issue: Workflow Doesn't Trigger

**Symptoms:** Push to main but workflow doesn't run

**Possible Causes:**
1. Changes not in `apps/{app-name}/**` paths
2. Branch is not `main`
3. Workflow file syntax error

**Fix:**
```bash
# Check workflow syntax
yamllint .github/workflows/deploy-{app}.yml

# Verify trigger paths match your changes
git diff origin/main --name-only
```

### Issue: Build Succeeds but Deploy Fails

**Symptoms:** Nx build completes but Vercel deployment fails

**Possible Causes:**
1. Missing or invalid `VERCEL_*` secrets
2. Wrong Vercel project ID
3. Vercel account issues

**Fix:**
```bash
# Verify secrets exist in GitHub
gh secret list

# Test Vercel auth locally
vercel whoami --token=$VERCEL_TOKEN
```

---

## Performance Optimizations

### Nx Cloud Caching

Enable Nx Cloud for distributed caching across CI runs:

```bash
# One-time setup
npx nx connect-to-nx-cloud
```

This can reduce build times from minutes to seconds when code hasn't changed.

### GitHub Actions Caching

Already enabled in workflows via:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # ← Caches node_modules
```

### Nx Affected Commands (Future Enhancement)

For repos with many apps, add an affected check:

```yaml
- name: Check if affected
  id: affected
  run: |
    if npx nx affected --target=build --base=origin/main --head=HEAD | grep -q "{app-name}"; then
      echo "deploy=true" >> $GITHUB_OUTPUT
    else
      echo "deploy=false" >> $GITHUB_OUTPUT
    fi

- name: Deploy to Vercel
  if: steps.affected.outputs.deploy == 'true'
  run: ...
```

This skips deployment if the app wasn't affected by changes.

---

## Monitoring

### Deployment Status

- **GitHub Actions:** Track workflow runs and logs
- **Vercel Dashboard:** View deployment history and analytics
- **Production URL:** Monitor actual site availability

### Metrics to Track

| Metric | Where | What to Look For |
|--------|-------|------------------|
| Build Time | GitHub Actions | Should be <3 minutes |
| Deploy Time | Vercel Dashboard | Should be <1 minute |
| Bundle Size | Build logs | Watch for budget warnings |
| Success Rate | GitHub Actions | Should be >95% |

---

## Best Practices

### ✅ Do

- Keep workflows identical across apps
- Test builds locally before pushing
- Use `--configuration=production` for all deployments
- Monitor build times and bundle sizes
- Keep dependencies up to date

### ❌ Don't

- Commit vercel.json files to the repo
- Mix deployment strategies between apps
- Skip the browser/ subdirectory
- Use `vercel build` in workflows
- Hardcode secrets in workflows

---

## Future Enhancements

### Short Term
- [ ] Add Nx affected checks to skip unnecessary deployments
- [ ] Add deployment notifications (Slack/Discord)
- [ ] Create staging environment workflows
- [ ] Add smoke tests post-deployment

### Medium Term
- [ ] Implement preview deployments for PRs
- [ ] Add performance budgets to CI
- [ ] Set up error tracking (Sentry)
- [ ] Add bundle analysis reports

### Long Term
- [ ] Multi-region deployments
- [ ] Blue-green deployment strategy
- [ ] Automated rollback on errors
- [ ] A/B testing framework

---

## Related Documentation

- [Nx Documentation](https://nx.dev)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Angular Build Configuration](https://angular.dev/tools/cli/build)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

## Document History

| Date | Change | Author |
|------|--------|--------|
| 2025-11-07 | Initial standardization | Winston (Architect) |

---

**Questions or issues?** Check troubleshooting section or review workflow logs in GitHub Actions.
