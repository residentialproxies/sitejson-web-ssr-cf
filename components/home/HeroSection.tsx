'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, ChartBar as BarChart3, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS } from '@/lib/auth/session';

type CodeViewerProps = { domain: string };

const demoDomains = ['openai.com', 'stripe.com', 'vercel.com', 'figma.com'] as const;

const quickLinks = [
  { href: '/directory', label: 'Browse directory' },
  { href: '/directory/technology', label: 'Tech stacks' },
  { href: '/directory/topic', label: 'Topics' },
  { href: '/data/openai.com', label: 'Sample report' },
] as const;

const heroSignals = [
  { label: 'Traffic signals', value: 'Visits, rank & audience data', icon: BarChart3 },
  { label: 'SEO structure', value: 'Indexability, headings & links', icon: Search },
  { label: 'Trust score', value: 'AI legitimacy & risk analysis', icon: ShieldCheck },
] as const;

const workflowSteps = [
  { step: '01', label: 'Enter any domain', detail: 'Paste a URL or pick from the demos' },
  { step: '02', label: 'Get the full profile', detail: 'Traffic, SEO, tech, trust in one view' },
  { step: '03', label: 'Act on the data', detail: 'Research, qualify, or call the API' },
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
    <section className="relative overflow-hidden bg-clay-50 pb-20 pt-14 lg:pb-28 lg:pt-24">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Subtle decorative orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-clay-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-sage-100/30 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-start">

          {/* Left column */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="clay" dot pulse className="w-fit">
                Website intelligence for analysts &amp; growth teams
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 px-3 py-1 text-xs font-semibold text-sage-700">
                <Sparkles size={11} />
                AI-powered trust scoring
              </span>
            </div>

            <div>
              <h1 className="max-w-2xl font-serif font-medium leading-[1.02] text-ink-900">
                Turn any domain into{' '}
                <span className="text-gradient">structured intelligence</span>.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600">
                Enter a URL and instantly get traffic estimates, SEO structure, technology stack, business classification, and an AI trust score — all as clean, queryable JSON.
              </p>
            </div>

            {/* Search form */}
            <form onSubmit={handleAnalyze} className="max-w-xl">
              <label htmlFor="hero-domain" className="sr-only">Analyze a domain</label>
              <div className="relative rounded-[1.5rem] border border-white/70 bg-white/90 p-2 shadow-xl shadow-clay-100/60 backdrop-blur">
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
                  className="block w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-36 text-base font-medium text-ink-900 outline-none placeholder:text-ink-400"
                />
                <div className="absolute inset-y-2 right-2">
                  <Button type="submit" variant="clay" className="h-full rounded-xl px-5 text-sm font-semibold" shimmer>
                    Analyze site
                  </Button>
                </div>
              </div>
              <p id="hero-domain-help" className="mt-3 text-sm text-ink-500">
                Free to explore — unlock {FREE_STARTER_CREDITS} API requests and {FREE_RATE_LIMIT_RPM} req/min when you sign in with GitHub.
              </p>
              <p id="hero-domain-error" role="alert" className={`mt-2 text-sm ${error ? 'text-rose-600' : 'text-transparent'}`}>
                {error || 'Valid domain format required'}
              </p>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link href="/directory">
                <Button size="lg" variant="clay" glow>
                  Browse markets first
                  <ArrowRight size={17} />
                </Button>
              </Link>
              <Link href="/data/openai.com">
                <Button variant="outline" size="lg">View sample report</Button>
              </Link>
            </div>

            {/* Workflow steps */}
            <div className="grid gap-3 sm:grid-cols-3">
              {workflowSteps.map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/60 bg-white/75 px-4 py-3.5 backdrop-blur-sm">
                  <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-clay-500">{item.step}</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink-900">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-500">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-ink-700 transition hover:border-clay-300 hover:bg-white hover:text-clay-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right column — live preview panel */}
          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-2xl shadow-clay-100/60 backdrop-blur">
            {/* Signal cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {heroSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between">
                      <Icon size={16} className="text-clay-600" />
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-400" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-1.5 text-xs font-medium leading-5 text-slate-700">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Code preview */}
            <div className="mt-4 rounded-[1.6rem] border border-slate-800 bg-slate-950 p-4 text-white shadow-inner">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">JSON output preview</p>
                  <p className="mt-1 text-xs text-slate-300">The same dataset powers both the visual report and the API response.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay-400" />
                  {displayDomain}
                </div>
              </div>
              <div className="min-h-[360px]">
                {shouldRenderCodeViewer ? <DeferredCodeViewer domain={displayDomain} /> : <CodeViewerFallback />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
