import React from 'react';
import { Search, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GoBackButton } from '@/components/error/GoBackButton';
import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | SiteJSON',
  description: 'The page you are looking for could not be found.',
};

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 Graphic */}
        <div className="relative">
          <div className="text-9xl font-bold text-slate-200 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Page not found
          </h1>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It might have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-slate-50 rounded-xl p-6 text-left">
          <h2 className="font-semibold text-slate-900 mb-3">
            You might want to:
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Check the URL for typos
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Go back to the previous page
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Visit our homepage to start fresh
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go home
            </Button>
          </Link>

          <GoBackButton className="flex items-center justify-center gap-2 w-full sm:w-auto" />
        </div>

        {/* Help Text */}
        <p className="text-sm text-slate-500">
          Need help? Contact us at{' '}
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
