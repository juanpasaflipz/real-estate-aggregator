import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { ScrapeDoService } from './services/scrapedo.js';
import { PropertyScraper } from './services/property-scraper.js';

dotenv.config();

const app = express();
const PORT = process.env.REST_API_PORT || process.env.PORT || 3002;

// API configurations
const EASYBROKER_API_KEY = process.env.EASYBROKER_API_KEY || '';
const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN || '';

// Use staging URL for test key, production URL for real keys
const isTestKey = EASYBROKER_API_KEY === 'l7u502p8v46ba3ppgvj5y2aad50lb9';
const EASYBROKER_API_URL = isTestKey ? 'https://api.stagingeb.com/v1' : 'https://api.easybroker.com/v1';

// Determine data sources
const USE_MOCK_DATA = !EASYBROKER_API_KEY || EASYBROKER_API_KEY === 'your_key_here';
const HAS_SCRAPEDO = SCRAPEDO_TOKEN && SCRAPEDO_TOKEN !== 'your_scrapedo_token_here';

// Initialize services
const scrapeDoService = HAS_SCRAPEDO ? new ScrapeDoService(SCRAPEDO_TOKEN) : null;
const propertyScraper = HAS_SCRAPEDO ? new PropertyScraper(SCRAPEDO_TOKEN) : null;

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}

interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
}

function sendError(res: Response, statusCode: number, message: string, code?: string): Response {
  return res.status(statusCode).json({
    status: 'error',
    message,
    code
  } as ErrorResponse);
}

function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response {
  return res.status(statusCode).json({
    status: 'success',
    data
  } as SuccessResponse<T>);
}

// Mock data for production
const mockProperties = [
  {
    title: "Modern Condo in Polanco",
    price: 180000,
    location: "Polanco, Mexico City",
    bedrooms: 2,
    link: "https://example.com/property-1",
    image: "https://example.com/images/1.jpg"
  },
  {
    title: "Beach House in Cancun",
    price: 250000,
    location: "Cancun, Quintana Roo",
    bedrooms: 3,
    link: "https://example.com/property-2",
    image: "https://example.com/images/2.jpg"
  },
  {
    title: "Colonial Home in San Miguel",
    price: 320000,
    location: "San Miguel de Allende, Guanajuato",
    bedrooms: 4,
    link: "https://example.com/property-3",
    image: "https://example.com/images/3.jpg"
  },
  {
    title: "Apartment in Condesa",
    price: 150000,
    location: "Condesa, Mexico City",
    bedrooms: 1,
    link: "https://example.com/property-4",
    image: "https://example.com/images/4.jpg"
  },
  {
    title: "Penthouse in Puerto Vallarta",
    price: 450000,
    location: "Puerto Vallarta, Jalisco",
    bedrooms: 3,
    link: "https://example.com/property-5",
    image: "https://example.com/images/5.jpg"
  }
];

const validatePropertySearch = (req: Request, res: Response, next: NextFunction) => {
  const { city, zipCode, area, priceMin, priceMax, bedrooms } = req.query;

  if (!city && !zipCode && !area) {
    return sendError(res, 400, 'At least one location parameter (city, zipCode, or area) is required', 'MISSING_LOCATION');
  }

  if (priceMin && isNaN(Number(priceMin))) {
    return sendError(res, 400, 'Invalid priceMin parameter', 'INVALID_PRICE_MIN');
  }

  if (priceMax && isNaN(Number(priceMax))) {
    return sendError(res, 400, 'Invalid priceMax parameter', 'INVALID_PRICE_MAX');
  }

  if (bedrooms && isNaN(Number(bedrooms))) {
    return sendError(res, 400, 'Invalid bedrooms parameter', 'INVALID_BEDROOMS');
  }

  if (priceMin && priceMax && Number(priceMin) > Number(priceMax)) {
    return sendError(res, 400, 'priceMin cannot be greater than priceMax', 'INVALID_PRICE_RANGE');
  }

  next();
};

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Powered-By', 'MCP-REST-API');
  next();
});

app.get('/health', (req: Request, res: Response) => {
  const dataSources = [];
  if (USE_MOCK_DATA) dataSources.push('mock');
  if (!USE_MOCK_DATA) dataSources.push('easybroker');
  if (HAS_SCRAPEDO) dataSources.push('vivanuncios', 'inmuebles24');
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    dataSources,
    servicesAvailable: {
      easybroker: !USE_MOCK_DATA,
      scrapedo: HAS_SCRAPEDO
    }
  };
  
  sendSuccess(res, health);
});

// Helper function to fetch from EasyBroker API
async function fetchFromEasyBroker(params: any) {
  try {
    const queryParams = new URLSearchParams();
    
    // Map our parameters to EasyBroker's expected format
    if (params.city) {
      queryParams.append('search[city]', params.city);
    }
    if (params.priceMin) {
      queryParams.append('search[min_price]', params.priceMin);
    }
    if (params.priceMax) {
      queryParams.append('search[max_price]', params.priceMax);
    }
    if (params.bedrooms) {
      queryParams.append('search[bedrooms]', params.bedrooms);
    }
    // Only show published properties
    queryParams.append('search[statuses][]', 'published');
    queryParams.append('limit', '20');

    const response = await axios.get(
      `${EASYBROKER_API_URL}/properties?${queryParams.toString()}`,
      {
        headers: {
          'X-Authorization': EASYBROKER_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    // Transform EasyBroker response to our format
    const properties = response.data.content?.map((prop: any) => ({
      title: prop.title || 'Property',
      price: prop.operations?.[0]?.amount || 0,
      location: `${prop.location?.city || ''}, ${prop.location?.state || ''}`.trim(),
      bedrooms: prop.bedrooms || 0,
      link: prop.public_url || '#',
      image: prop.title_image_url || 'https://via.placeholder.com/300x200',
      source: 'easybroker',
      id: prop.public_id
    })) || [];

    return {
      properties,
      total: response.data.pagination?.total || properties.length,
      source: 'easybroker'
    };
  } catch (error: any) {
    console.error('EasyBroker API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch from EasyBroker');
  }
}

app.get('/properties', validatePropertySearch, async (req: Request, res: Response) => {
  try {
    const { city, zipCode, area, priceMin, priceMax, bedrooms } = req.query;
    const allProperties = [];
    const sources = [];
    const errors = [];

    // Use mock data if no API key is configured
    if (USE_MOCK_DATA) {
      // Filter mock properties based on query parameters
      let filtered = [...mockProperties];

      if (city) {
        const cityStr = String(city).toLowerCase();
        filtered = filtered.filter(p => 
          p.location.toLowerCase().includes(cityStr)
        );
      }

      if (priceMin) {
        filtered = filtered.filter(p => p.price >= Number(priceMin));
      }

      if (priceMax) {
        filtered = filtered.filter(p => p.price <= Number(priceMax));
      }

      if (bedrooms) {
        filtered = filtered.filter(p => p.bedrooms === Number(bedrooms));
      }

      allProperties.push(...filtered);
      sources.push('mock');
    } else {
      // Fetch from EasyBroker API
      try {
        const result = await fetchFromEasyBroker({
          city: city as string,
          priceMin: priceMin as string,
          priceMax: priceMax as string,
          bedrooms: bedrooms as string
        });
        allProperties.push(...result.properties);
        sources.push('easybroker');
      } catch (error: any) {
        console.error('EasyBroker error:', error.message);
        errors.push({ source: 'easybroker', error: error.message });
      }
    }

    // Fetch from scraped sources if Scrape.do is configured
    if (HAS_SCRAPEDO && propertyScraper) {
      try {
        const scrapedProperties = await propertyScraper.scrapeAllSources({
          city: city as string,
          priceMin: priceMin as string,
          priceMax: priceMax as string,
          bedrooms: bedrooms as string
        });
        
        allProperties.push(...scrapedProperties);
        sources.push('vivanuncios', 'inmuebles24');
      } catch (error: any) {
        console.error('Scraping error:', error.message);
        errors.push({ source: 'scraping', error: error.message });
      }
    }

    // Remove duplicates based on title similarity
    const uniqueProperties = removeDuplicates(allProperties);

    sendSuccess(res, {
      properties: uniqueProperties,
      total: uniqueProperties.length,
      sources,
      errors: errors.length > 0 ? errors : undefined,
      query: req.query
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    sendError(res, 500, 'Failed to search properties', 'SEARCH_ERROR');
  }
});

// Helper function to remove duplicate properties
function removeDuplicates(properties: any[]): any[] {
  const seen = new Set<string>();
  return properties.filter(property => {
    const key = `${property.title.toLowerCase()}-${property.price}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Scrape endpoint - only available if Scrape.do token is configured
app.post('/scrape', async (req: Request, res: Response) => {
  if (!scrapeDoService) {
    return sendError(res, 503, 'Scrape.do service not configured', 'SERVICE_UNAVAILABLE');
  }

  const { url, render, useSuper, geoCode, customHeaders, format } = req.body;

  if (!url) {
    return sendError(res, 400, 'URL parameter is required', 'MISSING_URL');
  }

  try {
    const options = {
      url,
      render: render || false,
      super: useSuper || false,
      geoCode,
      customHeaders
    };

    if (format === 'json') {
      const data = await scrapeDoService.scrapeJSON(options);
      sendSuccess(res, data);
    } else {
      const content = await scrapeDoService.scrape(options);
      sendSuccess(res, { content, url });
    }
  } catch (error: any) {
    console.error('Scraping error:', error);
    sendError(res, 500, `Scraping failed: ${error.message}`, 'SCRAPE_ERROR');
  }
});

// Check Scrape.do credits endpoint
app.get('/scrape/credits', async (req: Request, res: Response) => {
  if (!scrapeDoService) {
    return sendError(res, 503, 'Scrape.do service not configured', 'SERVICE_UNAVAILABLE');
  }

  try {
    const credits = await scrapeDoService.checkCredits();
    sendSuccess(res, credits);
  } catch (error: any) {
    console.error('Credits check error:', error);
    sendError(res, 500, `Failed to check credits: ${error.message}`, 'CREDITS_ERROR');
  }
});

app.use((req: Request, res: Response) => {
  sendError(res, 404, 'Endpoint not found', 'NOT_FOUND');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR');
});

app.listen(PORT, () => {
  console.log(`REST API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Properties endpoint: http://localhost:${PORT}/properties`);
  if (HAS_SCRAPEDO) {
    console.log(`Scrape endpoint: POST http://localhost:${PORT}/scrape`);
    console.log(`Credits check: GET http://localhost:${PORT}/scrape/credits`);
  }
});