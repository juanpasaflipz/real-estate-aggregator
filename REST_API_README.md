# REST API for MCP Real Estate Server

This REST API provides a standard HTTP interface to access the MCP (Model Control Protocol) server functionality, making it easy to integrate with web, mobile, and desktop applications.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Start the Mock API Server (for testing)
```bash
npm run mock-api
```

### 4. Start the REST API Server
```bash
npm run rest-api
```

Or for development with auto-reload:
```bash
npm run rest-api:dev
```

### 5. Test the API
```bash
npm run test-rest
```

## Architecture

```
Frontend Client (Web/Mobile/Desktop)
           ↓
    REST API Layer (Express.js)
           ↓
    MCP Client Connection
           ↓
    MCP Server (AI-powered backend)
           ↓
    External Real Estate APIs
```

## Key Features

- **RESTful Design**: Standard HTTP methods and status codes
- **JSON Responses**: Consistent response format for all endpoints
- **Error Handling**: Comprehensive error handling with meaningful error codes
- **Validation**: Input validation for all query parameters
- **CORS Support**: Ready for cross-origin requests from web frontends
- **MCP Integration**: Seamless integration with the MCP server for intelligent data processing

## Available Endpoints

- `GET /health` - Check API and MCP server status
- `GET /properties` - Search properties with filters
- `GET /properties/:id` - Get property details (planned)
- `POST /user/preferences` - Save user preferences

## Environment Variables

Create a `.env` file in the project root:

```env
REST_API_PORT=3000
API_BASE_URL=http://localhost:3001
```

## Example Usage

### Search Properties in Mexico City
```bash
curl "http://localhost:3000/properties?city=MexicoCity&priceMin=200000&priceMax=500000"
```

### Save User Preferences
```bash
curl -X POST http://localhost:3000/user/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "cities": ["MexicoCity", "Guadalajara"],
      "priceRange": {"min": 200000, "max": 600000}
    }
  }'
```

## Development

The REST API automatically connects to the MCP server when started. The MCP server handles:
- Intelligent query processing
- Data caching and optimization
- Complex property searches
- Integration with external real estate APIs

## Next Steps

1. Implement authentication and authorization
2. Add rate limiting for production use
3. Implement the property details endpoint
4. Add support for saving searches and alerts
5. Implement property comparison features

## Troubleshooting

If you encounter connection issues:
1. Ensure the MCP server code is built (`npm run build`)
2. Check that all dependencies are installed
3. Verify the mock API is running if testing locally
4. Check the console for detailed error messages

For more details, see the [API Documentation](./API_DOCUMENTATION.md).