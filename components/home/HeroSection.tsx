'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, ChartBar as BarChart2, Search, ShieldCheck, Globe, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS } from '@/lib/auth/session';

type CodeViewerProps = { domain: string };

const demoDomains = ['openai.com', 'stripe.com', 'vercel.com', 'figma.com'] as const;

const dataPoints = [
  { label: 'Monthly visits', value: '1.2M', sub: 'Estimated traffic' },
  { label: 'Tech stack', value: '14', sub: 'Detected signals' },
  { label: 'Trust score', value: '97', sub: 'AI legitimacy' },
  { label: 'Global rank', value: '#312', sub: 'Semrush / Radar' },
] as const;

const signalPills = [
  { label: 'Traffic estimates', icon: BarChart2 },
  { label: 'SEO structure', icon: Search },
  { label: 'Tech detection', icon: Layers },
  { label: 'Trust scoring', icon: ShieldCheck },
  { label: 'DNS & infra', icon: Globe },
] as const;

const quickLinks = [
  { href: '/directory', label: 'Browse directory' },
  { href: '/directory/technology', label: 'Tech stacks' },
  { href: '/directory/topic', label: 'Topics' },
  { href: '/data/openai.com', label: 'Sample report' },
] as const;

const CodeViewerFallback = () => (
  <div className="h-full min-h-[360px] w-full rounded-[1.75rem] border border-slate-200 bg-white/70 shadow-xl" />
);

const DeferredCodeViewer = dynamic<CodeViewerProps>(
  () => import('./CodeViewer').then((mod) => mod.CodeViewer),
  { ssr: false, loading: () => <CodeViewerFallback /> },
);

const normalizeDomain = (value: string): string => (
  value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
);

const isValidDomain = (value: string): boolean => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(value);

export const HeroSection: React.FC = () => {
  const [demoDomain, setDemoDomain] = useState<string>(demoDomains[0]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [shouldRenderCodeViewer, setShouldRenderCodeViewer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldRenderCodeViewer(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inputValue) return;
    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % demoDomains.length;
      setDemoDomain(demoDomains[index]);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [inputValue]);

  const handleAnalyze = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanDomain = normalizeDomain(inputValue || demoDomain);
    if (!isValidDomain(cleanDomain)) {
      setError('Enter a valid domain like linear.app or https://linear.app');
      return;
    }
    setError('');
    router.push(`/data/${cleanDomain}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) setError('');
  };

  const displayDomain = inputValue || demoDomain;

  return (
    <section className="relative overflow-hidden bg-clay-50 pb-24 pt-16 lg:pb-28 lg:pt-24">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">

          {/* Left column */}
          <div className="flex flex-col gap-7">
            <Badge variant="clay" dot pulse className="w-fit">
              50+ data points per domain — traffic, tech, trust &amp; more
            </Badge>

            <div>
              <h1 className="max-w-2xl font-serif font-medium leading-[1.04] text-ink-900">
                Site data for any domain,{' '}
                <span className="text-gradient">structured as JSON.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
                Enter any URL and get back traffic estimates, SEO signals, technology fingerprints,
                DNS infrastructure, business classification, and AI trust scoring — all in one structured response.
              </p>
            </div>

            {/* Signal pills */}
            <div className="flex flex-wrap gap-2">
              {signalPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-700"
                  >
                    <Icon size={13} className="text-clay-500" />
                    {pill.label}
                  </span>
                );
              })}
            </div>

            {/* Search form */}
            <form onSubmit={handleAnalyze} className="max-w-xl">
              <label htmlFor="hero-domain" className="sr-only">Look up a domain</label>
              <div className="relative rounded-[1.5rem] border border-white/70 bg-white/85 p-2 shadow-xl shadow-clay-100/60 backdrop-blur">
                <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-400">
                  <Search size={20} />
                </div>
                <input
                  id="hero-domain"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby="hero-domain-help hero-domain-error"
                  placeholder={`Try ${demoDomain}`}
                  className="block w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-36 text-lg font-medium text-ink-900 outline-none placeholder:text-ink-400"
                />
                <div className="absolute inset-y-2 right-2">
                  <Button type="submit" variant="clay" className="h-full rounded-xl px-6 font-semibold" shimmer>
                    Look up site
                  </Button>
                </div>
              </div>
              <p id="hero-domain-help" className="mt-3 text-sm text-ink-500">
                One free live report, no sign-in required. Unlock {FREE_STARTER_CREDITS} API requests at {FREE_RATE_LIMIT_RPM} req/min when you sign in with GitHub.
              </p>
              {error && (
                <p id="hero-domain-error" className="mt-2 text-sm text-rose-600">{error}</p>
              )}
            </form>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/directory">
                <Button size="lg" variant="clay" glow>
                  Browse site directory
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/data/openai.com">
                <Button variant="outline" size="lg">View sample report</Button>
              </Link>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-clay-200 hover:text-clay-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right column — data preview */}
          <div className="flex flex-col gap-4">
            {/* Mini stat grid */}
            <div className="grid grid-cols-4 gap-2">
              {dataPoints.map((dp) => (
                <div key={dp.label} className="rounded-2xl border border-white/70 bg-white/80 px-3 py-3 text-center shadow-sm">
                  <p className="font-mono text-xl font-bold text-ink-900">{dp.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">{dp.sub}</p>
                </div>
              ))}
            </div>

            {/* JSON preview panel */}
            <div className="rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-2xl shadow-clay-100/70 backdrop-blur">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">Structured site data</p>
                  <p className="mt-0.5 text-sm font-medium text-ink-800">JSON response preview</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-semibold text-ink-700">
                  <Layers size={13} />
                  {displayDomain}
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner">
                <div className="min-h-[340px]">
                  {shouldRenderCodeViewer ? <DeferredCodeViewer domain={displayDomain} /> : <CodeViewerFallback />}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
