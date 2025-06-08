import axios from "axios";
import { PropertySearchParams, SearchResult } from "../types.js";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export async function fetchProperties(params: PropertySearchParams): Promise<SearchResult> {
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