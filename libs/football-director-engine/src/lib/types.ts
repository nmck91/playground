/**
 * Football Director Engine - Core Types
 */

export interface PlayerStats {
  // Current season stats
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number; // GK only
  yellowCards: number;
  redCards: number;
  // Career stats (all seasons)
  careerAppearances: number;
  careerGoals: number;
  careerAssists: number;
  careerCleanSheets: number;
}

export interface PlayerHistoryRecord {
  season: number;
  teamName: string;
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  transferType?: 'signed' | 'sold' | 'developed';
  transferFee?: number;
}

export interface Injury {
  type: 'minor' | 'moderate' | 'serious';
  description: string;
  weeksRemaining: number;
  sustainedInWeek: number;
}

export interface PlayerContract {
  weeklyWage: number;        // Matches Player.wages for compatibility
  startYear: number;         // Season when contract started
  startWeek: number;         // Week when signed
  expiryYear: number;        // Season when contract expires
  expiryWeek: number;        // Week of expiry (typically 52)
  yearsRemaining: number;    // Calculated field
  weeksRemaining: number;    // Calculated field
  status: ContractStatus;    // Calculated based on weeks remaining
}

export type ContractStatus =
  | 'active'          // >26 weeks remaining
  | 'expiring-soon'   // 13-26 weeks
  | 'expiring'        // 1-12 weeks
  | 'expired';        // 0 weeks

export interface FreeAgent {
  player: Player;
  becameFreeWeek: number;
  previousTeamId: string;
  previousTeamName: string;
}

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  skill: number; // 1-20 scale
  age: number;
  wages: number;
  stats: PlayerStats;
  history: PlayerHistoryRecord[];
  injury?: Injury; // Current injury status
  suspendedUntil?: number; // Week number when suspension ends
  contract?: PlayerContract; // Contract details (optional for migration)
  morale?: number; // Player happiness (0-100, optional for migration)
}

export type StaffRole = 'manager' | 'coach' | 'scout';

export type ClubPhilosophy =
  | 'attacking'       // High-risk, high-reward, lots of goals
  | 'possession'      // Control the ball, patient buildup
  | 'defensive'       // Solid at the back, counter-attack
  | 'balanced'        // Well-rounded approach
  | 'direct'          // Long balls, physical play
  | 'counter-attack'; // Sit deep, hit on the break

export type ManagerStyle =
  | 'attacking'       // Prefers offensive formations (4-3-3, 3-4-3)
  | 'possession'      // Prefers ball control (4-5-1, 3-5-2)
  | 'defensive'       // Prefers solid defense (5-3-2, 4-4-2 defensive)
  | 'balanced'        // Adapts to situation (4-4-2, 4-3-3)
  | 'direct'          // Long ball tactics
  | 'counter-attack'; // Defensive with pace on break

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  skill: number; // 1-20 scale (affects their effectiveness)
  salary: number; // Weekly wage
  specialty?: string; // e.g., "Youth Development", "South America", "Tactics"
  // Manager-specific fields
  style?: ManagerStyle; // Only for managers - their tactical philosophy
  happiness?: number; // Only for managers - 0-100 scale
}

export type FormationType =
  | '4-4-2'
  | '4-3-3'
  | '3-5-2'
  | '4-5-1'
  | '3-4-3'
  | '5-3-2';

export type Mentality = 'defensive' | 'balanced' | 'attacking';

export interface Tactics {
  formation: FormationType;
  mentality: Mentality;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  staff: Staff[]; // Manager, coaches, scouts
  budget: number;
  tactics?: Tactics; // Team's tactical setup
  philosophy?: ClubPhilosophy; // Club's playing philosophy (set by director)
}

export interface Match {
  homeTeam: Team;
  awayTeam: Team;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow-card' | 'red-card' | 'penalty' | 'own-goal' | 'big-chance' | 'save' | 'shot-on-target' | 'shot-off-target' | 'block' | 'near-miss';
  team: 'home' | 'away';
  playerName: string;
  playerId?: string; // For linking to Player
  assistPlayerName?: string;
  assistPlayerId?: string;
  description: string;
}

// Match Day Atmosphere: Weather conditions
export interface MatchWeather {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';
  temperature: number; // Celsius
  description: string; // e.g., "Perfect conditions", "Heavy rain"
}

// Match Day Atmosphere: Match statistics
export interface MatchStats {
  possession: { home: number; away: number }; // Percentage
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
}

// Match Day Atmosphere: Player performance rating
export interface PlayerRating {
  playerId: string;
  playerName: string;
  position: string;
  rating: number; // 1-10 scale
  team: 'home' | 'away';
  goals?: number;
  assists?: number;
}

// Match Day Atmosphere: Man of the match award
export interface ManOfMatch {
  playerId: string;
  playerName: string;
  team: 'home' | 'away';
  rating: number;
  reason: string; // e.g., "2 goals and an assist"
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  result: 'home' | 'away' | 'draw';
  homeGoalScorers?: string[]; // Player names who scored for home team
  awayGoalScorers?: string[]; // Player names who scored for away team
  events?: MatchEvent[]; // Key match events
  attendance?: number;
  // Match Day Atmosphere enhancements (optional for backward compatibility)
  weather?: MatchWeather;
  stats?: MatchStats;
  playerRatings?: PlayerRating[];
  manOfMatch?: ManOfMatch;
  isDerby?: boolean;
  postMatchAnalysis?: PostMatchAnalysis;
}

// Match Day Atmosphere: Pre-Match Preview Types

// Head-to-head history between two teams
export interface HeadToHead {
  homeWins: number;
  awayWins: number;
  draws: number;
  lastFiveMeetings: Array<{
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    week: number;
    season: number;
  }>;
}

// Team news before a match
export interface TeamNews {
  injuries: Array<{ playerName: string; returnWeek: number }>;
  suspensions: Array<{ playerName: string; returnWeek: number }>;
  keyPlayers: Array<{ playerName: string; form: string; goals: number }>;
  recentForm: ('W' | 'D' | 'L')[];
}

// Pre-match preview data
export interface MatchPreview {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  week: number;
  homePosition: number;
  awayPosition: number;
  headToHead: HeadToHead;
  homeTeamNews: TeamNews;
  awayTeamNews: TeamNews;
  expectedAttendance: number;
  weather: MatchWeather;
  isDerby: boolean;
  matchImportance: 'low' | 'medium' | 'high';
  managerQuotes?: {
    home: string;
    away: string;
  };
}

// Post-match content types
export interface ManagerQuote {
  managerName: string;
  teamName: string;
  quote: string;
  sentiment: 'happy' | 'neutral' | 'frustrated';
}

export interface PlayerInterview {
  playerId: string;
  playerName: string;
  teamName: string;
  quote: string;
  rating: number;
}

export interface PostMatchAnalysis {
  homeManagerQuote: ManagerQuote;
  awayManagerQuote: ManagerQuote;
  playerInterview?: PlayerInterview;
  turningPoint?: string;
  keyStats: string[];
}

export interface LeagueTable {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export type SeasonPhase = 'pre-season' | 'competitive' | 'off-season';

export type TransferWindowStatus = 'open' | 'closed';

export interface Season {
  year: number;
  currentWeek: number; // 1-52
  totalWeeks: number; // 52 (7 pre-season + 38 competitive + 7 off-season)
  competitiveWeeks: number; // 38
  preSeasonWeeks: number; // 7
  status: 'in-progress' | 'completed';
  phase: SeasonPhase; // pre-season (1-7), competitive (8-45), off-season (46-52)
  transferWindow: TransferWindowStatus; // Pre-season: weeks 1-8, Winter: weeks 28-32
}

export type MatchType = 'friendly' | 'competitive';

export interface Fixture {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
  matchType: MatchType; // friendly (weeks 4-6) or competitive (weeks 8-45)
  result?: MatchResult;
}

export interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  category: 'wages' | 'prize-money' | 'ticket-sales' | 'transfers' | 'other';
  amount: number;
  description: string;
  weekNumber: number;
}

export interface TeamFinances {
  budget: number;
  weeklyIncome: number;
  weeklyExpenses: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: FinancialRecord[];
}

export interface TransferListing {
  id: string;
  player: Player;
  sellingTeamId: string;
  sellingTeamName: string;
  askingPrice: number;
  listedWeek: number;
}

export interface BoardObjective {
  id: string;
  season: number;
  type: 'league-position' | 'points' | 'avoid-relegation';
  target: number; // e.g., position 10 or 40 points
  description: string;
  status: 'pending' | 'on-track' | 'at-risk' | 'failed' | 'achieved';
}

export interface BoardStatus {
  satisfaction: number; // 0-100
  jobSecurity: 'safe' | 'under-pressure' | 'critical';
  currentObjective: BoardObjective | null;
  objectiveHistory: BoardObjective[];
}

export interface SeasonTopPerformers {
  topScorer: { player: Player; goals: number } | null;
  topAssists: { player: Player; assists: number } | null;
  mostAppearances: { player: Player; appearances: number } | null;
  cleanSheetKing: { player: Player; cleanSheets: number } | null; // GK
}

export interface GameState {
  id: string;
  createdAt: Date;
  lastSaved: Date;
  playerTeam: Team; // User's team
  aiTeams: Team[]; // AI teams
  season: Season;
  fixtures: Fixture[];
  leagueTable: LeagueTable[];
  finances: TeamFinances;
  matchHistory: MatchResult[];
  transferMarket: TransferListing[]; // Available players for transfer
  staffMarket: Staff[]; // Available staff for hire
  freeAgents: FreeAgent[]; // Players whose contracts have expired
  boardStatus: BoardStatus; // Board objectives and job security
  seasonRecords: SeasonRecords[]; // Historical season records
  clubRecords: ClubRecords; // All-time club records
  achievements: Achievement[]; // Unlockable achievements
  seasonAwards: SeasonAward[]; // Season-by-season awards
  newsFeed: NewsArticle[]; // News articles (ordered by date DESC)
  matchPreviews?: MatchPreview[]; // Pre-match previews for upcoming fixtures (optional for migration)
}

export interface SaveMetadata {
  slotId: number; // 1-5
  saveName: string; // User-provided name for the save
  teamName: string;
  season: number;
  week: number;
  position: number;
  lastSaved: Date;
  createdAt: Date;
}

export interface SaveSlot {
  metadata: SaveMetadata;
  gameState: GameState;
}

export interface SeasonRecords {
  season: number;
  finalPosition: number;
  points: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  biggestWin?: {
    opponent: string;
    score: string; // e.g., "5-0"
    homeOrAway: 'home' | 'away';
    week: number;
  };
  biggestLoss?: {
    opponent: string;
    score: string; // e.g., "0-4"
    homeOrAway: 'home' | 'away';
    week: number;
  };
  longestWinStreak: number;
  longestUnbeatenStreak: number;
  topScorer?: {
    playerId: string;
    playerName: string;
    goals: number;
  };
  topAssists?: {
    playerId: string;
    playerName: string;
    assists: number;
  };
  cleanSheets: number;
}

export interface ClubRecords {
  bestLeaguePosition: {
    position: number;
    season: number;
  };
  mostPoints: {
    points: number;
    season: number;
  };
  mostWins: {
    wins: number;
    season: number;
  };
  mostGoalsScored: {
    goals: number;
    season: number;
  };
  fewestGoalsConceded: {
    goals: number;
    season: number;
  };
  bestGoalDifference: {
    difference: number;
    season: number;
  };
  biggestWin: {
    opponent: string;
    score: string;
    homeOrAway: 'home' | 'away';
    week: number;
    season: number;
  };
  longestWinStreak: {
    streak: number;
    season: number;
  };
  longestUnbeatenStreak: {
    streak: number;
    season: number;
  };
  mostGoalsSingleSeason: {
    playerId: string;
    playerName: string;
    goals: number;
    season: number;
  };
  mostAssistsSingleSeason: {
    playerId: string;
    playerName: string;
    assists: number;
    season: number;
  };
  mostCleanSheetsSeason: {
    cleanSheets: number;
    season: number;
  };
}

export type AchievementCategory =
  | 'league'
  | 'goals'
  | 'defense'
  | 'finance'
  | 'players'
  | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // Emoji or icon identifier
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // Current progress (e.g., 75 out of 100)
  target?: number; // Target for completion (e.g., 100)
}

export interface SeasonAward {
  season: number;
  awards: {
    playerOfYear?: {
      playerId: string;
      playerName: string;
      reason: string;
    };
    goldenBoot?: {
      playerId: string;
      playerName: string;
      goals: number;
    };
    goldenGlove?: {
      playerId: string;
      playerName: string;
      cleanSheets: number;
    };
    youngPlayerOfYear?: {
      playerId: string;
      playerName: string;
      age: number;
      reason: string;
    };
  };
}

export type NewsArticleType = 'transfer' | 'result' | 'milestone' | 'board' | 'standings' | 'development' | 'general';

export type NewsImportance = 'low' | 'medium' | 'high';

export interface NewsArticle {
  id: string;
  date: Date;
  week: number;
  season: number;
  type: NewsArticleType;
  headline: string;
  body: string;
  teams?: string[]; // Team names involved
  players?: string[]; // Player names involved
  importance: NewsImportance;
  read: boolean;
}
