import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing appointment ID or status' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Verify session user has permission (barber or client or admin)
    if (session) {
      if (session.role === 'BARBER') {
        const barber = await prisma.barberProfile.findUnique({ where: { userId: session.userId } });
        if (barber && appointment.barberId !== barber.id) {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
      } else if (session.role === 'CLIENT' && appointment.clientId !== session.userId) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: status as AppointmentStatus },
      include: {
        service: true,
        client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        barber: { select: { id: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API Error PATCH /api/appointments/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}
