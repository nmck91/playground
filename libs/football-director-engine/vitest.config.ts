import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      enabled: false, // Enable manually with --coverage flag
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json'],
      reportsDirectory: '../../coverage/libs/football-director-engine',
      all: true,
      include: ['src/lib/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/index.ts',
        'src/__tests__/**',
      ],
    },
  },
});
