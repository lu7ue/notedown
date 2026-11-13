import type { DocNode } from "./types";

// using an array instead of an object because the order matters
// inline code is always inside the others (markdown shows everything inside backticks as it is)
const MARKS = [
  { type: "code", marker: "`" },
  { type: "strike", marker: "~~" },
  { type: "italic", marker: "*" },
  { type: "bold", marker: "**" },
];

// turns the editor document into markdown text
export function toMarkdown(doc: DocNode): string {
  const blocks: string[] = [];
  const nodes = doc.content ?? [];

  // convert each block to markdown
  for (const node of nodes) {
    const block = blockToMarkdown(node);

    // skip empty blocks, so empty paragraphs do not add extra blank lines
    if (block.trim() !== "") {
      blocks.push(block);
    }
  }

  // markdown needs a blank line between blocks, otherwise two paragraphs become one
  return blocks.join("\n\n");
}

function blockToMarkdown(node: DocNode): string {
  if (node.type === "paragraph") {
    return inlineToMarkdown(node);
  }

  if (node.type === "heading") {
    const text = inlineToMarkdown(node);
    // an empty heading would be a lone "#", so leave it out like an empty paragraph
    if (text.trim() === "") {
      return "";
    }
    const level = Number(node.attrs?.level ?? 1);
    const hashes = "#".repeat(level); // level 2 gives "##"
    return hashes + " " + text;
  }

  return "";
}

// joins the text inside a paragraph or heading
function inlineToMarkdown(node: DocNode): string {
  let result = "";
  const children = node.content ?? [];

  for (const child of children) {
    if (child.type === "text") {
      result += textToMarkdown(child);
    } else if (child.type === "hardBreak") {
      result += "\n";
    }
  }

  return result;
}

// one piece of text, with the markdown for its marks around it
function textToMarkdown(node: DocNode): string {
  const text = node.text ?? "";
  const marks = node.marks ?? [];

  // text with no marks, or only spaces, is written as it is
  if (marks.length === 0 || text.trim() === "") {
    return text;
  }

  // split the text into: spaces before, the middle part, spaces after
  // "  hi " as shown below:
  // [0] [1] [2] [3] [4]
  //          h   i
  const middle = text.trim(); // "hi"
  const start = text.indexOf(middle); // [2]
  const spacesBefore = text.slice(0, start); // from [0] to [2] (not including [2])
  const spacesAfter = text.slice(start + middle.length); // [2] + length of "hi" (which is 2) = [4], so slice from [4] to the end
  let result = middle;

  for (const mark of MARKS) {
    let hasMark = false;
    for (const nodeMark of marks) {
      if (nodeMark.type === mark.type) {
        hasMark = true;
      }
    }
    if (hasMark) {
      result = mark.marker + result + mark.marker;
    }
  }

  return spacesBefore + result + spacesAfter;
}
