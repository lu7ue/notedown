import { EditorContent, useEditor, type JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Toolbar } from "./Toolbar";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    underline: false, // markdown has no underline
    link: false, // will do it later
  }),
];

export function Editor({ content }: { content: JSONContent }) {
  const editor = useEditor({
    extensions,
    content, // the given content was passed from the parent component
    shouldRerenderOnTransaction: true, // rerender the editor when cursor moves or the contents change
  });

  // if the editor is not ready yet, rturn null (nothing is rendered)
  if (!editor) return null;

  return (
    <>
      <Toolbar editor={editor} />
      <div className="document-scroll">
        <EditorContent editor={editor} className="document" />
      </div>
    </>
  );
}
