'use client';

import { useState, ReactNode } from 'react';

interface Props {
  title: string | ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl border border-gray-200 dark:border-dark-border-primary overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center h-14 justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
      >
        {typeof title === 'string' ? (
          <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text-primary">
            {title}
          </h3>
        ) : (
          <div className="flex-1">{title}</div>
        )}
        <span className={`text-gray-400 dark:text-dark-text-tertiary transition-transform ml-3 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-dark-border-secondary animate-slide-up">
          {children}
        </div>
      )}
    </div>
  );
}
