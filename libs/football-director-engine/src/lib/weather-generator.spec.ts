/**
 * Football Director Engine - Weather Generator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeatherGenerator } from './weather-generator';
import { MatchWeather } from './types';

describe('WeatherGenerator', () => {
  let generator: WeatherGenerator;

  beforeEach(() => {
    generator = new WeatherGenerator();
  });

  describe('generateWeather', () => {
    it('should generate weather with all required fields', () => {
      const weather = generator.generateWeather(1);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
      expect(weather.description).toBeDefined();
    });

    it('should generate valid weather condition', () => {
      const weather = generator.generateWeather(1);
      const validConditions: MatchWeather['condition'][] = ['sunny', 'cloudy', 'rainy', 'foggy', 'snowy'];

      expect(validConditions).toContain(weather.condition);
    });

    it('should generate appropriate temperature for season', () => {
      const weather = generator.generateWeather(1); // Pre-season summer

      // Summer should be warm (roughly 18-27°C)
      expect(weather.temperature).toBeGreaterThanOrEqual(18);
      expect(weather.temperature).toBeLessThan(28);
    });

    it('should generate deterministic weather with seed', () => {
      const weather1 = generator.generateWeather(10, 12345);
      const weather2 = generator.generateWeather(10, 12345);

      expect(weather1.condition).toBe(weather2.condition);
      expect(weather1.temperature).toBe(weather2.temperature);
      expect(weather1.description).toBe(weather2.description);
    });

    it('should generate different weather with different seeds', () => {
      const weather1 = generator.generateWeather(10, 12345);
      const weather2 = generator.generateWeather(10, 67890);

      // At least one property should differ
      const isDifferent =
        weather1.condition !== weather2.condition ||
        weather1.temperature !== weather2.temperature ||
        weather1.description !== weather2.description;

      expect(isDifferent).toBe(true);
    });
  });

  describe('seasonal weather patterns', () => {
    it('should favor sunny weather in pre-season (summer)', () => {
      // Generate 100 samples to test distribution
      const conditions: MatchWeather['condition'][] = [];
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(5, 1000 + i);
        conditions.push(weather.condition);
      }

      const sunnyCount = conditions.filter((c) => c === 'sunny').length;
      const snowyCount = conditions.filter((c) => c === 'snowy').length;

      // Summer should have more sunny days (expect ~60%)
      expect(sunnyCount).toBeGreaterThan(40);
      // Summer should have very few snowy days
      expect(snowyCount).toBeLessThan(10);
    });

    it('should have balanced weather in autumn (early season)', () => {
      const conditions: MatchWeather['condition'][] = [];
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(15, 2000 + i);
        conditions.push(weather.condition);
      }

      const sunnyCount = conditions.filter((c) => c === 'sunny').length;
      const rainyCount = conditions.filter((c) => c === 'rainy').length;

      // Autumn should have moderate sunny and rainy (not extreme)
      expect(sunnyCount).toBeGreaterThan(15);
      expect(sunnyCount).toBeLessThan(55);
      expect(rainyCount).toBeGreaterThan(10);
    });

    it('should have more snow and rain in winter (mid-season)', () => {
      const conditions: MatchWeather['condition'][] = [];
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(30, 3000 + i);
        conditions.push(weather.condition);
      }

      const snowyCount = conditions.filter((c) => c === 'snowy').length;
      const sunnyCount = conditions.filter((c) => c === 'sunny').length;

      // Winter should have some snow (expect ~10%)
      expect(snowyCount).toBeGreaterThan(3);
      // Winter should have less sunny weather (expect ~20%)
      expect(sunnyCount).toBeLessThan(40);
    });

    it('should have improving weather in spring (late season)', () => {
      const conditions: MatchWeather['condition'][] = [];
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(40, 4000 + i);
        conditions.push(weather.condition);
      }

      const sunnyCount = conditions.filter((c) => c === 'sunny').length;
      const snowyCount = conditions.filter((c) => c === 'snowy').length;

      // Spring should have more sunny days (expect ~45%)
      expect(sunnyCount).toBeGreaterThan(30);
      // Spring should have very few snowy days
      expect(snowyCount).toBeLessThan(10);
    });

    it('should favor sunny weather in off-season (summer)', () => {
      const conditions: MatchWeather['condition'][] = [];
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(50, 5000 + i);
        conditions.push(weather.condition);
      }

      const sunnyCount = conditions.filter((c) => c === 'sunny').length;
      const snowyCount = conditions.filter((c) => c === 'snowy').length;

      // Off-season summer should have most sunny days (expect ~65%)
      expect(sunnyCount).toBeGreaterThan(50);
      // No snow in off-season summer
      expect(snowyCount).toBe(0);
    });
  });

  describe('temperature generation', () => {
    it('should generate warmer temperatures in summer weeks', () => {
      const weather = generator.generateWeather(5, 12345); // Pre-season summer

      // Summer temperatures should be warm
      expect(weather.temperature).toBeGreaterThan(18);
    });

    it('should generate cooler temperatures in winter weeks', () => {
      const weather = generator.generateWeather(30, 12345); // Mid-season winter

      // Winter temperatures should be cool
      expect(weather.temperature).toBeLessThan(12);
    });

    it('should adjust temperature based on condition', () => {
      // Test multiple times to get different conditions
      const temperatures: Record<MatchWeather['condition'], number[]> = {
        sunny: [],
        cloudy: [],
        rainy: [],
        foggy: [],
        snowy: [],
      };

      for (let i = 0; i < 50; i++) {
        const weather = generator.generateWeather(10, 6000 + i);
        temperatures[weather.condition].push(weather.temperature);
      }

      // Snowy conditions should be coldest
      if (temperatures.snowy.length > 0) {
        const avgSnowy = temperatures.snowy.reduce((a, b) => a + b, 0) / temperatures.snowy.length;
        expect(avgSnowy).toBeLessThan(5);
      }

      // Sunny should be warmer than rainy
      if (temperatures.sunny.length > 0 && temperatures.rainy.length > 0) {
        const avgSunny = temperatures.sunny.reduce((a, b) => a + b, 0) / temperatures.sunny.length;
        const avgRainy = temperatures.rainy.reduce((a, b) => a + b, 0) / temperatures.rainy.length;
        expect(avgSunny).toBeGreaterThan(avgRainy - 1); // Allow some overlap due to variance
      }
    });

    it('should generate deterministic temperature with seed', () => {
      const weather1 = generator.generateWeather(20, 12345);
      const weather2 = generator.generateWeather(20, 12345);

      expect(weather1.temperature).toBe(weather2.temperature);
    });

    it('should keep snowy temperatures low (<=2°C)', () => {
      // Generate many winter samples to find snow
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(30, 7000 + i);
        if (weather.condition === 'snowy') {
          expect(weather.temperature).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  describe('description generation', () => {
    it('should generate appropriate description for condition', () => {
      const weather = generator.generateWeather(10, 12345);

      expect(weather.description).toBeDefined();
      expect(typeof weather.description).toBe('string');
      expect(weather.description.length).toBeGreaterThan(0);
    });

    it('should generate sunny descriptions for sunny weather', () => {
      // Find a seed that gives sunny weather
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(5, 8000 + i);
        if (weather.condition === 'sunny') {
          const sunnyDescriptions = [
            'Perfect conditions',
            'Beautiful sunshine',
            'Clear skies',
            'Ideal weather',
            'Bright and sunny',
          ];
          expect(sunnyDescriptions).toContain(weather.description);
          break;
        }
      }
    });

    it('should generate rainy descriptions for rainy weather', () => {
      // Find a seed that gives rainy weather
      for (let i = 0; i < 100; i++) {
        const weather = generator.generateWeather(15, 9000 + i);
        if (weather.condition === 'rainy') {
          const rainyDescriptions = [
            'Heavy rain',
            'Wet conditions',
            'Rainy afternoon',
            'Pouring down',
            'Driving rain',
          ];
          expect(rainyDescriptions).toContain(weather.description);
          break;
        }
      }
    });

    it('should generate deterministic description with seed', () => {
      const weather1 = generator.generateWeather(20, 12345);
      const weather2 = generator.generateWeather(20, 12345);

      expect(weather1.description).toBe(weather2.description);
    });

    it('should have variety in descriptions for same condition', () => {
      const descriptions = new Set<string>();

      // Generate many sunny days
      for (let i = 0; i < 50; i++) {
        const weather = generator.generateWeather(5, 10000 + i);
        if (weather.condition === 'sunny') {
          descriptions.add(weather.description);
        }
      }

      // Should have multiple different descriptions
      expect(descriptions.size).toBeGreaterThan(1);
    });
  });

  describe('edge cases', () => {
    it('should handle week 1 (start of pre-season)', () => {
      const weather = generator.generateWeather(1);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
    });

    it('should handle week 52 (end of off-season)', () => {
      const weather = generator.generateWeather(52);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
    });

    it('should handle transition weeks between seasons', () => {
      const weather7 = generator.generateWeather(7, 12345); // End of pre-season
      const weather8 = generator.generateWeather(8, 12345); // Start of competitive

      // Both should generate valid weather
      expect(weather7.condition).toBeDefined();
      expect(weather8.condition).toBeDefined();
    });

    it('should handle seed of 0', () => {
      const weather = generator.generateWeather(10, 0);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
      expect(weather.description).toBeDefined();
    });

    it('should handle large seed values', () => {
      const weather = generator.generateWeather(10, 999999999);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
      expect(weather.description).toBeDefined();
    });

    it('should handle negative seed values', () => {
      const weather = generator.generateWeather(10, -12345);

      expect(weather.condition).toBeDefined();
      expect(weather.temperature).toBeDefined();
      expect(weather.description).toBeDefined();
    });
  });
});
