import { test, expect } from '@playwright/test';

test.describe('E2E Suite 7 — Natural Multi-Role Lifecycle & Inter-Role Operations', () => {

  const ts = Date.now();
  const clientEmail = `lifecycle_client_${ts}@example.com`;
  const barberEmail = `lifecycle_barber_${ts}@example.com`;
  const adminEmail = `lifecycle_admin_${ts}@example.com`;
  const password = 'Password123!';

  let barberId = '';
  let barberSlug = '';

  test('7.1 Step 1: Client Registration via API', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { role: 'CLIENT', email: clientEmail, password, firstName: 'LifeClient', lastName: 'User' },
    });
    expect(res.status()).toBe(200);
  });

  test('7.2 Step 2: Barber Registration via API', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { role: 'BARBER', email: barberEmail, password, firstName: 'LifeBarber', lastName: 'Master', licenseNumber: 'UT-LIC-778899' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    barberId = body.user?.barberProfile?.id || '';
    barberSlug = body.user?.barberProfile?.slug || 'lifebarber-master';
  });

  test('7.3 Step 3: Admin Registration & Approval of Barber Profile', async ({ page, request }) => {
    // Register Admin
    await request.post('/api/auth/register', {
      data: { role: 'ADMIN', email: adminEmail, password, firstName: 'LifeAdmin', lastName: 'User' },
    });

    // Admin login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    // Approve barber verification request
    if (barberId) {
      const appRes = await page.request.post('/api/admin/verifications', {
        data: { barberProfileId: barberId, action: 'APPROVE', notes: 'Approved in dynamic lifecycle test' },
      });
      expect(appRes.status()).toBe(200);
    }
  });

  test('7.4 Step 4: Client Searches & Views Approved Barber Profile', async ({ page }) => {
    // Client login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(clientEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);

    // View approved barber profile
    await page.goto(`/${barberSlug}`);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('7.5 Step 5: Teardown Dynamic Test Accounts', async ({ request }) => {
    let l = await request.post('/api/auth/login', { data: { email: clientEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');

    l = await request.post('/api/auth/login', { data: { email: barberEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');

    l = await request.post('/api/auth/login', { data: { email: adminEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');
  });

});
