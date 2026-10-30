import type React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface NavTabProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
  className?: string;
}

export function NavTab({
  to,
  label,
  icon,
  badge,
  badgeColor,
  className,
}: NavTabProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 select-none',
        isActive
          ? 'bg-[#F5760A] text-white shadow-sm font-semibold'
          : 'text-[#A8A199] hover:text-[#F7F5F2] hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.12)]',
        className
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex-shrink-0 transition-colors',
            isActive ? 'text-white' : 'text-[#A8A199]'
          )}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>

      {badge !== undefined && (
        <span
          className={cn(
            'ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums leading-tight',
            isActive
              ? 'bg-black/30 text-white'
              : 'bg-[rgba(239,68,68,0.2)] text-[#EF4444]'
          )}
          style={badgeColor && !isActive ? { color: badgeColor, backgroundColor: `${badgeColor}25` } : undefined}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

export default NavTab;
