import express, { Request, Response, NextFunction } from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.REST_API_PORT || 3000;

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

let mcpClient: Client | null = null;

async function initializeMCPClient() {
  try {
    const serverPath = path.join(__dirname, 'index.js');
    
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', path.join(__dirname, 'index.ts')],
      env: {
        ...process.env,
        API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3003'
      } as Record<string, string>
    });

    mcpClient = new Client({
      name: 'rest-api-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    await mcpClient.connect(transport);
    console.log('Connected to MCP server');
  } catch (error) {
    console.error('Failed to connect to MCP server:', error);
    throw error;
  }
}

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}

interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

function sendError(res: Response, statusCode: number, message: string, code?: string): void {
  const response: ErrorResponse = {
    status: 'error',
    message,
    code
  };
  res.status(statusCode).json(response);
}

function sendSuccess<T>(res: Response, data: T, meta?: any): void {
  const response: SuccessResponse<T> = {
    status: 'success',
    data,
    meta
  };
  res.json(response);
}

const validatePropertySearch = (req: Request, res: Response, next: NextFunction) => {
  const { city, zipCode, priceMin, priceMax, bedrooms } = req.query;

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
    status: mcpClient ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    mcpConnection: mcpClient ? 'connected' : 'disconnected'
  };
  
  if (mcpClient) {
    sendSuccess(res, health);
  } else {
    res.status(503).json({
      status: 'error',
      message: 'MCP server not connected',
      data: health
    });
  }
});

app.get('/properties', validatePropertySearch, async (req: Request, res: Response) => {
  if (!mcpClient) {
    return sendError(res, 503, 'MCP server not available', 'SERVICE_UNAVAILABLE');
  }

  try {
    const { city, zipCode, area, priceMin, priceMax, bedrooms, features } = req.query;

    const params: any = {};
    if (city) params.city = String(city);
    if (zipCode) params.zipCode = String(zipCode);
    if (area) params.area = String(area);
    if (priceMin) params.priceMin = Number(priceMin);
    if (priceMax) params.priceMax = Number(priceMax);
    if (bedrooms) params.bedrooms = Number(bedrooms);
    if (features) {
      params.features = String(features).split(',').map(f => f.trim());
    }

    console.log('Calling MCP tool with params:', params);
    const result = await mcpClient.callTool({
      name: 'fetch_properties',
      arguments: params
    });
    
    console.log('MCP result:', result);
    
    if (result.isError) {
      console.error('MCP error:', result);
      return sendError(res, 500, 'Failed to fetch properties from MCP server', 'MCP_ERROR');
    }

    const content = result.content as Array<{ type: string; text: string }>;
    const data = JSON.parse(content[0].text);
    
    sendSuccess(res, data.properties, {
      total: data.total,
      filters: data.filters
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR');
  }
});

app.get('/properties/:propertyId', async (req: Request, res: Response) => {
  if (!mcpClient) {
    return sendError(res, 503, 'MCP server not available', 'SERVICE_UNAVAILABLE');
  }

  const { propertyId } = req.params;

  sendError(res, 501, 'Property detail endpoint not implemented yet', 'NOT_IMPLEMENTED');
});

app.post('/user/preferences', async (req: Request, res: Response) => {
  if (!mcpClient) {
    return sendError(res, 503, 'MCP server not available', 'SERVICE_UNAVAILABLE');
  }

  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    return sendError(res, 400, 'Invalid preferences object', 'INVALID_PREFERENCES');
  }

  sendSuccess(res, {
    message: 'Preferences saved successfully',
    preferences
  });
});

app.use((req: Request, res: Response) => {
  sendError(res, 404, 'Endpoint not found', 'NOT_FOUND');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  sendError(res, 500, 'Internal server error', 'INTERNAL_ERROR');
});

async function startServer() {
  try {
    await initializeMCPClient();
    
    app.listen(PORT, () => {
      console.log(`REST API server running on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('  GET  /health');
      console.log('  GET  /properties');
      console.log('  GET  /properties/:propertyId');
      console.log('  POST /user/preferences');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});