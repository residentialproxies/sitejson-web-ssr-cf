import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterGroup = {
  title: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: 'Browse',
    links: [
      { href: '/directory', label: 'Directory hub' },
      { href: '/directory/category', label: 'Category hub' },
      { href: '/directory/technology', label: 'Technology hub' },
      { href: '/directory/topic', label: 'Topic hub' },
    ],
  },
  {
    title: 'Reports',
    links: [
      { href: '/data/openai.com', label: 'OpenAI report' },
      { href: '/data/stripe.com', label: 'Stripe report' },
      { href: '/data/vercel.com', label: 'Vercel report' },
      { href: '/insights', label: 'Insights' },
    ],
  },
  {
    title: 'Product',
    links: [
      { href: 'https://api.sitejson.com/api/docs', label: 'API docs', external: true },
      { href: 'https://api.sitejson.com/api/openapi.json', label: 'OpenAPI spec', external: true },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/rss.xml', label: 'RSS feed' },
    ],
  },
  {
    title: 'Operations',
    links: [
      { href: 'https://api.sitejson.com/api/v1/readyz', label: 'System status', external: true },
      { href: '/data/openai.com/alternatives', label: 'Alternatives example' },
      { href: '/directory/technology/react', label: 'React directory' },
      { href: '/directory/topic/finance', label: 'Finance topic page' },
    ],
  },
];

type UiShellProps = {
  children: React.ReactNode;
};

export const UiShell = ({ children }: UiShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-950">
      <Navbar />
      <main id="main-content" className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="mb-4 text-base font-semibold text-slate-900">{group.title}</h2>
                <ul className="space-y-2.5 text-sm text-slate-500">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-slate-900">
                          {link.label}
                        </a>
                      ) : (
                        <Link href={link.href as Route} className="hover:text-slate-900">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-slate-500" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} SiteJSON. Professional website intelligence for discovery, qualification, and research.
            </p>
            <p className="text-xs text-slate-500">
              Browse first, inspect live reports next, and move into API automation only when the workflow proves useful.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
