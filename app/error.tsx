'use client';

import React from 'react';
import { TriangleAlert as AlertTriangle, RefreshCw, Hop as Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50" role="alert">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-600" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-600 text-lg">
            An unexpected error occurred while loading this page. Try refreshing, or return to the homepage.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-left bg-slate-100 rounded-lg p-4 overflow-auto max-h-48">
            <p className="text-sm font-semibold text-slate-700 mb-2">Error details:</p>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap">
              {error.message}
              {error.digest && (
                <>
                  {'\n\n'}Error ID: {error.digest}
                </>
              )}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button
            onClick={reset}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>

          <Link href="/">
            <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" aria-hidden="true" />
              Go home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          If the problem persists, contact{' '}
          <a
            href="mailto:support@sitejson.com"
            className="text-clay-700 font-medium hover:underline"
          >
            support@sitejson.com
          </a>
        </p>
      </div>
    </div>
  );
}
