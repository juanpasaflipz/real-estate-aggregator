import * as cheerio from 'cheerio';
import fs from 'fs';

// Read the saved HTML
const html = fs.readFileSync('mercadolibre-debug.html', 'utf8');
const $ = cheerio.load(html);

console.log('Testing MercadoLibre parser...\n');

// First, let's check what we're looking for
console.log('Looking for: li.ui-search-layout__item .ui-search-result__wrapper');
const wrappers = $('li.ui-search-layout__item .ui-search-result__wrapper');
console.log('Found:', wrappers.length, 'wrappers\n');

// If no wrappers found, try alternative selectors
if (wrappers.length === 0) {
  console.log('Alternative selector checks:');
  console.log('- .ui-search-result__wrapper only:', $('.ui-search-result__wrapper').length);
  console.log('- li.ui-search-layout__item only:', $('li.ui-search-layout__item').length);
  
  // Let's check the first list item structure
  const firstItem = $('li.ui-search-layout__item').first();
  console.log('\nFirst list item structure:');
  console.log('Direct children:', firstItem.children().length);
  firstItem.children().each((i, child) => {
    console.log(`  Child ${i}: ${child.name} - classes: ${$(child).attr('class')}`);
  });
  
  // Check for wrapper in first item
  console.log('\nLooking inside first item for wrapper:');
  console.log('Has .ui-search-result__wrapper:', firstItem.find('.ui-search-result__wrapper').length > 0);
  
  // Let's see the actual HTML structure
  console.log('\nFirst item HTML (first 1000 chars):');
  console.log(firstItem.html()?.substring(0, 1000));
}

// Try parsing with the actual selector that works
console.log('\n\nTrying direct selector on .ui-search-result__wrapper:');
$('.ui-search-result__wrapper').slice(0, 3).each((i, element) => {
  const $el = $(element);
  console.log(`\nProperty ${i + 1}:`);
  
  // Title
  const title = $el.find('h2').text().trim();
  console.log('Title:', title || 'NOT FOUND');
  
  // Price
  const priceElement = $el.find('.andes-money-amount__fraction').first();
  const priceText = priceElement.text().trim();
  console.log('Price element text:', priceText || 'NOT FOUND');
  
  // Link
  const link = $el.find('a[href*="MLM-"]').first().attr('href');
  console.log('Link:', link ? link.substring(0, 80) + '...' : 'NOT FOUND');
  
  // Location
  const location = $el.find('[class*="location"]').text().trim() || 
                  $el.find('.poly-component__location').text().trim();
  console.log('Location:', location || 'NOT FOUND');
  
  // Attributes
  const attrs = $el.find('.poly-attributes-list__item').map((_, attr) => $(attr).text().trim()).get();
  console.log('Attributes:', attrs.length > 0 ? attrs : 'NOT FOUND');
  
  // Image
  const img = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
  console.log('Image:', img ? 'FOUND' : 'NOT FOUND');
});