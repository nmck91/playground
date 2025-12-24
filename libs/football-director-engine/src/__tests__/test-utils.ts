/**
 * Test Utilities
 *
 * Common testing helpers and utilities
 */

import { vi } from 'vitest';

/**
 * Mock Math.random() to return deterministic values
 * Useful for testing code that uses randomness
 *
 * @param value - The value to return (0-1)
 * @example
 * mockRandom(0.5); // Math.random() will always return 0.5
 */
export function mockRandom(value: number) {
  const spy = vi.spyOn(Math, 'random').mockReturnValue(value);
  return spy;
}

/**
 * Mock Math.random() to return a sequence of values
 * Useful for testing code that calls Math.random() multiple times
 *
 * @param values - Array of values to return in sequence
 * @example
 * mockRandomSequence([0.1, 0.5, 0.9]);
 * Math.random(); // returns 0.1
 * Math.random(); // returns 0.5
 * Math.random(); // returns 0.9
 */
export function mockRandomSequence(values: number[]) {
  let index = 0;
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const value = values[index % values.length];
    index++;
    return value;
  });
  return spy;
}

/**
 * Restore Math.random() to original implementation
 */
export function restoreRandom() {
  vi.restoreAllMocks();
}

/**
 * Wait for a specified number of milliseconds
 * Useful for testing async code
 *
 * @param ms - Milliseconds to wait
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run an async function and assert it completes within a time limit
 *
 * @param fn - Async function to run
 * @param timeout - Maximum time in milliseconds
 */
export async function assertCompletesWithin(
  fn: () => Promise<void>,
  timeout: number
): Promise<void> {
  const start = Date.now();
  await fn();
  const duration = Date.now() - start;

  if (duration > timeout) {
    throw new Error(
      `Function took ${duration}ms, expected <${timeout}ms`
    );
  }
}

/**
 * Generate a deterministic seed-based random number
 * Useful for reproducible tests
 *
 * @param seed - Seed value
 * @returns Pseudo-random number between 0 and 1
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

/**
 * Create a seeded random number generator
 * Returns a function that generates deterministic random numbers
 *
 * @param seed - Initial seed value
 * @example
 * const random = createSeededRandom(12345);
 * random(); // returns 0.9564...
 * random(); // returns 0.4124...
 */
export function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
}

/**
 * Assert that two numbers are approximately equal (within epsilon)
 *
 * @param actual - Actual value
 * @param expected - Expected value
 * @param epsilon - Maximum allowed difference (default: 0.001)
 */
export function assertApproximately(
  actual: number,
  expected: number,
  epsilon = 0.001
): void {
  const diff = Math.abs(actual - expected);
  if (diff > epsilon) {
    throw new Error(
      `Expected ${actual} to be approximately ${expected} (within ${epsilon}), but difference was ${diff}`
    );
  }
}

/**
 * Assert that a value is within a range
 *
 * @param value - Value to check
 * @param min - Minimum (inclusive)
 * @param max - Maximum (inclusive)
 */
export function assertInRange(value: number, min: number, max: number): void {
  if (value < min || value > max) {
    throw new Error(`Expected ${value} to be between ${min} and ${max}`);
  }
}

/**
 * Snapshot helper for complex objects
 * Sorts object keys for consistent snapshots
 *
 * @param obj - Object to snapshot
 * @returns Sorted object
 */
export function sortedSnapshot<T extends Record<string, unknown>>(obj: T): T {
  const sorted: Record<string, unknown> = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted as T;
}
