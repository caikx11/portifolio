const Database = require('better-sqlite3');

// Para PostgreSQL: troque por `pg` (Pool) e use placeholders $1,$2; o SQL abaixo é quase idêntico.
function openDb(file = process.env.DB_FILE || 'links.db') {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      slug TEXT PRIMARY KEY, url TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL REFERENCES links(slug) ON DELETE CASCADE,
      at TEXT NOT NULL DEFAULT (datetime('now')), referrer TEXT);
    CREATE INDEX IF NOT EXISTS idx_clicks_slug ON clicks(slug);`);
  db.pragma('foreign_keys = ON');
  return db;
}
module.exports = { openDb };
