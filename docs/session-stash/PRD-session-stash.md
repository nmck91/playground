# Product Requirements Document (PRD)
## Session Stash

### 1. Project Overview

**Purpose**
Create a web app (with future native mobile support) to organize and retrieve soccer training drill videos (e.g., Facebook Reels) using a multi-tag system.

**Background**  
As a grassroots U10 boys soccer coach, I regularly discover training drills on Facebook Reels but lack an efficient way to categorize and retrieve them later. Current solutions (browser bookmarks, notes apps) do not support multi-tag filtering in a way that matches how I plan sessions.

**Target User**  
Primary: Myself (grassroots soccer coach managing a U10 team).  
Future: Other grassroots coaches who discover drills on social platforms and want a structured way to organize them.

---

### 2. Technical Stack

- **Framework:** Angular (latest stable version)
- **Native Mobile Runtime:** Capacitor (Phase 2+, standalone, no Ionic UI components)
- **Styling:** Tailwind CSS for design consistency and utility-based styling
- **Data Storage:** Supabase (PostgreSQL) for cloud persistence
- **Authentication:** Supabase Auth (simple email/password or magic link)
- **Hosting:** Vercel (Phase 1 web deployment)
- **Build Targets:**
  - Phase 1: Web (PWA hosted on Vercel)
  - Phase 2: iOS (via Capacitor)
  - Phase 3: Android (optional)
- **Tooling:** Angular CLI, optional Nx structure if desired

---

### 3. Core Features

#### 3.1 Add Drill

**User Story**  
As a coach, I want to quickly add a drill with its URL, title, tags, and notes so that I can easily find it later when planning training.

**Requirements**
- Input fields:
  - URL (string, required)
  - Title (string, required)
  - Tags (multi-select, required: at least one tag)
  - Notes (optional, multiline)
- Auto-generated:
  - `id` (UUID)
  - `created_at` (timestamp)
- Actions:
  - “Save” button to persist the drill
  - Basic validation with user feedback

**Validation Rules**
- URL is required and must be a non-empty string.
- Title is required.
- At least one tag must be selected.
- (Optional) If URL already exists, show a warning and allow user to either:
  - Cancel
  - Save anyway
  - Or jump to existing drill (future enhancement)

---

#### 3.2 Tag Management

**User Story**
As a coach, I want to create and manage tags so I can categorize drills in a way that matches how I think about training sessions.

**System Tags (Global, Read-Only)**
- Skills-based drill
- Passing drill
- Attacking drill
- Defending drill
- Match play drill
- Warm-up drill
- Conditioning drill
- Dribbling drill
- Shooting drill
- U10 appropriate

**Requirements**
- Each drill can have multiple tags (no upper limit).
- **System tags:**
  - Available to all users (global)
  - Cannot be renamed or deleted
  - Displayed first in tag lists (sorted by `sort_order`)
- **Custom tags:**
  - Created by individual users
  - Ability to:
    - View a list of all tags (system + custom)
    - Add custom tags (free-text)
    - Rename custom tags
    - Delete custom tags (with confirmation)
  - When a custom tag is deleted:
    - Remove it from all drills that reference it (cascade delete handles this)
    - Ensure no app crash or orphan references

---

#### 3.3 Browse & Search Drills

**User Story**  
As a coach, I want to browse and filter all my saved drills so I can quickly find drills that match the focus of a particular session.

**List View**
- Shows all saved drills in a scrollable list (or grid).
- Each drill item displays:
  - Title
  - Tags as chips/badges
  - Date created (e.g., "Created: Jan 24, 2026")
- Optional: Icon to indicate URL-based content (e.g., video icon).

**Filtering & Search**
- Filter by one or multiple tags:
  - Tag chips at top or a filter panel
  - Toggle between AND/OR logic:
    - **OR (default):** Show drills matching *any* selected tag
    - **AND:** Show drills matching *all* selected tags (e.g., "warm-up" AND "U10 appropriate")
  - Visual indicator showing current filter mode
- Text search:
  - Search on title and notes
- Clear all filters:
  - Single action to clear search text and tag filters

**Sorting**
- Sort options (dropdown or segmented control):
  - Date created (newest first – default).
  - Date created (oldest first).
  - Title (A–Z).

---

#### 3.4 Drill Detail View

**User Story**  
As a coach, I want to see full details of a drill and open the video quickly so I can review it or show it at training.

**Requirements**
- Displays:
  - Title
  - URL (tap to open)
  - Tags
  - Notes
  - Date created
- Actions:
  - “Open Video” button:
    - Opens the URL in the default browser or Facebook app.
  - “Edit” button:
    - Opens the same form as Add Drill but pre-populated.
  - “Delete” button:
    - Shows confirmation dialog before delete.

---

#### 3.5 Data Persistence

**User Story**
As a coach, I want my drills and tags to persist in the cloud so I can access my library from any device and never lose my data.

**Implementation**
- Use Supabase for cloud storage with PostgreSQL database.
- Simple, minimal schema design.
- Row-Level Security (RLS) to ensure users only access their own data.

**Database Schema**

```sql
-- Users table (managed by Supabase Auth)

-- System Tags table (global, shared by all users, read-only)
create table system_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

-- Seed system tags
insert into system_tags (name, sort_order) values
  ('Skills-based drill', 1),
  ('Passing drill', 2),
  ('Attacking drill', 3),
  ('Defending drill', 4),
  ('Match play drill', 5),
  ('Warm-up drill', 6),
  ('Conditioning drill', 7),
  ('Dribbling drill', 8),
  ('Shooting drill', 9),
  ('U10 appropriate', 10);

-- User Tags table (custom tags created by users)
create table user_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- Drills table
create table drills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  notes text,
  created_at timestamptz default now()
);

-- Drill-SystemTags junction (many-to-many)
create table drill_system_tags (
  drill_id uuid references drills(id) on delete cascade,
  system_tag_id uuid references system_tags(id) on delete cascade,
  primary key (drill_id, system_tag_id)
);

-- Drill-UserTags junction (many-to-many)
create table drill_user_tags (
  drill_id uuid references drills(id) on delete cascade,
  user_tag_id uuid references user_tags(id) on delete cascade,
  primary key (drill_id, user_tag_id)
);

-- Indexes for common queries
create index idx_drills_user_id on drills(user_id);
create index idx_user_tags_user_id on user_tags(user_id);
create index idx_drill_system_tags_drill on drill_system_tags(drill_id);
create index idx_drill_user_tags_drill on drill_user_tags(drill_id);
```

**Tag Design Notes**
- **System tags** are global and immutable - all users see the same predefined tags
- **User tags** are custom tags created by individual users
- Users cannot rename or delete system tags (only custom tags)
- This separation avoids data duplication and simplifies tag management

**TypeScript Interfaces**

```ts
interface Drill {
  id: string;
  user_id: string;
  url: string;
  title: string;
  notes?: string;
  created_at: string;
  system_tags?: SystemTag[];  // joined from drill_system_tags
  user_tags?: UserTag[];      // joined from drill_user_tags
}

interface SystemTag {
  id: string;
  name: string;
  sort_order: number;
}

interface UserTag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

// Unified type for UI display (both tag types rendered the same)
type Tag = (SystemTag | UserTag) & { is_system: boolean };
```

---

#### 3.6 Authentication

**User Story**
As a coach, I want to sign in securely so that my drill library is private and accessible only to me.

**Requirements**
- **Sign Up:**
  - Email + password registration
  - Email verification (Supabase default)
- **Sign In:**
  - Email + password
  - Optional: Magic link (passwordless) for convenience
- **Sign Out:**
  - Clear session and redirect to sign-in page
- **Password Reset:**
  - "Forgot password" link on sign-in page
  - Email-based reset flow (Supabase default)
- **Session Handling:**
  - Persist session across browser refreshes
  - Auto-redirect to sign-in when session expires
- **First-Time User:**
  - On account creation, seed user's tag list with predefined system tags
  - Redirect to drill list (empty state with prompt to add first drill)

**UI States**
- Unauthenticated: Show sign-in/sign-up pages only
- Authenticated: Show full app with user's data

---

#### 3.7 Quick Add via Share (Phase 1 - Web)

**User Story**
As a coach, I want to share a video URL directly to Session Stash from my mobile browser so I can save drills without manually copying and pasting.

**Requirements**
- Implement **Web Share Target API** for the PWA
- When a URL is shared to the app:
  - Open the Add Drill form with URL pre-filled
  - Auto-focus on Title field
  - User completes remaining fields (title, tags, notes) and saves
- Fallback: If share target isn't supported, standard manual entry remains available

**PWA Manifest Addition**
```json
{
  "share_target": {
    "action": "/add",
    "method": "GET",
    "params": {
      "url": "url",
      "title": "title",
      "text": "text"
    }
  }
}
```

**Future (Phase 2 - iOS)**
- Native Share Extension to receive URLs from any app (Facebook, Safari, etc.)
