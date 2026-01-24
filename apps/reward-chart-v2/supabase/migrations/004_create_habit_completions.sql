-- Create habit_completions table
-- Tracks daily habit completion status for each member

CREATE TABLE IF NOT EXISTS habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one completion record per habit per day
    CONSTRAINT unique_habit_completion UNIQUE (habit_id, completion_date)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_habit_completions_member_id ON habit_completions(member_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed ON habit_completions(completed);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_habit_completions_member_date
    ON habit_completions(member_id, completion_date);

-- Add RLS policies
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on habit_completions" ON habit_completions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_habit_completions_updated_at
    BEFORE UPDATE ON habit_completions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
