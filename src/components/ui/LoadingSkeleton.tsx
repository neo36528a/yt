// ============================================================
// Ultra Video Downloader — LoadingSkeleton Component
// ============================================================

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
    card: 'rounded-2xl h-48',
  };

  return (
    <div
      className={cn(
        'shimmer-skeleton',
        variantClasses[variant],
        className,
      )}
      style={{ width, height }}
    />
  );
}

/** Full video analysis card skeleton */
export function VideoAnalysisSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex flex-col md:flex-row gap-5">
        {/* Thumbnail */}
        <Skeleton variant="rectangular" className="w-full md:w-72 h-40 flex-shrink-0" />

        {/* Info */}
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-3/4 h-6" />
          <Skeleton variant="text" className="w-1/2 h-4" />
          <div className="flex gap-3 mt-3">
            <Skeleton variant="text" className="w-20 h-8 rounded-lg" />
            <Skeleton variant="text" className="w-20 h-8 rounded-lg" />
            <Skeleton variant="text" className="w-20 h-8 rounded-lg" />
          </div>
          <Skeleton variant="text" className="w-40 h-4" />
          <Skeleton variant="text" className="w-32 h-10 rounded-xl mt-3" />
        </div>
      </div>
    </div>
  );
}

/** History card skeleton */
export function HistoryCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-4 space-y-3 animate-pulse">
      <Skeleton variant="rectangular" className="w-full h-32" />
      <Skeleton variant="text" className="w-3/4 h-4" />
      <div className="flex justify-between">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-20 h-3" />
      </div>
    </div>
  );
}
