import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@/drizzle/schema';

const sqlite = new Database('social-card-game.db');
export const db = drizzle(sqlite, { schema });
