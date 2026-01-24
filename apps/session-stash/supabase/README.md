# Session Stash - Supabase Setup

## Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon/public key** from Settings → API

### 2. Run the Migration

**Option A: Via Supabase Dashboard (Recommended for first setup)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and click **Run**

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 3. Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication → Providers**
2. Ensure **Email** provider is enabled
3. (Optional) Configure email templates under **Authentication → Email Templates**

### 4. Update Your Environment

Create `.env.local` in the repo root:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Then generate the environment file:

```bash
node scripts/set-env.js
```

### 5. Generate TypeScript Types (Optional)

After running migrations, generate types for better type safety:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF \
  > apps/session-stash/src/app/models/database.types.ts
```

## Schema Overview

```
┌─────────────────┐       ┌─────────────────┐
│  system_tags    │       │   user_tags     │
│  (global)       │       │   (per user)    │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │    ┌─────────────┐      │
         └───►│   drills    │◄─────┘
              │  (per user) │
              └─────────────┘
```

### Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `session_stash_system_tags` | Predefined tags (10 seeded) | Read-only for all |
| `session_stash_user_tags` | Custom tags per user | User's own only |
| `session_stash_drills` | Saved drill URLs | User's own only |
| `session_stash_drill_system_tags` | Many-to-many junction | Via drill ownership |
| `session_stash_drill_user_tags` | Many-to-many junction | Via drill ownership |

### Row Level Security

All tables have RLS enabled. Users can only:
- **Read** system_tags (everyone)
- **CRUD** their own drills
- **CRUD** their own user_tags
- **CRUD** tag associations on their own drills

### Automatic user_id

Triggers automatically set `user_id` on insert for `drills` and `user_tags` tables, so you don't need to pass it explicitly.

## Resetting the Database

To start fresh (removes all data):

```sql
-- Run in SQL Editor
DROP TABLE IF EXISTS session_stash_drill_user_tags CASCADE;
DROP TABLE IF EXISTS session_stash_drill_system_tags CASCADE;
DROP TABLE IF EXISTS session_stash_user_tags CASCADE;
DROP TABLE IF EXISTS session_stash_drills CASCADE;
DROP TABLE IF EXISTS session_stash_system_tags CASCADE;
DROP FUNCTION IF EXISTS session_stash_set_user_id CASCADE;
```

Then re-run the migration.
