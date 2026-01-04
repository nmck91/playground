/**
 * Weather Generator Interface
 *
 * Defines the contract for generating match weather conditions.
 */

import { MatchWeather } from '../types';

export interface IWeatherGenerator {
  /**
   * Generate weather conditions for a match based on the week number (season)
   * Weather varies by season: summer (sunny), autumn (mixed), winter (rainy/snowy), spring (improving)
   */
  generateWeather(week: number, seed?: number): MatchWeather;
}
