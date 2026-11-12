import express from "express";
import { mkdirSync } from "node:fs";
import { openDb } from "./db";
import type { Note, NoteSummary } from "../shared/types";

// create a "data" directory, no errors if it already exists (set recursive as true)
mkdirSync("data", { recursive: true });
// all notes are kept in this one file. it is created on the first start
const db = openDb("data/notedown.db");

const PORT = 3001;
const app = express();

// reads the request body as json and puts it into req.body
// set the limit to 5MB because a lone note can be bigger than the default 100KB
app.use(express.json({ limit: "5mb" }));

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

  const result = db
    .prepare(
      "insert into notes(title, content_json, created_at, updated_at) values (?,?,?,?)",
    )
    .run("Untitled", JSON.stringify(EMPTY_DOC), now, now);
  // read the new note back by its id
  const note = db
    .prepare("select id, title, created_at, updated_at from notes where id = ?")
    .get(result.lastInsertRowid) as NoteSummary;
  res.status(201).json(note);
});

// a row of the notes table
type NoteRow = NoteSummary & { content_json: string };

app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db
    .prepare(
      "select id, title, content_json, created_at, updated_at from notes where id = ?",
    )
    .get(id) as NoteRow | undefined;

  if (!row) {
    res.status(404).json({ error: "note not found" });
    return;
  }

  // copy every field of the row, but replace content_json (text) with the parsed object
  const note: Note = { ...row, content_json: JSON.parse(row.content_json) };
  res.json(note);
});

// change the title and/or the content of a note (only the fields in the request are changed)
// patch is used when only one part of a resource is changed, while put is used when the whole resource is replaced
app.patch("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body ?? {};

  // only cares about whether the note is there, so just select 1 (doesn't matter what is selected); 1 means yes, undefined means nothing found
  const exists = db.prepare("select 1 from notes where id = ?").get(id);
  if (!exists) {
    res.status(404).json({ error: "note not found" });
    return;
  }

  if ("content_json" in body && body.content_json?.type !== "doc") {
    res.status(400).json({ error: "content_json must be a document" });
    return;
  }

  const now = new Date().toISOString();

  if ("title" in body) {
    const title = (body.title ?? "").trim() || "Untitled";
    db.prepare("update notes set title = ?, updated_at = ? where id = ?").run(
      title,
      now,
      id,
    );
  }

  if ("content_json" in body) {
    db.prepare(
      "update notes set content_json = ?, updated_at = ? where id = ?",
    ).run(JSON.stringify(body.content_json), now, id);
  }

  const note = db
    .prepare("select id, title, created_at, updated_at from notes where id = ?")
    .get(id) as NoteSummary;

  res.json(note);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
