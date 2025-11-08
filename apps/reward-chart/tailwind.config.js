const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Map existing CSS variables to Tailwind
        cream: {
          50: 'rgba(252, 252, 249, 1)',
          100: 'rgba(255, 255, 253, 1)',
        },
        teal: {
          300: 'rgba(50, 184, 198, 1)',
          400: 'rgba(45, 166, 178, 1)',
          500: 'rgba(33, 128, 141, 1)',
          600: 'rgba(29, 116, 128, 1)',
          700: 'rgba(26, 104, 115, 1)',
          800: 'rgba(41, 150, 161, 1)',
        },
        slate: {
          500: 'rgba(98, 108, 113, 1)',
          900: 'rgba(19, 52, 59, 1)',
        },
        brown: {
          600: 'rgba(94, 82, 64, 1)',
        },
        charcoal: {
          700: 'rgba(31, 33, 33, 1)',
          800: 'rgba(38, 40, 40, 1)',
        },
      },
      fontFamily: {
        base: ['FKGroteskNeue', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Berkeley Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        base: '8px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.02)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      },
    },
  },
  plugins: [],
};
