export function up(knex) {
  return knex.schema
    // Create properties table
    .createTable('properties', (table) => {
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
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.timestamp('last_seen_at').defaultTo(knex.fn.now());
      
      // Indexes for performance
      table.index('external_id');
      table.index('city');
      table.index('price');
      table.index('bedrooms');
      table.index('source');
      table.index('last_seen_at');
    })
    // Create property images table
    .createTable('property_images', (table) => {
      table.increments('id').primary();
      table.integer('property_id').unsigned().references('id').inTable('properties').onDelete('CASCADE');
      table.text('image_url');
      table.boolean('is_primary').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('property_id');
      table.index(['property_id', 'is_primary']);
    })
    // Create property features table
    .createTable('property_features', (table) => {
      table.increments('id').primary();
      table.integer('property_id').unsigned().references('id').inTable('properties').onDelete('CASCADE');
      table.text('feature');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('property_id');
    })
    // Create search history table
    .createTable('search_history', (table) => {
      table.increments('id').primary();
      table.jsonb('search_params');
      table.integer('result_count');
      table.specificType('sources', 'text[]');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('created_at');
    });
};

export function down(knex) {
  return knex.schema
    .dropTableIfExists('search_history')
    .dropTableIfExists('property_features')
    .dropTableIfExists('property_images')
    .dropTableIfExists('properties');
};