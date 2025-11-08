# Data Models and APIs

## Data Models

**Reward Chart Models** (see `apps/reward-chart/src/app/models/`):
- **ChartData**: Complete app state structure
- **FamilyMember**: Child/parent with name, color, className
- **Reward**: Reward definition with name and star cost

**Calendar Models** (see `apps/family-calendar/src/app/models/event.model.ts`):
- **CalendarEvent**: Event with title, dates, category, recurrence
- **RecurrenceRule**: Frequency, interval, end date, days of week
- **EventCategory**: 'work' | 'personal' | 'family' | 'other'

## Database Schema

**Supabase Tables** (see `docs/supabase-schema.sql`):

**Reward Chart Schema:**
```sql
family_members (id, name, type, color, display_order)
habits (id, name, type, display_order)
stars (id, family_member_id, day, habit_id, week_start)
rewards (id, name, stars_required, type)
settings (id, key, value, updated_at)
```

**Calendar Schema:**
```sql
events (
  id, title, description,
  start_date, end_date, category,
  is_recurring, recurrence_frequency, recurrence_interval,
  recurrence_end_date, recurrence_days_of_week, recurrence_count,
  color, location, created_by, attendees
)
```

## API Specifications

**Supabase Client SDK** (via @supabase/supabase-js):
- Authentication: Currently not implemented, uses anonymous access
- Database: CRUD operations via Supabase client
- Real-time: Not currently utilized but available

**No REST API** - Direct database access via Supabase client SDK

---
