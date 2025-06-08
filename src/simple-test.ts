#!/usr/bin/env node
import axios from "axios";
import { Property } from "./types.js";

async function testAPI() {
  const baseURL = "http://localhost:3001";
  
  console.log("Testing Real Estate API...\n");
  
  try {
    // Test 1: Basic search
    console.log("Test 1: Search properties in Mexico City under $200,000");
    const response1 = await axios.get(`${baseURL}/api/properties/search`, {
      params: {
        city: "Mexico City",
        priceMax: 200000,
        bedrooms: 2
      }
    });
    console.log(`Found ${response1.data.total} properties:`);
    response1.data.properties.forEach((p: Property) => {
      console.log(`- ${p.title} - $${p.price.toLocaleString()}`);
    });
    
    // Test 2: Search with features
    console.log("\n\nTest 2: Search properties with pool");
    const response2 = await axios.get(`${baseURL}/api/properties/search`, {
      params: {
        priceMin: 150000,
        priceMax: 500000,
        features: "pool"
      }
    });
    console.log(`Found ${response2.data.total} properties:`);
    response2.data.properties.forEach((p: Property) => {
      console.log(`- ${p.title} - $${p.price.toLocaleString()}`);
    });
    
    // Test 3: Search by area
    console.log("\n\nTest 3: Search properties in Condesa");
    const response3 = await axios.get(`${baseURL}/api/properties/search`, {
      params: {
        area: "Condesa"
      }
    });
    console.log(`Found ${response3.data.total} properties:`);
    response3.data.properties.forEach((p: Property) => {
      console.log(`- ${p.title} - $${p.price.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Check if mock API is running
async function checkAPI() {
  try {
    await axios.get("http://localhost:3001/api/properties/search");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const isRunning = await checkAPI();
  
  if (!isRunning) {
    console.log("Mock API is not running!");
    console.log("Please run 'npm run mock-api' in another terminal first.");
    process.exit(1);
  }
  
  await testAPI();
}

main().catch(console.error);