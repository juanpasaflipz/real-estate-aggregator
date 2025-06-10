import knex, { Knex } from 'knex';
import { Property } from '../types.js';

interface PropertyRecord {
  id: number;
  external_id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  property_type?: string;
  link: string;
  description?: string;
  source: string;
  created_at: Date;
  updated_at: Date;
  last_seen_at: Date;
}

export class DatabaseService {
  public db: Knex;

  constructor(databaseUrl: string) {
    this.db = knex({
      client: 'pg',
      connection: databaseUrl,
      pool: { min: 2, max: 10 }
    });
  }

  async initialize(): Promise<void> {
    // Check if tables exist, create them if they don't
    const hasPropertiesTable = await this.db.schema.hasTable('properties');
    if (!hasPropertiesTable) {
      await this.createTables();
    }
  }

  private async createTables(): Promise<void> {
    // Create properties table
    await this.db.schema.createTable('properties', (table) => {
      table.increments('id').primary();
      table.string('external_id', 255).unique().notNullable();
      table.string('title', 500).notNullable();
      table.decimal('price', 12, 2);
      table.string('currency', 10).defaultTo('MXN');
      table.string('location', 500);
      table.string('city', 255);
      table.string('state', 255);
      table.integer('bedrooms');
      table.integer('bathrooms');
      table.decimal('size', 10, 2);
      table.string('property_type', 100);
      table.text('link');
      table.text('description');
      table.string('source', 50);
      table.timestamp('created_at').defaultTo(this.db.fn.now());
      table.timestamp('updated_at').defaultTo(this.db.fn.now());
      table.timestamp('last_seen_at').defaultTo(this.db.fn.now());
      
      table.index('external_id');
      table.index('city');
      table.index('price');
      table.index('bedrooms');
      table.index('source');
      table.index('last_seen_at');
    });

    // Create property images table
    await this.db.schema.createTable('property_images', (table) => {
      table.increments('id').primary();
      table.integer('property_id').unsigned().references('id').inTable('properties').onDelete('CASCADE');
      table.text('image_url');
      table.boolean('is_primary').defaultTo(false);
      table.timestamp('created_at').defaultTo(this.db.fn.now());
      
      table.index('property_id');
    });

    // Create property features table
    await this.db.schema.createTable('property_features', (table) => {
      table.increments('id').primary();
      table.integer('property_id').unsigned().references('id').inTable('properties').onDelete('CASCADE');
      table.text('feature');
      table.timestamp('created_at').defaultTo(this.db.fn.now());
      
      table.index('property_id');
    });

    // Create search history table
    await this.db.schema.createTable('search_history', (table) => {
      table.increments('id').primary();
      table.jsonb('search_params');
      table.integer('result_count');
      table.specificType('sources', 'text[]');
      table.timestamp('created_at').defaultTo(this.db.fn.now());
      
      table.index('created_at');
    });
  }

  async saveProperties(properties: Property[]): Promise<void> {
    for (const property of properties) {
      try {
        await this.db.transaction(async (trx) => {
          // Extract city and state from location
          const locationParts = property.location?.split(',').map(part => part.trim()) || [];
          const city = locationParts[0] || property.location;
          const state = locationParts[1];

          // Insert or update property
          const [saved] = await trx('properties')
            .insert({
              external_id: property.id,
              title: property.title,
              price: property.price,
              currency: property.currency || 'MXN',
              location: property.location,
              city: city,
              state: state,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              size: property.size,
              property_type: property.propertyType,
              link: property.link,
              description: property.description,
              source: property.source,
              last_seen_at: new Date(),
              updated_at: new Date()
            })
            .onConflict('external_id')
            .merge({
              price: property.price,
              title: property.title,
              location: property.location,
              city: city,
              state: state,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              size: property.size,
              property_type: property.propertyType,
              link: property.link,
              description: property.description,
              last_seen_at: new Date(),
              updated_at: new Date()
            })
            .returning('id');

          // Save images
          if (property.images && property.images.length > 0) {
            // Delete existing images
            await trx('property_images').where('property_id', saved.id).delete();
            
            // Insert new images
            const imageRecords = property.images.map((url, index) => ({
              property_id: saved.id,
              image_url: url,
              is_primary: index === 0
            }));
            
            await trx('property_images').insert(imageRecords);
          }

          // Save features
          if (property.features && property.features.length > 0) {
            // Delete existing features
            await trx('property_features').where('property_id', saved.id).delete();
            
            // Insert new features
            const featureRecords = property.features.map(feature => ({
              property_id: saved.id,
              feature: feature
            }));
            
            await trx('property_features').insert(featureRecords);
          }
        });
      } catch (error) {
        console.error(`Error saving property ${property.id}:`, error);
      }
    }
  }

  async searchProperties(params: any): Promise<Property[]> {
    let query = this.db('properties as p')
      .select('p.*')
      .where('p.last_seen_at', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Active in last 30 days

    if (params.city) {
      query = query.whereRaw('LOWER(p.city) LIKE ?', [`%${params.city.toLowerCase()}%`]);
    }

    if (params.priceMin) {
      query = query.where('p.price', '>=', parseFloat(params.priceMin));
    }

    if (params.priceMax) {
      query = query.where('p.price', '<=', parseFloat(params.priceMax));
    }

    if (params.bedrooms) {
      query = query.where('p.bedrooms', '>=', parseInt(params.bedrooms));
    }

    const results = await query
      .orderBy('p.last_seen_at', 'desc')
      .limit(50);

    // Convert database records to Property type and fetch related data
    const properties: Property[] = [];
    
    for (const record of results) {
      // Fetch images
      const images = await this.db('property_images')
        .where('property_id', record.id)
        .orderBy('is_primary', 'desc')
        .select('image_url');
      
      // Fetch features
      const features = await this.db('property_features')
        .where('property_id', record.id)
        .select('feature');

      const property: Property = {
        id: record.external_id,
        title: record.title,
        price: parseFloat(record.price),
        currency: record.currency,
        location: record.location,
        bedrooms: record.bedrooms,
        bathrooms: record.bathrooms,
        size: record.size ? parseFloat(record.size) : undefined,
        propertyType: record.property_type,
        link: record.link,
        image: images[0]?.image_url || 'https://via.placeholder.com/300x200',
        images: images.map(img => img.image_url),
        features: features.map(f => f.feature),
        description: record.description,
        source: record.source,
        createdAt: record.created_at.toISOString()
      };

      properties.push(property);
    }

    return properties;
  }

  async logSearch(params: any, resultCount: number, sources: string[]): Promise<void> {
    try {
      await this.db('search_history').insert({
        search_params: JSON.stringify(params),
        result_count: resultCount,
        sources: sources
      });
    } catch (error) {
      console.error('Error logging search:', error);
    }
  }

  async getRecentSearches(limit: number = 10): Promise<any[]> {
    return await this.db('search_history')
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  async getPropertyStats(): Promise<any> {
    const stats = await this.db('properties')
      .select(
        this.db.raw('COUNT(*) as total_properties'),
        this.db.raw('COUNT(DISTINCT city) as total_cities'),
        this.db.raw('AVG(price) as avg_price'),
        this.db.raw('MIN(price) as min_price'),
        this.db.raw('MAX(price) as max_price')
      )
      .where('last_seen_at', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .first();

    const bySource = await this.db('properties')
      .select('source')
      .count('* as count')
      .where('last_seen_at', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .groupBy('source');

    return {
      ...stats,
      by_source: bySource
    };
  }

  async close(): Promise<void> {
    await this.db.destroy();
  }
}