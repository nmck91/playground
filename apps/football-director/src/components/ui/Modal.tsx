/**
 * Modal Component
 * Reusable modal wrapper with sticky header and optional footer
 */

'use client';

import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop with enhanced blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal with glass-morphism */}
      <div
        className={`relative glass rounded-2xl shadow-2xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-scale-in`}
      >
        {/* Header with gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-500 to-teal-600 dark:from-dark-teal-600 dark:to-dark-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 dark:bg-dark-bg-tertiary/50 dark:hover:bg-dark-bg-tertiary flex items-center justify-center text-white transition-all active:scale-95"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white dark:bg-dark-bg-secondary">
          {children}
        </div>

        {/* Footer (sticky, optional) */}
        {footer && (
          <div className="sticky bottom-0 z-10 bg-white dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border-primary px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
