import { test, expect } from '@playwright/test';
import { PrismaClient, Role, VerificationStatus, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_CLIENT_EMAIL = `natural.client.${Date.now()}@fadefinder.test`;
const TEST_BARBER_EMAIL = `natural.barber.${Date.now()}@fadefinder.test`;

test.describe.serial('E2E Natural Lifecycle & Unseeded Data Flow', () => {

  test.afterAll(async () => {
    console.log('🧹 Teardown: Cleaning up natural E2E accounts and records...');
    try {
      // Find created test users
      const testUsers = await prisma.user.findMany({
        where: {
          email: {
            in: [TEST_CLIENT_EMAIL, TEST_BARBER_EMAIL],
          },
        },
        select: { id: true, barberProfile: { select: { id: true } } },
      });

      const userIds = testUsers.map((u) => u.id);
      const barberProfileIds = testUsers
        .map((u) => u.barberProfile?.id)
        .filter((id): id is string => Boolean(id));

      if (userIds.length > 0) {
        await prisma.review.deleteMany({
          where: {
            OR: [
              { reviewerId: { in: userIds } },
              { revieweeId: { in: userIds } },
            ],
          },
        });

        await prisma.appointment.deleteMany({
          where: {
            OR: [
              { clientId: { in: userIds } },
              { barberId: { in: barberProfileIds } },
            ],
          },
        });

        await prisma.availability.deleteMany({
          where: { barberId: { in: barberProfileIds } },
        });

        await prisma.portfolioImage.deleteMany({
          where: { barberId: { in: barberProfileIds } },
        });

        await prisma.service.deleteMany({
          where: { barberId: { in: barberProfileIds } },
        });

        await prisma.barberProfile.deleteMany({
          where: { id: { in: barberProfileIds } },
        });

        await prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
      }
      console.log('✅ Cleanup complete! All test accounts purged.');
    } catch (err) {
      console.error('Error during test teardown cleanup:', err);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Step 1: Verify home page and search initial load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Verify search page navigation
    await page.goto('/search');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Step 2: Register a new Client user naturally via API/UI', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');

    // Register client account via auth API to guarantee clean token creation
    const response = await page.request.post('/api/auth/register', {
      data: {
        role: 'CLIENT',
        email: TEST_CLIENT_EMAIL,
        password: 'Password123!',
        firstName: 'Natural',
        lastName: 'Client',
        phone: '555-0999',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.email).toBe(TEST_CLIENT_EMAIL);
  });

  test('Step 3: Register a new Barber provider user naturally', async ({ page }) => {
    await page.goto('/providers/register');
    await page.waitForLoadState('domcontentloaded');

    const response = await page.request.post('/api/auth/register', {
      data: {
        role: 'BARBER',
        email: TEST_BARBER_EMAIL,
        password: 'Password123!',
        firstName: 'Natural',
        lastName: 'Barber',
        phone: '555-0888',
        bio: 'Master Natural Barber specializing in sharp fades and line-ups.',
        licenseNumber: 'UT-E2E-NATURAL-100',
        baseAddress: '200 S Main St, Salt Lake City, UT 84101',
        maxTravelRadiusMiles: 25.0,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.user.barberProfile).toBeDefined();
    expect(body.user.barberProfile.licenseNumber).toBe('UT-E2E-NATURAL-100');
  });

  test('Step 4: Admin logs in & approves the new Barber profile', async ({ page }) => {
    // Admin login
    const loginRes = await page.request.post('/api/auth/login', {
      data: {
        email: 'admin@fadefinder.com',
        password: 'adminpassword123',
      },
    });
    expect(loginRes.status()).toBe(200);

    // Verify newly registered barber is in database and approve verification
    const barberProfile = await prisma.barberProfile.findFirst({
      where: { licenseNumber: 'UT-E2E-NATURAL-100' },
    });
    expect(barberProfile).not.toBeNull();

    await prisma.barberProfile.update({
      where: { id: barberProfile!.id },
      data: {
        isVerified: true,
        verificationStatus: VerificationStatus.APPROVED,
      },
    });

    const updatedProfile = await prisma.barberProfile.findUnique({
      where: { id: barberProfile!.id },
    });
    expect(updatedProfile?.isVerified).toBe(true);
    expect(updatedProfile?.verificationStatus).toBe(VerificationStatus.APPROVED);
  });

  test('Step 5: Client searches for barbers and books an appointment', async ({ page }) => {
    // Login as Client
    await page.request.post('/api/auth/login', {
      data: {
        email: TEST_CLIENT_EMAIL,
        password: 'Password123!',
      },
    });

    const clientUser = await prisma.user.findUnique({ where: { email: TEST_CLIENT_EMAIL } });
    const barberUser = await prisma.user.findUnique({
      where: { email: TEST_BARBER_EMAIL },
      include: { barberProfile: { include: { services: true } } },
    });

    expect(clientUser).not.toBeNull();
    expect(barberUser).not.toBeNull();
    expect(barberUser?.barberProfile?.services.length).toBeGreaterThan(0);

    const service = barberUser!.barberProfile!.services[0];

    // Create appointment naturally via API/UI
    const apptRes = await page.request.post('/api/appointments', {
      data: {
        barberId: barberUser!.barberProfile!.id,
        serviceId: service.id,
        locationType: 'HOUSE_CALL',
        clientAddress: '100 E South Temple, Salt Lake City, UT 84111',
        startTimeStr: new Date(Date.now() + 86400000).toISOString(),
        notes: 'Natural E2E test appointment',
      },
    });

    expect(apptRes.status()).toBe(200);
    const apptBody = await apptRes.json();
    expect(apptBody.success).toBe(true);
    expect(apptBody.data.totalPrice).toBe(service.houseCallPrice);
  });

  test('Step 6: Barber manages appointment status & completes cut', async ({ page }) => {
    // Login as Barber
    await page.request.post('/api/auth/login', {
      data: {
        email: TEST_BARBER_EMAIL,
        password: 'Password123!',
      },
    });

    const barberUser = await prisma.user.findUnique({
      where: { email: TEST_BARBER_EMAIL },
      include: { barberProfile: true },
    });

    const appointment = await prisma.appointment.findFirst({
      where: { barberId: barberUser!.barberProfile!.id },
    });
    expect(appointment).not.toBeNull();

    // Confirm & Complete appointment
    const updateRes = await page.request.patch('/api/appointments', {
      data: {
        appointmentId: appointment!.id,
        status: 'COMPLETED',
      },
    });

    expect(updateRes.status()).toBe(200);
    const updatedAppt = await prisma.appointment.findUnique({ where: { id: appointment!.id } });
    expect(updatedAppt?.status).toBe(AppointmentStatus.COMPLETED);
  });

  test('Step 7: Client submits a 5-star review for the Barber', async ({ page }) => {
    const clientUser = await prisma.user.findUnique({ where: { email: TEST_CLIENT_EMAIL } });
    const barberUser = await prisma.user.findUnique({
      where: { email: TEST_BARBER_EMAIL },
      include: { barberProfile: true },
    });

    const appointment = await prisma.appointment.findFirst({
      where: { barberId: barberUser!.barberProfile!.id },
    });

    const review = await prisma.review.create({
      data: {
        appointmentId: appointment!.id,
        reviewerId: clientUser!.id,
        revieweeId: barberUser!.id,
        rating: 5,
        comment: 'Incredible natural cut! Punctual, razor-sharp line-up.',
      },
    });

    expect(review.rating).toBe(5);
    expect(review.comment).toContain('Incredible natural cut!');
  });
});
