'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, Search, Sparkles, Github } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

type CodeViewerProps = {
  domain: string;
};

const CodeViewerFallback: React.FC = () => (
  <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 bg-white/70 shadow-2xl" />
);

const DeferredCodeViewer = dynamic<CodeViewerProps>(
  () => import('./CodeViewer').then((mod) => mod.CodeViewer),
  {
    ssr: false,
    loading: () => <CodeViewerFallback />,
  },
);

export const HeroSection: React.FC = () => {
  const [demoDomain, setDemoDomain] = useState('openai.com');
  const [inputValue, setInputValue] = useState('');
  const [shouldRenderCodeViewer, setShouldRenderCodeViewer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShouldRenderCodeViewer(true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!inputValue) {
      const domains = ['stripe.com', 'vercel.com', 'figma.com', 'linear.app'];
      let i = 0;
      const interval = setInterval(() => {
        setDemoDomain(domains[i]);
        i = (i + 1) % domains.length;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputValue || demoDomain;
    const cleanDomain = raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleanDomain || !cleanDomain.includes('.')) {
      return;
    }

    router.push(`/data/${cleanDomain}`);
  };

  const displayDomain = inputValue || demoDomain;

  return (
    <section className="relative w-full overflow-hidden bg-clay-50 pt-16 pb-24 lg:pt-32 lg:pb-32">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute top-20 left-[10%] w-64 h-64 bg-clay-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-sage-200/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ochre-100/15 rounded-full blur-3xl" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div>
              <Badge
                variant="clay"
                dot
                pulse
                className="mb-2"
              >
                No credit card required
              </Badge>
            </div>

            <h1 className="font-serif font-medium text-ink-900 leading-[1.1]">
              Website intelligence,{' '}
              <span className="text-gradient">
                structured data.
              </span>
            </h1>

            <p className="text-lg text-ink-600 max-w-xl leading-relaxed">
              Start instantly with Anonymous access at 60 req/min. Sign in with GitHub to unlock 200 req/min, free API
              key management, a personal dashboard, and usage tracking.
            </p>

            <div className="mt-4 w-full max-w-md">
              <form onSubmit={handleAnalyze} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-400 group-focus-within:text-clay-500 transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Enter a domain to analyze (e.g. linear.app)"
                  className="block w-full rounded-xl border-2 border-ink-200 bg-white/80 backdrop-blur-sm py-4 pl-12 pr-32 text-ink-900 placeholder:text-ink-400 focus:border-clay-400 focus:ring-4 focus:ring-clay-400/10 transition-all shadow-lg text-lg font-medium"
                  value={inputValue}
                  onChange={handleInputChange}
                />
                <div className="absolute inset-y-2 right-2">
                  <Button
                    type="submit"
                    variant="clay"
                    className="h-full rounded-lg px-6 font-semibold"
                    shimmer
                  >
                    Analyze
                  </Button>
                </div>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <Sparkles size={14} className="text-ochre-500" />
                  No credit card required
                </span>
                <span className="hidden sm:inline text-ink-300">•</span>
                <span>Anonymous: 60 req/min</span>
                <span className="hidden sm:inline text-ink-300">•</span>
                <span>GitHub Free: 200 req/min + dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <a href="/data/openai.com">
                <Button size="lg" variant="clay" shimmer glow>
                  Try It Now
                  <ArrowRight size={18} />
                </Button>
              </a>
              <a href="/api/auth/github/start">
                <Button variant="outline" size="lg">
                  <Github size={18} />
                  GitHub Login for Free API Key
                </Button>
              </a>
            </div>
          </div>

          <div className="relative h-[500px] w-full">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-clay-300/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-sage-300/30 rounded-full blur-3xl" />

            <div
              className="relative h-full transition-transform duration-300 ease-out hover:scale-[1.01]"
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            >
              {shouldRenderCodeViewer ? (
                <DeferredCodeViewer domain={displayDomain} />
              ) : (
                <CodeViewerFallback />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
