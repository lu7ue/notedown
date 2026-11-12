import Database from "better-sqlite3";

export type Db = Database.Database;

export function openDb(dbFilePath: string): Db {
  // open the database file, creating one if it doesn't exist
  const db = new Database(dbFilePath);

  // create the notes table if it doesn't exist
  db.exec(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content_json TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);

  return db;
}
