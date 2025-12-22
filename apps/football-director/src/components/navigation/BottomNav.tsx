'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Squad', icon: '👥', href: '/squad' },
  { label: 'Matches', icon: '⚽', href: '/fixtures' },
  { label: 'Transfers', icon: '💰', href: '/transfers' },
  { label: 'Tactics', icon: '📋', href: '/tactics' },
  { label: 'More', icon: '•••', href: '/more' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      <div className="glass border-t border-gray-200 dark:border-dark-border-primary">
        <div className="flex items-center justify-around h-14 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href) || (item.href === '/more' && !NAV_ITEMS.slice(0, 4).some(i => pathname.startsWith(i.href)));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center flex-1 h-11 gap-0.5
                  rounded-lg transition-all active:scale-95
                  ${isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-gray-600 dark:text-dark-text-secondary'
                  }
                `}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-0 right-1/4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
