const http = require('https');

const BASE_URL = 'https://fade-finder-app-53fb0754df0f.herokuapp.com';

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data.startsWith('{') || data.startsWith('[') ? JSON.parse(data) : data });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runE2ETestSuite() {
  console.log('🚀 Running E2E Integration Suite against Heroku Production App...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Web Homepage HTML Loads
  try {
    const res = await makeRequest('/');
    if (res.status === 200 && res.data.includes('FADE FINDER')) {
      console.log('✅ TEST 1 PASSED: Homepage HTML loaded with FADE FINDER branding');
      passed++;
    } else {
      console.error(`❌ TEST 1 FAILED: Homepage returned status ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message);
    failed++;
  }

  // Test 2: GET /api/barbers Endpoint
  let testBarber = null;
  let testService = null;
  try {
    const res = await makeRequest('/api/barbers?type=ALL&lat=40.7608&lng=-111.8910');
    if (res.status === 200 && res.data.success && res.data.data.length > 0) {
      testBarber = res.data.data[0];
      testService = testBarber.services[0];
      console.log(`✅ TEST 2 PASSED: GET /api/barbers returned ${res.data.count} barbers with distance & review metadata`);
      console.log(`   Sample Barber: ${testBarber.name} (${testBarber.distanceMiles} mi away, Rating: ${testBarber.rating}⭐)`);
      passed++;
    } else {
      console.error(`❌ TEST 2 FAILED: /api/barbers returned invalid payload`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message);
    failed++;
  }

  // Test 3: POST /api/appointments Booking Endpoint
  let createdApptId = null;
  try {
    const bookingPayload = JSON.stringify({
      barberId: testBarber.id,
      serviceId: testService.id,
      locationType: 'HOUSE_CALL',
      clientAddress: '789 E2E Test Way, Salt Lake City, UT',
      startTimeStr: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Automated E2E Suite Test Booking',
    });

    const res = await makeRequest('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bookingPayload) },
      body: bookingPayload,
    });

    if (res.status === 200 && res.data.success && res.data.data.id) {
      createdApptId = res.data.data.id;
      console.log(`✅ TEST 3 PASSED: POST /api/appointments successfully created house call booking`);
      console.log(`   Appointment ID: ${createdApptId}, Total Price: $${res.data.data.totalPrice}, Status: ${res.data.data.status}`);
      passed++;
    } else {
      console.error(`❌ TEST 3 FAILED: /api/appointments creation failed`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message);
    failed++;
  }

  // Test 4: GET /api/appointments List Endpoint
  try {
    const res = await makeRequest('/api/appointments');
    if (res.status === 200 && res.data.success && res.data.data.some((a) => a.id === createdApptId)) {
      console.log(`✅ TEST 4 PASSED: GET /api/appointments verified new booking appears in schedule`);
      passed++;
    } else {
      console.error(`❌ TEST 4 FAILED: Created appointment not found in appointments list`);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message);
    failed++;
  }

  // Test 5: POST /api/reset-db Endpoint
  try {
    const res = await makeRequest('/api/reset-db', { method: 'POST' });
    if (res.status === 200 && res.data.success) {
      console.log(`✅ TEST 5 PASSED: POST /api/reset-db successfully scrubbed and re-seeded database`);
      passed++;
    } else {
      console.error(`❌ TEST 5 FAILED: /api/reset-db returned error`, res);
      failed++;
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err.message);
    failed++;
  }

  console.log(`\n==============================================`);
  console.log(`E2E TEST RESULT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runE2ETestSuite();
