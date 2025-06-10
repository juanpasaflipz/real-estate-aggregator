import * as cheerio from 'cheerio';
import fs from 'fs';

const html = fs.readFileSync('mercadolibre-debug.html', 'utf8');
const $ = cheerio.load(html);

// Get a complete listing item
const firstListItem = $('li.ui-search-layout__item').first();
const $item = $(firstListItem);

console.log('Analyzing complete listing structure:\n');

// Find the title within the list item (not just wrapper)
const title = $item.find('h2').text().trim();
console.log('Title (from list item):', title);

// Find the wrapper
const wrapper = $item.find('.ui-search-result__wrapper');
console.log('Has wrapper:', wrapper.length > 0);

// Find link
const link = $item.find('a[href*="MLM-"]').first().attr('href');
console.log('Link:', link ? link.substring(0, 80) + '...' : 'NOT FOUND');

// Price
const priceText = $item.find('.andes-money-amount__fraction').first().text().trim();
console.log('Price:', priceText);

// Location
const location = $item.find('.poly-component__location').text().trim();
console.log('Location:', location);

// Attributes
const attrs = $item.find('.poly-attributes-list__item').map((_, attr) => $(attr).text().trim()).get();
console.log('Attributes:', attrs);

// Let's look at the structure
console.log('\n\nHTML Structure of first item (prettified):');
const itemHtml = $item.html();
if (itemHtml) {
  // Extract key parts
  const h2Match = itemHtml.match(/<h2[^>]*>(.*?)<\/h2>/);
  if (h2Match) {
    console.log('H2 found:', h2Match[1].substring(0, 100));
  }
  
  // Show abbreviated structure
  const structure = itemHtml
    .replace(/<img[^>]*>/g, '<img...>')
    .replace(/href="[^"]*"/g, 'href="..."')
    .replace(/src="[^"]*"/g, 'src="..."')
    .replace(/data-[^=]*="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
    .substring(0, 2000);
  
  console.log('\nSimplified structure:');
  console.log(structure);
}