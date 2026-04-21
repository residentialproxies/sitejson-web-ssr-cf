import React from 'react';
import type { SiteReport } from '../../lib/api-client/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Server, Mail, Cpu, Zap, CircleCheck as CheckCircle2, Circle as XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import Link from 'next/link';
import { normalizeDirectorySlug } from '@/lib/utils';

export const InfrastructureCard: React.FC<{ data: SiteReport }> = ({ data }) => {
  const dns = data.dns;
  const techStack = data.meta?.techStackDetected ?? [];
  const health = data.providerHealth;

  if (!dns && techStack.length === 0) return null;

  return (
    <Card className="border border-slate-200 shadow-sm h-full flex flex-col">
      <CardHeader className="border-b border-slate-50 py-4 bg-slate-50/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
          <Server size={16} className="text-blue-500" />
          Infrastructure
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex flex-col gap-4">

        {/* DNS / Email */}
        {dns && (
          <div className="space-y-3">
            {dns.provider && (
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                  <Zap size={10} /> DNS Provider
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-mono">
                  {dns.provider}
                </Badge>
              </div>
            )}

            {dns.mxRecords && dns.mxRecords.length > 0 && (
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                  <Mail size={10} /> Mail Exchange
                </div>
                <div className="text-xs font-mono text-slate-600 truncate bg-slate-50 p-1.5 rounded border border-slate-100">
                  {dns.mxRecords[0]}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Provider Health */}
        {health && health.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {health.slice(0, 6).map((p) => (
              <div key={p.provider} className="flex items-center gap-1.5 text-[10px]">
                {p.ok ? (
                  <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
                ) : (
                  <XCircle size={10} className="text-rose-400 shrink-0" />
                )}
                <span className="text-slate-600 truncate capitalize">{p.provider}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detected Tech */}
        {techStack.length > 0 && (
          <div className="mt-auto pt-3 border-t border-slate-50">
            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
              <Cpu size={10} /> Detected Stack
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => {
                const slug = normalizeDirectorySlug(tech);
                if (!slug) {
                  return (
                    <Badge key={tech} variant="outline" className="text-[10px] px-1.5 py-0 bg-white">
                      {tech}
                    </Badge>
                  );
                }

                return (
                  <Link key={tech} href={`/directory/technology/${slug}`}>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 hover:border-slate-400 cursor-pointer bg-white">
                      {tech}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};
