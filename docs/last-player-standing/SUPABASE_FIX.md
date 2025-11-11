# Supabase RLS Policy Fix - PROPER SOLUTION

## Problem
When registering a new user, you get: **"new row violates row-level security policy for table 'profiles'"**

## ✅ BEST SOLUTION: Use Database Trigger (Recommended)

Instead of creating profiles from the client, use a **database trigger** to automatically create a profile when a user signs up. This is more secure and reliable.

### Run this SQL in Supabase SQL Editor:

```sql
-- First, create a function that will create the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Update RLS Policies for Profiles

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON profiles;

-- Only need SELECT and UPDATE (INSERT is handled by trigger with SECURITY DEFINER)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## How It Works

1. User signs up via Supabase Auth
2. Supabase creates entry in `auth.users` table
3. **Trigger automatically fires** and creates profile in `profiles` table
4. The trigger runs with `SECURITY DEFINER` (bypasses RLS)
5. User metadata (full_name, phone) is automatically copied from registration

---

## ❌ Alternative (Less Secure - Not Recommended)

If you really want to keep client-side profile creation, you'd need this policy:

```sql
CREATE POLICY "Users can insert their own profile during registration"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

But the **trigger approach above is much better** because:
- More secure (no client-side insert)
- Automatic (no race conditions)
- Guaranteed to work (bypasses RLS with SECURITY DEFINER)
- Standard Supabase pattern

---

## Verification

After running the trigger SQL:

1. Delete any test users from **Authentication** > **Users**
2. Try registering a new user
3. Check **Table Editor** > **profiles** - you should see the profile automatically created!

🎉 **This is the proper Supabase way to handle user profiles!**
