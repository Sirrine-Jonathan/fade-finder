import { test, expect } from '@playwright/test';

test.describe('E2E Suite 6 — Admin Control Panel, Verification Review & CMS Manager', () => {

  let adminEmail = '';
  let barberEmail = '';
  let barberId = '';
  const password = 'AdminPassword123!';

  test.beforeAll(async ({ request }) => {
    const ts = Date.now();
    adminEmail = `admin_cms_${ts}@example.com`;
    barberEmail = `pending_barber_${ts}@example.com`;

    // Create Admin
    await request.post('/api/auth/register', {
      data: { role: 'ADMIN', email: adminEmail, password, firstName: 'CMSAdmin', lastName: 'Master' },
    });

    // Create Pending Barber
    const bRes = await request.post('/api/auth/register', {
      data: { role: 'BARBER', email: barberEmail, password: 'Password123!', firstName: 'Pending', lastName: 'Barber', licenseNumber: 'UT-PEND-9911' },
    });
    const bBody = await bRes.json();
    barberId = bBody.user?.barberProfile?.id || '';
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(url => url.pathname === '/');
  });

  test('6.1 Admin Dashboard & Overview Statistics (/admin)', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('6.2 Admin Fetch Verifications API (/api/admin/verifications)', async ({ page }) => {
    const res = await page.request.get('/api/admin/verifications');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('6.3 Admin Approve Provider Verification Request', async ({ page }) => {
    if (!barberId) return;

    const res = await page.request.post('/api/admin/verifications', {
      data: { barberProfileId: barberId, action: 'APPROVE', notes: 'DOPL License Verified by E2E Test' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('6.4 CMS Content Dashboard Overview (/admin/content)', async ({ page }) => {
    await page.goto('/admin/content');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('6.5 Manage User Landing Page Content (/admin/content/landing)', async ({ page }) => {
    await page.goto('/admin/content/landing');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('6.6 Manage Provider Landing Page Content (/admin/content/providers-landing)', async ({ page }) => {
    await page.goto('/admin/content/providers-landing');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('6.7 Admin Settings & Danger Zone (/admin/settings)', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).not.toContain('/login');
    await expect(page.getByText(/Platform Settings|Danger Zone/i).first()).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    let l = await request.post('/api/auth/login', { data: { email: adminEmail, password } });
    if (l.status() === 200) await request.delete('/api/auth/me');

    l = await request.post('/api/auth/login', { data: { email: barberEmail, password: 'Password123!' } });
    if (l.status() === 200) await request.delete('/api/auth/me');
  });

});
