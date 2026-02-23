import { defineConfig } from 'drizzle-kit';

console.log(
  'Drizzle config loaded with DATABASE_URL:',
  process.env.DATABASE_URL,
);

export default defineConfig({
  out: './drizzle',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
