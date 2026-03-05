import React from 'react';
import type { SiteReport } from '../../lib/api-client/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { BarChart3, Globe, Clock, FileStack } from 'lucide-react';
import { cn, formatNumber, formatDurationHMS, getRankBadgeColor } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { normalizeTrafficDataForDisplay } from '@/lib/traffic-display';

const rankBucket = (rank: number): string => {
  if (rank <= 100) return 'Top 100';
  if (rank <= 1000) return 'Top 1k';
  if (rank <= 10000) return 'Top 10k';
  if (rank <= 100000) return 'Top 100k';
  return 'Global';
};

export const MarketTrafficCard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const traffic = normalizeTrafficDataForDisplay(data.trafficData);
  const radar = data.radar;

  const globalRank = radar?.globalRank ?? traffic?.globalRank ?? null;
  const bucket = radar?.rankBucket ?? (typeof globalRank === 'number' && globalRank > 0 ? rankBucket(globalRank) : null);

  if (!traffic && !globalRank) return null;

  return (
    <Card className="border border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="border-b border-slate-50 py-4 bg-slate-50/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
          <BarChart3 size={16} className="text-emerald-600" />
          Market & Traffic
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-4 flex-1">

        {/* Global Rank */}
        {typeof globalRank === 'number' && globalRank > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 font-medium">Global Rank</span>
              {bucket && (
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-0", getRankBadgeColor(globalRank))}>
                  {bucket}
                </Badge>
              )}
            </div>
            <div className="text-3xl font-mono font-bold text-slate-900">
              #{formatNumber(globalRank)}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        {traffic && (
          <div className="grid grid-cols-2 gap-3">
            {typeof traffic.monthlyVisits === 'number' && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Visits/mo</div>
                <div className="text-lg font-bold text-slate-900 flex items-baseline gap-1">
                  {formatNumber(traffic.monthlyVisits)}
                </div>
              </div>
            )}
            {traffic.topCountry && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Top Geo</div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5 truncate">
                  <Globe size={14} className="text-slate-400" />
                  {traffic.topCountry}
                </div>
              </div>
            )}
            {typeof traffic.bounceRate === 'number' && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Bounce Rate</div>
                <div className="text-sm font-bold text-slate-900">{traffic.bounceRate.toFixed(1)}%</div>
              </div>
            )}
            {typeof traffic.avgVisitDuration === 'number' && (
              <div>
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={10} /> Duration</div>
                <div className="text-sm font-bold text-slate-900">{formatDurationHMS(traffic.avgVisitDuration)}</div>
              </div>
            )}
            {typeof traffic.pagesPerVisit === 'number' && (
              <div>
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><FileStack size={10} /> Pages/Visit</div>
                <div className="text-sm font-bold text-slate-900">{traffic.pagesPerVisit.toFixed(1)}</div>
              </div>
            )}
            {typeof traffic.domainAgeYears === 'number' && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Domain Age</div>
                <div className="text-sm font-bold text-slate-900">{traffic.domainAgeYears} yr{traffic.domainAgeYears !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>
        )}

        {/* Traffic Sources */}
        {traffic?.trafficSources && (
          <div className="mt-auto pt-3 border-t border-slate-50">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Traffic Sources</div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
              {traffic.trafficSources.direct > 0 && (
                <div className="bg-blue-500 h-full" style={{ width: `${traffic.trafficSources.direct}%` }} title={`Direct ${traffic.trafficSources.direct.toFixed(0)}%`} />
              )}
              {traffic.trafficSources.search > 0 && (
                <div className="bg-emerald-500 h-full" style={{ width: `${traffic.trafficSources.search}%` }} title={`Search ${traffic.trafficSources.search.toFixed(0)}%`} />
              )}
              {traffic.trafficSources.social > 0 && (
                <div className="bg-violet-500 h-full" style={{ width: `${traffic.trafficSources.social}%` }} title={`Social ${traffic.trafficSources.social.toFixed(0)}%`} />
              )}
              {traffic.trafficSources.referral > 0 && (
                <div className="bg-amber-500 h-full" style={{ width: `${traffic.trafficSources.referral}%` }} title={`Referral ${traffic.trafficSources.referral.toFixed(0)}%`} />
              )}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Direct</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Search</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" />Social</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Referral</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
