import dotenv from 'dotenv';
import { ScrapeDoService } from './dist/services/scrapedo.js';
import * as cheerio from 'cheerio';
import fs from 'fs';

dotenv.config();

async function debugMercadoLibreHTML() {
  const token = process.env.SCRAPEDO_TOKEN;
  const scrapeDoService = new ScrapeDoService(token);
  
  const url = 'https://inmuebles.mercadolibre.com.mx/venta/distrito-federal/';
  
  console.log('Fetching:', url);
  
  try {
    const html = await scrapeDoService.scrape({
      url,
      render: false,
      geoCode: 'mx'
    });
    
    // Save HTML for inspection
    fs.writeFileSync('mercadolibre-debug.html', html);
    console.log('HTML saved to mercadolibre-debug.html');
    
    const $ = cheerio.load(html);
    
    // Check different possible selectors
    console.log('\nChecking selectors:');
    console.log('- .ui-search-result__wrapper:', $('.ui-search-result__wrapper').length);
    console.log('- .ui-search-result__content:', $('.ui-search-result__content').length);
    console.log('- .ui-search-results:', $('.ui-search-results').length);
    console.log('- .ui-search-layout:', $('.ui-search-layout').length);
    console.log('- article:', $('article').length);
    console.log('- [class*="search-result"]:', $('[class*="search-result"]').length);
    console.log('- li.ui-search-layout__item:', $('li.ui-search-layout__item').length);
    
    // Try to find any property-like elements
    console.log('\nLooking for property elements:');
    
    // Check for list items that might contain properties
    const listItems = $('li.ui-search-layout__item');
    console.log('Found', listItems.length, 'list items');
    
    if (listItems.length > 0) {
      console.log('\nFirst list item classes:', listItems.first().attr('class'));
      console.log('First list item HTML snippet:');
      console.log(listItems.first().html()?.substring(0, 500));
    }
    
    // Look for links to properties
    const propertyLinks = $('a[href*="/MLM-"]');
    console.log('\nProperty links found:', propertyLinks.length);
    if (propertyLinks.length > 0) {
      console.log('First property link:', propertyLinks.first().attr('href'));
    }
    
    // Check for price elements
    const priceElements = $('[class*="price"]');
    console.log('\nPrice elements found:', priceElements.length);
    
    // Look for h2 titles
    const titles = $('h2');
    console.log('\nH2 titles found:', titles.length);
    if (titles.length > 0) {
      console.log('First few titles:');
      titles.slice(0, 3).each((i, el) => {
        console.log(`  ${i + 1}. ${$(el).text().trim()}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugMercadoLibreHTML();