-- ============================================
-- REWARD CHART MVP - RLS FIX
-- ============================================
-- This adds public access policies for families and family_members
-- to support the MVP app which doesn't use authentication yet.
--
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add public read access to families table for MVP
CREATE POLICY "Public can view families (MVP)"
  ON families FOR SELECT
  USING (true);

-- Add public insert access to families table for MVP
CREATE POLICY "Public can create families (MVP)"
  ON families FOR INSERT
  WITH CHECK (true);

-- Add public read access to family_members table for MVP
CREATE POLICY "Public can view family members (MVP)"
  ON family_members FOR SELECT
  USING (true);

-- Add public insert access to family_members table for MVP
CREATE POLICY "Public can create family members (MVP)"
  ON family_members FOR INSERT
  WITH CHECK (true);

-- Add public update access to family_members table for MVP
CREATE POLICY "Public can update family members (MVP)"
  ON family_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMPLETED!
-- ============================================
-- The Reward Chart MVP can now access the database
-- without authentication.
--
-- IMPORTANT: When you add authentication later, you should
-- remove these public policies and rely on the auth-based
-- policies that are already defined in the schema.
-- ============================================
