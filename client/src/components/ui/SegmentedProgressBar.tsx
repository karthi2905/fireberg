import { cn } from '../../lib/utils';

export interface SegmentedProgressBarProps {
  label: string;
  value: number; // 0 to 100 or relative to max
  max?: number;
  totalSegments?: number;
  valueDisplay?: string;
  color?: string; // hex or CSS color
  subtext?: string;
  className?: string;
}

export function SegmentedProgressBar({
  label,
  value,
  max = 100,
  totalSegments = 16,
  valueDisplay,
  color = '#F5760A',
  subtext,
  className,
}: SegmentedProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const activeCount = Math.round((percentage / 100) * totalSegments);

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--text-primary)]">{label}</span>
        <span className="tabular-nums font-bold text-[var(--text-primary)]">
          {valueDisplay || `${Math.round(percentage)}%`}
        </span>
      </div>

      {/* Segmented Bar */}
      <div className="flex items-center gap-[3px] w-full h-[6px]">
        {Array.from({ length: totalSegments }).map((_, index) => {
          const isActive = index < activeCount;
          return (
            <div
              key={index}
              className={cn(
                'flex-1 h-full rounded-[1px] transition-all duration-300',
                isActive ? 'opacity-100' : 'bg-[var(--bg-surface-active)] opacity-70'
              )}
              style={
                isActive
                  ? {
                      backgroundColor: color,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      {subtext && (
        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5">{subtext}</span>
      )}
    </div>
  );
}

export default SegmentedProgressBar;
