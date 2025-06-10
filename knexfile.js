import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'real_estate_dev',
      user: 'postgres',
      password: 'postgres'
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      extension: 'js'
    }
  }
};