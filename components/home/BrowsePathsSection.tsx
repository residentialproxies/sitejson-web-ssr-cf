import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Layers, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getDirectoryTypeLinks } from '@/lib/pseo';

const icons = [Compass, Layers, Tag];
const iconColors = [
  'bg-clay-100 text-clay-700',
  'bg-ochre-100 text-ochre-700',
  'bg-sage-100 text-sage-700',
];

export function BrowsePathsSection() {
  const links = getDirectoryTypeLinks();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-600">Discover without a domain name</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Start with the question, not the answer.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Pick the browse path that matches your research goal. Explore by industry category, technology stack, or editorial topic — then jump into live reports for the sites that stand out.
            </p>
          </div>
          <Link href="/directory" className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
            See all browse paths
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {links.map((link, index) => {
            const Icon = icons[index];
            const colorClass = iconColors[index];
            return (
              <Link key={link.href} href={link.href as Route} className="block h-full">
                <Card hover className="h-full border-slate-200 bg-slate-50/70 transition-all hover:border-clay-200 hover:bg-white">
                  <CardHeader>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}>
                      <Icon size={20} />
                    </div>
                    <CardTitle className="text-xl">{link.label}</CardTitle>
                    <CardDescription className="leading-relaxed">{link.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Open browse hub</span>
                    <ArrowRight size={15} className="text-clay-600" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
