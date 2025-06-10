import axios from 'axios';
import * as cheerio from 'cheerio';

const SCRAPEDO_TOKEN = 'e5b3e00fceaa4a2d9be6926593a934f5b1797c42d0c';

async function testCorrectURL() {
  const urls = [
    'https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l1p1',
    'https://www.vivanuncios.com.mx/s-venta-inmuebles/v1c1097p1'
  ];

  for (const url of urls) {
    console.log(`\nTesting URL: ${url}`);
    
    try {
      const response = await axios.get('https://api.scrape.do', {
        params: {
          token: SCRAPEDO_TOKEN,
          url: url,
          render: true,
          geoCode: 'mx'
        },
        timeout: 60000
      });

      const $ = cheerio.load(response.data);
      
      // Check page title and listings
      const title = $('title').text();
      const h1 = $('h1').text();
      const tileRedesign = $('.tileRedesign').length;
      const listings = $('[class*="tile"]').length;
      const noResults = response.data.includes('no hay inmuebles');
      
      console.log('✅ Request successful');
      console.log(`Title: ${title}`);
      console.log(`H1: ${h1}`);
      console.log(`Found .tileRedesign: ${tileRedesign}`);
      console.log(`Found elements with "tile" in class: ${listings}`);
      console.log(`Has "no results" message: ${noResults}`);
      
      if (response.data.includes('challenge-platform')) {
        console.log('⚠️  Cloudflare challenge detected');
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
}

testCorrectURL();