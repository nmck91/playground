/**
 * Football Director Engine - Core Types
 */

export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  skill: number; // 1-20 scale
  age: number;
  wages: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  budget: number;
}

export interface Match {
  homeTeam: Team;
  awayTeam: Team;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow-card' | 'red-card' | 'penalty' | 'own-goal';
  team: 'home' | 'away';
  playerName: string;
  description: string;
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

export interface Season {
  year: number;
  currentWeek: number; // 1-38
  totalWeeks: number; // 38
  status: 'in-progress' | 'completed';
}

export interface Fixture {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
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
  boardStatus: BoardStatus; // Board objectives and job security
}
