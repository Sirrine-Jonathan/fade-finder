import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Suite — Auth, Roles & Route Protection', () => {

  test.describe('Client Authentication & Authenticated Route Persistence', () => {
    test('Client Sign-In and Access Protected /history & /profile', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').first().fill('alex.client@example.com');
      await page.locator('input[type="password"]').first().fill('password123');
      await page.locator('button[type="submit"]').first().click();

      // Wait for login processing and initial redirect
      await page.waitForTimeout(1500);

      // Verify client can access protected /history route without being redirected to /login
      await page.goto('/history');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Verify client can access protected /profile route
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
    });
  });

  test.describe('Barber / Provider Authentication & Authenticated Route Persistence', () => {
    test('Provider Sign-In and Access Protected Provider Routes', async ({ page }) => {
      await page.goto('/providers/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').first().fill('marcus.fades@example.com');
      await page.locator('input[type="password"]').first().fill('password123');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1500);

      // Access protected provider private profile page
      await page.goto('/providers/profile/private');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/providers/login');
      await expect(page.locator('body')).toBeVisible();

      // Access protected provider settings page
      await page.goto('/providers/settings');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/providers/login');
    });
  });

  test.describe('Admin Authentication & Control Security', () => {
    test('Admin Sign-In and Access Site Admin Settings', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      await page.locator('input[type="email"]').first().fill('admin@fadefinder.com');
      await page.locator('input[type="password"]').first().fill('adminpassword123');
      await page.locator('button[type="submit"]').first().click();

      await page.waitForTimeout(1500);

      // Access protected admin settings page
      await page.goto('/admin/settings');
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).not.toContain('/login');
      await expect(page.getByText(/Platform Settings|Danger Zone/i).first()).toBeVisible();
    });
  });

  test.describe('Logged-Out Route Protection & API Security Boundaries', () => {
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

    test('Reject password reset without MFA recovery key for MFA enabled account', async ({ request }) => {
      const response = await request.post('/api/auth/forgot-password', {
        data: { email: 'admin@fadefinder.com', newPassword: 'HackedPassword123!' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toMatch(/MFA recovery key/i);
    });
  });

});
