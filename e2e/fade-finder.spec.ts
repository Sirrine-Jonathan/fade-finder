import { test, expect } from '@playwright/test';

const TARGET_URL = process.env.TEST_TARGET_URL || 'https://fade-finder-app-53fb0754df0f.herokuapp.com';

test.describe('Fade Finder — End-to-End Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to live Heroku app
    await page.goto(TARGET_URL);
    await page.waitForLoadState('networkidle');
  });

  test('1. App Branding & Header Verification', async ({ page }) => {
    // Verify brand title and taglines
    await expect(page.locator('h1')).toContainText('FADE FINDER');
    await expect(page.locator('header')).toContainText('Local Barbers. On Demand.');
    
    // Verify MVP badge
    await expect(page.locator('header')).toContainText('MVP');

    // Verify navigation tabs
    await expect(page.getByRole('button', { name: 'Find Barbers' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Bookings/i })).toBeVisible();
  });

  test('2. Barber Discovery & Search Functionality', async ({ page }) => {
    // Verify initial barbers loaded
    const barberCards = page.locator('div.glass-panel');
    await expect(barberCards.first()).toBeVisible();

    // Test search filter by barber name
    const searchInput = page.getByPlaceholder(/Search by barber name/i);
    await searchInput.fill('Marcus');
    await page.getByRole('button', { name: 'Search' }).click();

    // Verify Marcus is listed
    await expect(page.locator('main')).toContainText('Marcus Vance');

    // Test service type filter pill for Mobile House Calls
    await page.getByRole('button', { name: /House Call \(Mobile\)/i }).click();
    await expect(page.locator('main')).toContainText('Marcus Vance');
  });

  test('3. Barber Profile Details, Dual Pricing & Verification Badge', async ({ page }) => {
    // Verify DOPL Verification badge
    await expect(page.locator('main')).toContainText('DOPL Verified');

    // Verify dual pricing badges (In-Studio vs House Call)
    await expect(page.locator('main')).toContainText('💈 Studio:');
    await expect(page.locator('main')).toContainText('🚗 House Call:');

    // Verify travel radius notice
    await expect(page.locator('main')).toContainText('Mobile travel up to');
  });

  test('4. Interactive Booking Flow & Confirmation', async ({ page }) => {
    // Click book appointment on first barber card
    await page.getByRole('button', { name: 'Book Appointment' }).first().click();

    // Verify booking modal opens
    const modal = page.locator('div.glass-panel').last();
    await expect(modal).toContainText('Book with');

    // Select House Call service option
    await page.getByRole('button', { name: /Barber Comes to Me/i }).click();

    // Enter special instructions
    const notesInput = page.getByPlaceholder(/Gate code, parking notes/i);
    await notesInput.fill('E2E Test Booking - Call on arrival');

    // Confirm booking
    await page.getByRole('button', { name: /Confirm Booking/i }).click();

    // Verify booking success confirmation
    await expect(page.locator('main, div')).toContainText(/Booking Confirmed!|Booking Submitted!/i);
  });

  test('5. Barber Dashboard & Bookings Manager', async ({ page }) => {
    // Switch to Bookings tab
    await page.getByRole('button', { name: /Bookings/i }).click();

    // Verify appointment schedule is visible
    await expect(page.locator('h2')).toContainText('Appointment Bookings');
    await expect(page.locator('main')).toContainText('Total Price:');
  });

  test('6. Database Reset & Seed Trigger Endpoint', async ({ page }) => {
    // Listen for dialog alert
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Scrub database');
      await dialog.accept();
    });

    // Click Reset & Seed DB button
    const resetButton = page.getByRole('button', { name: /Reset & Seed DB/i });
    await resetButton.click();

    // Wait for reset completion alert
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Database scrubbed & seeded successfully');
      await dialog.accept();
    });
  });

});
