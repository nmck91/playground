/**
 * Tabs Component
 * Tab navigation for multi-section modals and pages
 */

'use client';

import { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  badge?: number | string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-dark-border-primary">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-4 py-2 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-gray-500 dark:text-dark-text-tertiary hover:text-gray-700 dark:hover:text-dark-text-secondary hover:border-gray-300 dark:hover:border-dark-border-secondary'
                  }
                `}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400'
                        : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-600 dark:text-dark-text-secondary'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={tab.id === activeTab ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
