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
    id: "MOCK-1",
    title: "Modern Condo in Polanco",
    price: 180000,
    currency: "USD",
    location: "Polanco, Mexico City",
    bedrooms: 2,
    bathrooms: 2,
    size: 120,
    propertyType: "Condo",
    link: "https://example.com/property-1",
    image: "https://example.com/images/1-1.jpg",
    images: [
      "https://example.com/images/1-1.jpg",
      "https://example.com/images/1-2.jpg",
      "https://example.com/images/1-3.jpg"
    ],
    features: ["Gym", "Security", "Parking"],
    description: "Beautiful modern condo with city views",
    source: "mock",
    createdAt: new Date().toISOString()
  },
  {
    id: "MOCK-2",
    title: "Beach House in Playa del Carmen",
    price: 350000,
    currency: "USD",
    location: "Playa del Carmen, Quintana Roo",
    bedrooms: 3,
    bathrooms: 3,
    size: 250,
    propertyType: "House",
    link: "https://example.com/property-2",
    image: "https://example.com/images/2-1.jpg",
    images: [
      "https://example.com/images/2-1.jpg",
      "https://example.com/images/2-2.jpg",
      "https://example.com/images/2-3.jpg",
      "https://example.com/images/2-4.jpg"
    ],
    features: ["Beach Access", "Pool", "Garden"],
    description: "Stunning beachfront property with private access",
    source: "mock",
    createdAt: new Date().toISOString()
  },
  {
    id: "MOCK-3",
    title: "Colonial Home in San Miguel",
    price: 425000,
    currency: "USD",
    location: "San Miguel de Allende, Guanajuato",
    bedrooms: 4,
    bathrooms: 3,
    size: 300,
    propertyType: "House",
    link: "https://example.com/property-3",
    image: "https://example.com/images/3-1.jpg",
    images: [
      "https://example.com/images/3-1.jpg",
      "https://example.com/images/3-2.jpg",
      "https://example.com/images/3-3.jpg"
    ],
    features: ["Garden", "Terrace", "Fireplace"],
    description: "Historic colonial home in the heart of San Miguel",
    source: "mock",
    createdAt: new Date().toISOString()
  },
  {
    id: "MOCK-4",
    title: "Apartment in Condesa",
    price: 150000,
    currency: "USD",
    location: "Condesa, Mexico City",
    bedrooms: 1,
    bathrooms: 1,
    size: 65,
    propertyType: "Apartment",
    link: "https://example.com/property-4",
    image: "https://example.com/images/4-1.jpg",
    images: [
      "https://example.com/images/4-1.jpg",
      "https://example.com/images/4-2.jpg"
    ],
    features: ["Balcony", "Parking"],
    description: "Cozy apartment in trendy Condesa neighborhood",
    source: "mock",
    createdAt: new Date().toISOString()
  },
  {
    id: "MOCK-5",
    title: "Luxury Villa with Pool",
    price: 450000,
    currency: "USD",
    location: "Playa del Carmen, Quintana Roo",
    bedrooms: 3,
    bathrooms: 4,
    size: 280,
    propertyType: "Villa",
    link: "https://example.com/property-5",
    image: "https://example.com/images/5-1.jpg",
    images: [
      "https://example.com/images/5-1.jpg",
      "https://example.com/images/5-2.jpg",
      "https://example.com/images/5-3.jpg",
      "https://example.com/images/5-4.jpg",
      "https://example.com/images/5-5.jpg"
    ],
    features: ["Pool", "Jacuzzi", "BBQ Area", "Security"],
    description: "Exclusive villa with all luxury amenities",
    source: "mock",
    createdAt: new Date().toISOString()
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