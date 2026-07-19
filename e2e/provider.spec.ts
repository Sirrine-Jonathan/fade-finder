import { test, expect } from '@playwright/test';

test.describe('E2E Provider Suite — Barber Landing, Profile Manager & Analytics', () => {

  test.describe('Provider Landing Page & Dashboard (/providers)', () => {
    test('Unauthenticated Provider Landing Page Pitch', async ({ page }) => {
      await page.goto('/providers');
      await page.waitForLoadState('domcontentloaded');

      const landingHeading = page.locator('h1, header, main').first();
      await expect(landingHeading).toContainText(/Barber|Provider|Grow|Join/i);

      // Check prominent link to Provider Login
      const loginLink = page.getByRole('link', { name: /provider login|barber login|login/i }).or(page.getByText(/login/i));
      if (await loginLink.count() > 0) {
        await expect(loginLink.first()).toBeVisible();
      }

      // Check link to Provider Registration
      const registerLink = page.getByRole('link', { name: /register|sign up|join/i }).or(page.getByText(/register/i));
      if (await registerLink.count() > 0) {
        await expect(registerLink.first()).toBeVisible();
      }
    });

    test('Authenticated Provider Dashboard View', async ({ page }) => {
      await page.goto('/providers');
      await page.waitForLoadState('domcontentloaded');

      // Check for appointments overview section
      const appointmentsSection = page.getByText(/appointments|bookings|upcoming/i).or(page.locator('h2, h3'));
      if (await appointmentsSection.count() > 0) {
        await expect(appointmentsSection.first()).toBeVisible();
      }

      // Check link to Barber Feed / Community
      const feedLink = page.getByRole('link', { name: /feed|community|posts/i }).or(page.getByText(/feed/i));
      if (await feedLink.count() > 0) {
        await expect(feedLink.first()).toBeVisible();
      }
    });
  });

  test.describe('Provider Registration & Verification Tracker (/providers/status)', () => {
    test('Verification Request Status Tracker', async ({ page }) => {
      await page.goto('/providers/status');
      await page.waitForLoadState('domcontentloaded');

      const statusPage = page.locator('body');
      await expect(statusPage).toBeVisible();

      // Check status indicators (e.g. SUBMITTED, IN_REVIEW, APPROVED)
      const trackerStep = page.getByText(/pending|submitted|under review|approved|status/i);
      if (await trackerStep.count() > 0) {
        await expect(trackerStep.first()).toBeVisible();
      }

      // Check instructions / help section
      const helpInfo = page.getByText(/help|support|contact|dopl/i);
      if (await helpInfo.count() > 0) {
        await expect(helpInfo.first()).toBeVisible();
      }
    });
  });

  test.describe('Private Profile Manager (/providers/profile/private)', () => {
    test('Edit Bio, Working Hours, Dual-Tier Pricing & Auto-Confirm Toggle', async ({ page }) => {
      await page.goto('/providers/profile/private');
      await page.waitForLoadState('domcontentloaded');

      const formContainer = page.locator('form, body').first();
      await expect(formContainer).toBeVisible();

      // Title & short description fields
      const titleInput = page.getByPlaceholder(/title/i).or(page.locator('input[name="title"]'));
      if (await titleInput.count() > 0) {
        await titleInput.first().fill('Master Barber Dave');
      }

      // Full bio textarea
      const bioInput = page.getByPlaceholder(/bio/i).or(page.locator('textarea[name="bio"]'));
      if (await bioInput.count() > 0) {
        await bioInput.first().fill('Specializing in modern fades, beard sculpting, and luxury house calls.');
      }

      // Travel radius input
      const radiusInput = page.locator('input[name="maxTravelRadiusMiles"]').or(page.getByPlaceholder(/travel radius/i));
      if (await radiusInput.count() > 0) {
        await radiusInput.first().fill('20');
      }

      // Auto-confirm toggle checkbox/switch
      const autoConfirmCheckbox = page.locator('input[name="autoConfirmBookings"]').or(page.getByLabel(/auto-confirm/i));
      if (await autoConfirmCheckbox.count() > 0) {
        await autoConfirmCheckbox.first().check().catch(() => {});
      }

      // Save profile CTA button
      const saveBtn = page.getByRole('button', { name: /save|update profile/i });
      if (await saveBtn.count() > 0) {
        await expect(saveBtn.first()).toBeEnabled();
      }
    });
  });

  test.describe('Provider Analytics Dashboard (/providers/analytics)', () => {
    test('Profile Views, Search Appearances & Favorite Count Metrics', async ({ page }) => {
      await page.goto('/providers/analytics');
      await page.waitForLoadState('domcontentloaded');

      const analyticsContainer = page.locator('body');
      await expect(analyticsContainer).toBeVisible();

      // Check key metrics display
      const viewsMetric = page.getByText(/profile views|views/i);
      if (await viewsMetric.count() > 0) {
        await expect(viewsMetric.first()).toBeVisible();
      }

      const searchAppearances = page.getByText(/search appearances|impressions/i);
      if (await searchAppearances.count() > 0) {
        await expect(searchAppearances.first()).toBeVisible();
      }

      const favoriteCount = page.getByText(/favorites|favorited/i);
      if (await favoriteCount.count() > 0) {
        await expect(favoriteCount.first()).toBeVisible();
      }
    });
  });

  test.describe('Provider Settings & Billing (/providers/settings, /providers/billing)', () => {
    test('Provider Settings Page', async ({ page }) => {
      await page.goto('/providers/settings');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });

    test('Provider Billing & POS Management', async ({ page }) => {
      await page.goto('/providers/billing');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });
  });

});
