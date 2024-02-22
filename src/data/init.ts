import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import Database from 'better-sqlite3';

// Creating a new SQLite database instance
export const sqlite = new Database('./db/sqlite.db', { verbose: console.log });

export const db = drizzle(sqlite, { schema });
