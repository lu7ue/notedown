// example of a json got from TipTap editor.getJSON()
// {
//   "type": "doc",
//   "content": [
//     { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Plan" }] },
//     { "type": "paragraph", "content": [{ "type": "text", "text": "First" }] },
//     { "type": "paragraph" },
//     { "type": "paragraph", "content": [{ "type": "text", "text": "Second" }] }
//   ]
// }

// one node of the editor document (the json from editor.getJSON())
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
};
