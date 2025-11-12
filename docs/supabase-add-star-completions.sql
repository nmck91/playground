-- ============================================
-- ADD STAR_COMPLETIONS TABLE TO PLAYGROUND
-- ============================================
-- Run this in your Supabase SQL Editor to add the missing table
-- This fixes the "Could not find table 'star_completions'" error
-- ============================================

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

COMMENT ON TABLE star_completions IS '[REWARD CHART] Simplified star tracking used by current UI (habit_index 0-4, day_index 0-6)';

-- Enable RLS
ALTER TABLE star_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view star completions in their families"
  ON star_completions FOR SELECT
  USING (member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert star completions in their families"
  ON star_completions FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can update star completions in their families"
  ON star_completions FOR UPDATE
  USING (member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

CREATE POLICY "Users can delete star completions in their families"
  ON star_completions FOR DELETE
  USING (member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT family_id FROM family_users WHERE user_id = auth.uid())));

-- ============================================
-- COMPLETED!
-- ============================================
-- The star_completions table is now ready to use
-- Your Reward Chart app should now work correctly
-- ============================================
