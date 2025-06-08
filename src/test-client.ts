#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

async function main() {
  // Spawn the server process
  const serverProcess = spawn("tsx", ["src/index.ts"], {
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env },
  });

  // Create transport connected to the server's stdio
  const transport = new StdioClientTransport({
    command: "tsx",
    args: ["src/index.ts"],
    env: process.env as Record<string, string>,
  });

  // Create the client
  const client = new Client({
    name: "test-client",
    version: "1.0.0",
  }, {
    capabilities: {}
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.log("Connected to MCP server");

    // List available tools
    const tools = await client.listTools();
    console.log("\nAvailable tools:");
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    // Test the fetch_properties tool
    console.log("\n--- Testing fetch_properties tool ---");
    
    // Test 1: Search for properties in Mexico City under 200,000 USD
    console.log("\nTest 1: Properties in Mexico City under $200,000");
    const result1 = await client.callTool({
      name: "fetch_properties",
      arguments: {
        city: "Mexico City",
        priceMax: 200000,
        bedrooms: 2
      }
    });
    const content1 = result1.content as Array<{ type: string; text: string }>;
    console.log("Result:", JSON.parse(content1[0].text));

    // Test 2: Search with multiple filters
    console.log("\nTest 2: Properties with specific features");
    const result2 = await client.callTool({
      name: "fetch_properties",
      arguments: {
        city: "Playa del Carmen",
        priceMin: 150000,
        priceMax: 500000,
        bedrooms: 3,
        features: ["pool", "garage"]
      }
    });
    const content2 = result2.content as Array<{ type: string; text: string }>;
    console.log("Result:", JSON.parse(content2[0].text));

    // Test 3: Search by area
    console.log("\nTest 3: Properties in specific area");
    const result3 = await client.callTool({
      name: "fetch_properties",
      arguments: {
        area: "Condesa",
        priceMax: 300000
      }
    });
    const content3 = result3.content as Array<{ type: string; text: string }>;
    console.log("Result:", JSON.parse(content3[0].text));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Disconnect and cleanup
    await client.close();
    serverProcess.kill();
    process.exit(0);
  }
}

main().catch(console.error);