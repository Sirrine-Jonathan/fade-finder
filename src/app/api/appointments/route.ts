import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LocationType, AppointmentStatus } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';
import { calculateDistanceMiles } from '@/lib/geo';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    let whereClause = {};
    if (session.role === 'CLIENT') {
      whereClause = { clientId: session.userId };
    } else if (session.role === 'BARBER') {
      const barber = await prisma.barberProfile.findUnique({
        where: { userId: session.userId },
      });
      if (barber) {
        whereClause = { barberId: barber.id };
      }
    } else if (session.role === 'ADMIN') {
      whereClause = {};
    } else {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true },
        },
        barber: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true },
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
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      clientId: bodyClientId,
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

    let clientToUseId = session.userId;
    if (session.role === 'ADMIN' && bodyClientId) {
      clientToUseId = bodyClientId;
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

    let finalClientLat = clientLatitude ? parseFloat(clientLatitude) : null;
    let finalClientLng = clientLongitude ? parseFloat(clientLongitude) : null;

    if (locationType === 'HOUSE_CALL') {
      if (!clientAddress) {
        return NextResponse.json(
          { success: false, error: 'Address is required for house call bookings' },
          { status: 400 }
        );
      }

      if (finalClientLat === null || finalClientLng === null) {
        const geoResult = await geocodeAddress(clientAddress);
        if (!geoResult.success) {
          return NextResponse.json(
            { success: false, error: 'Could not resolve the provided address' },
            { status: 400 }
          );
        }
        finalClientLat = geoResult.latitude;
        finalClientLng = geoResult.longitude;
      }

      const distance = calculateDistanceMiles(
        finalClientLat,
        finalClientLng,
        barber.latitude,
        barber.longitude
      );

      if (distance > barber.maxTravelRadiusMiles) {
        return NextResponse.json(
          {
            success: false,
            error: `Your address is ${distance} miles away, which exceeds the barber's maximum travel radius of ${barber.maxTravelRadiusMiles} miles.`
          },
          { status: 400 }
        );
      }
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        clientId: clientToUseId,
        barberId,
        serviceId,
        locationType: locationType === 'HOUSE_CALL' ? LocationType.HOUSE_CALL : LocationType.STUDIO,
        clientAddress: clientAddress || null,
        clientLatitude: finalClientLat,
        clientLongitude: finalClientLng,
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

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json({ success: false, error: 'Missing appointmentId or status' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    if (session.role === 'CLIENT' && appointment.clientId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if (session.role === 'BARBER') {
      const barber = await prisma.barberProfile.findUnique({ where: { userId: session.userId } });
      if (!barber || appointment.barberId !== barber.id) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: status as AppointmentStatus },
      include: {
        service: true,
        client: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('API Error PATCH /api/appointments:', error);
    return NextResponse.json({ success: false, error: 'Failed to update appointment status' }, { status: 500 });
  }
}
