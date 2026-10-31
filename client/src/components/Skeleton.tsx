import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('bg-[var(--bg-surface-active)] rounded-[6px] animate-pulse', className)}
    />
  );
}
