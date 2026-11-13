import { useEffect, useRef, useState } from "react";
import type { Note, NoteSummary } from "../shared/types";
import { api } from "./api";
import type { JSONContent } from "@tiptap/react";
import { Editor } from "./components/Editor";
import { useAutosave, type SaveStatus } from "./hooks/useAutosave";
import { Icon } from "./components/Icon";
import { ItemMenu } from "./components/ItemMenu";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { MessageDialog } from "./components/MessageDialog";
import { ExportMenu } from "./components/ExportMenu";
import { toMarkdown } from "../shared/markdown/toMarkdown";
import type { DocNode, Mode } from "../shared/markdown/types";

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Could not save",
};

const MODE_NAMES: Record<Mode, string> = {
  readme: "README",
  issues: "Issues",
};

export function App() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [titleDraft, setTitleDraft] = useState(""); // the content of input field for the title
  const autosave = useAutosave(openNote?.id ?? null, refresh);
  const [openMenu, setOpenMenu] = useState<{
    note: NoteSummary;
    top: number;
    left: number;
  } | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<NoteSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestDoc = useRef<JSONContent | null>(null);
  const [exportResult, setExportResult] = useState<{
    mode: Mode;
    copied: boolean;
  } | null>(null);

  function showError(err: unknown) {
    setErrorMessage(err instanceof Error ? err.message : String(err));
  }

  // reloads the notes list from the server; called when the page opens and after every change
  async function refresh() {
    try {
      setNotes(await api.listNotes());
    } catch (err) {
      showError(err);
    }
  }

  // [] means this effect will only run once when the page opens
  useEffect(() => {
    refresh();
  }, []);

  async function newNote() {
    try {
      const note = await api.createNote();
      await refresh();
      // every time a new note is created, it will be selected automatically (highlighted in the list)
      setSelectedNoteId(note.id);
    } catch (err) {
      showError(err);
    }
  }

  async function deleteNote(note: NoteSummary) {
    // close the menu in case it's open, and clear the state so the confirmation dialog disappears
    setNoteToDelete(null);

    // if the note is currently open, discard any unsaved changes and close it
    if (note.id === selectedNoteId) {
      autosave.discard();
      setSelectedNoteId(null);
    }

    try {
      await api.deleteNote(note.id);
    } catch (err) {
      showError(err);
    }

    await refresh();
  }

  async function exportMarkdown(mode: Mode) {
    if (latestDoc.current === null) return;

    // getJSON() gives every node a type, so the editor's document fits DocNode
    const markdown = toMarkdown(latestDoc.current as DocNode, mode);

    try {
      await navigator.clipboard.writeText(markdown);
      setExportResult({ mode, copied: true });
    } catch {
      setExportResult({ mode, copied: false });
    }
  }

  useEffect(() => {
    // clear the open note before getting the new one
    setOpenNote(null);

    if (selectedNoteId === null) return;

    // set a flag to indicate whether the request is outdated (e.g. when the user selects another note before this request finishes)
    let outdated = false;

    api
      .getNote(selectedNoteId)
      .then((note) => {
        if (!outdated) setOpenNote(note);
      })
      .catch((err) => {
        if (!outdated) showError(err);
      });
    // react runs this before the effect runs again (another note was selected), so the previous answer is ignored
    return () => {
      outdated = true;
    };
  }, [selectedNoteId]);

  useEffect(() => {
    setTitleDraft(openNote?.title ?? "");
    latestDoc.current =
      (openNote?.content_json as JSONContent | undefined) ?? null;
  }, [openNote]);

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
                "row" +
                (note.id === selectedNoteId ? " selected" : "") +
                (openMenu?.note.id === note.id ? " menu-open" : "")
              }
              style={{ paddingLeft: 8 }}
              onClick={() => setSelectedNoteId(note.id)}
            >
              <span className="row-label">{note.title}</span>
              <button
                className="more-button"
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  setOpenMenu({ note, top: rect.bottom + 4, left: rect.left });
                }}
              >
                <Icon name="dots" />
              </button>
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
                onChange={(e) => {
                  setTitleDraft(e.target.value);
                  autosave.queue({ title: e.target.value });
                }}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                onBlur={() => {
                  if (titleDraft.trim() === "") setTitleDraft("Untitled");
                  autosave.flush();
                }}
              />
              <div className="topbar-right">
                <span className="save-status">
                  {autosave.status === "saved" && <Icon name="check" />}
                  {STATUS_TEXT[autosave.status]}
                </span>
                <ExportMenu onExport={exportMarkdown} />
              </div>
            </header>
            {/* show the editor with its sub-component(Toolbar) */}
            <Editor
              key={openNote.id}
              content={openNote.content_json as JSONContent}
              onChange={(doc) => {
                latestDoc.current = doc;
                autosave.queue({ content_json: doc });
              }}
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

      {/* open menu for the currently selected note */}
      {openMenu && (
        <ItemMenu
          top={openMenu.top}
          left={openMenu.left}
          onClose={() => setOpenMenu(null)}
          onDelete={() => {
            setNoteToDelete(openMenu.note);
            setOpenMenu(null);
          }}
        />
      )}

      {/* the confirmation dialog for deleting a note */}
      {noteToDelete && (
        <ConfirmDialog
          title="Delete note?"
          message={`"${noteToDelete.title}" will be deleted.`}
          confirmLabel="Delete"
          onConfirm={() => deleteNote(noteToDelete)}
          onCancel={() => setNoteToDelete(null)}
        />
      )}

      {/* show an error message dialog if catch an error when calling the server */}
      {errorMessage && (
        <MessageDialog
          title="Something went wrong"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* show a dialog to indicate whether the export was successful or not */}
      {exportResult && (
        <MessageDialog
          title={exportResult.copied ? "Copied" : "Could not copy"}
          message={
            exportResult.copied
              ? `The ${MODE_NAMES[exportResult.mode]} markdown is on your clipboard.`
              : "The browser did not allow access to the clipboard."
          }
          onClose={() => setExportResult(null)}
        />
      )}
    </div>
  );
}
