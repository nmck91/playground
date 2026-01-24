# Supabase Setup for Family Reward Chart v2

This directory contains the database migrations and seed scripts for the Family Reward Chart v2 application.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Setup Instructions

### 1. Configure Environment Variables

Update the environment files in `src/environments/`:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  supabase: {
    url: 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: 'YOUR_ANON_KEY'
  }
};
```

### 2. Run Migrations

You can run the migrations in two ways:

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001, 002, 003, etc.)
4. Finally, run the `seed.sql` file to populate default data

### 3. Database Schema

The database consists of the following tables:

| Table | Description |
|-------|-------------|
| `families` | Root table grouping family members |
| `family_members` | Children and parents in a family |
| `habits` | Habit definitions per member |
| `habit_completions` | Daily completion tracking |
| `rewards` | Available rewards to claim |
| `reward_claims` | History of claimed rewards |
| `weekly_summaries` | Aggregated weekly stats |

### 4. Entity Relationship Diagram

```
families
    │
    ├── family_members (1:many)
    │       │
    │       ├── habits (1:many)
    │       │       │
    │       │       └── habit_completions (1:many)
    │       │
    │       ├── reward_claims (1:many)
    │       │
    │       └── weekly_summaries (1:many)
    │
    └── rewards (1:many)
            │
            └── reward_claims (1:many)
```

### 5. Views and Functions

The migrations include helpful views and functions:

- `current_week_completions` - View of all completions this week
- `member_weekly_stars` - View of stars earned per member this week
- `get_week_start(date)` - Get Monday of a given week
- `get_week_end(date)` - Get Sunday of a given week
- `calculate_weekly_stars(member_id, week_start)` - Calculate stars for a member
- `update_weekly_summary(member_id, week_start)` - Update weekly summary table

### 6. Row Level Security (RLS)

All tables have RLS enabled with permissive policies for now. In production, you should:

1. Set up authentication
2. Update policies to restrict access based on user/family membership

Example restrictive policy:

```sql
CREATE POLICY "Users can only access their family"
ON family_members
FOR ALL
USING (
  family_id IN (
    SELECT family_id FROM user_families WHERE user_id = auth.uid()
  )
);
```

## Troubleshooting

### Connection Issues

If the app shows "Supabase not configured":
- Check that environment variables are set correctly
- Verify the URL format includes `https://`
- Ensure the anon key is correct

### Migration Errors

If migrations fail:
- Run them in order (001, 002, 003...)
- Check for existing tables with conflicting names
- Review error messages in the SQL Editor

## Local Development

For local development without Supabase:
- Leave the environment variables empty
- The app will run in local-only mode using localStorage
- All features work, but data won't sync across devices
