/**
 * Install Prompt Component
 * Shows a prompt to install the app as PWA
 */

'use client';

import { useEffect, useState } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-slide-up">
      <div className="glass rounded-xl p-4 shadow-2xl border border-teal-400">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚽</span>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-dark-text-primary mb-1">
              Install Football Director
            </h3>
            <p className="text-sm text-slate-600 dark:text-dark-text-secondary mb-3">
              Add to your home screen for quick access and offline play
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 h-10 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all"
              >
                Install
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 h-10 text-slate-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
