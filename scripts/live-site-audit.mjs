import { chromium, devices } from 'playwright';

const baseUrl = process.env.SITE_AUDIT_BASE_URL || 'https://sitejson.com';
const canonicalBaseUrl = process.env.SITE_AUDIT_CANONICAL_BASE_URL || baseUrl;
const mobileMenuSelector = 'header button[aria-controls="primary-mobile-menu"], header button[aria-label*="menu" i]';
const routes = [
  '/',
  '/directory',
  '/insights',
  '/data/openai.com',
  '/this-route-should-not-exist-site-patrol',
];

const viewports = [
  { name: 'desktop', options: { viewport: { width: 1440, height: 1080 } } },
  { name: 'mobile', options: devices['iPhone 13'] },
];

function absolute(path) {
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

function normalizeComparableUrl(value) {
  if (!value) {
    return value;
  }
  return value.replace(/\/+$/, '') || '/';
}

async function getOptionalAttribute(page, selector, attribute) {
  return page.evaluate(
    ({ currentSelector, currentAttribute }) => {
      const node = document.querySelector(currentSelector);
      return node?.getAttribute(currentAttribute) ?? null;
    },
    { currentSelector: selector, currentAttribute: attribute },
  );
}

async function getAttributeValues(page, selector, attribute) {
  return page.evaluate(
    ({ currentSelector, currentAttribute }) => (
      Array.from(document.querySelectorAll(currentSelector), (node) => node.getAttribute(currentAttribute) ?? '')
    ),
    { currentSelector: selector, currentAttribute: attribute },
  );
}

async function countUnlabeledInputs(page) {
  return page.evaluate(() => (
    Array.from(document.querySelectorAll('input:not([type="hidden"])')).filter((node) => {
      const input = node;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      const id = input.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      return !ariaLabel && !ariaLabelledBy && !label;
    }).length
  ));
}

async function inspectPage(page, route, mode) {
  const pageErrors = [];
  page.removeAllListeners('pageerror');
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  const url = absolute(route);
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  const title = await page.title();
  const description = await getOptionalAttribute(page, 'meta[name="description"]', 'content');
  const canonical = await getOptionalAttribute(page, 'link[rel="canonical"]', 'href');
  const robots = await getAttributeValues(page, 'meta[name="robots"]', 'content');
  const h1Count = await page.locator('h1').count();
  const h1Text = await page.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? null);
  const skipLinkCount = await page.locator('a[href="#main-content"]').count();
  const navButtonCount = await page.locator('header button').count();
  const mobileMenuExpanded = await getOptionalAttribute(page, mobileMenuSelector, 'aria-expanded');
  const mobileMenuControls = await getOptionalAttribute(page, mobileMenuSelector, 'aria-controls');
  const unlabeledInputs = await countUnlabeledInputs(page);
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);

  return {
    route,
    mode,
    status: response?.status() ?? 0,
    title,
    description,
    canonical,
    robots,
    h1Count,
    h1Text,
    skipLinkCount,
    navButtonCount,
    mobileMenuExpanded,
    mobileMenuControls,
    unlabeledInputs,
    hasOverflow,
    pageErrors,
  };
}

async function inspectIndexingArtifacts() {
  const robotsUrl = absolute('/robots.txt');
  const sitemapUrl = absolute('/sitemap.xml');
  const [robotsResponse, sitemapResponse] = await Promise.all([
    fetch(robotsUrl),
    fetch(sitemapUrl),
  ]);

  const robotsText = await robotsResponse.text();
  const sitemapText = await sitemapResponse.text();
  const sitemapMatches = Array.from(sitemapText.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1]);

  return {
    robotsUrl,
    robotsStatus: robotsResponse.status,
    robotsText,
    sitemapUrl,
    sitemapStatus: sitemapResponse.status,
    sitemapText,
    sitemapUrls: sitemapMatches,
  };
}

const browser = await chromium.launch({ headless: true });
const results = [];
const indexing = await inspectIndexingArtifacts();

try {
  for (const viewport of viewports) {
    const context = await browser.newContext(viewport.options);
    const page = await context.newPage();

    for (const route of routes) {
      results.push(await inspectPage(page, route, viewport.name));
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const issues = [];

for (const result of results) {
  const label = `${result.mode} ${result.route}`;
  const normalizedRobots = result.robots.map((value) => value.trim().toLowerCase()).filter(Boolean);
  const uniqueRobots = [...new Set(normalizedRobots)];
  const hasNoindex = normalizedRobots.some((value) => value.includes('noindex'));

  if (result.route === '/this-route-should-not-exist-site-patrol') {
    if (result.status !== 404) {
      issues.push(`${label}: expected 404, received ${result.status}`);
    }
    if (result.title !== 'Page Not Found | SiteJSON') {
      issues.push(`${label}: unexpected 404 title "${result.title}"`);
    }
    if (uniqueRobots.length !== 1 || uniqueRobots[0] !== 'noindex') {
      issues.push(`${label}: expected a single noindex robots meta, received ${JSON.stringify(result.robots)}`);
    }
    if (result.canonical === canonicalBaseUrl || result.canonical === `${canonicalBaseUrl}/`) {
      issues.push(`${label}: 404 page should not canonicalize to the homepage`);
    }
  } else {
    if (result.status !== 200) {
      issues.push(`${label}: expected 200, received ${result.status}`);
    }
    if (!result.description) {
      issues.push(`${label}: missing meta description`);
    }
    if (!result.canonical) {
      issues.push(`${label}: missing canonical URL`);
    }
    if (result.route !== '/' && (result.canonical === canonicalBaseUrl || result.canonical === `${canonicalBaseUrl}/`)) {
      issues.push(`${label}: canonical incorrectly points to the homepage`);
    }
    if (hasNoindex) {
      issues.push(`${label}: unexpected noindex robots directive on an indexable route ${JSON.stringify(result.robots)}`);
    }
    if (result.h1Text && result.h1Text.toLowerCase().includes('page not found')) {
      issues.push(`${label}: rendered not-found UI on an expected 200 route`);
    }
    if (result.route.startsWith('/data/') && result.h1Text && result.h1Text.toLowerCase().includes('temporarily unavailable')) {
      issues.push(`${label}: rendered temporary-unavailable UI on a priority report page`);
    }
  }

  if (result.h1Count !== 1) {
    issues.push(`${label}: expected exactly one H1, received ${result.h1Count}`);
  }

  if (uniqueRobots.length > 1) {
    issues.push(`${label}: conflicting robots directives ${JSON.stringify(result.robots)}`);
  }

  if (result.route !== '/' && result.unlabeledInputs > 0) {
    issues.push(`${label}: found ${result.unlabeledInputs} unlabeled visible input(s)`);
  }

  if (!result.mobileMenuExpanded) {
    issues.push(`${label}: mobile menu button is missing aria-expanded`);
  }

  if (!result.mobileMenuControls) {
    issues.push(`${label}: mobile menu button is missing aria-controls`);
  }

  if (result.hasOverflow) {
    issues.push(`${label}: detected horizontal overflow`);
  }

  if (result.pageErrors.length > 0) {
    issues.push(`${label}: page errors detected ${JSON.stringify(result.pageErrors)}`);
  }
}

if (indexing.robotsStatus !== 200) {
  issues.push(`robots.txt: expected 200, received ${indexing.robotsStatus}`);
}

if (!indexing.robotsText.includes(`Sitemap: ${canonicalBaseUrl.replace(/\/+$/, '')}/sitemap.xml`)) {
  issues.push(`robots.txt: missing expected sitemap declaration for ${canonicalBaseUrl.replace(/\/+$/, '')}/sitemap.xml`);
}

if (indexing.sitemapStatus !== 200) {
  issues.push(`sitemap.xml: expected 200, received ${indexing.sitemapStatus}`);
}

if (indexing.sitemapUrls.length === 0) {
  issues.push('sitemap.xml: no <loc> entries found');
}

const normalizedSitemapUrls = new Set(indexing.sitemapUrls.map((url) => normalizeComparableUrl(url)));

for (const requiredUrl of [
  `${canonicalBaseUrl.replace(/\/+$/, '')}/`,
  `${canonicalBaseUrl.replace(/\/+$/, '')}/directory`,
  `${canonicalBaseUrl.replace(/\/+$/, '')}/insights`,
  `${canonicalBaseUrl.replace(/\/+$/, '')}/data/openai.com`,
]) {
  if (!normalizedSitemapUrls.has(normalizeComparableUrl(requiredUrl))) {
    issues.push(`sitemap.xml: missing required URL ${requiredUrl}`);
  }
}

if (indexing.sitemapUrls.some((url) => url.includes('/this-route-should-not-exist-site-patrol'))) {
  issues.push('sitemap.xml: contains the guaranteed 404 route');
}

console.log(JSON.stringify({ baseUrl, canonicalBaseUrl, indexing, results, issues }, null, 2));

if (issues.length > 0) {
  process.exitCode = 1;
}
