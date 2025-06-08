# Real Estate REST API Documentation

## Overview
This REST API provides access to real estate property data in Mexico, built on top of an MCP (Model Control Protocol) server for intelligent data processing and caching.

## Base URL
```
http://localhost:3000
```

## Response Format
All responses follow a consistent JSON structure:

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "meta": { ... }  // Optional metadata
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"  // Optional error code
}
```

## Endpoints

### Health Check
Check the API and MCP server status.

```
GET /health
```

#### Response Example
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "mcpConnection": "connected"
  }
}
```

---

### Search Properties
Search for properties based on various filters.

```
GET /properties
```

#### Query Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| city | string | City name | `MexicoCity` |
| zipCode | string | Zip code | `11000` |
| area | string | Area or neighborhood | `Polanco` |
| priceMin | number | Minimum price in USD | `100000` |
| priceMax | number | Maximum price in USD | `500000` |
| bedrooms | number | Number of bedrooms | `3` |
| features | string | Comma-separated features | `pool,garage,garden` |

#### Request Example
```
GET /properties?city=MexicoCity&priceMin=200000&priceMax=500000&bedrooms=3
```

#### Response Example
```json
{
  "status": "success",
  "data": [
    {
      "id": "123",
      "title": "Luxury Apartment in Polanco",
      "price": 450000,
      "location": "Polanco, Mexico City",
      "bedrooms": 3,
      "link": "https://example.com/property/123",
      "image": "https://example.com/images/123.jpg"
    },
    {
      "id": "456",
      "title": "Modern Condo in Roma Norte",
      "price": 320000,
      "location": "Roma Norte, Mexico City",
      "bedrooms": 3,
      "link": "https://example.com/property/456",
      "image": "https://example.com/images/456.jpg"
    }
  ],
  "meta": {
    "total": 25,
    "filters": {
      "city": "MexicoCity",
      "priceMin": 200000,
      "priceMax": 500000,
      "bedrooms": 3
    }
  }
}
```

#### Error Responses
- `400 Bad Request` - Invalid query parameters
- `503 Service Unavailable` - MCP server not available

---

### Get Property Details
Get detailed information about a specific property.

```
GET /properties/{propertyId}
```

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| propertyId | string | Unique property identifier |

#### Response Example
```json
{
  "status": "error",
  "message": "Property detail endpoint not implemented yet",
  "code": "NOT_IMPLEMENTED"
}
```

*Note: This endpoint is planned but not yet implemented.*

---

### Save User Preferences
Save user search preferences for personalized experiences.

```
POST /user/preferences
```

#### Request Body
```json
{
  "preferences": {
    "cities": ["MexicoCity", "Guadalajara"],
    "priceRange": {
      "min": 200000,
      "max": 600000
    },
    "propertyTypes": ["apartment", "house"],
    "minBedrooms": 2,
    "features": ["pool", "garage"]
  }
}
```

#### Response Example
```json
{
  "status": "success",
  "data": {
    "message": "Preferences saved successfully",
    "preferences": { ... }
  }
}
```

#### Error Responses
- `400 Bad Request` - Invalid preferences object
- `503 Service Unavailable` - MCP server not available

---

## Error Codes
| Code | Description |
|------|-------------|
| INVALID_PRICE_MIN | Invalid minimum price parameter |
| INVALID_PRICE_MAX | Invalid maximum price parameter |
| INVALID_BEDROOMS | Invalid bedrooms parameter |
| INVALID_PRICE_RANGE | Minimum price greater than maximum price |
| INVALID_PREFERENCES | Invalid preferences object in request body |
| SERVICE_UNAVAILABLE | MCP server is not available |
| NOT_IMPLEMENTED | Feature not yet implemented |
| NOT_FOUND | Endpoint not found |
| INTERNAL_ERROR | Internal server error |
| MCP_ERROR | Error from MCP server |

## Rate Limiting
Currently, no rate limiting is implemented. This may be added in future versions.

## Authentication
Currently, no authentication is required. This may be added in future versions.

## CORS
CORS headers are not currently configured. Add appropriate CORS middleware for production use.