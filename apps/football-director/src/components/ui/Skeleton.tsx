/**
 * Skeleton Component
 * Loading placeholder with animated pulse effect
 */

interface Props {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'button';
}

export function Skeleton({ className = '', variant = 'text' }: Props) {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary';

  const variantClass = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    circle: 'rounded-full',
    button: 'h-11 rounded-lg',
  }[variant];

  return <div className={`${baseClass} ${variantClass} ${className}`} />;
}

// Example usage components
export function PlayerCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-5 border border-gray-200 dark:border-dark-border-primary">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton className="w-32 mb-2" />
          <Skeleton className="w-20" />
        </div>
      </div>
      <Skeleton className="w-full h-20" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 border border-gray-200 dark:border-dark-border-primary">
      <Skeleton className="w-16 mb-2" />
      <Skeleton className="w-24 h-8 mb-2" />
      <Skeleton className="w-20" />
    </div>
  );
}

/**
 * Match Card Skeleton
 * Loading placeholder for fixtures page
 */
export function MatchCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 border border-gray-200 dark:border-dark-border-primary">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-8" />
        <Skeleton className="w-16 h-8" />
        <Skeleton className="w-24 h-8" />
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 * Loading placeholder for league table
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 dark:border-dark-border-secondary">
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-4"><Skeleton className="w-32" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-8" /></td>
      <td className="py-3 px-2"><Skeleton className="w-12" /></td>
    </tr>
  );
}
