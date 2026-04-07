import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL must be defined in the environment');
}

const pool = new Pool({
  connectionString,
  max: 5,
});

export const db = drizzle(pool);
