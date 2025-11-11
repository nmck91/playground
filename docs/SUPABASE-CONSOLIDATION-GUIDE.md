# Supabase Consolidation Guide

## Overview

This guide will help you consolidate all three Supabase projects into a single "playground" project.

## Current State

You currently have **3 separate Supabase projects**:

| App | Current Supabase URL | Tables |
|-----|---------------------|---------|
| **Family Calendar** | `dbygpegdyiutolzywels.supabase.co` | events |
| **Reward Chart** | `wesqfkkkmhftxmcpslgj.supabase.co` | families, family_members, habits, weeks, daily_completions, rewards, reward_redemptions, family_users |
| **Last Player Standing** | `dpfihpixctacyfibsgtw.supabase.co` | profiles, competitions, entries, matchweeks, fixtures, picks, team_usage |

## Migration Steps

### 1. Create or Access Your "playground" Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Either:
   - **Option A:** Create a new project called "playground"
   - **Option B:** Use an existing project you want to designate as "playground"
3. Wait for the project to be fully provisioned

### 2. Get Your New Project Credentials

1. In your "playground" project, go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
3. Keep these handy for the next steps

### 3. Run the Consolidated Schema

1. In your "playground" project, go to **SQL Editor**
2. Open the file: `docs/supabase-playground-consolidated-schema.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify all tables were created successfully

You should see 16 tables created:
- **Family Calendar:** events
- **Reward Chart:** families, family_members, habits, weeks, daily_completions, rewards, reward_redemptions, family_users
- **Last Player Standing:** profiles, competitions, entries, matchweeks, fixtures, picks, team_usage

### 4. Update Environment Files

You need to update the environment files for all three apps to point to your new "playground" project.

#### Family Calendar

**File:** `apps/family-calendar/src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
    anonKey: 'YOUR_PLAYGROUND_ANON_KEY'  // ← Update this
  }
};
```

**File:** `apps/family-calendar/src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
    anonKey: 'YOUR_PLAYGROUND_ANON_KEY'  // ← Update this
  }
};
```

#### Reward Chart

**File:** `apps/reward-chart/src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
    anonKey: 'YOUR_PLAYGROUND_ANON_KEY'  // ← Update this
  }
};
```

**File:** `apps/reward-chart/src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
    anonKey: 'YOUR_PLAYGROUND_ANON_KEY'  // ← Update this
  }
};
```

#### Last Player Standing

**File:** `apps/last-player-standing/src/environments/environment.development.ts`
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
  supabaseKey: 'YOUR_PLAYGROUND_ANON_KEY',      // ← Update this
  stripePublishableKey: 'pk_test_51KGqgQHv4xthOZIwyqdpwk3UYnCWa5is0aSrzjrCV7q5ysNga30ubMAzZuD3bFnHSUJ65x51hyqAa7QBMmfcLByh00px3u24t6',
  stripeSuccessUrl: 'http://localhost:4200/payment/success',
  stripeCancelUrl: 'http://localhost:4200/payment/cancel'
};
```

**File:** `apps/last-player-standing/src/environments/environment.ts`
```typescript
export const environment = {
  production: true,
  supabaseUrl: 'YOUR_PLAYGROUND_PROJECT_URL',  // ← Update this
  supabaseKey: 'YOUR_PLAYGROUND_ANON_KEY',      // ← Update this
  stripePublishableKey: 'pk_test_51KGqgQHv4xthOZIwyqdpwk3UYnCWa5is0aSrzjrCV7q5ysNga30ubMAzZuD3bFnHSUJ65x51hyqAa7QBMmfcLByh00px3u24t6',
  stripeSuccessUrl: 'https://last-player-standing.dadai.dev/payment/success',
  stripeCancelUrl: 'https://last-player-standing.dadai.dev/payment/cancel'
};
```

### 5. Update Vercel Environment Variables (If Deployed)

If your apps are deployed to Vercel, update the environment variables:

1. Go to your Vercel dashboard
2. For **each app** (family-calendar, reward-chart, last-player-standing):
   - Go to **Settings** > **Environment Variables**
   - Update `SUPABASE_URL` to your new playground URL
   - Update `SUPABASE_ANON_KEY` to your new playground anon key
   - Click **Save**
3. Trigger a new deployment for each app to pick up the changes

### 6. Test Each App Locally

Test each app to ensure database connections work:

```bash
# Test Family Calendar
npx nx serve family-calendar
# Visit http://localhost:4200 and test event creation

# Test Reward Chart
npx nx serve reward-chart
# Visit http://localhost:4300 and test star tracking

# Test Last Player Standing
npx nx serve last-player-standing
# Visit http://localhost:4200 and test registration/login
```

### 7. Optional: Migrate Existing Data

If you have existing data in your old projects that you want to preserve:

#### Export Data from Old Projects

1. Go to each old Supabase project
2. Navigate to **Table Editor**
3. For each table, click the **Export** button
4. Save as CSV

#### Import Data to New Project

1. Go to your new "playground" project
2. Navigate to **Table Editor**
3. Select the table you want to import into
4. Click **Insert** > **Import from CSV**
5. Upload your CSV file
6. Map columns and import

**Important:** Be careful with UUID foreign keys - you may need to adjust them if they reference records in other tables.

### 8. Clean Up (Optional)

Once you've verified everything works:

1. Consider pausing or deleting the old Supabase projects to avoid confusion
2. Update any documentation that references the old project URLs
3. Remove any old API keys from your local environment

## Verification Checklist

- [ ] New "playground" Supabase project created
- [ ] Consolidated schema SQL script executed successfully
- [ ] All 16 tables visible in Table Editor
- [ ] Family Calendar environment files updated
- [ ] Reward Chart environment files updated
- [ ] Last Player Standing environment files updated
- [ ] Family Calendar app tested locally
- [ ] Reward Chart app tested locally
- [ ] Last Player Standing app tested locally
- [ ] Vercel environment variables updated (if applicable)
- [ ] Apps redeployed to Vercel (if applicable)
- [ ] Existing data migrated (if needed)

## Benefits of Consolidation

✅ **Simplified Management** - One project to manage instead of three
✅ **Cost Efficiency** - Better utilization of Supabase free tier limits
✅ **Easier Development** - Switch between apps without changing database contexts
✅ **Cross-App Features** - Potential to share data or users across apps in the future
✅ **Single Authentication** - Can optionally share auth across all apps

## Troubleshooting

### "Table already exists" error
- Drop the existing tables first, or use a fresh Supabase project

### "Connection refused" error
- Verify your Supabase URL and anon key are correct
- Check that the Supabase project is fully provisioned

### RLS (Row Level Security) issues
- Check that policies are enabled correctly
- For testing, you can temporarily disable RLS on a table (not recommended for production)

### Data migration issues
- Ensure UUIDs are properly formatted
- Check foreign key constraints
- Verify data types match between old and new schemas

## Support

If you encounter issues:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review table structure in SQL Editor
- Check browser console for detailed error messages

---

**Once complete, you'll have all three apps using a single unified Supabase backend!** 🎉
