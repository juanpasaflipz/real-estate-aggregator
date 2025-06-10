import dotenv from 'dotenv';
import { ScrapeDoService } from './dist/services/scrapedo.js';
import { MercadoLibreScraper } from './dist/scrapers/mercadolibre-scraper.js';

dotenv.config();

async function testMercadoLibre() {
  const token = process.env.SCRAPEDO_TOKEN;
  
  if (!token) {
    console.error('SCRAPEDO_TOKEN not found in .env file');
    return;
  }
  
  console.log('Token found:', token.substring(0, 20) + '...');
  
  const scrapeDoService = new ScrapeDoService(token);
  const mercadoLibreScraper = new MercadoLibreScraper();
  
  // Test URL building
  const params = {
    city: 'mexico',
    priceMin: '1000000',
    priceMax: '5000000',
    bedrooms: '2'
  };
  
  const url = mercadoLibreScraper.buildSearchUrl(params);
  console.log('\nGenerated URL:', url);
  
  try {
    // Test scraping
    console.log('\nScraping URL...');
    const html = await scrapeDoService.scrape({
      url,
      render: false,
      geoCode: 'mx'
    });
    
    console.log('HTML received, length:', html.length);
    console.log('HTML contains "ui-search-result":', html.includes('ui-search-result'));
    console.log('HTML contains "MLM-":', html.includes('MLM-'));
    
    // Show a snippet of the HTML
    if (html.includes('ui-search-result')) {
      const firstResult = html.indexOf('ui-search-result');
      console.log('\nFirst search result snippet:');
      console.log(html.substring(firstResult, firstResult + 500));
    } else if (html.includes('<!DOCTYPE')) {
      console.log('\nHTML head snippet:');
      console.log(html.substring(0, 1000));
    }
    
    // Test parsing
    console.log('\nParsing properties...');
    const properties = mercadoLibreScraper.parseHTML(html);
    console.log('Properties found:', properties.length);
    
    if (properties.length > 0) {
      console.log('\nFirst property:');
      console.log(JSON.stringify(properties[0], null, 2));
    }
    
    // Check for common blocking patterns
    if (html.includes('captcha') || html.includes('CAPTCHA')) {
      console.log('\n⚠️  CAPTCHA detected!');
    }
    if (html.includes('Access Denied') || html.includes('403 Forbidden')) {
      console.log('\n⚠️  Access denied!');
    }
    if (html.includes('cloudflare')) {
      console.log('\n⚠️  Cloudflare protection detected!');
    }
    
  } catch (error) {
    console.error('\nError:', error.message);
    console.error('Full error:', error);
  }
}

// Test different URLs
async function testMultipleUrls() {
  const testUrls = [
    'https://inmuebles.mercadolibre.com.mx/venta/distrito-federal/',
    'https://inmuebles.mercadolibre.com.mx/casas/venta/distrito-federal/',
    'https://listado.mercadolibre.com.mx/inmuebles/venta/distrito-federal/'
  ];
  
  const token = process.env.SCRAPEDO_TOKEN;
  const scrapeDoService = new ScrapeDoService(token);
  
  for (const url of testUrls) {
    console.log(`\n\nTesting URL: ${url}`);
    try {
      const html = await scrapeDoService.scrape({
        url,
        render: false,
        geoCode: 'mx'
      });
      
      console.log('Response length:', html.length);
      console.log('Contains results:', html.includes('ui-search-result'));
      console.log('Title tag:', html.match(/<title>(.*?)<\/title>/)?.[1] || 'No title found');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

console.log('Testing MercadoLibre scraping...\n');
testMercadoLibre()
  .then(() => testMultipleUrls())
  .then(() => console.log('\nTest complete!'));