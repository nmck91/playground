-- Create weekly_summaries table
-- Stores aggregated weekly data for reporting and history

CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_stars INTEGER NOT NULL DEFAULT 0,
    habits_completed INTEGER NOT NULL DEFAULT 0,
    habits_possible INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one summary per member per week
    CONSTRAINT unique_weekly_summary UNIQUE (member_id, week_start)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_member_id ON weekly_summaries(member_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week_start ON weekly_summaries(week_start);

-- Add RLS policies
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on weekly_summaries" ON weekly_summaries
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_weekly_summaries_updated_at
    BEFORE UPDATE ON weekly_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
