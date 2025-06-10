import * as cheerio from 'cheerio';
import { ScrapeDoService } from './scrapedo.js';
import { Property } from '../types.js';

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
      let html = '';
      
      // Try ScrapingBee first if API key is available
      if (process.env.SCRAPINGBEE_API_KEY) {
        try {
          const { ScrapingBeeService } = await import('./scrapingbee.js');
          const scrapingBeeService = new ScrapingBeeService(process.env.SCRAPINGBEE_API_KEY);
          
          // Use the configuration that partially worked (without stealth mode)
          html = await scrapingBeeService.scrape({
            url,
            render_js: true,
            premium_proxy: true,
            country_code: 'mx',
            stealth_proxy: false,  // Counter-intuitively, this works better
            block_ads: true,
            wait: 3000
          });
          
          console.log('Scraped with ScrapingBee, response size:', html.length);
        } catch (scrapingBeeError) {
          console.error('ScrapingBee failed:', scrapingBeeError.message);
        }
      }
      
      // Fallback to Scrape.do if ScrapingBee failed or not available
      if (!html || html.length < 1000) {
        html = await this.scrapeDoService.scrape({
          url,
          render: true,  // Use headless browser for JavaScript content
          super: false,  // Not included in current plan
          geoCode: 'mx'  // Use Mexico geo-location
        });
      }

      // Check if we got a valid response
      if (html.includes('challenge-platform') || html.includes('Access Denied')) {
        console.error('Vivanuncios blocked by Cloudflare/security');
        return [];
      }
      
      return this.parseVivanunciosHTML(html);
    } catch (error: any) {
      console.error('Vivanuncios scraping error:', error.message);
      console.error('URL attempted:', url);
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
        render: true,  // Use JS rendering
        super: false,  // No residential proxies
        geoCode: 'mx'
      });
      
      // Check for blocks
      if (html.includes('challenge') || html.includes('Access Denied')) {
        console.error('Inmuebles24 blocked by security');
        return [];
      }
      
      return this.parseInmuebles24HTML(html);
    } catch (error: any) {
      console.error('Inmuebles24 scraping error:', error.message);
      return [];
    }
  }

  /**
   * Scrape properties from Pulppo
   */
  async scrapePulppo(params: {
    city?: string;
    priceMin?: string;
    priceMax?: string;
    bedrooms?: string;
  }): Promise<Property[]> {
    try {
      const { PulppoScraper } = await import('../scrapers/pulppo-scraper.js');
      const pulppoScraper = new PulppoScraper();
      const url = pulppoScraper.buildSearchUrl(params);
      
      console.log('Scraping Pulppo:', url);
      
      // Try with Scrape.do first (it works without blocking)
      const html = await this.scrapeDoService.scrape({
        url,
        render: true,
        waitUntil: 'networkidle2',
        geoCode: 'mx'
      });
      
      // Check if we got valid content
      if (html.includes('__NEXT_DATA__') && !html.includes('propiedad')) {
        console.log('Pulppo page loaded but no properties found - may need JS execution');
        return [];
      }
      
      return pulppoScraper.parseHTML(html);
    } catch (error: any) {
      console.error('Pulppo scraping error:', error.message);
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
    // Only scrape from Pulppo now
    try {
      const pulppoProperties = await this.scrapePulppo(params);
      console.log(`Pulppo returned ${pulppoProperties.length} properties`);
      return pulppoProperties;
    } catch (error: any) {
      console.error('Pulppo scraping failed:', error.message);
      return [];
    }
  }

  public buildVivanunciosUrl(params: any): string {
    const cityMap: Record<string, string> = {
      'mexico': 'ciudad-de-mexico',
      'mexico city': 'ciudad-de-mexico',
      'ciudad de mexico': 'ciudad-de-mexico',
      'guadalajara': 'guadalajara',
      'monterrey': 'monterrey',
      'cancun': 'cancun'
    };

    const citySlug = cityMap[params.city?.toLowerCase() || ''] || '';
    let url = citySlug 
      ? `https://www.vivanuncios.com.mx/s-venta-inmuebles/${citySlug}/v1c1097l1p1`
      : `https://www.vivanuncios.com.mx/s-venta-inmuebles/v1c1097p1`;

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
      'cancun': 'quintana-roo/benito-juarez',
      'playa del carmen': 'quintana-roo/solidaridad',
      'puerto vallarta': 'jalisco/puerto-vallarta',
      'queretaro': 'queretaro/queretaro',
      'puebla': 'puebla/puebla'
    };

    const cityPath = cityMap[params.city?.toLowerCase() || ''] || 'mexico';
    let url = `https://www.inmuebles24.com/inmuebles-en-venta-en-${cityPath}.html`;

    // Add query parameters if needed
    const queryParams = [];
    if (params.priceMin || params.priceMax) {
      const minPrice = params.priceMin || '';
      const maxPrice = params.priceMax || '';
      queryParams.push(`precio-${minPrice}-${maxPrice}`);
    }
    if (params.bedrooms) {
      queryParams.push(`${params.bedrooms}-recamaras`);
    }

    if (queryParams.length > 0) {
      // Inmuebles24 uses path-based filters, not query strings
      url = url.replace('.html', `-${queryParams.join('-')}.html`);
    }

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

    // Multiple possible selectors for Inmuebles24
    const selectors = [
      '.postings-container .posting-card',
      '.listing-card',
      '[data-qa="posting-card"]',
      '.results-item',
      'div[data-posting-id]'
    ];

    let $listings = $();
    for (const selector of selectors) {
      $listings = $(selector);
      if ($listings.length > 0) {
        console.log(`Found ${$listings.length} listings with selector: ${selector}`);
        break;
      }
    }

    $listings.each((_, element) => {
      try {
        const $el = $(element);
        
        // Extract data with multiple fallback selectors
        const title = $el.find('.posting-title, h2, .card-title').first().text().trim();
        const priceText = $el.find('.price, .card-price, [data-qa="price"]').first().text().trim();
        const location = $el.find('.posting-location, .card-location, [data-qa="location"]').first().text().trim();
        const link = $el.find('a').first().attr('href') || '';
        
        // Extract features
        const features = $el.find('.posting-features, .card-features, .posting-description')
          .text()
          .trim();
        
        // Extract images
        const images: string[] = [];
        $el.find('img').each((_, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src') || $(img).attr('data-lazy');
          if (src && !src.includes('placeholder') && !src.includes('logo')) {
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
            bedrooms: this.extractNumber(features, ['recámara', 'habitación', 'bedroom', 'rec']),
            bathrooms: this.extractNumber(features, ['baño', 'bathroom']),
            size: this.extractNumber(features, ['m²', 'metros']),
            link: link.startsWith('http') ? link : `https://www.inmuebles24.com${link}`,
            image: images[0] || 'https://via.placeholder.com/300x200',
            images: images.length > 0 ? images : ['https://via.placeholder.com/300x200'],
            source: 'inmuebles24',
            description: features,
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Parse error for Inmuebles24 listing:', err);
      }
    });

    console.log(`Parsed ${properties.length} properties from Inmuebles24`);
    return properties.slice(0, 20); // Limit to 20 properties
  }


  private extractNumber(text: string, keywords: string[]): number | undefined {
    for (const keyword of keywords) {
      const pattern = new RegExp(`(\\d+)\\s*${keyword}`, 'i');
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return undefined;
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