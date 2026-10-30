import type React from 'react';
import { cn } from '../../lib/utils';
import { ShieldAlert, AlertTriangle, Flame, CheckCircle, Info, Radio } from 'lucide-react';

export type StatusType =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'reported'
  | 'in-progress'
  | 'contained'
  | 'resolved'
  | 'active'
  | 'nominal';

export interface StatusPillProps {
  status: StatusType | string;
  label?: string;
  icon?: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export function StatusPill({
  status,
  label,
  icon,
  pulse = false,
  className,
}: StatusPillProps) {
  const normalized = status.toLowerCase();

  let defaultColor = '#A8A199';
  let defaultBg = 'rgba(255, 255, 255, 0.08)';
  let defaultBorder = 'rgba(255, 255, 255, 0.12)';
  let defaultIcon: React.ReactNode = <Info size={12} />;

  switch (normalized) {
    case 'critical':
      defaultColor = '#EF4444';
      defaultBg = 'rgba(239, 68, 68, 0.16)';
      defaultBorder = 'rgba(239, 68, 68, 0.35)';
      defaultIcon = <Flame size={12} />;
      break;
    case 'high':
      defaultColor = '#FB923C';
      defaultBg = 'rgba(251, 146, 60, 0.16)';
      defaultBorder = 'rgba(251, 146, 60, 0.35)';
      defaultIcon = <AlertTriangle size={12} />;
      break;
    case 'medium':
    case 'in-progress':
      defaultColor = '#F59E0B';
      defaultBg = 'rgba(245, 158, 11, 0.16)';
      defaultBorder = 'rgba(245, 158, 11, 0.35)';
      defaultIcon = <Radio size={12} />;
      break;
    case 'low':
    case 'contained':
    case 'resolved':
    case 'nominal':
      defaultColor = '#22C55E';
      defaultBg = 'rgba(34, 197, 94, 0.16)';
      defaultBorder = 'rgba(34, 197, 94, 0.35)';
      defaultIcon = <CheckCircle size={12} />;
      break;
    case 'reported':
      defaultColor = '#FB923C';
      defaultBg = 'rgba(251, 146, 60, 0.16)';
      defaultBorder = 'rgba(251, 146, 60, 0.35)';
      defaultIcon = <ShieldAlert size={12} />;
      break;
    case 'active':
      defaultColor = '#F5760A';
      defaultBg = 'rgba(245, 118, 10, 0.16)';
      defaultBorder = 'rgba(245, 118, 10, 0.35)';
      defaultIcon = <Flame size={12} />;
      break;
  }

  const displayLabel =
    label ||
    (normalized === 'in-progress'
      ? 'In Progress'
      : normalized.charAt(0).toUpperCase() + normalized.slice(1));

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase',
        className
      )}
      style={{
        color: defaultColor,
        backgroundColor: defaultBg,
        border: `1px solid ${defaultBorder}`,
      }}
    >
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-ping mr-0.5"
          style={{ backgroundColor: defaultColor }}
        />
      )}
      <span className="flex-shrink-0">{icon || defaultIcon}</span>
      <span>{displayLabel}</span>
    </span>
  );
}

export default StatusPill;
