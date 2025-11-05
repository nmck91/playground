# Vercel GitHub Actions Deployment Setup

This guide explains how to set up automatic deployments to Vercel using GitHub Actions.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. VERCEL_TOKEN
Your Vercel authentication token.

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token value

### 2. VERCEL_ORG_ID
Your Vercel organization ID.

**How to get it:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login` to authenticate
3. Run `vercel link` in your project directory
4. Check the `.vercel/project.json` file - the `orgId` field contains your organization ID

### 3. VERCEL_PROJECT_ID
Your Vercel project ID.

**How to get it:**
1. After running `vercel link` (see above)
2. Check the `.vercel/project.json` file - the `projectId` field contains your project ID

Alternatively, you can find both IDs in your Vercel project settings at:
`https://vercel.com/[your-team]/[your-project]/settings`

## Adding Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each of the three secrets listed above

## How It Works

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
- Trigger on pushes to the `main` branch
- Trigger on pull requests to the `main` branch
- Install the Vercel CLI
- Pull Vercel environment configuration
- Build your project
- Deploy to Vercel

### Production Deployments
- Pushes to `main` will deploy to production

### Preview Deployments
- Pull requests will create preview deployments

## Manual Deployment

You can also manually trigger a deployment by pushing to the main branch:

```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

## Verifying Deployment

After pushing your code:
1. Go to the **Actions** tab in your GitHub repository
2. You should see your workflow running
3. Once complete, check your Vercel dashboard for the deployment URL
