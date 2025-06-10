import axios from 'axios';
import { PropertyScraper } from './src/services/property-scraper.js';
import { ScrapeDoService } from './src/services/scrapedo.js';

const SCRAPEDO_TOKEN = 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testUpgradedPlan() {
  console.log('Testing upgraded Scrape.do plan with PropertyScraper...\n');

  // First, check what features are available
  console.log('1. Checking Scrape.do account info...');
  try {
    const infoResponse = await axios.get('https://api.scrape.do/info', {
      params: { token: SCRAPEDO_TOKEN }
    });
    console.log('Account info:', JSON.stringify(infoResponse.data, null, 2));
  } catch (error) {
    console.error('Failed to get account info:', error.message);
  }

  // Test with PropertyScraper
  console.log('\n2. Testing PropertyScraper with Mexico City...');
  const scraper = new PropertyScraper(SCRAPEDO_TOKEN);
  
  try {
    const properties = await scraper.scrapeVivanuncios({
      city: 'mexico city',
      priceMin: '1000000',
      priceMax: '5000000'
    });
    
    console.log(`\n✅ Found ${properties.length} properties!`);
    
    if (properties.length > 0) {
      console.log('\nFirst 3 properties:');
      properties.slice(0, 3).forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.title}`);
        console.log(`   Price: $${prop.price.toLocaleString()} ${prop.currency}`);
        console.log(`   Location: ${prop.location}`);
        console.log(`   Bedrooms: ${prop.bedrooms || 'N/A'}`);
        console.log(`   Link: ${prop.link}`);
      });
    }
  } catch (error) {
    console.error('❌ PropertyScraper failed:', error.message);
    
    // Try direct scraping to debug
    console.log('\n3. Trying direct scraping to debug...');
    const scrapeDoService = new ScrapeDoService(SCRAPEDO_TOKEN);
    
    try {
      const testUrl = 'https://www.vivanuncios.com.mx/s-venta-inmuebles/v1c1097p1';
      console.log('Testing with simpler URL:', testUrl);
      
      const html = await scrapeDoService.scrape({
        url: testUrl,
        render: true,
        geoCode: 'mx',
        customHeaders: true,
        blockResources: false
      });
      
      console.log('Response size:', html.length);
      
      // Check for common indicators
      const hasListings = html.includes('tileRedesign') || html.includes('listing-card');
      const hasCloudflare = html.includes('challenge-platform');
      const hasReactApp = html.includes('id="root"') || html.includes('__INITIAL_STATE__');
      
      console.log('\nPage analysis:');
      console.log('Has listings:', hasListings);
      console.log('Has Cloudflare challenge:', hasCloudflare);
      console.log('Is React app:', hasReactApp);
      
      if (hasCloudflare) {
        console.log('\n⚠️  Cloudflare is blocking the request. This is common for Vivanuncios.');
        console.log('Even with JS rendering, Cloudflare might detect automated requests.');
      }
      
    } catch (error) {
      console.error('Direct scraping also failed:', error.message);
    }
  }
}

testUpgradedPlan();