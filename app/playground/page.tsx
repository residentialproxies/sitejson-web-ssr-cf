import type { Metadata } from 'next';
import { PlaygroundClient } from './playground-client';

export const metadata: Metadata = {
  title: 'API Playground - SiteJSON',
  description: 'Interactive API playground to test SiteJSON endpoints.',
  robots: { index: false, follow: false },
};

export const runtime = 'edge';

export default function PlaygroundPage() {
  return (
    <main className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink-900">API Playground</h1>
        <p className="mt-2 text-ink-500">
          Test SiteJSON API endpoints interactively. All requests are proxied through the BFF layer.
        </p>
      </div>
      <PlaygroundClient />
    </main>
  );
}
