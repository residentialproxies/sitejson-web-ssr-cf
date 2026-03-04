'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'glass' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hover = false,
  glow = false,
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-white border-ink-200',
    glass: 'glass border-white/30',
    outlined: 'bg-transparent border-ink-200',
  };

  const cardContent = (
    <div
      className={cn(
        'rounded-xl border shadow-sm',
        'text-ink-900',
        variants[variant],
        hover && 'card-lift cursor-pointer',
        glow && 'hover:shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );

  return cardContent;
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn(
      'font-serif font-medium leading-tight tracking-tight text-ink-900',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p
    className={cn('text-sm text-ink-500 leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center p-6 pt-0 gap-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
