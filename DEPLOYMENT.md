# Deployment Guide

This document describes the deployment process for SiteJSON Web SSR to Cloudflare Pages.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Build Process](#build-process)
- [Deployment Steps](#deployment-steps)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

## Environment Setup

### Prerequisites

- Node.js 20+
- Cloudflare account with Pages access
- Wrangler CLI configured

### Environment Variables

Create `.env.local` for local development:

```env
# Required
SITEJSON_API_BASE_URL=https://api.sitejson.com
SITEJSON_API_KEY=your_api_key_here
PUBLIC_SITE_BASE_URL=https://sitejson.com

# Optional
GOOGLE_SITE_VERIFICATION=your_verification_code
```

For production deployment, set these in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_SITEJSON_API_BASE_URL`
- `SITEJSON_API_KEY`
- `PUBLIC_SITE_BASE_URL`

### GitHub Secrets

Configure these secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Pages edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Build Process

### Local Build

```bash
# Install dependencies
npm ci

# Build for Cloudflare Pages
npm run build:cf
```

The build output is placed in `.vercel/output/static/`.

### Build Verification

After building, verify:

1. Build output exists: `ls .vercel/output/static/`
2. No TypeScript errors: `npm run typecheck`
3. All tests pass: `npm run test`

## Deployment Steps

### Automated Deployment (GitHub Actions)

The project includes a GitHub Actions workflow that automatically deploys on push to main:

1. **Lint** - ESLint checks
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Vitest tests with coverage
4. **Build** - Next.js build for Cloudflare Pages
5. **E2E Tests** - Playwright tests
6. **Deploy** - Deploy to Cloudflare Pages

### Manual Deployment

Use the deployment script:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

Or manually with Wrangler:

```bash
# Build
npm run build:cf

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=sitejson-web-ssr
```

### Pre-deployment Validation

Run the validation script before deploying:

```bash
./scripts/validate.sh
```

This checks:
- Node.js version
- Required files
- Linting
- TypeScript compilation
- Unit tests
- Security issues
- Build size

## Rollback Procedure

### Emergency Rollback

If a deployment causes issues, use the rollback script:

```bash
# Rollback to previous version
./scripts/rollback.sh production

# Rollback to specific version
./scripts/rollback.sh production <deployment-id>
```

### Manual Rollback

1. List recent deployments:
   ```bash
   npx wrangler pages deployment list --project-name=sitejson-web-ssr
   ```

2. Rollback to a specific deployment:
   ```bash
   npx wrangler pages deployment rollback <deployment-id> --project-name=sitejson-web-ssr
   ```

### Verification

After rollback, verify:

1. Site is accessible: `curl -I https://sitejson.com`
2. No console errors in browser
3. Key functionality works

## Troubleshooting

### Build Failures

**TypeScript errors**
```bash
npm run typecheck
```
Fix all errors before deploying.

**Missing environment variables**
Ensure all required env vars are set in `.env.local` or Cloudflare dashboard.

### Deployment Failures

**Authentication errors**
- Verify `CLOUDFLARE_API_TOKEN` is set correctly
- Check token has Pages edit permissions

**Build output not found**
Ensure `npm run build:cf` completes successfully and creates `.vercel/output/static/`.

### Runtime Errors

**API connection errors**
- Check `NEXT_PUBLIC_SITEJSON_API_BASE_URL` is correct
- Verify backend API is accessible

**404 errors on dynamic routes**
Ensure `wrangler.toml` has proper route configuration.

### Performance Issues

**Slow page loads**
- Check bundle size: `du -sh .vercel/output/static/`
- Enable Cloudflare caching
- Review API response times

**High memory usage**
- Check for memory leaks in API routes
- Review image optimization settings

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Linting passes
- [ ] Environment variables configured
- [ ] Build output verified
- [ ] E2E tests passing
- [ ] Manual QA completed
- [ ] Rollback plan ready

## Contact

For deployment issues, contact the development team.
