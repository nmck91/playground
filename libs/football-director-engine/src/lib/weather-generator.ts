/**
 * Football Director Engine - Weather Generator
 *
 * Generates weather conditions for matches based on season
 */

import { MatchWeather } from './types';

export class WeatherGenerator {
  /**
   * Generate weather for a match based on week number
   */
  generateWeather(week: number, seed?: number): MatchWeather {
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random();

    // Get seasonal weather weights
    const weights = this.getSeasonalWeights(week);

    // Select condition based on weights
    const condition = this.selectCondition(random, weights);

    // Generate temperature based on condition and season
    const temperature = this.generateTemperature(condition, week);

    // Generate description
    const description = this.generateDescription(condition);

    return {
      condition,
      temperature,
      description,
    };
  }

  /**
   * Get weather probability weights based on week (season)
   */
  private getSeasonalWeights(week: number): Record<MatchWeather['condition'], number> {
    // Pre-season (weeks 1-7): Summer - mostly sunny
    if (week <= 7) {
      return {
        sunny: 0.60,
        cloudy: 0.25,
        rainy: 0.10,
        foggy: 0.03,
        snowy: 0.02,
      };
    }

    // Early season (weeks 8-20): Autumn - mix of conditions
    if (week <= 20) {
      return {
        sunny: 0.35,
        cloudy: 0.30,
        rainy: 0.25,
        foggy: 0.08,
        snowy: 0.02,
      };
    }

    // Mid-season (weeks 21-35): Winter - cold, rainy, some snow
    if (week <= 35) {
      return {
        sunny: 0.20,
        cloudy: 0.30,
        rainy: 0.30,
        foggy: 0.10,
        snowy: 0.10,
      };
    }

    // Late season (weeks 36-45): Spring - improving weather
    if (week <= 45) {
      return {
        sunny: 0.45,
        cloudy: 0.30,
        rainy: 0.18,
        foggy: 0.05,
        snowy: 0.02,
      };
    }

    // Off-season (weeks 46-52): Summer - mostly sunny
    return {
      sunny: 0.65,
      cloudy: 0.25,
      rainy: 0.08,
      foggy: 0.02,
      snowy: 0.00,
    };
  }

  /**
   * Select weather condition based on weights
   */
  private selectCondition(
    random: number,
    weights: Record<MatchWeather['condition'], number>
  ): MatchWeather['condition'] {
    let cumulative = 0;
    const conditions: MatchWeather['condition'][] = ['sunny', 'cloudy', 'rainy', 'foggy', 'snowy'];

    for (const condition of conditions) {
      cumulative += weights[condition];
      if (random < cumulative) {
        return condition;
      }
    }

    return 'sunny'; // Fallback
  }

  /**
   * Generate temperature based on condition and week
   */
  private generateTemperature(condition: MatchWeather['condition'], week: number): number {
    let baseTemp: number;

    // Base temperature by season
    if (week <= 7) {
      baseTemp = 22; // Summer
    } else if (week <= 20) {
      baseTemp = 14; // Autumn
    } else if (week <= 35) {
      baseTemp = 6; // Winter
    } else if (week <= 45) {
      baseTemp = 12; // Spring
    } else {
      baseTemp = 24; // Summer
    }

    // Adjust by condition
    switch (condition) {
      case 'sunny':
        baseTemp += 2;
        break;
      case 'cloudy':
        baseTemp -= 1;
        break;
      case 'rainy':
        baseTemp -= 3;
        break;
      case 'foggy':
        baseTemp -= 2;
        break;
      case 'snowy':
        baseTemp = Math.min(baseTemp - 5, 2); // Snow only below ~2°C
        break;
    }

    // Add some random variance (±2 degrees)
    const variance = (Math.random() - 0.5) * 4;

    return Math.round(baseTemp + variance);
  }

  /**
   * Generate descriptive text for weather condition
   */
  private generateDescription(condition: MatchWeather['condition']): string {
    const descriptions: Record<MatchWeather['condition'], string[]> = {
      sunny: [
        'Perfect conditions',
        'Beautiful sunshine',
        'Clear skies',
        'Ideal weather',
        'Bright and sunny',
      ],
      cloudy: [
        'Overcast skies',
        'Grey conditions',
        'Cloudy afternoon',
        'Dull conditions',
        'Cloud cover',
      ],
      rainy: [
        'Heavy rain',
        'Wet conditions',
        'Rainy afternoon',
        'Pouring down',
        'Driving rain',
      ],
      foggy: [
        'Thick fog',
        'Poor visibility',
        'Foggy conditions',
        'Misty atmosphere',
        'Dense fog',
      ],
      snowy: [
        'Snow falling',
        'Wintry conditions',
        'Heavy snow',
        'Snowy pitch',
        'Blizzard conditions',
      ],
    };

    const options = descriptions[condition];
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  }

  /**
   * Simple seeded random number generator
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}
