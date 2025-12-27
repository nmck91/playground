# Football Director Engine

A comprehensive TypeScript game engine for football (soccer) management simulation. This library provides 24 specialized modules handling all aspects of a football management game, from match simulation to player development, transfers, finances, and more.

## Overview

The Football Director Engine is designed with the following principles:

- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Interface-Based Design**: All modules expose TypeScript interfaces for dependency injection
- **Pure Business Logic**: No UI dependencies - engine runs headless and can integrate with any frontend
- **Comprehensive Testing**: >80% unit test coverage with deterministic, fast tests
- **Type Safety**: Strict TypeScript configuration with explicit types throughout

## Module Organization

The engine consists of 24 modules organized into 5 categories:

### Core Simulation Modules

- **match-simulator** - Simulates individual matches with realistic events, scoring, and statistics
- **season-manager** - Orchestrates full 52-week seasons including fixtures, phases, and transitions
- **league-table-manager** - Calculates league standings, form, and head-to-head records
- **cup-manager** - Manages knockout cup competitions with draws and progression

### Player Management Modules

- **player-stats-tracker** - Tracks detailed player statistics (goals, assists, cards, etc.)
- **player-development** - Handles player aging, skill progression, and development phases
- **injury-manager** - Manages player injuries with recovery times and severity
- **morale-manager** - Calculates player morale based on performance, playing time, and team results
- **contract-manager** - Handles player contracts, renewals, and expiry
- **ai-contract-manager** - Automates contract decisions for AI-controlled teams

### Match Content Modules

- **match-commentary** - Generates real-time match commentary for events
- **match-preview-generator** - Creates pre-match previews with analysis and predictions
- **post-match-generator** - Generates post-match analysis and player interviews
- **weather-generator** - Creates match weather conditions based on season

### Financial & Administrative Modules

- **finance-engine** - Manages team budgets, wages, income, and financial transactions
- **transfer-market** - Handles player transfers, market generation, and valuations
- **board-manager** - Manages board objectives, satisfaction, and job security
- **staff-manager** - Handles hiring/firing of managers, coaches, and scouts
- **youth-academy-manager** - Generates youth players for recruitment

### Meta Game Modules

- **achievement-manager** - Tracks achievements and awards season prizes
- **records-manager** - Maintains season and club records (goals, wins, streaks, etc.)
- **news-engine** - Generates news articles for all game events
- **tactics-manager** - Manages team formations, mentality, roles, and tactical modifiers
- **team-generator** - Generates teams, players, and full leagues

## Quick Start

```typescript
import {
  TeamGenerator,
  SeasonManager,
  MatchSimulator,
  LeagueTableManager
} from '@playground/football-director-engine';

// Generate a league
const generator = new TeamGenerator();
const teams = generator.generateLeague();

// Start a season
const seasonManager = new SeasonManager();
const season = seasonManager.initializeSeason(teams, 2025);

// Simulate a match
const matchSimulator = new MatchSimulator();
const fixture = season.fixtures[0];
const homeTeam = teams.find(t => t.id === fixture.homeTeamId)!;
const awayTeam = teams.find(t => t.id === fixture.awayTeamId)!;

const result = matchSimulator.simulateMatch(
  homeTeam,
  awayTeam,
  fixture,
  1, // week
  2025 // year
);

console.log(`${result.homeTeamName} ${result.homeGoals} - ${result.awayGoals} ${result.awayTeamName}`);

// Update league table
const tableManager = new LeagueTableManager();
const table = tableManager.initializeTable(teams);
const updatedTable = tableManager.updateTable(table, result);

console.log('League Table:', updatedTable);
```

## Module Interfaces

All modules implement TypeScript interfaces following the `I<ClassName>` naming convention:

- `IMatchSimulator` - Match simulation interface
- `ISeasonManager` - Season orchestration interface
- `ITransferMarket` - Transfer market interface
- ... and 21 more

This enables dependency injection for testing and flexible module composition.

## Module Descriptions

### Core Simulation

#### MatchSimulator (match-simulator.ts)

**Purpose**: Simulates individual football matches with realistic events and outcomes.

**Key Features**:
- Event-based simulation (goals, cards, injuries, substitutions)
- Tactical modifiers based on formations and mentality
- Manager and coach bonuses
- Weather effects
- Match commentary integration
- Player statistics tracking

**Public API**:
```typescript
simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  fixture: Fixture,
  currentWeek: number,
  currentYear: number
): MatchResult
```

**Dependencies**: PlayerStatsTracker, InjuryManager, TacticsManager, StaffManager, WeatherGenerator, MatchCommentary

**Testing**: Mock dependencies for isolated match simulation tests

---

#### SeasonManager (season-manager.ts)

**Purpose**: Orchestrates full 52-week seasons with fixture scheduling and phase management.

**Key Features**:
- Fixture generation (home/away, double round-robin)
- Season phases (Pre-season, Competitive, End-of-season)
- Weekly progression logic
- Season initialization and completion
- Integration with cup competitions

**Public API**:
```typescript
initializeSeason(teams: Team[], year: number, seed?: number): Season
generateFixtures(teams: Team[], year: number, seed?: number): Fixture[]
advanceWeek(season: Season): Season
getSeasonPhase(week: number): SeasonPhase
isSeasonComplete(season: Season): boolean
```

**Dependencies**: None (pure scheduling logic)

**Testing**: Deterministic fixture generation with seeds

---

#### LeagueTableManager (league-table-manager.ts)

**Purpose**: Calculates and maintains league standings with all tiebreaker rules.

**Key Features**:
- Points, goals for/against, goal difference
- Form calculation (last 5 matches)
- Head-to-head records
- Proper sorting with tiebreakers
- Position change tracking

**Public API**:
```typescript
initializeTable(teams: Team[]): LeagueTable[]
updateTable(currentTable: LeagueTable[], matchResult: MatchResult): LeagueTable[]
getTeamPosition(table: LeagueTable[], teamId: string): number
getForm(fixtures: Fixture[], teamId: string, maxMatches?: number): string
```

**Dependencies**: None

**Testing**: Test table calculations with various match results

---

#### CupManager (cup-manager.ts)

**Purpose**: Manages knockout cup competitions with draws and progression.

**Key Features**:
- Single-elimination tournament structure
- Random draws for each round
- Bye system for first round
- Prize money structure
- Round scheduling within season

**Public API**:
```typescript
generateCupCompetition(teams: Team[], season: number, cupName?: string): CupCompetition
advanceTournament(cup: CupCompetition, currentWeek: number): CupCompetition
isCupComplete(cup: CupCompetition): boolean
getPrizeMoney(round: string, isWinner?: boolean): number
hasCupFixturesThisWeek(cup: CupCompetition, currentWeek: number): boolean
getCupFixturesForWeek(cup: CupCompetition, currentWeek: number): CupFixture[]
```

**Dependencies**: None

**Testing**: Test tournament progression and prize calculations

---

### Player Management

#### PlayerStatsTracker (player-stats-tracker.ts)

**Purpose**: Tracks comprehensive player statistics across all matches.

**Key Features**:
- Match statistics (goals, assists, cards, minutes)
- Season statistics aggregation
- Career statistics
- Performance ratings
- Clean sheet tracking

**Public API**:
```typescript
initializePlayerStats(): PlayerStats
updatePlayerStats(stats: PlayerStats, event: MatchEvent): PlayerStats
calculateSeasonStats(players: Player[]): Map<string, PlayerStats>
getTopScorers(players: Player[], limit?: number): Player[]
```

**Dependencies**: None

**Testing**: Test stat calculations with various events

---

#### PlayerDevelopment (player-development.ts)

**Purpose**: Handles player aging, skill progression, and development phases.

**Key Features**:
- Age-based development (developing, peak, declining, veteran)
- Skill progression/regression
- Coach bonuses affect development
- Development reports for tracking changes

**Public API**:
```typescript
agePlayer(player: Player): Player
calculateSkillChange(player: Player, seed?: number): number
getPlayerPhase(age: number): 'developing' | 'peak' | 'declining' | 'veteran'
developPlayer(player: Player, seed?: number): { player: Player; report: DevelopmentReport }
developTeam(team: Team, seed?: number): { team: Team; reports: DevelopmentReport[] }
```

**Dependencies**: None

**Testing**: Test skill changes across all age ranges

---

#### InjuryManager (injury-manager.ts)

**Purpose**: Manages player injuries with realistic recovery times and severity.

**Key Features**:
- Injury types (minor, moderate, major, season-ending)
- Recovery week calculation
- Injury risk based on match intensity
- Return from injury logic

**Public API**:
```typescript
generateInjury(currentWeek: number, seed?: number): Injury
applyInjury(player: Player, injury: Injury): Player
isInjured(player: Player): boolean
weeksUntilRecovery(player: Player, currentWeek: number): number
updateInjuries(players: Player[], currentWeek: number): Player[]
```

**Dependencies**: None

**Testing**: Test injury generation and recovery logic

---

#### MoraleManager (morale-manager.ts)

**Purpose**: Calculates player morale based on multiple factors.

**Key Features**:
- Playing time consideration
- Team performance factor
- Wage satisfaction
- Contract status impact
- Morale effect on performance

**Public API**:
```typescript
calculatePlayerMorale(
  player: Player,
  team: Team,
  leaguePosition: number,
  recentForm: number,
  currentWeek: number
): number
getMoraleInfo(moraleValue: number): MoraleInfo
applyMoraleToSkill(baseSkill: number, morale: MoraleInfo): number
updateTeamMorale(team: Team, leagueTable: LeagueTable[], currentWeek: number): {
  team: Team;
  unhappyPlayers: Array<{ name: string; morale: MoraleInfo }>;
}
```

**Dependencies**: None

**Testing**: Test morale calculations with various scenarios

---

#### ContractManager (contract-manager.ts)

**Purpose**: Handles player contracts, renewals, and expiry.

**Key Features**:
- Contract duration tracking
- Contract status (secure, expiring, expired)
- Player demands calculation
- Automatic expiry processing
- Free agent generation

**Public API**:
```typescript
calculateContractDetails(
  contract: PlayerContract,
  currentYear: number,
  currentWeek: number
): { yearsRemaining: number; weeksRemaining: number; status: ContractStatus }
updateTeamContracts(team: Team, currentYear: number, currentWeek: number): Team
findExpiringContracts(team: Team, weeksThreshold?: number): Player[]
acceptContractOffer(
  player: Player,
  weeklyWage: number,
  contractYears: number,
  currentYear: number,
  currentWeek: number
): Player
processExpiredContracts(team: Team, currentWeek: number): {
  updatedTeam: Team;
  freeAgents: FreeAgent[];
}
```

**Dependencies**: None

**Testing**: Test contract lifecycle and expiry

---

#### AIContractManager (ai-contract-manager.ts)

**Purpose**: Automates contract decisions for AI-controlled teams.

**Key Features**:
- Automatic renewal decisions based on player value
- Free agent signing for AI teams
- Budget-aware contract offers
- Squad balance consideration

**Public API**:
```typescript
processTeamContracts(team: Team, currentYear: number, currentWeek: number): Team
signFreeAgents(
  team: Team,
  freeAgents: FreeAgent[],
  currentYear: number,
  currentWeek: number
): { team: Team; signed: Player[] }
```

**Dependencies**: ContractManager

**Testing**: Test AI contract logic with various scenarios

---

#### YouthAcademyManager (youth-academy-manager.ts)

**Purpose**: Generates youth players for recruitment into first team squads.

**Key Features**:
- Youth player generation (16-19 years old)
- Potential-based skill ranges
- Annual youth intake
- Scout bonuses affect quality

**Public API**:
```typescript
generateYouthProspects(currentYear: number, seed?: number): Player[]
addYouthPlayersToTeam(team: Team, selectedPlayers: Player[]): Team
generateYouthPlayers(
  team: Team,
  currentYear: number,
  seed?: number
): { team: Team; newPlayers: Player[] }
```

**Dependencies**: None

**Testing**: Test youth generation with seeds

---

### Match Content

#### MatchCommentary (match-commentary.ts)

**Purpose**: Generates real-time match commentary for all events.

**Key Features**:
- Event-specific commentary (goals, cards, saves, chances)
- Context-aware narratives
- Momentum and importance consideration
- Half-time and full-time summaries

**Public API**:
```typescript
generateEventCommentary(
  event: MatchEvent,
  homeTeam: Team,
  awayTeam: Team,
  currentScore: { home: number; away: number },
  minute: number,
  seed?: number
): string
generateHalfTimeCommentary(
  homeTeam: Team,
  awayTeam: Team,
  currentScore: { home: number; away: number },
  events: MatchEvent[],
  seed?: number
): string
generateFullTimeCommentary(
  result: MatchResult,
  seed?: number
): string
```

**Dependencies**: None

**Testing**: Test commentary generation for all event types

---

#### MatchPreviewGenerator (match-preview-generator.ts)

**Purpose**: Creates pre-match previews with analysis and predictions.

**Key Features**:
- Form analysis for both teams
- Head-to-head history
- Weather forecast
- Manager quotes
- Key player spotlights

**Public API**:
```typescript
generatePreview(
  fixture: Fixture,
  homeTeam: Team,
  awayTeam: Team,
  leagueTable: LeagueTable[],
  allFixtures: Fixture[],
  currentWeek: number,
  currentYear: number,
  seed?: number
): MatchPreview
```

**Dependencies**: LeagueTableManager, WeatherGenerator

**Testing**: Test preview generation with various scenarios

---

#### PostMatchGenerator (post-match-generator.ts)

**Purpose**: Generates post-match analysis and player interviews.

**Key Features**:
- Manager reactions
- Player interviews (man of the match, key performers)
- Turning points analysis
- Statistical highlights
- League position impact

**Public API**:
```typescript
generatePostMatchAnalysis(
  result: MatchResult,
  homeTeam: Team,
  awayTeam: Team,
  leagueTable: LeagueTable[],
  seed?: number
): PostMatchAnalysis
```

**Dependencies**: None

**Testing**: Test analysis generation for various results

---

#### WeatherGenerator (weather-generator.ts)

**Purpose**: Creates realistic match weather conditions based on season.

**Key Features**:
- Season-based weather (summer sunny, winter rainy/snowy)
- Temperature ranges
- Wind and precipitation
- Minor gameplay effects

**Public API**:
```typescript
generateWeather(week: number, seed?: number): MatchWeather
```

**Dependencies**: None

**Testing**: Test seasonal weather patterns

---

### Financial & Administrative

#### FinanceEngine (finance-engine.ts)

**Purpose**: Manages all team financial operations and tracking.

**Key Features**:
- Weekly wage calculations
- Match day income
- Prize money
- Budget tracking
- Financial transaction history

**Public API**:
```typescript
calculateWeeklyWages(team: Team): number
calculateWeeklyIncome(position: number, currentWeek: number): number
calculateMatchDayIncome(isHome: boolean): number
processWeeklyFinances(
  budget: number,
  team: Team,
  position: number,
  matchDayIncome: number,
  weekNumber: number
): { newBudget: number; transactions: FinancialRecord[] }
```

**Dependencies**: None

**Testing**: Test financial calculations and budget tracking

---

#### TransferMarket (transfer-market.ts)

**Purpose**: Handles player transfers, market generation, and valuations.

**Key Features**:
- Transfer windows (pre-season, winter)
- Player valuation based on skill and age
- Market generation from AI teams
- Transfer negotiations
- AI transfer activity

**Public API**:
```typescript
isTransferWindowOpen(currentWeek: number): boolean
calculatePlayerValue(player: Player): number
generateMarket(aiTeams: Team[], currentWeek: number, listingsPerWeek?: number): TransferListing[]
buyPlayer(
  listing: TransferListing,
  buyerTeam: Team,
  sellerTeam: Team,
  currentListings: TransferListing[],
  currentWeek: number
): {
  success: boolean;
  message: string;
  updatedBuyerTeam?: Team;
  updatedSellerTeam?: Team;
  updatedListings?: TransferListing[];
}
```

**Dependencies**: None

**Testing**: Test transfer mechanics and valuations

---

#### BoardManager (board-manager.ts)

**Purpose**: Manages board objectives, satisfaction, and job security.

**Key Features**:
- Season objectives based on previous performance
- Board satisfaction tracking
- Job security calculation
- End-of-season evaluation
- Sacking mechanism

**Public API**:
```typescript
generateObjective(team: Team, season: number, previousPosition?: number): BoardObjective
initializeBoardStatus(team: Team, season: number): BoardStatus
updateObjectiveStatus(
  objective: BoardObjective,
  currentPosition: number,
  weeksRemaining: number
): BoardObjective
calculateSatisfaction(
  currentSatisfaction: number,
  objective: BoardObjective,
  currentPosition: number,
  weeksRemaining: number
): number
evaluateSeason(boardStatus: BoardStatus, finalPosition: number): {
  objective: BoardObjective;
  satisfied: boolean;
  sacked: boolean;
  message: string;
}
```

**Dependencies**: None

**Testing**: Test objective setting and evaluation

---

#### StaffManager (staff-manager.ts)

**Purpose**: Handles hiring/firing of managers, coaches, and scouts.

**Key Features**:
- Staff generation with specialties
- Salary calculations
- Staff market generation
- Manager happiness tracking
- Performance bonuses (manager, coach, scout)

**Public API**:
```typescript
generateStaff(role: StaffRole, seed?: number): Staff
calculateStaffSalary(role: StaffRole, skill: number): number
generateStaffMarket(currentWeek: number, count?: number): Staff[]
hireStaff(staff: Staff, team: Team, currentMarket: Staff[]): {
  success: boolean;
  message: string;
  updatedTeam?: Team;
  updatedMarket?: Staff[];
}
fireStaff(staff: Staff, team: Team): {
  success: boolean;
  message: string;
  updatedTeam?: Team;
  severancePay?: number;
}
getManagerBonus(team: Team): number
getCoachBonus(team: Team): number
getScoutBonus(team: Team): number
```

**Dependencies**: None

**Testing**: Test staff mechanics and bonuses

---

### Meta Game

#### AchievementManager (achievement-manager.ts)

**Purpose**: Tracks achievements and awards season prizes.

**Key Features**:
- 50+ achievements across categories
- Season awards (Golden Boot, Manager of the Year, etc.)
- Achievement unlock detection
- Progress tracking

**Public API**:
```typescript
getAllAchievements(): Achievement[]
checkAchievements(gameState: GameState, achievements: Achievement[]): Achievement[]
awardSeasonPrizes(gameState: GameState): SeasonAward
```

**Dependencies**: Multiple (accesses full game state)

**Testing**: Test achievement unlock conditions

---

#### RecordsManager (records-manager.ts)

**Purpose**: Maintains season and club records.

**Key Features**:
- Season records (goals, wins, position, etc.)
- Club all-time records
- Record breaking detection
- Historical tracking

**Public API**:
```typescript
calculateSeasonRecords(
  season: number,
  finalTable: LeagueTable,
  matchHistory: MatchResult[],
  fixtures: Fixture[],
  playerTeam: Team,
  teamId: string
): SeasonRecords
initializeClubRecords(season: number): ClubRecords
updateClubRecords(
  currentRecords: ClubRecords,
  seasonRecords: SeasonRecords
): { records: ClubRecords; brokenRecords: string[] }
```

**Dependencies**: None

**Testing**: Test record calculations and comparisons

---

#### NewsEngine (news-engine.ts)

**Purpose**: Generates news articles for all game events.

**Key Features**:
- Match news (previews, reports, results)
- Transfer news
- Injury news
- Contract news
- Achievement news
- Season news
- Template-based generation

**Public API**:
```typescript
generateMatchNews(result: MatchResult): NewsArticle
generateTransferNews(transfer: Transfer): NewsArticle
generateInjuryNews(player: Player, injury: Injury): NewsArticle
generateContractNews(player: Player, contract: Contract): NewsArticle
generateAchievementNews(achievement: Achievement): NewsArticle
generateSeasonNews(season: Season): NewsArticle
```

**Dependencies**: None

**Testing**: Test news generation for all event types

---

#### TacticsManager (tactics-manager.ts)

**Purpose**: Manages team formations, mentality, roles, and tactical modifiers.

**Key Features**:
- 6 formations with position requirements
- Mentality system (defensive, balanced, attacking)
- Player roles (defenders, midfielders, forwards)
- Team instructions (tempo, width, pressing, passing)
- Tactical matchup modifiers

**Public API**:
```typescript
getFormationRequirements(formation: FormationType): FormationRequirements
getDefaultTactics(): Tactics
canPlayFormation(team: Team, formation: FormationType): boolean
calculateTacticalModifier(ownTactics: Tactics, opponentTactics: Tactics): number
setTeamTactics(team: Team, tactics: Tactics): Team
getDefenderRoles(): DefenderRole[]
getMidfielderRoles(): MidfielderRole[]
getForwardRoles(): ForwardRole[]
calculateAdvancedTacticsModifier(tactics: Tactics): number
```

**Dependencies**: None

**Testing**: Test tactical calculations and modifiers

---

#### TeamGenerator (team-generator.ts)

**Purpose**: Generates teams, players, and full leagues.

**Key Features**:
- Player generation with skill ranges
- Team generation with tier system (elite, strong, mid, weak)
- Full 20-team league generation
- Realistic squad sizes and budgets
- Seeded generation for determinism

**Public API**:
```typescript
generatePlayer(
  position: Player['position'],
  skillRange: [number, number],
  seed?: number
): Player
generateTeam(
  name: string,
  tier: 'elite' | 'strong' | 'mid' | 'weak',
  seed?: number
): Team
generateLeague(seed?: number): Team[]
```

**Dependencies**: StaffManager, TacticsManager, PlayerStatsTracker

**Testing**: Test generation with seeds for consistency

---

## Architecture Principles

### Single Responsibility

Each module has ONE clear responsibility. For example:
- MatchSimulator ONLY simulates matches
- FinanceEngine ONLY handles finances
- NewsEngine ONLY generates news

### Dependency Injection

Modules accept dependencies via interfaces, not concrete implementations:

```typescript
// Good - injectable
class MatchSimulator implements IMatchSimulator {
  constructor(
    private statsTracker: IPlayerStatsTracker,
    private injuryManager: IInjuryManager
  ) {}
}

// Bad - hardcoded dependencies
class MatchSimulator {
  private statsTracker = new PlayerStatsTracker();
  private injuryManager = new InjuryManager();
}
```

### No UI Dependencies

The engine is pure business logic with zero React/UI imports. This enables:
- Headless testing
- Multiple frontend integrations (web, mobile, CLI)
- Server-side simulation
- AI agent integration

### Deterministic Simulation

All random events accept optional seeds for deterministic testing:

```typescript
const result = matchSimulator.simulateMatch(homeTeam, awayTeam, fixture, week, year, 12345);
// Same seed = same result every time
```

## Testing Strategy

### Unit Tests

Every module has comprehensive unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { MatchSimulator } from './match-simulator';

describe('MatchSimulator', () => {
  it('should simulate a match with deterministic seed', () => {
    const simulator = new MatchSimulator();
    const result = simulator.simulateMatch(homeTeam, awayTeam, fixture, 1, 2025, 12345);

    expect(result.homeGoals).toBe(2);
    expect(result.awayGoals).toBe(1);
  });
});
```

### Integration Tests

Test module interactions:

```typescript
describe('Season Simulation Integration', () => {
  it('should simulate full season with all modules', () => {
    const season = seasonManager.initializeSeason(teams, 2025);

    // Simulate all weeks
    for (let week = 1; week <= 52; week++) {
      season = seasonManager.advanceWeek(season);
    }

    expect(seasonManager.isSeasonComplete(season)).toBe(true);
  });
});
```

### Mock Dependencies

Use mocks for isolated testing:

```typescript
const mockStatsTracker: IPlayerStatsTracker = {
  updatePlayerStats: vi.fn(),
  initializePlayerStats: vi.fn(),
  // ... other methods
};

const simulator = new MatchSimulator(mockStatsTracker, mockInjuryManager);
```

## Building

Run `nx build football-director-engine` to build the library.

## Running Unit Tests

Run `nx test football-director-engine` to execute the unit tests via Vitest.

Current coverage: **637 tests, >80% coverage**

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on adding new modules or extending existing ones.

## Documentation

- **Architecture**: See `/docs/architecture/football-director-architecture.md`
- **Migration Guide**: See `/docs/architecture/engine-migration-guide.md`
- **Examples**: See `/examples/` directory

## License

MIT
