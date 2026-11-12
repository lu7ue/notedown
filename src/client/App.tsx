import { useEffect, useState } from "react";

export function App() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/msg")
      .then((res) => res.json())
      .then((data) => setMsg(data.message));
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-actions">
          <button className="button primary">New note</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar" />
        <div className="empty">
          <p className="hint">Select a note, or create a new one.</p>
        </div>
      </main>
    </div>
  );
}
