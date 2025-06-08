import { scrapeResidentialListings } from './residentialScraper.js';

async function test() {
  const apiKey = process.env.SCRAPE_DO_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('⚠️  No SCRAPE_DO_API_KEY found in environment variables');
    console.log('Set it with: export SCRAPE_DO_API_KEY="your_actual_key"');
    return;
  }
  
  const url = 'https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1';
  console.log(`Testing scraper with URL: ${url}\n`);
  
  const results = await scrapeResidentialListings(url, apiKey);
  
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} listings:\n`);
    
    // Show first 3 listings
    results.slice(0, 3).forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.title || 'No title'}`);
      console.log(`   Price: ${listing.price || 'N/A'}`);
      console.log(`   Location: ${listing.location || 'N/A'}`);
      console.log(`   URL: ${listing.url || 'N/A'}\n`);
    });
  } else {
    console.log('❌ No listings found. Check if selectors need updating.');
  }
}

test();