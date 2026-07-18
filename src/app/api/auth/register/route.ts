import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role, VerificationStatus } from '@prisma/client';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role = 'CLIENT',
      email,
      password,
      firstName,
      lastName,
      phone = '',
      bio = '',
      licenseNumber = '',
      baseAddress = '',
      latitude = 40.7608,
      longitude = -111.8910,
      maxTravelRadiusMiles = 15.0,
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === 'BARBER' ? Role.BARBER : Role.CLIENT;

    let barberProfileData = undefined;
    if (userRole === Role.BARBER) {
      let baseSlug = slugify(`${firstName} ${lastName}`);
      if (!baseSlug) baseSlug = `barber-${Date.now()}`;
      
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.barberProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      barberProfileData = {
        create: {
          slug,
          bio: bio || 'Professional barber available for studio & mobile bookings.',
          licenseNumber: licenseNumber || `PENDING-LIC-${Date.now()}`,
          isVerified: false,
          verificationStatus: VerificationStatus.PENDING,
          baseAddress: baseAddress || 'Salt Lake City, UT',
          latitude: typeof latitude === 'number' ? latitude : parseFloat(latitude) || 40.7608,
          longitude: typeof longitude === 'number' ? longitude : parseFloat(longitude) || -111.8910,
          maxTravelRadiusMiles: typeof maxTravelRadiusMiles === 'number' ? maxTravelRadiusMiles : parseFloat(maxTravelRadiusMiles) || 15.0,
          autoConfirmBookings: true,
          rating: 5.0,
          reviewCount: 0,
          services: {
            create: [
              {
                name: 'Standard Cut',
                description: 'Classic cut and styling',
                durationMinutes: 30,
                studioPrice: 30.0,
                houseCallPrice: 50.0,
              },
            ],
          },
          availabilities: {
            create: [1, 2, 3, 4, 5].map((day) => ({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
            })),
          },
        },
      };
    }

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: userRole,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(firstName)}`,
        ...(barberProfileData ? { barberProfile: barberProfileData } : {}),
      },
      include: {
        barberProfile: {
          include: {
            services: true,
            availabilities: true,
          },
        },
      },
    });

    const token = createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        phone: newUser.phone,
        avatarUrl: newUser.avatarUrl,
        barberProfile: newUser.barberProfile || null,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('API Error POST /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
