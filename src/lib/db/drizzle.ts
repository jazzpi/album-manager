import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export function getDB(db_path: string) {
	const sqlite = new Database(db_path);
	return drizzle(sqlite, { schema });
}
