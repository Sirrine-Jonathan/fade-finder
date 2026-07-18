import { PrismaClient, Role, LocationType, AppointmentStatus, VerificationStatus } from '@prisma/client';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Scrubbing existing database...');
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.cmsContent.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding deterministic test data...');

  const defaultPasswordHash = await hashPassword('password123');
  const adminPasswordHash = await hashPassword('adminpassword123');

  // 1. Seed Admin User
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

  // 2. Seed 6 Barbers (5 APPROVED, 1 PENDING)
  const barbersData = [
    {
      email: 'marcus.fades@example.com',
      slug: 'marcus-vance',
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '555-0101',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Master Barber with 10+ years experience specializing in skin fades, line-ups, and luxury hot towel shaves. Mobile cuts available within 15 miles.',
      licenseNumber: 'UT-BARBER-884920',
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
      baseAddress: '123 Main St, Salt Lake City, UT 84101',
      latitude: 40.7608,
      longitude: -111.8910,
      maxTravelRadiusMiles: 15.0,
      autoConfirmBookings: true,
      rating: 4.9,
      reviewCount: 38,
      services: [
        { name: 'Signature Skin Fade', description: 'Clean skin fade with razor line-up and styling.', durationMinutes: 45, studioPrice: 35.0, houseCallPrice: 55.0 },
        { name: 'Beard Sculpt & Hot Towel', description: 'Detailed beard trim, shaping, and hot towel treatment.', durationMinutes: 30, studioPrice: 25.0, houseCallPrice: 40.0 },
        { name: 'Full Executive Package', description: 'Haircut, beard sculpt, hot towel shave, and scalp massage.', durationMinutes: 75, studioPrice: 65.0, houseCallPrice: 95.0 },
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
      ]
    },
    {
      email: 'derek.cuts@example.com',
      slug: 'derek-miller',
      firstName: 'Derek',
      lastName: 'Miller',
      phone: '555-0102',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Mobile Barber pioneer. Bringing premium shop-quality cuts straight to your home or office.',
      licenseNumber: 'UT-BARBER-993812',
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
      baseAddress: '450 S 700 E, Salt Lake City, UT 84102',
      latitude: 40.7580,
      longitude: -111.8710,
      maxTravelRadiusMiles: 25.0,
      autoConfirmBookings: false,
      rating: 4.8,
      reviewCount: 24,
      services: [
        { name: 'Mobile House Call Cut', description: 'Full haircut service at your location.', durationMinutes: 45, studioPrice: 40.0, houseCallPrice: 60.0 },
        { name: 'Father & Son Combo', description: 'Two haircuts back to back at your house or my studio.', durationMinutes: 90, studioPrice: 70.0, houseCallPrice: 100.0 },
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80',
      ]
    },
    {
      email: 'elena.stylist@example.com',
      slug: 'elena-rostova',
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '555-0103',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Precision shears, textured crops, and modern styles. Dedicated home studio in Sugar House.',
      licenseNumber: 'UT-BARBER-772194',
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
      baseAddress: '1500 E 2100 S, Salt Lake City, UT 84105',
      latitude: 40.7260,
      longitude: -111.8480,
      maxTravelRadiusMiles: 10.0,
      autoConfirmBookings: true,
      rating: 5.0,
      reviewCount: 42,
      services: [
        { name: 'Textured Crop & Taper', description: 'Modern scissor work and taper fade.', durationMinutes: 45, studioPrice: 45.0, houseCallPrice: 70.0 },
        { name: 'Kids Haircut (Under 12)', description: 'Patient, clean haircut for youth.', durationMinutes: 30, studioPrice: 25.0, houseCallPrice: 45.0 },
      ],
      portfolio: [
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=80',
      ]
    },
    {
      email: 'jamal.blendz@example.com',
      slug: 'jamal-blendz',
      firstName: 'Jamal',
      lastName: 'Washington',
      phone: '555-0104',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Specializing in sharp line-ups, graphics, beard oil treatments, and low/mid/high fades.',
      licenseNumber: 'UT-BARBER-661923',
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
      baseAddress: '800 W 1000 N, West Valley, UT 84116',
      latitude: 40.7800,
      longitude: -111.9200,
      maxTravelRadiusMiles: 20.0,
      autoConfirmBookings: true,
      rating: 4.7,
      reviewCount: 19,
      services: [
        { name: 'High Fade & Line-Up', description: 'Razor sharp edge up and high drop fade.', durationMinutes: 40, studioPrice: 30.0, houseCallPrice: 50.0 },
        { name: 'Beard Lineup & Oil Treatment', description: 'Beard trimming, razor crisp edges, organic beard oil application.', durationMinutes: 25, studioPrice: 20.0, houseCallPrice: 35.0 },
      ],
      portfolio: []
    },
    {
      email: 'carlos.razor@example.com',
      slug: 'carlos-gomez',
      firstName: 'Carlos',
      lastName: 'Gomez',
      phone: '555-0105',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      bio: 'Classic barbershop experience. Traditional razor shaves and pompadour sculpting.',
      licenseNumber: 'UT-BARBER-554109',
      isVerified: true,
      verificationStatus: VerificationStatus.APPROVED,
      baseAddress: '300 S State St, Salt Lake City, UT 84111',
      latitude: 40.7620,
      longitude: -111.8880,
      maxTravelRadiusMiles: 12.0,
      autoConfirmBookings: true,
      rating: 4.9,
      reviewCount: 55,
      services: [
        { name: 'Traditional Straight Razor Shave', description: 'Hot towel prep, rich lather, double pass shave, cold towel finish.', durationMinutes: 45, studioPrice: 38.0, houseCallPrice: 60.0 },
        { name: 'Classic Gentleman Cut', description: 'Scissors and clippers classic cut styled with premium pomade.', durationMinutes: 40, studioPrice: 32.0, houseCallPrice: 50.0 },
      ],
      portfolio: []
    },
    {
      email: 'jake.fresh@example.com',
      slug: 'jake-fresh',
      firstName: 'Jake',
      lastName: 'Fresh',
      phone: '555-0106',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      bio: 'Up and coming barber specializing in modern streetwear styles and sharp tapers.',
      licenseNumber: 'UT-BARBER-112233',
      isVerified: false,
      verificationStatus: VerificationStatus.PENDING,
      baseAddress: '100 S Main St, Salt Lake City, UT 84101',
      latitude: 40.7650,
      longitude: -111.8900,
      maxTravelRadiusMiles: 10.0,
      autoConfirmBookings: true,
      rating: 5.0,
      reviewCount: 0,
      services: [
        { name: 'Fresh Taper Fade', description: 'Modern low taper fade with styled top.', durationMinutes: 35, studioPrice: 30.0, houseCallPrice: 45.0 },
      ],
      portfolio: []
    }
  ];

  const createdBarbers = [];

  for (const b of barbersData) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        passwordHash: defaultPasswordHash,
        role: Role.BARBER,
        phone: b.phone,
        firstName: b.firstName,
        lastName: b.lastName,
        avatarUrl: b.avatarUrl,
        barberProfile: {
          create: {
            slug: b.slug,
            bio: b.bio,
            licenseNumber: b.licenseNumber,
            isVerified: b.isVerified,
            verificationStatus: b.verificationStatus,
            baseAddress: b.baseAddress,
            latitude: b.latitude,
            longitude: b.longitude,
            maxTravelRadiusMiles: b.maxTravelRadiusMiles,
            autoConfirmBookings: b.autoConfirmBookings,
            rating: b.rating,
            reviewCount: b.reviewCount,
            services: {
              create: b.services
            },
            portfolioImages: {
              create: b.portfolio.map(url => ({ imageUrl: url, caption: 'Recent fresh cut' }))
            },
            availabilities: {
              create: [1, 2, 3, 4, 5, 6].map(day => ({ dayOfWeek: day, startTime: '09:00', endTime: '18:00' }))
            }
          }
        }
      },
      include: {
        barberProfile: {
          include: {
            services: true
          }
        }
      }
    });

    createdBarbers.push(user);
  }

  // 3. Seed 10 Clients
  const clientsData = [
    { email: 'alex.client@example.com', firstName: 'Alex', lastName: 'Johnson', phone: '555-0201' },
    { email: 'sam.client@example.com', firstName: 'Sam', lastName: 'Taylor', phone: '555-0202' },
    { email: 'jordan.client@example.com', firstName: 'Jordan', lastName: 'Lee', phone: '555-0203' },
    { email: 'chris.client@example.com', firstName: 'Chris', lastName: 'Evans', phone: '555-0204' },
    { email: 'pat.client@example.com', firstName: 'Pat', lastName: 'Morgan', phone: '555-0205' },
    { email: 'taylor.client@example.com', firstName: 'Taylor', lastName: 'Swift', phone: '555-0206' },
    { email: 'morgan.client@example.com', firstName: 'Morgan', lastName: 'Freeman', phone: '555-0207' },
    { email: 'peele.client@example.com', firstName: 'Jordan', lastName: 'Peele', phone: '555-0208' },
    { email: 'samsmith.client@example.com', firstName: 'Sam', lastName: 'Smith', phone: '555-0209' },
    { email: 'casey.client@example.com', firstName: 'Casey', lastName: 'Neistat', phone: '555-0210' },
  ];

  const createdClients = [];
  for (const c of clientsData) {
    const client = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: defaultPasswordHash,
        role: Role.CLIENT,
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.firstName}`
      }
    });
    createdClients.push(client);
  }

  // 4. Seed Appointments & Bi-Directional Reviews
  const marcusBarber = createdBarbers[0].barberProfile!;
  const marcusService = marcusBarber.services[0];
  const alexClient = createdClients[0];

  const upcomingAppt = await prisma.appointment.create({
    data: {
      clientId: alexClient.id,
      barberId: marcusBarber.id,
      serviceId: marcusService.id,
      locationType: LocationType.HOUSE_CALL,
      clientAddress: '789 Foothill Dr, Salt Lake City, UT 84108',
      clientLatitude: 40.7520,
      clientLongitude: -111.8350,
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 86400000 + 45 * 60000),
      status: AppointmentStatus.CONFIRMED,
      totalPrice: marcusService.houseCallPrice,
      notes: 'Please call when you arrive at the gate.'
    }
  });

  const completedAppt = await prisma.appointment.create({
    data: {
      clientId: alexClient.id,
      barberId: marcusBarber.id,
      serviceId: marcusService.id,
      locationType: LocationType.STUDIO,
      startTime: new Date(Date.now() - 172800000), // 2 days ago
      endTime: new Date(Date.now() - 172800000 + 45 * 60000),
      status: AppointmentStatus.COMPLETED,
      totalPrice: marcusService.studioPrice
    }
  });

  // Client -> Barber Review
  await prisma.review.create({
    data: {
      appointmentId: completedAppt.id,
      reviewerId: alexClient.id,
      revieweeId: createdBarbers[0].id,
      rating: 5,
      comment: 'Best fade in SLC! Marcus was on time, super professional, and gave me a fresh clean cut.'
    }
  });

  // Barber -> Client Review on another completed appointment
  const samClient = createdClients[1];
  const derekBarber = createdBarbers[1].barberProfile!;
  const derekService = derekBarber.services[0];

  const completedAppt2 = await prisma.appointment.create({
    data: {
      clientId: samClient.id,
      barberId: derekBarber.id,
      serviceId: derekService.id,
      locationType: LocationType.HOUSE_CALL,
      clientAddress: '100 S 200 E, Salt Lake City, UT 84101',
      clientLatitude: 40.7600,
      clientLongitude: -111.8800,
      startTime: new Date(Date.now() - 259200000), // 3 days ago
      endTime: new Date(Date.now() - 259200000 + 45 * 60000),
      status: AppointmentStatus.COMPLETED,
      totalPrice: derekService.houseCallPrice
    }
  });

  await prisma.review.create({
    data: {
      appointmentId: completedAppt2.id,
      reviewerId: createdBarbers[1].id,
      revieweeId: samClient.id,
      rating: 5,
      comment: 'Sam was a great client! Punctual, respectful, and easy to work with.'
    }
  });

  // 5. Seed CMS Content
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

  console.log(`✅ Successfully seeded DB with Admin (${adminUser.email}), ${createdBarbers.length} barbers (5 approved, 1 pending), ${createdClients.length} clients, services, appointments, bi-directional reviews, and default CMS content!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
