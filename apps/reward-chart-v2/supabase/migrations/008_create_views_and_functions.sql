-- Create views and functions for common queries

-- View: Current week completions with member info
CREATE OR REPLACE VIEW current_week_completions AS
SELECT
    hc.id,
    hc.member_id,
    fm.name AS member_name,
    fm.role AS member_role,
    fm.emoji AS member_emoji,
    hc.habit_id,
    h.name AS habit_name,
    h.category AS habit_category,
    hc.completion_date,
    hc.completed
FROM habit_completions hc
JOIN family_members fm ON hc.member_id = fm.id
JOIN habits h ON hc.habit_id = h.id
WHERE hc.completion_date >= date_trunc('week', CURRENT_DATE)
  AND hc.completion_date < date_trunc('week', CURRENT_DATE) + interval '7 days';

-- View: Member weekly stars (current week)
CREATE OR REPLACE VIEW member_weekly_stars AS
SELECT
    fm.id AS member_id,
    fm.name AS member_name,
    fm.role AS member_role,
    fm.emoji AS member_emoji,
    fm.color AS member_color,
    COUNT(CASE WHEN hc.completed THEN 1 END) AS weekly_stars,
    COUNT(*) AS total_possible
FROM family_members fm
LEFT JOIN habits h ON fm.id = h.member_id AND h.is_active = true
LEFT JOIN habit_completions hc ON h.id = hc.habit_id
    AND hc.completion_date >= date_trunc('week', CURRENT_DATE)
    AND hc.completion_date < date_trunc('week', CURRENT_DATE) + interval '7 days'
GROUP BY fm.id, fm.name, fm.role, fm.emoji, fm.color;

-- Function: Get week start date for a given date
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE)
RETURNS DATE AS $$
BEGIN
    -- Returns Monday of the week containing input_date
    RETURN date_trunc('week', input_date)::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get week end date for a given date
CREATE OR REPLACE FUNCTION get_week_end(input_date DATE)
RETURNS DATE AS $$
BEGIN
    -- Returns Sunday of the week containing input_date
    RETURN (date_trunc('week', input_date) + interval '6 days')::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate weekly stars for a member
CREATE OR REPLACE FUNCTION calculate_weekly_stars(
    p_member_id UUID,
    p_week_start DATE DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_week_start DATE;
    v_week_end DATE;
    v_stars INTEGER;
BEGIN
    -- Use current week if not specified
    IF p_week_start IS NULL THEN
        v_week_start := get_week_start(CURRENT_DATE);
    ELSE
        v_week_start := get_week_start(p_week_start);
    END IF;

    v_week_end := get_week_end(v_week_start);

    SELECT COUNT(*)
    INTO v_stars
    FROM habit_completions hc
    JOIN habits h ON hc.habit_id = h.id
    WHERE hc.member_id = p_member_id
      AND hc.completed = true
      AND hc.completion_date >= v_week_start
      AND hc.completion_date <= v_week_end;

    RETURN COALESCE(v_stars, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Update or create weekly summary
CREATE OR REPLACE FUNCTION update_weekly_summary(
    p_member_id UUID,
    p_week_start DATE
)
RETURNS void AS $$
DECLARE
    v_week_end DATE;
    v_completed INTEGER;
    v_possible INTEGER;
    v_rate DECIMAL(5,2);
BEGIN
    v_week_end := get_week_end(p_week_start);

    -- Count completed habits
    SELECT COUNT(*)
    INTO v_completed
    FROM habit_completions hc
    WHERE hc.member_id = p_member_id
      AND hc.completed = true
      AND hc.completion_date >= p_week_start
      AND hc.completion_date <= v_week_end;

    -- Count possible habits (active habits * 7 days)
    SELECT COUNT(*) * 7
    INTO v_possible
    FROM habits h
    WHERE h.member_id = p_member_id
      AND h.is_active = true;

    -- Calculate completion rate
    IF v_possible > 0 THEN
        v_rate := (v_completed::DECIMAL / v_possible) * 100;
    ELSE
        v_rate := 0;
    END IF;

    -- Insert or update summary
    INSERT INTO weekly_summaries (
        member_id, week_start, week_end,
        total_stars, habits_completed, habits_possible, completion_rate
    )
    VALUES (
        p_member_id, p_week_start, v_week_end,
        v_completed, v_completed, v_possible, v_rate
    )
    ON CONFLICT (member_id, week_start)
    DO UPDATE SET
        total_stars = EXCLUDED.total_stars,
        habits_completed = EXCLUDED.habits_completed,
        habits_possible = EXCLUDED.habits_possible,
        completion_rate = EXCLUDED.completion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
