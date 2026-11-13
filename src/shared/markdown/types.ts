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

// example of a paragraph "Say hi and both", hi is bold, both is bold and italic
// {
//   "type": "paragraph",
//   "content": [
//     { "type": "text", "text": "Say " },
//     { "type": "text", "text": "hi", "marks": [{ "type": "bold" }] },
//     { "type": "text", "text": " and " },
//     { "type": "text", "text": "both", "marks": [{ "type": "bold" }, { "type": "italic" }] }
//   ]
// }

// one node of the editor document (the json from editor.getJSON())
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  text?: string;
  marks?: { type: string }[];
};

// where the markdown will be pasted: a .md file such as README, or an issue or comment on GitHub
export type Mode = "readme" | "issues";
