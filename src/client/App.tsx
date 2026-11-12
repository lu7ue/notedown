import { useEffect, useState } from "react";
import type { Note, NoteSummary } from "../shared/types";
import { api } from "./api";
import type { JSONContent } from "@tiptap/react";
import { Editor } from "./components/Editor";

export function App() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [titleDraft, setTitleDraft] = useState(""); // the content of input field for the title

  // reloads the notes list from the server; called when the page opens and after every change
  async function refresh() {
    setNotes(await api.listNotes());
  }

  // [] means this effect will only run once when the page opens
  useEffect(() => {
    refresh();
  }, []);

  async function newNote() {
    const note = await api.createNote();
    await refresh();
    // every time a new note is created, it will be selected automatically (highlighted in the list)
    setSelectedNoteId(note.id);
  }

  useEffect(() => {
    // clear the open note before getting the new one
    setOpenNote(null);

    if (selectedNoteId === null) return;

    // set a flag to indicate whether the request is outdated (e.g. when the user selects another note before this request finishes)
    let outdated = false;

    api.getNote(selectedNoteId).then((note) => {
      if (!outdated) setOpenNote(note);
    });
    // react runs this before the effect runs again (another note was selected), so the previous answer is ignored
    return () => {
      outdated = true;
    };
  }, [selectedNoteId]);

  useEffect(() => {
    // set the title draft to the open note's title, or an empty string if no note is open
    setTitleDraft(openNote?.title ?? "");
  }, [openNote]);

  async function saveTitle() {
    if (!openNote || titleDraft === openNote.title) return;
    const updated = await api.renameNote(openNote.id, titleDraft);
    // check if the open note is still the same one, update its title if so, otherwise do nothing
    setOpenNote((current) => {
      if (current !== null && current.id === updated.id) {
        return { ...current, title: updated.title };
      }
      return current;
    });
    await refresh();
  }

  return (
    <div className="app">
      {/* sidebar with notes list */}
      <aside className="sidebar">
        <div className="sidebar-actions">
          <button className="button primary" onClick={newNote}>
            New note
          </button>
        </div>

        <section className="sidebar-section tree">
          <h2>Notes</h2>
          {notes.map((note) => (
            <div
              key={note.id}
              className={
                "row" + (note.id === selectedNoteId ? " selected" : "")
              }
              style={{ paddingLeft: 8 }}
              onClick={() => setSelectedNoteId(note.id)}
            >
              <span className="row-label">{note.title}</span>
            </div>
          ))}
        </section>
      </aside>

      {/* editor area */}
      <main className="main">
        {/* display the title of the note in the top bar, or a hint if no note is selected */}
        {openNote ? (
          <>
            <header className="topbar">
              <input
                className="title-input"
                value={titleDraft}
                aria-label="Note title"
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </header>
            {/* show the editor with its sub-component(Toolbar) */}
            <Editor
              key={openNote.id}
              content={openNote.content_json as JSONContent}
            />
          </>
        ) : (
          <>
            <header className="topbar" />
            <div className="empty">
              <p className="hint">Select a note, or create a new one.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
