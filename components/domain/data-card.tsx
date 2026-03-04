'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DataRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}

export function DataRow({ label, value, mono = false, className }: DataRowProps) {
  return (
    <div className={cn('flex justify-between items-start py-2 border-b border-gray-100 last:border-0', className)}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className={cn('text-sm text-gray-900 text-right max-w-[60%]', mono && 'font-mono text-xs')}>
        {value}
      </span>
    </div>
  );
}

interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function DataCard({ title, icon, children, className, headerAction }: DataCardProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {headerAction}
      </div>
      <div className="px-4 py-2">
        {children}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

export function StatusBadge({ status, trueLabel = 'Yes', falseLabel = 'No' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        status
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-50 text-gray-500 border border-gray-200'
      )}
    >
      {status ? trueLabel : falseLabel}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number;
  max?: number;
}

export function ScoreBadge({ score, max = 100 }: ScoreBadgeProps) {
  const percentage = (score / max) * 100;
  let colorClass = 'bg-red-50 text-red-700 border-red-200';
  if (percentage >= 80) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  else if (percentage >= 60) colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  else if (percentage >= 40) colorClass = 'bg-orange-50 text-orange-700 border-orange-200';

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', colorClass)}>
      {score}/{max}
    </span>
  );
}

interface TagListProps {
  tags: string[];
  variant?: 'default' | 'outline';
}

export function TagList({ tags, variant = 'default' }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs',
            variant === 'default'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-white text-gray-600 border border-gray-200'
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
