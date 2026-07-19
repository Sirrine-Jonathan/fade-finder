import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Try finding by slug first, fallback to id lookup if not found
    let barber = await prisma.barberProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            receivedReviews: {
              include: {
                reviewer: {
                  select: { firstName: true, lastName: true, avatarUrl: true },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        services: true,
        portfolioImages: true,
        availabilities: true,
      },
    });

    if (!barber) {
      barber = await prisma.barberProfile.findUnique({
        where: { id: slug },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              receivedReviews: {
                include: {
                  reviewer: {
                    select: { firstName: true, lastName: true, avatarUrl: true },
                  },
                },
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          services: true,
          portfolioImages: true,
          availabilities: true,
        },
      });
    }

    if (!barber) {
      return NextResponse.json(
        { success: false, error: 'Barber profile not found' },
        { status: 404 }
      );
    }

    const formatted = {
      id: barber.id,
      userId: barber.userId,
      slug: barber.slug,
      name: `${barber.user.firstName} ${barber.user.lastName}`,
      avatarUrl: barber.user.avatarUrl,
      phone: barber.user.phone,
      email: barber.user.email,
      bio: barber.bio,
      licenseNumber: barber.licenseNumber,
      isVerified: barber.isVerified,
      verificationStatus: barber.verificationStatus,
      baseAddress: barber.baseAddress,
      latitude: barber.latitude,
      longitude: barber.longitude,
      maxTravelRadiusMiles: barber.maxTravelRadiusMiles,
      autoConfirmBookings: barber.autoConfirmBookings,
      rating: barber.rating,
      reviewCount: barber.reviewCount,
      services: barber.services,
      portfolio: barber.portfolioImages,
      availabilities: barber.availabilities,
      reviews: barber.user.receivedReviews,
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('API Error GET /api/barbers/[slug]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch barber profile' },
      { status: 500 }
    );
  }
}
