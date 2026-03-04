'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'clay' | 'sage';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  shimmer?: boolean;
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  shimmer = false,
  glow = false,
  children,
  type,
  ...props
}) => {
  const baseStyles = cn(
    'relative inline-flex items-center justify-center font-medium transition-all duration-base ease-spring',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-400 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-lg overflow-hidden',
    shimmer && 'btn-shimmer',
    glow && 'hover:shadow-glow',
    className
  );

  const variants = {
    primary: cn(
      'bg-ink-900 text-white',
      'hover:bg-ink-800 hover:shadow-lg',
      'hover:-translate-y-px',
      'active:scale-[0.98]',
      'shadow-md'
    ),
    secondary: cn(
      'bg-clay-100 text-ink-800',
      'hover:bg-clay-200 hover:shadow-md',
      'hover:-translate-y-px',
      'active:scale-[0.98]'
    ),
    outline: cn(
      'border-2 border-ink-200 bg-transparent',
      'text-ink-700 hover:bg-ink-50 hover:border-ink-300',
      'hover:-translate-y-px',
      'active:scale-[0.98]'
    ),
    ghost: cn(
      'bg-transparent text-ink-600',
      'hover:bg-ink-100 hover:text-ink-900',
      'hover:-translate-y-px',
      'active:scale-[0.98]'
    ),
    clay: cn(
      'bg-clay-500 text-white',
      'hover:bg-clay-600 hover:shadow-lg',
      'hover:-translate-y-px',
      'active:scale-[0.98]',
      'shadow-md shadow-clay-200'
    ),
    sage: cn(
      'bg-sage-500 text-white',
      'hover:bg-sage-600 hover:shadow-lg',
      'hover:-translate-y-px',
      'active:scale-[0.98]',
      'shadow-md shadow-sage-200'
    ),
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-11 px-6 text-base gap-2',
    lg: 'h-14 px-8 text-lg gap-2.5',
    icon: 'h-11 w-11 flex items-center justify-center p-0',
  };

  return (
    <button
      type={type ?? 'button'}
      className={cn(baseStyles, variants[variant], sizes[size])}
      {...props}
    >
      {children}
    </button>
  );
};

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  variant = 'ghost',
  size = 'md',
  children,
  type,
  ...props
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const variants = {
    primary: 'bg-clay-500 text-white hover:bg-clay-600',
    secondary: 'bg-clay-100 text-ink-700 hover:bg-clay-200',
    ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-700',
  };

  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-400',
        'hover:-translate-y-px active:scale-95',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
