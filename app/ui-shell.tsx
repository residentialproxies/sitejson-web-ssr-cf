import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/layout/Navbar';

type UiShellProps = {
  children: React.ReactNode;
};

export const UiShell = ({ children }: UiShellProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-950">
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 py-8 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="https://api.sitejson.com/api/docs" target="_blank" rel="noreferrer" className="hover:text-slate-900">API Docs</a></li>
                <li><a href="https://api.sitejson.com/api/openapi.json" target="_blank" rel="noreferrer" className="hover:text-slate-900">OpenAPI Spec</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/directory/category/technology" className="hover:text-slate-900">Directory</Link></li>
                <li><Link href="/directory/technology/react" className="hover:text-slate-900">Tech Stack Index</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="https://api.sitejson.com/api/v1/readyz" target="_blank" rel="noreferrer" className="hover:text-slate-900">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center md:text-left" suppressHydrationWarning>
              &copy; {new Date().getFullYear()} SiteJSON. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
