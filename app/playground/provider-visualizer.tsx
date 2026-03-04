'use client';

import React from 'react';
import { cn } from '../../lib/utils';

/* ---------- types ---------- */

interface ProviderCompleteness {
  total: number;
  present: number;
  missing: number;
  fields: Record<string, boolean>;
}

interface ProviderSummaryItem {
  provider: string;
  hasData: boolean;
  health: { ok: boolean; errorCode?: string } | null;
  completeness: ProviderCompleteness;
}

interface ProviderSummaryData {
  domain: string;
  updatedAt: string;
  providers: ProviderSummaryItem[];
  score?: { value: number; signals: string[] };
  _meta?: Record<string, unknown>;
}

interface ProviderDetailData {
  domain: string;
  provider: string;
  updatedAt: string;
  hasData: boolean;
  health: { ok: boolean; errorCode?: string } | null;
  completeness: ProviderCompleteness;
  data: Record<string, unknown> | null;
}

/* ---------- labels ---------- */

const PROVIDER_LABELS: Record<string, { label: string; icon: string }> = {
  visual:    { label: 'Visual',    icon: 'cam' },
  meta:      { label: 'Meta',      icon: 'tag' },
  seo:       { label: 'SEO',       icon: 'lnk' },
  dns:       { label: 'DNS',       icon: 'dns' },
  ads:       { label: 'Ads',       icon: 'ad' },
  publisher: { label: 'Publisher', icon: 'pub' },
  files:     { label: 'Files',     icon: 'fil' },
  traffic:   { label: 'Traffic',   icon: 'trf' },
  radar:     { label: 'Radar',     icon: 'rdr' },
  ai:        { label: 'AI',        icon: 'ai' },
  whois:     { label: 'Whois',     icon: 'who' },
};

/* ---------- helper ---------- */

function completenessColor(ratio: number): string {
  if (ratio >= 1) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (ratio >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function completenessBarColor(ratio: number): string {
  if (ratio >= 1) return 'bg-emerald-500';
  if (ratio >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'number') return val.toLocaleString();
  if (typeof val === 'string') return val.length > 120 ? val.slice(0, 120) + '...' : val;
  if (Array.isArray(val)) return val.length === 0 ? '[]' : `[${val.length} items]`;
  if (typeof val === 'object') return JSON.stringify(val).slice(0, 120);
  return String(val);
}

/* ---------- ProviderSummaryView ---------- */

export function ProviderSummaryView({ json }: { json: string }) {
  let parsed: { ok: boolean; data?: ProviderSummaryData };
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!parsed.ok || !parsed.data?.providers) return null;

  const { domain, updatedAt, providers, score } = parsed.data;

  const totalFields = providers.reduce((s, p) => s + p.completeness.total, 0);
  const totalPresent = providers.reduce((s, p) => s + p.completeness.present, 0);
  const overallRatio = totalFields > 0 ? totalPresent / totalFields : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold text-ink-900">{domain}</h3>
          <p className="text-xs text-ink-400">Updated: {new Date(updatedAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          {score && (
            <div className={cn('px-3 py-1 rounded-full text-sm font-bold border', completenessColor(score.value / 100))}>
              Score: {score.value}
            </div>
          )}
          <div className={cn('px-3 py-1 rounded-full text-sm font-bold border', completenessColor(overallRatio))}>
            {totalPresent}/{totalFields} fields
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', completenessBarColor(overallRatio))} style={{ width: `${overallRatio * 100}%` }} />
      </div>

      {/* Provider Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((p) => {
          const ratio = p.completeness.total > 0 ? p.completeness.present / p.completeness.total : 0;
          const info = PROVIDER_LABELS[p.provider] ?? { label: p.provider, icon: '?' };
          return (
            <div
              key={p.provider}
              className={cn(
                'rounded-lg border p-3 transition-all',
                p.hasData ? 'border-ink-200 bg-white' : 'border-red-200 bg-red-50/50',
              )}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-ink-400 bg-ink-100 rounded px-1.5 py-0.5">{info.icon}</span>
                  <span className="font-semibold text-sm text-ink-800">{info.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.health && (
                    <span className={cn('w-2 h-2 rounded-full', p.health.ok ? 'bg-emerald-400' : 'bg-red-400')} title={p.health.ok ? 'OK' : p.health.errorCode ?? 'Error'} />
                  )}
                  <span className={cn(
                    'text-xs font-mono font-bold px-1.5 py-0.5 rounded',
                    completenessColor(ratio),
                  )}>
                    {p.completeness.present}/{p.completeness.total}
                  </span>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden mb-2">
                <div className={cn('h-full rounded-full', completenessBarColor(ratio))} style={{ width: `${ratio * 100}%` }} />
              </div>

              {/* Field list */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(p.completeness.fields).map(([field, has]) => (
                  <span
                    key={field}
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                      has
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-600 border-red-200',
                    )}
                    title={`${field}: ${has ? 'present' : 'MISSING'}`}
                  >
                    {has ? '\u2713' : '\u2717'} {field.split('.').pop()}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- ProviderDetailView ---------- */

export function ProviderDetailView({ json }: { json: string }) {
  let parsed: { ok: boolean; data?: ProviderDetailData };
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!parsed.ok || !parsed.data) return null;

  const { domain, provider, updatedAt, hasData, health, completeness, data } = parsed.data;
  const info = PROVIDER_LABELS[provider] ?? { label: provider, icon: '?' };
  const ratio = completeness.total > 0 ? completeness.present / completeness.total : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono bg-ink-100 text-ink-500 rounded px-2 py-1">{info.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-ink-900">{info.label} Provider</h3>
            <p className="text-xs text-ink-400">{domain} &middot; {new Date(updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {health && (
            <span className={cn(
              'text-xs font-bold px-2 py-1 rounded border',
              health.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200',
            )}>
              {health.ok ? 'Healthy' : health.errorCode ?? 'Error'}
            </span>
          )}
          <span className={cn('text-sm font-bold px-2 py-1 rounded border', completenessColor(ratio))}>
            {completeness.present}/{completeness.total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', completenessBarColor(ratio))} style={{ width: `${ratio * 100}%` }} />
      </div>

      {!hasData && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No data collected for this provider. The provider may have failed or been skipped.
        </div>
      )}

      {/* Field completeness table */}
      <div className="rounded-lg border border-ink-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-50">
              <th className="text-left px-3 py-2 font-semibold text-ink-600 w-8">Status</th>
              <th className="text-left px-3 py-2 font-semibold text-ink-600">Field</th>
              <th className="text-left px-3 py-2 font-semibold text-ink-600">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(completeness.fields).map(([field, has]) => {
              const fieldValue = data ? resolveNested(data, field) : undefined;
              return (
                <tr key={field} className={cn('border-t border-ink-100', has ? '' : 'bg-red-50/50')}>
                  <td className="px-3 py-1.5 text-center">
                    {has
                      ? <span className="text-emerald-500 font-bold">{'\u2713'}</span>
                      : <span className="text-red-500 font-bold">{'\u2717'}</span>
                    }
                  </td>
                  <td className="px-3 py-1.5 font-mono text-ink-700">{field}</td>
                  <td className="px-3 py-1.5 text-ink-600 max-w-xs truncate" title={typeof fieldValue === 'string' ? fieldValue : undefined}>
                    {formatValue(fieldValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Full data JSON (collapsible) */}
      {data && <DataTreeView data={data} />}
    </div>
  );
}

/* ---------- DataTreeView ---------- */

function DataTreeView({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className="rounded-lg border border-ink-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-50 transition-colors"
      >
        <span>Raw Data</span>
        <span className="text-ink-400">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>
      {expanded && (
        <div className="border-t border-ink-100">
          <div className="p-3 space-y-1">
            {renderTree(data, 0)}
          </div>
        </div>
      )}
    </div>
  );
}

function renderTree(obj: unknown, depth: number): React.ReactNode {
  if (obj === null || obj === undefined) {
    return <span className="text-ink-400 italic">null</span>;
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'boolean') return <span className={obj ? 'text-emerald-600' : 'text-red-500'}>{String(obj)}</span>;
    if (typeof obj === 'number') return <span className="text-blue-600">{obj.toLocaleString()}</span>;
    if (typeof obj === 'string') {
      if (obj.startsWith('http')) {
        return (
          <a href={obj} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
            {obj.length > 80 ? obj.slice(0, 80) + '...' : obj}
          </a>
        );
      }
      return <span className="text-ink-700 break-all">{obj.length > 200 ? obj.slice(0, 200) + '...' : obj}</span>;
    }
    return <span className="text-ink-700">{String(obj)}</span>;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return <span className="text-ink-400">[]</span>;
    return (
      <div className="ml-4 space-y-1">
        {obj.map((item, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-ink-300 text-xs font-mono shrink-0 mt-0.5">[{i}]</span>
            <div>{renderTree(item, depth + 1)}</div>
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) return <span className="text-ink-400">{'{}'}</span>;

  return (
    <div className={cn(depth > 0 && 'ml-4', 'space-y-1')}>
      {entries.map(([key, val]) => (
        <div key={key} className="flex gap-2">
          <span className="text-ink-500 text-xs font-mono font-bold shrink-0 mt-0.5">{key}:</span>
          <div className="min-w-0">{renderTree(val, depth + 1)}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- utility ---------- */

function resolveNested(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && !Array.isArray(cur)) cur = (cur as Record<string, unknown>)[p];
    else return undefined;
  }
  return cur;
}
