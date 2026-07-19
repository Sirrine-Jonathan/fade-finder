import { PrismaClient, Role } from '@prisma/client';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

const prisma = new PrismaClient();

export async function unseedDatabase() {
  console.log('🧹 Unseeding database (clearing all seeded barbers, clients & test data)...');
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.cmsContent.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding minimal system admin & CMS defaults...');

  const adminPasswordHash = await hashPassword('adminpassword123');

  // Seed default system admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@fadefinder.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: '555-0000',
      firstName: 'Admin',
      lastName: 'User',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      mfaRecoveryKey: 'ADMIN-RECOVERY-KEY-2026-X89K',
    },
  });

  // Seed default CMS content
  await prisma.cmsContent.createMany({
    data: [
      {
        page: 'landing',
        title: 'Fade Finder | Premier Mobile & Studio Barber Booking',
        heroHeading: 'Fresh Cuts Delivered to Your Door or Shop of Choice',
        heroSubheading: 'Book top-rated local barbers for mobile house calls or studio appointments in seconds.',
        featuresJson: JSON.stringify([
          { title: 'Verified Barbers', description: 'Licensed professionals with background checks and customer ratings.' },
          { title: 'Mobile & Studio', description: 'Choose house call convenience or traditional barbershop vibes.' },
          { title: 'Instant Booking', description: 'Real-time availability and transparent upfront pricing.' }
        ]),
        announcement: 'Now serving the greater Salt Lake City metro area!'
      },
      {
        page: 'providers-landing',
        title: 'Fade Finder for Barbers | Grow Your Independent Business',
        heroHeading: 'Fill Your Chair & Scale Your Mobile Barbering Business',
        heroSubheading: 'Set your own rates, manage your schedule, and reach hundreds of local clients.',
        featuresJson: JSON.stringify([
          { title: 'Keep 100% Control', description: 'You define your prices, services, and travel radiuses.' },
          { title: 'Automated Scheduling', description: 'Clients book available slots with auto-confirmation options.' },
          { title: 'Client Ratings', description: 'Build reputation through bi-directional client and provider reviews.' }
        ]),
        announcement: 'Join today and get 0% commission on your first 30 days!'
      }
    ]
  });

  console.log(`✨ Database unseeded! System Admin (${adminUser.email}) and CMS content initialized.`);
}

async function main() {
  await unseedDatabase();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error unseeding DB:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
