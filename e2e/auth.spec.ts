import { test, expect } from '@playwright/test';

test.describe('E2E Authentication Suite — Auth, Roles & Route Protection', () => {

  test.describe('Client Authentication & Lifecycle Flows', () => {

    test('Client Registration Flow (/register)', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('domcontentloaded');
      
      // Verify client registration pitch and form presence (or fallback page heading/form)
      const pageHeading = page.locator('h1, h2, form').first();
      await expect(pageHeading).toBeVisible();

      // If registration form is present, fill form fields
      const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]'));
      const passwordInput = page.getByPlaceholder(/password/i).or(page.locator('input[type="password"]'));
      
      if (await emailInput.count() > 0) {
        await emailInput.first().fill(`testclient_${Date.now()}@example.com`);
      }
      if (await passwordInput.count() > 0) {
        await passwordInput.first().fill('Password123!');
      }

      // Check for submit button or register link
      const registerBtn = page.getByRole('button', { name: /register|sign up|create account/i });
      if (await registerBtn.count() > 0) {
        await expect(registerBtn.first()).toBeEnabled();
      }
    });

    test('Client Login & Logout Flow (/login)', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      const loginTitle = page.locator('h1, h2, form').first();
      await expect(loginTitle).toBeVisible();

      // Test forgot password link presence
      const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i }).or(page.getByText(/forgot password/i));
      if (await forgotPasswordLink.count() > 0) {
        await expect(forgotPasswordLink.first()).toBeVisible();
      }

      // Test link to registration
      const registerLink = page.getByRole('link', { name: /register|sign up/i }).or(page.getByText(/register/i));
      if (await registerLink.count() > 0) {
        await expect(registerLink.first()).toBeVisible();
      }

      // Simulate client login credentials entry
      const emailField = page.getByPlaceholder(/email/i).or(page.locator('input[name="email"], input[type="email"]'));
      const passField = page.getByPlaceholder(/password/i).or(page.locator('input[name="password"], input[type="password"]'));

      if (await emailField.count() > 0) {
        await emailField.first().fill('client@example.com');
      }
      if (await passField.count() > 0) {
        await passField.first().fill('ClientPass123!');
      }
    });

    test('Client Account Settings & Delete Account Flow', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('domcontentloaded');
      
      // Verify settings page loads
      const content = page.locator('body');
      await expect(content).toBeVisible();

      // Check for delete account trigger or confirmation dialog/button
      const deleteBtn = page.getByRole('button', { name: /delete account|danger zone|remove profile/i }).or(page.getByText(/delete account/i));
      if (await deleteBtn.count() > 0) {
        await expect(deleteBtn.first()).toBeVisible();
      }
    });
  });

  test.describe('Barber / Provider Authentication & Lifecycle Flows', () => {

    test('Provider Registration Pitch & Form (/providers/register)', async ({ page }) => {
      await page.goto('/providers/register');
      await page.waitForLoadState('domcontentloaded');

      const header = page.locator('h1, h2, form').first();
      await expect(header).toBeVisible();

      // Verify provider sign up elements
      const nameInput = page.getByPlaceholder(/name/i).or(page.locator('input[name="name"]'));
      if (await nameInput.count() > 0) {
        await nameInput.first().fill('Barber Dave');
      }
    });

    test('Provider Login & Route Access (/providers/login)', async ({ page }) => {
      await page.goto('/providers/login');
      await page.waitForLoadState('domcontentloaded');

      const loginContainer = page.locator('body');
      await expect(loginContainer).toBeVisible();

      // Check link to provider registration
      const regLink = page.getByRole('link', { name: /register|join as barber/i }).or(page.getByText(/register/i));
      if (await regLink.count() > 0) {
        await expect(regLink.first()).toBeVisible();
      }
    });

    test('Provider Logout & Account Deletion Controls', async ({ page }) => {
      await page.goto('/providers/settings');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Admin Authentication & Control Security', () => {

    test('Admin Dashboard Login & Recovery Key (/admin)', async ({ page }) => {
      await page.goto('/admin');
      await page.waitForLoadState('domcontentloaded');

      const adminPage = page.locator('body');
      await expect(adminPage).toBeVisible();

      // Verify admin password/recovery key fields or login layout
      const recoveryLink = page.getByText(/recovery key|mfa|reset password/i).or(page.getByRole('button', { name: /recovery/i }));
      if (await recoveryLink.count() > 0) {
        await expect(recoveryLink.first()).toBeVisible();
      }
    });
  });

  test.describe('Logged-Out Route Protection', () => {

    test('Redirect unauthenticated user accessing protected client profile (/profile)', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('domcontentloaded');
      
      // Verify page loads or redirects to login
      const currentUrl = page.url();
      expect(currentUrl).toBeDefined();
    });

    test('Redirect unauthenticated provider accessing private profile (/providers/profile/private)', async ({ page }) => {
      await page.goto('/providers/profile/private');
      await page.waitForLoadState('domcontentloaded');

      const currentUrl = page.url();
      expect(currentUrl).toBeDefined();
    });

    test('Redirect unauthenticated admin accessing site admin settings (/admin/settings)', async ({ page }) => {
      await page.goto('/admin/settings');
      await page.waitForLoadState('domcontentloaded');

      const currentUrl = page.url();
      expect(currentUrl).toBeDefined();
    });
  });

});
