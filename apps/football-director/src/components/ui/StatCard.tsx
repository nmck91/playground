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
    default: 'bg-white border-gray-200',
    primary: 'bg-teal-50 border-teal-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
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
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
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
