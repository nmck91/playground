/**
 * StatCard Component
 * Display card for individual statistics with optional trend indicator
 */

'use client';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string | number;
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({
  label,
  value,
  trend,
  trendValue,
  icon,
  variant = 'default',
}: StatCardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-dark-bg-secondary border-gray-200 dark:border-dark-border-primary',
    primary: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
  };

  const trendClasses = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      className={`border rounded-lg p-4 ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">
            {icon && <span className="mr-2">{icon}</span>}
            {value}
          </p>
          {trend && trendValue !== undefined && (
            <p className={`mt-1 text-sm ${trendClasses[trend]}`}>
              <span className="font-medium">{trendIcons[trend]}</span>{' '}
              {trendValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
