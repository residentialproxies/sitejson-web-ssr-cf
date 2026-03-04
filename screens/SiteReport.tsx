"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSiteData } from '../hooks/use-site-poll';
import { fetchAlternatives } from '../services/api';
import { StatusPoller } from '../components/site/StatusPoller';
import { Button } from '../components/ui/Button';
import { RefreshCw, ExternalLink, AlertCircle, ChevronRight, Code2, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { cn, getRankBadgeColor, formatNumber, getRelativeTime, normalizeDirectorySlug } from '../lib/utils';
import type { AlternativeSite } from '../lib/api-client/types';

import { IdentityCard } from '../components/site/IdentityCard';
import { MarketTrafficCard } from '../components/site/MarketTrafficCard';
import { InfrastructureCard } from '../components/site/InfrastructureCard';
import { SeoStructureCard } from '../components/site/SeoStructureCard';
import { MonetizationCard } from '../components/site/MonetizationCard';
import { AiInsightsCard } from '../components/site/AiInsightsCard';

interface SiteReportProps {
  domain: string;
}

const SiteReport: React.FC<SiteReportProps> = ({ domain }) => {
  const { data, isStale, isLoading, isProcessing, progress, error, refresh, statusMessage } = useSiteData(domain);
  const [alternatives, setAlternatives] = useState<AlternativeSite[]>([]);

  useEffect(() => {
    if (!data?.domain) return;
    fetchAlternatives(data.domain).then(setAlternatives);
  }, [data?.domain]);

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 inline-block mb-6">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-rose-900 mb-2">Analysis Failed</h2>
            <p className="text-rose-700">{error}</p>
        </div>
        <div>
             <Button onClick={refresh} variant="outline">Try Again</Button>
        </div>
      </div>
    );
  }

  if (isLoading || isProcessing || !data) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
             <StatusPoller progress={progress} message={statusMessage} />
        </div>
    );
  }

  const ai = data.aiAnalysis;
  const globalRank = data.radar?.globalRank ?? data.trafficData?.globalRank;
  const isSafe = ai ? ai.risk?.sentiment === 'Professional' : true;
  const categorySlug = data.taxonomy?.iabCategory ? normalizeDirectorySlug(data.taxonomy.iabCategory) : '';

  return (
    <div className="bg-slate-50/50 min-h-screen pb-20 font-sans">

      {/* Stale Data Banner */}
      {isStale && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="container mx-auto max-w-7xl flex items-center justify-between">
            <span className="text-sm text-amber-800">Data may be outdated. Click Refresh to update.</span>
            <Button variant="outline" size="sm" onClick={refresh} className="text-amber-700 border-amber-300 hover:bg-amber-100 gap-1">
              <RefreshCw size={12} /> Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Link href="/" className="hover:text-slate-900">Home</Link>
                <ChevronRight size={12} />
                <Link href="/directory/category/technology" className="hover:text-slate-900">Directory</Link>
                <ChevronRight size={12} />
                <Link href={`/data/${data.domain}`} className="hover:text-slate-900">Data</Link>
                <ChevronRight size={12} />
                <span className="text-slate-900 font-medium">{data.domain}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=64`}
                        alt="favicon"
                        className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-none">{data.domain}</h1>
                        <div className="flex items-center gap-2 mt-1.5">
                             {typeof globalRank === 'number' && globalRank > 0 && (
                               <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border", getRankBadgeColor(globalRank))}>
                                  #{formatNumber(globalRank)} Global
                               </span>
                             )}
                             {ai && (
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1",
                                    isSafe ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                )}>
                                    {isSafe ? <ShieldCheck size={10}/> : <ShieldAlert size={10}/>}
                                    {ai.risk?.score ?? 0}/100 Trust
                                </span>
                             )}
                             {data.updatedAt && (
                               <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                 <Clock size={10} /> {getRelativeTime(data.updatedAt)}
                               </span>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} className="text-slate-600 gap-2">
                        <RefreshCw size={14} /> Refresh
                    </Button>
                    <Link href={`/data/${data.domain}`}>
                      <Button variant="primary" size="sm" className="gap-2">
                          <Code2 size={14} /> Full Report
                      </Button>
                    </Link>
                    <a href={`https://${data.domain}`} target="_blank" rel="noreferrer">
                         <Button variant="secondary" size="icon" className="w-9 h-9">
                             <ExternalLink size={16} />
                         </Button>
                    </a>
                </div>
            </div>
        </div>
      </div>

      {/* Mission Control Grid */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-full">
                <IdentityCard data={data} />
            </div>

            <div className="col-span-1 lg:col-span-1">
                <MarketTrafficCard data={data} />
            </div>

            <div className="col-span-1 lg:col-span-1">
                <InfrastructureCard data={data} />
            </div>

            <div className="col-span-1 lg:col-span-1">
                <SeoStructureCard data={data} />
            </div>

            <div className="col-span-1 lg:col-span-1">
                <MonetizationCard data={data} />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <AiInsightsCard data={data} />
            </div>

        </div>

        {/* Bottom / Internal Links */}
        <div className="mt-12 pt-12 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 className="font-bold text-slate-900 mb-4">Alternatives to {data.domain}</h3>
                <div className="flex flex-wrap gap-3">
                    {alternatives.length > 0 ? (
                      alternatives.slice(0, 6).map(alt => (
                        <Link key={alt.domain} href={`/site/${alt.domain}`} className="text-sm text-slate-500 hover:text-blue-600 cursor-pointer underline decoration-slate-300 underline-offset-4">
                          {alt.domain}
                        </Link>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">No alternatives found yet</span>
                    )}
                </div>
            </div>
            <div>
                 <h3 className="font-bold text-slate-900 mb-4">Explore More</h3>
                 <div className="flex flex-wrap gap-3">
                    {data.taxonomy?.iabCategory && categorySlug && (
                        <Link href={`/directory/category/${categorySlug}`} className="text-sm text-slate-500 hover:text-blue-600 underline decoration-slate-300 underline-offset-4">
                            Top {data.taxonomy.iabCategory} Sites
                        </Link>
                    )}
                     <Link href="/directory/category/technology" className="text-sm text-slate-500 hover:text-blue-600 underline decoration-slate-300 underline-offset-4">
                        Popular Technologies
                     </Link>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SiteReport;
