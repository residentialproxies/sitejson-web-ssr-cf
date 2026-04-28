import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Binoculars, Code2, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { USE_CASE_CARDS } from '@/lib/pseo';

const icons = [Binoculars, Filter, Code2];

export function UseCasesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">User-friendly flows</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            Every major page now points to the next useful action.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Instead of dead-end pages, the experience should help people investigate, qualify, and only then decide
            whether they need the API.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {USE_CASE_CARDS.map((item, index) => {
            const Icon = icons[index];
            return (
              <Card key={item.title} className="h-full border-slate-200 bg-slate-50/70">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-100 text-sage-700">
                    <Icon size={22} />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={item.href as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-sage-700 hover:text-sage-800">
                    {item.cta} <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
