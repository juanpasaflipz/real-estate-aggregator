import * as cheerio from 'cheerio';
import { ScrapeDoService } from './scrapedo.js';
import { Property } from '../types.js';
import { parseVivanunciosHTML, extractVivanunciosData } from '../scrapers/vivanuncios-v2.js';

export class PropertyScraper {
  private scrapeDoService: ScrapeDoService;
  private propertyIdCounter: number = 1;

  constructor(scrapeDoToken: string) {
    this.scrapeDoService = new ScrapeDoService(scrapeDoToken);
  }

  /**
   * Scrape properties from Vivanuncios
   */
  async scrapeVivanuncios(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): Promise<Property[]> {
    const url = this.buildVivanunciosUrl(params);
    
    try {
      const html = await this.scrapeDoService.scrape({
        url,
        render: true, // Use headless browser for better results
        super: true,  // Use residential proxies
        geoCode: 'mx'
      });

      return this.parseVivanunciosHTML(html);
    } catch (error: any) {
      console.error('Vivanuncios scraping error:', error.message);
      return [];
    }
  }

  /**
   * Scrape properties from Inmuebles24
   */
  async scrapeInmuebles24(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): Promise<Property[]> {
    const url = this.buildInmuebles24Url(params);
    
    try {
      const html = await this.scrapeDoService.scrape({
        url,
        render: true,
        super: true,
        geoCode: 'mx'
      });

      return this.parseInmuebles24HTML(html);
    } catch (error: any) {
      console.error('Inmuebles24 scraping error:', error.message);
      return [];
    }
  }

  /**
   * Scrape from multiple sources
   */
  async scrapeAllSources(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): Promise<Property[]> {
    const promises = [
      this.scrapeVivanuncios(params),
      this.scrapeInmuebles24(params)
    ];

    const results = await Promise.allSettled(promises);
    const allProperties: Property[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allProperties.push(...result.value);
      } else {
        console.error(`Source ${index} failed:`, result.reason);
      }
    });

    return allProperties;
  }

  private buildVivanunciosUrl(params: any): string {
    const cityMap: Record<string, string> = {
      'mexico': 'ciudad-de-mexico/v1c1097l11518p1',
      'mexico city': 'ciudad-de-mexico/v1c1097l11518p1',
      'ciudad de mexico': 'ciudad-de-mexico/v1c1097l11518p1',
      'guadalajara': 'guadalajara/v1c1097l11308p1',
      'monterrey': 'monterrey/v1c1097l11314p1',
      'cancun': 'cancun/v1c1097l11302p1'
    };

    const cityPath = cityMap[params.city?.toLowerCase() || ''] || 'v1c1097l1p1';
    let url = `https://www.vivanuncios.com.mx/s-venta-inmuebles/${cityPath}`;

    const queryParams = [];
    if (params.priceMin) queryParams.push(`pr=${params.priceMin},`);
    if (params.priceMax) queryParams.push(`pr=,${params.priceMax}`);
    if (params.bedrooms) queryParams.push(`be=${params.bedrooms},`);

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  private buildInmuebles24Url(params: any): string {
    const cityMap: Record<string, string> = {
      'mexico': 'distrito-federal',
      'mexico city': 'distrito-federal',
      'ciudad de mexico': 'distrito-federal',
      'guadalajara': 'jalisco/guadalajara',
      'monterrey': 'nuevo-leon/monterrey',
      'cancun': 'quintana-roo/benito-juarez'
    };

    const cityPath = cityMap[params.city?.toLowerCase() || ''] || 'mexico';
    let url = `https://www.inmuebles24.com/inmuebles-en-venta-en-${cityPath}.html`;

    return url;
  }

  private parseVivanunciosHTML(html: string): Property[] {
    const listings = parseVivanunciosHTML(html);
    const properties: Property[] = [];

    for (const listing of listings.slice(0, 20)) {
      const extractedData = extractVivanunciosData(listing);
      
      // Extract bathrooms from features
      let bathrooms: number | undefined;
      for (const feature of listing.features) {
        const bathroomMatch = feature.match(/(\d+)\s*(ba[ñn]o|bathroom)/i);
        if (bathroomMatch) {
          bathrooms = parseInt(bathroomMatch[1]);
          break;
        }
      }
      
      // Extract size from features
      let size: number | undefined;
      for (const feature of listing.features) {
        const sizeMatch = feature.match(/(\d+)\s*m[²2]/i);
        if (sizeMatch) {
          size = parseInt(sizeMatch[1]);
          break;
        }
      }
      
      properties.push({
        id: `VN-${this.propertyIdCounter++}`,
        title: listing.title,
        price: extractedData.priceNumber,
        currency: extractedData.currency,
        location: listing.location,
        bedrooms: extractedData.bedrooms,
        bathrooms,
        size,
        propertyType: listing.type === 'development' ? 'Desarrollo' : 'Casa',
        link: listing.link,
        image: listing.images[0] || 'https://via.placeholder.com/300x200',
        images: listing.images.length > 0 ? listing.images : ['https://via.placeholder.com/300x200'],
        features: listing.features,
        description: listing.description,
        source: 'vivanuncios',
        createdAt: new Date().toISOString()
      });
    }

    return properties;
  }

  private parseInmuebles24HTML(html: string): Property[] {
    const $ = cheerio.load(html);
    const properties: Property[] = [];

    $('.posting-card').each((_, element) => {
      try {
        const $el = $(element);
        
        const title = $el.find('.posting-title').text().trim();
        const priceText = $el.find('.price').text().trim();
        const location = $el.find('.posting-location').text().trim();
        const link = $el.find('a').first().attr('href') || '';
        const features = $el.find('.posting-features').text();
        
        // Try to get multiple images
        const images: string[] = [];
        $el.find('img').each((i, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src');
          if (src && !src.includes('placeholder')) {
            images.push(src);
          }
        });

        if (title && priceText) {
          properties.push({
            id: `IN24-${this.propertyIdCounter++}`,
            title,
            price: this.parsePrice(priceText),
            currency: priceText.includes('USD') || priceText.includes('US$') ? 'USD' : 'MXN',
            location: location || 'Mexico',
            bedrooms: this.extractBedrooms(features),
            link: link.startsWith('http') ? link : `https://www.inmuebles24.com${link}`,
            image: images[0] || 'https://via.placeholder.com/300x200',
            images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'],
            source: 'inmuebles24',
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Parse error:', err);
      }
    });

    return properties.slice(0, 20); // Limit to 20 properties
  }

  private parsePrice(priceText: string): number {
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
    const patterns = [
      /(\d+)\s*rec[aá]mara/i,
      /(\d+)\s*habitaci[oó]n/i,
      /(\d+)\s*rec\b/i,
      /(\d+)\s*bedroom/i,
      /(\d+)\s*dormitorio/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return 0;
  }
}