/**
 * Engine Module Factories
 *
 * This file exports factory functions for creating module instances.
 * Factories enable dependency injection and make testing easier.
 *
 * Each module has two factory functions:
 * - create<ModuleName>(): Creates production instance
 * - createMock<ModuleName>(): Creates test/mock instance
 */

// Core Generators
export * from './weather-generator.factory';
export * from './team-generator.factory';

// Match Simulation & Commentary
export * from './match-simulator.factory';
export * from './match-commentary.factory';
export * from './match-story-generator.factory';

// Season & League Management
export * from './season-manager.factory';
export * from './league-table-manager.factory';
export * from './cup-manager.factory';

// Player Management
export * from './player-stats-tracker.factory';
export * from './player-development.factory';
export * from './contract-manager.factory';
export * from './ai-contract-manager.factory';
export * from './morale-manager.factory';
export * from './injury-manager.factory';

// Team Management
export * from './tactics-manager.factory';
export * from './staff-manager.factory';
export * from './board-manager.factory';
export * from './records-manager.factory';

// Transfer System
export * from './transfer-market.factory';
export * from './youth-academy-manager.factory';

// Finance & Achievements
export * from './finance-engine.factory';
export * from './achievement-manager.factory';

// News & Content
export * from './news-engine.factory';
