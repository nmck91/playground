# MatchCommentary API Documentation

**Module**: `libs/football-director-engine/src/lib/match-commentary.ts`
**Story**: 1.4.3 - Separate Match Commentary Module
**Last Updated**: 2025-12-27

## Overview

The `MatchCommentary` module is responsible for generating **real-time match events** during match simulation. It focuses solely on in-game commentary and event generation, with no overlap with post-match analysis or news generation.

## Responsibilities

✅ **What MatchCommentary Does:**
- Select goal scorers based on position weights and skill
- Select assist providers for goals
- Generate match events (goals, cards, shots, saves, blocks, near misses)
- Generate goal commentary with variations
- Calculate attendance with contextual factors
- Generate detailed match events for realism

❌ **What MatchCommentary Does NOT Do:**
- Post-match analysis (handled by `PostMatchGenerator`)
- News articles (handled by `NewsEngine`)
- Match previews (handled by `MatchPreviewGenerator`)

## Interface

```typescript
export interface IMatchCommentary {
  // Goal scorer selection
  selectGoalScorers(team: Team, numberOfGoals: number, seed?: number): Player[];
  selectAssistProvider(team: Team, scorer: Player, seed?: number): Player | null;

  // Event generation
  generateMatchEvents(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    homeScorers: Player[],
    awayScorers: Player[],
    seed?: number
  ): MatchEvent[];

  // Attendance
  generateAttendance(
    homeTeam: Team,
    seed?: number,
    options?: {
      isDerby?: boolean;
      homePosition?: number;
      awayPosition?: number;
      weatherCondition?: string;
    }
  ): number;
}
```

## API Methods

### `selectGoalScorers()`

Selects goal scorers from a team based on position weights and skill level.

**Parameters:**
- `team: Team` - The team to select scorers from
- `numberOfGoals: number` - How many goal scorers to select
- `seed?: number` - Optional seed for deterministic selection (testing)

**Returns:** `Player[]` - Array of players who scored

**Position Weights:**
- `FWD`: 5 (most likely)
- `MID`: 3
- `DEF`: 1 (least likely)
- `GK`: 0 (goalkeepers never score in regular play)

**Example:**
```typescript
const commentary = new MatchCommentary();
const scorers = commentary.selectGoalScorers(homeTeam, 3); // Select 3 goal scorers
```

---

### `selectAssistProvider()`

Selects an assist provider for a goal (50% probability of assist).

**Parameters:**
- `team: Team` - The team to select assist provider from
- `scorer: Player` - The player who scored (excluded from assists)
- `seed?: number` - Optional seed for deterministic selection

**Returns:** `Player | null` - The assist provider, or null for solo goal

**Position Weights:**
- `MID`: 5 (most likely)
- `FWD`: 3
- `DEF`: 1
- `GK`: 0.1 (very rare)

**Example:**
```typescript
const assistProvider = commentary.selectAssistProvider(homeTeam, scorer);
if (assistProvider) {
  console.log(`Assist by ${assistProvider.name}`);
}
```

---

### `generateMatchEvents()`

Generates all match events (goals, cards, shots, saves, etc.) for a match.

**Parameters:**
- `homeTeam: Team` - Home team
- `awayTeam: Team` - Away team
- `homeScore: number` - Final home score
- `awayScore: number` - Final away score
- `homeScorers: Player[]` - Players who scored for home team
- `awayScorers: Player[]` - Players who scored for away team
- `seed?: number` - Optional seed for deterministic generation

**Returns:** `MatchEvent[]` - Array of match events, sorted by minute

**Event Types Generated:**
- **Goals**: One event per goal with description and assist
- **Penalties**: ~10% of goals are penalties
- **Yellow Cards**: 30% chance in high-scoring games (3+ goals)
- **Red Cards**: 5% chance in any match
- **Big Chances**: 2-4 missed opportunities
- **Saves**: 3-6 goalkeeper saves
- **Near Misses**: 2-3 shots hitting post/crossbar
- **Blocks**: 2-4 defensive blocks
- **Shots**: 4-8 shots on/off target

**Example:**
```typescript
const events = commentary.generateMatchEvents(
  homeTeam,
  awayTeam,
  2,  // Home score
  1,  // Away score
  homeScorers,
  awayScorers
);

// Events are sorted by minute
events.forEach(event => {
  console.log(`${event.minute}' - ${event.description}`);
});
```

---

### `generateAttendance()`

Generates match attendance based on team popularity and contextual factors.

**Parameters:**
- `homeTeam: Team` - Home team
- `seed?: number` - Optional seed for deterministic generation
- `options?: object` - Contextual factors affecting attendance:
  - `isDerby?: boolean` - Derby match (+20% attendance)
  - `homePosition?: number` - Home team league position (top 4 = +10%)
  - `awayPosition?: number` - Away team league position (1st = +15%)
  - `weatherCondition?: string` - Weather (rain/snow = -10%)

**Returns:** `number` - Attendance figure (rounded to nearest 100)

**Base Calculation:**
- Base attendance = `min(50000, team.budget / 50)`
- Apply contextual modifiers
- Add random variance (±15%)
- Minimum attendance: 5,000

**Example:**
```typescript
const attendance = commentary.generateAttendance(homeTeam, undefined, {
  isDerby: true,              // +20%
  homePosition: 3,            // +10% (top 4)
  awayPosition: 1,            // +15% (league leader)
  weatherCondition: 'rainy'   // -10%
});

console.log(`Attendance: ${attendance.toLocaleString()}`);
```

---

## Usage Example

### Complete Match Event Generation

```typescript
import { MatchCommentary } from '@playground/football-director-engine';

const commentary = new MatchCommentary();

// 1. Select goal scorers
const homeScorers = commentary.selectGoalScorers(homeTeam, 2);
const awayScorers = commentary.selectGoalScorers(awayTeam, 1);

// 2. Generate all match events
const events = commentary.generateMatchEvents(
  homeTeam,
  awayTeam,
  2, // Home score
  1, // Away score
  homeScorers,
  awayScorers
);

// 3. Generate attendance
const attendance = commentary.generateAttendance(homeTeam, undefined, {
  isDerby: false,
  homePosition: 5,
  awayPosition: 8,
  weatherCondition: 'sunny'
});

// 4. Display match events
console.log(`Attendance: ${attendance.toLocaleString()}`);
events.forEach(event => {
  const teamLabel = event.team === 'home' ? homeTeam.name : awayTeam.name;
  console.log(`[${event.minute}'] ${teamLabel}: ${event.description}`);
});
```

**Output Example:**
```
Attendance: 28,400
[12'] Manchester United: ⚽ GOAL! Marcus Rashford finds the back of the net! Assist: Bruno Fernandes
[23'] Liverpool: Brilliant save by Alisson to deny Harry Kane!
[34'] Manchester United: Mohamed Salah misses a golden opportunity!
[45'] Liverpool: ⚽ GOAL! Mohamed Salah scores a brilliant goal for Liverpool!
[67'] Manchester United: 🟨 Casemiro receives a yellow card for a late challenge
[78'] Manchester United: ⚽ GOAL! Harry Maguire with a clinical finish! Assisted by Luke Shaw
```

---

## Extending Commentary

### Adding New Event Types

To add new event types:

1. **Add to MatchEvent type** in `types.ts`:
```typescript
export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow-card' | 'red-card' | 'penalty' | 'own-goal'
      | 'big-chance' | 'save' | 'shot-on-target' | 'shot-off-target'
      | 'block' | 'near-miss'
      | 'YOUR-NEW-TYPE'; // Add here
  // ... other fields
}
```

2. **Generate in `generateMatchEvents()`** or `generateDetailedMatchEvents()`:
```typescript
// Add generation logic in MatchCommentary
private generateYourNewEventType(...): MatchEvent[] {
  const events: MatchEvent[] = [];
  // Your logic here
  return events;
}
```

3. **Add tests** in `match-commentary.spec.ts`:
```typescript
it('should generate your new event type', () => {
  // Test your new event generation
});
```

### Adding New Commentary Variations

To add more goal descriptions or commentary variations:

1. **Edit `generateGoalDescription()`**:
```typescript
private generateGoalDescription(scorer: string, team: string, minute: number, seed?: number, assistProvider?: string): string {
  let descriptions: string[];

  if (assistProvider) {
    descriptions = [
      `⚽ GOAL! ${scorer} finds the back of the net! Assist: ${assistProvider}`,
      // ... existing descriptions ...
      `⚽ YOUR NEW DESCRIPTION HERE`, // Add new variations
    ];
  } else {
    // Add solo goal variations
  }

  // ... rest of method
}
```

2. **Maintain variety**: Aim for 6-8 variations per type to avoid repetition

---

## Testing

### Unit Tests

All commentary methods are unit tested in `match-commentary.spec.ts`:

```bash
# Run commentary tests
npx vitest run libs/football-director-engine/src/lib/match-commentary.spec.ts

# Coverage: 22 tests, all passing
```

### Seed-based Testing

Use the `seed` parameter for deterministic testing:

```typescript
const events1 = commentary.generateMatchEvents(home, away, 2, 1, scorers1, scorers2, 42);
const events2 = commentary.generateMatchEvents(home, away, 2, 1, scorers1, scorers2, 42);

// Same seed = same events
expect(events1).toEqual(events2);
```

---

## Integration

### Used By

- **MatchSimulator** (`match-simulator.ts`): Primary consumer for real-time event generation

### Does NOT Depend On

- NewsEngine (separate responsibility)
- PostMatchGenerator (separate responsibility)
- MatchPreviewGenerator (separate responsibility)

### Clean Separation

```
MatchCommentary ────> Real-time events during simulation
                      (goals, cards, shots, saves, etc.)

PostMatchGenerator ──> Post-match analysis & quotes
                       (manager quotes, player interviews, turning points)

NewsEngine ──────────> News articles after match
                       (match reports, transfer news, etc.)
```

---

## Deprecated Methods

### `generateMatchSummary()`

**Status**: ⚠️ Deprecated
**Reason**: Generates post-match content, overlaps with `PostMatchGenerator`
**Use Instead**: `PostMatchGenerator.generatePostMatchAnalysis()`

This method will be removed in a future version. Post-match summaries should be generated by `PostMatchGenerator`, not real-time commentary.

---

## Best Practices

1. **Use seeded random for testing**: Pass a seed value for reproducible results in tests
2. **Don't mix responsibilities**: Keep real-time commentary separate from post-match analysis
3. **Maintain variety**: Ensure commentary descriptions have enough variations to avoid repetition
4. **Context matters**: Use the attendance options to make crowds realistic based on match context
5. **Position weights**: Adjust position weights if goal distribution feels unrealistic

---

## Performance

- **Lightweight**: Event generation is fast (<1ms for typical match)
- **Memory efficient**: Only stores events, not intermediate state
- **Deterministic**: Seeded random enables testing and replay functionality

---

## Future Enhancements

Potential improvements for future stories:

1. **Dynamic Commentary**: Commentary that adapts to match scoreline and context
2. **Manager Reactions**: Real-time tactical changes reflected in commentary
3. **Crowd Atmosphere**: Crowd reactions to events
4. **Substitutions**: Commentary for substitutions and tactical changes
5. **Injury Events**: Proper injury event types (currently using 'goal' type)
6. **VAR Reviews**: Commentary for VAR decisions (if implemented)

---

**Related Documentation:**
- [Engine Module Dependencies](./engine-module-dependencies.md)
- [NewsEngine API](./news-engine-api.md) (future)
- [PostMatchGenerator API](./post-match-generator-api.md) (future)
