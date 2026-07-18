import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LocationType, AppointmentStatus } from '@prisma/client';

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: {
          select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
        barber: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true, avatarUrl: true },
            },
          },
        },
        service: true,
        review: true,
      },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error('API Error GET /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      barberId,
      serviceId,
      locationType, // 'STUDIO' or 'HOUSE_CALL'
      clientAddress,
      clientLatitude,
      clientLongitude,
      startTimeStr,
      notes,
    } = body;

    if (!barberId || !serviceId || !locationType || !startTimeStr) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // Default to first client if none specified for demo
    let clientToUseId = clientId;
    if (!clientToUseId) {
      const firstClient = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
      if (firstClient) clientToUseId = firstClient.id;
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    }

    const barber = await prisma.barberProfile.findUnique({ where: { id: barberId } });
    if (!barber) {
      return NextResponse.json({ success: false, error: 'Barber not found' }, { status: 404 });
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);
    const totalPrice =
      locationType === 'HOUSE_CALL' ? service.houseCallPrice : service.studioPrice;
    const initialStatus = barber.autoConfirmBookings
      ? AppointmentStatus.CONFIRMED
      : AppointmentStatus.PENDING;

    const newAppointment = await prisma.appointment.create({
      data: {
        clientId: clientToUseId,
        barberId,
        serviceId,
        locationType: locationType === 'HOUSE_CALL' ? LocationType.HOUSE_CALL : LocationType.STUDIO,
        clientAddress: clientAddress || null,
        clientLatitude: clientLatitude ? parseFloat(clientLatitude) : null,
        clientLongitude: clientLongitude ? parseFloat(clientLongitude) : null,
        startTime,
        endTime,
        status: initialStatus,
        totalPrice,
        notes: notes || null,
      },
      include: {
        service: true,
        barber: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newAppointment });
  } catch (error) {
    console.error('API Error POST /api/appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
