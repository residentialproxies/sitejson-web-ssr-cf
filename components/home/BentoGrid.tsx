'use client';

import React from 'react';
import { Activity, Layers, Network, ShieldCheck, TrendingUp, Cpu, Database, Server, Code as Code2, Globe, Box, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export const BentoGrid: React.FC = () => {
  return (
    <section className="py-24 bg-clay-50/40 relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-sage-100/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-clay-100/25 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay-600 mb-4">What&rsquo;s inside a profile</p>
          <h2 className="font-serif font-medium text-ink-900 mb-4">
            50+ data points.{' '}
            <span className="text-ink-500">One structured output.</span>
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed">
            Every domain profile combines visual analysis, traffic signals, technology fingerprinting, network mapping, and AI legitimacy scoring into a single, queryable JSON object.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]">

          {/* Visual & Brand — tall card */}
          <div className="col-span-1 md:col-span-2 row-span-2">
            <Card hover className="h-full overflow-hidden relative group flex flex-col bg-white border-slate-200">
              <div className="p-6 pb-3">
                <div className="flex items-center gap-2.5 text-ink-900 font-semibold mb-1">
                  <div className="p-2 rounded-xl bg-clay-100 text-clay-600">
                    <Layers size={18} />
                  </div>
                  <h3 className="font-serif text-xl font-medium">Visual &amp; Brand Analysis</h3>
                </div>
                <p className="text-ink-500 text-sm leading-6">
                  Automated screenshots, UI scoring, and brand color extraction via computer vision.
                </p>
              </div>

              <div className="flex-1 px-6 pb-6">
                <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-inner">
                  <div className="h-8 bg-white border-b border-slate-200 flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
                    <div className="ml-3 flex-1 h-4 bg-slate-100 rounded border border-slate-200"></div>
                  </div>
                  <div className="flex-1 bg-white p-4 relative overflow-hidden">
                    <div className="w-full h-32 bg-gradient-to-br from-clay-50 to-sage-50 rounded-lg border border-slate-100 mb-4 flex items-center justify-center">
                      <Globe className="text-clay-300 opacity-50" size={40} />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 h-20 bg-slate-50 rounded-lg border border-slate-100"></div>
                      <div className="flex-1 h-20 bg-slate-50 rounded-lg border border-slate-100"></div>
                      <div className="flex-1 h-20 bg-slate-50 rounded-lg border border-slate-100"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-clay-200 shadow-xl rounded-xl p-3 flex items-center gap-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-clay-50 flex items-center justify-center text-clay-600">
                        <Activity size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink-800">UI Score: 98/100</div>
                        <div className="text-[10px] text-ink-400 font-mono">Brand: #D97757</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Traffic card */}
          <div className="col-span-1">
            <Card hover className="h-full p-6 flex flex-col justify-between bg-white border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-sage-100 text-sage-600">
                  <TrendingUp size={18} />
                </div>
                <span className="text-xs font-mono bg-sage-50 text-sage-700 px-2 py-0.5 rounded-full border border-sage-200">+12%</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-ink-900 font-mono tracking-tight">1.2M</div>
                <div className="text-sm text-ink-500 mt-0.5">Monthly Visits</div>
              </div>
              <div className="h-10 w-full flex items-end gap-1 mt-4">
                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-sage-200 rounded-sm transition-all hover:bg-sage-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Tech fingerprinting */}
          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-white border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 rounded-xl bg-ochre-100 text-ochre-600">
                  <Cpu size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-ink-900">Tech Fingerprinting</h3>
              </div>
              <p className="text-xs text-ink-500 mb-5 leading-5">
                500+ technologies detected — CMS, frameworks, analytics, and payment providers.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Code2 size={18} />, label: 'React', color: 'bg-clay-100 text-clay-600' },
                  { icon: <Server size={18} />, label: 'Node', color: 'bg-sage-100 text-sage-600' },
                  { icon: <Database size={18} />, label: 'SQL', color: 'bg-ochre-100 text-ochre-600' },
                  { icon: <Box size={18} />, label: 'Docker', color: 'bg-clay-100 text-clay-600' },
                  { icon: <Globe size={18} />, label: 'CDN', color: 'bg-sage-100 text-sage-600' },
                  { icon: <Zap size={18} />, label: 'Vercel', color: 'bg-ochre-100 text-ochre-600' },
                ].map((tech, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 cursor-default transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5"
                  >
                    <div className={cn('p-2 rounded-lg transition-colors', tech.color)}>
                      {tech.icon}
                    </div>
                    <span className="text-[10px] font-medium text-ink-400">{tech.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ownership / network card */}
          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-white/10 text-clay-300">
                  <Network size={18} />
                </div>
                <h3 className="font-serif text-base font-medium">Network Mapping</h3>
              </div>
              <p className="text-sm text-slate-300 mb-5 leading-6">
                Uncover hidden ownership via shared AdSense IDs, analytics tags, and infrastructure overlap.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-clay-600 border-2 border-ink-800 flex items-center justify-center text-xs font-bold">A</div>
                  <div className="w-8 h-8 rounded-full bg-sage-600 border-2 border-ink-800 flex items-center justify-center text-xs font-bold">B</div>
                  <div className="w-8 h-8 rounded-full bg-ochre-700 border-2 border-ink-800 flex items-center justify-center text-xs font-bold">+5</div>
                </div>
                <span className="text-xs font-mono text-clay-300">pub-8192…</span>
              </div>
            </Card>
          </div>

          {/* AI legitimacy score */}
          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-clay-100 text-clay-600">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="font-serif text-base font-medium text-ink-900">Trust Score</h3>
                </div>
                <span className="text-2xl font-bold text-clay-600 font-mono">98</span>
              </div>
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[98%] bg-gradient-to-r from-sage-400 to-clay-500 rounded-full" />
              </div>
              <p className="mt-4 text-xs text-ink-500 leading-5">
                AI legitimacy analysis detects phishing, spam, and parked domains in real time.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};
