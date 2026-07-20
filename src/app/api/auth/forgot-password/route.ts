import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword, mfaRecoveryKey } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Security best practice: don't reveal user existence
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, reset instructions have been sent.',
      });
    }

    // Direct password reset if newPassword and optional mfaRecoveryKey are provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long' },
          { status: 400 }
        );
      }

      if (user.mfaRecoveryKey) {
        if (!mfaRecoveryKey || user.mfaRecoveryKey !== mfaRecoveryKey.trim()) {
          return NextResponse.json(
            { success: false, error: 'Invalid or missing MFA recovery key' },
            { status: 400 }
          );
        }
      }

      const hashedPassword = await hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'Password successfully reset. You can now log in with your new password.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, reset instructions have been sent.',
    });
  } catch (error) {
    console.error('API Error POST /api/auth/forgot-password:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password recovery' },
      { status: 500 }
    );
  }
}
