import React from 'react';
import Image from 'next/image';
import type { SiteReport } from '../../lib/api-client/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn, formatNumber } from '../../lib/utils';
import { ShieldAlert, ShieldCheck, Share2, Users, Globe, Cpu } from 'lucide-react';
import { normalizeTrafficDataForDisplay } from '@/lib/traffic-display';

const THUMIO_BASE = 'https://image.thum.io/get/width/1200/noanimate';
const screenshotFallback = (domain: string) => `${THUMIO_BASE}/https://${domain}`;

export const Dashboard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const ai = data.aiAnalysis;
  const traffic = normalizeTrafficDataForDisplay(data.trafficData);
  const meta = data.meta;
  const ads = data.ads;
  const screenshotUrl = data.visual?.screenshotUrl || screenshotFallback(data.domain ?? '');

  const isSafe = ai ? ai.risk?.sentiment === 'Professional' : true;
  const sentimentColor = isSafe ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in zoom-in duration-500">

      {/* 1. Visual Card (Span 2) */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 overflow-hidden flex flex-col">
        <div className="bg-slate-100 border-b border-slate-200 p-2 px-4 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex-1 bg-white rounded-md h-6 mx-4 shadow-sm text-xs flex items-center px-2 text-slate-400">
                {data.domain}
            </div>
        </div>
        <div className="flex-1 relative bg-slate-50 group">
            <div className="aspect-video w-full h-full relative overflow-hidden">
                <Image
                    src={screenshotUrl}
                    alt={`Screenshot of ${data.domain}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
            </div>
        </div>
      </Card>

      {/* 2. AI Insight Card */}
      {ai && (
        <Card className="col-span-1 md:col-span-1 lg:col-span-2 flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-teal-600" /> AI Insight
                    </CardTitle>
                    {data.taxonomy?.iabCategory && (
                      <Badge variant="outline">{data.taxonomy.iabCategory}</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {ai.business?.summary}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                    {data.taxonomy?.tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                            #{tag}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}

      {/* 3. Traffic Stats */}
      <Card className="col-span-1 lg:col-span-1">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Monthly Visits</CardTitle>
        </CardHeader>
        <CardContent>
            {traffic && typeof traffic.monthlyVisits === 'number' ? (
                <>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">{formatNumber(traffic.monthlyVisits)}</span>
                        <span className="text-xs text-emerald-600 font-medium">Est.</span>
                    </div>
                    <div className="mt-4 space-y-2">
                        {typeof traffic.bounceRate === 'number' && (
                          <div className="flex justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1"><Users size={12}/> Bounce Rate</span>
                              <span className="font-medium">{traffic.bounceRate.toFixed(1)}%</span>
                          </div>
                        )}
                        {traffic.topCountry && (
                          <div className="flex justify-between text-xs">
                              <span className="text-slate-500 flex items-center gap-1"><Globe size={12}/> Top Geo</span>
                              <span className="font-medium truncate max-w-[80px]">{traffic.topCountry}</span>
                          </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="text-slate-400 text-sm">No data available</div>
            )}
        </CardContent>
      </Card>

      {/* 4. Risk / Sentiment */}
      <Card className="col-span-1 lg:col-span-1">
         <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[calc(100%-60px)]">
             <div className={cn("rounded-full p-4 mb-3 border-4", sentimentColor.replace('text-', 'border-').replace('bg-', ''))}>
                {ai?.risk?.isSpam ? (
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                ) : (
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                )}
             </div>
             <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", sentimentColor)}>
                {ai?.risk?.sentiment || 'Unknown'}
             </span>
        </CardContent>
      </Card>

      {/* 5. Publisher Network */}
      {ads?.isAdvertiser && (
         <Card className="col-span-1 md:col-span-3 lg:col-span-4 bg-slate-50/50">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900">Advertiser Detected</h4>
                        <p className="text-sm text-slate-500">
                            {typeof ads.resultCount === 'number' ? `${ads.resultCount} ads found` : 'Active in Google Ads Transparency Center'}
                        </p>
                    </div>
                </div>
            </CardContent>
         </Card>
      )}

      {/* 6. Technical Meta */}
      <Card className="col-span-1 md:col-span-3 lg:col-span-4">
          <CardHeader className="py-4 border-b border-slate-100">
              <CardTitle className="text-base">Metadata & Technology</CardTitle>
          </CardHeader>
          <CardContent className="py-4 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Page Title</label>
                    <p className="text-sm text-slate-800 font-medium mt-1">{meta?.title ?? data.domain}</p>
                </div>
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meta Description</label>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{meta?.description ?? 'No description'}</p>
                </div>
          </CardContent>
      </Card>

    </div>
  );
};
