/**
 * Football Director - Post-Install Welcome Message
 *
 * Shows a welcome message when the app is first launched as an installed PWA.
 * Highlights PWA benefits and provides quick tips.
 */

'use client';

import { useEffect, useState } from 'react';

const WELCOME_SHOWN_KEY = 'fd_welcome_message_shown';

export function WelcomeMessage() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    if (!isStandalone) {
      return; // Only show for installed PWA
    }

    // Check if welcome message already shown
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);

    if (welcomeShown !== 'true') {
      // Show welcome message after a short delay
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  if (!showWelcome) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Welcome Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-scale-in border-2 border-teal-500 dark:border-teal-600">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">⚽</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text-primary mb-2">
              Welcome to Football Director!
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
              You're now running the installed app
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-dark-text-primary mb-1">
                  Play Offline
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Your saves are stored locally. Play anytime, anywhere, even without internet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-dark-text-primary mb-1">
                  Lightning Fast
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Assets are cached for instant loading. No more waiting around!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-dark-text-primary mb-1">
                  Full-Screen Experience
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Enjoy the app without browser chrome. More screen space for your team!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-dark-text-primary mb-1">
                  Automatic Updates
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-text-secondary">
                  Get new features automatically. You'll be notified when updates are ready.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 mb-6 border border-teal-200 dark:border-teal-700">
            <h3 className="font-semibold text-teal-900 dark:text-teal-100 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Quick Tips
            </h3>
            <ul className="space-y-1 text-sm text-teal-800 dark:text-teal-200">
              <li>• Your saves sync with browser localStorage</li>
              <li>• Use the save menu to manage multiple careers</li>
              <li>• Check Settings for dark mode and other preferences</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
