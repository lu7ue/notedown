import { mkdirSync } from "node:fs";
import { createApp } from "./app";
import { openDb } from "./db";

const PORT = 3001;

// create a "data" directory, no errors if it already exists (set recursive as true)
mkdirSync("data", { recursive: true });
// all notes are kept in this one file. it is created on the first start
const db = openDb("data/notedown.db");

const app = createApp(db);

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
