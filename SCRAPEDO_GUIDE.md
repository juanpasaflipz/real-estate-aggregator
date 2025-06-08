# 🔧 Scrape.do Integration Guide

This API now includes Scrape.do integration for general web scraping capabilities.

## Prerequisites

1. Sign up for a Scrape.do account at [scrape.do](https://scrape.do)
2. Get your API token from the dashboard
3. Add the token to your environment variables

## Configuration

Add your Scrape.do token to your `.env` file or Render environment variables:

```
SCRAPEDO_TOKEN=your_actual_token_here
```

## Available Endpoints

### 1. Scrape Any URL

**Endpoint:** `POST /scrape`

**Request Body:**
```json
{
  "url": "https://example.com",
  "render": false,        // Optional: Use headless browser (costs more credits)
  "useSuper": false,      // Optional: Use residential/mobile proxies (costs more)
  "geoCode": "us",        // Optional: Country code for geo-targeting
  "format": "html",       // Optional: "html" or "json"
  "customHeaders": {      // Optional: Custom headers
    "Accept-Language": "es-MX"
  }
}
```

**Example - Scrape HTML:**
```bash
curl -X POST https://your-api.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com",
    "useSuper": true,
    "geoCode": "mx"
  }'
```

**Example - Scrape JSON API:**
```bash
curl -X POST https://your-api.onrender.com/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://api.example.com/data",
    "format": "json"
  }'
```

### 2. Check API Credits

**Endpoint:** `GET /scrape/credits`

**Example:**
```bash
curl https://your-api.onrender.com/scrape/credits
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "remainingCredits": 9500,
    "usedCredits": 500,
    "totalCredits": 10000
  }
}
```

## Scrape.do Features

1. **Anti-Bot Protection Bypass**: Automatically handles Cloudflare, reCAPTCHA, etc.
2. **Proxy Options**:
   - Datacenter proxies (default, 1 credit per request)
   - Residential/Mobile proxies (10 credits per request)
3. **Headless Browser**: JavaScript rendering (25 credits per request)
4. **Geo-Targeting**: Target specific countries

## Credit Usage

- Basic request (datacenter proxy): 1 credit
- With `useSuper: true` (residential proxy): 10 credits
- With `render: true` (headless browser): 25 credits
- Failed requests: No credits charged

## Use Cases

1. **Scrape Real Estate Listings:**
```json
{
  "url": "https://www.vivanuncios.com.mx/s-venta-inmuebles/ciudad-de-mexico/v1c1097l11518p1",
  "useSuper": true,
  "render": true,
  "geoCode": "mx"
}
```

2. **Scrape API Data:**
```json
{
  "url": "https://api.mercadolibre.com/sites/MLM/search?category=MLM1459",
  "format": "json"
}
```

3. **Scrape with Custom Headers:**
```json
{
  "url": "https://example.com/data",
  "customHeaders": {
    "Authorization": "Bearer token",
    "User-Agent": "MyApp/1.0"
  }
}
```

## Error Handling

The API returns structured error responses:

```json
{
  "status": "error",
  "message": "Scraping failed: 403 Forbidden",
  "code": "SCRAPE_ERROR"
}
```

## Rate Limits

- Scrape.do: 20 requests per second
- Consider implementing caching for frequently scraped URLs
- Monitor your credit usage with the `/scrape/credits` endpoint

## Security Notes

- Never expose your Scrape.do token in client-side code
- Use this API as a proxy to keep your token secure
- Consider implementing authentication for your API endpoints