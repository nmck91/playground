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
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-teal-100 text-teal-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-teal-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
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
