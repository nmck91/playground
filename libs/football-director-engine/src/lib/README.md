# Football Director Engine - Module Documentation

## Overview

The Football Director Engine is a comprehensive football management simulation system built with TypeScript. It provides all the game logic for simulating a 52-week football season, including matches, transfers, player development, finances, and more.

The engine follows a modular architecture with dependency injection, making it testable, maintainable, and easy to extend. All modules are framework-agnostic (no React/UI dependencies) and can be used in any JavaScript/TypeScript application.

## Architecture

### Design Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: All dependencies are explicitly injected via constructors
3. **Interface-Driven**: Modules implement typed interfaces for testability
4. **Framework-Agnostic**: Pure TypeScript with no UI framework dependencies
5. **Immutability Where Possible**: Prefer returning new objects over mutating state

### Module Organization

```
libs/football-director-engine/src/lib/
├── interfaces/          # TypeScript interfaces for all modules
├── factories/           # Factory functions for creating module instances
├── types.ts             # Core type definitions
├── module-registry.ts   # Central module registry (singleton pattern)
├── module-keys.ts       # Constants for module registry keys
├── setup-modules.ts     # Initialize all modules with dependencies
├── [module-name].ts     # Individual module implementations
└── __tests__/           # Unit and integration tests
```

### Dependency Graph

The modules are organized in layers to prevent circular dependencies:

**Layer 1 - Core/Utilities** (no dependencies):
- `types.ts` - Type definitions
- `type-guards.ts` - Runtime type checking
- `game-state-versions.ts` - Save versioning
- `migration.ts` - Data migration utilities
- `weather-generator.ts` - Weather conditions
- `team-generator.ts` - Team generation

**Layer 2 - Game Mechanics** (depend on Layer 1):
- `tactics-manager.ts` - Tactical calculations
- `morale-manager.ts` - Player morale
- `injury-manager.ts` - Injury simulation
- `player-development.ts` - Player growth
- `contract-manager.ts` - Contract logic
- `ai-contract-manager.ts` - AI contract decisions
- `staff-manager.ts` - Staff management
- `player-stats-tracker.ts` - Statistics tracking
- `records-manager.ts` - Record keeping
- `achievement-manager.ts` - Achievement tracking

**Layer 3 - Match & Season** (depend on Layers 1-2):
- `match-commentary.ts` - Match narration
- `match-simulator.ts` - Match simulation
- `match-story-generator.ts` - Match stories
- `season-manager.ts` - Season progression
- `league-table-manager.ts` - Table calculations
- `cup-manager.ts` - Cup competitions

**Layer 4 - Management Systems** (depend on Layers 1-3):
- `transfer-market.ts` - Transfer operations
- `finance-engine.ts` - Financial calculations
- `youth-academy-manager.ts` - Youth development
- `board-manager.ts` - Board objectives
- `news-engine.ts` - News generation

## Module Reference

### Core Modules

#### match-simulator.ts

**Purpose**: Simulates football matches with realistic results, events, and player ratings.

**Responsibilities**:
- Simulate match results based on team strength and tactics
- Generate match events (goals, cards, injuries, substitutions)
- Calculate player ratings and determine man of the match
- Apply weather, morale, and tactical modifiers

**Public API**:
```typescript
interface IMatchSimulator {
  simulateMatch(homeTeam: Team, awayTeam: Team, week: number): MatchResult;
  simulateCupMatch(homeTeam: Team, awayTeam: Team, week: number, isNeutralVenue?: boolean): CupResult;
}
```

**Dependencies**:
- `ITacticsManager` - Apply tactical bonuses
- `IInjuryManager` - Process match injuries
- `IMoraleManager` - Apply morale effects
- `IStaffManager` - Coach bonuses
- `IWeatherGenerator` - Weather conditions
- `IMatchCommentary` - Match narration

**Example**:
```typescript
import { getModule } from './module-registry';
import { MatchSimulator } from './module-keys';

const matchSimulator = getModule(MatchSimulator);
const result = matchSimulator.simulateMatch(homeTeam, awayTeam, 10);
console.log(`${result.homeTeam} ${result.homeScore} - ${result.awayScore} ${result.awayTeam}`);
```

**Testing**:
```typescript
import { createMockMatchSimulator } from './factories/match-simulator.factory';

const mockSimulator = createMockMatchSimulator({
  injuryManager: {
    processInjuries: vi.fn().mockReturnValue([])
  }
});
```

---

#### season-manager.ts

**Purpose**: Manages fixtures, season progression, and match scheduling.

**Responsibilities**:
- Generate round-robin league fixtures
- Determine current season phase (pre-season, competitive, off-season)
- Manage transfer window status
- Simulate weekly matches

**Public API**:
```typescript
interface ISeasonManager {
  generateFixtures(teams: Team[]): Fixture[];
  generateFriendlyFixtures(userTeam: Team, allTeams: Team[]): Fixture[];
  getSeasonPhase(week: number): SeasonPhase;
  getTransferWindowStatus(week: number): TransferWindowStatus;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { SeasonManager } from './module-keys';

const seasonManager = getModule(SeasonManager);
const fixtures = seasonManager.generateFixtures(teams);
const phase = seasonManager.getSeasonPhase(10);
console.log(`Week 10 phase: ${phase}`);
```

---

#### transfer-market.ts

**Purpose**: Manages player transfers, listings, and market valuation.

**Responsibilities**:
- Generate transfer listings for AI teams
- Calculate player market values
- Process buy/sell transactions
- Handle loan deals

**Public API**:
```typescript
interface ITransferMarket {
  generateTransferListings(teams: Team[], playerTeam: string, week: number): TransferListing[];
  buyPlayer(player: Player, cost: number, currentBudget: number, currentWage: number, wageLimit: number): { success: boolean; newBudget: number; error?: string };
  sellPlayer(player: Player, price: number, currentBudget: number, currentWage: number): { newBudget: number; newWage: number };
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { TransferMarket } from './module-keys';

const transferMarket = getModule(TransferMarket);
const listings = transferMarket.generateTransferListings(teams, 'Manchester United', 15);
const result = transferMarket.buyPlayer(player, 10000000, budget, currentWage, wageLimit);
```

---

#### finance-engine.ts

**Purpose**: Handles all financial calculations and transactions.

**Responsibilities**:
- Calculate weekly wage costs
- Process match attendance revenue
- Award prize money for league position
- Handle transfer budgets

**Public API**:
```typescript
interface IFinanceEngine {
  calculateWeeklyCosts(squad: Player[], staff: Staff[]): number;
  calculateMatchRevenue(attendance: number): number;
  processPrizeMoney(position: number): number;
  updateBudget(current: number, revenue: number, costs: number): number;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { FinanceEngine } from './module-keys';

const financeEngine = getModule(FinanceEngine);
const weeklyCost = financeEngine.calculateWeeklyCosts(squad, staff);
const revenue = financeEngine.calculateMatchRevenue(25000);
const newBudget = financeEngine.updateBudget(budget, revenue, weeklyCost);
```

---

#### player-development.ts

**Purpose**: Manages player growth and decline based on age and performance.

**Responsibilities**:
- Calculate player development changes
- Apply age-based growth curves
- Handle peak performance and decline
- Track development reports

**Public API**:
```typescript
interface IPlayerDevelopment {
  developPlayers(players: Player[], season: number): DevelopmentReport;
  calculatePotential(player: Player): number;
  isInPeakYears(age: number, position: string): boolean;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { PlayerDevelopment } from './module-keys';

const playerDevelopment = getModule(PlayerDevelopment);
const report = playerDevelopment.developPlayers(squad, season);
console.log(`${report.improved.length} players improved`);
```

---

#### contract-manager.ts

**Purpose**: Manages player contracts, renewals, and expirations.

**Responsibilities**:
- Process contract expiries
- Generate renewal offers
- Handle contract negotiations
- Convert expiring players to free agents

**Public API**:
```typescript
interface IContractManager {
  processExpiringContracts(players: Player[], currentWeek: number): { expired: Player[]; expiringSoon: Player[] };
  renewContract(player: Player, years: number, wages: number): PlayerContract;
  isContractExpiring(contract: PlayerContract, currentWeek: number): boolean;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { ContractManager } from './module-keys';

const contractManager = getModule(ContractManager);
const { expired, expiringSoon } = contractManager.processExpiringContracts(squad, 45);
const newContract = contractManager.renewContract(player, 3, 50000);
```

---

#### morale-manager.ts

**Purpose**: Calculates and manages player morale based on various factors.

**Responsibilities**:
- Calculate morale from playing time, results, wages
- Apply morale modifiers to performance
- Track morale trends

**Public API**:
```typescript
interface IMoraleManager {
  calculateMorale(player: Player, team: Team, recentResults: MatchResult[]): number;
  applyMoraleEffect(baseRating: number, morale: number): number;
  updateTeamMorale(players: Player[], results: MatchResult[]): Player[];
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { MoraleManager } from './module-keys';

const moraleManager = getModule(MoraleManager);
const morale = moraleManager.calculateMorale(player, team, recentResults);
const adjustedRating = moraleManager.applyMoraleEffect(85, morale);
```

---

#### injury-manager.ts

**Purpose**: Simulates player injuries and recovery.

**Responsibilities**:
- Process match injuries
- Calculate recovery times
- Update injury status weekly
- Handle injury-prone traits

**Public API**:
```typescript
interface IInjuryManager {
  processInjuries(match: MatchResult, homeSquad: Player[], awaySquad: Player[]): Injury[];
  updateInjuries(players: Player[]): Player[];
  isPlayerAvailable(player: Player): boolean;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { InjuryManager } from './module-keys';

const injuryManager = getModule(InjuryManager);
const injuries = injuryManager.processInjuries(matchResult, homeSquad, awaySquad);
const updatedSquad = injuryManager.updateInjuries(squad);
```

---

#### tactics-manager.ts

**Purpose**: Manages team tactics and their effects on match performance.

**Responsibilities**:
- Calculate tactical bonuses
- Handle formation strengths/weaknesses
- Apply tactical matchups

**Public API**:
```typescript
interface ITacticsManager {
  calculateTacticalBonus(formation: string, mentality: string): number;
  analyzeTacticalMatchup(homeFormation: string, awayFormation: string): { homeBonus: number; awayBonus: number };
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { TacticsManager } from './module-keys';

const tacticsManager = getModule(TacticsManager);
const bonus = tacticsManager.calculateTacticalBonus('4-4-2', 'attacking');
const matchup = tacticsManager.analyzeTacticalMatchup('4-3-3', '5-4-1');
```

---

#### youth-academy-manager.ts

**Purpose**: Generates and develops youth players.

**Responsibilities**:
- Generate youth prospects annually
- Promote youth to first team
- Manage youth development

**Public API**:
```typescript
interface IYouthAcademyManager {
  generateYouthProspects(teamName: string, count: number): Player[];
  promoteYouthPlayer(youth: Player, squad: Player[]): Player[];
}
```

**Dependencies**:
- `ITeamGenerator` - Generate youth players

**Example**:
```typescript
import { getModule } from './module-registry';
import { YouthAcademyManager } from './module-keys';

const youthManager = getModule(YouthAcademyManager);
const prospects = youthManager.generateYouthProspects('Manchester United', 3);
const newSquad = youthManager.promoteYouthPlayer(prospects[0], squad);
```

---

#### staff-manager.ts

**Purpose**: Manages coaching staff and their effects.

**Responsibilities**:
- Hire and fire staff
- Calculate staff bonuses
- Manage staff contracts

**Public API**:
```typescript
interface IStaffManager {
  hireStaff(type: string, level: string, budget: number): { staff: Staff; cost: number } | null;
  fireStaff(staff: Staff[]): Staff[];
  calculateStaffBonus(staff: Staff[], type: string): number;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { StaffManager } from './module-keys';

const staffManager = getModule(StaffManager);
const result = staffManager.hireStaff('coach', 'elite', budget);
const bonus = staffManager.calculateStaffBonus(staff, 'training');
```

---

#### board-manager.ts

**Purpose**: Manages board expectations and objectives.

**Responsibilities**:
- Set season objectives
- Evaluate performance against objectives
- Determine manager job security

**Public API**:
```typescript
interface IBoardManager {
  setObjectives(team: Team, previousSeason?: number): BoardObjective[];
  evaluatePerformance(position: number, objectives: BoardObjective[]): BoardEvaluation;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { BoardManager } from './module-keys';

const boardManager = getModule(BoardManager);
const objectives = boardManager.setObjectives(team);
const evaluation = boardManager.evaluatePerformance(5, objectives);
console.log(`Job security: ${evaluation.jobSecurity}`);
```

---

#### news-engine.ts

**Purpose**: Generates news articles for all game events.

**Responsibilities**:
- Generate match news
- Generate transfer news
- Generate injury/contract/achievement news
- Create season start/end news

**Public API**:
```typescript
interface INewsEngine {
  generateMatchNews(results: MatchResult[], playerTeamName: string, leagueTable: LeagueTable[], week: number, season: number): NewsArticle[];
  generateTransferNews(transfer: TransferListing, type: 'buy' | 'sell', week: number, season: number): NewsArticle;
  generateInjuryNews(player: Player, injury: Injury, teamName: string, week: number, season: number): NewsArticle;
  generateContractNews(player: Player, type: 'renewal' | 'signing', teamName: string, week: number, season: number): NewsArticle;
  generateAchievementNews(achievement: Achievement, week: number, season: number): NewsArticle;
  generateSeasonNews(type: 'start' | 'end', season: number, data?: any): NewsArticle;
  generateRandomNews(week: number, season: number): NewsArticle[];
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { NewsEngine } from './module-keys';

const newsEngine = getModule(NewsEngine);
const matchNews = newsEngine.generateMatchNews(results, 'Manchester United', table, 10, 1);
const transferNews = newsEngine.generateTransferNews(listing, 'buy', 15, 1);
```

---

#### match-commentary.ts

**Purpose**: Generates real-time match commentary.

**Responsibilities**:
- Generate event-by-event commentary
- Create half-time and full-time summaries
- Build match narrative

**Public API**:
```typescript
interface IMatchCommentary {
  generateEventCommentary(event: MatchEvent, matchState: MatchState): string;
  generateHalfTimeCommentary(homeScore: number, awayScore: number, homeTeam: string, awayTeam: string): string;
  generateFullTimeCommentary(result: MatchResult): string;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { MatchCommentary } from './module-keys';

const commentary = getModule(MatchCommentary);
const eventText = commentary.generateEventCommentary(goalEvent, matchState);
const halfTime = commentary.generateHalfTimeCommentary(1, 0, 'Arsenal', 'Chelsea');
```

---

#### match-story-generator.ts

**Purpose**: Generates pre-match and post-match story content.

**Responsibilities**:
- Create match previews
- Generate post-match analysis
- Build match stories with weather and context

**Public API**:
```typescript
interface IMatchStoryGenerator {
  generateMatchPreview(homeTeam: Team, awayTeam: Team, week: number): MatchPreview;
  generatePostMatchAnalysis(result: MatchResult): PostMatchAnalysis;
}
```

**Dependencies**:
- `IWeatherGenerator` - Weather conditions
- `IMatchCommentary` - Commentary integration

**Example**:
```typescript
import { getModule } from './module-registry';
import { MatchStoryGenerator } from './module-keys';

const storyGenerator = getModule(MatchStoryGenerator);
const preview = storyGenerator.generateMatchPreview(homeTeam, awayTeam, 10);
const analysis = storyGenerator.generatePostMatchAnalysis(result);
```

---

#### league-table-manager.ts

**Purpose**: Manages league table calculations and standings.

**Responsibilities**:
- Update table after matches
- Calculate points, goal difference
- Sort teams by league position
- Handle tiebreakers

**Public API**:
```typescript
interface ILeagueTableManager {
  updateTable(table: LeagueTable[], results: MatchResult[]): LeagueTable[];
  sortTable(table: LeagueTable[]): LeagueTable[];
  getTeamPosition(table: LeagueTable[], teamName: string): number;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { LeagueTableManager } from './module-keys';

const tableManager = getModule(LeagueTableManager);
const updatedTable = tableManager.updateTable(table, weekResults);
const position = tableManager.getTeamPosition(updatedTable, 'Manchester United');
```

---

#### cup-manager.ts

**Purpose**: Manages cup competitions and knockout tournaments.

**Responsibilities**:
- Generate cup fixtures
- Handle knockout rounds
- Manage cup progression

**Public API**:
```typescript
interface ICupManager {
  generateCupFixtures(teams: Team[], round: number): CupFixture[];
  processKnockoutRound(fixtures: CupFixture[], results: CupResult[]): CupFixture[];
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { CupManager } from './module-keys';

const cupManager = getModule(CupManager);
const fixtures = cupManager.generateCupFixtures(teams, 1);
const nextRound = cupManager.processKnockoutRound(fixtures, results);
```

---

#### player-stats-tracker.ts

**Purpose**: Tracks player statistics across seasons.

**Responsibilities**:
- Record goals, assists, appearances
- Calculate averages and totals
- Track career statistics

**Public API**:
```typescript
interface IPlayerStatsTracker {
  recordMatch(player: Player, stats: MatchStats): Player;
  updateSeasonStats(players: Player[]): Player[];
  getCareerStats(player: Player): CareerStats;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { PlayerStatsTracker } from './module-keys';

const statsTracker = getModule(PlayerStatsTracker);
const updatedPlayer = statsTracker.recordMatch(player, matchStats);
const career = statsTracker.getCareerStats(player);
```

---

#### records-manager.ts

**Purpose**: Manages club and player records.

**Responsibilities**:
- Track season records (most goals, clean sheets)
- Track club records (highest finish, biggest win)
- Update records after significant events

**Public API**:
```typescript
interface IRecordsManager {
  updateRecords(current: ClubRecords, event: RecordEvent): ClubRecords;
  checkNewRecord(current: ClubRecords, candidate: RecordCandidate): boolean;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { RecordsManager } from './module-keys';

const recordsManager = getModule(RecordsManager);
const updated = recordsManager.updateRecords(records, event);
const isNewRecord = recordsManager.checkNewRecord(records, candidate);
```

---

#### achievement-manager.ts

**Purpose**: Manages achievement unlocking and tracking.

**Responsibilities**:
- Check achievement conditions
- Unlock achievements
- Track achievement progress

**Public API**:
```typescript
interface IAchievementManager {
  checkAchievements(gameState: GameState): Achievement[];
  unlockAchievement(id: string, type: string): Achievement;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { AchievementManager } from './module-keys';

const achievementManager = getModule(AchievementManager);
const newAchievements = achievementManager.checkAchievements(gameState);
const achievement = achievementManager.unlockAchievement('first_trophy', 'trophy');
```

---

#### ai-contract-manager.ts

**Purpose**: Manages contract decisions for AI-controlled teams.

**Responsibilities**:
- Generate contract renewal offers for AI teams
- Decide which players to keep/release
- Simulate AI contract negotiations

**Public API**:
```typescript
interface IAIContractManager {
  processAIContracts(team: Team, week: number): { renewals: Player[]; releases: Player[] };
  shouldRenew(player: Player, team: Team): boolean;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { AIContractManager } from './module-keys';

const aiContractManager = getModule(AIContractManager);
const decisions = aiContractManager.processAIContracts(aiTeam, 45);
console.log(`${decisions.renewals.length} renewals, ${decisions.releases.length} releases`);
```

---

#### weather-generator.ts

**Purpose**: Generates weather conditions for matches.

**Responsibilities**:
- Generate random weather
- Apply seasonal patterns
- Calculate weather effects on performance

**Public API**:
```typescript
interface IWeatherGenerator {
  generateWeather(week: number): MatchWeather;
  getWeatherEffect(weather: MatchWeather): number;
}
```

**Dependencies**: None (Layer 1 module)

**Example**:
```typescript
import { getModule } from './module-registry';
import { WeatherGenerator } from './module-keys';

const weatherGen = getModule(WeatherGenerator);
const weather = weatherGen.generateWeather(15);
const effect = weatherGen.getWeatherEffect(weather);
console.log(`Weather: ${weather.condition}, Effect: ${effect}`);
```

---

#### team-generator.ts

**Purpose**: Generates teams and players with realistic attributes.

**Responsibilities**:
- Generate league teams
- Create players with varied skills
- Assign realistic names and attributes

**Public API**:
```typescript
interface ITeamGenerator {
  generateTeams(count: number, league: string): Team[];
  generatePlayer(teamName: string, position: string, skill: number): Player;
}
```

**Dependencies**:
- `IPlayerStatsTracker` - Initialize player stats
- `IStaffManager` - Generate staff

**Example**:
```typescript
import { getModule } from './module-registry';
import { TeamGenerator } from './module-keys';

const teamGenerator = getModule(TeamGenerator);
const teams = teamGenerator.generateTeams(20, 'Premier League');
const player = teamGenerator.generatePlayer('Arsenal', 'ST', 85);
```

---

### Utility Modules

#### types.ts

Defines all TypeScript types and interfaces used throughout the engine.

#### type-guards.ts

Runtime type checking functions for validating game state data.

#### game-state-versions.ts

Manages save game versioning and schema evolution.

#### migration.ts

Utilities for migrating save data between versions.

#### module-registry.ts

Central registry for managing module instances (singleton pattern).

#### module-keys.ts

Constants for module registry keys.

#### setup-modules.ts

Initializes all modules with proper dependency injection.

---

## Usage Guide

### Getting Started

```typescript
// 1. Initialize the engine (typically done at app startup)
import { initializeEngine } from '@/libs/football-director-engine';

initializeEngine();

// 2. Access modules from the registry
import { getModule } from '@/libs/football-director-engine/module-registry';
import { MatchSimulator, SeasonManager, TransferMarket } from '@/libs/football-director-engine/module-keys';

const matchSim = getModule(MatchSimulator);
const seasonMgr = getModule(SeasonManager);
const transfers = getModule(TransferMarket);

// 3. Use the modules
const fixtures = seasonMgr.generateFixtures(teams);
const result = matchSim.simulateMatch(homeTeam, awayTeam, 10);
const listings = transfers.generateTransferListings(teams, 'Manchester United', 15);
```

### Testing Modules

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createMockMatchSimulator } from './factories/match-simulator.factory';
import { IInjuryManager } from './interfaces/injury-manager.interface';

describe('MatchSimulator', () => {
  it('should simulate a match', () => {
    // Create a mock injury manager
    const mockInjuryManager: IInjuryManager = {
      processInjuries: vi.fn().mockReturnValue([]),
      updateInjuries: vi.fn().mockReturnValue([]),
      isPlayerAvailable: vi.fn().mockReturnValue(true)
    };

    // Create simulator with mock dependencies
    const simulator = createMockMatchSimulator({
      injuryManager: mockInjuryManager
    });

    // Test the module
    const result = simulator.simulateMatch(homeTeam, awayTeam, 10);

    expect(result).toBeDefined();
    expect(result.homeScore).toBeGreaterThanOrEqual(0);
    expect(mockInjuryManager.processInjuries).toHaveBeenCalled();
  });
});
```

### Extending Modules

To add a new module:

1. **Define the interface** in `interfaces/new-module.interface.ts`:
```typescript
export interface INewModule {
  doSomething(param: string): Result;
}
```

2. **Implement the module** in `new-module.ts`:
```typescript
import { INewModule } from './interfaces/new-module.interface';

export class NewModule implements INewModule {
  constructor(
    private dependency: IDependency
  ) {}

  doSomething(param: string): Result {
    // Implementation
  }
}
```

3. **Create a factory** in `factories/new-module.factory.ts`:
```typescript
import { NewModule } from '../new-module';
import { INewModule } from '../interfaces/new-module.interface';

export function createNewModule(): INewModule {
  return new NewModule(
    createDependency()
  );
}

export function createMockNewModule(overrides?: {
  dependency?: IDependency;
}): INewModule {
  return new NewModule(
    overrides?.dependency ?? createMockDependency()
  );
}
```

4. **Register the module** in `module-keys.ts` and `setup-modules.ts`

5. **Write tests** in `__tests__/new-module.spec.ts`

---

## Best Practices

### Module Design

1. **Single Responsibility**: Each module should do one thing well
2. **Explicit Dependencies**: Always inject dependencies, never hardcode
3. **Interface First**: Define interfaces before implementations
4. **Pure Functions**: Prefer pure functions over stateful methods
5. **Immutability**: Return new objects instead of mutating inputs

### Testing

1. **Use Mocks**: Inject mock dependencies to test in isolation
2. **Arrange-Act-Assert**: Follow AAA pattern in tests
3. **Deterministic**: Tests should never rely on randomness or timing
4. **Coverage**: Aim for >80% code coverage
5. **Fast**: Unit tests should run in milliseconds

### Performance

1. **Singleton Pattern**: Use module registry to avoid repeated instantiation
2. **Lazy Loading**: Only create modules when needed
3. **Caching**: Cache expensive calculations when possible
4. **Profiling**: Use performance profiling to identify bottlenecks

---

## Troubleshooting

### Common Issues

**Module Not Found**:
```
Error: Module not registered: MatchSimulator
```
**Solution**: Ensure `initializeEngine()` is called before accessing modules.

**Circular Dependency**:
```
Error: Circular dependency detected
```
**Solution**: Review module dependency graph. Modules should only depend on modules in lower layers.

**Type Errors**:
```
Error: Property 'x' does not exist on type 'Y'
```
**Solution**: Check that interfaces match implementations. Run TypeScript compiler to see all type errors.

---

## Contributing

See the [Contribution Guide](../../../../docs/football-director/engine-contribution-guide.md) for information on:
- Code style and standards
- Pull request process
- Testing requirements
- Documentation requirements

---

## Additional Resources

- [Module Interfaces Documentation](./interfaces/README.md)
- [Architecture Overview](../../../../docs/football-director/architecture.md)
- [Migration Guide](../../../../docs/football-director/engine-migration-guide.md)
- [Testing Guide](../../../../docs/football-director/testing-guide.md)
- [Coding Standards](../../../../docs/football-director/coding-standards.md)

---

## License

Copyright (c) 2026 Football Director. All rights reserved.
