'use client';

import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { useGameState } from '../../hooks/useGameState';

interface MenuItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

export default function MorePage() {
  const { gameState } = useGameState();
  const unreadNews = gameState?.newsFeed?.filter(n => !n.read).length || 0;

  const menuItems: MenuItem[] = [
    { label: 'League Table', icon: '📊', href: '/table' },
    { label: 'Statistics', icon: '📈', href: '/stats' },
    { label: 'Staff', icon: '👔', href: '/staff' },
    { label: 'Club Records', icon: '🏆', href: '/records' },
    { label: 'Trophy Cabinet', icon: '🏆', href: '/trophies' },
    { label: 'News', icon: '📰', href: '/news', badge: unreadNews },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-bg-primary pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 px-4 py-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white">More</h1>
          <ThemeToggle />
        </div>
      </div>

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
          <button className="flex items-center justify-between w-full h-14 px-5 bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary hover:shadow-md active:scale-98 transition-all text-red-600 dark:text-red-400">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🗑️</span>
              <span className="text-base font-medium">Delete Save</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
