import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Suite — Dynamic Lifecycle & Route Protection (Zero Seeded Data)', () => {

  test.describe('Dynamic Client Auth Lifecycle (Create -> Sign-In -> Route Access -> Teardown)', () => {
    test('Client creates account, signs in, accesses /history & /profile, then deletes account', async ({ page, request }) => {
      const timestamp = Date.now();
      const clientEmail = `dyn_client_${timestamp}@example.com`;
      const clientPassword = 'Password123!';

      // 1. Create Client account via registration API
      const regRes = await request.post('/api/auth/register', {
        data: {
          role: 'CLIENT',
          email: clientEmail,
          password: clientPassword,
          firstName: 'DynamicClient',
          lastName: 'TestUser',
        },
      });
      expect(regRes.status()).toBe(200);

      // 2. Sign in via /login with newly created Client account
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').fill(clientEmail);
      await page.locator('input[type="password"]').fill(clientPassword);
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1500);

      // 3. Verify access to protected /history route
      await page.goto('/history');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // 4. Verify access to protected /profile route
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');

      // 5. Cleanup: Delete created Client account via page.request (inherits browser cookies)
      const deleteRes = await page.request.delete('/api/auth/me');
      expect(deleteRes.status()).toBe(200);
    });
  });

  test.describe('Dynamic Barber / Provider Auth Lifecycle (Create -> Sign-In -> Route Access -> Teardown)', () => {
    test('Provider creates account, signs in, accesses private provider routes, then deletes account', async ({ page, request }) => {
      const timestamp = Date.now();
      const barberEmail = `dyn_barber_${timestamp}@example.com`;
      const barberPassword = 'Password123!';

      // 1. Create Provider account via registration API
      const regRes = await request.post('/api/auth/register', {
        data: {
          role: 'BARBER',
          email: barberEmail,
          password: barberPassword,
          firstName: 'DynamicBarber',
          lastName: 'TestUser',
          licenseNumber: 'UT-LIC-999888',
        },
      });
      expect(regRes.status()).toBe(200);

      // 2. Sign in via /providers/login with newly created Provider account
      await page.goto('/providers/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').fill(barberEmail);
      await page.locator('input[type="password"]').fill(barberPassword);
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1500);

      // 3. Verify access to protected private profile (/providers/profile/private)
      await page.goto('/providers/profile/private');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/providers/login');
      await expect(page.locator('body')).toBeVisible();

      // 4. Verify access to protected provider settings (/providers/settings)
      await page.goto('/providers/settings');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/providers/login');

      // 5. Cleanup: Delete created Barber account via page.request (inherits browser cookies)
      const deleteRes = await page.request.delete('/api/auth/me');
      expect(deleteRes.status()).toBe(200);
    });
  });

  test.describe('Dynamic Admin Auth Lifecycle (Create -> Sign-In -> Admin Controls -> Teardown)', () => {
    test('Admin account dynamically created, signs in, accesses /admin/settings, then deletes account', async ({ page, request }) => {
      const timestamp = Date.now();
      const adminEmail = `dyn_admin_${timestamp}@example.com`;
      const adminPassword = 'AdminPassword123!';

      // 1. Create Admin account via registration endpoint
      const regRes = await request.post('/api/auth/register', {
        data: {
          role: 'ADMIN',
          email: adminEmail,
          password: adminPassword,
          firstName: 'DynamicAdmin',
          lastName: 'User',
        },
      });
      expect(regRes.status()).toBe(200);

      // 2. Sign in via /login with newly created Admin account
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').fill(adminEmail);
      await page.locator('input[type="password"]').fill(adminPassword);
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1500);

      // 3. Access protected admin settings page (/admin/settings)
      await page.goto('/admin/settings');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
      await expect(page.getByText(/Platform Settings|Danger Zone/i).first()).toBeVisible();

      // 4. Cleanup: Delete created Admin account via page.request (inherits browser cookies)
      const deleteRes = await page.request.delete('/api/auth/me');
      expect(deleteRes.status()).toBe(200);
    });
  });

  test.describe('Logged-Out Route Protection & Security Boundaries (Unauthenticated)', () => {
    test('Redirect unauthenticated user accessing protected client profile (/profile)', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('Redirect unauthenticated provider accessing private profile (/providers/profile/private)', async ({ page }) => {
      await page.goto('/providers/profile/private');
      await page.waitForURL(/\/providers\/login/);
      expect(page.url()).toContain('/providers/login');
    });

    test('Redirect unauthenticated admin accessing site admin settings (/admin/settings)', async ({ page }) => {
      await page.goto('/admin/settings');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('Reject unauthenticated API call to /api/admin/verifications', async ({ request }) => {
      const response = await request.get('/api/admin/verifications');
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/Authentication required/i);
    });

    test('Reject unauthenticated appointment status change via PATCH /api/appointments', async ({ request }) => {
      const response = await request.patch('/api/appointments', {
        data: { appointmentId: 'dummy-id', status: 'CANCELLED' },
      });
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });

});
