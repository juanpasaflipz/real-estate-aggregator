import axios from 'axios';

export interface ScrapingBeeOptions {
  url: string;
  render_js?: boolean;
  premium_proxy?: boolean;
  country_code?: string;
  wait?: number;
  wait_for?: string;
  block_ads?: boolean;
  stealth_proxy?: boolean;
  js_scenario?: {
    instructions: Array<
      | { wait: number }
      | { click: string }
      | { scroll: { x?: number; y?: number } }
      | { fill: { selector: string; value: string } }
    >;
  };
}

export class ScrapingBeeService {
  private apiKey: string;
  private baseUrl = 'https://app.scrapingbee.com/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scrape(options: ScrapingBeeOptions): Promise<string> {
    try {
      const params: any = {
        api_key: this.apiKey,
        url: options.url,
        render_js: options.render_js?.toString() || 'false',
        premium_proxy: options.premium_proxy?.toString() || 'false',
        country_code: options.country_code,
        wait: options.wait?.toString(),
        wait_for: options.wait_for,
        block_ads: options.block_ads?.toString() || 'false',
        stealth_proxy: options.stealth_proxy?.toString() || 'false'
      };

      // Add JS scenario if provided
      if (options.js_scenario) {
        params.js_scenario = JSON.stringify(options.js_scenario);
      }

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 60000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      if (response.status !== 200) {
        throw new Error(`ScrapingBee returned status ${response.status}: ${response.data}`);
      }

      // Log credit usage if available
      if (response.headers['spb-cost']) {
        console.log(`ScrapingBee credits used: ${response.headers['spb-cost']}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('ScrapingBee error:', error.message);
      throw error;
    }
  }
}