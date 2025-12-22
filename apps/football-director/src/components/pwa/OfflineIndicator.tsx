/**
 * Offline Indicator Component
 * Shows when the user is offline
 */

'use client';

import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="glass rounded-full px-4 py-2 shadow-lg border border-orange-400">
        <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
          <span>📡</span>
          <span>Offline Mode</span>
        </div>
      </div>
    </div>
  );
}
