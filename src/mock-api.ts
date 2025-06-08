#!/usr/bin/env node
import express from "express";
import { Property } from "./types.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.MOCK_API_PORT || 3001;

// Mock property data
const mockProperties: Property[] = [
  {
    title: "Modern Condo in Polanco",
    price: 180000,
    location: "Polanco, Mexico City",
    bedrooms: 2,
    link: "https://example.com/property-1",
    image: "https://example.com/images/1.jpg"
  },
  {
    title: "Beach House in Playa del Carmen",
    price: 350000,
    location: "Playa del Carmen, Quintana Roo",
    bedrooms: 3,
    link: "https://example.com/property-2",
    image: "https://example.com/images/2.jpg"
  },
  {
    title: "Colonial Home in San Miguel",
    price: 425000,
    location: "San Miguel de Allende, Guanajuato",
    bedrooms: 4,
    link: "https://example.com/property-3",
    image: "https://example.com/images/3.jpg"
  },
  {
    title: "Apartment in Condesa",
    price: 150000,
    location: "Condesa, Mexico City",
    bedrooms: 1,
    link: "https://example.com/property-4",
    image: "https://example.com/images/4.jpg"
  },
  {
    title: "Luxury Villa with Pool",
    price: 450000,
    location: "Playa del Carmen, Quintana Roo",
    bedrooms: 3,
    link: "https://example.com/property-5",
    image: "https://example.com/images/5.jpg"
  }
];

// API endpoint
app.get("/api/properties/search", (req, res) => {
  console.log("Received search request with params:", req.query);
  
  let filtered = [...mockProperties];
  
  // Apply filters
  if (req.query.city) {
    const city = req.query.city.toString().toLowerCase();
    filtered = filtered.filter(p => 
      p.location.toLowerCase().includes(city)
    );
  }
  
  if (req.query.area) {
    const area = req.query.area.toString().toLowerCase();
    filtered = filtered.filter(p => 
      p.location.toLowerCase().includes(area)
    );
  }
  
  if (req.query.priceMin) {
    const min = parseInt(req.query.priceMin.toString());
    filtered = filtered.filter(p => p.price >= min);
  }
  
  if (req.query.priceMax) {
    const max = parseInt(req.query.priceMax.toString());
    filtered = filtered.filter(p => p.price <= max);
  }
  
  if (req.query.bedrooms) {
    const beds = parseInt(req.query.bedrooms.toString());
    filtered = filtered.filter(p => p.bedrooms === beds);
  }
  
  if (req.query.features) {
    const features = req.query.features.toString().split(",");
    // For mock, just filter properties with "pool" in title
    if (features.includes("pool")) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes("pool")
      );
    }
  }
  
  res.json({
    properties: filtered,
    total: filtered.length
  });
});

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log("Endpoint: GET /api/properties/search");
});