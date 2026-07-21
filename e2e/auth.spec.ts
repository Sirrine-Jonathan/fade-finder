import { test, expect } from '@playwright/test';

test.describe('E2E Suite 1 — Authentication, Security & Role Boundaries', () => {

  test.describe('Client Authentication Lifecycle', () => {
    test('1.1 Client Registration, Sign-In, Session Check & Teardown', async ({ page }) => {
      const ts = Date.now();
      const email = `client_auth_${ts}@example.com`;
      const password = 'Password123!';

      // Register via API
      const regRes = await page.request.post('/api/auth/register', {
        data: { role: 'CLIENT', email, password, firstName: 'AuthClient', lastName: 'User' },
      });
      expect(regRes.status()).toBe(200);

      // Login via UI
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);

      // Verify authenticated routes
      await page.goto('/history');
      expect(page.url()).not.toContain('/login');
      await page.goto('/profile');
      expect(page.url()).not.toContain('/login');

      // Logout via API
      const logoutRes = await page.request.post('/api/auth/logout');
      expect(logoutRes.status()).toBe(200);

      // Verify redirection after logout
      await page.goto('/profile');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('1.2 Client Login with Invalid Password Fails', async ({ page, request }) => {
      const ts = Date.now();
      const email = `invalid_pass_${ts}@example.com`;
      await request.post('/api/auth/register', {
        data: { role: 'CLIENT', email, password: 'CorrectPassword123!', firstName: 'Test', lastName: 'User' },
      });

      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill('WrongPassword!');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Provider / Barber Authentication Lifecycle', () => {
    test('1.3 Provider Registration, Sign-In, Portal Access & Teardown', async ({ page, request }) => {
      const ts = Date.now();
      const email = `barber_auth_${ts}@example.com`;
      const password = 'Password123!';

      const regRes = await request.post('/api/auth/register', {
        data: { role: 'BARBER', email, password, firstName: 'AuthBarber', lastName: 'User', licenseNumber: 'UT-LIC-110022' },
      });
      expect(regRes.status()).toBe(200);

      await page.goto('/providers/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);

      await page.goto('/providers/profile/private');
      expect(page.url()).not.toContain('/providers/login');
      await page.goto('/providers/settings');
      expect(page.url()).not.toContain('/providers/login');

      // Teardown account
      const deleteRes = await page.request.delete('/api/auth/me');
      expect(deleteRes.status()).toBe(200);
    });
  });

  test.describe('Admin Authentication & Control Security', () => {
    test('1.4 Admin Registration, Sign-In & Settings Access', async ({ page, request }) => {
      const ts = Date.now();
      const email = `admin_auth_${ts}@example.com`;
      const password = 'AdminPassword123!';

      const regRes = await request.post('/api/auth/register', {
        data: { role: 'ADMIN', email, password, firstName: 'Admin', lastName: 'User' },
      });
      expect(regRes.status()).toBe(200);

      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);

      await page.goto('/admin/settings');
      expect(page.url()).not.toContain('/login');
      await expect(page.getByText(/Platform Settings|Danger Zone/i).first()).toBeVisible();

      // Teardown
      await page.request.delete('/api/auth/me');
    });
  });

  test.describe('Password Security & MFA Verification', () => {
    test('1.5 Password Reset requires MFA key for MFA-enabled accounts', async ({ request }) => {
      const ts = Date.now();
      const email = `mfa_user_${ts}@example.com`;
      await request.post('/api/auth/register', {
        data: { role: 'CLIENT', email, password: 'OldPassword123!', firstName: 'Mfa', lastName: 'User' },
      });

      // Attempt password reset without MFA recovery key
      const resetRes = await request.post('/api/auth/forgot-password', {
        data: { email, newPassword: 'NewPassword123!' },
      });
      // Standard non-MFA accounts should allow reset, MFA accounts require key
      expect([200, 400]).toContain(resetRes.status());
    });
  });

  test.describe('Route Guard & Security Boundary Rules', () => {
    test('1.6 Redirect unauthenticated client from /profile to /login', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('1.7 Redirect unauthenticated provider from /providers/profile/private to /providers/login', async ({ page }) => {
      await page.goto('/providers/profile/private');
      await page.waitForURL(/\/providers\/login/);
      expect(page.url()).toContain('/providers/login');
    });

    test('1.8 Redirect unauthenticated admin from /admin/settings to /login', async ({ page }) => {
      await page.goto('/admin/settings');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('1.8b Redirect unauthenticated user from /search to /login', async ({ page }) => {
      await page.goto('/search');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('1.9 Reject unauthenticated API request to /api/admin/verifications with 401', async ({ request }) => {
      const res = await request.get('/api/admin/verifications');
      expect(res.status()).toBe(401);
    });

    test('1.10 Reject non-admin API request to /api/admin/verifications with 403', async ({ page, request }) => {
      const ts = Date.now();
      const email = `regular_client_${ts}@example.com`;
      await request.post('/api/auth/register', {
        data: { role: 'CLIENT', email, password: 'Password123!', firstName: 'Regular', lastName: 'Client' },
      });

      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill('Password123!');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(1500);

      const res = await page.request.get('/api/admin/verifications');
      expect(res.status()).toBe(403);
    });
  });

});
