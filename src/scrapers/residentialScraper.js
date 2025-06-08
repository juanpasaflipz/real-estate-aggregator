import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrape rental property listings from VivaAnuncios using scrape.do API
 * @param {string} url - Target URL to scrape
 * @param {string} apiKey - scrape.do API key
 * @param {boolean} render - Enable JavaScript rendering (optional)
 * @returns {Promise<Array>} Array of property listings
 */
export async function scrapeResidentialListings(url, apiKey, render = false) {
  try {
    // Construct scrape.do API URL
    const params = new URLSearchParams({
      token: apiKey,
      url: url
    });
    
    if (render) {
      params.append('render', 'true');
    }
    
    const apiUrl = `https://api.scrape.do?${params.toString()}`;
    
    // Fetch content via scrape.do
    const response = await axios.get(apiUrl);
    const html = response.data;
    
    // Load HTML into cheerio
    const $ = cheerio.load(html);
    
    const listings = [];
    
    // Try multiple possible selectors for listing cards
    const cardSelectors = [
      'div.ad-card-wide',
      'div.tileV2',
      'article.listing',
      'div.ad-listing-card',
      'div.tile-wrap',
      'div.ad-list-card',
      '[data-qa="ad-card"]'
    ];
    
    let $cards = $();
    for (const selector of cardSelectors) {
      $cards = $(selector);
      if ($cards.length > 0) break;
    }
    
    // Process each listing card
    $cards.each((index, element) => {
      const $card = $(element);
      const listing = {};
      
      // Extract title - try multiple selectors
      const titleSelectors = [
        'a.ad-card-title',
        'h2.tile-title',
        'a.href-link',
        'h3',
        '[data-qa="ad-title"]'
      ];
      
      for (const selector of titleSelectors) {
        const $titleElem = $card.find(selector).first();
        if ($titleElem.length) {
          listing.title = $titleElem.text().trim();
          
          // Get URL from the link
          const $linkElem = $titleElem.is('a') ? $titleElem : $titleElem.closest('a');
          if ($linkElem.length) {
            const href = $linkElem.attr('href');
            listing.url = href ? new URL(href, url).href : '';
          }
          break;
        }
      }
      
      // Extract price - try multiple selectors
      const priceSelectors = [
        'span.ad-price',
        'div.price',
        'span.tile-price',
        'div.ad-card-price',
        '[data-qa="ad-price"]'
      ];
      
      for (const selector of priceSelectors) {
        const $priceElem = $card.find(selector).first();
        if ($priceElem.length) {
          listing.price = $priceElem.text().trim();
          break;
        }
      }
      
      // Extract location - try multiple selectors
      const locationSelectors = [
        'span.ad-location',
        'div.location',
        'span.tile-location',
        'div.ad-card-location',
        '[data-qa="ad-location"]'
      ];
      
      for (const selector of locationSelectors) {
        const $locationElem = $card.find(selector).first();
        if ($locationElem.length) {
          listing.location = $locationElem.text().trim();
          break;
        }
      }
      
      // Only add if we have at least title and URL
      if (listing.title && listing.url) {
        listings.push(listing);
      }
    });
    
    return listings;
    
  } catch (error) {
    console.error('Error scraping listings:', error.message);
    return [];
  }
}

// Example usage
async function main() {
  const SCRAPE_DO_API_KEY = process.env.SCRAPE_DO_API_KEY || 'your_api_key_here';
  const targetUrl = 'https://www.vivanuncios.com.mx/s-renta-inmuebles/distrito-federal/v1c30l1029p1';
  
  console.log('Fetching rental listings...');
  
  const results = await scrapeResidentialListings(
    targetUrl,
    SCRAPE_DO_API_KEY,
    false // Set to true if JavaScript rendering is needed
  );
  
  // Output as formatted JSON
  console.log(JSON.stringify(results, null, 2));
  console.log(`\nTotal listings found: ${results.length}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}