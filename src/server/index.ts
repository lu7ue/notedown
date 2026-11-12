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

app.get("/api/notes", (_req, res) => {
  // use all() to get all rows, get() to get one single row, and run() to execute a statement without returning any rows (used for insert/update)
  const notes = db
    .prepare(
      "select id, title, created_at, updated_at from notes order by updated_at desc",
    )
    .all() as NoteSummary[];
  res.json(notes);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
