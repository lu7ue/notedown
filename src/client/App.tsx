import { useEffect, useState } from "react";
import type { NoteSummary } from "../shared/types";
import { api } from "./api";

export function App() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);

  // [] means this effect will only run once when the page opens
  useEffect(() => {
    api.listNotes().then(setNotes);
  }, []);

  return (
    <div className="app">
      {/* sidebar with notes list */}
      <aside className="sidebar">
        <div className="sidebar-actions">
          <button className="button primary">New note</button>
        </div>

        <section className="sidebar-section tree">
          <h2>Notes</h2>
          {notes.map((note) => (
            <div key={note.id} className="row" style={{ paddingLeft: 8 }}>
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
