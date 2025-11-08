const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use shared workspace preset for consistent design tokens
  presets: [require('../../tailwind-workspace-preset.js')],

  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],

  theme: {
    extend: {
      // App-specific theme extensions go here
      // Example:
      // colors: {
      //   'family-primary': '#custom-color',
      // }
    },
  },

  plugins: [
    // App-specific plugins go here
  ],
};
