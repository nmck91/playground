/**
 * Football Director Engine - Module Keys
 *
 * Centralized module key definitions for type-safe module registry access.
 * Story 1.4.4 - AC 4: Module Registration System
 */

/**
 * Module Keys
 * Constant strings for accessing modules from the registry
 */
export const ModuleKeys = {
  // Core Engine Modules
  MATCH_SIMULATOR: 'matchSimulator',
  SEASON_MANAGER: 'seasonManager',
  TEAM_GENERATOR: 'teamGenerator',

  // Player & Team Management
  PLAYER_DEVELOPMENT: 'playerDevelopment',
  PLAYER_STATS_TRACKER: 'playerStatsTracker',
  MORALE_MANAGER: 'moraleManager',
  YOUTH_ACADEMY_MANAGER: 'youthAcademyManager',

  // Match & Competition
  LEAGUE_TABLE_MANAGER: 'leagueTableManager',
  CUP_MANAGER: 'cupManager',
  TACTICS_MANAGER: 'tacticsManager',
  WEATHER_GENERATOR: 'weatherGenerator',

  // Content Generation
  MATCH_STORY_GENERATOR: 'matchStoryGenerator',
  MATCH_COMMENTARY: 'matchCommentary',
  NEWS_ENGINE: 'newsEngine',

  // Financial & Business
  TRANSFER_MARKET: 'transferMarket',
  FINANCE_ENGINE: 'financeEngine',
  STAFF_MANAGER: 'staffManager',
  CONTRACT_MANAGER: 'contractManager',
  AI_CONTRACT_MANAGER: 'aiContractManager',

  // Records & Achievements
  RECORDS_MANAGER: 'recordsManager',
  ACHIEVEMENT_MANAGER: 'achievementManager',

  // Other Systems
  BOARD_MANAGER: 'boardManager',
  INJURY_MANAGER: 'injuryManager',
} as const;

/**
 * Module Key Type
 * Union of all valid module keys
 */
export type ModuleKey = (typeof ModuleKeys)[keyof typeof ModuleKeys];
