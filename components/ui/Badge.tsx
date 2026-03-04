'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'clay' | 'sage' | 'ochre' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  pulse = false,
  dot = false,
  ...props
}) => {
  const variants = {
    default: 'bg-ink-900 text-white border-transparent',
    secondary: 'bg-ink-100 text-ink-700 border-ink-200',
    outline: 'bg-transparent text-ink-600 border-ink-300',
    clay: 'bg-clay-100 text-clay-700 border-clay-200',
    sage: 'bg-sage-100 text-sage-700 border-sage-200',
    ochre: 'bg-ochre-100 text-ochre-700 border-ochre-200',
    success: 'bg-sage-100 text-sage-700 border-sage-200',
    warning: 'bg-ochre-100 text-ochre-700 border-ochre-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-clay-100 text-clay-700 border-clay-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const dotColors = {
    default: 'bg-ink-400',
    secondary: 'bg-ink-400',
    outline: 'bg-ink-400',
    clay: 'bg-clay-500',
    sage: 'bg-sage-500',
    ochre: 'bg-ochre-500',
    success: 'bg-sage-500',
    warning: 'bg-ochre-500',
    danger: 'bg-red-500',
    info: 'bg-clay-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-all duration-fast',
        'hover:scale-[1.02]',
        'focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('relative mr-1.5 inline-flex h-1.5 w-1.5 rounded-full', dotColors[variant])}>
          {pulse && (
            <span
              className={cn(
                'absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
        </span>
      )}
      {children}
    </span>
  );
};

// Status badge with icon
interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'processing';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
}) => {
  const statusConfig = {
    online: { color: 'bg-sage-500', label: 'Online' },
    offline: { color: 'bg-ink-400', label: 'Offline' },
    warning: { color: 'bg-ochre-500', label: 'Warning' },
    processing: { color: 'bg-clay-500', label: 'Processing' },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        'bg-ink-100 text-ink-700',
        className
      )}
    >
      <span className={cn('relative flex h-2 w-2')}>
        {status === 'processing' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.color
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.color)} />
      </span>
      {children || config.label}
    </span>
  );
};

// Number badge (for notifications/counts)
interface NumberBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export const NumberBadge: React.FC<NumberBadgeProps> = ({
  count,
  max = 99,
  className,
}) => {
  const display = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full',
        'bg-clay-500 px-1.5 text-[10px] font-bold text-white',
        className
      )}
    >
      {display}
    </span>
  );
};
