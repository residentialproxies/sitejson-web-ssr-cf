import type { Metadata, Viewport } from 'next';
import { buildBaseMetadata } from '@/lib/seo/metadata';
import {
  generateWebSiteJsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';
import { UiShell } from './ui-shell';
import './globals.css';

export const metadata: Metadata = buildBaseMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A1A2E',
};

// Generate comprehensive JSON-LD structured data
const websiteSchema = generateWebSiteJsonLd();
const organizationSchema = generateOrganizationJsonLd();
const breadcrumbSchema = generateBreadcrumbJsonLd([
  { name: 'Home', path: '/' },
]);

const jsonLd = combineJsonLd([websiteSchema, organizationSchema, breadcrumbSchema]);

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://api.sitejson.com" />
        <link rel="preconnect" href="https://image.thum.io" />
        <link rel="preconnect" href="https://imagedelivery.net" />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://api.sitejson.com" />
        <link rel="dns-prefetch" href="https://image.thum.io" />
        <link rel="dns-prefetch" href="https://imagedelivery.net" />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-ink-900 focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <UiShell>{children}</UiShell>
      </body>
    </html>
  );
}
