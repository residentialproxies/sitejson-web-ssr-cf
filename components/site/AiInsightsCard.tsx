import React, { useMemo } from 'react';
import type { SiteReport } from '../../lib/api-client/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sparkles, ShieldAlert, ShieldCheck, Target, Timer } from 'lucide-react';
import { Badge } from '../ui/Badge';
import Link from 'next/link';
import { cn, normalizeDirectorySlug } from '../../lib/utils';

export const AiInsightsCard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const ai = data.aiAnalysis;
  const timing = data._meta?.timing;

  const riskScore = ai?.risk?.score ?? 0;
  const isSafe = ai?.risk?.sentiment === 'Professional';

  const rotation = useMemo(() => (riskScore / 100) * 180, [riskScore]);
  const categorySlug = useMemo(
    () => data.taxonomy?.iabCategory ? normalizeDirectorySlug(data.taxonomy.iabCategory) : '',
    [data.taxonomy?.iabCategory],
  );
  const topTags = useMemo(() => data.taxonomy?.tags?.slice(0, 3) ?? [], [data.taxonomy?.tags]);

  if (!ai) return null;

  return (
    <Card className="border border-slate-200 shadow-sm bg-gradient-to-br from-white to-teal-50/30">
      <CardHeader className="border-b border-slate-100 py-4">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="p-1.5 bg-teal-100 rounded-md text-teal-600">
            <Sparkles size={16} />
          </div>
          AI Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Left: Content Analysis */}
          <div className="flex-1 space-y-4">
            {ai.business?.summary && (
              <p className="text-slate-700 leading-relaxed font-medium">
                {ai.business.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {data.taxonomy?.iabCategory && categorySlug && (
                <Link href={`/directory/category/${categorySlug}`}>
                  <Badge className="bg-slate-900 text-white cursor-pointer px-3 py-1">
                    {data.taxonomy.iabCategory}
                  </Badge>
                </Link>
              )}
              {data.taxonomy?.iabSubCategory && (
                <Badge variant="secondary" className="text-slate-600 bg-white border border-slate-200">
                  {data.taxonomy.iabSubCategory}
                </Badge>
              )}
              {topTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-slate-500 border-slate-200">
                  #{tag}
                </Badge>
              ))}
            </div>

            {ai.business?.targetAudience && (
              <div className="flex items-start gap-2 pt-2">
                <Target size={14} className="text-slate-400 mt-1" />
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Target Audience</span>
                  <p className="text-sm text-slate-600">{ai.business.targetAudience}</p>
                </div>
              </div>
            )}

            {/* Timing */}
            {timing && (
              <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-400">
                <Timer size={10} />
                {typeof timing.total_ms === 'number' && <span>Total {(timing.total_ms / 1000).toFixed(1)}s</span>}
                {typeof timing.lane_browser_ms === 'number' && <span>Browser {(timing.lane_browser_ms / 1000).toFixed(1)}s</span>}
                {typeof timing.lane_ai_ms === 'number' && <span>AI {(timing.lane_ai_ms / 1000).toFixed(1)}s</span>}
              </div>
            )}
          </div>

          {/* Right: Risk Gauge */}
          <div className="w-full md:w-48 shrink-0 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="relative w-32 h-16 overflow-hidden mb-2">
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-slate-100 border-b-0 border-r-0"></div>
              <div
                className={cn(
                  "absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-b-0 border-r-0 transition-all duration-1000 ease-out origin-bottom",
                  isSafe ? "border-emerald-500" : "border-rose-500"
                )}
                style={{ transform: `rotate(${rotation - 180}deg)` }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 -mt-8">{riskScore}/100</div>
            <div className={cn("text-xs font-bold uppercase mt-1 flex items-center gap-1", isSafe ? "text-emerald-600" : "text-rose-600")}>
              {isSafe ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
              {ai.risk?.sentiment ?? 'Unknown'}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
