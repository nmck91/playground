import Link from 'next/link';

interface Props {
  icon: string;
  label: string;
  href: string;
  gradient: string; // e.g., "from-blue-500 to-blue-600"
  badge?: number;
  onClick?: () => void;
}

export function GradientButton({ icon, label, href, gradient, badge, onClick }: Props) {
  const className = `
    relative flex items-center justify-between h-14 px-5 rounded-xl
    bg-gradient-to-r ${gradient} hover:shadow-lg
    text-white font-semibold
    active:scale-98 transition-all
  `;

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-base">{label}</span>
      </div>
      {badge && (
        <span className="bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {badge}
        </span>
      )}
      <span className="text-white/60">›</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
