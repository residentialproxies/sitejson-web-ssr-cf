'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useSWR from 'swr';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { SearchBar } from '@/components/site/SearchBar';
import { Button } from '@/components/ui/Button';

type SessionState = {
  authenticated: boolean;
  plan: 'anonymous' | 'free' | 'pro';
  user?: {
    login?: string | null;
  };
};

const primaryLinks = [
  { href: '/directory', label: 'Directory' },
  { href: '/directory/category', label: 'Categories' },
  { href: '/directory/technology', label: 'Tech Stacks' },
  { href: '/directory/topic', label: 'Topics' },
] as const;

const fetcher = async (url: string): Promise<SessionState> => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return { authenticated: false, plan: 'anonymous' };
  }
  return response.json() as Promise<SessionState>;
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, isLoading } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const mobileMenuId = 'primary-mobile-menu';

  const showAuthedNav = !isLoading && Boolean(session?.authenticated);
  const closeMobileMenu = () => setMobileOpen(false);
  const navigateTo = (href: string) => {
    window.location.assign(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <div className="rounded-md bg-clay-500 p-1.5 text-white">
            <LayoutGrid size={18} />
          </div>
          <span className="hidden font-serif sm:inline-block">SiteJson</span>
        </Link>

        {!isHomePage && (
          <div className="hidden max-w-md flex-1 md:block">
            <SearchBar
              variant="compact"
              placeholder="Search any domain..."
              ariaLabel="Search for a domain report"
            />
          </div>
        )}

        <nav className="hidden items-center gap-4 text-sm font-medium text-ink-600 lg:flex">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink-900">
              {link.label}
            </Link>
          ))}
          <a href="https://api.sitejson.com/api/docs" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink-900">
            API Docs
          </a>
        </nav>

        <div className="hidden items-center gap-4 text-sm font-medium text-ink-600 md:flex">
          {showAuthedNav ? (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-ink-900">Dashboard</Link>
              <button type="button" className="transition-colors hover:text-ink-900" onClick={() => navigateTo('/api/auth/logout')}>Logout</button>
            </>
          ) : (
            <button type="button" className="transition-colors hover:text-ink-900" onClick={() => navigateTo('/api/auth/github/start')}>GitHub Login</button>
          )}
          {showAuthedNav ? (
            <Link href="/dashboard">
              <Button variant="clay" size="sm">Manage API Key</Button>
            </Link>
          ) : (
            <Button variant="clay" size="sm" onClick={() => navigateTo('/api/auth/github/start')}>Get API Key</Button>
          )}
        </div>

        <button
          type="button"
          className="text-ink-500 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-controls={mobileMenuId}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div id={mobileMenuId} className="border-t border-ink-200 bg-white px-4 py-4 md:hidden">
          {!isHomePage && (
            <SearchBar
              variant="compact"
              placeholder="Search any domain..."
              ariaLabel="Search for a domain report"
            />
          )}
          <div className="mt-4 grid gap-3 text-sm font-medium text-ink-700">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl border border-ink-200 px-4 py-3 hover:bg-ink-50" onClick={closeMobileMenu}>
                {link.label}
              </Link>
            ))}
            <a href="https://api.sitejson.com/api/docs" target="_blank" rel="noreferrer" className="rounded-xl border border-ink-200 px-4 py-3 hover:bg-ink-50" onClick={closeMobileMenu}>
              API Docs
            </a>
            {showAuthedNav ? (
              <>
                <Link href="/dashboard" className="rounded-xl border border-ink-200 px-4 py-3 hover:bg-ink-50" onClick={closeMobileMenu}>Dashboard</Link>
                <button type="button" className="rounded-xl border border-ink-200 px-4 py-3 text-left hover:bg-ink-50" onClick={() => { closeMobileMenu(); navigateTo('/api/auth/logout'); }}>Logout</button>
              </>
            ) : (
              <button type="button" className="rounded-xl border border-ink-200 px-4 py-3 text-left hover:bg-ink-50" onClick={() => { closeMobileMenu(); navigateTo('/api/auth/github/start'); }}>GitHub Login</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
