import type { DocNode } from "./types";

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
      result += child.text ?? "";
    } else if (child.type === "hardBreak") {
      result += "\n";
    }
  }

  return result;
}
