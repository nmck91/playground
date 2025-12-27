import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Clear localStorage before each test (jsdom provides localStorage)
beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
});
