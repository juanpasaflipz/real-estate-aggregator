# MCP Server for Real Estate Aggregator

An MCP (Model Context Protocol) server that provides intelligent backend interface for a Mexico Real Estate Aggregator app.

## Features

- **Property Search Tool**: Search for real estate properties with various filters
- **Natural Language Processing**: Parse user queries to extract search parameters
- **TypeScript Support**: Fully typed implementation for better developer experience
- **Modular Architecture**: Clean separation of concerns with tools and utilities

## Installation

```bash
npm install
```

## Configuration

Set the backend API URL using environment variable:

```bash
export API_BASE_URL=http://localhost:3001
```

## Usage

### Build the server

```bash
npm run build
```

### Run in development mode

```bash
npm run dev
```

### Run production build

```bash
npm start
```

## MCP Tool: fetch_properties

The server exposes a single tool called `fetch_properties` with the following parameters:

- `city`: City name for property search
- `zipCode`: Zip code for property search  
- `area`: Area or neighborhood name
- `priceMin`: Minimum price in USD
- `priceMax`: Maximum price in USD
- `bedrooms`: Number of bedrooms
- `features`: List of desired features (pool, garage, garden, etc.)

## Integration with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "real-estate": {
      "command": "node",
      "args": ["/path/to/mcp-server-real-estate/dist/index.js"]
    }
  }
}
```

## API Endpoint

The server expects a backend API endpoint at:
- `GET /api/properties/search`

With query parameters matching the tool inputs.