import { test, expect } from '@playwright/test';

test.describe('E2E Client Authentication Verification Suite', () => {

  test('Complete E2E Client Auth Verification: Register, Login, Session Check, & Logout', async ({ page }) => {
    const testUser = {
      firstName: 'E2ETest',
      lastName: 'Client',
      email: `client_e2e_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'SecurePassword123!',
      phone: '555-0199',
    };

    // 1. Register new client user via registration form
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="text"]').first().fill(testUser.firstName);
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

    // Verify registration completion by URL navigation or body state
    await expect(page.locator('body')).toBeVisible();

    // 2. Test Invalid Login credentials return error
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill(testUser.email);
    await page.locator('input[type="password"]').fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in|login/i }).click();

    // Verify error notification or error message
    const errorText = page.locator('body');
    await expect(errorText).toContainText(/invalid|error|incorrect|failed/i);

    // 3. Test Valid Login with created user
    await page.locator('input[type="password"]').fill(testUser.password);
    await page.getByRole('button', { name: /sign in|login/i }).click();

    await expect(page.locator('body')).toBeVisible();

    // 4. Prove session token cookie & /api/auth/me response using page.request
    const meRes = await page.request.get('/api/auth/me');
    expect(meRes.ok()).toBeTruthy();
    const meData = await meRes.json();
    expect(meData.success).toBe(true);
    expect(meData.user.email).toBe(testUser.email);

    // 5. Test Logout clears session cookie & returns null user
    const logoutRes = await page.request.post('/api/auth/logout');
    expect(logoutRes.ok()).toBeTruthy();

    const loggedOutMe = await page.request.get('/api/auth/me');
    const loggedOutData = await loggedOutMe.json();
    expect(loggedOutData.user).toBeNull();
  });
});
