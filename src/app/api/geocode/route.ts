import { NextResponse } from 'next/server';
import { geocodeAddress } from '@/lib/geocoding';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address query parameter is required' },
        { status: 400 }
      );
    }

    const result = await geocodeAddress(address);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to geocode address' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      latitude: result.latitude,
      longitude: result.longitude,
      formattedAddress: result.formattedAddress,
    });
  } catch (error) {
    console.error('API Error GET /api/geocode:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during geocoding' },
      { status: 500 }
    );
  }
}
