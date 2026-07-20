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
