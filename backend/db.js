const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "flickpick.db");
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create watched table
db.exec(`
  CREATE TABLE IF NOT EXISTS watched (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL UNIQUE,
    poster     TEXT,
    tmdbRating REAL,
    userRating REAL    NOT NULL,
    genres     TEXT,
    director   TEXT,
    actors     TEXT,
    overview   TEXT,
    runtime    TEXT,
    isAdult    INTEGER DEFAULT 0,
    type       TEXT    DEFAULT 'movie',
    watchedAt  TEXT    DEFAULT (datetime('now'))
  )
`);

// Migration: add type column if it doesn't exist (for existing DBs)
try {
  db.exec(`ALTER TABLE watched ADD COLUMN type TEXT DEFAULT 'movie'`);
} catch {
  // Column already exists — ignore
}

module.exports = db;

