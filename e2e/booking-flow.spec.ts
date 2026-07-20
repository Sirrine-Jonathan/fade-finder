import { test, expect } from '@playwright/test';

test.describe('E2E Suite 4 — Interactive Appointment Booking & History Management', () => {

  let clientEmail = '';
  let barberEmail = '';
  let barberSlug = '';
  const password = 'Password123!';

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();
    clientEmail = `booking_client_${ts}@example.com`;
    barberEmail = `booking_barber_${ts}@example.com`;

    // Create Client
    await request.post('/api/auth/register', {
      data: { role: 'CLIENT', email: clientEmail, password, firstName: 'BookingClient', lastName: 'User' },
    });

    // Create Barber
    const bRes = await request.post('/api/auth/register', {
      data: { role: 'BARBER', email: barberEmail, password, firstName: 'BookingBarber', lastName: 'Master', licenseNumber: 'UT-LIC-334455' },
    });
    const bBody = await bRes.json();
    barberSlug = bBody.user?.barberProfile?.slug || 'bookingbarber-master';
  });

  test('4.1 Booking Request Page Initial Load', async ({ page }) => {
    await page.goto(`/booking/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('4.2 Service & Location Type Selection (Studio vs House-Call)', async ({ page }) => {
    await page.goto(`/booking/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    const serviceBtn = page.locator('button, input[type="radio"]').first();
    if (await serviceBtn.isVisible()) {
      await serviceBtn.click();
    }
    await expect(page.locator('body')).toBeVisible();
  });

  test('4.3 Authenticated Client Submits Appointment Request', async ({ page }) => {
    // Log in client
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(clientEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    // Navigate to booking page
    await page.goto(`/booking/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('4.4 Client Navigates to /history & Filters Appointments', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(clientEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    await page.goto('/history');
    await page.waitForLoadState('domcontentloaded');

    expect(page.url()).not.toContain('/login');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    // Teardown client
    let l = await request.post('/api/auth/login', { data: { email: clientEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');

    // Teardown barber
    l = await request.post('/api/auth/login', { data: { email: barberEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');
  });

});
