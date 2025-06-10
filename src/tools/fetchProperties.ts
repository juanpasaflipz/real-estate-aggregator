import axios from "axios";
import { PropertySearchParams, SearchResult } from "../types.js";
import { PropertyScraper } from "../services/property-scraper.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";
const SCRAPEDO_TOKEN = process.env.SCRAPEDO_TOKEN;

export async function fetchProperties(params: PropertySearchParams): Promise<SearchResult> {
  // If we have a Scrape.do token, use real scraping
  if (SCRAPEDO_TOKEN) {
    try {
      const scraper = new PropertyScraper(SCRAPEDO_TOKEN);
      
      // Convert params to scraper format
      const scraperParams = {
        city: params.city,
        priceMin: params.priceMin?.toString(),
        priceMax: params.priceMax?.toString(),
        bedrooms: params.bedrooms?.toString()
      };
      
      const properties = await scraper.scrapeAllSources(scraperParams);
      
      // Apply additional filters that scraper doesn't handle
      let filtered = properties;
      
      if (params.zipCode) {
        filtered = filtered.filter(p => 
          p.location.toLowerCase().includes(params.zipCode!.toLowerCase())
        );
      }
      
      if (params.area) {
        filtered = filtered.filter(p => 
          p.location.toLowerCase().includes(params.area!.toLowerCase())
        );
      }
      
      if (params.features && params.features.length > 0) {
        filtered = filtered.filter(p => 
          params.features!.some(feature => 
            p.features?.some(f => f.toLowerCase().includes(feature.toLowerCase())) ||
            p.title.toLowerCase().includes(feature.toLowerCase()) ||
            p.description?.toLowerCase().includes(feature.toLowerCase())
          )
        );
      }
      
      if (params.bathrooms) {
        filtered = filtered.filter(p => p.bathrooms === params.bathrooms);
      }
      
      if (params.sizeMin) {
        filtered = filtered.filter(p => p.size && p.size >= params.sizeMin!);
      }
      
      if (params.sizeMax) {
        filtered = filtered.filter(p => p.size && p.size <= params.sizeMax!);
      }
      
      if (params.propertyType) {
        filtered = filtered.filter(p => 
          p.propertyType?.toLowerCase().includes(params.propertyType!.toLowerCase())
        );
      }
      
      // Apply sorting
      if (params.sortBy) {
        filtered.sort((a, b) => {
          let compareValue = 0;
          switch (params.sortBy) {
            case 'price':
              compareValue = (a.price || 0) - (b.price || 0);
              break;
            case 'date':
              compareValue = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
              break;
            case 'size':
              compareValue = (a.size || 0) - (b.size || 0);
              break;
          }
          return params.sortOrder === 'desc' ? -compareValue : compareValue;
        });
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedProperties = filtered.slice(startIndex, startIndex + limit);
      
      return {
        properties: paginatedProperties,
        total: filtered.length,
        filters: params,
      };
    } catch (error) {
      console.error("Scraping failed, falling back to mock API:", error);
      // Fall through to mock API
    }
  }
  
  // Fallback to mock API
  try {
    const queryParams = new URLSearchParams();
    
    if (params.city) queryParams.append("city", params.city);
    if (params.zipCode) queryParams.append("zipCode", params.zipCode);
    if (params.area) queryParams.append("area", params.area);
    if (params.priceMin !== undefined) queryParams.append("priceMin", params.priceMin.toString());
    if (params.priceMax !== undefined) queryParams.append("priceMax", params.priceMax.toString());
    if (params.bedrooms !== undefined) queryParams.append("bedrooms", params.bedrooms.toString());
    if (params.features && params.features.length > 0) {
      queryParams.append("features", params.features.join(","));
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/properties/search?${queryParams.toString()}`);
    
    return {
      properties: response.data.properties || [],
      total: response.data.total || 0,
      filters: params,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API request failed: ${error.message}`);
    }
    throw error;
  }
}