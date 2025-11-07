# Supabase Setup Instructions

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in (or create an account)
2. Click "New Project"
3. Fill in your project details:
   - Name: `family-calendar` (or any name you prefer)
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for the project to be provisioned (1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Click on "API" in the sidebar
3. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Create the Database Tables

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency TEXT,
  recurrence_interval INTEGER,
  recurrence_end_date TIMESTAMPTZ,
  recurrence_days_of_week INTEGER[],
  recurrence_count INTEGER,
  color TEXT,
  location TEXT,
  created_by TEXT,
  attendees TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on start_date for faster queries
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- Later you can restrict this based on user authentication
CREATE POLICY "Enable all access for now" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Configure Your App

1. Create a file at `apps/family-calendar/src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     supabase: {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
     }
   };
   ```

2. Create a file at `apps/family-calendar/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     supabase: {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
     }
   };
   ```

3. Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual values from Step 2

## Step 5: Test the Connection

Once you've completed all steps, the app will automatically connect to Supabase instead of using localStorage!

## Optional: Add User Authentication

If you want to add user authentication later:

1. Enable Email/Password authentication in Supabase Dashboard > Authentication > Providers
2. Update the RLS policies to filter by user_id
3. Implement login/signup in your Angular app

## Database Schema Notes

- **UUID primary key**: Automatically generated for each event
- **TIMESTAMPTZ**: Stores dates with timezone information
- **Row Level Security**: Enabled but set to allow all for now
- **Indexes**: Added for better query performance on date and category
- **Trigger**: Automatically updates `updated_at` timestamp
