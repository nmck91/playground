# Last Player Standing - Setup Instructions

## Application Overview

Your **Last Player Standing** Angular app has been successfully scaffolded! Here's what's been created:

### Structure Created

```
apps/last-player-standing/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/          (auth.guard.ts, admin.guard.ts)
│   │   │   ├── models/          (user, entry, matchweek, pick, payment models)
│   │   │   └── services/        (supabase, auth, payment, picks services)
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/       (login component)
│   │   │   │   └── register/    (register component)
│   │   │   ├── dashboard/       (dashboard component)
│   │   │   └── public/          (home component)
│   │   ├── shared/
│   │   │   └── components/      (header component)
│   │   ├── app-module.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   └── styles.css
└── tailwind.config.js
```

---

## Next Steps: Backend Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `last-player-standing`
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Click "Create new project" and wait for setup to complete

### 2. Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** > **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Update Environment Files

Update both environment files with your Supabase credentials:

**File:** `apps/last-player-standing/src/environments/environment.development.ts`
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',  // ← Paste here
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ← Paste here
  stripePublishableKey: 'pk_test_...',
  stripeSuccessUrl: 'http://localhost:4200/payment/success',
  stripeCancelUrl: 'http://localhost:4200/payment/cancel'
};
```

**File:** `apps/last-player-standing/src/environments/environment.ts` (for production)
```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',  // ← Same as above
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ← Same as above
  stripePublishableKey: 'pk_live_...',  // ← Use live key for production
  stripeSuccessUrl: 'https://last-player-standing.dadai.dev/payment/success',
  stripeCancelUrl: 'https://last-player-standing.dadai.dev/payment/cancel'
};
```

### 4. Create Database Tables

Go to your Supabase project **SQL Editor** and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Competitions table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entry_fee DECIMAL(10, 2) NOT NULL,
  prize_amount DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('open', 'closed', 'completed')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions"
  ON competitions FOR SELECT
  USING (true);

-- Entries table
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lives_remaining INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Matchweeks table
CREATE TABLE matchweeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'open', 'closed', 'completed')) DEFAULT 'upcoming'
);

ALTER TABLE matchweeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matchweeks"
  ON matchweeks FOR SELECT
  USING (true);

-- Fixtures table
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matchweek_id UUID REFERENCES matchweeks(id) ON DELETE CASCADE,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  kickoff_time TIMESTAMPTZ NOT NULL,
  result TEXT CHECK (result IN ('home', 'away', 'draw')),
  winning_team TEXT
);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fixtures"
  ON fixtures FOR SELECT
  USING (true);

-- Picks table
CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  matchweek_id UUID REFERENCES matchweeks(id) ON DELETE CASCADE,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  selected_team TEXT NOT NULL,
  is_winning_pick BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, matchweek_id)
);

ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own picks"
  ON picks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = picks.entry_id
      AND entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own picks"
  ON picks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = picks.entry_id
      AND entries.user_id = auth.uid()
    )
  );

-- Team usage table
CREATE TABLE team_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team usage"
  ON team_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = team_usage.entry_id
      AND entries.user_id = auth.uid()
    )
  );
```

### 5. Configure Supabase Authentication

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize confirmation and password reset emails

---

## Stripe Setup (for Payments)

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification

### 2. Get Stripe Keys

1. Go to **Developers** > **API keys**
2. Copy both:
   - **Publishable key** (starts with `pk_test_...` for test mode)
   - **Secret key** (starts with `sk_test_...`) - Keep this secure!

### 3. Update Environment Files

Add your Stripe publishable key to the environment files:

```typescript
stripePublishableKey: 'pk_test_YOUR_KEY_HERE',
```

---

## Running the App

### Start Development Server

```bash
nx serve last-player-standing
```

The app will be available at: `http://localhost:4200`

### Available Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (requires authentication)

---

## What's Working Now

✅ **Authentication Flow**
- User registration with Supabase
- Email/password login
- Magic link login
- Protected routes with auth guard

✅ **UI Components**
- Responsive header with navigation
- Beautiful landing page
- Login and registration forms
- Dashboard skeleton

✅ **Services Ready**
- Supabase integration
- Auth service with user management
- Payment service (Stripe integration)
- Picks service for managing user selections

---

## What to Build Next

The foundation is complete! Here's what you can build next:

### Phase 1: Core Features
1. **Make Picks Component** - Allow users to select teams for matchweeks
2. **Leaderboard Component** - Show all active players and their lives
3. **Rules Page** - Explain the competition rules

### Phase 2: Payment Integration
1. **Payment Checkout Flow** - Integrate Stripe for entry fees
2. **Payment Verification** - Handle successful/failed payments

### Phase 3: Admin Features
1. **Admin Dashboard** - Manage competitions
2. **Matchweek Management** - Create and manage matchweeks
3. **Fixture Management** - Add fixtures and update results
4. **Result Processing** - Auto-deduct lives based on results

### Phase 4: Advanced Features
1. **Email Notifications** - Remind users to make picks
2. **Push Notifications** - Real-time updates
3. **Analytics Dashboard** - Track competition stats
4. **Mobile App** - Consider React Native/Ionic

---

## Testing the App

### Test User Registration

1. Navigate to `/register`
2. Fill in the form
3. Check your email for verification link (Supabase will send it)
4. Verify your account
5. Login at `/login`

### Test Authentication Guard

1. Try to access `/dashboard` without logging in
2. You should be redirected to `/login`
3. After logging in, you'll be redirected to `/dashboard`

---

## Deployment

### Deploy to Vercel

```bash
# Build the app
nx build last-player-standing --prod

# Deploy with Vercel CLI
npx vercel --prod
```

**Output Directory:** `dist/apps/last-player-standing`

**Environment Variables to Set in Vercel:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_PUBLISHABLE_KEY`

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **PrimeNG Docs:** https://primeng.org
- **Stripe Docs:** https://stripe.com/docs
- **Nx Docs:** https://nx.dev

---

**Your app is ready to go! Start the dev server and begin building features.** 🚀
