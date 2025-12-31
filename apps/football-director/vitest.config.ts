import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      reportsDirectory: '../../coverage/apps/football-director',
      exclude: [
        'node_modules/',
        'src/**/*.test.{ts,tsx}',
        '**/*.config.{js,ts}',
      ],
    },
  },
  resolve: {
    alias: {
      '@playground/football-director-engine': resolve(
        __dirname,
        '../../libs/football-director-engine/src/index.ts'
      ),
      '@playground/tailwind-preset': resolve(
        __dirname,
        '../../libs/tailwind-preset/src/index.ts'
      ),
    },
  },
});
