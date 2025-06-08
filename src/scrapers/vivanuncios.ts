import axios from 'axios';
import * as cheerio from 'cheerio';

interface VivanunciosProperty {
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  link: string;
  image: string;
}

export class VivanunciosScraper {
  private scrapedoToken: string;
  private baseUrl = 'https://api.scrape.do/';

  constructor(scrapedoToken: string) {
    this.scrapedoToken = scrapedoToken;
  }

  private buildSearchUrl(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): string {
    // Vivanuncios URL pattern for Mexico City and other cities
    const cityMap: Record<string, string> = {
      'mexico': 'ciudad-de-mexico/v1c1097l11518p1',
      'mexico city': 'ciudad-de-mexico/v1c1097l11518p1',
      'ciudad de mexico': 'ciudad-de-mexico/v1c1097l11518p1',
      'guadalajara': 'guadalajara/v1c1097l11308p1',
      'monterrey': 'monterrey/v1c1097l11314p1',
      'cancun': 'cancun/v1c1097l11302p1',
      'playa del carmen': 'playa-del-carmen/v1c1097l12258p1'
    };

    const cityPath = cityMap[params.city?.toLowerCase() || ''] || 'v1c1097l1p1';
    let url = `https://www.vivanuncios.com.mx/s-venta-inmuebles/${cityPath}`;

    // Add price and bedroom filters to URL if needed
    const queryParams = [];
    if (params.priceMin) queryParams.push(`pr=${params.priceMin},`);
    if (params.priceMax) queryParams.push(`pr=,${params.priceMax}`);
    if (params.bedrooms) queryParams.push(`be=${params.bedrooms},`);

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  async scrapeProperties(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): Promise<VivanunciosProperty[]> {
    try {
      const targetUrl = this.buildSearchUrl(params);
      const encodedUrl = encodeURIComponent(targetUrl);
      
      const response = await axios.get(
        `${this.baseUrl}?token=${this.scrapedoToken}&url=${encodedUrl}&super=true`,
        {
          timeout: 30000,
          headers: {
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8'
          }
        }
      );

      const $ = cheerio.load(response.data);
      const properties: VivanunciosProperty[] = [];

      // Vivanuncios listing selectors
      $('.tileV2').each((index, element) => {
        try {
          const $element = $(element);
          
          // Extract property details
          const title = $element.find('.ad-tile-title').text().trim() || 
                        $element.find('.tile-title').text().trim();
          
          const priceText = $element.find('.ad-tile-price').text().trim() ||
                           $element.find('.tile-price').text().trim();
          const price = this.parsePrice(priceText);
          
          const location = $element.find('.tile-location').text().trim() ||
                          $element.find('.ad-tile-location').text().trim();
          
          // Extract bedrooms from features or title
          const features = $element.find('.tile-features').text();
          const bedrooms = this.extractBedrooms(features + ' ' + title);
          
          // Get property link
          const linkElement = $element.find('a.tile-title-text').first();
          const relativeLink = linkElement.attr('href') || '';
          const link = relativeLink.startsWith('http') 
            ? relativeLink 
            : `https://www.vivanuncios.com.mx${relativeLink}`;
          
          // Get image
          const imageElement = $element.find('img.tile-image, img.ad-image').first();
          const image = imageElement.attr('src') || 
                       imageElement.attr('data-src') || 
                       'https://via.placeholder.com/300x200';

          if (title && price > 0) {
            properties.push({
              title,
              price,
              location: location || params.city || 'Mexico',
              bedrooms,
              link,
              image
            });
          }
        } catch (err) {
          console.error('Error parsing property:', err);
        }
      });

      return properties.slice(0, 20); // Return max 20 properties
    } catch (error: any) {
      console.error('Vivanuncios scraping error:', error.message);
      throw new Error(`Failed to scrape Vivanuncios: ${error.message}`);
    }
  }

  private parsePrice(priceText: string): number {
    // Remove currency symbols and convert to number
    const cleaned = priceText
      .replace(/[^0-9.,]/g, '')
      .replace(/,/g, '');
    
    const price = parseFloat(cleaned);
    
    // If price seems too low (less than 1000), it might be in thousands
    if (price > 0 && price < 1000) {
      return price * 1000;
    }
    
    return price || 0;
  }

  private extractBedrooms(text: string): number {
    // Look for patterns like "2 recámaras", "3 habitaciones", "2 rec"
    const patterns = [
      /(\d+)\s*rec[aá]mara/i,
      /(\d+)\s*habitaci[oó]n/i,
      /(\d+)\s*rec\b/i,
      /(\d+)\s*bedroom/i,
      /(\d+)\s*cuarto/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return 0; // Default if not found
  }
}