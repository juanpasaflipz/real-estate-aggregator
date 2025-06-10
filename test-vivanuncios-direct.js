import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRAPEDO_TOKEN = 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testVivanunciosWithoutRender() {
  console.log('Testing Vivanuncios scraping WITHOUT JavaScript rendering...\n');

  const vivanunciosUrl = 'https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l11518p1';
  
  try {
    console.log('1. Fetching Vivanuncios page...');
    console.log('URL:', vivanunciosUrl);
    
    const response = await axios.get('https://api.scrape.do', {
      params: {
        token: SCRAPEDO_TOKEN,
        url: vivanunciosUrl,
        render: false  // No JS rendering, no geo-targeting
      },
      timeout: 60000
    });

    console.log('✅ Request successful!');
    console.log('Response size:', response.data.length, 'bytes');
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    
    // Check for different possible selectors
    console.log('\n2. Checking for property listings...');
    
    // Try multiple selectors that Vivanuncios might use
    const selectors = [
      '.tileRedesign',
      '.tile',
      '.listing-card',
      '[data-qa="listing-item"]',
      '.classified-card',
      '.item',
      'article',
      '[itemtype="http://schema.org/Product"]'
    ];
    
    let foundListings = false;
    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`✅ Found ${count} elements with selector: ${selector}`);
        foundListings = true;
        
        // Try to extract some data from the first listing
        const firstListing = $(selector).first();
        console.log('\nFirst listing HTML preview:');
        console.log(firstListing.html()?.substring(0, 500) + '...');
        break;
      }
    }
    
    if (!foundListings) {
      console.log('❌ No property listings found with common selectors');
      
      // Check if we got a different page (error, captcha, etc.)
      console.log('\n3. Page analysis:');
      console.log('Title:', $('title').text());
      console.log('Meta description:', $('meta[name="description"]').attr('content'));
      
      // Check for error messages or captcha
      if (response.data.includes('captcha') || response.data.includes('challenge')) {
        console.log('⚠️  Page might contain a CAPTCHA challenge');
      }
      
      if (response.data.includes('error') || response.data.includes('Error')) {
        console.log('⚠️  Page might contain an error message');
      }
      
      // Save HTML for inspection
      console.log('\n4. Saving HTML for inspection...');
      const fs = await import('fs');
      fs.writeFileSync('vivanuncios-test-output.html', response.data);
      console.log('HTML saved to: vivanuncios-test-output.html');
      console.log('You can open this file in a browser to see what was returned.');
    }
    
    // Try the specific selectors from your vivanuncios-v2.ts file
    console.log('\n5. Testing your specific selectors...');
    const tileRedesign = $('.tileRedesign__content').length;
    console.log('Elements with .tileRedesign__content:', tileRedesign);
    
    // Check if the page requires JavaScript
    const scripts = $('script').length;
    const reactRoot = $('#root').length || $('[id*="react"]').length;
    console.log('\nPage characteristics:');
    console.log('Number of <script> tags:', scripts);
    console.log('React root elements:', reactRoot);
    
    if (reactRoot > 0 && tileRedesign === 0) {
      console.log('\n⚠️  This page appears to be a React SPA that requires JavaScript rendering!');
      console.log('The content is likely loaded dynamically after the initial HTML load.');
    }
    
  } catch (error) {
    console.error('❌ Scraping failed!');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', error.response.data);
    }
  }
}

testVivanunciosWithoutRender();