# Project Brief: Math Quest - Sibling Math Adventure Game

## Executive Summary

**Math Quest** is a web-based educational math game designed for siblings ages 6-8, combining arcade-style speed challenges, adventure progression systems, and healthy sibling competition. The game features adaptive difficulty, effort-based rewards, and pet companions to keep children engaged while learning fundamental math skills. Built as an Angular app in an Nx monorepo with future mobile expansion planned, Math Quest differentiates itself by being the first math game designed specifically for mixed-age sibling play.

## Problem Statement

### Current State & Pain Points
- Parents struggle to find educational games that work well for multiple children of different ages
- Existing math games (Prodigy, DragonBox, Khan Academy Kids) lack meaningful sibling/multiplayer features
- Fixed difficulty progressions frustrate younger children while boring older ones
- Many educational games rely on extrinsic rewards tied to accuracy, which can demotivate struggling learners
- Screen time battles: parents want productive game time, kids want fun

### Impact
- Siblings end up playing separate games, missing bonding opportunities
- Educational engagement drops when children feel compared unfairly to siblings
- Parents resort to limiting screen time rather than finding quality educational content

### Why Existing Solutions Fall Short
| Competitor | Gap |
|------------|-----|
| Prodigy | Weak sibling features, aggressive freemium model |
| DragonBox | No multiplayer, limited age range |
| Khan Academy Kids | No competitive/cooperative play, skews younger |
| AdaptedMind | No sibling features, subscription fatigue |

### Urgency
- Growing market for family-oriented educational content
- Post-pandemic parents actively seeking quality screen time solutions
- First-mover advantage in sibling-focused math games

## Proposed Solution

### Theme: World Code Crackers

Kids are **junior explorers in a global adventure agency**, traveling to famous landmarks around the world where they must solve math-based codes and puzzles to unlock secrets, find treasures, and complete missions.

**Core Elements:**
- **Setting**: Globe-trotting adventure - pyramids, rainforests, ancient temples, modern cities
- **Fantasy**: Explorer + Code Cracker hybrid - "You're the only one who can solve this ancient puzzle!"
- **Visual Style**: Bright, colorful landmarks (cartoonish), comic-book action panels, map-based hub
- **Pet Companions**: Regional animal sidekicks that unlock with progress:
  - Dog (starter - loyal helper)
  - Cheetah (African savanna missions)
  - Eagle (mountain/sky missions)
  - Shark (ocean/island missions)
- **Math Integration**: Crack number codes to open ancient doors, calculate to navigate mazes, speed challenges as races against traps
- **Progression**: Fill explorer passport with stamps, collect artifacts, rise from Junior Explorer to Master Code Cracker

### Core Concept
A colorful, cartoonish math adventure where children:
- Complete adaptive math challenges to earn progress
- Collect and customize characters and pet companions
- Compete on personal bests while cooperating on family goals
- Progress at their own pace with age-appropriate difficulty

### Key Differentiators
1. **Sibling-First Design** - Built from ground up for 2-3 players of different ages
2. **Decoupled Progression** - Each child advances independently, no unfair comparisons
3. **Effort-Based Rewards** - Time/attempts matter, not just accuracy
4. **Adaptive Difficulty Engine** - Real-time adjustment per child's performance
5. **Cooperative + Competitive** - Family goals alongside individual challenges

### Why This Will Succeed
- Addresses a clear market gap (no competitors do sibling play well)
- Grounded in research on child motivation (Self-Determination Theory, Flow, Growth Mindset)
- Leverages existing Angular/Nx expertise for rapid development
- Clear path to mobile expansion

## Target Users

### Primary User Segment: Children (Ages 6-8)

**Profile:**
- Elementary school students (1st-3rd grade)
- Varied math skill levels within age range
- Digital natives comfortable with touch/mouse interfaces
- Short attention spans (10-15 minute sessions)

**Behaviors:**
- Play games on tablets, phones, and computers
- Motivated by collection, customization, and progression
- Enjoy friendly competition with siblings
- Respond well to immediate feedback and rewards

**Needs & Pain Points:**
- Age-appropriate challenges (not too easy, not too hard)
- Fun that doesn't feel like homework
- Fair play with siblings of different ages
- Sense of accomplishment and mastery

**Goals:**
- Have fun playing games
- Feel proud of progress and achievements
- Compete/cooperate with siblings
- Earn cool customizations and pets

### Secondary User Segment: Parents

**Profile:**
- Parents of multiple children ages 6-8
- Value education but also want happy kids
- Limited time to research and evaluate apps
- Willing to pay for quality, ad-free experiences

**Needs & Pain Points:**
- Confidence that game time is productive
- Visibility into children's progress
- No in-app purchase harassment from kids
- Works for all their children, not just one

**Goals:**
- Reduce screen time guilt
- Support children's math development
- Encourage positive sibling interactions
- Easy setup and monitoring

## Goals & Success Metrics

### Business Objectives
- Launch MVP within 3 months of development start
- Achieve 100 active family accounts within first month of launch
- Maintain 70%+ weekly retention rate for children
- Generate positive parent feedback and word-of-mouth

### User Success Metrics
- Average session duration: 10-15 minutes
- Sessions per week per child: 3+
- Math problem completion rate: 80%+
- Customization/collection engagement: 90% of users unlock items

### Key Performance Indicators (KPIs)
- **Daily Active Users (DAU)**: Target 50+ within first month
- **Session Completion Rate**: % of sessions lasting full intended duration
- **Progression Rate**: Average levels/achievements per week per child
- **Sibling Co-play Rate**: % of sessions where multiple siblings active same day
- **Parent Dashboard Visits**: Weekly engagement with progress tracking

## MVP Scope

### Core Features (Must Have)

- **Adaptive Difficulty Engine**: Real-time difficulty adjustment based on performance (accuracy, speed, streaks)
- **Arcade Math Challenges**: Timed math problems with speed-based scoring (addition, subtraction, multiplication basics)
- **Explorer Character**: Customizable junior explorer avatar
- **World Map Hub**: 4-6 initial locations (landmarks) with progressive difficulty
- **Regional Pet Companions**: Dog (starter), plus Cheetah/Eagle/Shark unlockable through progress
- **Passport Progression**: Collect stamps and artifacts as visual progress markers
- **Basic Customization**: Unlockable accessories earned through effort
- **Separate Child Profiles**: Individual progress tracking, no cross-comparison
- **Immediate Feedback System**: Satisfying visual/audio feedback for correct answers and attempts
- **Effort-Based Progression**: XP/unlocks based on time played and attempts, not just accuracy
- **Math Content**: Addition, subtraction, and introduction to multiplication (selectable)
- **Session Length Management**: Natural stopping points at 10-15 minutes

### Out of Scope for MVP
- Story/narrative mode
- Cooperative family challenges
- Parent dashboard with detailed analytics
- Multiple themed environments/worlds
- Achievement badge system
- Additional mini-game varieties
- Mobile apps (iOS/Android)
- User authentication/accounts (use local storage initially)
- Leaderboards (even within family)

### MVP Success Criteria
MVP is successful when:
1. All three children (ages 6, 7, 8) can play independently with appropriate difficulty
2. Each child can progress and unlock items without frustration
3. Sessions naturally end at ~10-15 minutes
4. Children voluntarily return to play within same week
5. Basic progress is persisted between sessions

## Post-MVP Vision

### Phase 2 Features
- **Story Mode**: Narrative adventure with chapters unlocked through progress
- **Family Cooperative Challenges**: Shared goals requiring all siblings to contribute
- **Expanded Customization**: More characters, pets, accessories, themed environments
- **Personal Best System**: Track and celebrate individual improvement
- **Achievement Badges**: Milestone recognition (effort-based)
- **Parent Dashboard**: Progress tracking, session history, skill breakdowns
- **More Math Content**: Division, fractions intro, word problems, patterns

### Long-term Vision (6-12 months)
- Mobile apps (iOS and Android) for on-the-go play
- Cloud sync for cross-device progress
- Additional game modes (puzzle, exploration)
- Seasonal events and limited-time challenges
- Expanded age range (5-10 years)
- Classroom/teacher mode for school use

### Expansion Opportunities
- Internationalization (multiple languages)
- Other subject areas (reading, science basics)
- Premium content packs
- Family subscription model
- School/district licensing

## Technical Considerations

### Platform Requirements
- **Target Platforms**: Web (desktop and tablet browsers)
- **Browser Support**: Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Performance Requirements**: 60fps animations, <2s initial load, offline-capable for basic play
- **Responsive Design**: Works on tablet (768px+) and desktop

### Technology Preferences
- **Frontend**: Angular 17+ (consistent with existing Nx workspace apps)
- **State Management**: NgRx or Angular signals for game state
- **Styling**: Tailwind CSS with custom theme (existing tailwind-preset library)
- **Animations**: Angular animations + CSS for performance
- **Audio**: Howler.js or Web Audio API for sound effects

### Architecture Considerations
- **Repository Structure**: New app in existing Nx monorepo (`apps/math-quest`)
- **Shared Libraries**:
  - Create `libs/game-engine` for reusable game logic
  - Use existing `libs/tailwind-preset`
- **Data Persistence**: LocalStorage initially, prepare for Supabase integration
- **Service Architecture**:
  - Game state service
  - Difficulty adaptation service
  - Progress/rewards service
  - Audio service
- **Future Mobile**: Structure code for potential Capacitor/Ionic wrapper

## Constraints & Assumptions

### Constraints
- **Budget**: Personal project, no external funding
- **Timeline**: Target MVP in 3 months (evenings/weekends)
- **Resources**: Solo developer with Angular/Nx expertise
- **Technical**: Must work within existing Nx workspace patterns

### Key Assumptions
- Children ages 6-8 have access to tablet or computer
- Parents will allow 15-30 minutes of game time daily
- Local storage is sufficient for MVP (no account sync needed)
- Colorful/cartoonish style appeals to target age range
- Children are motivated by pet companions and customization
- Adaptive difficulty can be tuned based on initial testing with actual children

## Risks & Open Questions

### Key Risks
- **Difficulty Calibration**: Adaptive engine may need extensive tuning; mitigate with real-world testing with the three children
- **Age Gap Challenge**: 6-year-old vs 8-year-old skill gap may be larger than expected; mitigate with generous difficulty range
- **Engagement Without Story**: MVP lacks narrative which competitors use for engagement; mitigate with strong customization/pet systems
- **Solo Development Pace**: Evening/weekend work may slow momentum; mitigate with clear MVP scope and phase planning
- **Art Assets**: Colorful/cartoonish style requires quality assets; mitigate with asset packs or simple geometric style initially

### Open Questions
- How should competitive elements work without creating sibling conflict?
- What's the right balance of math time vs reward/customization time?
- Should there be any parent controls in MVP (time limits, content selection)?
- How to handle "I want to play but sibling is using it" scenarios?
- Should locations be real (Paris, Cairo) or fictional (inspired by real places)?
- How many locations for MVP? (suggested: 4-6)
- Do pets have unique abilities or just cosmetic differences initially?

### Areas Needing Further Research
- Specific adaptive difficulty algorithms (Elo-based? Simpler thresholds?)
- Asset creation approach (custom, asset packs, procedural)
- Sound design principles for children's games
- Accessibility considerations for this age group

## Appendices

### A. Research Summary

Key findings from `docs/research/math-game-research.md`:

**Engagement Mechanics:**
- Fantasy-based math battles drive engagement
- Adaptive difficulty is table stakes (all competitors have it)
- Effort-based progression prevents frustration
- Immediate, satisfying feedback is critical
- Collectibles and customization are highly motivating

**Competitor Gap:**
- NO existing math games handle sibling/multiplayer well
- This is the primary differentiation opportunity

**Design Principles:**
- Self-Determination Theory: Support autonomy, competence, relatedness
- Flow Theory: Match challenge to skill level
- Growth Mindset: Praise effort over ability

**Critical Mistakes to Avoid:**
- Linking rewards to correctness (kills motivation)
- Fixed difficulty curves (frustrates some, bores others)
- Visible failure tracking (damages confidence)
- Sessions over 15-20 minutes (attention span limits)

### B. Theme Brainstorming
See `docs/brainstorming-math-quest-theme.md` for full session results including:
- Mind mapping of settings, characters, fantasies
- Theme synthesis and evaluation
- Final "World Code Crackers" concept development

### C. References
- Research document: `docs/research/math-game-research.md`
- Theme brainstorm: `docs/brainstorming-math-quest-theme.md`
- Existing Nx workspace: `apps/reward-chart` (similar Angular app pattern)
- Tailwind preset: `libs/tailwind-preset`

## Next Steps

### Immediate Actions
1. Review this brief with family to validate theme and assumptions
2. Select initial 4-6 world locations for MVP
3. Create initial wireframes for core game loop (map hub, code-cracking challenge, passport)
4. Research asset options (style, cost, licensing)
5. Set up `apps/math-quest` in Nx workspace
6. Design adaptive difficulty algorithm approach

### PM Handoff
This Project Brief provides the full context for Math Quest. Please start in 'PRD Generation Mode', review the brief thoroughly to work with the user to create the PRD section by section as the template indicates, asking for any necessary clarification or suggesting improvements.
