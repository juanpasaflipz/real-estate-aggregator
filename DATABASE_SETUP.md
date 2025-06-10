# Database Setup Guide

This guide explains how to set up PostgreSQL database integration for the MCP Real Estate Server on Render.com.

## Overview

The database integration provides:
- Property data caching for improved performance
- Search history tracking
- Automatic data refresh every 6 hours
- Reduced API calls to external services

## Setup Steps

### 1. Create PostgreSQL Database on Render

1. Log in to your [Render dashboard](https://dashboard.render.com)
2. Click "New +" and select "PostgreSQL"
3. Configure your database:
   - **Name**: `real-estate-db`
   - **Database**: Leave as default or customize
   - **User**: Leave as default or customize
   - **Region**: Choose the same region as your web service
   - **PostgreSQL Version**: 15 (or latest)
   - **Plan**: Free tier is sufficient for testing
4. Click "Create Database"
5. Wait for the database to be provisioned
6. Copy the "External Database URL" from the database dashboard

### 2. Add Database URL to Environment Variables

1. Go to your web service on Render
2. Navigate to "Environment" tab
3. Add a new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the External Database URL from step 1
4. Save the changes (this will trigger a redeploy)

### 3. Run Database Migrations

After your service redeploys with the database URL:

#### Option A: Using Render Shell (Recommended)
1. In your web service dashboard, go to "Shell" tab
2. Run the migration command:
   ```bash
   npx knex migrate:latest --env production
   ```

#### Option B: Local Migration (Alternative)
1. Set the DATABASE_URL locally:
   ```bash
   export DATABASE_URL="your-render-database-url"
   ```
2. Run migrations:
   ```bash
   npx knex migrate:latest --env production
   ```

### 4. Verify Database Setup

1. Check the health endpoint:
   ```bash
   curl https://your-app.onrender.com/health
   ```
   
   You should see:
   - `"database"` in the `dataSources` array
   - `"databaseStatus": "healthy"`

2. Check database statistics:
   ```bash
   curl https://your-app.onrender.com/database/stats
   ```

## Database Features

### Automatic Caching
- Properties are automatically cached when fetched from external sources
- Cache is checked first before making external API calls
- Cached data remains active for 30 days

### Search with Cache
```bash
# Use cached data (default)
curl "https://your-app.onrender.com/properties?city=mexico%20city"

# Force fresh data (bypass cache)
curl "https://your-app.onrender.com/properties?city=mexico%20city&useCache=false"
```

### Background Refresh
- Automatically refreshes property data every 6 hours
- Covers major cities: Mexico City, Guadalajara, Monterrey, Cancun
- Runs continuously to keep data fresh

### Database Schema

The database includes these tables:

1. **properties**: Main property data
   - ID, title, price, location, bedrooms, etc.
   - Indexed for fast searching

2. **property_images**: Property images
   - Multiple images per property
   - Primary image flagged

3. **property_features**: Property features/amenities
   - Multiple features per property

4. **search_history**: Track searches
   - Search parameters and results
   - Used for analytics

## Monitoring

### Check Database Stats
```bash
GET /database/stats
```

Returns:
- Total properties
- Average prices
- Properties by source
- Recent searches

### Database Connection Issues

If you see `"databaseStatus": "error"`:

1. Verify DATABASE_URL is correct
2. Check database is active in Render dashboard
3. Ensure database allows connections from your service
4. Check logs for specific error messages

## Local Development

For local development with database:

1. Install PostgreSQL locally
2. Create a local database:
   ```bash
   createdb real_estate_dev
   ```
3. Update `.env`:
   ```
   DATABASE_URL=postgresql://localhost:5432/real_estate_dev
   ```
4. Run migrations:
   ```bash
   npx knex migrate:latest
   ```

## Maintenance

### Manual Data Refresh
To manually trigger a data refresh, restart your service on Render. The background job will start automatically.

### Database Cleanup
Old properties (not seen in 30+ days) are automatically excluded from searches but remain in the database for historical data.

## Troubleshooting

### Migration Errors
- Ensure DATABASE_URL is properly set
- Check PostgreSQL version compatibility
- Verify network connectivity

### Performance Issues
- Check database connection pool settings
- Monitor query performance in Render dashboard
- Consider upgrading database plan if needed

### Data Integrity
- Properties are uniquely identified by `external_id`
- Duplicate prevention ensures data consistency
- Updates preserve existing data while refreshing prices

## Support

For issues or questions:
1. Check Render logs for error messages
2. Verify environment variables are set correctly
3. Ensure database is accessible from your service