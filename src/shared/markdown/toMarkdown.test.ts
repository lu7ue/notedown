import { describe, expect, it } from "vitest";
import { toMarkdown } from "./toMarkdown";
import type { DocNode } from "./types";

describe("toMarkdown", () => {
  it("turns a heading and two paragraphs into markdown", () => {
    const doc: DocNode = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Plan" }],
        },
        { type: "paragraph", content: [{ type: "text", text: "First" }] },
        { type: "paragraph" },
        { type: "paragraph", content: [{ type: "text", text: "Second" }] },
      ],
    };

    expect(toMarkdown(doc)).toBe("## Plan\n\nFirst\n\nSecond");
  });
  it("writes bold, italic, strikethrough and inline code", () => {
    const doc: DocNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "text", text: " " },
            { type: "text", text: "italic", marks: [{ type: "italic" }] },
            { type: "text", text: " " },
            { type: "text", text: "gone", marks: [{ type: "strike" }] },
            { type: "text", text: " " },
            { type: "text", text: "code", marks: [{ type: "code" }] },
          ],
        },
      ],
    };

    expect(toMarkdown(doc)).toBe("**bold** *italic* ~~gone~~ `code`");
  });

  it("keeps two styles together and moves spaces outside the marks", () => {
    const doc: DocNode = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Say" },
            { type: "text", text: " hi ", marks: [{ type: "bold" }] },
            { type: "text", text: "and " },
            {
              type: "text",
              text: "both",
              marks: [{ type: "bold" }, { type: "italic" }],
            },
          ],
        },
      ],
    };

    expect(toMarkdown(doc)).toBe("Say **hi** and ***both***");
  });
});
