import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.REST_API_PORT || process.env.PORT || 3002;

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
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
  
  sendSuccess(res, health);
});

app.get('/properties', validatePropertySearch, async (req: Request, res: Response) => {
  try {
    const { city, zipCode, area, priceMin, priceMax, bedrooms } = req.query;

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

    sendSuccess(res, {
      properties: filtered,
      total: filtered.length,
      source: 'mock',
      query: req.query
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    sendError(res, 500, 'Failed to search properties', 'SEARCH_ERROR');
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
});