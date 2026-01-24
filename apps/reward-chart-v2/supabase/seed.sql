-- Seed script for Family Reward Chart v2
-- Run this after migrations to populate initial data

-- Insert default family
INSERT INTO families (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'My Family')
ON CONFLICT (id) DO NOTHING;

-- Insert default family members (3 children, 2 parents)
INSERT INTO family_members (id, family_id, name, role, color, emoji, display_order)
VALUES
    ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Child 1', 'child', 'sky-blue', '🧒', 1),
    ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Child 2', 'child', 'light-green', '👧', 2),
    ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Child 3', 'child', 'plum', '👦', 3),
    ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Mum', 'parent', 'blue', '👩', 4),
    ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'Dad', 'parent', 'pink', '👨', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert default child habits for each child
INSERT INTO habits (family_id, member_id, name, category, display_order)
SELECT
    '00000000-0000-0000-0000-000000000001',
    fm.id,
    habit.name,
    habit.category,
    habit.display_order
FROM family_members fm
CROSS JOIN (
    VALUES
        ('Brushing teeth (morning)', 'hygiene', 1),
        ('Brushing teeth (night)', 'hygiene', 2),
        ('Tidying up after themselves', 'chores', 3),
        ('Homework/Reading', 'education', 4),
        ('Being kind to siblings', 'behavior', 5),
        ('Using good manners', 'behavior', 6)
) AS habit(name, category, display_order)
WHERE fm.role = 'child'
  AND fm.family_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Insert default parent habits for each parent
INSERT INTO habits (family_id, member_id, name, category, display_order)
SELECT
    '00000000-0000-0000-0000-000000000001',
    fm.id,
    habit.name,
    habit.category,
    habit.display_order
FROM family_members fm
CROSS JOIN (
    VALUES
        ('Playing with us when asked', 'engagement', 1),
        ('Not being grumpy in the morning', 'mood', 2),
        ('Reading bedtime story with voices', 'routine', 3),
        ('Making our favorite meal', 'food', 4),
        ('Taking us somewhere fun', 'activity', 5)
) AS habit(name, category, display_order)
WHERE fm.role = 'parent'
  AND fm.family_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Insert default child rewards
INSERT INTO rewards (family_id, name, description, required_stars, cost, category, display_order)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Choose dinner', 'Pick what we eat for dinner', 20, 0, 'child', 1),
    ('00000000-0000-0000-0000-000000000001', 'Park trip', 'Family trip to the park', 20, 0, 'child', 2),
    ('00000000-0000-0000-0000-000000000001', 'Bike ride', 'Family bike ride', 20, 0, 'child', 3),
    ('00000000-0000-0000-0000-000000000001', 'Game night', 'Family game night', 20, 0, 'child', 4),
    ('00000000-0000-0000-0000-000000000001', 'Bubble play', 'Bubble play session', 20, 0, 'child', 5),
    ('00000000-0000-0000-0000-000000000001', 'Nature walk', 'Nature walk adventure', 20, 0, 'child', 6),
    ('00000000-0000-0000-0000-000000000001', 'Blanket fort', 'Build a blanket fort', 20, 0, 'child', 7),
    ('00000000-0000-0000-0000-000000000001', 'Picnic (£3)', 'Family picnic', 22, 3, 'child', 8),
    ('00000000-0000-0000-0000-000000000001', 'Movie choice', 'Pick the movie to watch', 25, 0, 'child', 9),
    ('00000000-0000-0000-0000-000000000001', 'Extra 30 min bedtime', 'Stay up 30 minutes later', 25, 0, 'child', 10),
    ('00000000-0000-0000-0000-000000000001', 'Arts & crafts (£2)', 'Arts and crafts supplies', 25, 2, 'child', 11),
    ('00000000-0000-0000-0000-000000000001', 'Water balloons (£2)', 'Water balloon fun', 25, 2, 'child', 12),
    ('00000000-0000-0000-0000-000000000001', 'Baking session (£3)', 'Bake something yummy', 28, 3, 'child', 13),
    ('00000000-0000-0000-0000-000000000001', 'Library + ice cream (£4)', 'Library trip and ice cream', 28, 4, 'child', 14),
    ('00000000-0000-0000-0000-000000000001', 'Pound shop toy (£1)', 'Choose a toy from the shop', 30, 1, 'child', 15)
ON CONFLICT DO NOTHING;

-- Insert default parent rewards
INSERT INTO rewards (family_id, name, description, required_stars, cost, category, display_order)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Kids make you a card/drawing', 'Beautiful artwork from the kids', 15, 0, 'parent', 1),
    ('00000000-0000-0000-0000-000000000001', 'Kids tidy living room', 'Get some peace and quiet', 20, 0, 'parent', 2),
    ('00000000-0000-0000-0000-000000000001', 'Choose what to watch on TV', 'Pick the show or movie', 20, 0, 'parent', 3),
    ('00000000-0000-0000-0000-000000000001', 'Kids do your chores for the day', 'Well-deserved break', 25, 0, 'parent', 4),
    ('00000000-0000-0000-0000-000000000001', 'Breakfast in bed made by kids', 'Special breakfast treat', 28, 0, 'parent', 5),
    ('00000000-0000-0000-0000-000000000001', 'No nagging from kids for a day', 'Peaceful day without complaints', 30, 0, 'parent', 6),
    ('00000000-0000-0000-0000-000000000001', 'Sleep in on weekend', 'Extra sleep on Saturday or Sunday', 30, 0, 'parent', 7)
ON CONFLICT DO NOTHING;

-- Output confirmation
SELECT 'Seed data inserted successfully!' AS status;
