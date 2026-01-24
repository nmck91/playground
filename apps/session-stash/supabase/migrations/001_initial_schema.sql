-- Session Stash Database Schema
-- Run this in your Supabase SQL Editor or as a migration
-- All tables prefixed with "session_stash_" for namespace isolation

-- ============================================
-- 1. SYSTEM TAGS (Global, read-only for all users)
-- ============================================
CREATE TABLE IF NOT EXISTS session_stash_system_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

-- Seed system tags
INSERT INTO session_stash_system_tags (name, sort_order) VALUES
  ('Skills-based drill', 1),
  ('Passing drill', 2),
  ('Attacking drill', 3),
  ('Defending drill', 4),
  ('Match play drill', 5),
  ('Warm-up drill', 6),
  ('Conditioning drill', 7),
  ('Dribbling drill', 8),
  ('Shooting drill', 9),
  ('U10 appropriate', 10)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. USER TAGS (Custom tags per user)
-- ============================================
CREATE TABLE IF NOT EXISTS session_stash_user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_stash_user_tags_user_id ON session_stash_user_tags(user_id);

-- ============================================
-- 3. DRILLS
-- ============================================
CREATE TABLE IF NOT EXISTS session_stash_drills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_stash_drills_user_id ON session_stash_drills(user_id);
CREATE INDEX IF NOT EXISTS idx_session_stash_drills_created_at ON session_stash_drills(created_at DESC);

-- ============================================
-- 4. DRILL-SYSTEM TAGS JUNCTION
-- ============================================
CREATE TABLE IF NOT EXISTS session_stash_drill_system_tags (
  drill_id UUID NOT NULL REFERENCES session_stash_drills(id) ON DELETE CASCADE,
  system_tag_id UUID NOT NULL REFERENCES session_stash_system_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (drill_id, system_tag_id)
);

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_session_stash_drill_system_tags_drill ON session_stash_drill_system_tags(drill_id);
CREATE INDEX IF NOT EXISTS idx_session_stash_drill_system_tags_tag ON session_stash_drill_system_tags(system_tag_id);

-- ============================================
-- 5. DRILL-USER TAGS JUNCTION
-- ============================================
CREATE TABLE IF NOT EXISTS session_stash_drill_user_tags (
  drill_id UUID NOT NULL REFERENCES session_stash_drills(id) ON DELETE CASCADE,
  user_tag_id UUID NOT NULL REFERENCES session_stash_user_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (drill_id, user_tag_id)
);

-- Index for faster joins
CREATE INDEX IF NOT EXISTS idx_session_stash_drill_user_tags_drill ON session_stash_drill_user_tags(drill_id);
CREATE INDEX IF NOT EXISTS idx_session_stash_drill_user_tags_tag ON session_stash_drill_user_tags(user_tag_id);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all user-owned tables
ALTER TABLE session_stash_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stash_user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stash_drill_system_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_stash_drill_user_tags ENABLE ROW LEVEL SECURITY;

-- System tags are readable by everyone (no RLS needed, but let's be explicit)
ALTER TABLE session_stash_system_tags ENABLE ROW LEVEL SECURITY;

-- SYSTEM TAGS: Everyone can read
CREATE POLICY "System tags are viewable by everyone"
  ON session_stash_system_tags FOR SELECT
  USING (true);

-- DRILLS: Users can only access their own drills
CREATE POLICY "Users can view their own drills"
  ON session_stash_drills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drills"
  ON session_stash_drills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drills"
  ON session_stash_drills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drills"
  ON session_stash_drills FOR DELETE
  USING (auth.uid() = user_id);

-- USER TAGS: Users can only access their own tags
CREATE POLICY "Users can view their own tags"
  ON session_stash_user_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
  ON session_stash_user_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON session_stash_user_tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON session_stash_user_tags FOR DELETE
  USING (auth.uid() = user_id);

-- DRILL-SYSTEM TAGS: Users can manage tags on their own drills
CREATE POLICY "Users can view drill-system-tag associations for their drills"
  ON session_stash_drill_system_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create drill-system-tag associations for their drills"
  ON session_stash_drill_system_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete drill-system-tag associations for their drills"
  ON session_stash_drill_system_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

-- DRILL-USER TAGS: Users can manage tags on their own drills
CREATE POLICY "Users can view drill-user-tag associations for their drills"
  ON session_stash_drill_user_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create drill-user-tag associations for their drills"
  ON session_stash_drill_user_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete drill-user-tag associations for their drills"
  ON session_stash_drill_user_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM session_stash_drills WHERE session_stash_drills.id = drill_id AND session_stash_drills.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. HELPER FUNCTIONS (Optional)
-- ============================================

-- Function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION session_stash_set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to drills
DROP TRIGGER IF EXISTS set_session_stash_drills_user_id ON session_stash_drills;
CREATE TRIGGER set_session_stash_drills_user_id
  BEFORE INSERT ON session_stash_drills
  FOR EACH ROW
  EXECUTE FUNCTION session_stash_set_user_id();

-- Apply trigger to user_tags
DROP TRIGGER IF EXISTS set_session_stash_user_tags_user_id ON session_stash_user_tags;
CREATE TRIGGER set_session_stash_user_tags_user_id
  BEFORE INSERT ON session_stash_user_tags
  FOR EACH ROW
  EXECUTE FUNCTION session_stash_set_user_id();
