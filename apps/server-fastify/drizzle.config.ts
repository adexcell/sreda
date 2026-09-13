import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig ({
	schema: './src/db/schema.ts',
	out: './drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'postgresql://sreda_user:sreda_password@localhost:5432/sreda_db',
	},
	verbose: true,
	strict: true,
});
