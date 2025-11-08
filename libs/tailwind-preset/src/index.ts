/**
 * Shared Tailwind CSS Preset for Playground Workspace
 *
 * This preset contains the shared design system tokens used across all applications.
 * Individual apps can extend this preset with app-specific customizations.
 *
 * Usage in app tailwind.config.js:
 * ```js
 * module.exports = {
 *   presets: [require('@playground/tailwind-preset')],
 *   // app-specific overrides...
 * }
 * ```
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Color System - Unified design tokens
      colors: {
        // Brand Colors - Creamy neutrals
        cream: {
          50: '#FCFCF9',
          100: '#FFFFFD',
        },

        // Primary - Teal (for primary actions, success states)
        teal: {
          300: '#32B8C6',
          400: '#2DA6B2',
          500: '#21808D',  // Primary brand color
          600: '#1D7480',
          700: '#1A6873',
          800: '#2996A1',
        },

        // Neutrals - Slate
        slate: {
          500: '#626C71',
          900: '#13343B',
        },

        // Neutrals - Brown
        brown: {
          600: '#5E5240',
        },

        // Neutrals - Charcoal
        charcoal: {
          700: '#1F2121',
          800: '#262828',
        },

        // Grays (standard Tailwind grays extended)
        gray: {
          200: '#F5F5F5',
          300: '#A7A9A9',
          400: '#777C7C',
        },

        // Semantic Colors - Error states
        red: {
          400: '#FF5459',
          500: '#C0152F',
        },

        // Semantic Colors - Warning states
        orange: {
          400: '#E68161',
          500: '#A84B2F',
        },

        // Domain-Specific Colors (Reward Chart)
        'child-1': '#87CEEB',  // Sky Blue
        'child-2': '#90EE90',  // Light Green
        'child-3': '#DDA0DD',  // Plum
        'parent': '#FFE55C',   // Yellow
      },

      // Typography System
      fontFamily: {
        base: ['FKGroteskNeue', 'Geist', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['FKGroteskNeue', 'Geist', 'Inter', 'system-ui', 'sans-serif'], // Override default sans
        mono: ['Berkeley Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // Font Sizes (matching design tokens)
      fontSize: {
        xs: '11px',
        sm: '12px',
        base: '14px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '30px',
      },

      // Font Weights
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '550',
        bold: '600',
      },

      // Line Heights
      lineHeight: {
        tight: '1.2',
        normal: '1.5',
      },

      // Letter Spacing
      letterSpacing: {
        tight: '-0.01em',
      },

      // Spacing Scale (8px base grid)
      spacing: {
        0: '0',
        1: '1px',
        2: '2px',
        4: '4px',
        6: '6px',
        8: '8px',
        10: '10px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
      },

      // Border Radius (custom design system)
      borderRadius: {
        sm: '6px',
        base: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },

      // Box Shadows (subtle, modern shadows)
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.02)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'inset-sm': 'inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.03)',
      },

      // Animation Durations
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
      },

      // Animation Timing Functions
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },

  // Plugins shared across all apps
  plugins: [],
};
