import { ScrapeDoService } from './scrapedo.js';
import { Property } from '../types.js';

export class PropertyScraper {
  private scrapeDoService: ScrapeDoService;
  private propertyIdCounter: number = 1;

  constructor(scrapeDoToken: string) {
    this.scrapeDoService = new ScrapeDoService(scrapeDoToken);
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
      
      let html = '';
      
      // Try ScrapingBee first if available
      if (process.env.SCRAPINGBEE_API_KEY) {
        try {
          const { ScrapingBeeService } = await import('./scrapingbee.js');
          const scrapingBee = new ScrapingBeeService(process.env.SCRAPINGBEE_API_KEY);
          
          html = await scrapingBee.scrape({
            url,
            render_js: true,
            premium_proxy: true,
            country_code: 'mx',
            stealth_proxy: false,  // This worked better in tests
            block_ads: true,
            wait: 5000
          });
          
          console.log('ScrapingBee success, response size:', html.length);
        } catch (error: any) {
          console.error('ScrapingBee failed:', error.message);
        }
      }
      
      // Fallback to Scrape.do if ScrapingBee failed or not available
      if (!html || html.length < 1000) {
        html = await this.scrapeDoService.scrape({
          url,
          render: true,
          geoCode: 'mx',
          waitUntil: 'networkidle2',
          waitFor: '[class*="property"], [href*="/propiedad/"], .results-grid'
        });
      }
      
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
   * Scrape from all sources (currently only Pulppo)
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
}