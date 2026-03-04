'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'avatar';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  animate = true,
  ...props
}) => {
  const variants = {
    default: 'rounded-lg',
    card: 'rounded-xl',
    text: 'rounded-md',
    circle: 'rounded-full',
    avatar: 'rounded-full',
  };

  const sizeStyles = {
    avatar: 'w-10 h-10',
    circle: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'bg-ink-200/50',
        variants[variant],
        sizeStyles[variant as keyof typeof sizeStyles],
        animate && 'animate-pulse',
        className
      )}
      style={{
        width,
        height,
      }}
      {...props}
    />
  );
};

// Skeleton text with multiple lines
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className,
  lastLineWidth = '60%',
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4 w-full"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
};

// Skeleton card with header, content, and footer
export const SkeletonCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-200 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-1/3" />
          <Skeleton variant="text" className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} className="mb-4" />
      <Skeleton variant="default" className="h-32 w-full" />
    </div>
  );
};

// Animated skeleton with shimmer effect
interface ShimmerSkeletonProps extends SkeletonProps {
  shimmerColor?: string;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  className,
  shimmerColor = 'bg-gradient-to-r from-transparent via-white/20 to-transparent',
  ...props
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Skeleton className="w-full h-full" {...props} />
      <div className={cn('absolute inset-0 animate-pulse', shimmerColor)} />
    </div>
  );
};

// Stats skeleton for dashboard cards
export const SkeletonStats: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      <Skeleton variant="text" className="h-3 w-20" />
      <Skeleton variant="text" className="h-8 w-32" />
      <div className="flex items-center gap-2">
        <Skeleton variant="text" className="h-3 w-12" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  );
};

// Table row skeleton
export const SkeletonTableRow: React.FC<{ columns?: number }> = ({
  columns = 4,
}) => {
  return (
    <div className="flex items-center gap-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            'h-4',
            i === 0 ? 'w-1/4' : i === columns - 1 ? 'w-16' : 'flex-1'
          )}
        />
      ))}
    </div>
  );
};
