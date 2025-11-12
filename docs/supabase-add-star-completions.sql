-- ============================================
-- ADD REWARD CHART MVP TABLES TO PLAYGROUND
-- ============================================
-- Run this in your Supabase SQL Editor to add the missing tables
-- This fixes the "Could not find table 'star_completions'" error
--
-- Note: Reward Chart MVP uses a simplified schema (no auth, single family)
-- ============================================

-- Current week table (simple week tracking)
CREATE TABLE IF NOT EXISTS current_week (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE current_week IS '[REWARD CHART MVP] Simple current week tracking';

-- Star completions table (simplified version for MVP)
-- Note: This is a simplified tracking table used by the current Reward Chart UI
-- It uses habit_index and day_index instead of foreign keys for simplicity
CREATE TABLE IF NOT EXISTS star_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  habit_index INTEGER NOT NULL,
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6),
  is_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, habit_index, day_index)
);

CREATE INDEX IF NOT EXISTS idx_star_completions_member ON star_completions(member_id);

COMMENT ON TABLE star_completions IS '[REWARD CHART MVP] Simplified star tracking (habit_index 0-4, day_index 0-6)';

-- ============================================
-- ROW LEVEL SECURITY (DISABLED FOR MVP)
-- ============================================
-- MVP uses public access, no authentication required

ALTER TABLE current_week DISABLE ROW LEVEL SECURITY;
ALTER TABLE star_completions DISABLE ROW LEVEL SECURITY;

-- Grant public access
GRANT ALL ON current_week TO anon;
GRANT ALL ON star_completions TO anon;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Reset Week
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

-- Function: Get Star Count
CREATE OR REPLACE FUNCTION get_star_count(p_member_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM star_completions
  WHERE member_id = p_member_id
    AND is_completed = true;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert current week (gets the Monday of current week)
-- Only insert if table is empty
INSERT INTO current_week (week_start_date, week_end_date)
SELECT
  CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7),
  CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7) + 6
WHERE NOT EXISTS (SELECT 1 FROM current_week);

-- ============================================
-- COMPLETED!
-- ============================================
-- The Reward Chart MVP tables are now ready
-- Your Reward Chart app should now work correctly
--
-- Tables added:
-- - current_week
-- - star_completions
--
-- Functions added:
-- - reset_week()
-- - get_star_count(member_id)
-- ============================================
