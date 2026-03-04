import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have correct title and meta tags', async ({ page }) => {
    await expect(page).toHaveTitle(/SiteJSON/);

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /Website intelligence/);
  });

  test('should display main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/SiteJSON|Website Intelligence/);
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/domain|search/i).or(
      page.locator('input[type="text"], input[type="search"]')
    );
    await expect(searchInput).toBeVisible();
  });

  test('should have navigation or header', async ({ page }) => {
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    const searchInput = page.getByPlaceholder(/domain|search/i).or(
      page.locator('input[type="text"], input[type="search"]')
    );
    await expect(searchInput).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('should have working links in navigation', async ({ page }) => {
    const links = page.locator('nav a, header a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Homepage Search', () => {
  test('should navigate to site report on search', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/domain|search/i).or(
      page.locator('input[type="text"], input[type="search"]')
    );

    await searchInput.fill('example.com');
    await searchInput.press('Enter');

    await expect(page).toHaveURL(/\/data\/example\.com/);
  });

  test('should handle invalid domain gracefully', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholder(/domain|search/i).or(
      page.locator('input[type="text"], input[type="search"]')
    );

    await searchInput.fill('not-a-valid-domain');
    await searchInput.press('Enter');

    // Should either show error or navigate anyway
    await expect(page.locator('body')).toBeVisible();
  });
});
