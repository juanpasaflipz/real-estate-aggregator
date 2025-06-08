#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fetchProperties } from "./tools/fetchProperties.js";
import { PropertySearchParams } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

const server = new Server(
  {
    name: "real-estate-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_properties",
        description: "Search for real estate properties in Mexico based on various filters",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "City name for property search",
            },
            zipCode: {
              type: "string",
              description: "Zip code for property search",
            },
            area: {
              type: "string",
              description: "Area or neighborhood name",
            },
            priceMin: {
              type: "number",
              description: "Minimum price in USD",
            },
            priceMax: {
              type: "number",
              description: "Maximum price in USD",
            },
            bedrooms: {
              type: "number",
              description: "Number of bedrooms",
            },
            features: {
              type: "array",
              items: {
                type: "string",
              },
              description: "List of desired features (pool, garage, garden, etc.)",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "fetch_properties") {
    const args = request.params.arguments as PropertySearchParams;
    
    try {
      const result = await fetchProperties(args);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching properties: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  }
  
  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Real Estate MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});