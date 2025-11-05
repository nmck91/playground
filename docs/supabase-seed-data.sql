-- Seed Data for Family Reward Chart
-- Run this AFTER the schema is created

-- Note: Replace 'YOUR_AUTH_USER_ID' with your actual Supabase auth user ID
-- You can find this by:
-- 1. Creating an account in your app
-- 2. Running: SELECT * FROM auth.users; in SQL Editor
-- 3. Copy the 'id' value

-- ============================================
-- CREATE YOUR FAMILY
-- ============================================

-- Insert your family (this will generate a UUID)
INSERT INTO families (name)
VALUES ('McKinney Family')
RETURNING id;

-- Note the family ID returned above and use it below
-- For this example, we'll use a placeholder variable

-- Save the family ID
DO $$
DECLARE
  v_family_id UUID;
  v_user_id UUID := 'YOUR_AUTH_USER_ID'::UUID; -- REPLACE THIS!

  v_fiadh_id UUID;
  v_se_id UUID;
  v_niall_id UUID;
  v_mum_id UUID;
  v_dad_id UUID;

  v_week_id UUID;

  -- Habit IDs for kids
  v_kids_habit_1 UUID;
  v_kids_habit_2 UUID;
  v_kids_habit_3 UUID;
  v_kids_habit_4 UUID;
  v_kids_habit_5 UUID;

  -- Habit IDs for parents
  v_parent_habit_1 UUID;
  v_parent_habit_2 UUID;
  v_parent_habit_3 UUID;
  v_parent_habit_4 UUID;
  v_parent_habit_5 UUID;

BEGIN
  -- Get the family ID we just created
  SELECT id INTO v_family_id FROM families WHERE name = 'McKinney Family' LIMIT 1;

  -- Link your user to the family
  INSERT INTO family_users (family_id, user_id, role)
  VALUES (v_family_id, v_user_id, 'admin');

  -- ============================================
  -- CREATE FAMILY MEMBERS
  -- ============================================

  -- Children
  INSERT INTO family_members (family_id, name, member_type, color_code, display_order)
  VALUES (v_family_id, 'Fíadh', 'child', '#87CEEB', 1)
  RETURNING id INTO v_fiadh_id;

  INSERT INTO family_members (family_id, name, member_type, color_code, display_order)
  VALUES (v_family_id, 'Sé', 'child', '#90EE90', 2)
  RETURNING id INTO v_se_id;

  INSERT INTO family_members (family_id, name, member_type, color_code, display_order)
  VALUES (v_family_id, 'Niall Óg', 'child', '#DDA0DD', 3)
  RETURNING id INTO v_niall_id;

  -- Parents
  INSERT INTO family_members (family_id, name, member_type, color_code, display_order)
  VALUES (v_family_id, 'Mum', 'parent', '#FFE55C', 4)
  RETURNING id INTO v_mum_id;

  INSERT INTO family_members (family_id, name, member_type, color_code, display_order)
  VALUES (v_family_id, 'Dad', 'parent', '#FFE55C', 5)
  RETURNING id INTO v_dad_id;

  -- ============================================
  -- CREATE HABITS
  -- ============================================

  -- Kids' habits
  INSERT INTO habits (family_id, name, habit_type, display_order)
  VALUES
    (v_family_id, 'Brushing teeth (morning & night)', 'child', 1),
    (v_family_id, 'Tidying up after themselves', 'child', 2),
    (v_family_id, 'Homework/Reading', 'child', 3),
    (v_family_id, 'Being kind to siblings', 'child', 4),
    (v_family_id, 'Using good manners', 'child', 5);

  -- Parents' habits
  INSERT INTO habits (family_id, name, habit_type, display_order)
  VALUES
    (v_family_id, 'Playing with us when asked', 'parent', 1),
    (v_family_id, 'Not being grumpy in the morning', 'parent', 2),
    (v_family_id, 'Reading bedtime story with voices', 'parent', 3),
    (v_family_id, 'Making our favorite meal', 'parent', 4),
    (v_family_id, 'Taking us somewhere fun', 'parent', 5);

  -- ============================================
  -- CREATE CURRENT WEEK
  -- ============================================

  -- Get the most recent Monday
  INSERT INTO weeks (family_id, week_start_date, week_end_date, is_current)
  VALUES (
    v_family_id,
    CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7), -- Monday
    CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7) + 6, -- Sunday
    true
  )
  RETURNING id INTO v_week_id;

  -- ============================================
  -- CREATE KIDS' REWARDS
  -- ============================================

  INSERT INTO rewards (family_id, name, reward_type, stars_required, cost_text, display_order)
  VALUES
    -- 20 star rewards
    (v_family_id, 'Choose what''s for dinner', 'child', 20, 'FREE', 1),
    (v_family_id, 'Trip to the park with parent', 'child', 20, 'FREE', 2),
    (v_family_id, 'Bike ride adventure', 'child', 20, 'FREE', 3),
    (v_family_id, 'Game night - child picks game', 'child', 20, 'FREE', 4),
    (v_family_id, 'Bubble play session', 'child', 20, '£1', 5),
    (v_family_id, 'Nature walk & treasure hunt', 'child', 20, 'FREE', 6),
    (v_family_id, 'Build a blanket fort together', 'child', 20, 'FREE', 7),

    -- 22 star rewards
    (v_family_id, 'Picnic in garden/park', 'child', 22, '£3', 8),

    -- 25 star rewards
    (v_family_id, 'Choose family movie night film', 'child', 25, 'FREE', 9),
    (v_family_id, 'Extra 30 minutes stay up late', 'child', 25, 'FREE', 10),
    (v_family_id, 'Arts & crafts session', 'child', 25, '£2', 11),
    (v_family_id, 'Water balloon fight (summer)', 'child', 25, '£2', 12),

    -- 28 star rewards
    (v_family_id, 'Special baking session together', 'child', 28, '£3', 13),
    (v_family_id, 'Library trip + ice cream', 'child', 28, '£4', 14),

    -- 30 star rewards
    (v_family_id, 'Small toy from pound shop', 'child', 30, '£1', 15);

  -- ============================================
  -- CREATE PARENTS' REWARDS
  -- ============================================

  INSERT INTO rewards (family_id, name, reward_type, stars_required, cost_text, display_order)
  VALUES
    (v_family_id, 'Kids make you a card/drawing', 'parent', 15, 'FREE', 1),
    (v_family_id, 'Kids tidy the living room', 'parent', 20, 'FREE', 2),
    (v_family_id, 'Choose what to watch on TV', 'parent', 20, 'FREE', 3),
    (v_family_id, 'Kids do your chores for the day', 'parent', 25, 'FREE', 4),
    (v_family_id, 'Breakfast in bed made by kids', 'parent', 28, 'FREE', 5),
    (v_family_id, 'No nagging from kids for a day', 'parent', 30, 'FREE', 6),
    (v_family_id, 'Sleep in on weekend', 'parent', 30, 'FREE', 7);

END $$;

-- ============================================
-- VERIFY YOUR DATA
-- ============================================

-- Check families
SELECT * FROM families;

-- Check family members
SELECT * FROM family_members ORDER BY display_order;

-- Check habits
SELECT * FROM habits ORDER BY habit_type, display_order;

-- Check rewards
SELECT * FROM rewards ORDER BY reward_type, stars_required, display_order;

-- Check current week
SELECT * FROM weeks WHERE is_current = true;

-- ============================================
-- COMPLETED!
-- ============================================
-- Your family data is ready!
-- Next: Connect your app to Supabase
