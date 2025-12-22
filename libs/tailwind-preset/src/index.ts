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
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Color System - Unified design tokens
      colors: {
        // Brand Colors - Creamy neutrals (custom)
        cream: {
          50: '#FCFCF9',
          100: '#FFFFFD',
        },

        // Override Teal with brand colors
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#32B8C6',
          400: '#2DA6B2',
          500: '#21808D',  // Primary brand color
          600: '#1D7480',
          700: '#1A6873',
          800: '#2996A1',
          900: '#134e4a',
          950: '#042f2e',
        },

        // Dark Mode Colors
        dark: {
          bg: {
            primary: '#0a0a0a',     // Main background
            secondary: '#1a1a1a',   // Card background
            tertiary: '#2d2d2d',    // Elevated elements
          },
          text: {
            primary: '#f5f5f5',     // Main text
            secondary: '#b0b0b0',   // Secondary text
            tertiary: '#808080',    // Muted text
          },
          border: {
            primary: '#3d3d3d',     // Main borders
            secondary: '#2d2d2d',   // Subtle borders
          },
          teal: {
            50: '#0d3d43',          // Dark teal backgrounds
            100: '#154d54',
            500: '#32B8C6',         // Keep brand teal bright
            600: '#21808D',
          }
        },

        // Enhanced Gradients for Modern & Bold style
        gradient: {
          squad: {
            from: '#3b82f6',      // Blue
            to: '#1d4ed8',
          },
          matches: {
            from: '#10b981',      // Green
            to: '#059669',
          },
          transfers: {
            from: '#f59e0b',      // Amber
            to: '#d97706',
          },
          tactics: {
            from: '#8b5cf6',      // Purple
            to: '#6d28d9',
          },
          more: {
            from: '#ef4444',      // Red
            to: '#dc2626',
          }
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
        // Enhanced typography for Modern & Bold
        '5xl': ['36px', { lineHeight: '1.2', fontWeight: '600' }],
        '6xl': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
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
        11: '2.75rem',  // 44px - minimum touch target
        12: '12px',
        14: '3.5rem',   // 56px - bottom nav height
        16: '16px',
        18: '4.5rem',   // 72px - large touch target
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

      // Glass-morphism effect
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
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

      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },

  // Plugins shared across all apps
  plugins: [],
};
