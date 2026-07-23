import { describe, it, expect } from 'vitest';
import { geocodeAddress } from '../geocoding';

describe('Geocoding Utility', () => {
  it('should successfully geocode known mock locations', async () => {
    const slcResult = await geocodeAddress('Salt Lake City, UT');
    expect(slcResult.success).toBe(true);
    expect(slcResult.latitude).toBe(40.7608);
    expect(slcResult.longitude).toBe(-111.8910);
    expect(slcResult.formattedAddress).toBe('Salt Lake City, UT');

    const sugarHouseResult = await geocodeAddress('Sugar House, Salt Lake City, UT');
    expect(sugarHouseResult.success).toBe(true);
    expect(sugarHouseResult.latitude).toBe(40.7260);
    expect(sugarHouseResult.longitude).toBe(-111.8540);
  });

  it('should return success = false for empty address query', async () => {
    const result = await geocodeAddress('');
    expect(result.success).toBe(false);
  });

  it('should fallback to default SLC coordinates for unknown queries when APIs are not configured', async () => {
    const result = await geocodeAddress('Some unknown address that is not mocked');
    expect(result.success).toBe(true);
    expect(result.latitude).toBe(40.7608);
    expect(result.longitude).toBe(-111.8910);
    expect(result.formattedAddress).toContain('Some unknown address that is not mocked');
  });
});
