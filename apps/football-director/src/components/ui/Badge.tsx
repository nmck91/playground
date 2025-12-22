/**
 * Badge Component
 * Versatile badge for notifications, positions, and status indicators
 */

'use client';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export function Badge({ children, variant = 'default', size = 'md', dot = false }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300',
    primary: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-gray-400 dark:bg-gray-500',
    primary: 'bg-teal-500 dark:bg-teal-400',
    success: 'bg-green-500 dark:bg-green-400',
    warning: 'bg-yellow-500 dark:bg-yellow-400',
    danger: 'bg-red-500 dark:bg-red-400',
    info: 'bg-blue-500 dark:bg-blue-400',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {dot && (
        <span
          className={`mr-1.5 h-2 w-2 rounded-full ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Position Badge Component
 * Specialized badge for league table positions
 */
export interface PositionBadgeProps {
  position: number;
  totalTeams?: number;
}

export function PositionBadge({ position, totalTeams = 20 }: PositionBadgeProps) {
  let variant: BadgeProps['variant'] = 'default';

  // Top 4 = Champions League (success)
  if (position <= 4) {
    variant = 'success';
  }
  // 5-6 = Europa League (info)
  else if (position <= 6) {
    variant = 'info';
  }
  // Bottom 3 = Relegation (danger)
  else if (position > totalTeams - 3) {
    variant = 'danger';
  }

  return (
    <Badge variant={variant} size="sm">
      {position}
    </Badge>
  );
}

/**
 * Notification Badge Component
 * Small badge for notification counts
 */
export interface NotificationBadgeProps {
  count: number;
  max?: number;
}

export function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
      {displayCount}
    </span>
  );
}
