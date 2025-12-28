/**
 * Football Director - Service Worker Update Notification
 *
 * Detects when a new version of the app is available and prompts user to refresh.
 * Integrates with auto-save to ensure no progress is lost during update.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSaveStore } from '../../stores/saveStore';
import { useUIStore } from '../../stores/uiStore';

export function UpdateNotification() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const autoSave = useSaveStore((state) => state.autoSave);
  const addNotification = useUIStore((state) => state.addNotification);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for service worker updates
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();

        if (!registration) {
          return;
        }

        // Handle waiting worker (update already downloaded)
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) {
            return;
          }

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and waiting to activate
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);

              // Show notification via UI store
              addNotification({
                type: 'info',
                message: 'New version available! Click to update.',
                duration: undefined, // Persist until dismissed
              });
            }
          });
        });

        // Listen for controlling service worker changing (update activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page when new service worker takes control
          window.location.reload();
        });

      } catch (error) {
        console.error('Error checking for service worker updates:', error);
      }
    };

    // Check immediately and periodically
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [addNotification]);

  /**
   * Handle update button click
   * Auto-saves game, then triggers service worker update
   */
  const handleUpdate = async () => {
    if (!waitingWorker) {
      return;
    }

    try {
      setIsUpdating(true);

      // Auto-save current game state before updating
      console.log('Auto-saving before update...');
      await autoSave();

      // Tell the waiting service worker to skip waiting and activate
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // The page will reload automatically when the new SW takes control
      // (via the controllerchange listener)

    } catch (error) {
      console.error('Error during update:', error);
      setIsUpdating(false);
      addNotification({
        type: 'error',
        message: 'Update failed. Please try refreshing manually.',
        duration: 5000,
      });
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  // Don't render anything if no update available
  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-teal-500 dark:bg-teal-600 text-white rounded-lg shadow-lg p-4 border border-teal-600 dark:border-teal-700">
        {/* Icon and Message */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">New Version Available!</h3>
            <p className="text-sm text-teal-50">
              A new version of Football Director is ready to install. Your progress will be saved before updating.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isUpdating
                ? 'bg-teal-700 dark:bg-teal-800 cursor-wait'
                : 'bg-white text-teal-600 hover:bg-teal-50 dark:bg-teal-800 dark:text-white dark:hover:bg-teal-700'
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </span>
            ) : (
              'Update Now'
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="px-4 py-2 rounded-lg font-medium bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
