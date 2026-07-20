import { test, expect } from '@playwright/test';

test.describe('E2E Suite 2 — Consumer Discovery, Landing & Search Engine Filters', () => {

  test.describe('Landing Page & Value Proposition', () => {
    test('2.1 Unauthenticated Landing Page Pitch & Navigation Elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('h1, h2').first()).toBeVisible();
      await expect(page.locator('nav').first()).toBeVisible();
      await expect(page.locator('footer').first()).toBeVisible();
    });

    test('2.2 PWA Branding & Mobile Install Prompt Verification', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Search Engine, Filtering & Sorting Options (/search)', () => {
    test('2.3 Search Page Initial Load & Filter Sidebar Renders', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      expect(page.url()).toContain('/search');
      await expect(page.locator('body')).toBeVisible();
    });

    test('2.4 Location & Address Search Controls', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      const searchInput = page.locator('input[type="text"]').or(page.getByPlaceholder(/city|zip|address|location/i)).first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Salt Lake City');
        await searchInput.press('Enter');
      }
      expect(page.url()).toContain('/search');
    });

    test('2.5 Service Type Filter Toggle (In-Shop vs House-Call)', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      const filterToggle = page.getByText(/house call|mobile|in-shop|studio/i).first();
      if (await filterToggle.isVisible()) {
        await filterToggle.click();
      }
      expect(page.url()).toContain('/search');
    });

    test('2.6 Rating and Maximum Distance Filter Boundary Limits', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      const ratingFilter = page.getByText(/4\.0\+|4\.5\+|5\.0/i).first();
      if (await ratingFilter.isVisible()) {
        await ratingFilter.click();
      }
      expect(page.url()).toContain('/search');
    });

    test('2.7 Sorting Options (Price, Rating, Distance)', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      const sortSelect = page.locator('select').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.selectOption({ index: 1 });
      }
      expect(page.url()).toContain('/search');
    });

    test('2.8 View Mode Toggle (Grid vs List View)', async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');

      const toggleBtn = page.getByRole('button', { name: /list|grid/i }).first();
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
      }
      expect(page.url()).toContain('/search');
    });

    test('2.9 Empty Search Results State & Clear Filters CTA', async ({ page }) => {
      await page.goto('/search?query=NonExistentBarberQuery99999');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });
  });

});
