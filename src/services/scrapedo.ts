import axios from 'axios';

interface ScrapeDoOptions {
  url: string;
  render?: boolean;
  super?: boolean;
  geoCode?: string;
  sessionNumber?: number;
  customHeaders?: Record<string, string>;
  extraParams?: Record<string, any>;
  waitFor?: string;
  waitUntil?: string;
}

export class ScrapeDoService {
  private token: string;
  private baseUrl = 'https://api.scrape.do/';

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Scrape a URL using Scrape.do API
   * @param options Scraping options
   * @returns The scraped content as string
   */
  async scrape(options: ScrapeDoOptions): Promise<string> {
    try {
      const params = new URLSearchParams({
        token: this.token,
        url: options.url
      });

      // Add optional parameters
      if (options.render !== undefined) {
        params.append('render', options.render.toString());
      }
      
      if (options.super !== undefined) {
        params.append('super', options.super.toString());
      }
      
      if (options.geoCode) {
        params.append('geoCode', options.geoCode);
      }
      
      if (options.sessionNumber !== undefined) {
        params.append('sessionNumber', options.sessionNumber.toString());
      }
      
      if (options.waitFor) {
        params.append('waitFor', options.waitFor);
      }
      
      if (options.waitUntil) {
        params.append('waitUntil', options.waitUntil);
      }

      // Add any extra parameters
      if (options.extraParams) {
        Object.entries(options.extraParams).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
      }

      const response = await axios.get(this.baseUrl, {
        params,
        headers: {
          ...options.customHeaders,
          'Accept': 'text/html,application/json,application/xhtml+xml',
          'User-Agent': 'ScrapeDoClient/1.0'
        },
        timeout: 60000, // 60 second timeout
        maxRedirects: 5
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Scrape.do API error: ${error.response.status} - ${error.response.data}`);
      } else if (error.request) {
        throw new Error('Scrape.do request failed: No response received');
      } else {
        throw new Error(`Scrape.do error: ${error.message}`);
      }
    }
  }

  /**
   * Scrape a URL and return JSON data
   * @param options Scraping options
   * @returns Parsed JSON data
   */
  async scrapeJSON<T = any>(options: ScrapeDoOptions): Promise<T> {
    const content = await this.scrape(options);
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error('Failed to parse JSON response from scraped content');
    }
  }

  /**
   * Check remaining API credits
   * @returns API credit information
   */
  async checkCredits(): Promise<{
    remainingCredits: number;
    usedCredits: number;
    totalCredits: number;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}account`, {
        params: { token: this.token },
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to check credits: ${error.message}`);
    }
  }
}