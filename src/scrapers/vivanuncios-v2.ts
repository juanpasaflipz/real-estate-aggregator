import * as cheerio from 'cheerio';

export interface VivanunciosListing {
  id: string;
  title: string;
  price: string;
  location: string;
  features: string[];
  description: string;
  link: string;
  images: string[];
  type: string;
}

export function parseVivanunciosHTML(html: string): VivanunciosListing[] {
  const $ = cheerio.load(html);
  const listings: VivanunciosListing[] = [];

  // Find all property cards using the new structure
  const propertyCards = $('[data-qa="posting PROPERTY"], [data-qa="posting DEVELOPMENT"]');
  
  console.log(`Found ${propertyCards.length} property cards`);

  propertyCards.each((index, element) => {
    try {
      const card = $(element);
      
      // Extract ID from the posting element
      const id = card.attr('data-id') || card.attr('id') || `VN-${index}`;
      
      // Get the link from data-to-posting attribute
      let link = card.attr('data-to-posting') || '';
      if (link && !link.startsWith('http')) {
        link = `https://www.vivanuncios.com.mx${link}`;
      }
      
      // Title - look inside the description section
      const titleElement = card.find('[data-qa="POSTING_CARD_DESCRIPTION"] a');
      const title = titleElement.text().trim() || 
                   card.find('.postingCard-module__posting-description a').text().trim() ||
                   card.find('h3[data-qa="POSTING_CARD_DESCRIPTION"]').text().trim();
      
      // Price
      const priceElement = card.find('[data-qa="POSTING_CARD_PRICE"]');
      const price = priceElement.text().trim() || 
                   card.find('.postingPrices-module__price').text().trim();
      
      // Location
      const locationElement = card.find('[data-qa="POSTING_CARD_LOCATION"]');
      const location = locationElement.text().trim() || 
                      card.find('.postingLocations-module__location-text').text().trim();
      
      // Features (bedrooms, bathrooms, size, etc.)
      const features: string[] = [];
      card.find('[data-qa="POSTING_CARD_FEATURES"] span, .postingMainFeatures-module__posting-main-features-span').each((i, el) => {
        const feature = $(el).text().trim();
        if (feature) {
          features.push(feature);
        }
      });
      
      // Description - additional text
      const description = card.find('[data-qa="POSTING_CARD_DESCRIPTION"] p').text().trim() ||
                         card.find('.postingCard-module__posting-description p').text().trim();
      
      // Link is already extracted from data-to-posting attribute
      
      // Images
      const images: string[] = [];
      card.find('[data-qa="POSTING_CARD_GALLERY"] img, .postingGallery-module__gallery-container img').each((i, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && !src.includes('placeholder')) {
          images.push(src);
        }
      });
      
      // Property type
      const type = card.attr('data-qa') === 'posting DEVELOPMENT' ? 'development' : 'property';
      
      if (title) {
        listings.push({
          id,
          title,
          price,
          location,
          features,
          description,
          link,
          images,
          type
        });
      }
    } catch (error) {
      console.error(`Error parsing property card ${index}:`, error);
    }
  });

  return listings;
}

export function extractVivanunciosData(listing: VivanunciosListing) {
  // Extract bedrooms from features
  let bedrooms = 0;
  for (const feature of listing.features) {
    const bedroomMatch = feature.match(/(\d+)\s*(rec[áa]mara|habitaci[oó]n|dormitorio)/i);
    if (bedroomMatch) {
      bedrooms = parseInt(bedroomMatch[1]);
      break;
    }
  }
  
  // If not found in features, check title and description
  if (bedrooms === 0) {
    const combinedText = `${listing.title} ${listing.description}`;
    const bedroomMatch = combinedText.match(/(\d+)\s*(rec[áa]mara|habitaci[oó]n|dormitorio)/i);
    if (bedroomMatch) {
      bedrooms = parseInt(bedroomMatch[1]);
    }
  }
  
  // Extract price number
  const priceNumber = parseInt(listing.price.replace(/[^0-9]/g, '')) || 0;
  
  // Extract currency
  const currency = listing.price.includes('USD') || listing.price.includes('US$') ? 'USD' : 'MXN';
  
  return {
    bedrooms,
    priceNumber,
    currency,
    neighborhood: listing.location.split(',')[0]?.trim() || '',
    city: listing.location.split(',')[1]?.trim() || listing.location
  };
}