import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = `http://localhost:${process.env.REST_API_PORT || 3000}`;

async function testRestAPI() {
  console.log('Testing REST API endpoints...\n');

  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);
    console.log('---\n');

    console.log('2. Testing property search with filters...');
    const searchResponse = await axios.get(`${API_BASE_URL}/properties`, {
      params: {
        city: 'MexicoCity',
        priceMin: 200000,
        priceMax: 500000,
        bedrooms: 3,
        features: 'pool,garage'
      }
    });
    console.log('Search results:', JSON.stringify(searchResponse.data, null, 2));
    console.log('---\n');

    console.log('3. Testing property search without filters...');
    const allPropertiesResponse = await axios.get(`${API_BASE_URL}/properties`);
    console.log('All properties:', JSON.stringify(allPropertiesResponse.data, null, 2));
    console.log('---\n');

    console.log('4. Testing user preferences endpoint...');
    const preferencesResponse = await axios.post(`${API_BASE_URL}/user/preferences`, {
      preferences: {
        cities: ['MexicoCity', 'Guadalajara'],
        priceRange: {
          min: 150000,
          max: 400000
        },
        propertyTypes: ['apartment', 'condo'],
        minBedrooms: 2,
        features: ['pool', 'gym', 'security']
      }
    });
    console.log('Preferences saved:', preferencesResponse.data);
    console.log('---\n');

    console.log('5. Testing error handling with invalid parameters...');
    try {
      await axios.get(`${API_BASE_URL}/properties`, {
        params: {
          priceMin: 'invalid',
          bedrooms: 'abc'
        }
      });
    } catch (error: any) {
      console.log('Expected error:', error.response.data);
    }
    console.log('---\n');

    console.log('6. Testing 404 endpoint...');
    try {
      await axios.get(`${API_BASE_URL}/invalid-endpoint`);
    } catch (error: any) {
      console.log('Expected 404:', error.response.data);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('Make sure the REST API server is running with: npm run rest-api');
console.log('Also ensure the mock API is running with: npm run mock-api\n');

setTimeout(() => {
  testRestAPI();
}, 2000);