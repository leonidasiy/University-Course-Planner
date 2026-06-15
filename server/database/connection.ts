import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';
import { Database as DatabaseSchema } from './schema.js';

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const dbPath = path.join(dataDirectory, 'database.sqlite');

console.log(`Database path: ${dbPath}`);

const sqliteDb = new Database(dbPath);

// Enable foreign keys
sqliteDb.pragma('foreign_keys = ON');

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});

// Test connection
try {
  db.selectFrom('courses').select('id').limit(1).execute();
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Database connection failed:', error);
}