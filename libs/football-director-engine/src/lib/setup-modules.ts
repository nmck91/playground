/**
 * Football Director Engine - Module Setup
 *
 * Convenience functions for registering all engine modules with the registry.
 * Story 1.4.4 - AC 4: Module Registration System
 */

import { ModuleRegistry, globalRegistry } from './module-registry';
import { ModuleKeys } from './module-keys';

// Import all factory functions
import { createMatchSimulator } from './factories/match-simulator.factory';
import { createSeasonManager } from './factories/season-manager.factory';
import { createTeamGenerator } from './factories/team-generator.factory';
import { createPlayerDevelopment } from './factories/player-development.factory';
import { createPlayerStatsTracker } from './factories/player-stats-tracker.factory';
import { createMoraleManager } from './factories/morale-manager.factory';
import { createYouthAcademyManager } from './factories/youth-academy-manager.factory';
import { createLeagueTableManager } from './factories/league-table-manager.factory';
import { createTacticsManager } from './factories/tactics-manager.factory';
import { createWeatherGenerator } from './factories/weather-generator.factory';
import { createMatchStoryGenerator } from './factories/match-story-generator.factory';
import { createMatchCommentary } from './factories/match-commentary.factory';
import { createNewsEngine } from './factories/news-engine.factory';
import { createTransferMarket } from './factories/transfer-market.factory';
import { createFinanceEngine } from './factories/finance-engine.factory';
import { createStaffManager } from './factories/staff-manager.factory';
import { createRecordsManager } from './factories/records-manager.factory';
import { createAchievementManager } from './factories/achievement-manager.factory';
import { createCupManager } from './factories/cup-manager.factory';
import { createBoardManager } from './factories/board-manager.factory';
import { createContractManager } from './factories/contract-manager.factory';
import { createAIContractManager } from './factories/ai-contract-manager.factory';
import { createInjuryManager } from './factories/injury-manager.factory';

/**
 * Register all engine modules with a registry
 *
 * @param registry - The module registry to register with (defaults to global registry)
 * @param options - Configuration options
 * @param options.singleton - Whether to register modules as singletons (default: true)
 */
export function registerAllModules(
  registry: ModuleRegistry = globalRegistry,
  options: { singleton: boolean } = { singleton: true }
): void {
  // Core Engine Modules
  registry.register(ModuleKeys.MATCH_SIMULATOR, createMatchSimulator, options);
  registry.register(ModuleKeys.SEASON_MANAGER, createSeasonManager, options);
  registry.register(ModuleKeys.TEAM_GENERATOR, createTeamGenerator, options);

  // Player & Team Management
  registry.register(ModuleKeys.PLAYER_DEVELOPMENT, createPlayerDevelopment, options);
  registry.register(ModuleKeys.PLAYER_STATS_TRACKER, createPlayerStatsTracker, options);
  registry.register(ModuleKeys.MORALE_MANAGER, createMoraleManager, options);
  registry.register(ModuleKeys.YOUTH_ACADEMY_MANAGER, createYouthAcademyManager, options);

  // Match & Competition
  registry.register(ModuleKeys.LEAGUE_TABLE_MANAGER, createLeagueTableManager, options);
  registry.register(ModuleKeys.CUP_MANAGER, createCupManager, options);
  registry.register(ModuleKeys.TACTICS_MANAGER, createTacticsManager, options);
  registry.register(ModuleKeys.WEATHER_GENERATOR, createWeatherGenerator, options);

  // Content Generation
  registry.register(ModuleKeys.MATCH_STORY_GENERATOR, createMatchStoryGenerator, options);
  registry.register(ModuleKeys.MATCH_COMMENTARY, createMatchCommentary, options);
  registry.register(ModuleKeys.NEWS_ENGINE, createNewsEngine, options);

  // Financial & Business
  registry.register(ModuleKeys.TRANSFER_MARKET, createTransferMarket, options);
  registry.register(ModuleKeys.FINANCE_ENGINE, createFinanceEngine, options);
  registry.register(ModuleKeys.STAFF_MANAGER, createStaffManager, options);
  registry.register(ModuleKeys.CONTRACT_MANAGER, createContractManager, options);
  registry.register(ModuleKeys.AI_CONTRACT_MANAGER, createAIContractManager, options);

  // Records & Achievements
  registry.register(ModuleKeys.RECORDS_MANAGER, createRecordsManager, options);
  registry.register(ModuleKeys.ACHIEVEMENT_MANAGER, createAchievementManager, options);

  // Other Systems
  registry.register(ModuleKeys.BOARD_MANAGER, createBoardManager, options);
  registry.register(ModuleKeys.INJURY_MANAGER, createInjuryManager, options);
}

/**
 * Register core engine modules (minimal set for basic functionality)
 *
 * @param registry - The module registry to register with (defaults to global registry)
 */
export function registerCoreModules(registry: ModuleRegistry = globalRegistry): void {
  registry.register(ModuleKeys.MATCH_SIMULATOR, createMatchSimulator);
  registry.register(ModuleKeys.SEASON_MANAGER, createSeasonManager);
  registry.register(ModuleKeys.TEAM_GENERATOR, createTeamGenerator);
  registry.register(ModuleKeys.LEAGUE_TABLE_MANAGER, createLeagueTableManager);
}

// Track if engine has been initialized
let engineInitialized = false;

/**
 * Initialize the global registry with all modules
 * Call this at application startup
 * This function is idempotent - safe to call multiple times
 */
export function initializeEngine(): void {
  if (engineInitialized) {
    return; // Already initialized, skip
  }

  registerAllModules(globalRegistry);
  engineInitialized = true;
}

/**
 * Check if the engine has been initialized
 */
export function isEngineInitialized(): boolean {
  return engineInitialized;
}

/**
 * Force re-initialization (useful for testing)
 */
export function resetEngine(): void {
  engineInitialized = false;
}
