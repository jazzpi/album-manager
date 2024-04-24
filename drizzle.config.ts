import type { Config } from 'drizzle-kit';
import 'dotenv/config';

const db_path = process.env.PRIVATE_DB_PATH;
if (db_path === undefined) {
	throw Error('PRIVATE_DB_PATH is not defined in .env');
}

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	dbCredentials: {
		url: db_path
	}
} satisfies Config;
