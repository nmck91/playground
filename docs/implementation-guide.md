# Family Reward Chart - Implementation Guide

## Overview

You have three paths forward:

### Option A: Quick Win - Enhance HTML Prototype
- Copy `docs/example/index.html` to your Angular app's public folder
- Add Supabase persistence directly to the HTML file
- **Pros:** Fast, keeps working UI, minimal changes
- **Cons:** Not using Angular framework

### Option B: Angular Migration - Rebuild in Angular
- Port the HTML prototype into Angular components
- Use Angular's reactive patterns with Supabase
- **Pros:** Modern architecture, better maintainability
- **Cons:** More work upfront

### Option C: Hybrid - HTML First, Angular Later
- Deploy HTML prototype with Supabase now
- Migrate to Angular incrementally
- **Pros:** Working app ASAP, smooth migration
- **Cons:** Temporary technical debt

## Recommended: Option C (Hybrid Approach)

Let's get you running quickly, then improve the architecture.

---

## Phase 1: Manual Supabase Setup (Do This First!)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Sign in/Sign up
3. Click "New Project"
4. Fill in:
   - Name: `family-reward-chart`
   - Database Password: (generate strong password - SAVE THIS!)
   - Region: Choose nearest
5. Wait 2-3 minutes for setup

### 1.2 Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `docs/supabase-schema.sql`
4. Paste and click "Run"
5. Verify success (should see "Success" message)

### 1.3 Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: (long string)

### 1.4 Create Your First User

1. Go to **Authentication** → **Users**
2. Click "Add User"
3. Enter email/password
4. Note the user ID (UUID)

### 1.5 Load Seed Data

1. Go back to **SQL Editor**
2. Open `docs/supabase-seed-data.sql`
3. **IMPORTANT:** Replace `'YOUR_AUTH_USER_ID'` with your actual user ID from step 1.4
4. Run the query
5. Verify data loaded:
   ```sql
   SELECT * FROM families;
   SELECT * FROM family_members;
   SELECT * FROM habits;
   ```

---

## Phase 2: Environment Setup

### 2.1 Create Environment File

Create `apps/reward-chart/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_PROJECT_URL',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

Create `apps/reward-chart/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_PROJECT_URL',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

### 2.2 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Phase 3: Deploy HTML Prototype with Supabase

### 3.1 Copy Working Prototype

```bash
cp docs/example/index.html apps/reward-chart/public/prototype.html
```

### 3.2 Add Supabase to Prototype

I'll create a Supabase-enabled version for you in the next step.

### 3.3 Test Locally

```bash
nx serve reward-chart
```

Navigate to: `http://localhost:4200/prototype.html`

---

## Phase 4: Angular Migration (Future)

Once the prototype works with Supabase:

1. Create Angular components matching prototype sections
2. Create Supabase service for data access
3. Implement reactive data flow
4. Add routing
5. Gradually replace prototype sections

---

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run schema SQL (`docs/supabase-schema.sql`)
- [ ] Create user account
- [ ] Run seed data SQL (update user ID first!)
- [ ] Copy Project URL and anon key
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create environment files with credentials
- [ ] Test connection
- [ ] Deploy!

---

## Next Steps

Run these commands when ready:

```bash
# Install Supabase
npm install @supabase/supabase-js

# Start dev server
nx serve reward-chart

# Build for production
nx build reward-chart --configuration=production
```

Let me know when you've completed the Supabase setup and I'll help you integrate it!
