import dotenv from 'dotenv';
import { ScrapeDoService } from './dist/services/scrapedo.js';
import { parseVivanunciosHTML, extractVivanunciosData } from './dist/scrapers/vivanuncios-v2.js';

dotenv.config();

const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN || 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testVivanunciosScraper() {
  console.log('Testing Vivanuncios scraper with current configuration...\n');
  
  const scrapeDoService = new ScrapeDoService(SCRAPEDO_TOKEN);
  const url = 'https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l11518p1';
  
  try {
    console.log('1. Scraping URL:', url);
    console.log('   Using: render=true, geoCode=mx, super=false');
    
    const html = await scrapeDoService.scrape({
      url,
      render: true,
      super: false,
      geoCode: 'mx'
    });
    
    console.log('\n2. Response received:');
    console.log('   Size:', html.length, 'bytes');
    
    // Check for common issues
    if (html.includes('challenge-platform')) {
      console.log('   ⚠️  Cloudflare challenge detected!');
    }
    if (html.includes('Access Denied')) {
      console.log('   ⚠️  Access denied message found!');
    }
    
    console.log('\n3. Parsing HTML with vivanuncios-v2 parser...');
    const listings = parseVivanunciosHTML(html);
    console.log('   Found listings:', listings.length);
    
    if (listings.length > 0) {
      console.log('\n4. Sample listings:');
      listings.slice(0, 3).forEach((listing, index) => {
        const data = extractVivanunciosData(listing);
        console.log(`\n   ${index + 1}. ${listing.title}`);
        console.log(`      Price: ${data.priceText}`);
        console.log(`      Location: ${listing.location}`);
        console.log(`      Type: ${listing.type}`);
        console.log(`      Features: ${listing.features.join(', ')}`);
        console.log(`      Link: ${listing.link}`);
      });
    } else {
      console.log('\n4. No listings found. Checking HTML structure...');
      
      // Save HTML for inspection
      const fs = await import('fs');
      const filename = 'vivanuncios-debug-output.html';
      fs.writeFileSync(filename, html);
      console.log(`   HTML saved to: ${filename}`);
      
      // Check if it's a React app waiting for JS
      if (html.includes('id="root"') && !html.includes('tileRedesign')) {
        console.log('   ℹ️  Page has React root but no content - might need more wait time');
      }
      
      // Extract page title for debugging
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      if (titleMatch) {
        console.log('   Page title:', titleMatch[1]);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// First build the TypeScript files
console.log('Building TypeScript files...');
import { execSync } from 'child_process';
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\nBuild complete. Running test...\n');
  testVivanunciosScraper();
} catch (error) {
  console.error('Build failed:', error.message);
}