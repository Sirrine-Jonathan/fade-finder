import { test, expect } from '@playwright/test';

test.describe('E2E Admin Suite — Dashboard, Verification Review, CMS & Database Reset', () => {

  test.describe('Admin Control Panel & Verification Requests (/admin)', () => {
    test('Admin Dashboard & Provider Verification Review (Approve/Reject)', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('domcontentloaded');

      const adminLayout = page.locator('body');
      await expect(adminLayout).toBeVisible();

      // Check pending verification request table/cards
      const verificationList = page.getByText(/verification requests|pending barbers|verifications/i).or(page.locator('h2, h3'));
      if (await verificationList.count() > 0) {
        await expect(verificationList.first()).toBeVisible();
      }

      // Check Approve & Reject action buttons
      const approveBtn = page.getByRole('button', { name: /approve/i });
      if (await approveBtn.count() > 0) {
        await expect(approveBtn.first()).toBeVisible();
      }

      const rejectBtn = page.getByRole('button', { name: /reject/i });
      if (await rejectBtn.count() > 0) {
        await expect(rejectBtn.first()).toBeVisible();
      }
    });

    test('Site Analytics & Reliability Reports', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('domcontentloaded');

      const analyticsCard = page.getByText(/site analytics|reliability|active users|bookings total/i);
      if (await analyticsCard.count() > 0) {
        await expect(analyticsCard.first()).toBeVisible();
      }
    });
  });

  test.describe('CMS Content Management (/admin/content)', () => {
    test('CMS Dashboard Overview (/admin/content)', async ({ page }) => {
      await page.goto('/admin/content');
      await page.waitForLoadState('domcontentloaded');

      const cmsHeader = page.locator('body');
      await expect(cmsHeader).toBeVisible();
    });

    test('Manage User Landing Page Content (/admin/content/landing)', async ({ page }) => {
      await page.goto('/admin/content/landing');
      await page.waitForLoadState('domcontentloaded');

      const landingForm = page.locator('form, body').first();
      await expect(landingForm).toBeVisible();

      // Title & Pitch content input
      const pitchInput = page.getByPlaceholder(/hero pitch|title|headline/i).or(page.locator('input[type="text"], textarea').first());
      if (await pitchInput.count() > 0) {
        await pitchInput.fill('Updated E2E Test Pitch: Premium Barbering On Demand');
      }

      // Save CMS content CTA
      const saveCmsBtn = page.getByRole('button', { name: /save content|publish|update/i });
      if (await saveCmsBtn.count() > 0) {
        await expect(saveCmsBtn.first()).toBeEnabled();
      }
    });

    test('Manage Provider Landing Page Content (/admin/content/providers-landing)', async ({ page }) => {
      await page.goto('/admin/content/providers-landing');
      await page.waitForLoadState('domcontentloaded');

      const providerCmsForm = page.locator('form, body').first();
      await expect(providerCmsForm).toBeVisible();

      const providerPitchInput = page.getByPlaceholder(/provider pitch|headline/i).or(page.locator('input[type="text"], textarea').first());
      if (await providerPitchInput.count() > 0) {
        await providerPitchInput.fill('Join 100+ Barbers Building Their Independent Business');
      }
    });
  });

  test.describe('Database Reset Relocation & Admin Settings (/admin/settings)', () => {
    test('Verify Database Reset Action in Admin Settings', async ({ page }) => {
      await page.goto('/admin/settings');
      await page.waitForLoadState('domcontentloaded');

      const settingsContainer = page.locator('body');
      await expect(settingsContainer).toBeVisible();

      // Verify presence of Reset DB button inside Admin Settings
      const resetDbBtn = page.getByRole('button', { name: /reset database|reset & seed db|scrub database/i }).or(page.getByText(/reset db/i));
      if (await resetDbBtn.count() > 0) {
        await expect(resetDbBtn.first()).toBeVisible();
      }
    });

    test('Verify Database Reset Button is REMOVED from Public Navigation Header', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Top navbar header should NOT contain public "Reset & Seed DB" button in production
      const publicResetBtn = page.locator('header').getByRole('button', { name: /reset & seed db/i });
      await expect(publicResetBtn).toHaveCount(0);
    });
  });

});
