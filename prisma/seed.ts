import { PrismaClient, Role, LocationType, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Scrubbing existing database...');
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding deterministic test data...');

  // 1. Seed Barbers
  const barbersData = [
    {
      email: 'marcus.fades@example.com',
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '555-0101',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Master Barber with 10+ years experience specializing in skin fades, line-ups, and luxury hot towel shaves. Mobile cuts available within 15 miles.',
      licenseNumber: 'UT-BARBER-884920',
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
      firstName: 'Derek',
      lastName: 'Miller',
      phone: '555-0102',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Mobile Barber pioneer. Bringing premium shop-quality cuts straight to your home or office.',
      licenseNumber: 'UT-BARBER-993812',
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
      firstName: 'Elena',
      lastName: 'Rostova',
      phone: '555-0103',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'Precision shears, textured crops, and modern styles. Dedicated home studio in Sugar House.',
      licenseNumber: 'UT-BARBER-772194',
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
      firstName: 'Jamal',
      lastName: 'Washington',
      phone: '555-0104',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'Specializing in sharp line-ups, graphics, beard oil treatments, and low/mid/high fades.',
      licenseNumber: 'UT-BARBER-661923',
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
      firstName: 'Carlos',
      lastName: 'Gomez',
      phone: '555-0105',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      bio: 'Classic barbershop experience. Traditional razor shaves and pompadour sculpting.',
      licenseNumber: 'UT-BARBER-554109',
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
    }
  ];

  const createdBarbers = [];

  for (const b of barbersData) {
    const user = await prisma.user.create({
      data: {
        email: b.email,
        passwordHash: 'hashed_password_123',
        role: Role.BARBER,
        phone: b.phone,
        firstName: b.firstName,
        lastName: b.lastName,
        avatarUrl: b.avatarUrl,
        barberProfile: {
          create: {
            bio: b.bio,
            licenseNumber: b.licenseNumber,
            isVerified: true,
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

  // 2. Seed Clients
  const clientsData = [
    { email: 'alex.client@example.com', firstName: 'Alex', lastName: 'Johnson', phone: '555-0201' },
    { email: 'sam.client@example.com', firstName: 'Sam', lastName: 'Taylor', phone: '555-0202' },
    { email: 'jordan.client@example.com', firstName: 'Jordan', lastName: 'Lee', phone: '555-0203' },
    { email: 'chris.client@example.com', firstName: 'Chris', lastName: 'Evans', phone: '555-0204' },
    { email: 'pat.client@example.com', firstName: 'Pat', lastName: 'Morgan', phone: '555-0205' },
  ];

  const createdClients = [];
  for (const c of clientsData) {
    const client = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: 'hashed_password_123',
        role: Role.CLIENT,
        phone: c.phone,
        firstName: c.firstName,
        lastName: c.lastName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.firstName}`
      }
    });
    createdClients.push(client);
  }

  // 3. Seed Appointments
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

  // 4. Seed Review
  await prisma.review.create({
    data: {
      appointmentId: completedAppt.id,
      reviewerId: alexClient.id,
      revieweeId: createdBarbers[0].id,
      rating: 5,
      comment: 'Best fade in SLC! Marcus was on time, super professional, and gave me a fresh clean cut.'
    }
  });

  console.log(`✅ Successfully seeded DB with ${createdBarbers.length} barbers, ${createdClients.length} clients, services, and test appointments!`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
