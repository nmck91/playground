/**
 * Achievement Manager Interface
 *
 * Defines the contract for managing achievements and season awards.
 */

import { Achievement, SeasonAward, GameState } from '../types';

export interface IAchievementManager {
  getAllAchievements(): Achievement[];
  checkAchievements(gameState: GameState, achievements: Achievement[]): Achievement[];
  awardSeasonPrizes(gameState: GameState): SeasonAward;
}
