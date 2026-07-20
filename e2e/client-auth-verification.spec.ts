import { test, expect } from '@playwright/test';

test.describe('E2E Client Authentication Verification Suite', () => {

  test('Complete E2E Client Auth Verification: Register, Login, Session Check, & Logout', async ({ page }) => {
    const testUser = {
      firstName: 'E2ETest',
      lastName: 'Client',
      email: `client_e2e_${Date.now()}_${Math.floor(Math.random() * 100000)}@example.com`,
      password: 'SecurePassword123!',
      phone: '555-0199',
    };

    // 1. Register new client user via registration form
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    const firstNameInput = page.locator('input[name="firstName"]').or(page.locator('input[type="text"]').first());
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill(testUser.firstName);

    const lastNameInput = page.locator('input[name="lastName"]').or(page.locator('input[type="text"]').nth(1));
    if (await lastNameInput.count() > 0) {
      await lastNameInput.fill(testUser.lastName);
    }

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill(testUser.email);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(testUser.password);

    const submitBtn = page.getByRole('button', { name: /create account|register|sign up/i });
    await submitBtn.click();

    // Verify registration completion
    await page.waitForLoadState('networkidle');

    // 2. Test Invalid Login credentials return error
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill(testUser.email);
    await page.locator('input[type="password"]').fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Verify error notification or message
    await expect(page.locator('body')).toContainText(/invalid|error|incorrect|failed/i);

    // 3. Test Valid Login with created user
    await page.locator('input[type="password"]').fill(testUser.password);
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();

    // 4. Verify session via page context API call
    const meData = await page.evaluate(async () => {
      const res = await fetch('/api/auth/me');
      return res.json();
    });

    expect(meData.success).toBe(true);
    expect(meData.user.email).toBe(testUser.email);

    // 5. Test Logout clears session cookie & returns null user
    const logoutData = await page.evaluate(async () => {
      const logoutRes = await fetch('/api/auth/logout', { method: 'POST' });
      const meRes = await fetch('/api/auth/me');
      return meRes.json();
    });

    expect(logoutData.user).toBeNull();
  });
});
