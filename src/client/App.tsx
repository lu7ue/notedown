import { useEffect, useState } from "react";
import type { NoteSummary } from "../shared/types";
import { api } from "./api";

export function App() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

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
    // reload the list so the new note shows up
    await refresh();
    // every time a new note is created, it will be selected automatically (highlighted in the list)
    setSelectedNoteId(note.id);
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
            >
              <span className="row-label">{note.title}</span>
            </div>
          ))}
        </section>
      </aside>

      {/* editor area */}
      <main className="main">
        <header className="topbar" />
        <div className="empty">
          <p className="hint">Select a note, or create a new one.</p>
        </div>
      </main>
    </div>
  );
}
