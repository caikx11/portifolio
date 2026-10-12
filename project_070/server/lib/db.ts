import Database from 'better-sqlite3';

// Para PostgreSQL: troque por `pg`/Prisma. O esquema abaixo vira uma migration (SERIAL no lugar de AUTOINCREMENT).
export function createDb(file: string): Database.Database {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL, published INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`);
  return db;
}

const g = globalThis as unknown as { __db?: Database.Database };
export function getDb(): Database.Database {
  return (g.__db ??= createDb(process.env.DB_FILE || 'blog.db'));
}
