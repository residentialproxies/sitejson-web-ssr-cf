import type { Metadata } from 'next';
import Home from '@/screens/Home';
import { buildHomeMetadata } from '@/lib/seo/metadata';
import { generateHomepageJsonLd } from '@/lib/seo/json-ld';

export const metadata: Metadata = buildHomeMetadata();

export default function HomePage() {
  const jsonLd = generateHomepageJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <Home />
    </>
  );
}
