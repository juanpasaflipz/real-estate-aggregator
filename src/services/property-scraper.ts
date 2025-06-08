import * as cheerio from 'cheerio';
import { ScrapeDoService } from './scrapedo.js';

interface ScrapedProperty {
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  link: string;
  image: string;
  source: string;
}

export class PropertyScraper {
  private scrapeDoService: ScrapeDoService;

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
  }): Promise<ScrapedProperty[]> {
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
  }): Promise<ScrapedProperty[]> {
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
  }): Promise<ScrapedProperty[]> {
    const promises = [
      this.scrapeVivanuncios(params),
      this.scrapeInmuebles24(params)
    ];

    const results = await Promise.allSettled(promises);
    const allProperties: ScrapedProperty[] = [];

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

  private parseVivanunciosHTML(html: string): ScrapedProperty[] {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    $('.tileV2').each((_, element) => {
      try {
        const $el = $(element);
        
        const title = $el.find('.ad-tile-title, .tile-title').text().trim();
        const priceText = $el.find('.ad-tile-price, .tile-price').text().trim();
        const location = $el.find('.tile-location, .ad-tile-location').text().trim();
        const link = $el.find('a.tile-title-text, a').first().attr('href') || '';
        const image = $el.find('img').first().attr('src') || 
                     $el.find('img').first().attr('data-src') || '';

        if (title && priceText) {
          properties.push({
            title,
            price: this.parsePrice(priceText),
            location: location || 'Mexico',
            bedrooms: this.extractBedrooms(title + ' ' + $el.text()),
            link: link.startsWith('http') ? link : `https://www.vivanuncios.com.mx${link}`,
            image: image || 'https://via.placeholder.com/300x200',
            source: 'vivanuncios'
          });
        }
      } catch (err) {
        console.error('Parse error:', err);
      }
    });

    return properties.slice(0, 20); // Limit to 20 properties
  }

  private parseInmuebles24HTML(html: string): ScrapedProperty[] {
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    $('.posting-card').each((_, element) => {
      try {
        const $el = $(element);
        
        const title = $el.find('.posting-title').text().trim();
        const priceText = $el.find('.price').text().trim();
        const location = $el.find('.posting-location').text().trim();
        const link = $el.find('a').first().attr('href') || '';
        const image = $el.find('img').first().attr('src') || 
                     $el.find('img').first().attr('data-src') || '';
        const features = $el.find('.posting-features').text();

        if (title && priceText) {
          properties.push({
            title,
            price: this.parsePrice(priceText),
            location: location || 'Mexico',
            bedrooms: this.extractBedrooms(features),
            link: link.startsWith('http') ? link : `https://www.inmuebles24.com${link}`,
            image: image || 'https://via.placeholder.com/300x200',
            source: 'inmuebles24'
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