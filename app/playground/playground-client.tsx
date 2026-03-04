'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { endpoints, ENDPOINT_CATEGORIES, type Endpoint, type BodyField } from './endpoints';
import { ProviderSummaryView, ProviderDetailView } from './provider-visualizer';

function buildUrl(endpoint: Endpoint, pathValues: Record<string, string>, queryValues: Record<string, string>): string {
  let url = endpoint.path;
  for (const [key, value] of Object.entries(pathValues)) {
    if (value) url = url.replace(`{${key}}`, encodeURIComponent(value));
  }
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(queryValues)) {
    if (value) searchParams.set(key, value);
  }
  const [basePath, existingQuery] = url.split('?');
  if (existingQuery) {
    const existing = new URLSearchParams(existingQuery);
    for (const [k, v] of existing) searchParams.set(k, v);
  }
  const qs = searchParams.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function buildBody(endpoint: Endpoint, bodyValues: Record<string, string>): string | undefined {
  if (!endpoint.bodySchema || endpoint.method !== 'POST') return undefined;

  const result: Record<string, unknown> = {};
  for (const field of endpoint.bodySchema) {
    const raw = bodyValues[field.name];
    if (raw === undefined || raw === '') continue;

    if (field.type === 'boolean') {
      result[field.name] = raw === 'true';
    } else if (field.type === 'number') {
      result[field.name] = Number(raw);
    } else if (field.type === 'json') {
      try {
        result[field.name] = JSON.parse(raw);
      } catch {
        result[field.name] = raw;
      }
    } else {
      result[field.name] = raw;
    }
  }
  return JSON.stringify(result, null, 2);
}

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  return (
    <Badge
      variant={method === 'GET' ? 'sage' : 'clay'}
      size="sm"
      className="font-mono font-bold uppercase tracking-wider"
    >
      {method}
    </Badge>
  );
}

function StatusBadgeDisplay({ status }: { status: number }) {
  const variant = status < 300 ? 'success' : status < 500 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} size="md">
      {status}
    </Badge>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: BodyField | { name: string; label: string; placeholder?: string; defaultValue?: string; type?: string; required?: boolean };
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  const fieldType = 'type' in field ? field.type : 'string';

  if (fieldType === 'boolean') {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={(e) => onChange(field.name, e.target.checked ? 'true' : 'false')}
          className="h-4 w-4 rounded border-ink-300 text-clay-500 focus:ring-clay-400"
        />
        <span className="text-sm text-ink-700">{field.label}</span>
      </label>
    );
  }

  if (fieldType === 'json') {
    return (
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          {field.label}
          {'required' in field && field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:border-clay-400 focus:outline-none focus:ring-1 focus:ring-clay-400"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 mb-1">
        {field.label}
        {'required' in field && field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={fieldType === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-clay-400 focus:outline-none focus:ring-1 focus:ring-clay-400"
      />
    </div>
  );
}

export function PlaygroundClient() {
  const [selectedId, setSelectedId] = useState(endpoints[0].id);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<{ status: number; body: string; time: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const selected = endpoints.find((e) => e.id === selectedId)!;

  const handleSelect = useCallback((ep: Endpoint) => {
    setSelectedId(ep.id);
    setResponse(null);
    setCopied(false);
    setViewMode(ep.visualize ? 'visual' : 'json');
    const newPath: Record<string, string> = {};
    ep.pathParams?.forEach((p) => { if (p.defaultValue) newPath[p.name] = p.defaultValue; });
    setPathValues(newPath);
    const newQuery: Record<string, string> = {};
    ep.queryParams?.forEach((p) => { if (p.defaultValue) newQuery[p.name] = p.defaultValue; });
    setQueryValues(newQuery);
    const newBody: Record<string, string> = {};
    ep.bodySchema?.forEach((f) => { if (f.defaultValue) newBody[f.name] = f.defaultValue; });
    if (ep.exampleBody) {
      ep.bodySchema?.forEach((f) => {
        if (f.type === 'json' && ep.exampleBody?.[f.name] !== undefined) {
          newBody[f.name] = JSON.stringify(ep.exampleBody[f.name]);
        }
      });
    }
    setBodyValues(newBody);
  }, []);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    setCopied(false);
    const url = buildUrl(selected, pathValues, queryValues);
    const body = buildBody(selected, bodyValues);

    const start = performance.now();
    try {
      const res = await fetch(url, {
        method: selected.method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body,
      });
      const text = await res.text();
      const elapsed = Math.round(performance.now() - start);
      let formatted: string;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        formatted = text;
      }
      setResponse({ status: res.status, body: formatted, time: elapsed });
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponse({
        status: 0,
        body: JSON.stringify({ error: err instanceof Error ? err.message : 'Network error' }, null, 2),
        time: elapsed,
      });
    } finally {
      setLoading(false);
    }
  }, [selected, pathValues, queryValues, bodyValues]);

  const handleCopy = useCallback(() => {
    if (response) {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [response]);

  const updatePath = useCallback((name: string, value: string) => {
    setPathValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateQuery = useCallback((name: string, value: string) => {
    setQueryValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateBody = useCallback((name: string, value: string) => {
    setBodyValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const hasVisualization = selected.visualize && response && response.status >= 200 && response.status < 300;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-24 space-y-4">
          {ENDPOINT_CATEGORIES.map((cat) => {
            const catEndpoints = endpoints.filter((e) => e.category === cat);
            if (catEndpoints.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">{cat}</h3>
                <div className="space-y-1">
                  {catEndpoints.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => handleSelect(ep)}
                      className={cn(
                        'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        selectedId === ep.id
                          ? 'bg-clay-50 text-clay-700 border border-clay-200'
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 border border-transparent'
                      )}
                    >
                      <MethodBadge method={ep.method} />
                      <span className="truncate font-medium">{ep.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <MethodBadge method={selected.method} />
              <code className="text-sm font-mono text-ink-700 break-all">{selected.path}</code>
            </div>
            <p className="text-sm text-ink-500 mt-1">{selected.description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Path Params */}
            {selected.pathParams && selected.pathParams.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Path Parameters</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.pathParams.map((p) => (
                    <FieldInput key={p.name} field={p} value={pathValues[p.name] ?? ''} onChange={updatePath} />
                  ))}
                </div>
              </div>
            )}

            {/* Query Params */}
            {selected.queryParams && selected.queryParams.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Query Parameters</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {selected.queryParams.map((p) => (
                    <FieldInput key={p.name} field={p} value={queryValues[p.name] ?? ''} onChange={updateQuery} />
                  ))}
                </div>
              </div>
            )}

            {/* Body Fields */}
            {selected.bodySchema && selected.bodySchema.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-400 mb-2">Request Body</h4>
                <div className="grid gap-3">
                  {selected.bodySchema.map((f) => (
                    <FieldInput key={f.name} field={f} value={bodyValues[f.name] ?? ''} onChange={updateBody} />
                  ))}
                </div>
              </div>
            )}

            <Button variant="clay" onClick={handleSend} disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </CardContent>
        </Card>

        {/* Response */}
        {response && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadgeDisplay status={response.status} />
                  <span className="text-sm text-ink-500">{response.time}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasVisualization && (
                    <div className="flex rounded-lg border border-ink-200 overflow-hidden">
                      <button
                        onClick={() => setViewMode('visual')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium transition-colors',
                          viewMode === 'visual' ? 'bg-clay-100 text-clay-700' : 'text-ink-500 hover:text-ink-700',
                        )}
                      >
                        Visual
                      </button>
                      <button
                        onClick={() => setViewMode('json')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium transition-colors border-l border-ink-200',
                          viewMode === 'json' ? 'bg-clay-100 text-clay-700' : 'text-ink-500 hover:text-ink-700',
                        )}
                      >
                        JSON
                      </button>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasVisualization && viewMode === 'visual' ? (
                selected.visualize === 'provider-summary'
                  ? <ProviderSummaryView json={response.body} />
                  : <ProviderDetailView json={response.body} />
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-ink-50 p-4 text-sm font-mono text-ink-800 max-h-[600px] overflow-y-auto">
                  {response.body}
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
