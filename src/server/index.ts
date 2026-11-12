import express from "express";
import { mkdirSync } from "node:fs";
import { openDb } from "./db";

// create a "data" directory, no errors if it already exists (set recursive as true)
mkdirSync("data", { recursive: true });
// all notes are kept in this one file. it is created on the first start
const db = openDb("data/notedown.db");

const PORT = 3001;
const app = express();

app.get("/api/msg", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
