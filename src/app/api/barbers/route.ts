import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistanceMiles } from '@/lib/geo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userLatStr = searchParams.get('lat');
    const userLngStr = searchParams.get('lng');
    const serviceType = searchParams.get('type'); // 'STUDIO', 'HOUSE_CALL', or 'ALL'
    const searchQuery = searchParams.get('query')?.toLowerCase();

    const barbers = await prisma.barberProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        services: true,
        portfolioImages: true,
        reviews: {
          include: {
            reviewer: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const userLat = userLatStr ? parseFloat(userLatStr) : null;
    const userLng = userLngStr ? parseFloat(userLngStr) : null;

    let formatted = barbers.map((barber) => {
      let distanceMiles: number | null = null;
      if (userLat !== null && userLng !== null) {
        distanceMiles = calculateDistanceMiles(
          userLat,
          userLng,
          barber.latitude,
          barber.longitude
        );
      }

      return {
        id: barber.id,
        userId: barber.userId,
        name: `${barber.user.firstName} ${barber.user.lastName}`,
        avatarUrl: barber.user.avatarUrl,
        phone: barber.user.phone,
        email: barber.user.email,
        bio: barber.bio,
        licenseNumber: barber.licenseNumber,
        isVerified: barber.isVerified,
        baseAddress: barber.baseAddress,
        latitude: barber.latitude,
        longitude: barber.longitude,
        maxTravelRadiusMiles: barber.maxTravelRadiusMiles,
        autoConfirmBookings: barber.autoConfirmBookings,
        rating: barber.rating,
        reviewCount: barber.reviewCount,
        distanceMiles,
        isWithinTravelRadius:
          distanceMiles !== null
            ? distanceMiles <= barber.maxTravelRadiusMiles
            : true,
        services: barber.services,
        portfolio: barber.portfolioImages,
        reviews: barber.reviews,
      };
    });

    // Apply filtering
    if (searchQuery) {
      formatted = formatted.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery) ||
          b.bio.toLowerCase().includes(searchQuery) ||
          b.baseAddress.toLowerCase().includes(searchQuery) ||
          b.services.some((s) => s.name.toLowerCase().includes(searchQuery))
      );
    }

    if (serviceType === 'HOUSE_CALL') {
      formatted = formatted.filter((b) => b.services.some((s) => s.houseCallPrice > 0));
    } else if (serviceType === 'STUDIO') {
      formatted = formatted.filter((b) => b.services.some((s) => s.studioPrice > 0));
    }

    // Sort by distance if location provided, else by rating
    if (userLat !== null && userLng !== null) {
      formatted.sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));
    } else {
      formatted.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('API Error /api/barbers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch barbers' },
      { status: 500 }
    );
  }
}
