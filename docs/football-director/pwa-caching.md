# Football Director - PWA Caching Strategy

## Overview

Football Director uses Serwist (a Workbox-based service worker framework) for offline-first PWA functionality. This document explains the caching strategies, how to modify them, and how to test caching behavior.

## Caching Strategies

### 1. **CacheFirst** - Static Assets (Fonts, Icons)

**Use Case**: Assets that rarely change and need maximum performance.

**How it Works**:
1. Check cache first
2. If found, return cached version
3. If not found, fetch from network and cache

**Applied To**:
- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`
- Font files: `.woff`, `.woff2`, `.ttf`, `.otf`, `.eot`

```typescript
{
  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'google-fonts',
    expiration: {
      maxEntries: 10,
      maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
    },
  },
}
```

### 2. **NetworkFirst** - Dynamic Code (JS, CSS)

**Use Case**: Resources that need to be fresh but should work offline.

**How it Works**:
1. Try network first (with timeout)
2. If network fails or times out, use cache
3. Update cache with network response

**Applied To**:
- JavaScript files: `.js`
- CSS files: `.css`
- API calls: `/api/*`

```typescript
{
  urlPattern: /\.js$/i,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'js-assets',
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
    networkTimeoutSeconds: 3, // Fallback to cache after 3s
  },
}
```

### 3. **StaleWhileRevalidate** - Images

**Use Case**: Resources that should be fast but can be updated in background.

**How it Works**:
1. Return cached version immediately
2. Fetch from network in background
3. Update cache for next request

**Applied To**:
- Image files: `.jpg`, `.jpeg`, `.png`, `.svg`, `.webp`, `.avif`, `.ico`

```typescript
{
  urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'image-assets',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    },
  },
}
```

## Cache Size Limits

All caches have configured size limits to prevent storage bloat:

| Cache Name | Max Entries | Max Age | Purpose |
|-----------|-------------|---------|---------|
| `google-fonts` | 10 | 1 year | External Google Fonts |
| `static-font-assets` | 20 | 30 days | Font files |
| `image-assets` | 100 | 7 days | Images (team/player icons) |
| `js-assets` | 50 | 24 hours | JavaScript bundles |
| `css-assets` | 30 | 24 hours | Stylesheets |
| `api-cache` | 20 | 5 minutes | API responses (future) |

**Total Estimated Cache Size**: ~20-50MB depending on usage

## Offline Fallback

When offline and a page isn't cached, users see a friendly offline page at `/offline`:

- Explains the user is offline
- Provides "Try Again" and "Go to Dashboard" options
- Automatically detects when connection is restored
- Informs users that saved games work offline

## Cache Cleanup

Old caches are automatically deleted when the service worker activates:

```typescript
// In sw.ts - activate event
const currentCaches = [
  'google-fonts',
  'static-font-assets',
  'image-assets',
  'js-assets',
  'css-assets',
  'api-cache',
];

// Deletes any cache not in this list (except Serwist internal caches)
```

This ensures old caches from previous versions don't accumulate.

## Modifying Caching Strategies

### Adding a New Cache Rule

Edit `apps/football-director/src/app/sw.ts`:

```typescript
const serwist = new Serwist({
  // ... existing config
  runtimeCaching: [
    // ... existing rules

    // Add new rule:
    {
      urlPattern: /your-pattern-here/i,
      handler: 'CacheFirst', // or NetworkFirst, StaleWhileRevalidate
      options: {
        cacheName: 'your-cache-name',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});
```

**Don't forget to**:
1. Add your cache name to the `currentCaches` array in the `activate` event
2. Choose appropriate `maxEntries` and `maxAgeSeconds`
3. Test your changes in production build

### Changing Cache Limits

To adjust cache size limits, modify the `expiration` options:

```typescript
{
  expiration: {
    maxEntries: 100, // Maximum number of cached items
    maxAgeSeconds: 7 * 24 * 60 * 60, // Maximum age (7 days)
  },
}
```

## Testing Caching Behavior

### 1. Build Production Version

Caching only works in production builds:

```bash
npm run build
npm run start
```

### 2. Check Service Worker Registration

Open DevTools → Application → Service Workers:
- Should show "activated and running"
- Should show `/sw.js` registered

### 3. Inspect Caches

Open DevTools → Application → Cache Storage:
- Check cache names match configuration
- Inspect cached resources
- Verify expiration is working

### 4. Test Offline Functionality

1. Load the app while online
2. Open DevTools → Network tab
3. Check "Offline" checkbox
4. Navigate around the app
5. Should work from cache
6. Try visiting uncached page → should show `/offline` fallback

### 5. Test Cache Updates

1. Make a change to the app (e.g., edit a component)
2. Build and deploy
3. Visit the app in browser (may need hard refresh)
4. Should see "New version available" notification
5. Click "Update Now"
6. Page should reload with new version

### 6. Monitor Cache Size

Check cache storage quota:

```javascript
// In browser console
navigator.storage.estimate().then(estimate => {
  console.log(`Using ${estimate.usage} of ${estimate.quota} bytes`);
});
```

## Performance Targets

- **Initial Load (Online)**: < 3s
- **Repeat Visit (Cached)**: < 1s
- **Offline Load**: < 2s
- **Cache Storage**: < 50MB

## Troubleshooting

### Cache Not Updating

**Problem**: Old version of app still showing after deployment.

**Solutions**:
1. Check service worker updated: DevTools → Application → Service Workers
2. Click "Update" or "Unregister" service worker
3. Hard refresh (Cmd/Ctrl + Shift + R)
4. Clear cache storage manually

### Offline Page Not Showing

**Problem**: White screen or error when offline instead of `/offline` page.

**Solutions**:
1. Check offline page exists: `apps/football-director/src/app/offline/page.tsx`
2. Verify fallback configuration in `sw.ts`
3. Rebuild and re-register service worker
4. Check DevTools console for errors

### Cache Growing Too Large

**Problem**: Cache using too much storage.

**Solutions**:
1. Reduce `maxEntries` in cache configurations
2. Reduce `maxAgeSeconds` for faster expiration
3. Manually clear caches: DevTools → Application → Clear Storage
4. Check for cache cleanup in `activate` event

## Best Practices

1. **Always set expiration limits**: Prevents unbounded cache growth
2. **Use appropriate strategies**: CacheFirst for static, NetworkFirst for dynamic
3. **Test offline**: Don't assume caching works - always test
4. **Monitor storage**: Check cache size periodically
5. **Clean up old caches**: Remove deprecated caches on activation
6. **Version your caches**: Use version suffixes when making breaking changes
7. **Provide offline fallback**: Always have a friendly offline page
8. **Update documentation**: Keep this doc updated when changing strategies

## Resources

- [Serwist Documentation](https://serwist.pages.dev/)
- [Workbox Caching Strategies](https://developer.chrome.com/docs/workbox/caching-strategies-overview/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache Storage API](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
