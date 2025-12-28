/**
 * Football Director - Enhanced Install Prompt
 *
 * Smart PWA install prompt with:
 * - Platform-specific guidance (Android vs iOS)
 * - Delayed prompt (after user engagement)
 * - Benefits highlighting
 * - Install analytics
 * - Dismissal tracking
 */

'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '../../stores/uiStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Storage keys
const INSTALL_PROMPT_DISMISSED_KEY = 'fd_install_prompt_dismissed';
const INSTALL_PROMPT_PERMANENTLY_DISMISSED_KEY = 'fd_install_prompt_permanent_dismiss';
const FIRST_VISIT_TIME_KEY = 'fd_first_visit_time';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const addNotification = useUIStore((state) => state.addNotification);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Check if already installed (running as standalone app)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');

    setIsStandalone(standalone);

    if (standalone) {
      return; // Don't show prompt if already installed
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if user permanently dismissed
    const permanentlyDismissed = localStorage.getItem(INSTALL_PROMPT_PERMANENTLY_DISMISSED_KEY);
    if (permanentlyDismissed === 'true') {
      return;
    }

    // Track first visit time
    if (!localStorage.getItem(FIRST_VISIT_TIME_KEY)) {
      localStorage.setItem(FIRST_VISIT_TIME_KEY, Date.now().toString());
    }

    // For Android/Chrome - listen for beforeinstallprompt
    if (!ios) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        // Don't show immediately - wait for engagement
        checkEngagementAndShow();
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    } else {
      // For iOS - check engagement and show manual instructions
      checkEngagementAndShow();
    }
  }, []);

  /**
   * Check if user is engaged enough to show install prompt
   * Criteria: 5+ minutes since first visit OR temporary dismiss expired
   */
  const checkEngagementAndShow = () => {
    const firstVisit = localStorage.getItem(FIRST_VISIT_TIME_KEY);
    const dismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);

    if (!firstVisit) {
      return;
    }

    const firstVisitTime = parseInt(firstVisit, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Check if temporarily dismissed (expires after 24 hours)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneDayAgo = now - (24 * 60 * 60 * 1000);

      if (dismissedTime > oneDayAgo) {
        return; // Still in temporary dismiss period
      }
    }

    // Show prompt after 5 minutes
    if (now - firstVisitTime >= fiveMinutes) {
      // Delay slightly to avoid interrupting user
      setTimeout(() => {
        if (isIOS) {
          setShowIOSGuide(true);
        } else {
          setShowPrompt(true);
        }

        // Track impression
        trackInstallEvent('prompt_shown');
      }, 2000);
    } else {
      // Check again after 5 minutes
      const timeRemaining = fiveMinutes - (now - firstVisitTime);
      setTimeout(checkEngagementAndShow, timeRemaining);
    }
  };

  /**
   * Track install-related events
   */
  const trackInstallEvent = (event: 'prompt_shown' | 'install_clicked' | 'dismissed' | 'permanently_dismissed' | 'install_success') => {
    // Log for analytics (in production, send to analytics service)
    console.log(`[Install Analytics] ${event}`, {
      timestamp: new Date().toISOString(),
      platform: isIOS ? 'iOS' : 'Android/Desktop',
    });

    // Could integrate with analytics service here
    // Example: analytics.track('pwa_install', { event, platform });
  };

  /**
   * Handle native install prompt (Android/Chrome)
   */
  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    trackInstallEvent('install_clicked');

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        trackInstallEvent('install_success');
        setShowPrompt(false);

        addNotification({
          type: 'success',
          message: 'App installed! You can now access Football Director from your home screen.',
          duration: 5000,
        });
      } else {
        trackInstallEvent('dismissed');
        handleDismiss();
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  /**
   * Handle temporary dismissal (show again in 24 hours)
   */
  const handleDismiss = () => {
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, Date.now().toString());
    setShowPrompt(false);
    setShowIOSGuide(false);
    trackInstallEvent('dismissed');
  };

  /**
   * Handle permanent dismissal (never show again)
   */
  const handlePermanentDismiss = () => {
    localStorage.setItem(INSTALL_PROMPT_PERMANENTLY_DISMISSED_KEY, 'true');
    setShowPrompt(false);
    setShowIOSGuide(false);
    trackInstallEvent('permanently_dismissed');
  };

  // Don't render if already installed or nothing to show
  if (isStandalone || (!showPrompt && !showIOSGuide)) {
    return null;
  }

  // iOS Install Guide
  if (showIOSGuide && isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slide-up">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-5 shadow-2xl border border-teal-400 dark:border-teal-600">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">⚽</span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-dark-text-primary text-lg">
                Install Football Director
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-1">
                Get the best experience with our app!
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Play offline - no internet required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Faster loading and smoother experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>App-like experience on your home screen</span>
            </div>
          </div>

          {/* iOS Instructions */}
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4 mb-4 border border-teal-200 dark:border-teal-700">
            <h4 className="font-semibold text-teal-900 dark:text-teal-100 mb-3 text-sm">
              How to Install on iOS:
            </h4>
            <ol className="space-y-2 text-sm text-teal-800 dark:text-teal-200">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <div className="flex-1">
                  Tap the <strong>Share</strong> button
                  <svg className="inline-block w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  in Safari
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <div className="flex-1">
                  Scroll and tap <strong>"Add to Home Screen"</strong>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <div className="flex-1">
                  Tap <strong>"Add"</strong> to confirm
                </div>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              Got it
            </button>
            <button
              onClick={handlePermanentDismiss}
              className="px-4 py-2 text-slate-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors text-sm"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Android/Desktop Native Prompt
  if (showPrompt && !isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slide-up">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-5 shadow-2xl border border-teal-400 dark:border-teal-600">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">⚽</span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 dark:text-dark-text-primary text-lg">
                Install Football Director
              </h3>
              <p className="text-sm text-slate-600 dark:text-dark-text-secondary mt-1">
                Get the best experience with our app!
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Play offline - no internet required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Faster loading and smoother experience</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-dark-text-secondary">
              <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>App-like experience on your home screen</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleInstall}
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-sm"
            >
              Install App
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 text-slate-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors text-sm"
              >
                Not now
              </button>
              <button
                onClick={handlePermanentDismiss}
                className="px-4 py-2 text-slate-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors text-sm"
              >
                Don't show again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
