"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { fetchDirectoryListing } from '../services/api';
import type { DirectoryDataStatus, DirectoryItem } from '../lib/api-client/types';
import { SiteCard } from '../components/shared/SiteCard';
import { Button } from '../components/ui/Button';
import { ChevronRight, Hash, Layers, Tag } from 'lucide-react';

type PageType = 'category' | 'technology' | 'topic';

interface DirectoryProps {
  mode: PageType;
  value: string;
}

const Directory: React.FC<DirectoryProps> = ({ mode, value }) => {
  const [sites, setSites] = useState<DirectoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DirectoryDataStatus>('empty');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const type: PageType = mode;
  let icon = <Layers className="w-6 h-6 text-blue-500" />;

  if (type === 'technology') {
    icon = <Hash className="w-6 h-6 text-purple-500" />;
  } else if (type === 'topic') {
    icon = <Tag className="w-6 h-6 text-emerald-500" />;
  }

  const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
  const canGoPrev = useMemo(() => page > 1, [page]);
  const canGoNext = useMemo(() => totalPages > 0 && page < totalPages, [page, totalPages]);

  useEffect(() => {
    setLoading(true);
    fetchDirectoryListing(type, value, page, pageSize)
      .then((data) => {
        setStatus(data.status);
        if (data.status === 'unavailable' || data.status === 'timeout') {
          setErrorMessage(data.message);
          return;
        }

        const listing = data.data ?? {
          items: [],
          page,
          pageSize,
          total: 0,
          totalPages: 0,
        };
        setSites(listing.items);
        setTotal(listing.total);
        setPage(listing.page);
        setTotalPages(listing.totalPages);
        setErrorMessage(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type, value, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [type, value]);

  const handlePrev = () => {
    if (!canGoPrev || loading) return;
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (!canGoNext || loading) return;
    setPage((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <ChevronRight size={14} />
            <span className="capitalize">{type}</span>
            <ChevronRight size={14} />
            <span className="text-slate-900 font-medium">{displayValue}</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">{icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Top Websites {type === 'technology' ? 'using' : 'in'} {displayValue}
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Discover the most popular websites {type === 'technology' ? 'built with' : 'related to'}{' '}
                <span className="font-semibold text-slate-900">{displayValue}</span>.
                Ranked by traffic, authority, and AI analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm font-medium text-slate-500">
            Showing <span className="text-slate-900 font-bold">{sites.length}</span>
            <span className="text-slate-400"> / {total}</span>
            <span className="text-slate-400"> · Page {page}{totalPages > 0 ? ` of ${totalPages}` : ''}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="h-64 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : sites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sites.map((site) => (
              <SiteCard key={site.domain} site={site} />
            ))}
          </div>
        ) : status === 'unavailable' || status === 'timeout' ? (
          <div className="rounded-2xl border border-amber-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">Directory data is temporarily unavailable</h2>
            <p className="mt-2 text-slate-600">
              {errorMessage ?? 'The directory request failed before any results could load.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-900">No indexed sites yet</h2>
            <p className="mt-2 text-slate-600">
              Analyze more domains first, then this directory will populate automatically.
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button>Analyze a Domain</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-16 flex justify-center gap-4">
          <Button variant="outline" disabled={!canGoPrev || loading} onClick={handlePrev}>
            Previous
          </Button>
          <Button variant="outline" disabled={!canGoNext || loading} onClick={handleNext}>Next Page</Button>
        </div>
      </div>
    </div>
  );
};

export default Directory;
