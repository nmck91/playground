'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useGameStore, useSaveStore } from '../../stores';

interface MenuItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export default function MorePage() {
  const gameState = useGameStore((state) => state.gameState);
  const currentSaveSlot = useGameStore((state) => state.currentSaveSlot);
  const deleteSave = useSaveStore((state) => state.deleteSave);
  const resetGame = useGameStore((state) => state.resetGame);
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const unreadNews = gameState?.newsFeed?.filter(n => !n.read).length || 0;

  const menuItems: MenuItem[] = [
    { label: 'League Table', icon: '📊', href: '/table' },
    { label: 'Cup Competition', icon: '🏆', href: '/cup' },
    { label: 'Statistics', icon: '📈', href: '/stats' },
    { label: 'Staff', icon: '👔', href: '/staff' },
    { label: 'Club Records', icon: '📅', href: '/records' },
    { label: 'Trophy Cabinet', icon: '🏅', href: '/trophies' },
    { label: 'News', icon: '📰', href: '/news', badge: unreadNews },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-dark-bg-secondary border-b border-gray-200 dark:border-dark-border-primary">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-900 dark:text-dark-text-primary hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <span className="text-2xl">←</span>
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-dark-text-primary">More</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between h-14 px-5 bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary hover:shadow-md active:scale-98 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-base font-medium text-slate-900 dark:text-dark-text-primary">
                  {item.label}
                </span>
              </div>
              {item.badge ? (
                <span className="bg-red-500 text-white text-sm font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                  {item.badge}
                </span>
              ) : (
                <span className="text-gray-400">›</span>
              )}
            </Link>
          ))}
        </div>

        {/* Settings Section */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-dark-text-tertiary uppercase tracking-wide mb-3 px-1">
            Settings
          </h2>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-between w-full h-14 px-5 bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary hover:shadow-md active:scale-98 transition-all text-red-600 dark:text-red-400"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">🗑️</span>
              <span className="text-base font-medium">Delete Save</span>
            </div>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-dark-text-primary mb-4">
              Delete Save?
            </h3>
            <p className="text-slate-600 dark:text-dark-text-secondary mb-6">
              Are you sure you want to delete your save? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-slate-900 dark:text-dark-text-primary font-semibold rounded-lg transition-all active:scale-98"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (currentSaveSlot !== null) {
                    await deleteSave(currentSaveSlot);
                    resetGame();
                  }
                  setShowDeleteConfirm(false);
                  router.push('/');
                }}
                className="flex-1 px-4 py-3 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-lg transition-all active:scale-98"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
