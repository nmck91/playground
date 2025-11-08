# Development and Deployment

## Local Development Setup

1. **Prerequisites**:
   ```bash
   Node.js 20.x
   npm (comes with Node)
   ```

2. **Clone and Install**:
   ```bash
   git clone https://github.com/nmck91/playground.git
   cd playground
   npm install
   ```

3. **Environment Variables** (Optional - for Supabase):
   Create `.env` files in app directories:
   ```bash
   # apps/reward-chart/.env (or family-calendar)
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run Development Server**:
   ```bash
   # Reward Chart on port 4300
   npx nx serve reward-chart

   # Family Calendar on default port 4200
   npx nx serve family-calendar
   ```

5. **Known Setup Issues**:
   - If `nx` commands fail with "Could not find Nx modules", run `npm install` again
   - Playwright requires `npx playwright install --with-deps` for E2E tests

## Build and Deployment Process

**Local Production Build**:
```bash
# Build specific app
npx nx build family-calendar --configuration=production
npx nx build reward-chart --configuration=production

# Build all apps
npx nx run-many -t build --configuration=production

# Output locations
dist/apps/family-calendar/browser/
dist/apps/reward-chart/browser/
```

**CI/CD Pipeline** (`.github/workflows/ci.yml`):
1. Checkout code
2. Setup Node 20.x with npm cache
3. Run `npm ci`
4. Install Playwright browsers
5. Run `npx nx run-many -t lint test build e2e`
6. Run `npx nx fix-ci` if failures occur

**Vercel Deployment**:
- **Trigger**: Push to `main` branch or PR
- **Config**: `vercel.json` at workspace root
- **Build Command**: `npx nx build [app-name] --configuration=production`
- **Output Dir**: `dist/apps/[app-name]/browser`
- **Install**: `npm ci`
- **Projects**:
  - family-calendar → https://family-calendar-niall-mckinneys-projects.vercel.app
  - reward-chart → https://family-reward-chart-niall-mckinneys-projects.vercel.app

**Environment Variables in Vercel**:
- Set in Vercel dashboard per project
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` must be configured for production

---
