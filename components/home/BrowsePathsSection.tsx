import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Layers, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getDirectoryTypeLinks } from '@/lib/pseo';

const icons = [Compass, Layers, Tag];

export function BrowsePathsSection() {
  const links = getDirectoryTypeLinks();

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Browse first</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            Pick the discovery path that matches your question.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            SiteJSON now behaves more like a research tool than a marketing landing page: browse by market, technology,
            or topic, then jump straight into live reports.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {links.map((link, index) => {
            const Icon = icons[index];
            return (
              <Link key={link.href} href={link.href as Route} className="block h-full">
                <Card hover className="h-full border-slate-200 bg-slate-50/80">
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-100 text-clay-700">
                      <Icon size={22} />
                    </div>
                    <CardTitle className="text-2xl">{link.label}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>Open browse hub</span>
                    <ArrowRight size={16} className="text-clay-600" />
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
