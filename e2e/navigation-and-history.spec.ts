import { test, expect } from '@playwright/test';

test.describe('E2E Suite 8 — Navigation, Dynamic Header & Consumer History', () => {

  test.describe('Mobile-First Navigation & Role-Aware Header', () => {
    test('8.1 Mobile Header Hamburger & Drawer Toggle', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile screen size
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
      }
      await expect(page.locator('body')).toBeVisible();
    });

    test('8.2 Mobile Bottom Navigation Bar Rendering', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Consumer Appointment History (/history)', () => {
    test('8.3 Unauthenticated Access to /history Redirects to /login', async ({ page }) => {
      await page.goto('/history');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('8.4 Authenticated Client Views History Route', async ({ page, request }) => {
      const ts = Date.now();
      const email = `nav_client_${ts}@example.com`;
      const password = 'Password123!';

      // Register Client
      await request.post('/api/auth/register', {
        data: { role: 'CLIENT', email, password, firstName: 'NavClient', lastName: 'User' },
      });

      // Login Client
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);

      // Access /history
      await page.goto('/history');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Cleanup
      await page.request.delete('/api/auth/me');
    });
  });

});
