# Vercel Deployment Setup for Family Calendar

This guide will help you deploy the Family Calendar app to Vercel with automatic deployments from GitHub.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository access
- Vercel CLI installed: `npm install -g vercel`

## Step 1: Create a New Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`nmck91/playground`)
4. **Configure the project:**
   - **Framework Preset:** Other
   - **Root Directory:** Leave as `.` (root)
   - **Build Command:** `npx nx build family-calendar --configuration=production`
   - **Output Directory:** `dist/apps/family-calendar/browser`
   - **Install Command:** `npm ci`

5. **Environment Variables:**
   Add these if you want to use a different Supabase instance for production:
   - `SUPABASE_URL`: Your production Supabase URL
   - `SUPABASE_ANON_KEY`: Your production Supabase anon key

6. Click "Deploy"

## Step 2: Get Vercel Project IDs

After creating the project, you need to get the Project ID:

### Option A: From Vercel Dashboard
1. Go to your project settings
2. Navigate to "General"
3. Copy the "Project ID"

### Option B: Using Vercel CLI
```bash
# Link the project (run in your repo root)
vercel link

# This will create a .vercel directory with project info
cat .vercel/project.json
```

You should already have `VERCEL_ORG_ID` from your reward-chart setup.

## Step 3: Add GitHub Secrets

Go to your GitHub repository settings:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Add a new secret: `VERCEL_PROJECT_ID_CALENDAR`
   - Value: The Project ID from Step 2

**Existing secrets (should already be configured):**
- `VERCEL_TOKEN` - Your Vercel personal access token
- `VERCEL_ORG_ID` - Your Vercel organization/team ID
- `VERCEL_PROJECT_ID` - The reward-chart project ID

## Step 4: Test the Deployment

The GitHub Action will automatically trigger when you:
1. Push changes to the `main` branch that affect:
   - `apps/family-calendar/**`
   - `package.json`
   - `package-lock.json`

To manually trigger a deployment:
```bash
git commit --allow-empty -m "Trigger family calendar deployment"
git push
```

## Step 5: Verify the Deployment

1. Check the GitHub Actions tab in your repository
2. Look for the "Deploy Family Calendar to Vercel" workflow
3. Once complete, visit your Vercel dashboard to get the deployment URL

## Production Considerations

### Environment Variables
Update the production environment file with your production Supabase credentials:

**File:** `apps/family-calendar/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_PRODUCTION_SUPABASE_URL',
    anonKey: 'YOUR_PRODUCTION_SUPABASE_ANON_KEY'
  }
};
```

Or use Vercel environment variables and update the code to read from `process.env`.

### Custom Domain
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `calendar.yourfamily.com`)

### Database
Make sure your production Supabase database has:
- The events table created (run the SQL from `SUPABASE_SETUP.md`)
- Proper Row Level Security policies
- Appropriate indexes for performance

## Workflow Separation

The repository now has two separate deployment workflows:

1. **`deploy.yml`** - Deploys reward-chart
   - Triggers on changes to `apps/reward-chart/**`
   - Uses `VERCEL_PROJECT_ID`

2. **`deploy-family-calendar.yml`** - Deploys family-calendar
   - Triggers on changes to `apps/family-calendar/**`
   - Uses `VERCEL_PROJECT_ID_CALENDAR`

This ensures each app only deploys when its own code changes!

## Troubleshooting

### Build Fails
- Check the GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify the build works locally: `nx build family-calendar --configuration=production`

### Environment Variables Not Working
- Make sure they're set in Vercel project settings
- Redeploy after adding new environment variables

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is not paused
- Ensure Row Level Security policies allow access

## Monitoring

- **Vercel Dashboard:** Monitor deployments, errors, and analytics
- **Supabase Dashboard:** Monitor database usage and queries
- **GitHub Actions:** View build logs and deployment history

## Rollback

If a deployment has issues:
1. Go to Vercel dashboard
2. Navigate to "Deployments"
3. Find a previous working deployment
4. Click "⋯" → "Promote to Production"
