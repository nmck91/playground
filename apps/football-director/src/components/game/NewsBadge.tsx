/**
 * Football Director - News Badge Component
 * Notification badge with unread news count
 */

'use client';

interface NewsBadgeProps {
  unreadCount: number;
  onClick: () => void;
}

export function NewsBadge({ unreadCount, onClick }: NewsBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="relative bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-normal inline-flex items-center"
    >
      📰 News
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
