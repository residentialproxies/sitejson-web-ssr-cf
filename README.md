# SiteJSON Web SSR

A production-grade Next.js 15 SSR frontend for the SiteJSON website intelligence platform. Deployed on Cloudflare Pages with edge runtime for optimal global performance.

## Overview

SiteJSON is a website intelligence API that provides structured data about any domain, including:

- Traffic estimates and analytics
- Technology stack detection
- SEO analysis and scoring
- DNS and infrastructure details
- AI-powered business classification
- Legitimacy and trust scoring

## Tech Stack

- **Framework**: Next.js 15.1.6 with App Router
- **Runtime**: Edge (Cloudflare Workers)
- **Language**: TypeScript 5.8.2 (strict mode)
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Custom design system
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library + Playwright

## Project Structure

```
app/                    # Next.js App Router
├── api/sitejson/       # BFF API routes (Backend-for-Frontend)
├── data/[domain]/      # Domain data pages (overview, tech, seo, traffic, business)
├── directory/          # Directory listings
├── site/[domain]/      # Live analysis with polling
├── layout.tsx          # Root layout with JSON-LD
├── page.tsx            # Home page
├── sitemap.ts          # Dynamic sitemap
└── robots.ts           # Robots.txt

components/
├── ui/                 # Base UI components
├── home/               # Home page sections
├── domain/             # Domain data components
├── site/               # Site report components
├── layout/             # Layout components
└── error/              # Error handling components

lib/
├── api-client/         # API client and types
├── seo/                # SEO utilities and JSON-LD
└── utils.ts            # Utility functions

screens/                # Page-level screen components
__tests__/              # Unit and integration tests
e2e/                    # Playwright E2E tests
scripts/                # Deployment scripts
public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Or use the setup script
./scripts/setup.sh
```

### Environment Variables

Create `.env.local`:

```env
# Required
SITEJSON_API_BASE_URL=https://api.sitejson.com
SITEJSON_API_KEY=your_api_key_here
PUBLIC_SITE_BASE_URL=https://sitejson.com

# Optional
GOOGLE_SITE_VERIFICATION=your_verification_code
```

### Development

```bash
# Start development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run e2e
```

### Build

```bash
# Production build
npm run build

# Build for Cloudflare Pages
npm run build:cf
```

## Testing

### Unit Tests

Unit tests are written with Vitest and React Testing Library:

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Test files are located in `__tests__/` directories alongside the code they test.

### E2E Tests

E2E tests are written with Playwright:

```bash
# Run all E2E tests
npm run e2e

# Run with UI
npm run e2e:ui

# Debug mode
npm run e2e:debug
```

## Deployment

### Cloudflare Pages (Production)

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

Or use the deployment script:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Validate before deployment
./scripts/validate.sh

# Emergency rollback
./scripts/rollback.sh production
```

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Runs linting on every PR
2. Runs TypeScript type checking
3. Runs unit tests with coverage
4. Builds the application
5. Runs E2E tests
6. Deploys to Cloudflare Pages on main branch

Required secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Architecture

### BFF Pattern

All client-side API requests go through `/api/sitejson/*` routes which:
- Add API key authentication server-side
- Handle timeout and error normalization
- Cache responses appropriately

### Edge Runtime

All routes use the Edge runtime for:
- Global low-latency responses
- No cold starts
- Automatic scaling

### Caching Strategy

- **Static assets**: 1 year (immutable)
- **API routes**: 60s stale-while-revalidate 5min
- **Data pages**: 5min stale-while-revalidate 24h
- **Directory pages**: 5min stale-while-revalidate 24h

## SEO Features

- Dynamic metadata for all pages
- JSON-LD structured data (WebPage, Dataset, BreadcrumbList, FAQ)
- Dynamic sitemap.xml (5000+ URLs)
- OpenGraph and Twitter Cards
- Canonical URLs
- Proper heading hierarchy

## Performance

- Edge deployment close to users
- Image optimization with WebP/AVIF
- Code splitting and lazy loading
- Resource hints (preconnect, dns-prefetch)
- Optimized font loading

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader friendly
- Reduced motion support
- Proper focus management

## API Integration

The frontend integrates with the SiteJSON backend API:

- `GET /api/v1/sites/:domain` - Get site report
- `POST /api/v1/analyze` - Trigger domain analysis
- `GET /api/v1/jobs/:jobId` - Poll job status
- `GET /api/v1/directory/:type/:slug` - Directory listings

### Client Hooks

```typescript
import { useSiteReport, useJobStatus, useDirectory } from '@/lib/api-client/client';

// Fetch site report with polling
const { data, error, isLoading } = useSiteReport('example.com');

// Poll job status
const { data: jobData } = useJobStatus(jobId);

// Fetch directory data
const { data: directoryData } = useDirectory('technology', 'react');
```

## Scripts

```bash
./scripts/deploy.sh      # Deploy with health checks
./scripts/rollback.sh    # Emergency rollback
./scripts/setup.sh       # Environment setup
./scripts/validate.sh    # Pre-deployment validation
```

## License

MIT
