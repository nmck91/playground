# Deployment Best Practices for Nx Monorepo with Vercel

## Overview

This document outlines the recommended deployment architecture for deploying multiple Angular applications from an Nx monorepo to Vercel using GitHub Actions.

**Created:** 2025-11-07
**Status:** Active
**Architecture Type:** Nx Monorepo + Multiple Vercel Projects + GitHub Actions CI/CD

---

## Executive Summary

### Current State Analysis

**Apps in Monorepo:**
- `reward-chart` - Angular application
- `family-calendar` - Angular application with Supabase integration

**Critical Issues Identified:**
1. ❌ **Inconsistent deployment strategies** between apps
2. ❌ **Incorrect build output paths** in configurations
3. ❌ **Mixed responsibility** (Vercel build vs Nx build) causing confusion
4. ❌ **Missing Nx-aware deployment optimization** (not using `nx affected`)
5. ❌ **Angular output path mismatch** (`browser/` subdirectory not accounted for)

---

## Architecture Principles

### 1. Separation of Concerns
- **One Vercel Project per App** - Each app is an independent deployment unit
- **Nx for Build Orchestration** - Leverage Nx caching and dependency graph
- **GitHub Actions for CI/CD** - Centralized workflow management
- **Vercel for Hosting Only** - Don't use Vercel's build system, use Nx

### 2. Build Output Consistency
Both apps use `@angular/build:application` executor which outputs to:
```
dist/apps/{app-name}/browser/
```

This `browser/` subdirectory is critical and must be accounted for in all deployment configurations.

### 3. Single Source of Truth
- Build commands defined in `project.json` (Nx configuration)
- Deployment configuration in GitHub Actions workflows
- Vercel projects configured for hosting only (no build commands)

---

## Recommended Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                      (Nx Monorepo)                          │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ Push to main                   │ Push to main
             │ (affects reward-chart)         │ (affects family-calendar)
             ▼                                ▼
┌────────────────────────────┐  ┌────────────────────────────┐
│   GitHub Actions Workflow  │  │   GitHub Actions Workflow  │
│   deploy-reward-chart.yml  │  │   deploy-family-calendar   │
└────────────┬───────────────┘  └────────────┬───────────────┘
             │                                │
             │ 1. nx affected --base          │ 1. nx affected --base
             │ 2. npm ci                      │ 2. npm ci
             │ 3. nx build reward-chart       │ 3. nx build family-calendar
             │ 4. Deploy to Vercel            │ 4. Deploy to Vercel
             ▼                                ▼
┌────────────────────────────┐  ┌────────────────────────────┐
│   Vercel Project           │  │   Vercel Project           │
│   reward-chart             │  │   family-calendar          │
│   (Static Hosting Only)    │  │   (Static Hosting Only)    │
└────────────────────────────┘  └────────────────────────────┘
```

---

## Implementation Guide

### Step 1: Vercel Project Configuration

Each app needs its own Vercel project. Configure in Vercel Dashboard:

#### Reward Chart Project
```json
{
  "name": "family-reward-chart",
  "framework": null,
  "buildCommand": "",
  "outputDirectory": "",
  "installCommand": "",
  "rootDirectory": "."
}
```

#### Family Calendar Project
```json
{
  "name": "family-calendar",
  "framework": null,
  "buildCommand": "",
  "outputDirectory": "",
  "installCommand": "",
  "rootDirectory": "."
}
```

**Important:** Leave build commands empty - we'll handle builds in GitHub Actions.

### Step 2: GitHub Secrets Required

```bash
VERCEL_TOKEN              # Your Vercel API token
VERCEL_ORG_ID            # Your Vercel organization ID
VERCEL_PROJECT_ID        # Reward Chart project ID
VERCEL_PROJECT_ID_CALENDAR # Family Calendar project ID
```

### Step 3: Standardized Workflow Template

#### Recommended Workflow Structure

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
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_XXXXX }}

jobs:
  check-affected:
    runs-on: ubuntu-latest
    outputs:
      affected: ${{ steps.check.outputs.affected }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Check if app is affected
        id: check
        run: |
          if npx nx affected --target=build --base=origin/main --head=HEAD | grep -q "{app-name}"; then
            echo "affected=true" >> $GITHUB_OUTPUT
          else
            echo "affected=false" >> $GITHUB_OUTPUT
          fi

  deploy:
    needs: check-affected
    if: needs.check-affected.outputs.affected == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build with Nx
        run: npx nx build {app-name} --configuration=production

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Create Vercel Configuration
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
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_XXXXX }}
```

### Step 4: Remove Conflicting Configurations

**Delete or Update:**
- `/vercel.json` (root) - Not needed for monorepo with separate projects
- `/apps/reward-chart/vercel.json` - Not needed, generated in workflow
- `/apps/family-calendar/vercel.json` - Not needed, generated in workflow

---

## Key Principles Explained

### Why Build with Nx, Not Vercel?

1. **Nx Caching** - Avoid rebuilding unchanged dependencies
2. **Consistent Builds** - Same build process locally and in CI
3. **Monorepo Awareness** - Nx understands project dependencies
4. **Better DX** - Developers can test exact deployment build locally

### Why Check `nx affected`?

Without checking affected projects:
- Every push triggers all deployments
- Wastes CI minutes
- Increases costs
- Slower feedback loops

With affected checks:
- Only deploy changed apps
- Faster deployments
- Cost efficient
- Better resource utilization

### Why Dynamic `vercel.json` Creation?

1. **Single Source of Truth** - Configuration lives in workflow
2. **No Stale Config** - Can't accidentally deploy old vercel.json
3. **Clear Intent** - Each deployment explicitly defines routing
4. **Version Control** - Changes tracked in workflow, not scattered files

### Why Deploy from `browser/` Subdirectory?

Angular's `@angular/build:application` outputs to `dist/apps/{app}/browser/`:
- `browser/` contains the actual SPA files
- Parent directory contains metadata (licenses, routes.json)
- Vercel needs the SPA root as deployment root
- Deploying from browser/ ensures correct path resolution

---

## Migration Plan

### Phase 1: Fix Reward Chart (Low Risk)
1. Update `deploy.yml` to match new template
2. Test deployment to existing Vercel project
3. Verify routing works correctly

### Phase 2: Fix Family Calendar (Medium Risk)
1. Update `deploy-family-calendar.yml` to match new template
2. Ensure Supabase environment variables are set in Vercel
3. Test deployment and database connectivity

### Phase 3: Optimization (Low Risk)
1. Add `nx affected` checks to both workflows
2. Add deployment notifications (Slack/Discord)
3. Add smoke tests post-deployment

### Phase 4: Documentation
1. Update individual app README files
2. Create troubleshooting guide
3. Document environment variables per app

---

## Testing Strategy

### Local Testing
```bash
# Test build locally
npx nx build reward-chart --configuration=production
npx nx build family-calendar --configuration=production

# Verify output structure
ls -la dist/apps/reward-chart/browser/
ls -la dist/apps/family-calendar/browser/

# Test locally with static server
cd dist/apps/family-calendar/browser
npx http-server -p 3000
```

### Pre-Deployment Checklist
- [ ] Build completes without errors
- [ ] Output directory contains index.html
- [ ] All assets (JS, CSS) present in output
- [ ] Environment variables configured in Vercel
- [ ] Vercel project linked correctly
- [ ] GitHub secrets exist and are valid

### Post-Deployment Validation
- [ ] App loads without 404 errors
- [ ] Client-side routing works (refresh on routes)
- [ ] Assets load correctly (no 404s)
- [ ] API calls work (if applicable)
- [ ] Environment-specific config applied

---

## Common Issues & Solutions

### Issue: 404 on All Routes
**Cause:** Missing or incorrect rewrite rules
**Solution:** Ensure `vercel.json` has correct rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Issue: 404 on Deployment Root
**Cause:** Deploying wrong directory (parent instead of browser/)
**Solution:** Always deploy from `dist/apps/{app}/browser/`

### Issue: Assets Loading from Wrong Path
**Cause:** Angular base href not set correctly
**Solution:** Verify `index.html` has `<base href="/">`

### Issue: Environment Variables Not Working
**Cause:** Angular bundles env at build time
**Solution:** Set env vars in GitHub Actions before build, or use runtime config

### Issue: All Apps Deploy on Every Push
**Cause:** Missing or incorrect `nx affected` check
**Solution:** Implement affected check job before deploy

---

## Performance Optimizations

### 1. Nx Cloud Integration
Enable Nx Cloud for distributed caching:
```json
// nx.json
{
  "nxCloudId": "your-cloud-id",
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"],
        "accessToken": "your-token"
      }
    }
  }
}
```

### 2. Vercel Edge Network
Configure edge caching for static assets:
```json
// vercel.json (in browser/ directory)
{
  "headers": [
    {
      "source": "/(.*).js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 3. Build Parallelization
Use Nx's parallel execution:
```bash
npx nx run-many --target=build --all --parallel=3
```

---

## Monitoring & Observability

### Deployment Metrics to Track
- Build duration
- Deploy frequency
- Success/failure rate
- Time to deploy
- Bundle size changes

### Recommended Tools
- **GitHub Actions Insights** - Built-in workflow analytics
- **Vercel Analytics** - Real User Monitoring (RUM)
- **Nx Cloud** - Build and task analytics
- **Lighthouse CI** - Performance monitoring

---

## Security Considerations

### Secrets Management
- Never commit secrets to repository
- Use GitHub Encrypted Secrets
- Rotate tokens regularly
- Limit token scope to minimum required

### Environment Separation
- Use different Vercel projects for staging/prod
- Separate GitHub environments
- Different secrets per environment
- Branch protection rules

### Dependency Security
```bash
# Regular security audits
npm audit
npx nx audit

# Update dependencies regularly
npx nx migrate latest
```

---

## Cost Optimization

### Vercel Pricing Considerations
- **Build Minutes** - Reduced by using GitHub Actions
- **Bandwidth** - Optimize bundle sizes
- **Serverless Function Invocations** - Not applicable for static SPAs
- **Edge Requests** - Included in all plans

### GitHub Actions Optimization
- Cache npm dependencies
- Use `nx affected` to minimize builds
- Cancel redundant workflow runs
- Use self-hosted runners for high volume

---

## Future Enhancements

### Short Term (1-3 months)
- [ ] Add staging environment deployments
- [ ] Implement preview deployments for PRs
- [ ] Add automated E2E tests in pipeline
- [ ] Set up deployment notifications

### Medium Term (3-6 months)
- [ ] Implement feature flag system
- [ ] Add performance budgets in CI
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics tracking

### Long Term (6+ months)
- [ ] Implement blue-green deployments
- [ ] Add canary deployment strategy
- [ ] Implement A/B testing framework
- [ ] Add automated rollback on errors

---

## Appendix A: Complete Workflow Examples

See actual workflow files:
- `.github/workflows/deploy-reward-chart.yml`
- `.github/workflows/deploy-family-calendar.yml`

## Appendix B: Troubleshooting Commands

```bash
# Check what's affected
npx nx affected:graph --base=origin/main

# Lint affected projects
npx nx affected --target=lint --base=origin/main

# Test affected projects
npx nx affected --target=test --base=origin/main

# Build specific app
npx nx build reward-chart --configuration=production --verbose

# Clear Nx cache
npx nx reset

# View build logs
npx nx build family-calendar --configuration=production 2>&1 | tee build.log
```

## Appendix C: References

- [Nx Documentation](https://nx.dev)
- [Vercel Monorepo Guide](https://vercel.com/docs/monorepos/nx)
- [Angular Build Configuration](https://angular.dev/tools/cli/build)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

## Document Maintenance

**Last Updated:** 2025-11-07
**Next Review:** 2025-12-07
**Owner:** Development Team
**Reviewed By:** Winston (Architect Agent)
