// @ts-nocheck
const withSerwist = require('@serwist/next').default({
  // Disable Serwist in development to avoid cache hell
  // Enable only when debugging PWA functionality
  disable: process.env.NODE_ENV === 'development',
  // Service worker source and destination
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  // Reload page when going from offline to online (optional, set to false to disable)
  reloadOnOnline: true,
  // Additional Serwist options
  swUrl: '/sw.js',
});

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // Temporarily removing Nx plugin to test Turbopack compatibility
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

module.exports = withSerwist(nextConfig);
