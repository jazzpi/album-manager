import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { PRIVATE_DB_PATH } from '$env/static/private';
import * as schema from './schema';

const sqlite = new Database(PRIVATE_DB_PATH);
export default drizzle(sqlite, { schema });
