import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { VerificationStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);
    // Optional role check - admin or session verification
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const pendingBarbers = await prisma.barberProfile.findMany({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        services: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = pendingBarbers.map((b) => ({
      id: b.id,
      userId: b.userId,
      slug: b.slug,
      name: `${b.user.firstName} ${b.user.lastName}`,
      email: b.user.email,
      phone: b.user.phone,
      avatarUrl: b.user.avatarUrl,
      licenseNumber: b.licenseNumber,
      bio: b.bio,
      baseAddress: b.baseAddress,
      verificationStatus: b.verificationStatus,
      createdAt: b.createdAt,
      services: b.services,
    }));

    return NextResponse.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('API Error GET /api/admin/verifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pending verifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (session && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { barberProfileId, action } = body;

    if (!barberProfileId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters: barberProfileId and valid action (APPROVE/REJECT) required' },
        { status: 400 }
      );
    }

    const isApprove = action === 'APPROVE';
    const updated = await prisma.barberProfile.update({
      where: { id: barberProfileId },
      data: {
        verificationStatus: isApprove ? VerificationStatus.APPROVED : VerificationStatus.REJECTED,
        isVerified: isApprove,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Barber verification ${isApprove ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('API Error POST /api/admin/verifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process verification request' },
      { status: 500 }
    );
  }
}
