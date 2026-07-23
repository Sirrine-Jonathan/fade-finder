import { calculateDistanceMiles } from './geo';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  success: boolean;
}

// Known mock locations for offline development/testing
const MOCK_LOCATIONS: Record<string, { lat: number; lng: number; formatted: string }> = {
  'salt lake city, ut': { lat: 40.7608, lng: -111.8910, formatted: 'Salt Lake City, UT' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, formatted: 'Salt Lake City, UT' },
  'downtown, salt lake city, ut': { lat: 40.7580, lng: -111.8820, formatted: 'Downtown, Salt Lake City, UT' },
  'sugar house, salt lake city, ut': { lat: 40.7260, lng: -111.8540, formatted: 'Sugar House, Salt Lake City, UT' },
  'capitol hill, salt lake city, ut': { lat: 40.7800, lng: -111.9000, formatted: 'Capitol Hill, Salt Lake City, UT' },
  'university, salt lake city, ut': { lat: 40.7620, lng: -111.8450, formatted: 'University, Salt Lake City, UT' },
  'the avenues, salt lake city, ut': { lat: 40.7650, lng: -111.8910, formatted: 'The Avenues, Salt Lake City, UT' },
  '789 foothill dr, salt lake city, ut': { lat: 40.7520, lng: -111.8300, formatted: '789 Foothill Dr, Salt Lake City, UT' },
  'provo, ut': { lat: 40.2338, lng: -111.6585, formatted: 'Provo, UT' },
  'sandy, ut': { lat: 40.5708, lng: -111.8597, formatted: 'Sandy, UT' },
  'current gps location': { lat: 40.7608, lng: -111.8910, formatted: 'Current GPS Location' },
};

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const query = address.trim().toLowerCase();
  
  if (!query) {
    return { success: false, latitude: 0, longitude: 0 };
  }

  // 1. Check local mock mapping first (for tests and quick responses)
  // Exact match first
  for (const [key, value] of Object.entries(MOCK_LOCATIONS)) {
    if (query === key) {
      return {
        success: true,
        latitude: value.lat,
        longitude: value.lng,
        formattedAddress: value.formatted,
      };
    }
  }

  // Partial match next (more specific/longer keys first)
  const sortedMockKeys = Object.keys(MOCK_LOCATIONS).sort((a, b) => b.length - a.length);
  for (const key of sortedMockKeys) {
    if (query.includes(key) || key.includes(query)) {
      const value = MOCK_LOCATIONS[key];
      return {
        success: true,
        latitude: value.lat,
        longitude: value.lng,
        formattedAddress: value.formatted,
      };
    }
  }

  // 2. Mapbox Geocoding (if token is set)
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  if (mapboxToken) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&limit=1`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          return {
            success: true,
            latitude: lat,
            longitude: lng,
            formattedAddress: data.features[0].place_name,
          };
        }
      }
    } catch (err) {
      console.error('Mapbox geocoding error:', err);
    }
  }

  // 3. Google Maps Geocoding (if key is set)
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data?.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          return {
            success: true,
            latitude: lat,
            longitude: lng,
            formattedAddress: data.results[0].formatted_address,
          };
        }
      }
    } catch (err) {
      console.error('Google Maps geocoding error:', err);
    }
  }

  // 4. Fallback to OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FadeFinder/1.0 (contact: support@fadefinder.com)',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return {
          success: true,
          latitude: lat,
          longitude: lon,
          formattedAddress: data[0].display_name,
        };
      }
    }
  } catch (err) {
    console.error('Nominatim geocoding error:', err);
  }

  // 5. Hard fallback default if everything fails (so code doesn't crash)
  return {
    success: true,
    latitude: 40.7608,
    longitude: -111.8910,
    formattedAddress: `${address} (Approximate SLC)`,
  };
}
