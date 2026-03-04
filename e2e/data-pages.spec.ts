import { test, expect } from '@playwright/test';

const testDomain = 'example.com';

test.describe('Data Pages', () => {
  test.describe('Main Data Page', () => {
    test('should display domain in heading', async ({ page }) => {
      await page.goto(`/data/${testDomain}`);

      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toContainText(/example\.com/i, { timeout: 10000 });
    });

    test('should have navigation tabs or sections', async ({ page }) => {
      await page.goto(`/data/${testDomain}`);

      // Look for common navigation elements
      const nav = page.locator('nav, [role="tablist"], .tabs').first();
      await expect(nav).toBeVisible({ timeout: 10000 });
    });

    test('should display loading state initially', async ({ page }) => {
      await page.goto(`/data/${testDomain}`);

      // Check for loading indicator or content
      const content = page.locator('main, [data-testid="loading"], .loading').first();
      await expect(content).toBeVisible({ timeout: 10000 });
    });

    test('should have proper meta tags', async ({ page }) => {
      await page.goto(`/data/${testDomain}`);

      const title = await page.title();
      expect(title.toLowerCase()).toContain('example.com');
    });
  });

  test.describe('Traffic Data Page', () => {
    test('should display traffic page', async ({ page }) => {
      await page.goto(`/data/${testDomain}/traffic`);

      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should have traffic-related content', async ({ page }) => {
      await page.goto(`/data/${testDomain}/traffic`);

      const pageContent = page.locator('body');
      await expect(pageContent).toContainText(/traffic|visits|analytics/i, { timeout: 10000 });
    });
  });

  test.describe('SEO Data Page', () => {
    test('should display SEO page', async ({ page }) => {
      await page.goto(`/data/${testDomain}/seo`);

      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should have SEO-related content', async ({ page }) => {
      await page.goto(`/data/${testDomain}/seo`);

      const pageContent = page.locator('body');
      await expect(pageContent).toContainText(/seo|score|heading/i, { timeout: 10000 });
    });
  });

  test.describe('Tech Data Page', () => {
    test('should display tech page', async ({ page }) => {
      await page.goto(`/data/${testDomain}/tech`);

      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should have tech-related content', async ({ page }) => {
      await page.goto(`/data/${testDomain}/tech`);

      const pageContent = page.locator('body');
      await expect(pageContent).toContainText(/tech|stack|dns|infrastructure/i, { timeout: 10000 });
    });
  });

  test.describe('Business Data Page', () => {
    test('should display business page', async ({ page }) => {
      await page.goto(`/data/${testDomain}/business`);

      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should have business-related content', async ({ page }) => {
      await page.goto(`/data/${testDomain}/business`);

      const pageContent = page.locator('body');
      await expect(pageContent).toContainText(/business|trust|intelligence/i, { timeout: 10000 });
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/data/${testDomain}`);

      const main = page.locator('main').first();
      await expect(main).toBeVisible({ timeout: 10000 });
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/data/${testDomain}`);

      const main = page.locator('main').first();
      await expect(main).toBeVisible({ timeout: 10000 });
    });
  });
});
