-- Create reward_claims table
-- Tracks when family members claim rewards

CREATE TABLE IF NOT EXISTS reward_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
    stars_spent INTEGER NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reward_claims_member_id ON reward_claims(member_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_reward_id ON reward_claims(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_claimed_at ON reward_claims(claimed_at);
CREATE INDEX IF NOT EXISTS idx_reward_claims_fulfilled_at ON reward_claims(fulfilled_at);

-- Add RLS policies
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on reward_claims" ON reward_claims
    FOR ALL
    USING (true)
    WITH CHECK (true);
