/*
  Tests for the notes API (the routes in app.ts).

  How it works: before each test, createApp gets a new empty database that only lives
  in memory (":memory:"). So the real notes in data/notedown.db are never touched, every
  test starts from an empty list, and the order of the tests does not matter.
  supertest sends requests to the app without listening on a port, so the tests can run
  while "npm run dev" is using port 3001.

  What is tested, and why:
  - The list is empty at the start: checks that each test really gets a fresh database.
  - A new note is called "Untitled" and appears in the list: the default title, the 201
    status, and that a created note can be found again.
  - Getting a note returns its content: saves a paragraph and reads it back unchanged,
    so the content survives being turned into text in the database and back.
  - An unknown id returns 404: the client relies on this to show "Note not found".
  - Renaming changes the title and updated_at: the sidebar is sorted by updated_at, so
    it must move forward. The test waits 5 ms first, because two changes in the same
    millisecond would have the same time and the test would fail for no real reason.
  - An empty title becomes "Untitled": sends only spaces, so trim() is checked too.
  - A title that is not text returns 400 with a clear message (Done when of task 13).
  - Content that is not a document returns 400, so a broken document is never saved.
  - A deleted note returns 404 afterwards: the delete really removed the row.
*/

import type { Express } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { NoteSummary } from "../shared/types";
import { createApp } from "./app";
import { openDb } from "./db";

let app: Express;

beforeEach(() => {
  app = createApp(openDb(":memory:"));
});

async function createNote(): Promise<NoteSummary> {
  const res = await request(app).post("/api/notes");
  return res.body;
}

describe("notes API", () => {
  it("returns an empty list at the start", async () => {
    const res = await request(app).get("/api/notes");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("creates a note called Untitled that appears in the list", async () => {
    const created = await request(app).post("/api/notes");

    expect(created.status).toBe(201);
    expect(created.body.title).toBe("Untitled");

    const list = await request(app).get("/api/notes");
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(created.body.id);
  });

  it("returns the content of a note", async () => {
    const note = await createNote();
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
      ],
    };
    await request(app)
      .patch(`/api/notes/${note.id}`)
      .send({ content_json: doc });

    const res = await request(app).get(`/api/notes/${note.id}`);

    expect(res.status).toBe(200);
    expect(res.body.content_json).toEqual(doc);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/notes/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Note not found" });
  });

  it("changes the title and updated_at when renaming", async () => {
    const note = await createNote();
    await new Promise((resolve) => setTimeout(resolve, 5));

    const res = await request(app)
      .patch(`/api/notes/${note.id}`)
      .send({ title: "Shopping" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Shopping");
    expect(res.body.updated_at > note.updated_at).toBe(true);
  });

  it("saves an empty title as Untitled", async () => {
    const note = await createNote();

    const res = await request(app)
      .patch(`/api/notes/${note.id}`)
      .send({ title: "   " });

    expect(res.body.title).toBe("Untitled");
  });

  it("returns 400 when the title is not text", async () => {
    const note = await createNote();

    const res = await request(app)
      .patch(`/api/notes/${note.id}`)
      .send({ title: 5 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Title must be text" });
  });

  it("returns 400 when the content is not a document", async () => {
    const note = await createNote();

    const res = await request(app)
      .patch(`/api/notes/${note.id}`)
      .send({ content_json: "hello" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Content must be a document" });
  });

  it("returns 404 for a note after it is deleted", async () => {
    const note = await createNote();

    const deleted = await request(app).delete(`/api/notes/${note.id}`);
    expect(deleted.status).toBe(204);

    const res = await request(app).get(`/api/notes/${note.id}`);
    expect(res.status).toBe(404);
  });
});
