import type React from 'react';
import { cn } from '../../lib/utils';

export interface CircleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  badgeCount?: number;
  badgeDot?: boolean;
  badgeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export function CircleIconButton({
  icon,
  badgeCount,
  badgeDot,
  badgeColor = '#EF4444',
  size = 'md',
  active = false,
  className,
  ...props
}: CircleIconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-[38px] h-[38px] text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all duration-150',
        'bg-[var(--bg-panel-raised)] hover:bg-[var(--bg-surface-hover)] active:scale-95',
        'border border-[var(--border-hairline)] hover:border-[var(--border-strong)]',
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm',
        active && 'bg-[#F5760A] text-white border-transparent hover:bg-[#E06800] hover:text-white',
        sizeClasses,
        className
      )}
      {...props}
    >
      {icon}

      {/* Unread badge count */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold text-white flex items-center justify-center tabular-nums leading-none shadow-sm"
          style={{ backgroundColor: badgeColor }}
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}

      {/* Unread badge dot */}
      {badgeDot && !badgeCount && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-[var(--bg-canvas)]"
          style={{ backgroundColor: badgeColor }}
        />
      )}
    </button>
  );
}

export default CircleIconButton;
