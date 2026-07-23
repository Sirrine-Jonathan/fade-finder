import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { AppointmentStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.role !== 'CLIENT') {
      return NextResponse.json(
        { success: false, error: 'Only clients can submit reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, rating, comment } = body;

    if (!appointmentId || rating === undefined || comment === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: appointmentId, rating, comment' },
        { status: 400 }
      );
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        barber: true,
        review: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.clientId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to review this appointment' },
        { status: 403 }
      );
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      return NextResponse.json(
        { success: false, error: 'You can only review completed appointments' },
        { status: 400 }
      );
    }

    if (appointment.review) {
      return NextResponse.json(
        { success: false, error: 'This appointment has already been reviewed' },
        { status: 400 }
      );
    }

    // Create the review
    const newReview = await prisma.review.create({
      data: {
        appointmentId,
        reviewerId: session.userId,
        revieweeId: appointment.barber.userId,
        rating: ratingVal,
        comment: comment.toString().trim(),
      },
    });

    // Calculate new average rating & count for the barber profile
    const reviews = await prisma.review.findMany({
      where: { revieweeId: appointment.barber.userId },
    });

    const reviewCount = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    await prisma.barberProfile.update({
      where: { id: appointment.barberId },
      data: {
        rating: parseFloat(avgRating.toFixed(2)),
        reviewCount,
      },
    });

    return NextResponse.json({ success: true, data: newReview });
  } catch (error) {
    console.error('API Error POST /api/reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
