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
});
