import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Get database URL from environment
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.warn('No DATABASE_URL found - VSL tracking will not persist');
    return null;
  }
  return url;
};

// Create database connection
let dbInstance: ReturnType<typeof drizzle> | null = null;

export const getDb = () => {
  if (dbInstance) return dbInstance;

  const url = getDatabaseUrl();
  if (!url) return null;

  const sql = neon(url);
  dbInstance = drizzle(sql);
  return dbInstance;
};
