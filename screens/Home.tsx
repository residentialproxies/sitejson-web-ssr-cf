'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { HeroSection } from '../components/home/HeroSection';
import { CheckCircle2, Globe2, Server, Zap, Database, Code2, Cpu, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import { PricingSection } from '../components/home/PricingSection';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA } from '@/lib/auth/session';

const BentoGrid = dynamic(
  () => import('../components/home/BentoGrid').then((mod) => mod.BentoGrid),
  {
    ssr: false,
    loading: () => (
      <section className="py-24 bg-clay-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <div className="h-8 w-2/3 mx-auto bg-ink-100 rounded-lg animate-pulse mb-4" />
            <div className="h-5 w-1/2 mx-auto bg-ink-100 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl border border-ink-200 animate-pulse ${i === 0 ? 'col-span-1 md:col-span-2 row-span-2 h-[400px]' : 'h-[180px]'}`}
              />
            ))}
          </div>
        </div>
      </section>
    ),
  },
);

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Pricing */}
      <PricingSection />

      {/* 3. Trust Bar */}
      <div className="border-y border-slate-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 border-b border-slate-50 pb-8">
            {[
              { label: 'Starter Requests', value: String(FREE_STARTER_CREDITS) },
              { label: 'Free Plan', value: `${FREE_RATE_LIMIT_RPM} req/min` },
              { label: 'API Access', value: 'Key required' },
              { label: 'Pro Plan', value: `${PRO_MONTHLY_QUOTA}/cycle` },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center md:items-start">
                <span className="text-2xl md:text-3xl font-bold text-slate-900 font-mono tracking-tight">{stat.value}</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              Compatible with your stack
            </span>
            <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 group cursor-default">
                <Server size={20} className="text-emerald-600" />
                <span className="font-semibold text-slate-700 group-hover:text-emerald-700">Node.js</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <Code2 size={20} className="text-blue-600" />
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">Python</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <Zap size={20} className="text-sky-500" />
                <span className="font-semibold text-slate-700 group-hover:text-sky-600">Go</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <Cpu size={20} className="text-orange-600" />
                <span className="font-semibold text-slate-700 group-hover:text-orange-700">Rust</span>
              </div>
              <div className="flex items-center gap-2 group cursor-default">
                <Database size={20} className="text-indigo-500" />
                <span className="font-semibold text-slate-700 group-hover:text-indigo-600">PHP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bento Grid Features */}
      <BentoGrid />

      {/* 5. Use Cases */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Automate Lead Qualification</h3>
              <p className="text-slate-600 leading-relaxed">
                Filter spam and prioritize high-value accounts instantly by analyzing company domains.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-blue-500" /> Filter spam signups</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-blue-500" /> Prioritize high-traffic leads</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-2">
                <Server size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Prevent Domain Fraud</h3>
              <p className="text-slate-600 leading-relaxed">
                Block phishing URLs and verify business legitimacy in real-time.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-indigo-500" /> Real-time scam detection</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-indigo-500" /> Monitor parked domains</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-2">
                <Globe2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Map the Competition</h3>
              <p className="text-slate-600 leading-relaxed">
                Track tech adoption trends and benchmark traffic stats at scale.
              </p>
              <ul className="space-y-2 pt-2">
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-emerald-500" /> Analyze tech stack trends</li>
                <li className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="text-emerald-500" /> Benchmark traffic stats</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SEO & Exploration Links */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Explore the Data</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-3">
              <Link href="/directory/category/technology" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Top 100 SaaS Companies</Link>
              <Link href="/directory/category/marketing" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Fastest Growing AI Tools</Link>
              <Link href="/directory/technology/shopify" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Most Popular Shopify Stores</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/directory/technology/nextjs" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Sites built with Next.js</Link>
              <Link href="/directory/technology/nextjs" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Next.js Showcases</Link>
              <Link href="/directory/technology/tailwindcss" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Tailwind CSS Examples</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/directory/topic/finance" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Top Finance Websites</Link>
              <Link href="/directory/topic/healthcare" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Healthcare Trends</Link>
              <Link href="/directory/topic/education" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Education Platforms</Link>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/data/google.com" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Analyze google.com</Link>
              <Link href="/data/amazon.com" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Analyze amazon.com</Link>
              <Link href="/data/notion.so" className="text-sm text-slate-600 hover:text-blue-600 hover:underline">Analyze notion.so</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Footer */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">GitHub login unlocks your free API key.</h2>
          <p className="text-slate-400 text-lg mb-8">
            Anonymous API access is disabled.
            <br />
            Sign in with GitHub for {FREE_STARTER_CREDITS} one-time starter requests, a signed API key, and {FREE_RATE_LIMIT_RPM} req/min. Pro adds {PRO_MONTHLY_QUOTA} requests per billing cycle and is manually activated for now.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api/auth/github/start">
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8 h-12 text-base">
                Get API Key
                <ArrowRight size={18} />
              </Button>
            </a>
            <a href="/data/openai.com">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 h-12 text-base">
                View Live Example
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
