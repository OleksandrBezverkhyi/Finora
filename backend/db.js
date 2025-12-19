import Database from 'better-sqlite3';

const db = new Database('finora.db');

db.prepare(
  `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
`,
).run();

export default db;
