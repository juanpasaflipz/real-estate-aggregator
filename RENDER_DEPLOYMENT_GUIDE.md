# Render.com Deployment Guide for Real Estate API

## Prerequisites
- Active Scrape.do account with API token
- EasyBroker API key (optional)
- GitHub repository connected to Render

## Environment Variables to Set on Render

1. Go to your Render dashboard
2. Select your web service (real-estate-api-7mln)
3. Navigate to "Environment" tab
4. Add these environment variables:

### Required Variables
```
SCRAPEDO_TOKEN=your_actual_scrapedo_token_here
PORT=10000
```

### Optional Variables
```
EASYBROKER_API_KEY=your_easybroker_api_key_here
```

## Build & Start Commands

Ensure these are set in your Render service settings:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

## Verifying Deployment

After deployment, test these endpoints:

1. **Health Check**:
   ```bash
   curl https://real-estate-api-7mln.onrender.com/health
   ```
   Should show `"scrapedo": true` in servicesAvailable

2. **Test Scraping**:
   ```bash
   curl "https://real-estate-api-7mln.onrender.com/properties?city=monterrey&includeScraped=true"
   ```
   Should return properties from multiple sources including vivanuncios

3. **Check Credits** (if token is valid):
   ```bash
   curl https://real-estate-api-7mln.onrender.com/scrape/credits
   ```

## Troubleshooting

### Issue: No Vivanuncios Data
- **Cause**: Scrape.do token not set or invalid
- **Fix**: Double-check SCRAPEDO_TOKEN in Render environment variables
- **Verify**: Check Render logs for "Scraping error:" messages

### Issue: 403 Error on Credits Check
- **Cause**: Invalid or expired Scrape.do token
- **Fix**: Generate new token from Scrape.do dashboard and update on Render

### Issue: Wrong API Running
- **Cause**: Using wrong start command
- **Fix**: Ensure start command is `npm run start:prod` not `npm start`

## Testing Locally First

Before deploying, test with your tokens locally:

1. Create `.env.local` file:
   ```
   SCRAPEDO_TOKEN=your_actual_token
   EASYBROKER_API_KEY=your_actual_key
   PORT=3002
   ```

2. Run production API locally:
   ```bash
   npm run build
   npm run start:prod
   ```

3. Test endpoints locally at http://localhost:3002

## Important Notes

- The production API (`rest-api-prod.ts`) has direct Scrape.do integration
- It does NOT require the MCP server architecture
- Scraping is only activated when valid SCRAPEDO_TOKEN is provided
- Without valid tokens, the API returns mock data