import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schemaFilter: ['specification'],
  out: 'lib/schema',
  dialect: 'postgresql',
  introspect: {
    casing: 'preserve',
  },
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
