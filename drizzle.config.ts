import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/data/schema.ts',
	out: './database',
	driver: 'better-sqlite',
	dbCredentials: {
		url: './db/sqlite.db'
	}
});
