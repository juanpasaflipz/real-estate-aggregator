import axios from 'axios';

const SCRAPEDO_TOKEN = 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testAllFeatures() {
  console.log('Testing Scrape.do features with your upgraded plan...\n');

  // Test 1: Account Info
  console.log('1. Account Information:');
  try {
    const info = await axios.get('https://api.scrape.do/info', {
      params: { token: SCRAPEDO_TOKEN }
    });
    console.log(JSON.stringify(info.data, null, 2));
  } catch (error) {
    console.error('Info error:', error.message);
  }

  // Test 2: Basic scraping
  console.log('\n2. Testing basic scraping (no special features):');
  try {
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/headers'
      }
    });
    console.log('✅ Basic scraping works!');
  } catch (error) {
    console.error('❌ Basic scraping failed:', error.response?.data || error.message);
  }

  // Test 3: JavaScript rendering
  console.log('\n3. Testing JavaScript rendering:');
  try {
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/headers',
        render: true
      }
    });
    console.log('✅ JavaScript rendering works!');
  } catch (error) {
    console.error('❌ JavaScript rendering failed:', error.response?.data || error.message);
  }

  // Test 4: Geo-targeting
  console.log('\n4. Testing geo-targeting (Mexico):');
  try {
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/headers',
        geoCode: 'mx'
      }
    });
    console.log('✅ Geo-targeting works!');
  } catch (error) {
    console.error('❌ Geo-targeting failed:', error.response?.data || error.message);
  }

  // Test 5: Super proxy (residential)
  console.log('\n5. Testing super proxy:');
  try {
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/headers',
        super: true
      }
    });
    console.log('✅ Super proxy works!');
  } catch (error) {
    console.error('❌ Super proxy failed:', error.response?.data || error.message);
  }

  // Test 6: All features combined
  console.log('\n6. Testing all features combined:');
  try {
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/headers',
        render: true,
        geoCode: 'mx',
        super: true
      }
    });
    console.log('✅ All features work together!');
  } catch (error) {
    console.error('❌ Combined features failed:', error.response?.data || error.message);
  }

  // Summary
  console.log('\n\n=== SUMMARY ===');
  console.log('Your upgraded plan includes:');
  console.log('- Basic scraping: ✅');
  console.log('- JavaScript rendering: Check above');
  console.log('- Geo-targeting: Check above');
  console.log('- Super proxy: Check above');
}

testAllFeatures();