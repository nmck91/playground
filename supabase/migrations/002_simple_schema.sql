-- Simplified Family Reward Chart Schema (No Auth - MVP)
-- Run this in Supabase SQL Editor

-- This schema is for a SINGLE FAMILY with no authentication
-- Perfect for quick MVP deployment!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FAMILY MEMBERS TABLE (Kids + Parents)
-- ============================================
CREATE TABLE family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  member_type TEXT NOT NULL CHECK (member_type IN ('child', 'parent')),
  color_code TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CURRENT WEEK TABLE
-- ============================================
CREATE TABLE current_week (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STAR COMPLETIONS TABLE
-- ============================================
CREATE TABLE star_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  habit_index INTEGER NOT NULL, -- 0-4 for the 5 habits
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6), -- 0=Mon, 6=Sun
  is_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(member_id, habit_index, day_index)
);

CREATE INDEX idx_completions_member ON star_completions(member_id);

-- ============================================
-- DISABLE RLS (No Authentication)
-- ============================================
-- Since this is single-family MVP, we'll disable RLS
-- Anyone with the URL can access/modify
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE current_week DISABLE ROW LEVEL SECURITY;
ALTER TABLE star_completions DISABLE ROW LEVEL SECURITY;

-- Make tables publicly accessible (be careful with this!)
GRANT ALL ON family_members TO anon;
GRANT ALL ON current_week TO anon;
GRANT ALL ON star_completions TO anon;

-- ============================================
-- INSERT FAMILY DATA
-- ============================================

-- Insert children
INSERT INTO family_members (name, member_type, color_code, display_order) VALUES
  ('Fíadh', 'child', '#87CEEB', 1),
  ('Sé', 'child', '#90EE90', 2),
  ('Niall Óg', 'child', '#DDA0DD', 3),
  ('Mum', 'parent', '#FFE55C', 4),
  ('Dad', 'parent', '#FFE55C', 5);

-- Insert current week (gets the Monday of current week)
INSERT INTO current_week (week_start_date, week_end_date)
VALUES (
  CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7),
  CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7) + 6
);

-- ============================================
-- HELPER FUNCTION: Reset Week
-- ============================================
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
-- HELPER FUNCTION: Get Star Count
-- ============================================
CREATE OR REPLACE FUNCTION get_star_count(p_member_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM star_completions
  WHERE member_id = p_member_id
    AND is_completed = true;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT
  'Family Members' as table_name,
  COUNT(*) as row_count
FROM family_members
UNION ALL
SELECT
  'Current Week' as table_name,
  COUNT(*) as row_count
FROM current_week;

-- ============================================
-- COMPLETED!
-- ============================================
-- Schema created successfully!
--
-- Your family members:
SELECT id, name, member_type, color_code
FROM family_members
ORDER BY display_order;
--
-- Current week:
SELECT * FROM current_week;
--
-- Ready to connect your app!
