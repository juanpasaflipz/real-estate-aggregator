import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { ScrapeDoService } from './services/scrapedo.js';
import { PropertyScraper } from './services/property-scraper.js';
import { DatabaseService } from './services/database.js';

dotenv.config();

const app = express();
const PORT = process.env.REST_API_PORT || process.env.PORT || 3002;

// API configurations
const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN || '';

// Determine data sources
const HAS_SCRAPEDO = SCRAPEDO_TOKEN && SCRAPEDO_TOKEN !== 'your_scrapedo_token_here';

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const HAS_DATABASE = DATABASE_URL && DATABASE_URL !== 'your_database_url_here';

// Initialize services
const scrapeDoService = HAS_SCRAPEDO ? new ScrapeDoService(SCRAPEDO_TOKEN) : null;
const propertyScraper = HAS_SCRAPEDO ? new PropertyScraper(SCRAPEDO_TOKEN) : null;
let dbService: DatabaseService | null = null;

// Initialize database if configured
if (HAS_DATABASE) {
  dbService = new DatabaseService(DATABASE_URL);
  dbService.initialize().then(() => {
    console.log('Database initialized successfully');
  }).catch((error) => {
    console.error('Database initialization error:', error);
  });
}

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

app.get('/health', async (req: Request, res: Response) => {
  const dataSources = [];
  if (HAS_SCRAPEDO) dataSources.push('pulppo');
  if (HAS_DATABASE) dataSources.push('database');
  
  let databaseStatus = 'not_configured';
  if (dbService) {
    try {
      const stats = await dbService.getPropertyStats();
      databaseStatus = 'healthy';
    } catch (error) {
      databaseStatus = 'error';
    }
  }
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    dataSources,
    servicesAvailable: {
      pulppo: HAS_SCRAPEDO,
      database: HAS_DATABASE
    },
    databaseStatus
  };
  
  sendSuccess(res, health);
});


app.get('/properties', validatePropertySearch, async (req: Request, res: Response) => {
  try {
    const { city, zipCode, area, priceMin, priceMax, bedrooms, useCache } = req.query;
    const allProperties = [];
    const sources = [];
    const errors = [];
    
    // Check database cache first (unless explicitly disabled)
    if (dbService && useCache !== 'false') {
      try {
        const cachedProperties = await dbService.searchProperties({
          city: city as string,
          priceMin: priceMin as string,
          priceMax: priceMax as string,
          bedrooms: bedrooms as string
        });
        
        if (cachedProperties.length > 0) {
          // Log the search
          await dbService.logSearch(req.query, cachedProperties.length, ['database_cache']);
          
          return sendSuccess(res, {
            properties: cachedProperties,
            total: cachedProperties.length,
            sources: ['database_cache'],
            fromCache: true,
            query: req.query
          });
        }
      } catch (error: any) {
        console.error('Database cache error:', error.message);
        errors.push({ source: 'database_cache', error: error.message });
      }
    }

    // Skip EasyBroker - only use Pulppo scraping

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
        sources.push('pulppo');
      } catch (error: any) {
        console.error('Scraping error:', error.message);
        errors.push({ source: 'scraping', error: error.message });
      }
    }

    // Remove duplicates based on title similarity
    const uniqueProperties = removeDuplicates(allProperties);
    
    // Save properties to database if available
    if (dbService && uniqueProperties.length > 0) {
      try {
        await dbService.saveProperties(uniqueProperties);
        console.log(`Saved ${uniqueProperties.length} properties to database`);
      } catch (error: any) {
        console.error('Error saving to database:', error.message);
        errors.push({ source: 'database_save', error: error.message });
      }
    }
    
    // Log search history
    if (dbService) {
      await dbService.logSearch(req.query, uniqueProperties.length, sources);
    }

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

// Database statistics endpoint
app.get('/database/stats', async (req: Request, res: Response) => {
  if (!dbService) {
    return sendError(res, 503, 'Database service not configured', 'SERVICE_UNAVAILABLE');
  }

  try {
    const stats = await dbService.getPropertyStats();
    const recentSearches = await dbService.getRecentSearches();
    
    sendSuccess(res, {
      propertyStats: stats,
      recentSearches
    });
  } catch (error: any) {
    console.error('Database stats error:', error);
    sendError(res, 500, `Failed to get database stats: ${error.message}`, 'STATS_ERROR');
  }
});

// Database explorer endpoint (for development only)
app.get('/database/explore/:table?', async (req: Request, res: Response) => {
  if (!dbService) {
    return sendError(res, 503, 'Database service not configured', 'SERVICE_UNAVAILABLE');
  }

  // Only allow in development mode for security
  if (process.env.NODE_ENV === 'production' && !req.query.debug) {
    return sendError(res, 403, 'Database explorer not available in production', 'FORBIDDEN');
  }

  try {
    const table = req.params.table || 'properties';
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    // @ts-ignore - Using raw knex methods
    const query = dbService.db(table).limit(limit).offset(offset);
    
    if (req.query.where) {
      const whereClause = JSON.parse(req.query.where as string);
      query.where(whereClause);
    }

    if (req.query.orderBy) {
      query.orderBy(req.query.orderBy as string, req.query.order as string || 'desc');
    }

    const data = await query;
    const [{ count }] = await dbService.db(table).count();

    sendSuccess(res, {
      table,
      total: parseInt(count as string),
      limit,
      offset,
      data
    });
  } catch (error: any) {
    console.error('Database explorer error:', error);
    sendError(res, 500, `Failed to explore database: ${error.message}`, 'EXPLORER_ERROR');
  }
});

// Test Vivanuncios scraping endpoint
app.get('/test/vivanuncios', async (req: Request, res: Response) => {
  if (!propertyScraper) {
    return sendError(res, 503, 'Property scraper not configured', 'SERVICE_UNAVAILABLE');
  }

  try {
    console.log('Testing Vivanuncios scraping...');
    const properties = await propertyScraper.scrapeVivanuncios({
      city: req.query.city as string || 'mexico city',
      priceMin: req.query.priceMin as string,
      priceMax: req.query.priceMax as string,
      bedrooms: req.query.bedrooms as string
    });

    sendSuccess(res, {
      source: 'vivanuncios',
      count: properties.length,
      properties: properties.slice(0, 5), // Return first 5 for testing
      testUrl: propertyScraper.buildVivanunciosUrl({
        city: req.query.city as string || 'mexico city'
      })
    });
  } catch (error: any) {
    console.error('Vivanuncios test error:', error);
    sendError(res, 500, `Vivanuncios scraping failed: ${error.message}`, 'SCRAPE_ERROR');
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
  if (HAS_DATABASE) {
    console.log(`Database stats: GET http://localhost:${PORT}/database/stats`);
  }
  if (HAS_SCRAPEDO) {
    console.log(`Scrape endpoint: POST http://localhost:${PORT}/scrape`);
    console.log(`Credits check: GET http://localhost:${PORT}/scrape/credits`);
  }
});

// Background job for refreshing property data
if (dbService && propertyScraper) {
  // Refresh data every 6 hours
  const REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  const refreshProperties = async () => {
    console.log('Starting scheduled property refresh...');
    const cities = ['mexico city', 'guadalajara', 'monterrey', 'cancun'];
    let totalUpdated = 0;
    
    for (const city of cities) {
      try {
        console.log(`Refreshing properties for ${city}...`);
        const properties = await propertyScraper.scrapeAllSources({ city });
        
        if (properties.length > 0) {
          await dbService.saveProperties(properties);
          console.log(`Updated ${properties.length} properties for ${city}`);
          totalUpdated += properties.length;
        }
      } catch (error) {
        console.error(`Error refreshing ${city}:`, error);
      }
    }
    
    console.log(`Property refresh completed. Total properties updated: ${totalUpdated}`);
  };
  
  // Run initial refresh after 1 minute
  setTimeout(refreshProperties, 60000);
  
  // Then run every 6 hours
  setInterval(refreshProperties, REFRESH_INTERVAL);
  
  console.log('Background property refresh job scheduled (every 6 hours)');
}