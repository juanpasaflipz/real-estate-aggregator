export interface PropertySearchParams {
  city?: string;
  zipCode?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  sizeMin?: number;
  sizeMax?: number;
  propertyType?: string;
  features?: string[];
  sortBy?: 'price' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Property {
  id?: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  bedrooms: number;
  bathrooms?: number;
  size?: number;
  propertyType?: string;
  link: string;
  image?: string;
  images?: string[];
  features?: string[];
  description?: string;
  source?: string;
  createdAt?: string;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  filters: PropertySearchParams;
}