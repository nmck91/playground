-- ============================================
-- PLAYGROUND CONSOLIDATED DATABASE SCHEMA
-- ============================================
-- This schema consolidates all three apps into a single Supabase project
--
-- Apps included:
-- 1. Family Calendar - Event management
-- 2. Reward Chart - Star tracking for kids
-- 3. Last Player Standing - Football competition
--
-- Run this in your Supabase SQL Editor for the "playground" project
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILY CALENDAR SCHEMA
-- ============================================
-- Event management system with recurring events support

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

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE events IS '[FAMILY CALENDAR] Calendar events with recurring event support';

-- ============================================
-- REWARD CHART SCHEMA
-- ============================================
-- Kids reward tracking system with star-based achievements

-- Families table
CREATE TABLE families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE families IS '[REWARD CHART] Top-level family/household entity';

-- Family members table (Kids + Parents)
CREATE TABLE family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('child', 'parent')),
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_family_members_family ON family_members(family_id);

COMMENT ON TABLE family_members IS '[REWARD CHART] Individual members (children and parents) within a family';

-- Current week table (for MVP single-family tracking)
CREATE TABLE current_week (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE current_week IS '[REWARD CHART MVP] Simple current week tracking for single family';

-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('child', 'parent')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_habits_family ON habits(family_id);

COMMENT ON TABLE habits IS '[REWARD CHART] Tasks/behaviors to track - separate for children vs parents';

-- Weeks table (for historical tracking)
CREATE TABLE weeks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, week_start_date)
);

CREATE INDEX idx_weeks_family ON weeks(family_id);
CREATE INDEX idx_weeks_current ON weeks(family_id, is_current) WHERE is_current = true;

COMMENT ON TABLE weeks IS '[REWARD CHART] Weekly tracking periods (Monday-Sunday)';

-- Daily completions table (star tracking)
CREATE TABLE daily_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_id, family_member_id, habit_id, completion_date)
);

CREATE INDEX idx_completions_week ON daily_completions(week_id);
CREATE INDEX idx_completions_member ON daily_completions(family_member_id);
CREATE INDEX idx_completions_date ON daily_completions(completion_date);

COMMENT ON TABLE daily_completions IS '[REWARD CHART] Daily completion records - the stars earned each day';

-- Star completions table (simplified version for MVP)
-- Note: This is a simplified tracking table used by the current Reward Chart UI
-- It uses habit_index and day_index instead of foreign keys for simplicity
CREATE TABLE star_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  habit_index INTEGER NOT NULL,
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6),
  is_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, habit_index, day_index)
);

CREATE INDEX idx_star_completions_member ON star_completions(member_id);

COMMENT ON TABLE star_completions IS '[REWARD CHART] Simplified star tracking used by current UI (habit_index 0-4, day_index 0-6)';

-- Rewards table
CREATE TABLE rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('child', 'parent')),
  stars_required INTEGER NOT NULL,
  cost_text TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rewards_family ON rewards(family_id);

COMMENT ON TABLE rewards IS '[REWARD CHART] Reward catalog with star thresholds';

-- Reward redemptions table
CREATE TABLE reward_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_redemptions_member ON reward_redemptions(family_member_id);
CREATE INDEX idx_redemptions_week ON reward_redemptions(week_id);

COMMENT ON TABLE reward_redemptions IS '[REWARD CHART] Log of when rewards are claimed/redeemed';

-- Family users table (auth link)
CREATE TABLE family_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_users_user ON family_users(user_id);
CREATE INDEX idx_family_users_family ON family_users(family_id);

COMMENT ON TABLE family_users IS '[REWARD CHART] Links Supabase auth users to families';

-- ============================================
-- LAST PLAYER STANDING SCHEMA
-- ============================================
-- Football competition app for school PTA fundraiser

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS '[LAST PLAYER STANDING] User profile information';

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

COMMENT ON TABLE competitions IS '[LAST PLAYER STANDING] Competition details (entry fee, prize amount)';

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

COMMENT ON TABLE entries IS '[LAST PLAYER STANDING] User entries with lives & payment status';

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

COMMENT ON TABLE matchweeks IS '[LAST PLAYER STANDING] Weekly competitions';

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

COMMENT ON TABLE fixtures IS '[LAST PLAYER STANDING] Football matches';

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

COMMENT ON TABLE picks IS '[LAST PLAYER STANDING] User team selections';

-- Team usage table
CREATE TABLE team_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  times_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE team_usage IS '[LAST PLAYER STANDING] Track which teams users have selected';

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- REWARD CHART RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_users ENABLE ROW LEVEL SECURITY;

-- MVP tables use public access (no auth required)
ALTER TABLE current_week DISABLE ROW LEVEL SECURITY;
ALTER TABLE star_completions DISABLE ROW LEVEL SECURITY;

-- Families policies
CREATE POLICY "Users can view their own families"
  ON families FOR SELECT
  USING (id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own families"
  ON families FOR UPDATE
  USING (id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can create families"
  ON families FOR INSERT
  WITH CHECK (true);

-- Family members policies
CREATE POLICY "Users can view members of their families"
  ON family_members FOR SELECT
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert members into their families"
  ON family_members FOR INSERT
  WITH CHECK (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update members in their families"
  ON family_members FOR UPDATE
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

-- Habits policies
CREATE POLICY "Users can view habits of their families"
  ON habits FOR SELECT
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert habits into their families"
  ON habits FOR INSERT
  WITH CHECK (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update habits in their families"
  ON habits FOR UPDATE
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

-- Weeks policies
CREATE POLICY "Users can view weeks of their families"
  ON weeks FOR SELECT
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert weeks into their families"
  ON weeks FOR INSERT
  WITH CHECK (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update weeks in their families"
  ON weeks FOR UPDATE
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

-- Daily completions policies
CREATE POLICY "Users can view completions in their families"
  ON daily_completions FOR SELECT
  USING (week_id IN (SELECT id FROM weeks WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert completions in their families"
  ON daily_completions FOR INSERT
  WITH CHECK (week_id IN (SELECT id FROM weeks WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can update completions in their families"
  ON daily_completions FOR UPDATE
  USING (week_id IN (SELECT id FROM weeks WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

-- Rewards policies
CREATE POLICY "Users can view rewards in their families"
  ON rewards FOR SELECT
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert rewards into their families"
  ON rewards FOR INSERT
  WITH CHECK (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can update rewards in their families"
  ON rewards FOR UPDATE
  USING (family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid()));

-- Reward redemptions policies
CREATE POLICY "Users can view redemptions in their families"
  ON reward_redemptions FOR SELECT
  USING (family_member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert redemptions in their families"
  ON reward_redemptions FOR INSERT
  WITH CHECK (family_member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

-- MVP tables use public access (no RLS policies needed)
GRANT ALL ON current_week TO anon;
GRANT ALL ON star_completions TO anon;

-- Family users policies
CREATE POLICY "Users can view their own family memberships"
  ON family_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own family memberships"
  ON family_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- LAST PLAYER STANDING RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Competitions policies
CREATE POLICY "Anyone can view competitions"
  ON competitions FOR SELECT
  USING (true);

-- Entries policies
CREATE POLICY "Users can view their own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Matchweeks policies
CREATE POLICY "Anyone can view matchweeks"
  ON matchweeks FOR SELECT
  USING (true);

-- Fixtures policies
CREATE POLICY "Anyone can view fixtures"
  ON fixtures FOR SELECT
  USING (true);

-- Picks policies
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

-- Team usage policies
CREATE POLICY "Users can view their team usage"
  ON team_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM entries
      WHERE entries.id = team_usage.entry_id
      AND entries.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on events (Family Calendar)
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for updated_at on Reward Chart tables
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_completions_updated_at BEFORE UPDATE ON daily_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers for updated_at on Last Player Standing profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get weekly star count for a family member (Reward Chart)
CREATE OR REPLACE FUNCTION get_weekly_star_count(
  p_week_id UUID,
  p_family_member_id UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM daily_completions
  WHERE week_id = p_week_id
    AND family_member_id = p_family_member_id
    AND is_completed = true;
$$ LANGUAGE SQL STABLE;

-- Function to get star count from MVP star_completions table
CREATE OR REPLACE FUNCTION get_star_count(p_member_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM star_completions
  WHERE member_id = p_member_id
    AND is_completed = true;
$$ LANGUAGE SQL STABLE;

-- Function to reset week (MVP)
CREATE OR REPLACE FUNCTION reset_week()
RETURNS void AS $$
BEGIN
  -- Clear all star completions
  DELETE FROM star_completions;

  -- Update current week to this week
  UPDATE current_week
  SET
    week_start_date = CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7),
    week_end_date = CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7) + 6;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMPLETED!
-- ============================================
-- Consolidated schema created successfully!
--
-- Next Steps:
-- 1. Run this script in your "playground" Supabase project SQL Editor
-- 2. Update environment files in all three apps to use the new project URL and keys
-- 3. Test each app to ensure database connections work
-- 4. Optional: Migrate existing data from old projects if needed
-- ============================================
