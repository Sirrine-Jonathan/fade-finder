import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);

    if (!session) {
      return NextResponse.json(
        { success: false, user: null, error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        barberProfile: {
          include: {
            services: true,
            availabilities: true,
            portfolioImages: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, user: null, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        barberProfile: user.barberProfile || null,
      },
    });
  } catch (error) {
    console.error('API Error GET /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { barberProfile: true },
    });

    if (user?.barberProfile) {
      await prisma.review.deleteMany({
        where: { OR: [{ reviewerId: session.userId }, { revieweeId: session.userId }] },
      });
      await prisma.appointment.deleteMany({
        where: { OR: [{ clientId: session.userId }, { barberId: user.barberProfile.id }] },
      });
      await prisma.availability.deleteMany({ where: { barberId: user.barberProfile.id } });
      await prisma.portfolioImage.deleteMany({ where: { barberId: user.barberProfile.id } });
      await prisma.service.deleteMany({ where: { barberId: user.barberProfile.id } });
      await prisma.barberProfile.delete({ where: { id: user.barberProfile.id } });
    } else {
      await prisma.review.deleteMany({
        where: { OR: [{ reviewerId: session.userId }, { revieweeId: session.userId }] },
      });
      await prisma.appointment.deleteMany({ where: { clientId: session.userId } });
    }

    await prisma.user.delete({ where: { id: session.userId } });

    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
    const { clearSessionCookie } = await import('@/lib/auth');
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('API Error DELETE /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
