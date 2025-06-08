export interface PropertySearchParams {
  city?: string;
  zipCode?: string;
  area?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  features?: string[];
}

export interface Property {
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  link: string;
  image: string;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  filters: PropertySearchParams;
}