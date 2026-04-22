'use client';

import React from 'react';
import { Activity, Layers, Network, ShieldCheck, TrendingUp, Cpu, Database, Server, Code2, Globe, Box, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

export const BentoGrid: React.FC = () => {
  return (
    <section className="py-24 bg-clay-50/50 relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-clay-100/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-serif font-medium text-ink-900 mb-4">
            More than just a screenshot. <br/>
            <span className="text-ink-500">Full X-Ray vision for any URL.</span>
          </h2>
          <p className="text-lg text-ink-600">
            We aggregate 50+ data points from DNS, HTML, and Traffic providers to give you the complete picture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
          <div className="col-span-1 md:col-span-2 row-span-2">
            <Card hover className="h-full overflow-hidden relative group flex flex-col bg-white">
              <div className="p-6 pb-2">
                <div className="flex items-center gap-2 text-ink-900 font-semibold mb-1">
                  <div className="p-2 rounded-lg bg-clay-100 text-clay-600">
                    <Layers size={20} />
                  </div>
                  <h3 className="font-serif text-xl">Visual & Brand Analysis</h3>
                </div>
                <p className="text-ink-500 text-sm">
                  Automated screenshots, UI scoring, and brand color extraction via computer vision.
                </p>
              </div>

              <div className="flex-1 px-6 pb-6 relative">
                <div className="w-full h-full bg-ink-50 rounded-lg border border-ink-200 overflow-hidden flex flex-col shadow-inner">
                  <div className="h-8 bg-white border-b border-ink-200 flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-clay-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-ochre-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-sage-200"></div>
                    <div className="ml-3 flex-1 h-4 bg-ink-50 rounded border border-ink-100"></div>
                  </div>
                  <div className="flex-1 bg-white p-4 relative overflow-hidden">
                    <div className="w-full h-32 bg-gradient-to-br from-clay-50 to-sage-50 rounded-lg border border-ink-100 mb-4 flex items-center justify-center">
                      <div className="text-clay-200 text-4xl opacity-40"><Globe /></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1/3 h-20 bg-ink-50 rounded-lg border border-ink-100"></div>
                      <div className="w-1/3 h-20 bg-ink-50 rounded-lg border border-ink-100"></div>
                      <div className="w-1/3 h-20 bg-ink-50 rounded-lg border border-ink-100"></div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-md border border-clay-200 shadow-xl rounded-xl p-3 flex items-center gap-3 z-10">
                      <div className="w-8 h-8 rounded-full bg-clay-50 flex items-center justify-center text-clay-600">
                        <Activity size={16} />
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

          <div className="col-span-1">
            <Card hover className="h-full p-6 flex flex-col justify-between bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-sage-100 text-sage-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs font-mono bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-ink-900 font-mono">1.2M</div>
                <div className="text-sm text-ink-500">Monthly Visits</div>
              </div>
              <div className="h-12 w-full flex items-end gap-1 mt-4">
                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-sage-200 rounded-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-ochre-100 text-ochre-600">
                  <Cpu size={20} />
                </div>
                <h3 className="font-serif text-lg font-medium text-ink-900">Technology Fingerprinting</h3>
              </div>
              <p className="text-xs text-ink-500 mb-6">
                Detect 500+ technologies including CMS, frameworks, analytics, and payment processors.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: <Code2 size={20} />, label: 'React', color: 'bg-clay-100 text-clay-600' },
                  { icon: <Server size={20} />, label: 'Node', color: 'bg-sage-100 text-sage-600' },
                  { icon: <Database size={20} />, label: 'SQL', color: 'bg-ochre-100 text-ochre-600' },
                  { icon: <Box size={20} />, label: 'Docker', color: 'bg-clay-100 text-clay-600' },
                  { icon: <Globe size={20} />, label: 'CDN', color: 'bg-sage-100 text-sage-600' },
                  { icon: <Zap size={20} />, label: 'Vercel', color: 'bg-ochre-100 text-ochre-600' },
                ].map((tech, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 group/icon cursor-default transition-transform duration-200 hover:scale-110 hover:-translate-y-0.5"
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

          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-white/10 text-clay-300">
                  <Network size={20} />
                </div>
                <h3 className="font-serif text-lg font-medium">Ownership & Networks</h3>
              </div>
              <div className="text-sm text-ink-300 mb-4">
                Uncover hidden connections. Map domains via shared AdSense IDs and analytics tags.
              </div>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-clay-600 border-2 border-ink-800 flex items-center justify-center text-xs">A</div>
                  <div className="w-8 h-8 rounded-full bg-sage-600 border-2 border-ink-800 flex items-center justify-center text-xs">B</div>
                  <div className="w-8 h-8 rounded-full bg-ochre-700 border-2 border-ink-800 flex items-center justify-center text-xs">+5</div>
                </div>
                <span className="text-xs font-mono text-clay-300">pub-8192...</span>
              </div>
            </Card>
          </div>

          <div className="col-span-1">
            <Card hover className="h-full p-6 bg-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-clay-100 text-clay-600">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink-900">AI Legitimacy Score</h3>
                </div>
                <span className="text-2xl font-bold text-clay-600">98</span>
              </div>
              <div className="relative h-2 bg-ink-100 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[98%] bg-gradient-to-r from-sage-400 to-clay-500" />
              </div>
              <p className="mt-4 text-xs text-ink-500">
                Multi-modal AI analysis to detect phishing, spam, and parked domains instantly.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
