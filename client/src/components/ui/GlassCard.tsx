import type React from 'react';
import { cn } from '../../lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className,
  elevated = false,
  hoverable = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200',
        elevated
          ? 'glass-panel-elevated'
          : 'glass-panel',
        hoverable && 'glass-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default GlassCard;
