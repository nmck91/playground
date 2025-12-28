/**
 * Football Director - Offline Fallback Page
 *
 * Displayed when user tries to navigate while offline and page is not cached.
 * Provides friendly message and option to return to cached pages.
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If back online, suggest reloading
  if (isOnline) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border-primary">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-2">
            Back Online!
          </h1>
          <p className="text-slate-600 dark:text-dark-text-secondary mb-6">
            Your internet connection has been restored.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Reload Page
          </button>

          <Link
            href="/"
            className="block mt-4 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Offline state
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg p-8 text-center border border-gray-200 dark:border-dark-border-primary">
        {/* Offline Icon */}
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-orange-600 dark:text-orange-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-2">
          You're Offline
        </h1>
        <p className="text-slate-600 dark:text-dark-text-secondary mb-6">
          This page requires an internet connection. Please check your network and try again.
        </p>

        {/* Info Box */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 rounded-lg p-4 mb-6 text-left">
          <h2 className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
            ⚽ You can still play!
          </h2>
          <p className="text-sm text-teal-700 dark:text-teal-300">
            Football Director works offline. Your saved games are stored locally on your device.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-slate-900 dark:text-dark-text-primary font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-slate-500 dark:text-dark-text-tertiary mt-6">
          Check your WiFi or mobile data connection
        </p>
      </div>
    </div>
  );
}
