import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const requestEmail = email.toLowerCase().trim();

    let user = null;

    if (adminEmail && requestEmail === adminEmail) {
      if (!adminPassword || password !== adminPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const adminHash = await hashPassword(adminPassword);
      user = await prisma.user.upsert({
        where: { email: requestEmail },
        update: {
          role: 'ADMIN',
          passwordHash: adminHash,
        },
        create: {
          email: requestEmail,
          passwordHash: adminHash,
          role: 'ADMIN',
          phone: '555-0000',
          firstName: 'Admin',
          lastName: 'User',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        },
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
    } else {
      user = await prisma.user.findUnique({
        where: { email: requestEmail },
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
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
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

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('API Error POST /api/auth/login:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
