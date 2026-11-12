import type { NoteSummary } from "../shared/types";

// <T> means it can be any type, the function will also return a promise of that type
async function request<T>(method: string, url: string): Promise<T> {
  const res = await fetch(url, { method });
  // res.ok will be true if the status code is 200-299
  if (!res.ok)
    throw new Error(`${method} ${url} failed with status ${res.status}`);
  return res.json();
}

// api contains all the functions that can be called to interact with the server
export const api = {
  listNotes: () => request<NoteSummary[]>("GET", "/api/notes"),
};
