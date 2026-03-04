'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
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
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="text-slate-600 text-lg">
            We apologize for the inconvenience. An unexpected error has occurred while loading this page.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="text-left bg-slate-100 rounded-lg p-4 overflow-auto max-h-48">
            <p className="text-sm font-semibold text-slate-700 mb-2">Error details:</p>
            <pre className="text-xs text-slate-600">
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
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>

          <Link href="/">
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          If the problem persists, please contact{' '}
          <a
            href="mailto:support@sitejson.com"
            className="text-blue-600 hover:underline"
          >
            support@sitejson.com
          </a>
        </p>
      </div>
    </div>
  );
}
