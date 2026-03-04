"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Menu } from 'lucide-react';
import { SearchBar } from '../site/SearchBar';
import { Button } from '../ui/Button';

type SessionState = {
  authenticated: boolean;
  plan: 'anonymous' | 'github' | 'pro';
  user?: {
    login?: string | null;
  };
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [session, setSession] = useState<SessionState>({
    authenticated: false,
    plan: 'anonymous',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as SessionState;
        if (active) {
          setSession(payload);
        }
      } catch {
        // Intentionally ignore auth fetch failures to keep navigation resilient.
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadSession();
    return () => {
      active = false;
    };
  }, []);

  const showAuthedNav = !loading && session.authenticated;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <div className="bg-clay-500 text-white p-1.5 rounded-md">
            <LayoutGrid size={18} />
          </div>
          <span className="hidden sm:inline-block font-serif">SiteJson</span>
        </Link>

        {!isHomePage && (
          <div className="flex-1 max-w-md hidden md:block animate-in fade-in slide-in-from-top-2 duration-300">
            <SearchBar variant="compact" placeholder="Search any domain..." />
          </div>
        )}

        <nav className="flex items-center gap-4 text-sm font-medium text-ink-600">
          <Link href="/directory/category/technology" className="hidden md:block hover:text-ink-900 transition-colors">Directory</Link>
          <Link href="/playground" className="hidden md:block hover:text-ink-900 transition-colors">Playground</Link>
          <Link href="/#pricing" className="hidden md:block hover:text-ink-900 transition-colors">API Pricing</Link>
          <div className="h-4 w-px bg-ink-200 hidden md:block" />

          {showAuthedNav ? (
            <>
              <Link href="/dashboard" className="hover:text-ink-900 transition-colors">
                Dashboard
              </Link>
              <a href="/api/auth/logout" className="hover:text-ink-900 transition-colors">
                Logout
              </a>
            </>
          ) : (
            <a href="/api/auth/github/start" className="hover:text-ink-900 transition-colors">
              Login with GitHub
            </a>
          )}

          <a href={showAuthedNav ? "/dashboard" : "/api/auth/github/start"} className="hidden sm:flex">
            <Button variant="clay" size="sm">
              {showAuthedNav ? 'Manage API Key' : 'Get Free API Key'}
            </Button>
          </a>

          <button className="md:hidden text-ink-500" aria-label="Open menu">
            <Menu size={24} />
          </button>
        </nav>
      </div>
    </header>
  );
};
