// this file is used to define types that are shared between the server and client

// a note without the content, used for listing notes
export type NoteSummary = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

// a full note, including the content
export type Note = NoteSummary & {
  content_json: unknown;
};
