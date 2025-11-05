# Supabase Setup Guide for Family Reward Chart

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in:
   - **Name:** `family-reward-chart` (or your preferred name)
   - **Database Password:** (generate a strong password - save this!)
   - **Region:** Choose closest to your location
   - **Pricing Plan:** Free tier is perfect for family use
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Credentials

Once the project is created:

1. Go to **Settings** (gear icon) → **API**
2. Copy these values (you'll need them):
   - **Project URL:** `https://[your-project-id].supabase.co`
   - **anon/public key:** (the long key under "Project API keys")

Save these in a safe place - you'll add them to your app.

## Step 3: Create Database Tables

Go to **SQL Editor** in Supabase and run the schema SQL (see below).

## Step 4: Enable Row Level Security

The schema includes RLS policies to ensure each family's data is private.

---

## Next Steps After Setup

1. Copy your Project URL and API key
2. Run the database schema SQL
3. Update the prototype HTML with Supabase credentials
4. Test the connection!
