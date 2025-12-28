/**
 * Football Director - Service Worker
 * Powered by Serwist for offline-first PWA functionality
 *
 * Caching Strategy:
 * - Critical assets: Precached (app shell, core JS/CSS)
 * - Static assets: CacheFirst (fonts, icons)
 * - Dynamic assets: StaleWhileRevalidate (images, scripts)
 * - Documents: NetworkFirst with offline fallback
 * - Cache size limits enforced to prevent storage bloat
 */

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // Manual control via SKIP_WAITING message
  clientsClaim: true,
  navigationPreload: true,
  // Offline fallback for navigation requests
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
  runtimeCaching: [
    // Google Fonts - CacheFirst (long-term cache)
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10, // Increased for font variations
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Font files - CacheFirst (static assets)
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Images - StaleWhileRevalidate (balance freshness and speed)
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'image-assets',
        expiration: {
          maxEntries: 100, // Increased for team/player icons
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // JavaScript - NetworkFirst (ensure latest code)
    {
      urlPattern: /\.js$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'js-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 3,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // CSS - NetworkFirst (ensure latest styles)
    {
      urlPattern: /\.css$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'css-assets',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 3,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Data/API - NetworkFirst with timeout (if we add API in future)
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 5 * 60, // 5 minutes
        },
        networkTimeoutSeconds: 5,
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Use default caching strategies for other assets
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Handle messages from clients (e.g., SKIP_WAITING for updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Skip waiting and activate the new service worker immediately
    self.skipWaiting();
  }
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  const currentCaches = [
    'google-fonts',
    'static-font-assets',
    'image-assets',
    'js-assets',
    'css-assets',
    'api-cache',
  ];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete caches that aren't in our current cache list
          if (!currentCaches.includes(cacheName) && !cacheName.startsWith('serwist-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
