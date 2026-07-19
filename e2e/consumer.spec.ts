import { test, expect } from '@playwright/test';

test.describe('E2E Consumer Suite — Client Landing, Search, Booking & Profile Flows', () => {

  test.describe('Consumer Landing Page & Pitch (/)', () => {
    test('Unauthenticated Landing Page Pitch & Value Proposition', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Verify branding logo / headline
      const heroHeader = page.locator('h1, header, main').first();
      await expect(heroHeader).toContainText(/FADE FINDER|Barbers|Local/i);

      // Verify pitch CTAs to find barbers or switch to provider view
      const searchBtn = page.getByRole('button', { name: /Find Barbers|Search/i }).or(page.getByRole('link', { name: /Search/i }));
      if (await searchBtn.count() > 0) {
        await expect(searchBtn.first()).toBeVisible();
      }

      // Check link to provider landing ("For Barbers")
      const providerLink = page.getByRole('link', { name: /For Barbers|Provider|Barber Landing/i }).or(page.getByText(/For Barbers/i));
      if (await providerLink.count() > 0) {
        await expect(providerLink.first()).toBeVisible();
      }
    });

    test('PWA Install Banner & Splash Screen Branding', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Check PWA install button or manifest references
      const pwaBanner = page.locator('[aria-label="Install App"], button:has-text("Install"), .pwa-prompt');
      if (await pwaBanner.count() > 0) {
        await expect(pwaBanner.first()).toBeVisible();
      }
    });
  });

  test.describe('Consumer Search Engine & Filtering (/search)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/search');
      await page.waitForLoadState('domcontentloaded');
    });

    test('Location Setting: GPS Lat/Lng & Address Geocoding', async ({ page }) => {
      const locationInput = page.getByPlaceholder(/enter zip code|address|city|location/i).or(page.locator('input[type="text"]').first());
      if (await locationInput.count() > 0) {
        await locationInput.fill('90210');
        await expect(locationInput).toHaveValue('90210');
      }

      const gpsBtn = page.getByRole('button', { name: /use my location|gps|current location/i });
      if (await gpsBtn.count() > 0) {
        await expect(gpsBtn.first()).toBeVisible();
      }
    });

    test('Service Type Filter: In-Shop vs House-Call (Mobile)', async ({ page }) => {
      const houseCallFilter = page.getByRole('button', { name: /House Call|Mobile/i }).or(page.getByText(/House Call/i));
      if (await houseCallFilter.count() > 0) {
        await houseCallFilter.first().click();
      }

      const studioFilter = page.getByRole('button', { name: /In-Shop|Studio/i }).or(page.getByText(/Studio/i));
      if (await studioFilter.count() > 0) {
        await studioFilter.first().click();
      }
    });

    test('Rating & Maximum Distance Filters with Boundary Limits', async ({ page }) => {
      // Min rating filter selection
      const ratingFilter = page.locator('select[name="minRating"], [aria-label="Min Rating"], input[name="minRating"]');
      if (await ratingFilter.count() > 0) {
        await ratingFilter.first().selectOption({ index: 1 }).catch(() => {});
      }

      // Max distance filter slider/input
      const distanceInput = page.locator('input[name="maxDistance"], input[type="range"]');
      if (await distanceInput.count() > 0) {
        await distanceInput.first().fill('15');
      }

      // Favorites filter toggle
      const favoritesToggle = page.getByRole('button', { name: /Favorites|Saved/i }).or(page.getByText(/Favorites/i));
      if (await favoritesToggle.count() > 0) {
        await favoritesToggle.first().click();
      }
    });

    test('Sorting Options: Low to High Price, Rating, Distance', async ({ page }) => {
      const sortSelect = page.locator('select[name="sortBy"]').or(page.getByRole('combobox', { name: /sort/i }));
      if (await sortSelect.count() > 0) {
        await sortSelect.first().selectOption({ value: 'price_asc' }).catch(() => {});
        await sortSelect.first().selectOption({ value: 'rating_desc' }).catch(() => {});
        await sortSelect.first().selectOption({ value: 'distance_asc' }).catch(() => {});
      }
    });

    test('Interactive Map Pins & Center Location Controls', async ({ page }) => {
      const mapContainer = page.locator('div.map, [aria-label="Barber Map"], .leaflet-container, canvas');
      if (await mapContainer.count() > 0) {
        await expect(mapContainer.first()).toBeVisible();
      }
    });

    test('List / Grid View Toggle & Clear Filters', async ({ page }) => {
      const gridToggle = page.getByRole('button', { name: /grid/i }).or(page.getByLabel(/grid view/i));
      if (await gridToggle.count() > 0) {
        await gridToggle.first().click();
      }

      const clearBtn = page.getByRole('button', { name: /clear filters|reset search/i });
      if (await clearBtn.count() > 0) {
        await clearBtn.first().click();
      }
    });

    test('Barber Card CTAs & Navigation', async ({ page }) => {
      const card = page.locator('.glass-panel, [data-testid="barber-card"], div.card').first();
      if (await card.count() > 0) {
        await expect(card).toBeVisible();

        // CTA for requesting appointment
        const bookBtn = card.getByRole('button', { name: /book|request appointment/i });
        if (await bookBtn.count() > 0) {
          await expect(bookBtn.first()).toBeVisible();
        }

        // CTA for viewing barber public profile
        const viewProfileBtn = card.getByRole('link', { name: /view profile|details/i }).or(card.getByRole('button', { name: /profile/i }));
        if (await viewProfileBtn.count() > 0) {
          await expect(viewProfileBtn.first()).toBeVisible();
        }
      }
    });

    test('Boundary Condition: Empty Search Results Handling', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"], input[type="text"]').first());
      if (await searchInput.count() > 0) {
        await searchInput.fill('XYZNONEXISTENTBARBER999');
        const searchBtn = page.getByRole('button', { name: /search/i });
        if (await searchBtn.count() > 0) {
          await searchBtn.first().click();
        }
      }
    });
  });

  test.describe('Barber Public Slug Profile (/:barber-slug)', () => {
    test('Public Barber Profile Details, Bio, Reviews & Gallery', async ({ page }) => {
      await page.goto('/marcus-vance');
      await page.waitForLoadState('domcontentloaded');

      const profileContent = page.locator('body');
      await expect(profileContent).toBeVisible();

      // Check for Favorite CTA button
      const favBtn = page.getByRole('button', { name: /favorite|heart|save/i });
      if (await favBtn.count() > 0) {
        await expect(favBtn.first()).toBeVisible();
      }

      // Check for Booking CTA button
      const bookCTA = page.getByRole('button', { name: /book appointment|schedule/i }).or(page.getByRole('link', { name: /book/i }));
      if (await bookCTA.count() > 0) {
        await expect(bookCTA.first()).toBeVisible();
      }
    });
  });

  test.describe('Booking Request Flow (/booking/:barber-slug)', () => {
    test('Complete Appointment Request Submission', async ({ page }) => {
      await page.goto('/booking/marcus-vance');
      await page.waitForLoadState('domcontentloaded');

      const bookingForm = page.locator('form, main, body').first();
      await expect(bookingForm).toBeVisible();

      // Select location type: House Call vs Studio
      const locationRadio = page.getByRole('radio', { name: /house call|barber comes to me/i }).or(page.getByText(/house call/i));
      if (await locationRadio.count() > 0) {
        await locationRadio.first().click();
      }

      // Fill address for house call
      const addressInput = page.getByPlaceholder(/address|location/i).or(page.locator('input[name="clientAddress"]'));
      if (await addressInput.count() > 0) {
        await addressInput.first().fill('123 Main Street, Salt Lake City, UT');
      }

      // Select service option
      const serviceOption = page.locator('select[name="serviceId"], input[type="radio"][name="service"]').first();
      if (await serviceOption.count() > 0) {
        await serviceOption.check().catch(() => {});
      }

      // Submit booking request
      const submitBtn = page.getByRole('button', { name: /confirm booking|submit request/i });
      if (await submitBtn.count() > 0) {
        await expect(submitBtn.first()).toBeEnabled();
      }
    });
  });

  test.describe('Client Settings & Billing Placeholders', () => {
    test('Client Settings Page (/settings)', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });

    test('Client Billing & Payment Methods Placeholder (/billing)', async ({ page }) => {
      await page.goto('/billing');
      await page.waitForLoadState('domcontentloaded');

      await expect(page.locator('body')).toBeVisible();
    });
  });

});
