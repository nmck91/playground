/**
 * Achievement Manager Factory
 *
 * Factory functions for creating AchievementManager instances.
 * Provides both production and test/mock instances.
 */

import { IAchievementManager } from '../interfaces/achievement-manager.interface';
import { AchievementManager } from '../achievement-manager';
import { Achievement, SeasonAward, GameState } from '../types';

/**
 * Create a production AchievementManager instance
 */
export function createAchievementManager(): IAchievementManager {
  return new AchievementManager();
}

/**
 * Create a mock AchievementManager for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockAchievementManager(
  overrides?: Partial<IAchievementManager>
): IAchievementManager {
  const mockAchievement: Achievement = {
    id: 'ach-1',
    name: 'Test Achievement',
    description: 'Complete a test',
    category: 'league',
    icon: '🏆',
    unlocked: true,
    unlockedAt: new Date('2024-01-01'),
    progress: 100,
    target: 100,
  };

  const mockSeasonAward: SeasonAward = {
    season: 2024,
    awards: {
      goldenBoot: { playerId: 'p1', playerName: 'Top Scorer', goals: 30 },
      playerOfYear: { playerId: 'p2', playerName: 'Star Player', reason: 'Outstanding performance' },
    },
  };

  const mock: IAchievementManager = {
    getAllAchievements: () => [mockAchievement],
    checkAchievements: (_gameState: GameState, achievements: Achievement[]) => achievements,
    awardSeasonPrizes: (_gameState: GameState) => mockSeasonAward,
    ...overrides,
  };
  return mock;
}
