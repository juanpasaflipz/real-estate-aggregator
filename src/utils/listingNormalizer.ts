export interface NormalizedListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: {
    neighborhood: string;
    city: string;
    country: string;
  };
  bedrooms: number;
  propertyType: 'residential' | 'commercial' | 'land';
  category: string;
  link: string;
  image: string;
  source: string;
  scraped_at: string;
}

type ListingSource = 'easybroker' | 'vivanuncios';

function cleanPrice(price: string | number): number {
  if (typeof price === 'number') return price;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = price.replace(/[^0-9.]/g, '');
  return parseInt(cleaned) || 0;
}

function extractLocation(locationString: string): { neighborhood: string; city: string; country: string } {
  // Common patterns: "Neighborhood, City" or "Neighborhood - City" or "City"
  const parts = locationString.split(/[,\-]/).map(part => part.trim());
  
  return {
    neighborhood: parts[0] || '',
    city: parts[1] || parts[0] || '',
    country: 'Mexico' // Default for these sources
  };
}

function inferPropertyType(category: string, title: string = ''): 'residential' | 'commercial' | 'land' {
  const lowerCategory = category.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const combined = `${lowerCategory} ${lowerTitle}`;
  
  if (combined.includes('terreno') || combined.includes('lote') || combined.includes('land')) {
    return 'land';
  }
  
  if (combined.includes('oficina') || combined.includes('local') || combined.includes('bodega') || 
      combined.includes('comercial') || combined.includes('office') || combined.includes('warehouse')) {
    return 'commercial';
  }
  
  return 'residential';
}

function normalizeEasyBrokerListing(listing: any): NormalizedListing {
  return {
    id: listing.public_id || listing.id || '',
    title: listing.title || '',
    price: cleanPrice(listing.operations?.[0]?.amount || listing.price || 0),
    currency: listing.operations?.[0]?.currency || 'MXN',
    location: {
      neighborhood: listing.location?.neighborhood || '',
      city: listing.location?.city || '',
      country: listing.location?.country || 'Mexico'
    },
    bedrooms: parseInt(listing.bedrooms) || 0,
    propertyType: inferPropertyType(listing.property_type || '', listing.title),
    category: listing.property_type || 'house',
    link: listing.public_url || `https://www.easybroker.com/listings/${listing.public_id || listing.id}`,
    image: listing.title_image_url || listing.images?.[0]?.url || '',
    source: 'easybroker',
    scraped_at: listing.created_at || new Date().toISOString()
  };
}

function normalizeVivanunciosListing(listing: any): NormalizedListing {
  // Vivanuncios often has location in format "Neighborhood - City"
  const locationData = extractLocation(listing.location || listing.address || '');
  
  // Extract bedrooms from title or details
  let bedrooms = 0;
  if (listing.bedrooms) {
    bedrooms = parseInt(listing.bedrooms);
  } else if (listing.title || listing.description) {
    const bedroomMatch = (listing.title + ' ' + (listing.description || '')).match(/(\d+)\s*(recámaras?|habitaciones?|bedroom)/i);
    bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : 0;
  }
  
  return {
    id: listing.id || listing.listing_id || '',
    title: listing.title || listing.name || '',
    price: cleanPrice(listing.price || listing.precio || 0),
    currency: listing.currency || 'MXN',
    location: locationData,
    bedrooms: bedrooms,
    propertyType: inferPropertyType(listing.category || listing.tipo || '', listing.title),
    category: listing.category || listing.tipo || 'apartment',
    link: listing.url || listing.link || `https://www.vivanuncios.com.mx/ad/${listing.id}`,
    image: listing.image || listing.imagen || listing.photos?.[0] || '',
    source: 'vivanuncios',
    scraped_at: listing.date || listing.fecha || new Date().toISOString()
  };
}

export function normalizeListing(listing: any, source: ListingSource): NormalizedListing {
  switch (source) {
    case 'easybroker':
      return normalizeEasyBrokerListing(listing);
    case 'vivanuncios':
      return normalizeVivanunciosListing(listing);
    default:
      throw new Error(`Unsupported listing source: ${source}`);
  }
}

export function normalizeListings(listings: any[], source: ListingSource): NormalizedListing[] {
  return listings.map(listing => normalizeListing(listing, source));
}