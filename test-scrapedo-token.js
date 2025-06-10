import axios from 'axios';

const SCRAPEDO_TOKEN = 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testScrapedoToken() {
  console.log('Testing Scrape.do token...\n');

  try {
    // Test 1: Check credits
    console.log('1. Checking API credits...');
    const creditsResponse = await axios.get('https://api.scrape.do/info', {
      params: {
        token: SCRAPEDO_TOKEN
      }
    });
    
    console.log('✅ Token is valid!');
    console.log('API Response:', JSON.stringify(creditsResponse.data, null, 2));
    console.log('\n');

    // Test 2: Try a simple scrape
    console.log('2. Testing scraping capability...');
    const scrapeResponse = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: 'https://httpbin.org/ip',
        render: false
      }
    });

    console.log('✅ Scraping works!');
    const responseText = typeof scrapeResponse.data === 'string' ? scrapeResponse.data : JSON.stringify(scrapeResponse.data);
    console.log('Response type:', typeof scrapeResponse.data);
    console.log('Response preview:', responseText.substring(0, 100) + '...');
    console.log('\n');

    // Test 3: Test with Vivanuncios (with render)
    console.log('3. Testing Vivanuncios scraping...');
    const vivanunciosUrl = 'https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l11518p1';
    
    try {
      const vivanunciosResponse = await axios.get('https://api.scrape.do', {
        params: {
          token: SCRAPEDO_TOKEN,
          url: vivanunciosUrl,
          render: true,
          geoCode: 'mx'
        },
        timeout: 30000
      });

      console.log('✅ Vivanuncios scraping works!');
      console.log('Response size:', vivanunciosResponse.data.length, 'bytes');
      
      // Check if we got property listings
      const hasListings = vivanunciosResponse.data.includes('tileRedesign');
      console.log('Contains property listings:', hasListings ? 'Yes' : 'No');
    } catch (error) {
      console.log('❌ Vivanuncios scraping failed:', error.message);
      if (error.response) {
        console.log('Error details:', error.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Token validation failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', error.response.data);
    }
  }
}

testScrapedoToken();