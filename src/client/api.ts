import type { Note, NoteSummary } from "../shared/types";

// sends a request to the server and reads the response as json
// <T> means it can be any type, the function will also return a promise of that type
async function request<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // res.ok will be true if the status code is 200-299
  if (!res.ok)
    throw new Error(`${method} ${url} failed with status ${res.status}`);
  return res.json();
}

// api contains all the functions that can be called to interact with the server
export const api = {
  listNotes: () => request<NoteSummary[]>("GET", "/api/notes"),
  createNote: () => request<NoteSummary>("POST", "/api/notes"), // returns only one note so the type is not array
  getNote: (id: number) => request<Note>("GET", `/api/notes/${id}`),
  renameNote: (id: number, title: string) =>
    request<NoteSummary>("PATCH", `/api/notes/${id}`, { title }),
};
