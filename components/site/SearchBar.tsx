"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  variant?: 'hero' | 'compact';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "google.com",
  initialValue = "",
  variant = 'hero'
}) => {
  const [input, setInput] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic domain validation/cleaning
    const cleanDomain = input
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (cleanDomain && cleanDomain.includes('.')) {
      router.push(`/data/${cleanDomain}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        <div className={cn(
          "absolute left-4 text-ink-400",
          variant === 'hero' ? "" : "left-3"
        )}>
          <Search size={variant === 'hero' ? 20 : 16} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-full border border-ink-200 bg-white px-4 py-2 outline-none transition-all placeholder:text-ink-400 focus:border-clay-400 focus:ring-4 focus:ring-clay-100",
            variant === 'hero' ? "h-14 pl-12 pr-32 text-lg shadow-lg" : "h-10 pl-10 pr-12 text-sm"
          )}
        />
        <div className="absolute right-2">
          <Button
            type="submit"
            variant="clay"
            size={variant === 'hero' ? 'md' : 'sm'}
            className={cn("rounded-full", variant === 'hero' ? "px-6" : "px-3")}
          >
            {variant === 'hero' ? (
              <>
                Analyze <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
