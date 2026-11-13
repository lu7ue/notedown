/*
  Tests for toMarkdown (toMarkdown.ts).

  Each test builds a small document with the helpers below and checks the exact markdown.
  toMarkdown is a pure function, so no database, server or browser is needed.

  What is tested, and why:
  - Paragraphs: one blank line between them (a single newline would join them into one paragraph on GitHub), and empty paragraphs, also ones with only spaces, are skipped.
  - Headings: each level gets the right number of #, empty headings are skipped, and a line break inside a heading becomes a space, because a markdown heading must be on one line.
  - Formatting: each of the four marks, bold and italic together, inline code inside the other marks (markdown shows everything inside backticks as it is), spaces moved outside the marks ("** bold**" is not bold on GitHub), and no marks around text that is only spaces.
  - Line breaks: a backslash and a newline in README mode, a plain newline in Issues mode, and breaks at the start or end of a paragraph are left out.
  - Empty document: every shape an empty note can have gives an empty result.
*/

import { describe, expect, it } from "vitest";
import { toMarkdown } from "./toMarkdown";
import type { DocNode } from "./types";

function doc(...blocks: DocNode[]): DocNode {
  return { type: "doc", content: blocks };
}

function paragraph(...children: DocNode[]): DocNode {
  return { type: "paragraph", content: children };
}

function heading(level: number, ...children: DocNode[]): DocNode {
  return { type: "heading", attrs: { level }, content: children };
}

// text("hi", "bold", "italic") is the text "hi" in bold and italic
function text(value: string, ...markTypes: string[]): DocNode {
  if (markTypes.length === 0) {
    return { type: "text", text: value };
  }
  const marks: { type: string }[] = [];
  for (const markType of markTypes) {
    marks.push({ type: markType });
  }
  return { type: "text", text: value, marks };
}

function lineBreak(): DocNode {
  return { type: "hardBreak" };
}

describe("toMarkdown", () => {
  describe("paragraphs", () => {
    it("separates paragraphs with one blank line", () => {
      const input = doc(paragraph(text("First")), paragraph(text("Second")));

      expect(toMarkdown(input, "readme")).toBe("First\n\nSecond");
    });

    it("skips empty paragraphs and paragraphs with only spaces", () => {
      const input = doc(
        paragraph(text("First")),
        { type: "paragraph" },
        paragraph(text("   ")),
        paragraph(text("Second")),
      );

      expect(toMarkdown(input, "readme")).toBe("First\n\nSecond");
    });
  });

  describe("headings", () => {
    it("writes one # for each heading level", () => {
      const input = doc(
        heading(1, text("One")),
        heading(2, text("Two")),
        heading(3, text("Three")),
      );

      expect(toMarkdown(input, "readme")).toBe("# One\n\n## Two\n\n### Three");
    });

    it("skips empty headings", () => {
      const input = doc(heading(2), paragraph(text("Text")));

      expect(toMarkdown(input, "readme")).toBe("Text");
    });

    it("writes a line break inside a heading as a space", () => {
      const input = doc(heading(2, text("Part"), lineBreak(), text("two")));

      expect(toMarkdown(input, "readme")).toBe("## Part two");
    });
  });

  describe("formatting", () => {
    it("writes bold, italic, strikethrough and inline code", () => {
      const input = doc(
        paragraph(
          text("bold", "bold"),
          text(" "),
          text("italic", "italic"),
          text(" "),
          text("gone", "strike"),
          text(" "),
          text("code", "code"),
        ),
      );

      expect(toMarkdown(input, "readme")).toBe(
        "**bold** *italic* ~~gone~~ `code`",
      );
    });

    it("keeps bold and italic together", () => {
      const input = doc(paragraph(text("both", "bold", "italic")));

      expect(toMarkdown(input, "readme")).toBe("***both***");
    });

    it("puts inline code inside the other marks", () => {
      const input = doc(paragraph(text("x", "bold", "code")));

      expect(toMarkdown(input, "readme")).toBe("**`x`**");
    });

    it("moves spaces outside the marks", () => {
      const input = doc(
        paragraph(text("Say"), text(" hi ", "bold"), text("and")),
      );

      expect(toMarkdown(input, "readme")).toBe("Say **hi** and");
    });

    it("does not put marks around text that is only spaces", () => {
      const input = doc(paragraph(text("a"), text(" ", "bold"), text("b")));

      expect(toMarkdown(input, "readme")).toBe("a b");
    });
  });

  describe("line breaks", () => {
    it("writes a line break differently for README and Issues", () => {
      const input = doc(paragraph(text("one"), lineBreak(), text("two")));

      expect(toMarkdown(input, "readme")).toBe("one\\\ntwo");
      expect(toMarkdown(input, "issues")).toBe("one\ntwo");
    });

    it("leaves out line breaks at the start and end of a paragraph", () => {
      const input = doc(
        paragraph(lineBreak(), text("one"), lineBreak(), lineBreak()),
      );

      expect(toMarkdown(input, "readme")).toBe("one");
      expect(toMarkdown(input, "issues")).toBe("one");
    });
  });

  describe("empty document", () => {
    it("gives an empty result for every kind of empty note", () => {
      // without content, as the type allows
      expect(toMarkdown({ type: "doc" }, "readme")).toBe("");
      // a new note, as the server creates it
      expect(toMarkdown(doc(), "readme")).toBe("");
      // a note whose text was deleted: the editor always keeps one empty paragraph
      expect(toMarkdown(doc({ type: "paragraph" }), "readme")).toBe("");
    });
  });
});
