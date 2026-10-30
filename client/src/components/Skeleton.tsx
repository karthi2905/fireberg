import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('bg-[var(--border-hairline)] rounded-[6px] animate-pulse', className)}
    />
  );
}
