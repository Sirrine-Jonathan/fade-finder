import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'BARBER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Barber authentication required' },
        { status: 401 }
      );
    }

    const barber = await prisma.barberProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        services: true,
        availabilities: true,
        portfolioImages: true,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { success: false, error: 'Barber profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: barber });
  } catch (error) {
    console.error('API Error GET /api/barbers/private:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch private barber profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'BARBER' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Barber authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      bio,
      baseAddress,
      latitude,
      longitude,
      maxTravelRadiusMiles,
      autoConfirmBookings,
      services,
      availabilities,
    } = body;

    const existingBarber = await prisma.barberProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!existingBarber) {
      return NextResponse.json(
        { success: false, error: 'Barber profile not found' },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.barberProfile.update({
      where: { userId: session.userId },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(baseAddress !== undefined ? { baseAddress } : {}),
        ...(latitude !== undefined ? { latitude: parseFloat(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: parseFloat(longitude) } : {}),
        ...(maxTravelRadiusMiles !== undefined
          ? { maxTravelRadiusMiles: parseFloat(maxTravelRadiusMiles) }
          : {}),
        ...(autoConfirmBookings !== undefined ? { autoConfirmBookings: Boolean(autoConfirmBookings) } : {}),
      },
      include: {
        services: true,
        availabilities: true,
        portfolioImages: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Handle updating services if provided
    if (Array.isArray(services)) {
      await prisma.service.deleteMany({ where: { barberId: existingBarber.id } });
      if (services.length > 0) {
        await prisma.service.createMany({
          data: services.map((s: { name: string; description: string; durationMinutes: number; studioPrice: number; houseCallPrice: number }) => ({
            barberId: existingBarber.id,
            name: s.name,
            description: s.description || '',
            durationMinutes: Number(s.durationMinutes) || 30,
            studioPrice: Number(s.studioPrice) || 0,
            houseCallPrice: Number(s.houseCallPrice) || 0,
          })),
        });
      }
    }

    // Handle updating availabilities if provided
    if (Array.isArray(availabilities)) {
      await prisma.availability.deleteMany({ where: { barberId: existingBarber.id } });
      if (availabilities.length > 0) {
        await prisma.availability.createMany({
          data: availabilities.map((a: { dayOfWeek: number; startTime: string; endTime: string }) => ({
            barberId: existingBarber.id,
            dayOfWeek: Number(a.dayOfWeek),
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        });
      }
    }

    const refreshed = await prisma.barberProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
        services: true,
        availabilities: true,
        portfolioImages: true,
      },
    });

    return NextResponse.json({ success: true, data: refreshed });
  } catch (error) {
    console.error('API Error PUT /api/barbers/private:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update private barber profile' },
      { status: 500 }
    );
  }
}
