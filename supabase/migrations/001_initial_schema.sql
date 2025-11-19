-- Family Reward Chart Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILIES TABLE
-- ============================================
CREATE TABLE families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FAMILY MEMBERS TABLE (Kids + Parents)
-- ============================================
CREATE TABLE family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('child', 'parent')),
  color_code TEXT, -- e.g., '#87CEEB' for sky blue
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_family_members_family ON family_members(family_id);

-- ============================================
-- HABITS TABLE
-- ============================================
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

-- ============================================
-- WEEKS TABLE (for historical tracking)
-- ============================================
CREATE TABLE weeks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Monday
  week_end_date DATE NOT NULL,   -- Sunday
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(family_id, week_start_date)
);

CREATE INDEX idx_weeks_family ON weeks(family_id);
CREATE INDEX idx_weeks_current ON weeks(family_id, is_current) WHERE is_current = true;

-- ============================================
-- DAILY COMPLETIONS TABLE (star tracking)
-- ============================================
CREATE TABLE daily_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  family_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL, -- specific day of the week
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(week_id, family_member_id, habit_id, completion_date)
);

CREATE INDEX idx_completions_week ON daily_completions(week_id);
CREATE INDEX idx_completions_member ON daily_completions(family_member_id);
CREATE INDEX idx_completions_date ON daily_completions(completion_date);

-- ============================================
-- REWARDS TABLE
-- ============================================
CREATE TABLE rewards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('child', 'parent')),
  stars_required INTEGER NOT NULL,
  cost_text TEXT, -- e.g., 'FREE', '£3', '£10'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rewards_family ON rewards(family_id);

-- ============================================
-- REWARD REDEMPTIONS TABLE (track when rewards are claimed)
-- ============================================
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

-- ============================================
-- USER AUTHENTICATION LINK TABLE
-- ============================================
CREATE TABLE family_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Supabase auth.users id
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(family_id, user_id)
);

CREATE INDEX idx_family_users_user ON family_users(user_id);
CREATE INDEX idx_family_users_family ON family_users(family_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_users ENABLE ROW LEVEL SECURITY;

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

-- Family users policies
CREATE POLICY "Users can view their own family memberships"
  ON family_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own family memberships"
  ON family_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get weekly star count for a family member
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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE families IS 'Top-level family/household entity';
COMMENT ON TABLE family_members IS 'Individual members (children and parents) within a family';
COMMENT ON TABLE habits IS 'Tasks/behaviors to track - separate for children vs parents';
COMMENT ON TABLE weeks IS 'Weekly tracking periods (Monday-Sunday)';
COMMENT ON TABLE daily_completions IS 'Daily completion records - the stars earned each day';
COMMENT ON TABLE rewards IS 'Reward catalog with star thresholds';
COMMENT ON TABLE reward_redemptions IS 'Log of when rewards are claimed/redeemed';
COMMENT ON TABLE family_users IS 'Links Supabase auth users to families';

-- ============================================
-- COMPLETED!
-- ============================================
-- Schema created successfully!
-- Next: Insert seed data for your family
