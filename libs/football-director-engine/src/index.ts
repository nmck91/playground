export * from './lib/types';
// Discriminated unions for versioning (Epic 1.5.3) - explicit exports to avoid GameState conflict
export {
  CURRENT_GAME_STATE_VERSION,
  isGameStateV1,
  isGameStateV2,
  getGameStateVersion,
  assertCurrentVersion
} from './lib/game-state-versions';
export type { GameStateV1, GameStateV2 } from './lib/game-state-versions';
export * from './lib/type-guards'; // Runtime validation and type guards (Epic 1.5.4)
export * from './lib/migration'; // Save file migration utilities (Epic 1.5)

// Module Factories and DI System (Story 1.4.4)
// Note: Interfaces are available via './lib/interfaces' for DI, but not exported here to avoid conflicts
// Each module already re-exports its interface for convenience
export * from './lib/factories';
export * from './lib/module-registry';
export * from './lib/module-keys';
export * from './lib/setup-modules';

export * from './lib/match-simulator';
export * from './lib/match-commentary';
export * from './lib/league-table-manager';
export * from './lib/finance-engine';
export * from './lib/season-manager';
export * from './lib/cup-manager';
export * from './lib/team-generator';
export * from './lib/transfer-market';
export * from './lib/player-development';
export * from './lib/board-manager';
export * from './lib/player-stats-tracker';
export * from './lib/records-manager';
export * from './lib/achievement-manager';
export * from './lib/news-engine'; // Unified news engine (Story 1.4.2)
export * from './lib/staff-manager';
export * from './lib/tactics-manager';
export * from './lib/injury-manager';
export * from './lib/contract-manager';
export * from './lib/ai-contract-manager';
export * from './lib/youth-academy-manager';
export * from './lib/morale-manager';
export * from './lib/weather-generator';
export * from './lib/match-story-generator'; // Unified match story module (Story 1.4.3)
