const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use shared workspace preset for consistent design tokens
  presets: [require('../../libs/tailwind-preset/src/index.ts')],

  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  theme: {
    extend: {
      // Math Quest specific theme extensions
      colors: {
        // Game-specific colors can be added here
      },
    },
  },

  plugins: [],
};
