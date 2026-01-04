/**
 * Weather Generator Factory
 *
 * Factory functions for creating WeatherGenerator instances.
 * Provides both production and test/mock instances.
 */

import { IWeatherGenerator } from '../interfaces/weather-generator.interface';
import { WeatherGenerator } from '../weather-generator';
import { MatchWeather } from '../types';

/**
 * Create a production WeatherGenerator instance
 */
export function createWeatherGenerator(): IWeatherGenerator {
  return new WeatherGenerator();
}

/**
 * Create a mock WeatherGenerator for testing
 * @param overrides - Partial implementation to override default mock behavior
 */
export function createMockWeatherGenerator(
  overrides?: Partial<IWeatherGenerator>
): IWeatherGenerator {
  const mock: IWeatherGenerator = {
    generateWeather: (_week: number, _seed?: number): MatchWeather => ({
      condition: 'sunny',
      temperature: 20,
      description: 'Perfect conditions',
    }),
    ...overrides,
  };
  return mock;
}
