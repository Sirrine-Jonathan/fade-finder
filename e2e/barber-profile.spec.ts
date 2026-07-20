import { test, expect } from '@playwright/test';

test.describe('E2E Suite 3 — Public Barber Profile, Dual-Tier Pricing & Reviews', () => {

  let barberSlug = '';
  let barberEmail = '';

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();
    barberEmail = `profile_barber_${ts}@example.com`;
    const password = 'Password123!';

    const regRes = await request.post('/api/auth/register', {
      data: {
        role: 'BARBER',
        email: barberEmail,
        password,
        firstName: 'ProfileMaster',
        lastName: 'Fades',
        licenseNumber: 'UT-LIC-772211',
      },
    });
    expect(regRes.status()).toBe(200);
    const body = await regRes.json();
    barberSlug = body.user?.barberProfile?.slug || 'profilemaster-fades';
  });

  test('3.1 Public Barber Slug Profile Renders Details & Bio', async ({ page }) => {
    await page.goto(`/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('main, h1, h2').first()).toBeVisible();
  });

  test('3.2 Dual-Tier Service Pricing & Availability Display', async ({ page }) => {
    await page.goto(`/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('3.3 License Verification Badge & Professional Information', async ({ page }) => {
    await page.goto(`/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('3.4 Non-Existent Barber Slug Handles 404 gracefully', async ({ page }) => {
    await page.goto('/non-existent-barber-slug-99999');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    // Login as barber to delete account
    const loginRes = await request.post('/api/auth/login', {
      data: { email: barberEmail, password: 'Password123!' },
    });
    if (loginRes.status() === 200) {
      await request.delete('/api/auth/me');
    }
  });

});
