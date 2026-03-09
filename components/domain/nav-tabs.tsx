'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Cpu, Search, BarChart3, Briefcase, Users, LucideIcon } from 'lucide-react';

interface NavTabsProps {
  domain: string;
}

interface Tab {
  name: string;
  href: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { name: 'Overview', href: '', icon: LayoutGrid },
  { name: 'Tech Stack', href: '/tech', icon: Cpu },
  { name: 'SEO Signals', href: '/seo', icon: Search },
  { name: 'Traffic', href: '/traffic', icon: BarChart3 },
  { name: 'Business', href: '/business', icon: Briefcase },
  { name: 'Alternatives', href: '/alternatives', icon: Users },
];

export function NavTabs({ domain }: NavTabsProps) {
  const pathname = usePathname();
  const basePath = `/data/${domain}`;

  return (
    <nav aria-label="Report sections" className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.href}`;
          const isActive = tab.href === '' ? pathname === basePath : pathname === href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={href as `/data/${string}`}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-clay-50 text-clay-700 shadow-sm ring-1 ring-clay-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
