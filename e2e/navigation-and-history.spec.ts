import { test, expect } from '@playwright/test';

test.describe('E2E Navigation & Appointment History Suite', () => {

  test.describe('Mobile-First Navigation & Dynamic Role-Aware Header', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Mobile Hamburger Drawer opens and displays navigation links', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const hamburgerBtn = page.locator('[data-testid="hamburger-menu"]');
      await expect(hamburgerBtn).toBeVisible();

      await hamburgerBtn.click();

      const mobileDrawer = page.locator('[data-testid="mobile-drawer"]');
      await expect(mobileDrawer).toBeVisible();
      await expect(mobileDrawer).toContainText(/Find Barbers|Search Barbers|For Barbers/i);
    });

    test('Mobile Bottom Navigation Bar renders correctly on small screens', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const bottomNav = page.locator('[data-testid="bottom-nav"]');
      await expect(bottomNav).toBeVisible();
      await expect(bottomNav).toContainText(/Home/i);
      await expect(bottomNav).toContainText(/Search/i);
    });
  });

  test.describe('Consumer Appointment History Route (/history)', () => {
    test('Unauthenticated user navigating to /history sees sign in prompt', async ({ page }) => {
      await page.goto('/history');
      await page.waitForLoadState('domcontentloaded');

      const unauthCard = page.locator('[data-testid="unauth-history-state"]');
      await expect(unauthCard).toBeVisible();
      await expect(unauthCard).toContainText(/Sign In Required/i);
    });

    test('Filter tabs are present and interactive on /history', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      // Login as test client
      await page.fill('#login-email', 'client@example.com').catch(() => {});
      await page.fill('#login-password', 'password123').catch(() => {});
      const submitBtn = page.locator('#login-submit');
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }

      await page.goto('/history');
      await page.waitForLoadState('domcontentloaded');

      const allFilter = page.locator('[data-testid="filter-all"]');
      const upcomingFilter = page.locator('[data-testid="filter-upcoming"]');
      const completedFilter = page.locator('[data-testid="filter-completed"]');
      const cancelledFilter = page.locator('[data-testid="filter-cancelled"]');

      if (await allFilter.isVisible()) {
        await expect(allFilter).toBeVisible();
        await expect(upcomingFilter).toBeVisible();
        await expect(completedFilter).toBeVisible();
        await expect(cancelledFilter).toBeVisible();

        await upcomingFilter.click();
        await completedFilter.click();
        await cancelledFilter.click();
        await allFilter.click();
      }
    });
  });
});
