import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: [
      '.next/**',
      '.vercel/**',
      'next-env.d.ts',
      '*.config.js',
      'public/**/*.js', // Generated service worker files
      'dist/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Next.js and test-specific overrides can go here
    },
  },
  {
    // Service worker file needs looser rules
    files: ['src/app/sw.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
