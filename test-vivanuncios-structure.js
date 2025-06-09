import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

async function testVivanunciosStructure() {
  const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN;
  
  if (!SCRAPEDO_TOKEN || SCRAPEDO_TOKEN === 'your_scrapedo_token_here') {
    console.log('❌ No valid SCRAPEDO_TOKEN found in environment');
    return;
  }

  const url = 'https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l11518p1';
  
  console.log('🔍 Testing Vivanuncios page structure...');
  console.log(`URL: ${url}\n`);

  try {
    // Fetch via Scrape.do
    const params = new URLSearchParams({
      token: SCRAPEDO_TOKEN,
      url: url,
      render: 'true',  // Enable JavaScript rendering
      super: 'true',   // Use residential proxies
      geoCode: 'mx'
    });

    const response = await axios.get(`https://api.scrape.do?${params.toString()}`);
    const html = response.data;
    
    console.log(`✅ Fetched HTML (${html.length} bytes)\n`);

    const $ = cheerio.load(html);
    
    // Test various possible selectors
    const selectors = [
      '.tileV2',
      '.ad-tile',
      '.ad-card-wide', 
      'div[data-qa="ad-card"]',
      '.tile-wrap',
      '.ad-list-card',
      '.listing-card',
      'article.listing',
      '.search-item',
      '.property-card',
      '[class*="tile"]',
      '[class*="card"]',
      '[class*="listing"]'
    ];

    console.log('📋 Testing selectors:\n');
    
    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`✅ ${selector}: Found ${count} elements`);
        
        // Show first element's structure
        const $first = $(selector).first();
        console.log('   Sample HTML structure:');
        console.log('   ' + $first.html()?.substring(0, 200)?.replace(/\n/g, ' ') + '...\n');
      } else {
        console.log(`❌ ${selector}: No elements found`);
      }
    }

    // Look for common property data patterns
    console.log('\n🔍 Looking for property data patterns:\n');
    
    const dataPatterns = [
      { name: 'Prices', selector: '[class*="price"]' },
      { name: 'Titles', selector: '[class*="title"]' },
      { name: 'Locations', selector: '[class*="location"]' },
      { name: 'Links', selector: 'a[href*="/ad/"]' },
      { name: 'Images', selector: 'img[src*="img"], img[data-src]' }
    ];

    for (const pattern of dataPatterns) {
      const elements = $(pattern.selector);
      if (elements.length > 0) {
        console.log(`📌 ${pattern.name}: Found ${elements.length} elements`);
        console.log(`   First 3 samples:`);
        elements.slice(0, 3).each((i, el) => {
          const $el = $(el);
          if (pattern.name === 'Links') {
            console.log(`   ${i + 1}. ${$el.attr('href')}`);
          } else if (pattern.name === 'Images') {
            console.log(`   ${i + 1}. ${$el.attr('src') || $el.attr('data-src')}`);
          } else {
            console.log(`   ${i + 1}. ${$el.text().trim().substring(0, 50)}...`);
          }
        });
        console.log('');
      }
    }

    // Save a sample of the HTML for inspection
    const sampleHtml = html.substring(0, 5000);
    console.log('\n📄 HTML Sample (first 5000 chars saved to vivanuncios-sample.html)');
    
    await import('fs').then(fs => {
      fs.promises.writeFile('vivanuncios-sample.html', html);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testVivanunciosStructure();