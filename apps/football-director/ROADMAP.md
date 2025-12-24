# Football Director - Feature Roadmap

This document outlines potential features and improvements for the Football Director game, organized by priority and impact.

## Table of Contents
- [High Impact Features](#high-impact-features)
- [Medium Impact Features](#medium-impact-features)
- [Polish & UX Improvements](#polish--ux-improvements)
- [Advanced Features](#advanced-features)
- [Completed Features](#completed-features)

---

## High Impact Features

### 1. Fixtures Page
**Priority:** High
**Complexity:** Low-Medium
**Description:** A dedicated page to view all fixtures (past and upcoming)

**Features:**
- View upcoming matches in chronological order
- See past results with scores
- Click individual matches to see detailed stats
- Filter by competition type (league/friendlies)
- Form guide indicators (last 5 results: W/D/L)
- Highlight your team's fixtures
- Show match week numbers
- Indicate home/away fixtures clearly

**Technical Notes:**
- Create `/fixtures` route
- Query fixtures from game state
- Sort by week and filter by played status
- Link to detailed match view

**User Value:**
- Better planning for upcoming matches
- Review past performance easily
- Understand fixture congestion

---

### 2. League Statistics Pages
**Priority:** High
**Complexity:** Medium
**Description:** League-wide player and team statistics

**Features:**

#### Top Scorers
- Rank all players by goals scored
- Show team affiliation
- Filter by position
- Show goals per game ratio
- Click player to see full stats

#### Top Assisters
- Rank players by assists
- Show creativity metrics
- Compare with goals

#### Team Statistics
- Most goals scored
- Best defense (fewest goals conceded)
- Clean sheets leaderboard
- Discipline (cards)
- Home vs Away form

**Technical Notes:**
- Aggregate stats across all teams
- Create `/stats` route with tabs
- Cache calculations for performance
- Update after each match simulation

**User Value:**
- Identify transfer targets
- Competitive comparison
- Bragging rights for top performers

---

### 3. Player Contracts & Wages
**Priority:** High
**Complexity:** High
**Description:** Comprehensive contract management system

**Features:**

#### Contract Details
- Contract expiry dates (e.g., June 2026)
- Weekly wages per player
- Total wage bill calculation
- Years remaining indicator
- Contract status (active, expiring soon, expired)

#### Contract Negotiations
- Offer new contracts to players
- Wage negotiations (player demands vs budget)
- Contract length (1-5 years)
- Signing bonuses
- Release clauses

#### Financial Impact
- Weekly/monthly wage budget
- Automatic wage deductions from budget
- Warning when wage bill too high
- Free agents at season end (expired contracts)

#### Squad Management
- Filter squad by contract status
- See expiring contracts dashboard
- Automatic contract offers from AI teams
- Player demands (unhappy if underpaid)

**Technical Notes:**
- Add `contract` field to Player type:
  ```typescript
  contract: {
    weeklyWage: number;
    expiryYear: number;
    expiryMonth: number;
    yearsRemaining: number;
  }
  ```
- Deduct wages weekly during simulation
- Generate contract renewal events
- AI teams also manage contracts

**User Value:**
- Adds financial strategy layer
- Long-term squad planning
- Realistic football management
- Tough decisions (sell or lose for free)

---

### 4. Form Guide on Table
**Priority:** Medium-High
**Complexity:** Low
**Description:** Visual form indicator for each team in the league table

**Features:**
- Show last 5 results next to each team (W/W/D/L/W)
- Color-coded: Green (W), Yellow (D), Red (L)
- Hover to see opponents for each result
- Calculate form points (15 = 5 wins, 0 = 5 losses)
- Sort table by form as alternative view
- Show form trend (↑ improving, ↓ declining, → stable)

**Technical Notes:**
- Store last 5 results in team/league table data
- Update after each match week
- Add visual component to table rows
- Mobile-friendly display

**User Value:**
- Predict upcoming match difficulty
- Identify teams on a run
- Better tactical preparation

---

## Medium Impact Features

### 5. Match History Details
**Priority:** Medium
**Complexity:** Medium
**Description:** Detailed view of past matches

**Features:**

#### Match Report Page
- Full match stats (possession, shots, corners, fouls)
- Goal timeline with scorers and times
- Cards (yellow/red) with player names
- Team formations used
- Star ratings for players (1-10)
- Man of the match
- Match narrative/commentary

#### Match Events
- Key moments timeline:
  - Goals (⚽)
  - Cards (🟨🟥)
  - Substitutions (🔄)
  - Injuries (🚑)
- Minute-by-minute breakdown

#### Comparative Stats
- Shot accuracy %
- Pass completion %
- Tackles won
- Possession %
- Distance covered

**Technical Notes:**
- Enhance match simulation to generate detailed stats
- Store match details in results
- Create `/match/:id` route
- Generate realistic stats based on team skills

**User Value:**
- Understand why you won/lost
- Identify tactical issues
- More immersive experience

---

### 6. Youth Academy
**Priority:** Medium
**Complexity:** Medium
**Description:** Generate and develop young players

**Features:**

#### Academy System
- Generate 3-5 youth players annually
- Ages 16-18 years old
- Lower initial skill (30-50 range)
- Higher potential for development
- Low/free signing costs

#### Youth Development
- Improve faster than older players
- Special training focus for youth
- Promote to first team
- Sell for profit
- Youth leagues/matches

#### Academy Upgrades
- Invest in academy (board objective)
- Better facilities = better youth players
- Improved development rates
- Increased chance of wonderkids

**Technical Notes:**
- Generate players during off-season
- Add `potential` stat to players
- Development boost for young players (<21)
- Academy level affects generation quality

**User Value:**
- Long-term squad building
- Financial sustainability
- Exciting to develop talents
- Realistic career mode element

---

### 7. Player Morale System
**Priority:** Medium
**Complexity:** Medium-High
**Description:** Player happiness affecting performance

**Features:**

#### Morale Factors
**Positive:**
- Team winning matches
- Playing time (regular starter)
- Good contract/wages
- Meeting objectives
- Good team chemistry

**Negative:**
- Team losing
- Being benched consistently
- Low wages compared to skill
- Transfer listed
- Poor team form

#### Morale Effects
- **High morale (😊):** +5% to all stats
- **Normal morale (😐):** No effect
- **Low morale (☹️):** -5% to stats
- **Very low morale (😡):** -10% stats + transfer request

#### Morale Management
- See morale in squad view
- Individual player conversations
- Team talks before matches
- Bonuses for achievements
- Promise playing time

**Technical Notes:**
- Add `morale` field to Player (0-100)
- Update after matches and events
- Affect match simulation calculations
- Generate morale events

**User Value:**
- Deeper squad management
- Consequences for poor decisions
- More realistic player behavior
- Strategic man-management

---

### 8. Cup Competitions
**Priority:** Medium
**Complexity:** High
**Description:** Knockout tournament competitions

**Features:**

#### FA Cup Style Tournament
- All teams enter (20 teams)
- Single elimination knockout
- Random draw each round
- Extra time & penalties
- Runs alongside league season

#### League Cup
- Separate competition
- Earlier in season
- Same knockout format

#### Tournament Stages
- Round of 16 (if 20 teams, some get byes)
- Quarter-finals
- Semi-finals
- Final

#### Cup Features
- Trophy for winner
- Prize money per round
- Reputation boost
- Separate fixtures
- Different tactics/selection for cups

**Technical Notes:**
- Create tournament bracket system
- Random draw generator
- Extra time/penalty simulation
- Add to fixture list
- Track cup progress in game state

**User Value:**
- More trophies to win
- Alternative to league success
- Fixture variety
- David vs Goliath moments

---

## Polish & UX Improvements

### 9. Advanced Save Management
**Priority:** Medium
**Complexity:** Medium
**Description:** Better save game system

**Features:**

#### Multiple Saves
- Named save slots (e.g., "Arsenal Career", "Challenge Run")
- Save slot thumbnails (team logo, position, season)
- Save metadata (date created, last played, total seasons)
- Maximum 5-10 save slots

#### Auto-Save
- Auto-save every 2-5 weeks
- Configurable frequency
- Quick save option (keyboard shortcut)
- Auto-save indicator

#### Import/Export
- Export save to file (.json)
- Import saved games
- Share saves with others
- Backup saves

#### Cloud Sync (Optional)
- Save to cloud storage
- Sync across devices
- Requires authentication

**Technical Notes:**
- Extend SaveService with slot management
- Add slot selector UI
- Implement auto-save timer
- File download/upload for import/export

**User Value:**
- Multiple career modes
- Safe from data loss
- Share achievements
- Try different strategies

---

### 10. Match Day Atmosphere
**Priority:** Low-Medium
**Complexity:** Medium
**Description:** Enhanced match experience

**Features:**

#### Match Build-Up
- Pre-match team news
- Starting XI reveal
- Predicted lineups
- Head-to-head history
- Weather conditions
- Stadium atmosphere description

#### Enhanced Highlights
- More detailed commentary
- Key moments with context
- Player ratings during match
- Tactical changes shown
- Substitution timings
- Injury notifications

#### Post-Match
- Manager quotes
- Player interviews
- Opposition manager comments
- Match statistics comparison
- Man of the match award
- Attendance figures

#### Atmosphere Details
- Stadium capacity and attendance
- Crowd reaction descriptions
- Derby/rivalry indicators
- Big match atmosphere

**Technical Notes:**
- Generate dynamic commentary
- Expand match simulation detail
- Add atmosphere calculations
- Template-based narratives

**User Value:**
- More immersive
- Emotional connection
- Storytelling element
- Memorable moments

---

### 11. Mobile Optimization
**Priority:** Medium
**Complexity:** Low-Medium
**Description:** Enhanced mobile experience

**Current State:**
- Already has responsive design
- Works on mobile devices

**Improvements:**
- Touch gestures for table sorting
- Swipe navigation between pages
- Bottom navigation bar for mobile
- Larger touch targets
- Simplified mobile layouts
- Offline support (PWA)
- Mobile-first widget layouts
- Hamburger menu optimization

**Technical Notes:**
- Add touch event handlers
- Implement swipe gestures
- Create mobile-specific components
- Test on various screen sizes
- Add PWA manifest

**User Value:**
- Play anywhere
- Better mobile experience
- Quick sessions on the go

---

### 12. Dashboard Customization
**Priority:** Low
**Complexity:** Medium
**Description:** Personalized dashboard experience

**Features:**

#### Widgets
- Draggable widget system
- Choose which widgets to display:
  - League table (condensed/full)
  - Next fixtures
  - Top performers
  - News ticker
  - Financial summary
  - Board status
  - Form guide
  - Team stats

#### Layout Options
- Grid-based layout
- Resize widgets
- Save layout preferences
- Reset to default
- Multiple layout presets (Compact, Detailed, Stats-heavy)

#### Themes
- Color scheme options
- Dark mode
- Team colors theme
- Custom CSS

**Technical Notes:**
- Use react-grid-layout or similar
- Store preferences in localStorage
- Widget component library
- Theme system with CSS variables

**User Value:**
- Personalized experience
- See what matters to you
- Reduce clutter
- Modern UX

---

## Advanced Features

### 13. Advanced Tactics System
**Priority:** Low-Medium
**Complexity:** High
**Description:** Deeper tactical control

**Current State:**
- Formation selection (4-4-2, 4-3-3, etc.)
- Mentality (Defensive, Balanced, Attacking)

**Enhancements:**

#### Player Roles
- Position-specific roles (e.g., Wing Back vs Full Back)
- Role instructions (Get Forward, Stay Back)
- Creative Freedom levels
- Closing Down intensity

#### Team Instructions
- Tempo (Slow build-up vs Direct)
- Width (Narrow vs Wide)
- Pressing (High press vs Drop deep)
- Passing style (Short vs Long)

#### Set Pieces
- Corner takers
- Free kick specialists
- Penalty taker
- Set piece routines

#### Individual Instructions
- Player-specific instructions
- Mark specific opponent
- Man-marking assignments

**Technical Notes:**
- Extend Tactics type significantly
- Affect match simulation calculations
- Complex stat interactions
- AI tactical decisions

**User Value:**
- Tactical depth
- Counter opponent strategies
- Express playing style
- Competitive advantage

---

### 14. Scouting System
**Priority:** Low-Medium
**Complexity:** High
**Description:** Discover hidden talent

**Features:**

#### Scout Network
- Hire scouts (costs money)
- Scout quality affects discoveries
- Scout specific regions/leagues
- Scout by position or age

#### Scouting Reports
- Detailed player reports
- Skill assessments (1-5 stars)
- Potential rating
- Recommended price
- Playing style description
- Comparison to current players

#### Hidden Gems
- Not all players visible in transfer market
- Scouting unlocks them
- Better scouts find better players
- Random discoveries

#### Youth Scouting
- Scout youth players globally
- Sign wonderkids early
- Competitive bidding with AI

**Technical Notes:**
- Add scout staff type
- Generate scouting events
- Hidden player pool
- Gradual player revelation system

**User Value:**
- Exciting discoveries
- Competitive edge
- Realistic manager experience
- Strategic investment

---

### 15. Training System
**Priority:** Low
**Complexity:** High
**Description:** Improve players through training

**Features:**

#### Training Focus
- General training (balanced development)
- Position-specific training
- Attribute focus (Pace, Shooting, Passing, etc.)
- Tactical training
- Set piece practice

#### Training Schedule
- Weekly training plan
- Intensity settings
- Rest and recovery
- Pre-match preparation

#### Development Impact
- Focused training = faster skill growth
- Over-training = injury risk
- Under-training = fitness issues
- Age affects training response

#### Training Facilities
- Upgrade facilities (board investment)
- Better facilities = better development
- Affects youth players especially

**Technical Notes:**
- Add training system to game state
- Calculate development based on training
- Balance with injury risk
- Weekly training resolution

**User Value:**
- Control player development
- Tactical preparation
- Long-term planning
- Role-playing depth

---

### 16. Injuries & Suspensions
**Priority:** Medium
**Complexity:** Medium
**Description:** Enhanced squad management challenges

**Current State:**
- Injury system exists but basic

**Enhancements:**

#### Injury System
- Injury types (muscle, broken bone, concussion)
- Recovery times (1-12 weeks)
- Injury prone players
- Physio team affects recovery
- Return to fitness gradually
- Re-injury risk if rushed

#### Suspensions
- Yellow card accumulation (5 = 1 match ban)
- Red cards (1-3 match bans)
- Appeal system
- Disciplinary records

#### Squad Management
- Injury list view
- Expected return dates
- Treatment options
- Emergency medical staff

**Technical Notes:**
- Track cards in match simulation
- Suspension logic per competition
- Injury probability during matches
- Recovery countdown system

**User Value:**
- Squad rotation necessity
- Risk management
- Realistic challenges
- Tactical adaptation

---

### 17. Press Conferences
**Priority:** Low
**Complexity:** Medium
**Description:** Manager media interaction

**Features:**

#### Pre-Match Press Conference
- Questions about upcoming opponent
- Team news inquiries
- Response options affect morale/relationships
- Build rivalry narratives

#### Post-Match Press Conference
- React to result
- Praise/criticize players
- Comment on refereeing
- Media sound bites

#### Interview Responses
- Multiple choice answers
- Aggressive/Diplomatic/Humorous tones
- Affect board relationship
- Affect player morale
- Build reputation

#### Media Perception
- Media rating of manager
- Headline generation
- Public pressure
- Fan sentiment

**Technical Notes:**
- Question generation system
- Response consequence engine
- Dynamic headline creation
- Reputation tracking

**User Value:**
- Role-playing immersion
- Story creation
- Personality expression
- Consequences for behavior

---

### 18. Rivalry System
**Priority:** Low
**Complexity:** Medium
**Description:** Historical rivalries and grudge matches

**Features:**

#### Rivalries
- Pre-defined derby matches
- Develop rivalries through close competition
- Rivalry intensity levels
- Historical head-to-head records

#### Derby Matches
- Higher stakes (morale, board pressure)
- Increased media attention
- Special atmosphere
- Bonus rewards for winning

#### Manager Rivalries
- Develop personal rivalries
- Press conference mind games
- Tactical battles

**Technical Notes:**
- Define rival teams
- Track head-to-head stats
- Special match modifiers for derbies
- Rivalry intensity calculations

**User Value:**
- Emotional investment
- Memorable moments
- Added pressure
- Storytelling

---

### 19. Historical Records & Hall of Fame
**Priority:** Low
**Complexity:** Low-Medium
**Description:** Expanded record keeping

**Current State:**
- Club records (biggest win, etc.)
- Season records

**Enhancements:**

#### Club Hall of Fame
- Top 10 goal scorers (all-time)
- Top appearance makers
- Legendary managers
- Greatest teams (by achievements)

#### Manager Legacy
- Your career statistics
- Trophies won
- Win percentage
- Best season
- Hall of fame induction criteria

#### Season Comparisons
- Compare seasons side-by-side
- Points progression graphs
- Performance trends
- Best ever season

#### Player Legends
- Retiring players enter hall of fame
- Testimonial matches
- Statue unlocks (achievements)

**Technical Notes:**
- Extend records tracking
- Historical data storage
- Comparison algorithms
- Achievement system integration

**User Value:**
- Legacy building
- Long-term goals
- Historical context
- Pride in achievements

---

### 20. Transfer Deadline Day
**Priority:** Low-Medium
**Complexity:** Medium
**Description:** Exciting final transfer window hours

**Features:**

#### Deadline Day Event
- Last day of transfer window
- Countdown timer (hours)
- Panic buying/selling
- Loan deals
- Emergency signings

#### Market Frenzy
- AI teams more active
- Price fluctuations
- Gazump transfer attempts
- Late bids for your players

#### Deadline Day UI
- Live ticker of transfers
- Deal confirmations
- Failed transfers
- Loan deadline

**Technical Notes:**
- Special simulation mode for last day
- Increased AI transfer activity
- Time-based urgency system
- Transaction queue

**User Value:**
- Exciting culmination
- Last-minute drama
- Realistic experience
- Strategic gambling

---

## Completed Features

### ✅ Pre-Season System
- 52-week season structure
- Pre-season weeks 1-7
- Competitive weeks 8-45
- Off-season weeks 46-52
- Friendly matches (weeks 4-6)
- Transfer windows (weeks 1-8, 28-32)

### ✅ Condensed League Table
- Dashboard shows 5 teams centered on player position
- Smart positioning logic
- Full table page (/table)
- Visual indicators for European spots and relegation zone

### ✅ News System
- Match news
- Transfer news
- Milestone news
- Board news
- Development news
- News ticker widget

### ✅ Tactics System
- Formation selection
- Mentality settings
- Team instructions

### ✅ Player Development
- Age-based development
- Summer development reports
- Peak age curves
- Decline phase

### ✅ Trophy Cabinet
- Achievement tracking
- Season awards
- Trophy display

### ✅ Fixtures Page
- View all upcoming and past fixtures
- Filter by competition type (All/League/Friendlies)
- Form guide badges showing last 5 results (W/D/L)
- Color-coded results (Green=Win, Orange=Draw, Red=Loss)
- Highlight player's team fixtures
- Mobile-responsive layout
- Quick access from dashboard

### ✅ Form Guide on Table
- Last 5 match results displayed on league table
- Color-coded badges (Green=Win, Orange=Draw, Red=Loss)
- Hover tooltips for each result
- Visual form indicator for each team
- Legend explaining form colors
- Mobile-friendly display

### ✅ Match History Details
- Dedicated match report page (/match/[id])
- Full match score and result
- Match events timeline (goals, cards, penalties)
- Goal scorers for both teams
- Event details with minute markers
- Attendance information
- Clickable links from fixtures page
- Win/Draw/Loss indicator for player's team

### ✅ League Statistics Pages
- Dedicated stats page (/stats) with tabbed interface
- Top Scorers leaderboard (goals, goals per game)
- Top Assisters leaderboard (assists, assists per game)
- Team Statistics with three sections:
  - Best Attack (goals scored rankings)
  - Best Defense (goals conceded, clean sheets)
  - Discipline (yellow/red cards)
- Medal indicators for top 3 positions
- Player team highlighting throughout
- Position and team information for all players
- Mobile-responsive tables

### ✅ Player Contracts & Wages
- Contract system with expiry tracking
- Contract status badges (active/expiring-soon/expiring/expired)
- Weekly contract countdown during simulation
- Interactive contract negotiation modal with:
  - Wage slider based on player demands
  - Contract length selection (1-5 years)
  - Budget validation
  - Acceptance/rejection logic
- Free agent system when contracts expire
- AI teams automatically renew contracts (every 4 weeks)
- AI teams sign free agents during transfer windows
- Migration system for backward compatibility
- Financial impact tracking

### ✅ Youth Academy
- Interactive youth player selection system
- 6 youth prospects generated annually at season end (week 52)
- Select up to 3 prospects to add to first team
- Youth players aged 16-18 with skill range 3-7
- Lower wages for youth players (£500-1500/week)
- AI teams also receive youth players
- Automatic faster development for young players (ages 18-21 bracket)
- Squad size limit of 25 players
- News generation for youth player selections
- Color-coded position indicators in selection modal
- Skill level visual indicators

### ✅ Player Morale System
- Comprehensive morale calculation (0-100 scale)
- Four morale levels: High (75-100), Normal (40-74), Low (20-39), Very Low (0-19)
- Morale factors include:
  - Team performance (league position)
  - Recent form (last 5 matches)
  - Playing time (appearance percentage)
  - Wages vs skill fairness
  - Contract status
  - Injury/suspension status
  - Age-based expectations
- Stat modifiers applied to matches:
  - High Morale (😊): +5% to effective skill
  - Normal Morale (😐): No effect
  - Low Morale (☹️): -5% to effective skill
  - Very Low Morale (😡): -10% to effective skill
- Weekly morale updates during simulation
- Visual morale indicators in squad page
- Integration with match simulator for performance effects

### ✅ Injuries & Suspensions Enhanced
- Yellow card accumulation system (5 yellows = 1 match ban)
- Separate tracking for red card suspensions (3 match ban)
- Injury categories: muscle, bone, concussion
- Varied recovery times based on injury severity (1-8 weeks)
- Physio staff recovery bonuses
- Visual injury badges in squad page
- Suspension badges with reason display
- Yellow card warning indicators (4 cards = close to ban)
- Recovery countdown system
- Integration with weekly simulation

---

## Implementation Priority

### ✅ Phase 1 - Quick Wins (COMPLETED)
1. ✅ Form Guide on Table
2. ✅ Fixtures Page
3. ✅ Match History Details basics

### ✅ Phase 2 - Strategic Depth (COMPLETED)
1. ✅ Player Contracts & Wages
2. ✅ League Statistics Pages
3. ✅ Youth Academy

### ✅ Phase 3 - Immersion (COMPLETED)
1. ✅ Player Morale System
2. ✅ Match Day Atmosphere
3. ✅ Injuries & Suspensions enhanced

### 🔄 Phase 4 - Hybrid Approach (6 weeks - IN PROGRESS)
**Strategy**: Balance technical improvement with feature development
**Sprint Plan**: See `/docs/HYBRID-SPRINT-PLAN.md`

**Week 1-2**: Foundation + Quick Win
1. ⏳ Refactor useGameState into composable hooks (Story 001)
2. ⏳ Cup Competitions (Story 002)

**Week 3**: Testing Foundation
1. ⏳ Test suite for critical engine modules (Story 003)

**Week 4-5**: Advanced Tactics
1. ⏳ Advanced Tactics System (Story 004)

**Week 6**: Storage + Polish
1. ⏳ Save compression + mobile optimization (Story 005)

### Phase 5 - Polish & Advanced Features (Future)
1. Scouting System
2. Dashboard Customization
3. Advanced Save Management (cloud sync)
4. Training System
5. Press Conferences
6. All remaining features as desired

---

## Contributing

When implementing features from this roadmap:
1. Update this document to mark features as in-progress or completed
2. Move completed features to the "Completed Features" section
3. Add implementation notes for future reference
4. Consider breaking large features into smaller, deliverable chunks

---

*Last Updated: 2025-12-24 - Phase 3 COMPLETE ✅ | Phase 4 Hybrid Approach IN PROGRESS 🔄*
