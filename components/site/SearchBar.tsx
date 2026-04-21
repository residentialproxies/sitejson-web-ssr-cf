"use client";

import React, { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Loader as Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  variant?: 'hero' | 'compact';
  ariaLabel?: string;
}

const normalizeDomain = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

const isValidDomain = (value: string): boolean =>
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(value);

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "google.com",
  initialValue = "",
  variant = 'hero',
  ariaLabel = 'Search for a domain'
}) => {
  const [input, setInput] = useState(initialValue);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputId = useId();
  const errorId = useId();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = normalizeDomain(input);

    if (!cleanDomain || !isValidDomain(cleanDomain)) {
      setError('Enter a valid domain like stripe.com');
      return;
    }

    setError('');
    setIsSubmitting(true);
    router.push(`/data/${cleanDomain}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative w-full", className)} role="search">
      <div className="relative flex items-center">
        <div className={cn(
          "absolute left-4 text-ink-400",
          variant === 'hero' ? "" : "left-3"
        )}>
          <Search size={variant === 'hero' ? 20 : 16} aria-hidden="true" />
        </div>
        <input
          id={inputId}
          name="domain"
          autoComplete="url"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-full border border-ink-200 bg-white px-4 py-2 outline-none transition-all placeholder:text-ink-400 focus:border-clay-400 focus:ring-4 focus:ring-clay-100 focus-visible:ring-clay-200",
            variant === 'hero' ? "h-14 pl-12 pr-32 text-lg shadow-lg" : "h-10 pl-10 pr-12 text-sm",
            error && "border-rose-400 focus:ring-rose-100"
          )}
        />
        <div className="absolute right-2">
          <Button
            type="submit"
            variant="clay"
            size={variant === 'hero' ? 'md' : 'sm'}
            disabled={isSubmitting}
            aria-label={variant === 'hero' ? undefined : 'Analyze domain'}
            className={cn("rounded-full", variant === 'hero' ? "px-6" : "px-3")}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : variant === 'hero' ? (
              <>
                Analyze <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};
