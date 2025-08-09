// Simple test script to verify LocationModule endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testLocationEndpoints() {
  console.log('🧪 Testing Location Module Endpoints...\n');

  try {
    // Test 1: Get statistics
    console.log('1. Testing GET /locations/statistics');
    const statsResponse = await axios.get(`${BASE_URL}/locations/statistics`);
    console.log('✅ Statistics:', statsResponse.data);

    // Test 2: Get all countries
    console.log('\n2. Testing GET /locations/countries');
    const countriesResponse = await axios.get(`${BASE_URL}/locations/countries`);
    console.log('✅ Countries:', countriesResponse.data.length, 'found');

    // Test 3: Get all states
    console.log('\n3. Testing GET /locations/states');
    const statesResponse = await axios.get(`${BASE_URL}/locations/states?includeCountry=true`);
    console.log('✅ States:', statesResponse.data.length, 'found');

    // Test 4: Get all cities
    console.log('\n4. Testing GET /locations/cities');
    const citiesResponse = await axios.get(`${BASE_URL}/locations/cities?includeRelations=true`);
    console.log('✅ Cities:', citiesResponse.data.length, 'found');

    // Test 5: Get all locations
    console.log('\n5. Testing GET /locations');
    const locationsResponse = await axios.get(`${BASE_URL}/locations?includeRelations=true`);
    console.log('✅ Locations:', locationsResponse.data.length, 'found');

    // Test 6: Search locations
    console.log('\n6. Testing GET /locations/search?q=Mumbai');
    const searchResponse = await axios.get(`${BASE_URL}/locations/search?q=Mumbai`);
    console.log('✅ Search results:', searchResponse.data.length, 'found');

    console.log('\n🎉 All Location Module endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.response?.data || error.message);
  }
}

// Run the test
testLocationEndpoints();