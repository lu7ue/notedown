import type { Note, NoteSummary } from "../shared/types";
import type { JSONContent } from "@tiptap/react";

// the server dooesn't rely on TipTap, so it doesn't know about JSONContent(in server side, content_json is unknown type)
export type NoteChanges = {
  title?: string;
  content_json?: JSONContent;
};

// sends a request to the server and reads the response as json
// <T> means it can be any type, the function will also return a promise of that type
async function request<T>(
  method: string,
  url: string,
  body?: unknown,
  keepalive = false, // if true, the request will be sent even if the page is being closed
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    keepalive,
  });
  // res.ok will be true if the status code is 200-299
  if (!res.ok)
    throw new Error(`${method} ${url} failed with status ${res.status}`);

  // 204 means success with no body, so there is no json to read
  if (res.status === 204) return undefined as T;

  return res.json();
}

// api contains all the functions that can be called to interact with the server
export const api = {
  listNotes: () => request<NoteSummary[]>("GET", "/api/notes"),
  createNote: () => request<NoteSummary>("POST", "/api/notes"), // returns only one note so the type is not array
  getNote: (id: number) => request<Note>("GET", `/api/notes/${id}`),
  updateNote: (id: number, changes: NoteChanges, keepalive = false) =>
    request<NoteSummary>("PATCH", `/api/notes/${id}`, changes, keepalive),
  deleteNote: (id: number) => request<void>("DELETE", `/api/notes/${id}`),
};
