import type React from 'react';
import { cn } from '../../lib/utils';
import GlassCard from './GlassCard';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    text: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  accentColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  accentColor,
  className,
}: StatCardProps) {
  return (
    <GlassCard className={cn('p-4 flex flex-col justify-between min-w-[140px]', className)}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
        {icon && (
          <div className="opacity-80">
            {icon}
          </div>
        )}
      </div>

      <div className="my-0.5">
        <span
          className="text-[26px] md:text-[28px] font-bold text-[var(--text-primary)] tabular-nums tracking-tight leading-none"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {value}
        </span>
      </div>

      {(subValue || trend) && (
        <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-[var(--border-hairline)]">
          {trend && (
            <span
              className={cn(
                'text-[11px] font-medium px-1.5 py-0.5 rounded',
                trend.neutral
                  ? 'bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
                  : trend.isPositive
                  ? 'bg-[rgba(34,197,94,0.14)] text-[#22C55E]'
                  : 'bg-[rgba(239,68,68,0.14)] text-[#EF4444]'
              )}
            >
              {trend.text}
            </span>
          )}
          {subValue && (
            <span className="text-[11px] text-[var(--text-secondary)] truncate font-normal">
              {subValue}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
}

export default StatCard;
