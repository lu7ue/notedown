import express from "express";
import { mkdirSync } from "node:fs";
import { openDb } from "./db";
import type { NoteSummary } from "../shared/types";

// create a "data" directory, no errors if it already exists (set recursive as true)
mkdirSync("data", { recursive: true });
// all notes are kept in this one file. it is created on the first start
const db = openDb("data/notedown.db");

const PORT = 3001;
const app = express();

// a new note starts with an empty editor document
const EMPTY_DOC = { type: "doc", content: [] };

// use all() to get all rows, get() to get one single row, and run() to execute a statement without returning any rows (used for insert/update)

app.get("/api/notes", (_req, res) => {
  const notes = db
    .prepare(
      "select id, title, created_at, updated_at from notes order by updated_at desc",
    )
    .all() as NoteSummary[];
  res.json(notes);
});

app.post("/api/notes", (_req, res) => {
  // get the current time and write it into the created_at and updated_at fields later for the new note
  const now = new Date().toISOString();
  // prepare the contents of the new note
  const result = db
    .prepare(
      "insert into notes(title, content_json, created_at, updated_at) values (?,?,?,?)",
    )
    .run("Untitled", JSON.stringify(EMPTY_DOC), now, now);
  // write the new note into db by getting the last inserted row id
  const note = db
    .prepare("select id, title, created_at, updated_at from notes where id = ?")
    .get(result.lastInsertRowid) as NoteSummary;
  res.status(201).json(note);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
