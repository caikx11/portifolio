const Database = require('better-sqlite3');

// Para PostgreSQL: use `pg`, troque AUTOINCREMENT por SERIAL e ? por $1,$2...
function openDb(file = process.env.DB_FILE || 'notes.db') {
  const db = new Database(file);
  db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')));`);
  return db;
}
module.exports = { openDb };
