import React from 'react';
import type { Metadata } from 'next';
import { Search, Hop as Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GoBackButton } from '@/components/error/GoBackButton';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: 'Page Not Found | SiteJSON',
  },
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative" aria-hidden="true">
          <div className="text-9xl font-bold text-slate-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-clay-50 rounded-full flex items-center justify-center border border-clay-100">
              <Search className="w-12 h-12 text-clay-400" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Page not found
          </h1>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It might have been moved, deleted, or never existed.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 text-left">
          <h2 className="font-semibold text-slate-900 mb-3">
            You might want to:
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-clay-400 rounded-full flex-shrink-0" aria-hidden="true" />
              Check the URL for typos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-clay-400 rounded-full flex-shrink-0" aria-hidden="true" />
              Go back to the previous page
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-clay-400 rounded-full flex-shrink-0" aria-hidden="true" />
              <Link href="/directory" className="text-clay-700 hover:underline">Browse the website directory</Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" aria-hidden="true" />
              Go home
            </Button>
          </Link>

          <GoBackButton className="flex items-center justify-center gap-2 w-full sm:w-auto" />

          <Link href="/directory">
            <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto">
              Directory
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        <p className="text-sm text-slate-500">
          Need help? Contact us at{' '}
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
