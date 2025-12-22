interface Props {
  className?: string;
  variant?: 'text' | 'card' | 'circle';
}

export function Skeleton({ className = '', variant = 'text' }: Props) {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary';

  const variantClass = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    circle: 'rounded-full',
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
