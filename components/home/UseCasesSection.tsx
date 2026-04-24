import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, ChartBar as BarChart2, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { USE_CASE_CARDS } from '@/lib/pseo';

const icons = [BarChart2, ShieldCheck, Zap];
const iconColors = [
  'bg-clay-100 text-clay-700',
  'bg-ochre-100 text-ochre-700',
  'bg-sage-100 text-sage-700',
];

export function UseCasesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-600">How people use it</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            From first look to full workflow.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Whether you are doing a quick qualification check or building a repeatable data pipeline, every workflow starts with a live report and ends with a better decision.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {USE_CASE_CARDS.map((item, index) => {
            const Icon = icons[index];
            const colorClass = iconColors[index];
            return (
              <Card key={item.title} className="h-full border-slate-200 bg-slate-50/60 transition-all hover:border-clay-200 hover:bg-white hover:shadow-sm">
                <CardHeader>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}>
                    <Icon size={20} />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={item.href as Route} className="inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800 transition-colors">
                    {item.cta} <ArrowRight size={15} />
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
