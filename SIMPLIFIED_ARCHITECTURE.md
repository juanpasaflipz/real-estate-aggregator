# Simplified Architecture - Pulppo Only

## Overview

The MCP Server Real Estate application has been simplified to focus exclusively on scraping properties from Pulppo.com, removing the complexity of multiple data sources that weren't meeting the application's objectives.

## Removed Components

### 1. **EasyBroker API**
- **Why removed**: Limited to staging data with only one agent's properties
- **Issue**: Appeared to show only "favorite" listings rather than full market inventory

### 2. **Vivanuncios**
- **Why removed**: Blocked by Cloudflare protection
- **Issue**: Even with premium scraping services, couldn't reliably access data

### 3. **Inmuebles24**
- **Why removed**: Also blocked by Cloudflare
- **Issue**: Similar anti-scraping measures as Vivanuncios

## Current Architecture

### Data Source
- **Pulppo.com**: The only data source
  - No Cloudflare protection
  - Accessible via Scrape.do
  - Modern Next.js application

### Technology Stack
```
Frontend Request
    ↓
REST API (Express.js)
    ↓
Property Scraper Service
    ↓
Pulppo Scraper (via Scrape.do)
    ↓
Database Cache (PostgreSQL)
```

### Key Components

1. **REST API** (`/src/rest-api-prod.ts`)
   - Endpoint: `/properties`
   - Parameters: city, priceMin, priceMax, bedrooms
   - Returns scraped properties from Pulppo

2. **Property Scraper** (`/src/services/property-scraper.ts`)
   - Simplified to only call Pulppo scraper
   - Uses Scrape.do for rendering JavaScript content

3. **Pulppo Scraper** (`/src/scrapers/pulppo-scraper.ts`)
   - Parses Pulppo's Next.js rendered content
   - Extracts property data from HTML

4. **Database** (Optional)
   - Caches scraped properties
   - Reduces API calls to Scrape.do

## Environment Variables

```bash
# Required
SCRAPEDO_TOKEN=your_token_here

# Optional
DATABASE_URL=postgresql://user:pass@host/db
SCRAPINGBEE_API_KEY=your_key_here  # Alternative scraping service
```

## API Usage

### Get Properties
```bash
GET /properties?city=mexico&priceMin=1000000&priceMax=5000000
```

### Health Check
```bash
GET /health
```

Response shows only Pulppo as data source:
```json
{
  "status": "healthy",
  "dataSources": ["pulppo", "database"],
  "servicesAvailable": {
    "pulppo": true,
    "database": true
  }
}
```

## Benefits of Simplification

1. **Focused Development**: Single data source to optimize
2. **Lower Costs**: No need for expensive proxy services
3. **Better Reliability**: Pulppo doesn't block scrapers
4. **Cleaner Code**: Removed unused integrations
5. **Easier Maintenance**: Less complexity to manage

## Future Considerations

1. **Direct API Access**: Monitor Pulppo for API endpoints
2. **Enhanced Scraping**: Implement Puppeteer for better JS rendering
3. **Data Quality**: Focus on improving Pulppo data extraction
4. **Scaling**: Add more Mexican real estate sites without anti-scraping measures