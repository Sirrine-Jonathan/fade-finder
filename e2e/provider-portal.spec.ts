import { test, expect } from '@playwright/test';

test.describe('E2E Suite 5 — Provider Portal, Verification Tracker, Profile & Analytics', () => {

  let barberEmail = '';
  const password = 'Password123!';

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();
    barberEmail = `portal_barber_${ts}@example.com`;

    const regRes = await request.post('/api/auth/register', {
      data: {
        role: 'BARBER',
        email: barberEmail,
        password,
        firstName: 'PortalBarber',
        lastName: 'Manager',
        licenseNumber: 'UT-LIC-556677',
      },
    });
    expect(regRes.status()).toBe(200);
  });

  test('5.1 Unauthenticated Provider Landing Page Pitch (/providers)', async ({ page }) => {
    await page.goto('/providers');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('5.2 Verification Status Tracker Route (/providers/status)', async ({ page }) => {
    await page.goto('/providers/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(barberEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto('/providers/status');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/providers/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.3 Private Profile Manager (/providers/profile/private)', async ({ page }) => {
    await page.goto('/providers/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(barberEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto('/providers/profile/private');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/providers/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.4 Provider Analytics Dashboard (/providers/analytics)', async ({ page }) => {
    await page.goto('/providers/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(barberEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto('/providers/analytics');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/providers/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('5.5 Provider Settings & POS Billing Placeholders', async ({ page }) => {
    await page.goto('/providers/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(barberEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto('/providers/settings');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/providers/login');

    await page.goto('/providers/billing');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/providers/login');
  });

  test.afterAll(async ({ request }) => {
    const l = await request.post('/api/auth/login', { data: { email: barberEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');
  });

});
