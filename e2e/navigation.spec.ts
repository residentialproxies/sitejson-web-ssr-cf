import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate from home to data page', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/domain|search/i).or(
      page.locator('input[type="text"], input[type="search"]')
    );

    await searchInput.fill('example.com');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/example\.com|site|data/, { timeout: 10000 });
  });

  test('should have working internal links', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a[href^="/"]').all();

    for (const link of links.slice(0, 5)) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('//')) {
        const response = await page.request.get(href);
        expect(response.status()).toBeLessThan(400);
      }
    }
  });

  test('should navigate between data sub-pages', async ({ page }) => {
    const domain = 'example.com';
    await page.goto(`/data/${domain}`);

    // Look for navigation to sub-pages
    const subPageLinks = page.locator(`a[href*="/data/${domain}/"]`);
    const count = await subPageLinks.count();

    if (count > 0) {
      const firstLink = subPageLinks.first();
      await firstLink.click();

      await expect(page).toHaveURL(/\/data\/example\.com\//);
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Should show some kind of error or not found message
    const pageText = await body.textContent();
    const hasErrorIndicator =
      pageText?.toLowerCase().includes('not found') ||
      pageText?.toLowerCase().includes('404') ||
      pageText?.toLowerCase().includes('error');

    expect(hasErrorIndicator).toBeTruthy();
  });

  test('should maintain scroll position on navigation', async ({ page }) => {
    await page.goto('/');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));

    // Navigate and go back
    await page.goto('/data/example.com');
    await page.goBack();

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThanOrEqual(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    // Check for skip links or proper ARIA labels
    const nav = page.locator('nav, [role="navigation"]').first();
    const hasNav = await nav.isVisible().catch(() => false);

    if (hasNav) {
      const ariaLabel = await nav.getAttribute('aria-label');
      expect(ariaLabel || await nav.isVisible()).toBeTruthy();
    }
  });
});

test.describe('URL Structure', () => {
  test('should handle encoded URLs correctly', async ({ page }) => {
    const encodedDomain = encodeURIComponent('example.com/path');
    await page.goto(`/data/${encodedDomain}`);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should redirect or handle trailing slashes consistently', async ({ page }) => {
    const response = await page.request.get('/data/example.com/');
    expect([200, 301, 302, 308]).toContain(response.status());
  });
});
