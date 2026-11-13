import type { DocNode, Mode } from "./types";

// using an array instead of an object because the order matters
// inline code is always inside the others (markdown shows everything inside backticks as it is)
const MARKS = [
  { type: "code", marker: "`" },
  { type: "strike", marker: "~~" },
  { type: "italic", marker: "*" },
  { type: "bold", marker: "**" },
];

// turns the editor document into markdown text
export function toMarkdown(doc: DocNode, mode: Mode): string {
  const blocks: string[] = [];
  const nodes = doc.content ?? [];

  // convert each block to markdown
  for (const node of nodes) {
    const block = blockToMarkdown(node, mode);

    // skip empty blocks, so empty paragraphs do not add extra blank lines
    if (block.trim() !== "") {
      blocks.push(block);
    }
  }

  // markdown needs a blank line between blocks, otherwise two paragraphs become one
  return blocks.join("\n\n");
}

function blockToMarkdown(node: DocNode, mode: Mode): string {
  if (node.type === "paragraph") {
    return inlineToMarkdown(node, mode);
  }

  if (node.type === "heading") {
    const text = inlineToMarkdown(node, mode);
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

// function inlineToMarkdown is for joining the text inside a paragraph or heading

// a children node looks like this:
// [0] line break
// [1] **Hoi**
// [2] line break
// [3] Hoi
// [4] line break

// first, find the text from top to bottom -> [0] is line break, keep going, [1] is not line break, stop, first is [1]
// then, find the text from bottom to top -> [4] is line break, keep going, [3] is not line break, stop, last is [3]

// handle the text from the first to the last -> [1] + [2] + [3]
// if "readme mode" -> add "\\\n" for line breaks, so the result is "**Hoi**\\\nHoi"
// if "issues mode" -> add "\n" for line breaks, so the result is "**Hoi**\nHoi"

// ps. one "\" won't work because it will be interpreted as an escape character, so add one more "\" to make it "\"

function inlineToMarkdown(node: DocNode, mode: Mode): string {
  const children = node.content ?? [];

  // leave out line breaks at the very start and end, they would only add empty lines
  let first = 0;
  while (first < children.length && children[first].type === "hardBreak") {
    first++;
  }
  let last = children.length - 1;
  while (last >= first && children[last].type === "hardBreak") {
    last--;
  }

  let result = "";
  for (let i = first; i <= last; i++) {
    const child = children[i];

    if (child.type === "text") {
      result += textToMarkdown(child);
    } else if (child.type === "hardBreak") {
      if (node.type === "heading") {
        result += " ";
      } else if (mode === "readme") {
        // a single newline is ignored in .md files, a backslash at the end of the line makes it a break
        result += "\\\n";
      } else {
        // issues and comments on GitHub show a single newline as a break
        result += "\n";
      }
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
